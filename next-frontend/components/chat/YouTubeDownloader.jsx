'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Loader2,
  Link2,
  AlertTriangle,
  Shield,
  Video,
  Clock,
  User,
  Zap,
  CheckCircle2,
  Sparkles,
  Youtube,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'https://aiaxom.co.in';

function formatDuration(s) {
  if (!s) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FREE_DAILY_LIMIT = 20;
const USAGE_KEY_PREFIX = 'axom_ytdl_usage_';

function getTodayKey() {
  const d = new Date();
  return `${USAGE_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyUsage() {
  try { return parseInt(localStorage.getItem(getTodayKey()) || '0', 10); } catch { return 0; }
}

function incrementDailyUsage() {
  try { const c = getDailyUsage() + 1; localStorage.setItem(getTodayKey(), String(c)); return c; } catch { return 0; }
}

export default function YouTubeDownloader({ onClose }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingFormatId, setDownloadingFormatId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(0);
  const inputRef = useRef(null);
  const xhrRef = useRef(null);
  const progressIntervalRef = useRef(null);

  React.useEffect(() => { setDailyUsed(getDailyUsage()); }, []);

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      clearProgressInterval();
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    };
  }, []);

  const isValidYouTubeUrl = (u) => {
    return /(?:youtube\.com|youtu\.be)/i.test(u);
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    if (!agreedDisclaimer) {
      setError('Please agree to the fair use notice before fetching.');
      return;
    }
    if (!isValidYouTubeUrl(url.trim())) {
      setError('Please enter a valid YouTube URL (youtube.com or youtu.be).');
      return;
    }
    setLoading(true);
    setError('');
    setVideoInfo(null);
    setDownloadProgress(null);
    try {
      const res = await fetch(`${API}/api/video-download/info/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch video info');
      setVideoInfo(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fmt) => {
    if (!videoInfo) return;
    if (getDailyUsage() >= FREE_DAILY_LIMIT) {
      setError(`Daily free limit reached (${FREE_DAILY_LIMIT}/day). Upgrade to Pro for unlimited downloads.`);
      return;
    }
    clearProgressInterval();
    setDownloadingFormatId(fmt.format_id);
    setError('');

    let currentPercent = 1;
    let loadedBytes = 0;
    const totalBytes = fmt.filesize || 0;

    setDownloadProgress({
      percent: 1,
      loaded: 0,
      total: totalBytes,
      status: 'downloading',
      label: fmt.label,
    });

    progressIntervalRef.current = setInterval(() => {
      if (currentPercent < 88) {
        if (currentPercent < 30) {
          currentPercent += Math.floor(Math.random() * 4) + 2;
        } else if (currentPercent < 60) {
          currentPercent += Math.floor(Math.random() * 3) + 1;
        } else if (currentPercent < 85) {
          currentPercent += 1;
        }
        currentPercent = Math.min(88, currentPercent);

        if (totalBytes > 0) {
          loadedBytes = Math.round((currentPercent / 100) * totalBytes);
        }

        setDownloadProgress((prev) => ({
          ...prev,
          percent: currentPercent,
          loaded: loadedBytes,
          status: 'downloading',
        }));
      }
    }, 250);

    const downloadUrl = `${API}/api/video-download/stream/?url=${encodeURIComponent(videoInfo.webpage_url)}&format_id=${encodeURIComponent(fmt.format_id)}`;

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('GET', downloadUrl, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      const loaded = event.loaded || 0;
      let total = event.total || fmt.filesize || 0;
      let realPercent = 0;

      if (total > 0) {
        realPercent = Math.min(99, Math.round((loaded / total) * 100));
      } else {
        realPercent = Math.min(95, Math.round(loaded / (500 * 1024)));
      }

      if (realPercent > currentPercent) {
        currentPercent = realPercent;
      }

      setDownloadProgress({
        percent: currentPercent,
        loaded: Math.max(loaded, loadedBytes),
        total,
        status: 'downloading',
        label: fmt.label,
      });
    };

    xhr.onload = () => {
      clearProgressInterval();
      if (xhr.status === 200) {
        const blob = xhr.response;
        let filename = `${(videoInfo.title || 'video').slice(0, 80)}.${fmt.ext || 'mp4'}`;

        try {
          const disposition = xhr.getResponseHeader('Content-Disposition');
          if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
              filename = match[1];
            }
          }
        } catch (e) {}

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

        const used = incrementDailyUsage();
        setDailyUsed(used);

        setDownloadProgress({
          percent: 100,
          loaded: blob.size,
          total: blob.size,
          status: 'completed',
          label: fmt.label,
        });

        setTimeout(() => {
          setDownloadingFormatId(null);
          setDownloadProgress(null);
        }, 4000);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errObj = JSON.parse(reader.result);
            setError(errObj.error || 'Download failed. Server returned an error.');
          } catch (e) {
            setError('Download failed. Server returned an error.');
          }
          setDownloadingFormatId(null);
          setDownloadProgress(null);
        };
        reader.onerror = () => {
          setError('Download failed.');
          setDownloadingFormatId(null);
          setDownloadProgress(null);
        };
        if (xhr.response instanceof Blob) {
          reader.readAsText(xhr.response);
        } else {
          setError('Download failed.');
          setDownloadingFormatId(null);
          setDownloadProgress(null);
        }
      }
    };

    xhr.onerror = () => {
      clearProgressInterval();
      setError('Network connection error during video download.');
      setDownloadingFormatId(null);
      setDownloadProgress(null);
    };

    xhr.send();
  };

  const handleCancelDownload = () => {
    clearProgressInterval();
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setDownloadingFormatId(null);
    setDownloadProgress(null);
  };

  return (
    <div className="ytd-modal-overlay">
      <div className="ytd-modal-card">
        <div className="ytd-glow-bar" />

        <div className="ytd-header">
          <div className="ytd-header-left">
            <div className="ytd-icon-badge">
              <Youtube size={24} color="#fff" />
            </div>
            <div>
              <div className="ytd-title">YouTube Video Downloader</div>
              <div className="ytd-subtitle">Download YouTube videos in multiple qualities</div>
            </div>
          </div>
          <button onClick={onClose} className="ytd-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {dailyUsed > 0 && (
          <div className="ytd-usage-bar">
            <span>Daily free downloads: {dailyUsed}/{FREE_DAILY_LIMIT}</span>
            {dailyUsed >= FREE_DAILY_LIMIT && <span style={{ color: '#ef4444', fontWeight: 600 }}>Limit reached</span>}
          </div>
        )}

        <div className="ytd-body">
          {/* Disclaimer */}
          <div className="ytd-disclaimer-box">
            <div className="ytd-disclaimer-content">
              <AlertTriangle size={18} color="#eab308" className="ytd-disclaimer-icon" />
              <div>
                <div className="ytd-disclaimer-heading">Legal Disclaimer & Fair Use Notice</div>
                <div className="ytd-disclaimer-text">
                  This tool is provided <strong>strictly for personal, non-commercial, fair use purposes only</strong>.
                  Downloading copyrighted content without authorization may violate laws.
                </div>
                <ul className="ytd-disclaimer-list">
                  <li>Only download content you own or have permission to access</li>
                  <li>No videos are stored on our servers — files stream directly to you</li>
                </ul>
              </div>
            </div>
            <label className="ytd-checkbox-label">
              <input
                type="checkbox"
                checked={agreedDisclaimer}
                onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                className="ytd-checkbox"
              />
              <span className="ytd-checkbox-text">I agree to use this tool for fair use only</span>
            </label>
          </div>

          {/* URL Input */}
          <div className="ytd-input-container">
            <div className="ytd-input-wrapper">
              <Link2 size={18} className="ytd-link-icon" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
                placeholder="Paste YouTube video URL here..."
                className="ytd-input"
              />
            </div>
            <button
              onClick={handleFetchInfo}
              disabled={loading || !url.trim() || !agreedDisclaimer}
              className="ytd-fetch-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="ytd-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Fetch Video</span>
                </>
              )}
            </button>
          </div>

          <div className="ytd-security-badge">
            <Shield size={13} />
            <span>Secure — Direct stream, no extra tabs or windows opened</span>
          </div>

          {error && (
            <div className="ytd-error-banner">
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Download Progress */}
          {downloadProgress && (
            <div className={`ytd-progress-card ${downloadProgress.status}`}>
              <div className="ytd-progress-header">
                <div className="ytd-progress-title-area">
                  {downloadProgress.status === 'completed' ? (
                    <CheckCircle2 size={18} className="ytd-icon-success" />
                  ) : (
                    <Zap size={18} className="ytd-icon-zap" />
                  )}
                  <div>
                    <div className="ytd-progress-main-title">
                      {downloadProgress.status === 'completed'
                        ? 'Download Complete! File Saved.'
                        : `Downloading Video (${downloadProgress.label})...`}
                    </div>
                    <div className="ytd-progress-sub-text">
                      {downloadProgress.status === 'connecting' && 'Connecting to streaming server...'}
                      {downloadProgress.status === 'downloading' &&
                        `${formatSize(downloadProgress.loaded)} of ${formatSize(downloadProgress.total) || 'unknown size'}`}
                      {downloadProgress.status === 'completed' && 'File saved directly to your device storage!'}
                    </div>
                  </div>
                </div>
                <div className="ytd-progress-right">
                  <span className="ytd-percent-badge">{downloadProgress.percent}%</span>
                  {downloadProgress.status !== 'completed' && (
                    <button onClick={handleCancelDownload} className="ytd-cancel-btn" title="Cancel Download">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="ytd-progress-bar-container">
                <div className="ytd-progress-bar-fill" style={{ width: `${downloadProgress.percent}%` }}>
                  <div className="ytd-progress-glow-tip" />
                </div>
              </div>
            </div>
          )}

          {/* Video Info */}
          {videoInfo && (
            <div className="ytd-preview-card">
              <div className="ytd-preview-header">
                {videoInfo.thumbnail && (
                  <img src={videoInfo.thumbnail} alt="" className="ytd-thumbnail" />
                )}
                <div className="ytd-preview-meta">
                  <div className="ytd-video-title">{videoInfo.title}</div>
                  <div className="ytd-meta-tags">
                    {videoInfo.uploader && (
                      <span className="ytd-meta-item">
                        <User size={12} /> {videoInfo.uploader}
                      </span>
                    )}
                    {videoInfo.duration > 0 && (
                      <span className="ytd-meta-item">
                        <Clock size={12} /> {formatDuration(videoInfo.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ytd-formats-container">
                <div className="ytd-formats-label">
                  <Sparkles size={13} color="#ef4444" />
                  <span>SELECT QUALITY & DOWNLOAD</span>
                </div>
                <div className="ytd-formats-list">
                  {videoInfo.formats.length === 0 && (
                    <div className="ytd-empty-formats">No downloadable formats found</div>
                  )}
                  {videoInfo.formats.map((fmt) => {
                    const isDownloadingThis = downloadingFormatId === fmt.format_id;
                    return (
                      <div key={fmt.format_id} className={`ytd-format-row ${isDownloadingThis ? 'is-downloading' : ''}`}>
                        <div className="ytd-format-left">
                          <Video size={16} className="ytd-format-icon" />
                          <div className="ytd-format-info">
                            <span className="ytd-format-label">{fmt.label}</span>
                            <span className="ytd-ext-badge">{fmt.ext}</span>
                            {!fmt.has_audio && <span className="ytd-no-audio-badge">No Audio</span>}
                            {fmt.filesize > 0 && <span className="ytd-filesize">{formatSize(fmt.filesize)}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(fmt)}
                          disabled={downloadingFormatId !== null}
                          className={`ytd-download-btn ${isDownloadingThis ? 'active-dl' : ''}`}
                        >
                          {isDownloadingThis ? (
                            <>
                              <Loader2 size={14} className="ytd-spin" />
                              <span>{downloadProgress ? `${downloadProgress.percent}%` : 'Starting...'}</span>
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                        {isDownloadingThis && <div className="ytd-row-shimmer" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes ytdSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes ytdPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes ytdShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes ytdGlowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .ytd-spin { animation: ytdSpin 1s linear infinite; }

        .ytd-modal-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(9, 9, 11, 0.75);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; overflow-y: auto;
        }

        .ytd-modal-card {
          position: relative; background: #121215; border-radius: 20px;
          width: 100%; max-width: 620px; max-height: 92vh; overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 65px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.12);
        }

        .ytd-glow-bar {
          height: 3px; width: 100%;
          background: linear-gradient(90deg, #ff0000, #cc0000, #ff4444);
          animation: ytdGlowPulse 3s ease-in-out infinite;
        }

        .ytd-usage-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 24px; background: rgba(255,255,255,0.04);
          font-size: 13px; color: rgba(255,255,255,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .ytd-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .ytd-header-left { display: flex; align-items: center; gap: 12px; }

        .ytd-icon-badge {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #ff0000, #cc0000);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4); flex-shrink: 0;
        }

        .ytd-title { color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
        .ytd-subtitle { color: #a1a1aa; font-size: 12px; margin-top: 1px; }

        .ytd-close-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #a1a1aa; transition: all 0.2s ease;
        }
        .ytd-close-btn:hover { background: rgba(255, 255, 255, 0.12); color: #ffffff; }

        .ytd-body { padding: 20px 24px; }

        .ytd-disclaimer-box {
          background: rgba(234, 179, 8, 0.06);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 14px; padding: 16px; margin-bottom: 20px;
        }
        .ytd-disclaimer-content { display: flex; gap: 12px; }
        .ytd-disclaimer-icon { flex-shrink: 0; margin-top: 2px; }
        .ytd-disclaimer-heading { color: #eab308; font-weight: 700; font-size: 13px; margin-bottom: 4px; }
        .ytd-disclaimer-text { color: #d4d4d8; font-size: 12px; line-height: 1.5; }
        .ytd-disclaimer-list { color: #a1a1aa; font-size: 11px; line-height: 1.7; margin: 6px 0 0; padding-left: 16px; }
        .ytd-checkbox-label {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid rgba(234, 179, 8, 0.15);
        }
        .ytd-checkbox { accent-color: #ff0000; width: 18px; height: 18px; cursor: pointer; }
        .ytd-checkbox-text { color: #fafafa; font-size: 13px; font-weight: 600; }

        .ytd-input-container { display: flex; gap: 10px; margin-bottom: 14px; }
        .ytd-input-wrapper {
          flex: 1; display: flex; align-items: center; gap: 10px;
          background: rgba(255, 255, 255, 0.05); border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12); padding: 0 14px;
          transition: border-color 0.2s ease;
        }
        .ytd-input-wrapper:focus-within {
          border-color: #ff0000; box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
        }
        .ytd-link-icon { color: #71717a; flex-shrink: 0; }
        .ytd-input {
          flex: 1; background: none; border: none; outline: none;
          color: #fafafa; font-size: 14px; padding: 13px 0; width: 100%;
        }
        .ytd-fetch-btn {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          border: none; border-radius: 12px; padding: 0 22px;
          color: #fff; font-weight: 600; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3); flex-shrink: 0; min-height: 46px;
        }
        .ytd-fetch-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 0, 0, 0.45);
        }
        .ytd-fetch-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .ytd-security-badge {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 16px; color: #22c55e; font-size: 11px; font-weight: 500;
        }
        .ytd-error-banner {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;
          color: #fca5a5; font-size: 13px; display: flex; align-items: center; gap: 10px;
        }

        .ytd-progress-card {
          background: rgba(255, 0, 0, 0.08); border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 16px; padding: 16px 18px; margin-bottom: 18px;
          box-shadow: 0 8px 25px rgba(255, 0, 0, 0.1); transition: all 0.3s ease;
        }
        .ytd-progress-card.completed {
          background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.35);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
        }
        .ytd-progress-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
        }
        .ytd-progress-title-area { display: flex; align-items: center; gap: 10px; }
        .ytd-icon-zap { color: #ff4444; animation: ytdPulse 1.2s infinite; }
        .ytd-icon-success { color: #4ade80; }
        .ytd-progress-main-title { color: #ffffff; font-size: 14px; font-weight: 700; }
        .ytd-progress-sub-text { color: #a1a1aa; font-size: 12px; margin-top: 2px; }
        .ytd-progress-right { display: flex; align-items: center; gap: 10px; }
        .ytd-percent-badge {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          color: #ffffff; font-size: 13px; font-weight: 800;
          padding: 4px 12px; border-radius: 20px;
          box-shadow: 0 2px 10px rgba(255, 0, 0, 0.4);
        }
        .ytd-progress-card.completed .ytd-percent-badge {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }
        .ytd-cancel-btn {
          background: rgba(255, 255, 255, 0.08); border: none; border-radius: 8px;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #a1a1aa; transition: all 0.2s ease;
        }
        .ytd-cancel-btn:hover { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .ytd-progress-bar-container {
          height: 8px; background: rgba(255, 255, 255, 0.08);
          border-radius: 6px; overflow: hidden; position: relative;
        }
        .ytd-progress-bar-fill {
          height: 100%; background: linear-gradient(90deg, #ff0000, #ff4444, #cc0000);
          border-radius: 6px; transition: width 0.25s ease-out; position: relative;
        }
        .ytd-progress-card.completed .ytd-progress-bar-fill {
          background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
        }
        .ytd-progress-glow-tip {
          position: absolute; right: 0; top: 0; bottom: 0; width: 15px;
          background: #ffffff; box-shadow: 0 0 10px #ffffff;
          opacity: 0.8; border-radius: 50%;
        }

        .ytd-preview-card {
          background: rgba(255, 255, 255, 0.03); border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden;
        }
        .ytd-preview-header { display: flex; gap: 16px; padding: 16px; }
        .ytd-thumbnail {
          width: 140px; height: 85px; object-fit: cover; border-radius: 10px;
          background: #27272a; flex-shrink: 0;
        }
        .ytd-preview-meta { flex: 1; min-width: 0; }
        .ytd-video-title {
          color: #fafafa; font-size: 14px; font-weight: 600; line-height: 1.4;
          margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        }
        .ytd-meta-tags { display: flex; gap: 12px; flex-wrap: wrap; }
        .ytd-meta-item { display: flex; align-items: center; gap: 4px; color: #a1a1aa; font-size: 12px; }

        .ytd-formats-container {
          border-top: 1px solid rgba(255, 255, 255, 0.07); padding: 14px 16px;
        }
        .ytd-formats-label {
          display: flex; align-items: center; gap: 6px;
          color: #ff4444; font-size: 11px; font-weight: 700;
          letter-spacing: 0.05em; margin-bottom: 12px;
        }
        .ytd-formats-list { display: flex; flex-direction: column; gap: 8px; }
        .ytd-empty-formats { color: #a1a1aa; font-size: 13px; padding: 16px; text-align: center; }
        .ytd-format-row {
          position: relative; display: flex; align-items: center; justify-content: space-between;
          background: rgba(255, 255, 255, 0.03); border-radius: 12px;
          padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease; overflow: hidden;
        }
        .ytd-format-row:hover {
          background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 0, 0, 0.3);
        }
        .ytd-format-row.is-downloading {
          border-color: #ff0000; background: rgba(255, 0, 0, 0.06);
        }
        .ytd-format-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .ytd-format-icon { color: #ff4444; flex-shrink: 0; }
        .ytd-format-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ytd-format-label { color: #ffffff; font-size: 14px; font-weight: 700; }
        .ytd-ext-badge {
          font-size: 10px; color: #a1a1aa; background: rgba(255, 255, 255, 0.07);
          border-radius: 4px; padding: 2px 6px; text-transform: uppercase; font-weight: 600;
        }
        .ytd-no-audio-badge {
          font-size: 10px; color: #f59e0b; background: rgba(245, 158, 11, 0.12);
          border-radius: 4px; padding: 2px 6px; font-weight: 600;
        }
        .ytd-filesize { font-size: 12px; color: #71717a; }
        .ytd-download-btn {
          background: linear-gradient(135deg, #ff0000, #cc0000);
          border: none; border-radius: 10px; padding: 8px 18px;
          color: #ffffff; font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 0, 0, 0.25); flex-shrink: 0;
        }
        .ytd-download-btn:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: 0 6px 18px rgba(255, 0, 0, 0.4);
        }
        .ytd-download-btn.active-dl {
          background: rgba(255, 0, 0, 0.4); box-shadow: none;
        }
        .ytd-row-shimmer {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #ff0000, #ff4444, #cc0000);
          animation: ytdShimmer 1.5s infinite linear;
        }

        @media (max-width: 640px) {
          .ytd-modal-overlay { padding: 8px; }
          .ytd-modal-card { border-radius: 16px; max-height: 96vh; }
          .ytd-header { padding: 16px 18px 14px; }
          .ytd-title { font-size: 16px; }
          .ytd-body { padding: 16px 18px; }
          .ytd-input-container { flex-direction: column; gap: 8px; }
          .ytd-fetch-btn { width: 100%; justify-content: center; }
          .ytd-preview-header { flex-direction: column; gap: 12px; }
          .ytd-thumbnail { width: 100%; height: 160px; }
          .ytd-format-row { flex-direction: column; align-items: stretch; gap: 10px; }
          .ytd-format-left { justify-content: space-between; }
          .ytd-download-btn { width: 100%; justify-content: center; padding: 10px; }
        }
      `}</style>
    </div>
  );
}
