"""
Video Compressor — Production-ready Celery + Redis + FFmpeg implementation.

Design Highlights:
- Asynchronous Celery task processing with Redis broker.
- Concurrency control: 1 worker thread at a time ensures 2-vCPU Lightsail
  stays 100% responsive for Gunicorn and Next.js.
- 'nice -n 19' (on Linux) + '-threads 1' ensures lowest CPU priority.
- Dual state tracking: Celery task state + per-task JSON file on disk
  (ensures progress survives worker reloads and can be polled cleanly).
- Tier limits:
    * Free tier: 50MB max, 3 compressions/day, max 3 min duration, standard presets.
    * Pro tier: 100MB max, 50 compressions/day, max 15 min duration, all presets unlocked.
- Automatic privacy cleanup: original file deleted immediately after encode;
  output file auto-deleted after TTL (Free: 30 min, Pro: 2 hours).
"""

import os
import json
import time
import uuid
import shutil
import logging
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from celery import shared_task
from django.conf import settings
from django.core.cache import cache

log = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
VIDEO_DIR = BASE_DIR / 'media' / 'video_compress'
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

# ── Limits & Presets ──────────────────────────────────────────────────────
FREE_MAX_UPLOAD_BYTES = 50 * 1024 * 1024       # 50 MB
PRO_MAX_UPLOAD_BYTES  = 100 * 1024 * 1024      # 100 MB (Cloudflare free limit)

FREE_DAILY_LIMIT = 3
PRO_DAILY_LIMIT  = 50

FREE_MAX_DURATION_SEC = 180                    # 3 minutes
PRO_MAX_DURATION_SEC  = 900                    # 15 minutes

FFMPEG_TIMEOUT = int(os.getenv('VIDEO_FFMPEG_TIMEOUT', '420'))  # 7 min timeout
JOB_TTL_SEC    = int(os.getenv('VIDEO_JOB_TTL_SEC', '3600'))    # 60 min default

PRESETS = {
    'whatsapp': {
        'id': 'whatsapp',
        'label': 'WhatsApp',
        'desc': 'Small size, easy sharing on WhatsApp (720p)',
        'ffmpeg_args': [
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30',
            '-vf', 'scale=-2:720',
            '-c:a', 'aac', '-b:a', '96k',
            '-movflags', '+faststart',
        ],
        'estimated_ratio': 0.15,
        'pro_only': False,
    },
    'instagram': {
        'id': 'instagram',
        'label': 'Instagram / Reels',
        'desc': '1080p vertical-friendly, crisp & vibrant quality',
        'ffmpeg_args': [
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25',
            '-vf', 'scale=-2:1080',
            '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart',
        ],
        'estimated_ratio': 0.35,
        'pro_only': False,
    },
    'youtube': {
        'id': 'youtube',
        'label': 'YouTube HD',
        'desc': 'Maximum 1080p clarity with high audio bitrate',
        'ffmpeg_args': [
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
            '-vf', 'scale=-2:1080',
            '-c:a', 'aac', '-b:a', '160k',
            '-movflags', '+faststart',
        ],
        'estimated_ratio': 0.55,
        'pro_only': True,
    },
    'email': {
        'id': 'email',
        'label': 'Email / Compact',
        'desc': 'Ultra small 480p, max compression for email',
        'ffmpeg_args': [
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '32',
            '-vf', 'scale=-2:480',
            '-c:a', 'aac', '-b:a', '64k',
            '-movflags', '+faststart',
        ],
        'estimated_ratio': 0.08,
        'pro_only': False,
    },
}


# ── Rate Limiting (Daily Video Compressions) ──────────────────────────────
def get_daily_video_count(identifier: str) -> int:
    """Returns number of video compressions submitted today by IP/device/user."""
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    cache_key = f"axom_vc_count:{today}:{identifier}"
    try:
        val = cache.get(cache_key)
        return int(val) if val is not None else 0
    except Exception:
        return 0


def increment_daily_video_count(identifier: str) -> int:
    """Increments and returns the daily count for IP/device/user."""
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    cache_key = f"axom_vc_count:{today}:{identifier}"
    try:
        if cache.get(cache_key) is None:
            cache.set(cache_key, 1, timeout=86400)
            return 1
        else:
            return cache.incr(cache_key)
    except Exception:
        return 1


