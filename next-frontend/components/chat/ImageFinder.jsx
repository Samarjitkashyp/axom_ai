'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Download,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Camera,
  Layers,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

const QUICK_TAGS = [
  'Assam',
  'Nature & Landscapes',
  'AI & Technology',
  'Cyberpunk 3D',
  'Office & Business',
  'Wildlife',
  'Architecture',
  'Abstract Art',
  'Portrait & People',
  'Space & Galaxy',
  'Minimalist',
  'Festivals of India',
];

const ORIENTATIONS = [
  { id: '', label: 'All Orientations' },
  { id: 'landscape', label: '🖥️ Landscape' },
  { id: 'portrait', label: '📱 Portrait' },
  { id: 'square', label: '🔲 Square' },
];

const COLOR_FILTERS = [
  { id: '', label: 'Any Color', bg: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)' },
  { id: 'black', label: 'Black', bg: '#09090b' },
  { id: 'white', label: 'White', bg: '#f4f4f5' },
  { id: 'red', label: 'Red', bg: '#ef4444' },
  { id: 'orange', label: 'Orange', bg: '#f97316' },
  { id: 'yellow', label: 'Yellow', bg: '#eab308' },
  { id: 'green', label: 'Green', bg: '#22c55e' },
  { id: 'turquoise', label: 'Teal', bg: '#14b8a6' },
  { id: 'blue', label: 'Blue', bg: '#3b82f6' },
  { id: 'violet', label: 'Purple', bg: '#a855f7' },
  { id: 'pink', label: 'Pink', bg: '#ec4899' },
];

