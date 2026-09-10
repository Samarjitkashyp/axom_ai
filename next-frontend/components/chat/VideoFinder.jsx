'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Video,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Film,
} from 'lucide-react';

const QUICK_TAGS = [
  'Assam & Brahmaputra',
  'Nature & Waterfalls',
  'Cyberpunk & AI',
  'Drone Landscapes',
  'City Night Life',
  'Slow Motion Waves',
  'Time-lapse Stars',
  'Business & Tech',
  'Rain & Storm',
  'Wildlife Animals',
  'Coffee & Study',
  'Abstract Neon 3D',
];

const ORIENTATIONS = [
  { id: '', label: 'All Orientations' },
  { id: 'landscape', label: '🖥️ Landscape' },
  { id: 'portrait', label: '📱 Portrait' },
  { id: 'square', label: '🔲 Square' },
];

const SIZES = [
  { id: '', label: 'All Sizes' },
  { id: 'large', label: '💎 4K UHD' },
  { id: 'medium', label: '✨ Full HD' },
  { id: 'small', label: '⚡ HD' },
];

function formatDuration(secs) {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Subcomponent: Video Card with hover auto-play
function VideoCard({ video, onSelect, onQuickDownload }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && video.preview_url) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="video-finder-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(video)}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isHovered
          ? '0 12px 28px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Media Visual Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: video.width && video.height ? `${video.width}/${video.height}` : '16/9',
          maxHeight: 320,
          minHeight: 180,
          backgroundColor: '#070b14',
          overflow: 'hidden',
        }}
      >
        {/* Poster Image */}
        <img
          src={video.image}
          alt={`Video by ${video.user?.name || 'Videographer'}`}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.25s ease',
            opacity: isPlaying ? 0 : 1,
          }}
        />

        {/* Hover Auto-Play Video */}
        {video.preview_url && (
          <video
            ref={videoRef}
            src={video.preview_url}
            muted
            loop
            playsInline
            preload="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isPlaying ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        )}

        {/* Top Badges: Quality & Duration */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* Quality Badge */}
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: video.highest_quality?.includes('4K')
                ? 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)'
                : 'rgba(15, 23, 42, 0.82)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {video.highest_quality || 'HD'}
          </span>

          {/* Duration Pill */}
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(15, 23, 42, 0.82)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              fontSize: '0.7rem',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              fontFamily: 'monospace',
            }}
          >
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Play Icon Indicator in center when idle */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
              opacity: isHovered ? 0.9 : 0.45,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <Play size={20} color="#ffffff" fill="#ffffff" style={{ marginLeft: 2 }} />
            </div>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px 12px 10px 12px',
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.92) 0%, rgba(11, 15, 25, 0) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            zIndex: 3,
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
            By {video.user?.name || 'Pexels Creator'}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickDownload(video);
            }}
            title="Download Video"
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
            }}
          >
            <Download size={13} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Video Inspector Modal (Full Lightbox)