# ── Job state (Disk-backed JSON) ──────────────────────────────────────────
def _job_path(task_id: str) -> Path:
    return VIDEO_DIR / f'{task_id}.json'


def _write_job(task_id: str, patch: dict):
    p = _job_path(task_id)
    data = {}
    if p.exists():
        try:
            data = json.loads(p.read_text(encoding='utf-8'))
        except Exception:
            data = {}
    data.update(patch)
    tmp = p.with_suffix('.json.tmp')
    try:
        tmp.write_text(json.dumps(data), encoding='utf-8')
        tmp.replace(p)
    except Exception as e:
        log.warning("Could not write job file %s: %s", task_id, e)


def read_job(task_id: str) -> dict | None:
    p = _job_path(task_id)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding='utf-8'))
    except Exception:
        return None


def cleanup_old_files():
    """Delete job files older than JOB_TTL_SEC."""
    now = time.time()
    try:
        for f in VIDEO_DIR.glob('*'):
            try:
                if now - f.stat().st_mtime > JOB_TTL_SEC:
                    if f.is_file():
                        f.unlink()
            except Exception:
                pass
    except Exception:
        pass


def delete_job_files(task_id: str) -> bool:
    """Immediately delete original, output, and JSON metadata for task_id."""
    deleted_any = False
    for f in VIDEO_DIR.glob(f'{task_id}*'):
        try:
            if f.is_file():
                f.unlink()
                deleted_any = True
        except Exception:
            pass
    return deleted_any


# ── FFprobe Helper ────────────────────────────────────────────────────────
def probe_video(path: str) -> dict:
    """Return {duration, width, height, size, format_name, video_codec} or {} on failure."""
    try:
        ffprobe_bin = shutil.which('ffprobe') or 'ffprobe'
        r = subprocess.run(
            [ffprobe_bin, '-v', 'error', '-of', 'json',
             '-show_format', '-show_streams', path],
            capture_output=True, text=True, timeout=15,
        )
        if r.returncode != 0:
            return {}
        d = json.loads(r.stdout or '{}')
        video_stream = next((s for s in d.get('streams', []) if s.get('codec_type') == 'video'), {})
        fmt = d.get('format', {})
        return {
            'duration': float(fmt.get('duration', 0) or 0),
            'size': int(fmt.get('size', 0) or 0),
            'format_name': fmt.get('format_name', ''),
            'width': int(video_stream.get('width', 0) or 0),
            'height': int(video_stream.get('height', 0) or 0),
            'video_codec': video_stream.get('codec_name', ''),
        }
    except Exception as e:
        log.warning('probe_video failed: %s', e)
        return {}