export default function ImageFinder({ onClose }) {
  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [orientation, setOrientation] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Inspector Lightbox Modal State
  const [activePhoto, setActivePhoto] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('original');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchInputRef = useRef(null);

  // Focus search bar on open
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Fetch photos from API
  const fetchPhotos = useCallback(
    async (searchQuery, pageNum = 1, orient = '', color = '', append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery && searchQuery.trim()) params.append('query', searchQuery.trim());
        params.append('page', pageNum);
        params.append('per_page', '24');
        if (orient) params.append('orientation', orient);
        if (color) params.append('color', color);

        const res = await fetch(`/api/stock-images/?${params.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch photos from Pexels.');
        }

        const newPhotos = data.photos || [];
        setTotalResults(data.total_results || newPhotos.length);
        setHasMore(!!data.next_page && newPhotos.length >= 24);

        if (append) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        } else {
          setPhotos(newPhotos);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Network error fetching images.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load: fetch trending curated photos
  useEffect(() => {
    fetchPhotos('', 1, orientation, selectedColor, false);
  }, []);

  // Handle Search Submission
  const handleSearch = (e) => {
    e?.preventDefault();
    const q = query.trim();
    setActiveSearch(q);
    setPage(1);
    fetchPhotos(q, 1, orientation, selectedColor, false);
  };

  // Quick tag selection
  const handleTagClick = (tag) => {
    setQuery(tag);
    setActiveSearch(tag);
    setPage(1);
    fetchPhotos(tag, 1, orientation, selectedColor, false);
  };

  // Filter change handler with toggle support
  const handleOrientationChange = (newOrient) => {
    const nextOrient = orientation === newOrient ? '' : newOrient;
    setOrientation(nextOrient);
    setPage(1);
    fetchPhotos(activeSearch, 1, nextOrient, selectedColor, false);
  };

  const handleColorChange = (newColor) => {
    const nextColor = selectedColor === newColor ? '' : newColor;
    setSelectedColor(nextColor);
    setPage(1);
    fetchPhotos(activeSearch, 1, orientation, nextColor, false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setOrientation('');
    setSelectedColor('');
    setPage(1);
    fetchPhotos(activeSearch, 1, '', '', false);
  };

  // Load More Photos
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(activeSearch, nextPage, orientation, selectedColor, true);
  };

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activePhoto) setActivePhoto(null);
        else onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, onClose]);

  // Download Handler for chosen resolution
  const handleDownload = async (photo, formatKey = 'original') => {
    if (!photo || !photo.src) return;
    setIsDownloading(true);

    const formatMap = {
      original: { url: photo.src.original, suffix: 'original' },
      large2x: { url: photo.src.large2x || photo.src.large, suffix: '4k-hd' },
      large: { url: photo.src.large, suffix: 'hd' },
      medium: { url: photo.src.medium, suffix: 'medium' },
      portrait: { url: photo.src.portrait || photo.src.medium, suffix: 'portrait' },
      landscape: { url: photo.src.landscape || photo.src.large, suffix: 'landscape' },
      small: { url: photo.src.small, suffix: 'small' },
    };

    const target = formatMap[formatKey] || formatMap.original;
    const cleanTitle = (photo.alt || 'axom-photo')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const fileName = `axom-${cleanTitle}-${photo.id}-${target.suffix}.jpg`;

    try {
      const downloadUrl = `/api/download-stock-image/?url=${encodeURIComponent(target.url)}&name=${encodeURIComponent(fileName)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(target.url, '_blank');
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  // Copy Image Link
  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeFilterCount = (orientation ? 1 : 0) + (selectedColor ? 1 : 0);

  return (
    <div className="imgfinder-overlay">
      {/* TOPBAR */}
      <header className="imgfinder-header">
        <div className="imgfinder-header-left">
          <div className="imgfinder-logo-badge">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="imgfinder-title-row">
              <h1 className="imgfinder-title">AI Image Finder</h1>
              <span className="imgfinder-badge">Pexels 4K</span>
            </div>
            <p className="imgfinder-subtitle">
              Millions of free copyright-free 4K stock & AI photos for personal & commercial use
            </p>
          </div>
        </div>

        <div className="imgfinder-header-right">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`imgfinder-filter-btn ${showFilters || activeFilterCount > 0 ? 'active' : ''}`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: '#a855f7',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '1px 6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  marginLeft: 3,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="imgfinder-close-btn"
            title="Close (Esc)"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* CONTROLS AREA */}
      <div className="imgfinder-controls-area">
        <form onSubmit={handleSearch} className="imgfinder-search-form">
          <div className="imgfinder-input-wrap">
            <Search size={18} className="imgfinder-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything (e.g. 'Assam tea garden', 'futuristic city', 'coding', 'coffee shop')..."
              className="imgfinder-search-input"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchInputRef.current?.focus();
                }}
                className="imgfinder-clear-btn"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="imgfinder-search-submit"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Search</span>
          </button>
        </form>

        {/* QUICK TAG PILLS */}
        <div className="imgfinder-tags-row">
          <span className="imgfinder-tags-label">
            <Sparkles size={11} /> Suggestions:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`imgfinder-tag-pill ${
                activeSearch.toLowerCase() === tag.toLowerCase() ? 'active' : ''
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* EXPANDABLE FILTER ROW */}
        {showFilters && (
          <div className="imgfinder-filters-panel">
            {/* Orientation Filter */}
            <div className="imgfinder-filter-group">
              <span className="imgfinder-filter-label">Orientation:</span>
              <div className="imgfinder-pill-group">
                {ORIENTATIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => handleOrientationChange(o.id)}
                    className={`imgfinder-pill-item ${orientation === o.id ? 'active' : ''}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="imgfinder-filter-group">
              <span className="imgfinder-filter-label">Color Tone:</span>
              <div className="imgfinder-pill-group" style={{ padding: '4px 8px', gap: '6px' }}>
                {COLOR_FILTERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => handleColorChange(c.id)}
                    style={{ background: c.bg }}
                    className={`imgfinder-color-dot ${selectedColor === c.id ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Reset Filters CTA */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '6px 14px',
                  borderRadius: 9,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginLeft: 'auto',
                }}
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="imgfinder-status-bar">
        <div>
          {activeSearch ? (
            <span>
              Showing results for <strong>"{activeSearch}"</strong>
            </span>
          ) : (
            <span>Trending &amp; Curated Free High-Resolution Photos</span>
          )}
          {totalResults > 0 && (
            <span style={{ marginLeft: 8, color: '#c084fc', fontWeight: 700 }}>
              ({totalResults.toLocaleString()} photos)
            </span>
          )}
        </div>
        <div>
          <span>Powered by Pexels API</span>
        </div>
      </div>

      {/* PHOTO GRID AREA */}
      <div className="imgfinder-grid-container">
        {/* Error Notification */}
        {errorMsg && (
          <div
            style={{
              maxWidth: 600,
              margin: '0 auto 24px',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{errorMsg}</span>
            <button
              onClick={() => fetchPhotos(activeSearch, 1, orientation, selectedColor, false)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'underline',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="imgfinder-masonry-grid">
            {[320, 420, 260, 380, 460, 300, 340, 400].map((h, i) => (
              <div
                key={i}
                className="imgfinder-masonry-item"
                style={{
                  height: h,
                  background: 'rgba(255,255,255,0.03)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7',
                marginBottom: 16,
              }}
            >
              <Camera size={32} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
              No photos found
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 20px' }}>
              Try searching with different keywords or clear orientation/color filters.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setActiveSearch('');
                setOrientation('');
                setSelectedColor('');
                fetchPhotos('', 1, '', '', false);
              }}
              style={{
                padding: '10px 22px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={14} /> View Curated Photos
            </button>
          </div>
        ) : (
          /* Masonry Photos Gallery */
          <div>
            <div className="imgfinder-masonry-grid">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setActivePhoto(photo)}
                  style={{ backgroundColor: photo.avg_color || '#111222' }}
                  className="imgfinder-masonry-item"
                >
                  <img
                    src={photo.src.large || photo.src.medium}
                    alt={photo.alt}
                    loading="lazy"
                    className="imgfinder-photo-img"
                  />

                  {/* Hover Overlay */}
                  <div className="imgfinder-card-overlay">
                    <div className="imgfinder-card-top-action">
                      <span className="imgfinder-dim-badge">
                        {photo.width > photo.height ? 'Landscape' : photo.width < photo.height ? 'Portrait' : 'Square'}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(photo.src.original);
                          }}
                          className="imgfinder-card-action-btn"
                          title="Copy Original Image Link"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(photo, 'original');
                          }}
                          className="imgfinder-card-action-btn"
                          title="Download Original 4K"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="imgfinder-card-info">
                      <div className="imgfinder-card-title">{photo.alt || 'Pexels Stock Photo'}</div>
                      <div className="imgfinder-card-meta">
                        <span className="imgfinder-author-tag">
                          📷 {photo.photographer}
                        </span>
                        <span className="imgfinder-dim-badge">
                          {photo.width} × {photo.height}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="imgfinder-load-more-wrap">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="imgfinder-load-more-btn"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading more photos...</span>
                    </>
                  ) : (
                    <>
                      <Layers size={16} />
                      <span>Load More Photos</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL-SCREEN IMAGE INSPECTOR & DOWNLOAD MODAL */}
      {activePhoto && (
        <div className="imgfinder-modal-backdrop" onClick={() => setActivePhoto(null)}>
          <div className="imgfinder-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="imgfinder-close-btn"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 20,
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
              }}
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Image Preview Box */}
            <div className="imgfinder-modal-preview-box">
              <img
                src={activePhoto.src.large2x || activePhoto.src.large || activePhoto.src.original}
                alt={activePhoto.alt}
                className="imgfinder-modal-img"
              />
            </div>

            {/* Right Details & Download Sidebar */}
            <div className="imgfinder-modal-sidebar">
              <div>
                <div className="imgfinder-badge" style={{ display: 'inline-block' }}>
                  Pexels High Definition
                </div>

                <h2 className="imgfinder-modal-title">
                  {activePhoto.alt || 'High Resolution Stock Image'}
                </h2>

                {/* Photographer Credit */}
                <div className="imgfinder-author-card">
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Photographer</div>
                    <div className="imgfinder-author-name">{activePhoto.photographer}</div>
                  </div>
                  {activePhoto.photographer_url && (
                    <a
                      href={activePhoto.photographer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="imgfinder-author-link"
                    >
                      <span>Profile</span> <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Specs List */}
                <div className="imgfinder-specs-list">
                  <div className="imgfinder-spec-item">
                    <span>Dimensions:</span>
                    <span className="imgfinder-spec-val">
                      {activePhoto.width} × {activePhoto.height} px
                    </span>
                  </div>
                  <div className="imgfinder-spec-item">
                    <span>License:</span>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>Free to use</span>
                  </div>
                  <div className="imgfinder-spec-item">
                    <span>Orientation:</span>
                    <span className="imgfinder-spec-val" style={{ textTransform: 'capitalize' }}>
                      {activePhoto.width > activePhoto.height
                        ? 'Landscape'
                        : activePhoto.width < activePhoto.height
                        ? 'Portrait'
                        : 'Square'}
                    </span>
                  </div>
                </div>

                {/* Choose Resolution / Format */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
                    Select Resolution to Download:
                  </div>
                  <div className="imgfinder-res-radio-group">
                    {[
                      {
                        id: 'original',
                        label: 'Original Resolution',
                        desc: `${activePhoto.width} × ${activePhoto.height} px · Master 4K+`,
                      },
                      {
                        id: 'large2x',
                        label: 'Large (HD 1080p)',
                        desc: '1920 × 1280 px · Desktop & Displays',
                      },
                      {
                        id: 'medium',
                        label: 'Medium (Web & Mobile)',
                        desc: '800 × 530 px · Social & Articles',
                      },
                      {
                        id: 'portrait',
                        label: 'Portrait (Story / Reel)',
                        desc: '800 × 1200 px · Mobile Stories',
                      },
                    ].map((fmt) => (
                      <div
                        key={fmt.id}
                        onClick={() => setDownloadFormat(fmt.id)}
                        className={`imgfinder-res-option ${downloadFormat === fmt.id ? 'selected' : ''}`}
                      >
                        <div>
                          <div className="imgfinder-res-name">{fmt.label}</div>
                          <div className="imgfinder-res-sub">{fmt.desc}</div>
                        </div>
                        <input
                          type="radio"
                          name="downloadRes"
                          checked={downloadFormat === fmt.id}
                          onChange={() => setDownloadFormat(fmt.id)}
                          style={{ accentColor: '#a855f7' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <button
                  type="button"
                  onClick={() => handleDownload(activePhoto, downloadFormat)}
                  disabled={isDownloading}
                  className="imgfinder-download-action-btn"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Downloading Image...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download Selected Photo</span>
                    </>
                  )}
                </button>

                <div className="imgfinder-modal-secondary-btns">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(activePhoto.src.original)}
                    className="imgfinder-sec-btn"
                  >
                    {copiedLink ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={activePhoto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="imgfinder-sec-btn"
                  >
                    <ExternalLink size={13} />
                    <span>View on Pexels</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