function VideoLightboxModal({ video, onClose }) {
  const [selectedQuality, setSelectedQuality] = useState(() => {
    return video?.video_files?.[0] || null;
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const handleDownload = () => {
    const targetFile = selectedQuality || video.video_files?.[0];
    if (!targetFile?.link) return;
    setIsDownloading(true);

    const safeFilename = `axom-pexels-${video.id}-${targetFile.label || 'hd'}.mp4`.replace(/\s+/g, '_');
    const proxyUrl = `/api/download-stock-video/?url=${encodeURIComponent(targetFile.link)}&name=${encodeURIComponent(safeFilename)}`;

    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleCopyLink = async () => {
    const link = selectedQuality?.link || video.url;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.92)',
        backdropFilter: 'blur(20px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1040,
          maxHeight: '92vh',
          backgroundColor: '#0c111e',
          borderRadius: 18,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Film size={16} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>
                Stock Video #{video.id}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                Duration: {formatDuration(video.duration)} · {video.width} × {video.height}px
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Video Player + Details Sidebar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: window.innerWidth < 860 ? 'column' : 'row',
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {/* Main Video Player Container */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#040711',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              minHeight: 300,
            }}
          >
            <video
              ref={playerRef}
              src={selectedQuality?.link || video.preview_url}
              controls
              autoPlay
              loop
              playsInline
              poster={video.image}
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                borderRadius: 10,
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                outline: 'none',
              }}
            />
          </div>

          {/* Details & Download Options Panel */}
          <div
            style={{
              width: window.innerWidth < 860 ? '100%' : 340,
              padding: 20,
              backgroundColor: '#0a0f1d',
              borderLeft: window.innerWidth < 860 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: window.innerWidth < 860 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxSizing: 'border-box',
            }}
          >
            {/* Videographer Attribution */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Creator & Credit
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {(video.user?.name || 'P')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {video.user?.name || 'Pexels Videographer'}
                  </span>
                  {video.user?.url && (
                    <a
                      href={video.user.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.74rem', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                    >
                      View Profile on Pexels <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quality Selector */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Download Resolution
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {video.video_files?.map((file) => {
                  const isSelected = selectedQuality?.id === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedQuality(file)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 10,
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: isSelected ? '4px solid #6366f1' : '2px solid rgba(255, 255, 255, 0.25)',
                            backgroundColor: isSelected ? '#ffffff' : 'transparent',
                          }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                          {file.label || 'MP4 Video'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {file.width} × {file.height}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: 10 }}>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: isDownloading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(236, 72, 153, 0.35)',
                }}
              >
                {isDownloading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                <span>{isDownloading ? 'Preparing Download...' : `Download MP4 (${selectedQuality?.label || 'HD'})`}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Direct Link Copied!' : 'Copy Video Link'}</span>
              </button>
            </div>

            {/* Licensing & Compliance Note */}
            <p style={{ margin: 0, fontSize: '0.68rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
              Free for commercial and personal use under Pexels License. Attribution appreciated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// MAIN COMPONENT
export default function VideoFinder({ onClose }) {
  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [orientation, setOrientation] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [activeVideo, setActiveVideo] = useState(null);
  const searchInputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Fetch videos from API
  const fetchVideos = useCallback(
    async (searchQuery, pageNum = 1, orient = '', size = '', append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery && searchQuery.trim()) params.append('query', searchQuery.trim());
        params.append('page', pageNum);
        params.append('per_page', '18');
        if (orient) params.append('orientation', orient);
        if (size) params.append('size', size);

        const res = await fetch(`/api/stock-videos/?${params.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch videos from Pexels.');
        }

        const newVideos = data.videos || [];
        setTotalResults(data.total_results || newVideos.length);
        setHasMore(!!data.next_page && newVideos.length >= 18);

        if (append) {
          setVideos((prev) => [...prev, ...newVideos]);
        } else {
          setVideos(newVideos);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Network error fetching stock videos.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load: Popular trending footage
  useEffect(() => {
    fetchVideos('', 1, orientation, selectedSize, false);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = query.trim();
    setActiveSearch(q);
    setPage(1);
    fetchVideos(q, 1, orientation, selectedSize, false);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    setActiveSearch(tag);
    setPage(1);
    fetchVideos(tag, 1, orientation, selectedSize, false);
  };

  const handleOrientationChange = (orient) => {
    const nextOrient = orientation === orient ? '' : orient;
    setOrientation(nextOrient);
    setPage(1);
    fetchVideos(activeSearch, 1, nextOrient, selectedSize, false);
  };

  const handleSizeChange = (size) => {
    const nextSize = selectedSize === size ? '' : size;
    setSelectedSize(nextSize);
    setPage(1);
    fetchVideos(activeSearch, 1, orientation, nextSize, false);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(activeSearch, nextPage, orientation, selectedSize, true);
  };

  const handleQuickDownload = (video) => {
    const file = video.video_files?.[0];
    if (!file?.link) return;
    const safeFilename = `axom-pexels-${video.id}-${file.label || 'hd'}.mp4`.replace(/\s+/g, '_');
    const proxyUrl = `/api/download-stock-video/?url=${encodeURIComponent(file.link)}&name=${encodeURIComponent(safeFilename)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="video-finder-root"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        backgroundColor: '#070b14',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 1. TOP HEADER */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            }}
          >
            <Video size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                AI Video Finder
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  color: '#f472b6',
                  textTransform: 'uppercase',
                }}
              >
                Pexels 4K & HD
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
              Free 4K & HD stock footage, drone clips, and cinematic B-rolls
            </p>
          </div>
        </div>

        {/* Center: Search Box */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            maxWidth: 540,
            margin: '0 20px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={17}
            color="#94a3b8"
            style={{ position: 'absolute', left: 14, pointerEvents: 'none' }}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 4K videos... (e.g. Assam, waterfalls, drone, technology, rain)"
            style={{
              width: '100%',
              padding: '10px 42px 10px 40px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 12,
              fontSize: '0.86rem',
              color: '#f8fafc',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveSearch('');
                setPage(1);
                fetchVideos('', 1, orientation, selectedSize, false);
              }}
              style={{
                position: 'absolute',
                right: 12,
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Right: Close Studio Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: 8,
            borderRadius: 10,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
      </header>

      {/* 2. FILTERS BAR */}
      <div
        style={{
          padding: '8px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(11, 15, 25, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          flexShrink: 0,
          zIndex: 9,
        }}
      >
        {/* Orientation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Format:
          </span>
          {ORIENTATIONS.map((o) => {
            const isSelected = orientation === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => handleOrientationChange(o.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#c4b5fd' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Size Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Quality:
          </span>
          {SIZES.map((s) => {
            const isSelected = selectedSize === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSizeChange(s.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: isSelected ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#f472b6' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div style={{ marginLeft: 'auto', fontSize: '0.76rem', color: '#64748b' }}>
          {totalResults > 0 ? (
            <span>Found <strong>{totalResults.toLocaleString()}</strong> stock clips</span>
          ) : (
            <span>Showing popular footage</span>
          )}
        </div>
      </div>

      {/* 3. QUICK SEARCH TAGS (Horizontal Scroll) */}
      <div
        className="diagram-hide-scroll"
        style={{
          padding: '8px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#070b14',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={12} color="#ec4899" /> Trending:
        </span>
        {QUICK_TAGS.map((tag) => {
          const isActive = activeSearch.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              style={{
                padding: '4px 11px',
                borderRadius: 20,
                border: isActive ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? 'rgba(236, 72, 153, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#f472b6' : '#cbd5e1',
                fontSize: '0.74rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN VIDEO CONTENT GRID */}
      <div
        className="diagram-custom-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          minHeight: 0,
          boxSizing: 'border-box',
        }}
      >
        {loading ? (
          /* Loading Skeletons */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 220,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))}
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div
            style={{
              maxWidth: 460,
              margin: '60px auto',
              textAlign: 'center',
              padding: 24,
              backgroundColor: 'rgba(127, 29, 29, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 14,
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#fca5a5', fontSize: '0.94rem' }}>
              Could not load videos
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#f87171', fontSize: '0.78rem' }}>
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={() => fetchVideos(activeSearch, 1, orientation, selectedSize, false)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : videos.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              maxWidth: 420,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Video size={26} color="#64748b" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#f8fafc' }}>
              No videos found
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Try searching with different keywords like 'ocean', 'aerial', 'forest', or clear your orientation filters.
            </p>
          </div>
        ) : (
          /* Video Grid */
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {videos.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onSelect={setActiveVideo}
                  onQuickDownload={handleQuickDownload}
                />
              ))}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 36, marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '11px 28px',
                    borderRadius: 10,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: loadingMore ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Loading More Videos...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      <span>Load More Footage</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. LIGHTBOX INSPECTOR MODAL */}
      {activeVideo && (
        <VideoLightboxModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