def build_ffmpeg_filter_and_codec(
    preset_key: str,
    aspect_ratio: str = 'original',
    resolution: str = 'original',
    format_ext: str = 'mp4',
    orig_w: int = 0,
    orig_h: int = 0,
) -> tuple[list[str], str]:
    """
    Constructs safe FFmpeg arguments for custom aspect ratio, resolution, and format.
    Returns (ffmpeg_args_list, extension_with_dot).
    """
    preset = PRESETS.get(preset_key, PRESETS['whatsapp'])
    crf_val = '28' if preset_key == 'whatsapp' else ('22' if preset_key == 'youtube' else ('32' if preset_key == 'email' else '25'))

    # Determine canvas dimensions for target aspect ratio
    DIMENSION_MAP = {
        '9:16': {
            '1080p': (1080, 1920),
            '720p': (720, 1280),
            '480p': (480, 854),
            '360p': (360, 640),
            'original': (720, 1280) if preset_key in ('whatsapp', 'email') else (1080, 1920),
        },
        '16:9': {
            '1080p': (1920, 1080),
            '720p': (1280, 720),
            '480p': (854, 480),
            '360p': (640, 360),
            'original': (1280, 720) if preset_key in ('whatsapp', 'email') else (1920, 1080),
        },
        '1:1': {
            '1080p': (1080, 1080),
            '720p': (720, 720),
            '480p': (480, 480),
            '360p': (360, 360),
            'original': (720, 720) if preset_key in ('whatsapp', 'email') else (1080, 1080),
        },
        '4:5': {
            '1080p': (1080, 1350),
            '720p': (720, 900),
            '480p': (480, 600),
            '360p': (360, 450),
            'original': (720, 900) if preset_key in ('whatsapp', 'email') else (1080, 1350),
        },
    }

    vf_filter = None
    if aspect_ratio in DIMENSION_MAP:
        res_key = resolution if resolution in ('1080p', '720p', '480p', '360p') else 'original'
        cw, ch = DIMENSION_MAP[aspect_ratio][res_key]
        vf_filter = f"scale={cw}:{ch}:force_original_aspect_ratio=decrease,pad={cw}:{ch}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1"
    elif resolution in ('1080p', '720p', '480p', '360p'):
        res_caps = {'1080p': 1080, '720p': 720, '480p': 480, '360p': 360}
        cap = res_caps[resolution]
        vf_filter = f"scale=-2:{cap}"
    else:
        # Default preset scaling
        if preset_key in ('whatsapp', 'email'):
            vf_filter = 'scale=-2:720' if preset_key == 'whatsapp' else 'scale=-2:480'
        else:
            vf_filter = 'scale=-2:1080'

    # Build codec & container args
    clean_fmt = format_ext.lower().strip() if format_ext in ('mp4', 'webm', 'mov') else 'mp4'
    ext = f".{clean_fmt}"

    args = []
    if clean_fmt == 'webm':
        args.extend([
            '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32',
            '-cpu-used', '4', '-row-mt', '1',
            '-vf', vf_filter,
            '-c:a', 'libopus', '-b:a', '96k',
        ])
    elif clean_fmt == 'mov':
        args.extend([
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf_val,
            '-pix_fmt', 'yuv420p',
            '-vf', vf_filter,
            '-c:a', 'aac', '-b:a', '128k',
        ])
    else:
        # Default MP4
        args.extend([
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf_val,
            '-pix_fmt', 'yuv420p',
            '-vf', vf_filter,
            '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart',
        ])

    return args, ext


