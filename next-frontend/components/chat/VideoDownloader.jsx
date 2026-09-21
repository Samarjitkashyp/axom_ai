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
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'https://aiaxom.co.in';

const SUPPORTED_SITES = [
  { name: 'Facebook', color: '#1877F2' },
  { name: 'Instagram', color: '#E4405F' },
  { name: 'TikTok', color: '#000000' },
  { name: 'Twitter/X', color: '#1DA1F2' },
  { name: 'Reddit', color: '#FF4500' },
  { name: 'Vimeo', color: '#1AB7EA' },
  { name: 'Dailymotion', color: '#0066DC' },
  { name: 'Twitch', color: '#9146FF' },
  { name: 'LinkedIn', color: '#0A66C2' },
  { name: 'Pinterest', color: '#E60023' },
  { name: 'Snapchat', color: '#FFFC00' },
  { name: 'Threads', color: '#000000' },
  { name: 'Bilibili', color: '#00A1D6' },
];

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

export default function VideoDownloader({ onClose }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingFormatId, setDownloadingFormatId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null); // { percent, loaded, total, status, label }
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const inputRef = useRef(null);
  const xhrRef = useRef(null);
  const progressIntervalRef = useRef(null);

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

  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    if (!agreedDisclaimer) {
      setError('Please agree to the fair use notice before fetching.');
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

    // Immediate smooth animated simulation so progress bar moves instantly!
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
    <div className="vd-modal-overlay">
      <div className="vd-modal-card">
        {/* Top Glow Accent */}
        <div className="vd-glow-bar" />

        {/* Header */}
        <div className="vd-header">
          <div className="vd-header-left">
            <div className="vd-icon-badge">
              <Download size={22} color="#fff" />
            </div>
            <div>
              <div className="vd-title">Universal Video Downloader</div>
              <div className="vd-subtitle">Instant direct streaming for videos & media</div>
            </div>
          </div>
          <button onClick={onClose} className="vd-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="vd-body">
          {/* Disclaimer Box */}
          <div className="vd-disclaimer-box">
            <div className="vd-disclaimer-content">
              <AlertTriangle size={18} color="#eab308" className="vd-disclaimer-icon" />
              <div>
                <div className="vd-disclaimer-heading">
                  Legal Disclaimer & Fair Use Notice
                </div>
                <div className="vd-disclaimer-text">
                  This tool is provided <strong>strictly for personal, non-commercial, fair use purposes only</strong>.
                  Downloading copyrighted content without authorization may violate laws.
                </div>
                <ul className="vd-disclaimer-list">
                  <li>Only download content you own or have permission to access</li>
                  <li>No videos are stored on our servers — files stream directly to you</li>
                </ul>
              </div>
            </div>
            <label className="vd-checkbox-label">
              <input
                type="checkbox"
                checked={agreedDisclaimer}
                onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                className="vd-checkbox"
              />
              <span className="vd-checkbox-text">
                I agree to use this tool for fair use only
              </span>
            </label>
          </div>

          {/* Supported Sites */}
          <div className="vd-section-mb">
            <div className="vd-section-label">
              SUPPORTED PLATFORMS
            </div>
            <div className="vd-platforms-grid">
              {SUPPORTED_SITES.map((s) => (
                <span key={s.name} className="vd-platform-badge">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* URL Input Form */}
          <div className="vd-input-container">
            <div className="vd-input-wrapper">
              <Link2 size={18} className="vd-link-icon" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
                placeholder="Paste video URL from Instagram, Facebook, TikTok, Twitter..."
                className="vd-input"
              />
            </div>
            <button
              onClick={handleFetchInfo}
              disabled={loading || !url.trim() || !agreedDisclaimer}
              className="vd-fetch-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="vd-spin" />
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

          {/* Security badge */}
          <div className="vd-security-badge">
            <Shield size={13} />
            <span>Secure — Direct stream in current window, no extra tabs or windows opened</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="vd-error-banner">
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Real-time Percentage Download Progress Bar Card */}
          {downloadProgress && (
            <div className={`vd-progress-card ${downloadProgress.status}`}>
              <div className="vd-progress-header">
                <div className="vd-progress-title-area">
                  {downloadProgress.status === 'completed' ? (
                    <CheckCircle2 size={18} className="vd-icon-success" />
                  ) : (
                    <Zap size={18} className="vd-icon-zap" />
                  )}
                  <div>
                    <div className="vd-progress-main-title">
                      {downloadProgress.status === 'completed'
                        ? 'Download Complete! File Saved.'
                        : `Downloading Video (${downloadProgress.label})...`}
                    </div>
                    <div className="vd-progress-sub-text">
                      {downloadProgress.status === 'connecting' && 'Connecting to streaming server...'}
                      {downloadProgress.status === 'downloading' &&
                        `${formatSize(downloadProgress.loaded)} of ${formatSize(downloadProgress.total) || 'unknown size'}`}
                      {downloadProgress.status === 'completed' && 'File saved directly to your device storage!'}
                    </div>
                  </div>
                </div>

                <div className="vd-progress-right">
                  <span className="vd-percent-badge">{downloadProgress.percent}%</span>
                  {downloadProgress.status !== 'completed' && (
                    <button onClick={handleCancelDownload} className="vd-cancel-btn" title="Cancel Download">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Progress Bar Track */}
              <div className="vd-progress-bar-container">
                <div
                  className="vd-progress-bar-fill"
                  style={{ width: `${downloadProgress.percent}%` }}
                >
                  <div className="vd-progress-glow-tip" />
                </div>
              </div>
            </div>
          )}

          {/* Video Info Preview Card */}
          {videoInfo && (
            <div className="vd-preview-card">
              <div className="vd-preview-header">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt=""
                    className="vd-thumbnail"
                  />
                )}
                <div className="vd-preview-meta">
                  <div className="vd-video-title">
                    {videoInfo.title}
                  </div>
                  <div className="vd-meta-tags">
                    {videoInfo.uploader && (
                      <span className="vd-meta-item">
                        <User size={12} /> {videoInfo.uploader}
                      </span>
                    )}
                    {videoInfo.duration > 0 && (
                      <span className="vd-meta-item">
                        <Clock size={12} /> {formatDuration(videoInfo.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formats List */}
              <div className="vd-formats-container">
                <div className="vd-formats-label">
                  <Sparkles size={13} color="#a78bfa" />
                  <span>SELECT QUALITY & DOWNLOAD</span>
                </div>
                <div className="vd-formats-list">
                  {videoInfo.formats.length === 0 && (
                    <div className="vd-empty-formats">
                      No downloadable formats found
                    </div>
                  )}
                  {videoInfo.formats.map((fmt) => {
                    const isDownloadingThis = downloadingFormatId === fmt.format_id;
                    return (
                      <div key={fmt.format_id} className={`vd-format-row ${isDownloadingThis ? 'is-downloading' : ''}`}>
                        <div className="vd-format-left">
                          <Video size={16} className="vd-format-icon" />
                          <div className="vd-format-info">
                            <span className="vd-format-label">
                              {fmt.label}
                            </span>
                            <span className="vd-ext-badge">{fmt.ext}</span>
                            {!fmt.has_audio && (
                              <span className="vd-no-audio-badge">No Audio</span>
                            )}
                            {fmt.filesize > 0 && (
                              <span className="vd-filesize">
                                {formatSize(fmt.filesize)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(fmt)}
                          disabled={downloadingFormatId !== null}
                          className={`vd-download-btn ${isDownloadingThis ? 'active-dl' : ''}`}
                        >
                          {isDownloadingThis ? (
                            <>
                              <Loader2 size={14} className="vd-spin" />
                              <span>{downloadProgress ? `${downloadProgress.percent}%` : 'Starting...'}</span>
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              <span>Download</span>
                            </>
                          )}
                        </button>

                        {/* Animated shimmer line when downloading */}
                        {isDownloadingThis && <div className="vd-row-shimmer" />}
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
        @keyframes vdSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes vdPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes vdShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes vdGlowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .vd-spin {
          animation: vdSpin 1s linear infinite;
        }

        .vd-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(9, 9, 11, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
        }

        .vd-modal-card {
          position: relative;
          background: #121215;
          border-radius: 20px;
          width: 100%;
          max-width: 620px;
          max-height: 92vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 65px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.15);
        }

        .vd-glow-bar {
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #7c3aed, #ec4899, #3b82f6);
          animation: vdGlowPulse 3s ease-in-out infinite;
        }

        .vd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .vd-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vd-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
          flex-shrink: 0;
        }

        .vd-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .vd-subtitle {
          color: #a1a1aa;
          font-size: 12px;
          margin-top: 1px;
        }

        .vd-close-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #a1a1aa;
          transition: all 0.2s ease;
        }

        .vd-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .vd-body {
          padding: 20px 24px;
        }

        .vd-disclaimer-box {
          background: rgba(234, 179, 8, 0.06);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .vd-disclaimer-content {
          display: flex;
          gap: 12px;
        }

        .vd-disclaimer-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .vd-disclaimer-heading {
          color: #eab308;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .vd-disclaimer-text {
          color: #d4d4d8;
          font-size: 12px;
          line-height: 1.5;
        }

        .vd-disclaimer-list {
          color: #a1a1aa;
          font-size: 11px;
          line-height: 1.7;
          margin: 6px 0 0;
          padding-left: 16px;
        }

        .vd-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(234, 179, 8, 0.15);
        }

        .vd-checkbox {
          accent-color: #7c3aed;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .vd-checkbox-text {
          color: #fafafa;
          font-size: 13px;
          font-weight: 600;
        }

        .vd-section-mb {
          margin-bottom: 18px;
        }

        .vd-section-label {
          color: #71717a;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .vd-platforms-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .vd-platform-badge {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          color: #d4d4d8;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .vd-input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
        }

        .vd-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0 14px;
          transition: border-color 0.2s ease;
        }

        .vd-input-wrapper:focus-within {
          border-color: #7c3aed;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
        }

        .vd-link-icon {
          color: #71717a;
          flex-shrink: 0;
        }

        .vd-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #fafafa;
          font-size: 14px;
          padding: 13px 0;
          width: 100%;
        }

        .vd-fetch-btn {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border: none;
          border-radius: 12px;
          padding: 0 22px;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
          flex-shrink: 0;
          min-height: 46px;
        }

        .vd-fetch-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
        }

        .vd-fetch-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .vd-security-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          color: #22c55e;
          font-size: 11px;
          font-weight: 500;
        }

        .vd-error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          color: #fca5a5;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Percentage Progress Card Styles */
        .vd-progress-card {
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.35);
          border-radius: 16px;
          padding: 16px 18px;
          margin-bottom: 18px;
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.15);
          transition: all 0.3s ease;
        }

        .vd-progress-card.completed {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.35);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
        }

        .vd-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .vd-progress-title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vd-icon-zap {
          color: #a78bfa;
          animation: vdPulse 1.2s infinite;
        }

        .vd-icon-success {
          color: #4ade80;
        }

        .vd-progress-main-title {
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
        }

        .vd-progress-sub-text {
          color: #a1a1aa;
          font-size: 12px;
          margin-top: 2px;
        }

        .vd-progress-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vd-percent-badge {
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 10px rgba(124, 58, 237, 0.4);
        }

        .vd-progress-card.completed .vd-percent-badge {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .vd-cancel-btn {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #a1a1aa;
          transition: all 0.2s ease;
        }

        .vd-cancel-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .vd-progress-bar-container {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .vd-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #ec4899, #3b82f6);
          border-radius: 6px;
          transition: width 0.25s ease-out;
          position: relative;
        }

        .vd-progress-card.completed .vd-progress-bar-fill {
          background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
        }

        .vd-progress-glow-tip {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 15px;
          background: #ffffff;
          box-shadow: 0 0 10px #ffffff;
          opacity: 0.8;
          border-radius: 50%;
        }

        .vd-preview-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .vd-preview-header {
          display: flex;
          gap: 16px;
          padding: 16px;
        }

        .vd-thumbnail {
          width: 140px;
          height: 85px;
          object-fit: cover;
          border-radius: 10px;
          background: #27272a;
          flex-shrink: 0;
        }

        .vd-preview-meta {
          flex: 1;
          min-width: 0;
        }

        .vd-video-title {
          color: #fafafa;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .vd-meta-tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .vd-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #a1a1aa;
          font-size: 12px;
        }

        .vd-formats-container {
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding: 14px 16px;
        }

        .vd-formats-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #a78bfa;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .vd-formats-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vd-empty-formats {
          color: #a1a1aa;
          font-size: 13px;
          padding: 16px;
          text-align: center;
        }

        .vd-format-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .vd-format-row:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(124, 58, 237, 0.3);
        }

        .vd-format-row.is-downloading {
          border-color: #7c3aed;
          background: rgba(124, 58, 237, 0.08);
        }

        .vd-format-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .vd-format-icon {
          color: #a78bfa;
          flex-shrink: 0;
        }

        .vd-format-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .vd-format-label {
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
        }

        .vd-ext-badge {
          font-size: 10px;
          color: #a1a1aa;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 2px 6px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .vd-no-audio-badge {
          font-size: 10px;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          border-radius: 4px;
          padding: 2px 6px;
          font-weight: 600;
        }

        .vd-filesize {
          font-size: 12px;
          color: #71717a;
        }

        .vd-download-btn {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border: none;
          border-radius: 10px;
          padding: 8px 18px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
          flex-shrink: 0;
        }

        .vd-download-btn:hover:not(:disabled) {
          transform: scale(1.03);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.4);
        }

        .vd-download-btn.active-dl {
          background: rgba(124, 58, 237, 0.4);
          box-shadow: none;
        }

        .vd-row-shimmer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #7c3aed, #ec4899, #3b82f6);
          animation: vdShimmer 1.5s infinite linear;
        }

        /* Responsive Mobile Styles */
        @media (max-width: 640px) {
          .vd-modal-overlay {
            padding: 8px;
          }

          .vd-modal-card {
            border-radius: 16px;
            max-height: 96vh;
          }

          .vd-header {
            padding: 16px 18px 14px;
          }

          .vd-title {
            font-size: 16px;
          }

          .vd-body {
            padding: 16px 18px;
          }

          .vd-input-container {
            flex-direction: column;
            gap: 8px;
          }

          .vd-fetch-btn {
            width: 100%;
            justify-content: center;
          }

          .vd-preview-header {
            flex-direction: column;
            gap: 12px;
          }

          .vd-thumbnail {
            width: 100%;
            height: 160px;
          }

          .vd-format-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .vd-format-left {
            justify-content: space-between;
          }

          .vd-download-btn {
            width: 100%;
            justify-content: center;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}
