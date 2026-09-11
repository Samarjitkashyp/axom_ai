'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Loader2,
  Download,
  Video,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Trash2,
  RefreshCw,
  Crown,
  Smartphone,
  Film,
  Tv,
  Mail,
  ShieldCheck,
  Zap,
  Lock,
  Sliders,
  Monitor,
} from 'lucide-react';
import { getCsrfToken } from './utils/security';

const PRESETS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    resolution: '720p',
    desc: 'Small size, fast sharing on WhatsApp & chat apps',
    icon: Smartphone,
    color: '#25D366',
    ratio: '~15%',
    pro: false,
  },
  {
    id: 'instagram',
    label: 'Instagram / Reels',
    resolution: '1080p',
    desc: 'Vibrant colors & sharp 1080p for Reels, TikTok & Stories',
    icon: Film,
    color: '#E1306C',
    ratio: '~35%',
    pro: false,
  },
  {
    id: 'youtube',
    label: 'YouTube HD',
    resolution: '1080p HQ',
    desc: 'High-fidelity 1080p landscape encoding with crisp audio',
    icon: Tv,
    color: '#FF0000',
    ratio: '~55%',
    pro: true,
  },
  {
    id: 'email',
    label: 'Email / Ultra Small',
    resolution: '480p',
    desc: 'Maximum compression to fit within email attachment limits',
    icon: Mail,
    color: '#3B82F6',
    ratio: '~8%',
    pro: false,
  },
];

const ASPECT_RATIO_OPTIONS = [
  { id: 'original', label: 'Original', sub: 'Match input video', desc: 'No padding or change' },
  { id: '9:16', label: '9:16 Vertical', sub: 'Reels / Shorts', desc: '1080 × 1920 canvas' },
  { id: '16:9', label: '16:9 Horizontal', sub: 'YouTube / PC', desc: '1920 × 1080 canvas' },
  { id: '1:1', label: '1:1 Square', sub: 'Instagram Feed', desc: '1080 × 1080 canvas' },
  { id: '4:5', label: '4:5 Portrait', sub: 'Instagram Post', desc: '1080 × 1350 canvas' },
];

const RESOLUTION_OPTIONS = [
  { id: 'original', label: 'Auto (Preset Default)' },
  { id: '1080p', label: '1080p Full HD' },
  { id: '720p', label: '720p HD' },
  { id: '480p', label: '480p SD' },
  { id: '360p', label: '360p Compact' },
];

const FORMAT_OPTIONS = [
  { id: 'mp4', label: 'MP4', sub: 'H.264 Universal' },
  { id: 'webm', label: 'WebM', sub: 'VP9 Web' },
  { id: 'mov', label: 'MOV', sub: 'QuickTime' },
];

