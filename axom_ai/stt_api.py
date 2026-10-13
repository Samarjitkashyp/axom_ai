"""Speech to text for the chat: POST /api/stt/  (multipart: audio = the recording, language = assamese | english | hinglish)  ->  {"success": true, "text": "..."}

The browser records the microphone with its own noise suppression, echo cancellation and gain control switched on. Here the recording is
cleaned once more (rumble and hiss out, silence at both ends cut, even loudness), a recording with no speech in it is stopped before it costs
anything, and Gemini writes down what was said. People over the daily limit, or a switched-off service, get a plain status and the chat falls
back to the browser's own speech recognition.
"""
import array
import base64
import math
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, time as dtime

import requests
from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from axom_ai.security import get_client_ip
from axom_ai.views import _chat_cors_view
from payments.utils import has_active_plan
from superadmin.models import SystemSetting
from userpanel.models import UsageRecord

MAX_BYTES = 3 * 1024 * 1024
MAX_SECONDS = 45
MIN_SECONDS = 0.35
SILENCE_DBFS = -50.0            # a recording quieter than this (after cleaning) holds no speech
DEFAULT_FREE = 40
DEFAULT_PRO = 400
FFMPEG = shutil.which('ffmpeg') or '/usr/bin/ffmpeg'
MODELS = [m for m in os.getenv('STT_GEMINI_MODELS', 'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-flash-latest').split(',') if m]

# rumble out, speech band only, even loudness, silence at both ends cut. No heavy noise reduction here: tried on noisy recordings it made the
# result slightly worse (Gemini copes with noise better than a spectral filter does); the browser's own noise suppression runs before this.
CHAIN = ('highpass=f=80,lowpass=f=7500,dynaudnorm=f=150:g=7,'
         'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse,'
         'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.2,areverse')

LANGUAGES = {
    'assamese': 'Assamese (অসমীয়া), written in Assamese script (use ৰ and ৱ, not Bengali র). English words the speaker says are written in English letters',
    'english': 'English (Indian accent)',
    'hinglish': 'Hindi, written in Devanagari script. English words the speaker says are written in English letters',
}

PROMPT = (
    'Transcribe the speech in this audio exactly as spoken. The language is {language}. '
    'Write only the words that were said: no translation, no summary, no comments, no timestamps, no quotation marks. '
    'Ignore background noise, music and other people far away from the microphone. '
    'If there is no clear human speech (only silence, noise or music) answer with exactly NO_SPEECH.'
)


class AudioError(Exception):
    """The recording cannot be used; the message is shown to the person."""


# ---------------------------------------------------------------- the recording
def clean_audio(raw):
    """(wav bytes 16 kHz mono, seconds, loudness in dBFS) of a recording, cleaned. Raises AudioError for a recording that cannot be read."""
    with tempfile.TemporaryDirectory() as d:
        src, out = os.path.join(d, 'in.bin'), os.path.join(d, 'out.wav')
        with open(src, 'wb') as f:
            f.write(raw)
        try:
            r = subprocess.run([FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-t', str(MAX_SECONDS + 5), '-i', src, '-af', CHAIN,
                                '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', out], capture_output=True, timeout=40)
        except (OSError, subprocess.TimeoutExpired):
            raise AudioError('The recording could not be processed.')
        if r.returncode or not os.path.exists(out):
            raise AudioError('This recording could not be read.')
        with open(out, 'rb') as f:
            wav = f.read()
    pcm = wav[44:]
    samples = array.array('h')
    samples.frombytes(pcm[:len(pcm) - len(pcm) % 2])
    seconds = len(samples) / 16000.0
    if not samples:
        return wav, 0.0, -120.0
    rms = math.sqrt(sum(s * s for s in samples) / len(samples))
    return wav, seconds, (20 * math.log10(rms / 32768.0) if rms > 0 else -120.0)


def has_speech(seconds, dbfs):
    return seconds >= MIN_SECONDS and dbfs > SILENCE_DBFS


