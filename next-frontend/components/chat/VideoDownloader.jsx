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
  Check,
  Info,
  ChevronDown,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'https://aiaxom.co.in';

const SUPPORTED_SITES = [
  { name: 'YouTube', color: '#FF0000' },
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
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const inputRef = useRef(null);

  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    if (!agreedDisclaimer) {
      setError('Please agree to the disclaimer before proceeding.');
      return;
    }
    setLoading(true);
    setError('');
    setVideoInfo(null);
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

  const handleDownload = async (fmt) => {
    if (!videoInfo) return;
    setDownloading(fmt.format_id);
    setError('');
    try {
      const res = await fetch(`${API}/api/video-download/stream/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoInfo.webpage_url, format_id: fmt.format_id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Download failed');
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(videoInfo.title || 'video').slice(0, 80)}.${fmt.ext || 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#18181b', borderRadius: 16, width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Download size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Video Downloader</div>
              <div style={{ color: '#a1a1aa', fontSize: 12 }}>Download videos from social media</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#a1a1aa',
          }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Disclaimer */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: 12, padding: 16, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <AlertTriangle size={18} color="#eab308" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ color: '#eab308', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  Legal Disclaimer & Fair Use Notice
                </div>
                <div style={{ color: '#d4d4d8', fontSize: 12, lineHeight: 1.6 }}>
                  This tool is provided <strong>strictly for personal, non-commercial, fair use purposes only</strong>.
                  Downloading copyrighted content without permission from the copyright holder may violate
                  applicable laws. By using this tool, you agree that:
                </div>
                <ul style={{ color: '#a1a1aa', fontSize: 12, lineHeight: 1.8, margin: '8px 0 0', paddingLeft: 18 }}>
                  <li>You will only download content you have the right to access</li>
                  <li>You will not use downloaded content for commercial purposes</li>
                  <li>You assume all legal responsibility for your downloads</li>
                  <li>No videos are stored on our servers — files are streamed directly to you</li>
                  <li>We reserve the right to disable this service at any time</li>
                </ul>
              </div>
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(234, 179, 8, 0.15)',
            }}>
              <input
                type="checkbox"
                checked={agreedDisclaimer}
                onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
              />
              <span style={{ color: '#fafafa', fontSize: 13, fontWeight: 600 }}>
                I agree to use this tool for fair use only
              </span>
            </label>
          </div>

          {/* Supported Sites */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#71717a', fontSize: 12, marginBottom: 8, fontWeight: 600 }}>
              SUPPORTED PLATFORMS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUPPORTED_SITES.map(s => (
                <span key={s.name} style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, color: '#d4d4d8',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>{s.name}</span>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', padding: '0 12px',
            }}>
              <Link2 size={16} color="#71717a" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
                placeholder="Paste video URL here..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#fafafa', fontSize: 14, padding: '12px 0',
                }}
              />
            </div>
            <button
              onClick={handleFetchInfo}
              disabled={loading || !url.trim() || !agreedDisclaimer}
              style={{
                background: loading ? 'rgba(124, 58, 237, 0.3)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none', borderRadius: 10, padding: '0 20px',
                color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                opacity: (!url.trim() || !agreedDisclaimer) ? 0.4 : 1,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>

          {/* Security badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
            color: '#22c55e', fontSize: 11,
          }}>
            <Shield size={13} />
            <span>Secure — No videos stored on server, URL validation enabled, rate limited</span>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 16,
              color: '#fca5a5', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Video Info */}
          {videoInfo && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              {/* Thumbnail + title */}
              <div style={{ display: 'flex', gap: 14, padding: 16 }}>
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt=""
                    style={{
                      width: 140, height: 80, objectFit: 'cover', borderRadius: 8,
                      background: '#27272a', flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#fafafa', fontSize: 14, fontWeight: 600, marginBottom: 8,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {videoInfo.title}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {videoInfo.uploader && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#a1a1aa', fontSize: 12 }}>
                        <User size={12} /> {videoInfo.uploader}
                      </span>
                    )}
                    {videoInfo.duration > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#a1a1aa', fontSize: 12 }}>
                        <Clock size={12} /> {formatDuration(videoInfo.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formats */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px',
              }}>
                <div style={{ color: '#71717a', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                  AVAILABLE QUALITIES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {videoInfo.formats.length === 0 && (
                    <div style={{ color: '#a1a1aa', fontSize: 13, padding: 12, textAlign: 'center' }}>
                      No downloadable formats found
                    </div>
                  )}
                  {videoInfo.formats.map((fmt) => (
                    <div key={fmt.format_id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Video size={14} color="#a78bfa" />
                        <span style={{ color: '#fafafa', fontSize: 13, fontWeight: 600 }}>
                          {fmt.label}
                        </span>
                        <span style={{
                          fontSize: 10, color: '#71717a', background: 'rgba(255,255,255,0.05)',
                          borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
                        }}>{fmt.ext}</span>
                        {!fmt.has_audio && (
                          <span style={{
                            fontSize: 10, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 4, padding: '2px 6px',
                          }}>No Audio</span>
                        )}
                        {fmt.filesize > 0 && (
                          <span style={{ fontSize: 11, color: '#71717a' }}>
                            {formatSize(fmt.filesize)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(fmt)}
                        disabled={downloading !== null}
                        style={{
                          background: downloading === fmt.format_id
                            ? 'rgba(124, 58, 237, 0.3)'
                            : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          border: 'none', borderRadius: 6, padding: '6px 14px',
                          color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          opacity: downloading !== null && downloading !== fmt.format_id ? 0.4 : 1,
                        }}
                      >
                        {downloading === fmt.format_id ? (
                          <><Loader2 size={12} className="spin" /> Downloading...</>
                        ) : (
                          <><Download size={12} /> Download</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