const fmtSize = (b) => {
  if (!b || b === 0) return '0 B';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

const fmtDuration = (sec) => {
  if (!sec || isNaN(sec)) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function VideoCompressor({ onClose, isPro = false }) {
  const [file, setFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null); // { width, height, duration, orientationName, ratioStr, isVertical }

  // Settings
  const [selectedPreset, setSelectedPreset] = useState('whatsapp');
  const [targetAspectRatio, setTargetAspectRatio] = useState('original');
  const [targetResolution, setTargetResolution] = useState('original');
  const [targetFormat, setTargetFormat] = useState('mp4');

  // Job & UI state
  const [taskState, setTaskState] = useState(null); // 'uploading' | 'processing' | 'completed' | 'error'
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [deletedFromServer, setDeletedFromServer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preparing compression...');
  const [showProCallout, setShowProCallout] = useState(false);

  const inputRef = useRef(null);
  const pollTimerRef = useRef(null);

  const maxUploadBytes = isPro ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
  const maxUploadMb = isPro ? 100 : 50;

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handlePickFile = (f) => {
    if (!f) return;
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.3gp'];
    if (!allowed.includes(ext)) {
      setErrorMsg(`Unsupported format (${ext}). Supported formats: MP4, MOV, MKV, AVI, WebM.`);
      return;
    }

    if (f.size > maxUploadBytes) {
      if (!isPro && f.size <= 100 * 1024 * 1024) {
        setErrorMsg(`Video is ${fmtSize(f.size)}. Free tier limit is 50 MB. Upgrade to Pro to compress up to 100 MB files!`);
      } else {
        setErrorMsg(`Video exceeds the maximum ${maxUploadMb} MB limit.`);
      }
      return;
    }

    setErrorMsg(null);
    setResult(null);
    setFile(f);
    setDeletedFromServer(false);
    setProgress(0);
    setTaskState(null);
    setVideoMeta(null);
    setTargetAspectRatio('original');
    setTargetResolution('original');
    setTargetFormat('mp4');

    // Create a local blob URL for video preview and instant metadata extraction
    try {
      const url = URL.createObjectURL(f);
      setVideoPreview(url);

      const v = document.createElement('video');
      v.preload = 'metadata';
      v.src = url;
      v.onloadedmetadata = () => {
        const w = v.videoWidth || 0;
        const h = v.videoHeight || 0;
        const dur = v.duration || 0;

        let orientationName = '16:9 Landscape (Horizontal)';
        let ratioStr = '16:9';
        let isVertical = false;

        if (w > 0 && h > 0) {
          const r = w / h;
          if (Math.abs(r - 16 / 9) < 0.12) {
            orientationName = '16:9 Horizontal / Landscape (YouTube)';
            ratioStr = '16:9';
            isVertical = false;
          } else if (Math.abs(r - 9 / 16) < 0.12) {
            orientationName = '9:16 Vertical (Reels / Shorts / TikTok)';
            ratioStr = '9:16';
            isVertical = true;
          } else if (Math.abs(r - 1) < 0.08) {
            orientationName = '1:1 Square (Instagram Feed)';
            ratioStr = '1:1';
            isVertical = false;
          } else if (Math.abs(r - 0.8) < 0.08) {
            orientationName = '4:5 Portrait (Instagram Post)';
            ratioStr = '4:5';
            isVertical = true;
          } else if (w > h) {
            orientationName = `${w}×${h} Horizontal / Landscape`;
            ratioStr = `${w}:${h}`;
            isVertical = false;
          } else {
            orientationName = `${w}×${h} Vertical / Portrait`;
            ratioStr = `${w}:${h}`;
            isVertical = true;
          }
        }

        setVideoMeta({
          width: w,
          height: h,
          duration: dur,
          orientationName,
          ratioStr,
          isVertical,
        });

        // Smart preset recommendation based on input
        if (isVertical) {
          setSelectedPreset('instagram');
        } else if (f.size > 30 * 1024 * 1024) {
          setSelectedPreset('whatsapp');
        } else {
          setSelectedPreset('instagram');
        }
      };
    } catch (e) {
      setVideoPreview(null);
    }
  };

  const handleSelectAspectRatio = (arId) => {
    if (arId !== 'original' && !isPro) {
      setShowProCallout(true);
      setErrorMsg('Custom aspect ratio conversion (9:16 Reels / 16:9 Landscape / 1:1) is exclusive to Pro VIP members.');
      return;
    }
    setTargetAspectRatio(arId);
    setShowProCallout(false);
  };

  const handleSelectResolution = (resId) => {
    if (resId !== 'original' && !isPro) {
      setShowProCallout(true);
      setErrorMsg('Custom resolution selection (1080p, 720p, 480p) is exclusive to Pro VIP members.');
      return;
    }
    setTargetResolution(resId);
    setShowProCallout(false);
  };

  const handleSelectFormat = (fmtId) => {
    if (fmtId !== 'mp4' && !isPro) {
      setShowProCallout(true);
      setErrorMsg('WebM and MOV container export is exclusive to Pro VIP members.');
      return;
    }
    setTargetFormat(fmtId);
    setShowProCallout(false);
  };

  const handleStartCompress = async () => {
    if (!file) return;

    const presetObj = PRESETS.find((p) => p.id === selectedPreset);
    if (presetObj?.pro && !isPro) {
      setErrorMsg('YouTube HD (1080p) preset is exclusive to Pro members. Please choose WhatsApp, Instagram, or Email, or Upgrade to Pro.');
      return;
    }

    const isCustom = targetAspectRatio !== 'original' || targetResolution !== 'original' || targetFormat !== 'mp4';
    if (isCustom && !isPro) {
      setErrorMsg('Orientation, Resolution, and Format customization are exclusive to Pro VIP members. Upgrade to unlock!');
      setShowProCallout(true);
      return;
    }

    setErrorMsg(null);
    setTaskState('uploading');
    setProgress(5);
    setStatusMessage('Uploading video to processing queue...');

    const fd = new FormData();
    fd.append('video', file);
    fd.append('preset', selectedPreset);
    fd.append('aspect_ratio', targetAspectRatio);
    fd.append('resolution', targetResolution);
    fd.append('format', targetFormat);

    try {
      const res = await fetch('/api/video-compress/upload/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start video compression.');
      }

      setTaskId(data.task_id);
      setTaskState('processing');
      setStatusMessage('Queued in background. Starting FFmpeg encoding...');
      startPolling(data.task_id);
    } catch (err) {
      setTaskState('error');
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  const startPolling = (tid) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-compress/status/${tid}/`);
        if (!res.ok) return;
        const d = await res.json();

        if (d.status === 'running') {
          const p = Math.max(10, d.progress || 10);
          setProgress(p);
          setStatusMessage(`Encoding video with FFmpeg... ${p}%`);
        } else if (d.status === 'completed') {
          clearInterval(pollTimerRef.current);
          setProgress(100);
          setTaskState('completed');
          setResult(d);
          setStatusMessage('Compression complete!');
        } else if (d.status === 'error') {
          clearInterval(pollTimerRef.current);
          setTaskState('error');
          setErrorMsg(d.error || 'Compression failed during encoding.');
        }
      } catch (err) {
        // Continue polling
      }
    }, 1800);
  };

  const handleDownload = () => {
    if (!result?.download_url) return;
    const a = document.createElement('a');
    a.href = result.download_url;
    a.download = result.output_filename || 'axom_compressed.mp4';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeleteNow = async () => {
    if (!taskId) return;
    try {
      await fetch(`/api/video-compress/delete/${taskId}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() || '' },
      });
      setDeletedFromServer(true);
    } catch (e) {
      setDeletedFromServer(true);
    }
  };

  const handleReset = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setFile(null);
    setVideoPreview(null);
    setVideoMeta(null);
    setTargetAspectRatio('original');
    setTargetResolution('original');
    setTargetFormat('mp4');
    setTaskId(null);
    setTaskState(null);
    setResult(null);
    setErrorMsg(null);
    setProgress(0);
    setDeletedFromServer(false);
    setShowProCallout(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const originalBytes = file?.size || result?.input_size || 0;
  const compressedBytes = result?.output_size || 0;
  const savedPercent =
    originalBytes > 0 && compressedBytes > 0
      ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
      : 0;

  // Compute live output target summary
  const targetArLabel = ASPECT_RATIO_OPTIONS.find((a) => a.id === targetAspectRatio)?.label || 'Original';
  const targetResLabel = targetResolution === 'original' ? 'Preset Default' : targetResolution;
  const targetFmtLabel = targetFormat.toUpperCase();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9, 10, 17, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '94vh',
          background: 'var(--bg-secondary, #13141f)',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-primary, #f1f5f9)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Video size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700 }}>
                  Axom Video Compressor & Studio
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: isPro
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: isPro ? '#000' : 'var(--text-secondary, #94a3b8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isPro ? <><Crown size={12} /> PRO VIP</> : 'Free Tier'}
                </span>
              </div>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                Zero API cost • Server-safe encoding • 9:16 / 16:9 Aspect ratio conversion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              color: 'var(--text-secondary, #94a3b8)',
              borderRadius: '10px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#f87171',
                fontSize: '0.86rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMsg}</div>
              {errorMsg.includes('Pro') && (
                <a
                  href="/upgrade"
                  style={{
                    padding: '4px 10px',
                    background: '#f59e0b',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Upgrade to Pro
                </a>
              )}
            </div>
          )}

          {/* STATE 1: UPLOAD BOX */}
          {!file && (
            <div style={{ textAlign: 'center' }}>
              <label
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.[0]) handlePickFile(e.dataTransfer.files[0]);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: `2px dashed ${
                    dragActive ? '#10b981' : 'var(--border-color, rgba(255, 255, 255, 0.14))'
                  }`,
                  borderRadius: '16px',
                  padding: '44px 24px',
                  background: dragActive
                    ? 'rgba(16, 185, 129, 0.06)'
                    : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-matroska,video/x-msvideo,video/webm"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePickFile(e.target.files?.[0])}
                />
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                    color: '#10b981',
                  }}
                >
                  <UploadCloud size={32} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 600 }}>
                  Choose a video or drag & drop here
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  MP4, MOV, MKV, WebM, AVI • Max {maxUploadMb} MB {isPro ? '(VIP)' : '(Free Limit)'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '18px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  {['Orientation Detection', '9:16 Vertical / Reels', '16:9 Landscape', 'Zero API Spikes'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        color: 'var(--text-secondary, #94a3b8)',
                      }}
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </label>

              {!isPro && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                  }}
                >
                  <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Crown size={14} /> Need 100 MB uploads & Custom 9:16 / 16:9 Orientation?
                  </span>
                  <a
                    href="/upgrade"
                    style={{
                      color: '#fbbf24',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    View Pro VIP →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: CONFIGURE SETTINGS & PREVIEW */}
          {file && !taskState && (
            <div>
              {/* Selected File & Detected Orientation Card */}
              <div
                style={{
                  padding: '16px 18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  borderRadius: '14px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.14)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      flexShrink: 0,
                    }}
                  >
                    <Video size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.94rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary, #94a3b8)',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>Original Size: <strong>{fmtSize(file.size)}</strong></span>
                      {videoMeta?.duration > 0 && (
                        <span>Duration: <strong>{fmtDuration(videoMeta.duration)}</strong></span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary, #94a3b8)',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                    }}
                  >
                    <RefreshCw size={14} /> Change
                  </button>
                </div>

                {/* Detected Video Orientation Banner */}
                {videoMeta ? (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>Detected Input:</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: videoMeta.isVertical ? 'rgba(225, 48, 108, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: videoMeta.isVertical ? '#f472b6' : '#60a5fa',
                          fontWeight: 600,
                          fontSize: '0.76rem',
                          border: `1px solid ${videoMeta.isVertical ? 'rgba(225, 48, 108, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                        }}
                      >
                        {videoMeta.orientationName}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #94a3b8)' }}>
                      Native Resolution: <strong style={{ color: '#fff' }}>{videoMeta.width} × {videoMeta.height} px</strong>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary, #94a3b8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Loader2 size={12} className="spin-icon" /> Reading video canvas dimensions & orientation...
                  </div>
                )}
              </div>

              {/* Pro Upgrade Callout if clicked without Pro */}
              {showProCallout && !isPro && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                      <strong>Pro Exclusive: </strong> Convert 16:9 ➔ 9:16 Vertical for Reels/Shorts, custom resolution & WebM/MOV export!
                    </span>
                  </div>
                  <a
                    href="/upgrade"
                    style={{
                      padding: '5px 12px',
                      background: '#f59e0b',
                      color: '#000',
                      fontWeight: 700,
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Unlock Pro
                  </a>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────── */}
              {/* ⭐ PRO STUDIO CONTROLS: ORIENTATION, RESOLUTION & FORMAT      */}
              {/* Placed right above Compression Presets as requested by user   */}
              {/* ───────────────────────────────────────────────────────────── */}
              <div
                style={{
                  marginBottom: '20px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: isPro
                    ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isPro
                    ? '1.5px solid rgba(245, 158, 11, 0.35)'
                    : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color={isPro ? '#f59e0b' : '#94a3b8'} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: isPro ? '#fbbf24' : 'var(--text-primary, #f1f5f9)' }}>
                      Pro Custom Controls: Orientation, Resolution & Format
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: isPro ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                      color: isPro ? '#000' : 'var(--text-secondary, #94a3b8)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isPro ? <><Crown size={10} /> VIP UNLOCKED</> : <><Lock size={10} /> PRO ONLY</>}
                  </span>
                </div>

                {/* 1. Target Orientation / Aspect Ratio Selection */}
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--text-secondary, #94a3b8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Target Orientation / Canvas Aspect Ratio
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {ASPECT_RATIO_OPTIONS.map((opt) => {
                      const isSelected = targetAspectRatio === opt.id;
                      const isLocked = opt.id !== 'original' && !isPro;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectAspectRatio(opt.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: isSelected
                              ? 'rgba(245, 158, 11, 0.16)'
                              : 'rgba(255, 255, 255, 0.03)',
                            border: `1.5px solid ${
                              isSelected
                                ? '#f59e0b'
                                : 'var(--border-color, rgba(255, 255, 255, 0.08))'
                            }`,
                            color: isSelected ? '#fbbf24' : 'var(--text-primary, #f1f5f9)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                            opacity: isLocked ? 0.75 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{opt.label}</span>
                            {isLocked && <Lock size={11} color="#94a3b8" />}
                          </div>
                          <div
                            style={{
                              fontSize: '0.68rem',
                              color: 'var(--text-secondary, #94a3b8)',
                              marginTop: '2px',
                            }}
                          >
                            {opt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Target Resolution & Container Format Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {/* Resolution Selector */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                        color: 'var(--text-secondary, #94a3b8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Target Resolution {!isPro && '🔒'}
                    </label>
                    <select
                      value={targetResolution}
                      onChange={(e) => handleSelectResolution(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                        color: 'var(--text-primary, #f1f5f9)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {RESOLUTION_OPTIONS.map((r) => (
                        <option key={r.id} value={r.id} style={{ background: '#181926', color: '#fff' }}>
                          {r.label} {r.id !== 'original' && !isPro ? '(Pro Only)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Output Format Selector */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        marginBottom: '6px',
                        color: 'var(--text-secondary, #94a3b8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Output Container Format {!isPro && '🔒'}
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {FORMAT_OPTIONS.map((fmt) => {
                        const isSelected = targetFormat === fmt.id;
                        const isLocked = fmt.id !== 'mp4' && !isPro;

                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleSelectFormat(fmt.id)}
                            style={{
                              flex: 1,
                              padding: '8px 6px',
                              borderRadius: '8px',
                              background: isSelected
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 255, 255, 0.04)',
                              border: `1.5px solid ${
                                isSelected
                                  ? '#10b981'
                                  : 'var(--border-color, rgba(255, 255, 255, 0.08))'
                              }`,
                              color: isSelected ? '#10b981' : 'var(--text-primary, #f1f5f9)',
                              fontWeight: 600,
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{fmt.label}</span>
                            {isLocked && <Lock size={10} color="#94a3b8" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Output Expectation Pill */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary, #94a3b8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <div>
                    <span>🎯 Expected Output: </span>
                    <strong style={{ color: '#10b981' }}>{targetArLabel}</strong> •{' '}
                    <strong style={{ color: '#fff' }}>{targetResLabel}</strong> •{' '}
                    <strong style={{ color: '#60a5fa' }}>{targetFmtLabel}</strong>
                  </div>
                  {targetAspectRatio !== 'original' && (
                    <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
                      ✓ Smart letterbox padding enabled (no distortion)
                    </span>
                  )}
                </div>
              </div>

              {/* Preset Cards Selection */}
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '10px',
                  color: 'var(--text-secondary, #94a3b8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Select Compression Preset
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px',
                  marginBottom: '22px',
                }}
              >
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPreset === p.id;
                  const isLocked = p.pro && !isPro;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (isLocked) {
                          setErrorMsg('YouTube HD preset is exclusive to Pro members. Upgrade to unlock full 1080p HQ encoding.');
                          return;
                        }
                        setSelectedPreset(p.id);
                      }}
                      style={{
                        position: 'relative',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        background: isSelected
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: `1.5px solid ${
                          isSelected
                            ? '#10b981'
                            : 'var(--border-color, rgba(255, 255, 255, 0.08))'
                        }`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: isLocked ? 0.75 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={18} color={p.color} />
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                            {p.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            {p.resolution}
                          </span>
                          {p.pro && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 5px',
                                borderRadius: '4px',
                                background: '#f59e0b',
                                color: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Crown size={10} /> PRO
                            </span>
                          )}
                        </div>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary, #94a3b8)',
                          lineHeight: '1.3',
                        }}
                      >
                        {p.desc}
                      </p>

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '0.72rem',
                          color: '#10b981',
                          fontWeight: 500,
                        }}
                      >
                        Est. output size: {p.ratio} of original
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Start Compression Button */}
              <button
                onClick={handleStartCompress}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s',
                }}
              >
                <Zap size={18} /> Start Video Encoding ({targetArLabel} • {targetFmtLabel})
              </button>
            </div>
          )}

          {/* STATE 3: PROCESSING & PROGRESS */}
          {(taskState === 'uploading' || taskState === 'processing') && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#10b981',
                }}
              >
                <Loader2 size={36} className="spin-icon" />
              </div>

              <h3 style={{ margin: '0 0 8px', fontSize: '1.18rem', fontWeight: 700 }}>
                {statusMessage}
              </h3>
              <p
                style={{
                  margin: '0 0 20px',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                {file?.name} • Encoding to {targetArLabel} ({targetFmtLabel})
              </p>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  height: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  margin: '0 auto 12px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    borderRadius: '10px',
                    background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#10b981',
                  marginBottom: '20px',
                }}
              >
                {progress}% Completed
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                <ShieldCheck size={14} color="#10b981" />
                Server-protected single thread • Original deleted instantly after processing
              </div>
            </div>
          )}

          {/* STATE 4: RESULT / DOWNLOAD */}
          {taskState === 'completed' && result && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.16)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <CheckCircle size={36} />
              </div>

              <h3 style={{ margin: '0 0 4px', fontSize: '1.24rem', fontWeight: 700 }}>
                Video Encoded & Compressed Successfully!
              </h3>
              <p
                style={{
                  margin: '0 0 20px',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                Saved <strong style={{ color: '#10b981' }}>{savedPercent}%</strong> space • Output: {result.aspect_ratio || targetArLabel} ({result.format || targetFmtLabel})
              </p>

              {/* Before vs After comparison */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    padding: '14px 24px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                    minWidth: '130px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary, #94a3b8)',
                      marginBottom: '4px',
                    }}
                  >
                    Original
                  </div>
                  <div style={{ fontSize: '1.14rem', fontWeight: 700 }}>
                    {fmtSize(originalBytes)}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.2rem',
                    color: 'var(--text-secondary, #94a3b8)',
                    fontWeight: 300,
                  }}
                >
                  ➔
                </div>

                <div
                  style={{
                    padding: '14px 24px',
                    borderRadius: '14px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    minWidth: '130px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      color: '#10b981',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    Compressed
                  </div>
                  <div style={{ fontSize: '1.14rem', fontWeight: 700, color: '#10b981' }}>
                    {fmtSize(compressedBytes)}
                  </div>
                </div>
              </div>

              {/* Download & Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '16px',
                }}
              >
                <button
                  onClick={handleDownload}
                  disabled={deletedFromServer}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    background: deletedFromServer
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: deletedFromServer ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: deletedFromServer ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <Download size={18} /> Download {targetFmtLabel} Video
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-primary, #f1f5f9)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={16} /> Encode Another
                </button>
              </div>

              {/* Delete Now Privacy Action */}
              <div style={{ marginTop: '14px' }}>
                {deletedFromServer ? (
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    ✓ Video permanently deleted from server memory.
                  </span>
                ) : (
                  <button
                    onClick={handleDeleteNow}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary, #94a3b8)',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'underline',
                    }}
                  >
                    <Trash2 size={13} /> Delete from server now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