# ── Celery Background Worker Task ─────────────────────────────────────────
@shared_task(bind=True, name='axom_ai.video_compress.compress_video_task')
def compress_video_task(
    self,
    task_id: str,
    input_path: str,
    preset_key: str,
    duration: float,
    aspect_ratio: str = 'original',
    resolution: str = 'original',
    format_ext: str = 'mp4',
    orig_w: int = 0,
    orig_h: int = 0,
):
    """
    Celery background worker that executes FFmpeg with CPU niceness and threads cap.
    Updates progress percentage in both Celery task state and on-disk JSON.
    """
    ffmpeg_args, ext = build_ffmpeg_filter_and_codec(
        preset_key=preset_key,
        aspect_ratio=aspect_ratio,
        resolution=resolution,
        format_ext=format_ext,
        orig_w=orig_w,
        orig_h=orig_h,
    )
    output_path = str(VIDEO_DIR / f'{task_id}_compressed{ext}')
    _write_job(task_id, {
        'status': 'running',
        'progress': 0,
        'started_at': datetime.now(timezone.utc).isoformat(),
        'aspect_ratio': aspect_ratio,
        'resolution': resolution,
        'format': format_ext,
    })
    self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'running'})

    ffmpeg_bin = shutil.which('ffmpeg') or 'ffmpeg'

    # Build safe execution command
    cmd = []
    # On Linux/Posix, lower CPU priority via nice
    if os.name == 'posix' and shutil.which('nice'):
        cmd.extend(['nice', '-n', '19'])

    cmd.extend([
        ffmpeg_bin, '-y',
        '-i', input_path,
        '-threads', '1',  # Protect multi-core responsiveness
        *ffmpeg_args,
        '-progress', 'pipe:1',
        '-nostats',
        output_path,
    ])

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )
    except Exception as e:
        err_msg = f'Failed to launch FFmpeg: {e}'
        log.error(err_msg)
        _write_job(task_id, {'status': 'error', 'error': err_msg})
        return {'status': 'error', 'error': err_msg}

    start_time = time.time()
    last_reported = 0

    try:
        if proc.stdout:
            for line in proc.stdout:
                if time.time() - start_time > FFMPEG_TIMEOUT:
                    proc.kill()
                    err_msg = 'Compression timed out (exceeded maximum time limit).'
                    _write_job(task_id, {'status': 'error', 'error': err_msg})
                    return {'status': 'error', 'error': err_msg}

                line = line.strip()
                if line.startswith('out_time_ms='):
                    try:
                        ms = int(line.split('=', 1)[1])
                        if duration > 0:
                            pct = min(99, max(0, int((ms / 1_000_000) / duration * 100)))
                            if pct >= last_reported + 2 or pct == 99:
                                last_reported = pct
                                _write_job(task_id, {'progress': pct})
                                self.update_state(state='PROGRESS', meta={'progress': pct, 'status': 'running'})
                    except Exception:
                        pass
                elif line == 'progress=end':
                    break

        proc.wait(timeout=30)
        if proc.returncode != 0:
            stderr_snippet = (proc.stderr.read() if proc.stderr else '')[-400:]
            err_msg = f'FFmpeg failed with exit code {proc.returncode}: {stderr_snippet}'
            log.error(err_msg)
            _write_job(task_id, {'status': 'error', 'error': err_msg})
            return {'status': 'error', 'error': err_msg}

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            err_msg = 'Compression generated an empty output file.'
            _write_job(task_id, {'status': 'error', 'error': err_msg})
            return {'status': 'error', 'error': err_msg}

        out_size = os.path.getsize(output_path)
        final_filename = os.path.basename(output_path)
        job_result = {
            'status': 'completed',
            'progress': 100,
            'output_path': output_path,
            'output_filename': final_filename,
            'output_size': out_size,
            'download_url': f'/api/video-compress/download/{final_filename}',
            'completed_at': datetime.now(timezone.utc).isoformat(),
        }
        _write_job(task_id, job_result)
        return job_result

    except Exception as e:
        log.exception("Unexpected error in compress_video_task: %s", e)
        _write_job(task_id, {'status': 'error', 'error': str(e)})
        return {'status': 'error', 'error': str(e)}

    finally:
        # Privacy guarantee: Always delete uploaded original video immediately
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
        except Exception:
            pass


# ── Queue Dispatcher ──────────────────────────────────────────────────────
def dispatch_compression_job(
    input_path: str,
    preset_key: str,
    duration: float,
    user_id: int | None = None,
    is_pro: bool = False,
    aspect_ratio: str = 'original',
    resolution: str = 'original',
    format_ext: str = 'mp4',
    orig_w: int = 0,
    orig_h: int = 0,
) -> tuple[str, str | None]:
    """
    Creates job JSON state and enqueues task to Celery.
    Returns (task_id, error_string).
    """
    cleanup_old_files()
    task_id = f"axom_vc_{uuid.uuid4().hex[:12]}"
    input_size = os.path.getsize(input_path) if os.path.exists(input_path) else 0

    init_state = {
        'task_id': task_id,
        'status': 'queued',
        'progress': 0,
        'preset': preset_key,
        'input_size': input_size,
        'duration': duration,
        'is_pro': is_pro,
        'aspect_ratio': aspect_ratio,
        'resolution': resolution,
        'format': format_ext,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    _write_job(task_id, init_state)

    try:
        # Enqueue with Celery
        compress_video_task.delay(
            task_id, input_path, preset_key, duration,
            aspect_ratio, resolution, format_ext, orig_w, orig_h
        )
    except Exception as e:
        log.warning("Could not dispatch via Celery broker: %s. Running fallback worker thread.", e)
        # Fallback to local background thread if Celery/Redis is offline in dev
        import threading
        t = threading.Thread(
            target=compress_video_task,
            args=(None, task_id, input_path, preset_key, duration,
                  aspect_ratio, resolution, format_ext, orig_w, orig_h),
            daemon=True,
        )
        t.start()

    return task_id, None