# ---------------------------------------------------------------- Gemini
def _gemini_key():
    return os.getenv('GEMINI_API_KEY', '')


def transcribe(wav, language):
    """The words that were said ('' when there was no speech), or None when Gemini could not be used."""
    key = _gemini_key()
    if not key:
        return None
    body = {'contents': [{'parts': [{'text': PROMPT.format(language=LANGUAGES.get(language, LANGUAGES['assamese']))},
                                    {'inline_data': {'mime_type': 'audio/wav', 'data': base64.b64encode(wav).decode()}}]}],
            'generationConfig': {'temperature': 0}}
    for model in MODELS:
        try:
            r = requests.post('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent' % model, json=body,
                              headers={'x-goog-api-key': key}, timeout=40)
        except requests.RequestException:
            continue
        if r.status_code != 200:
            continue
        try:
            text = ''.join(p.get('text', '') for p in r.json()['candidates'][0]['content']['parts']).strip()
        except (KeyError, IndexError, ValueError, TypeError):
            continue
        return '' if 'NO_SPEECH' in text.upper() else re.sub(r'\s+', ' ', text.strip(' "\'`'))
    return None


# ---------------------------------------------------------------- limits (the same way as the voice)
def _int_setting(key, default):
    try:
        return max(0, int(SystemSetting.get_setting(key, str(default))))
    except (TypeError, ValueError):
        return default


def _today_start():
    return timezone.make_aware(datetime.combine(timezone.localdate(), dtime.min))


def _guest_key(request):
    return 'stt:guest:%s:%s' % (get_client_ip(request) or 'unknown', timezone.localdate().isoformat())


def used_today(request):
    if request.user.is_authenticated:
        return UsageRecord.objects.filter(user=request.user, action_type='stt', created_at__gte=_today_start()).count()
    return cache.get(_guest_key(request), 0)


def count_one(request):
    if request.user.is_authenticated:
        UsageRecord.objects.create(user=request.user, action_type='stt', details='recording')
    else:
        key = _guest_key(request)
        try:
            cache.incr(key)
        except ValueError:
            cache.set(key, 1, 90000)


def daily_limit(request):
    if request.user.is_authenticated and has_active_plan(request.user):
        return _int_setting('stt_daily_pro', DEFAULT_PRO)
    return _int_setting('stt_daily_free', DEFAULT_FREE)


def _error(message, status, **extra):
    return JsonResponse(dict({'success': False, 'error': message}, **extra), status=status)


@csrf_exempt
@_chat_cors_view
def stt_api(request):
    if request.method != 'POST':
        return _error('Only POST is allowed.', 405)
    if not SystemSetting.is_enabled('stt_enabled', True):
        return _error('Voice typing on the server is switched off right now.', 503, disabled=True)
    f = request.FILES.get('audio')
    if not f:
        return _error('There is no recording.', 400)
    if f.size > MAX_BYTES:
        return _error('This recording is too long.', 413)
    language = request.POST.get('language', 'assamese')
    if language not in LANGUAGES:
        language = 'assamese'

    used, limit = used_today(request), daily_limit(request)
    if used >= limit:
        pro = request.user.is_authenticated and has_active_plan(request.user)
        return _error("You have used today's voice-typing limit (%d recordings)." % limit, 429, limit=limit, used=used, upgrade_required=not pro)

    try:
        wav, seconds, dbfs = clean_audio(f.read())
    except AudioError as e:
        return _error(str(e), 400)
    if seconds > MAX_SECONDS:
        return _error('This recording is too long (%d seconds at most).' % MAX_SECONDS, 413)
    if not has_speech(seconds, dbfs):
        return JsonResponse({'success': True, 'text': '', 'seconds': round(seconds, 1)})     # nothing to write down: nothing is asked or counted
    text = transcribe(wav, language)
    if text is None:
        return _error('Voice typing is not available right now.', 503)
    count_one(request)
    return JsonResponse({'success': True, 'text': text, 'seconds': round(seconds, 1)})
