'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Loader2,
  Download,
  ImageDown,
  CheckCircle,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Archive,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  ImageIcon,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { compressImage, fmtSize } from './utils/imageCompress';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif';
const ALLOWED = ACCEPT.split(',');
const MAX_FILES = 30;
const MAX_MB = 60;
const TARGET_PRESETS = [20, 50, 100, 200, 500, 1000];
const SIDE_PRESETS = [
  { v: 0, l: 'Original size' },
  { v: 3840, l: '3840 px (4K)' },
  { v: 1920, l: '1920 px (Full HD)' },
  { v: 1280, l: '1280 px' },
  { v: 800, l: '800 px' },
];
const FORMATS = [
  { v: 'auto', l: 'Auto (smart best)' },
  { v: 'jpeg', l: 'JPG' },
  { v: 'webp', l: 'WebP' },
  { v: 'png', l: 'PNG' },
];

let seq = 0;

function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((o) => o.v === value) || options[0];

  return (
    <div ref={selectRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          minHeight: '40px',
          borderRadius: '10px',
          border: `1px solid ${isOpen ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
          background: 'rgba(255, 255, 255, 0.04)',
          color: 'var(--text-primary, #f8fafc)',
          fontSize: '0.84rem',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
          transition: 'all 0.2s ease',
          touchAction: 'manipulation',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.l : ''}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--text-muted, #94a3b8)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '6px',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#0d1424',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '5px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05)',
            maxHeight: '220px',
            overflowY: 'auto',
            backdropFilter: 'blur(16px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.v === value;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => {
                  onChange(opt.v);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  minHeight: '38px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSelected ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                  color: isSelected ? '#10b981' : '#e2e8f0',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  touchAction: 'manipulation',
                }}
              >
                <span>{opt.l}</span>
                {isSelected && <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginLeft: '6px' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ImageCompressor({ onClose }) {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('quality');
  const [quality, setQuality] = useState(75);
  const [targetKB, setTargetKB] = useState(100);
  const [maxSide, setMaxSide] = useState(0);
  const [format, setFormat] = useState('auto');
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef(null);
  const urlsRef = useRef(new Set());

  const track = (blob) => {
    const u = URL.createObjectURL(blob);
    urlsRef.current.add(u);
    return u;
  };

  const untrack = (u) => {
    if (u && urlsRef.current.has(u)) {
      URL.revokeObjectURL(u);
      urlsRef.current.delete(u);
    }
  };

  useEffect(() => () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current.clear();
  }, []);

  const opts = {
    mode,
    quality: quality / 100,
    targetKB: Math.max(1, Number(targetKB) || 1),
    format,
    maxSide: Number(maxSide) || 0,
  };
  const optsKey = JSON.stringify(opts);

  const itemsRef = useRef([]);
  itemsRef.current = items;

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    const next = [...itemsRef.current];
    const problems = [];
    for (const f of incoming) {
      if (!ALLOWED.includes(f.type)) {
        problems.push(f.name + ': not a supported picture (use JPG, PNG, WebP, GIF, BMP or AVIF)');
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        problems.push(f.name + ': larger than ' + MAX_MB + ' MB');
        continue;
      }
      if (next.some((i) => i.file.name === f.name && i.file.size === f.size && i.file.lastModified === f.lastModified)) continue;
      if (next.length >= MAX_FILES) {
        problems.push('Only ' + MAX_FILES + ' pictures at a time');
        break;
      }
      next.push({ id: ++seq, file: f, thumb: track(f), status: 'ready', result: null, url: null, error: null, optsKey: null });
    }
    setItems(next);
    setErrorMsg(problems.length ? problems.slice(0, 3).join(' • ') : null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeItem = (id) => {
    const it = itemsRef.current.find((i) => i.id === id);
    if (it) {
      untrack(it.thumb);
      untrack(it.url);
    }
    setItems((cur) => cur.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    items.forEach((it) => {
      untrack(it.thumb);
      untrack(it.url);
    });
    setItems([]);
    setErrorMsg(null);
  };

  const patch = (id, p) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const run = async () => {
    setBusy(true);
    setErrorMsg(null);
    const pending = items.filter((i) => i.status !== 'done' || i.optsKey !== optsKey);
    for (const it of pending) {
      patch(it.id, { status: 'working', error: null });
      try {
        const r = await compressImage(it.file, opts);
        untrack(it.url);
        patch(it.id, { status: 'done', result: r, url: track(r.blob), optsKey });
      } catch (e) {
        patch(it.id, { status: 'error', error: e.message || 'Could not compress this picture.' });
      }
    }
    setBusy(false);
  };

  const save = (name, href) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadZip = async () => {
    setZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const used = new Set();
      for (const it of items) {
        if (it.status !== 'done') continue;
        let name = it.result.name;
        let n = 1;
        while (used.has(name)) {
          n += 1;
          name = it.result.name.replace(/(\.[^.]+)$/, '-' + n + '$1');
        }
        used.add(name);
        zip.file(name, it.result.blob);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const u = URL.createObjectURL(blob);
      save('compressed-images.zip', u);
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    } catch (e) {
      setErrorMsg('Could not create the ZIP file.');
    }
    setZipping(false);
  };

  const done = items.filter((i) => i.status === 'done');
  const totalBefore = done.reduce((s, i) => s + i.result.originalBytes, 0);
  const totalAfter = done.reduce((s, i) => s + i.result.bytes, 0);
  const pendingCount = items.filter((i) => i.status !== 'done' || i.optsKey !== optsKey).length;

  return (
    <div className="ic-container">
      <style>{`
        .ic-container {
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          background: #090e1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.7);
        }

        .ic-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.015);
          border-radius: 20px 20px 0 0;
        }

        .ic-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .ic-badge-private {
          font-size: 0.72rem;
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.08);
          padding: 2.5px 8px;
          border-radius: 999px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* DROPZONE */
        .ic-dropzone-wrapper {
          padding: 24px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .ic-dropzone {
          cursor: pointer;
          border: 2px dashed rgba(255, 255, 255, 0.16);
          border-radius: 16px;
          padding: 32px 20px;
          text-align: center;
          color: #94a3b8;
          max-width: 520px;
          width: 100%;
          background: rgba(255, 255, 255, 0.015);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-sizing: border-box;
          touch-action: manipulation;
        }

        .ic-dropzone:hover, .ic-dropzone.drag-active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.06);
        }

        .ic-btn-pick {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.94rem;
          color: #ffffff;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          cursor: pointer;
          margin-top: 16px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
          transition: transform 0.15s ease;
          touch-action: manipulation;
        }

        .ic-btn-pick:active {
          transform: scale(0.98);
        }

        /* ACTIVE BODY */
        .ic-body-active {
          display: flex;
          gap: 18px;
          padding: 18px;
          align-items: flex-start;
          justify-content: center;
          box-sizing: border-box;
        }

        .ic-pictures-col {
          flex: 1 1 420px;
          max-width: 620px;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .ic-settings-col {
          width: 320px;
          max-width: 100%;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .ic-settings-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          box-sizing: border-box;
        }

        .ic-item-card {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          margin-bottom: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          box-sizing: border-box;
        }

        .ic-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #f8fafc;
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
        }

        .ic-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }

        .ic-range-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          margin: 10px 0 6px;
          touch-action: manipulation;
        }

        .ic-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
          cursor: pointer;
        }

        .ic-range-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
          cursor: pointer;
        }

        .ic-btn-main-action {
          width: 100%;
          padding: 13px;
          min-height: 48px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          font-weight: 700;
          font-size: 0.94rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
          touch-action: manipulation;
          transition: all 0.15s ease;
        }

        .ic-btn-main-action:active {
          transform: scale(0.99);
        }

        .ic-btn-main-action:disabled {
          cursor: default;
          opacity: 0.6;
          box-shadow: none;
        }

        /* MOBILE SPECIFIC BREAKPOINTS */
        @media (max-width: 820px) {
          .ic-container {
            border-radius: 16px;
            margin: 0;
            width: 100%;
          }

          .ic-header {
            padding: 10px 12px;
            border-radius: 16px 16px 0 0;
          }

          .ic-dropzone-wrapper {
            padding: 14px 8px;
          }

          .ic-dropzone {
            padding: 22px 12px;
            border-radius: 12px;
          }

          .ic-body-active {
            flex-direction: column !important;
            padding: 12px 10px !important;
            gap: 12px !important;
          }

          .ic-pictures-col {
            max-width: 100% !important;
            width: 100% !important;
          }

          .ic-settings-col {
            max-width: 100% !important;
            width: 100% !important;
          }

          .ic-settings-card {
            padding: 12px !important;
          }

          .ic-range-slider::-webkit-slider-thumb {
            width: 26px !important;
            height: 26px !important;
          }

          .ic-range-slider::-moz-range-thumb {
            width: 26px !important;
            height: 26px !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="ic-header">
        <div className="ic-header-left">
          <ImageDown size={19} style={{ color: '#10b981', flexShrink: 0 }} />
          <strong style={{ color: '#f8fafc', fontSize: '0.94rem' }}>
            Image Compressor
          </strong>
          <span className="ic-badge-private">
            <ShieldCheck size={12} style={{ color: '#10b981' }} />
            <span>Private • On-Device</span>
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            title="Close"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'inline-flex',
              touchAction: 'manipulation',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* STATE 1: EMPTY (DROPZONE) */}
      {items.length === 0 ? (
        <div className="ic-dropzone-wrapper">
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
              addFiles(e.dataTransfer.files);
            }}
            className={`ic-dropzone ${dragActive ? 'drag-active' : ''}`}
          >
            <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <UploadCloud size={28} style={{ color: '#10b981' }} />
            </div>
            <h3 style={{ margin: '0 0 5px', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
              Choose pictures to compress
            </h3>
            <p style={{ fontSize: '0.82rem', margin: 0, color: '#94a3b8', maxWidth: '360px', lineHeight: 1.4 }}>
              JPG, PNG, WebP, GIF, BMP, AVIF • up to {MAX_FILES} photos, {MAX_MB} MB each.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="ic-btn-pick"
            >
              <ImageIcon size={17} />
              <span>Select Photos from Device</span>
            </button>

            {errorMsg && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {errorMsg}
              </div>
            )}
          </label>
        </div>
      ) : (
        /* STATE 2: ACTIVE (PICTURES + SETTINGS) */
        <div className="ic-body-active">
          {/* PICTURES LIST */}
          <div className="ic-pictures-col">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <strong style={{ color: '#f8fafc', fontSize: '0.92rem' }}>
                  {items.length} photo{items.length > 1 ? 's' : ''}
                </strong>
                {done.length > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                    • saved {fmtSize(Math.max(0, totalBefore - totalAfter))} ({totalBefore ? Math.max(0, Math.round((1 - totalAfter / totalBefore) * 100)) : 0}%)
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    touchAction: 'manipulation',
                  }}
                >
                  <Plus size={13} /> Add more
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    touchAction: 'manipulation',
                  }}
                >
                  Clear all
                </button>
              </div>
              <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
            </div>

            {errorMsg && (
              <div
                style={{
                  marginBottom: '10px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                }}
              >
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((it) => {
                const r = it.result;
                const stale = it.status === 'done' && it.optsKey !== optsKey;
                return (
                  <div key={it.id} className="ic-item-card">
                    <img
                      src={it.thumb}
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        background: '#222',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: '#f8fafc',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {it.file.name}
                      </div>

                      {it.status === 'ready' && (
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '1px' }}>
                          {fmtSize(it.file.size)} • ready
                        </div>
                      )}
                      {it.status === 'working' && (
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                          <Loader2 size={12} className="spin-icon" style={{ color: '#10b981' }} /> Compressing…
                        </div>
                      )}
                      {it.status === 'error' && (
                        <div style={{ fontSize: '0.76rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          <AlertCircle size={12} /> {it.error}
                        </div>
                      )}
                      {it.status === 'done' && (
                        <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '1px', lineHeight: 1.3 }}>
                          {fmtSize(r.originalBytes)} → <b style={{ color: r.savedPct > 0 ? '#10b981' : '#f8fafc' }}>{fmtSize(r.bytes)}</b>
                          {r.savedPct > 0 && <span style={{ color: '#10b981', fontWeight: 600 }}> (−{r.savedPct}%)</span>}
                          {stale && <span style={{ color: '#f59e0b' }}> • re-compress</span>}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {it.status === 'done' && (
                        <button
                          type="button"
                          onClick={() => save(r.name, it.url)}
                          title="Download"
                          style={{
                            padding: '8px',
                            minWidth: '36px',
                            minHeight: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#10b981',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'manipulation',
                          }}
                        >
                          <Download size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        title="Remove"
                        disabled={it.status === 'working'}
                        style={{
                          padding: '8px',
                          minWidth: '36px',
                          minHeight: '36px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SETTINGS + IMMEDIATE COMPRESS ACTION */}
          <div className="ic-settings-col">
            <div className="ic-settings-card">
              {/* MODE TABS */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {[
                  { k: 'quality', l: 'By Quality' },
                  { k: 'target', l: 'Target Size (KB)' },
                ].map((m) => (
                  <button
                    key={m.k}
                    type="button"
                    onClick={() => setMode(m.k)}
                    style={{
                      flex: 1,
                      padding: '9px 6px',
                      minHeight: '38px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: `1.5px solid ${mode === m.k ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                      background: mode === m.k ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.02)',
                      color: mode === m.k ? '#10b981' : '#f8fafc',
                      transition: 'all 0.15s ease',
                      touchAction: 'manipulation',
                    }}
                  >
                    {m.l}
                  </button>
                ))}
              </div>

              {/* MODE CONTROLS */}
              {mode === 'quality' ? (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Quality Level
                    </span>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.86rem' }}>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="ic-range-slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${quality}%, rgba(255, 255, 255, 0.12) ${quality}%, rgba(255, 255, 255, 0.12) 100%)`,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <span>Smaller size</span>
                    <span>Best quality</span>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Target Max Size
                    </span>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.86rem' }}>{targetKB} KB</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={targetKB}
                    onChange={(e) => setTargetKB(e.target.value)}
                    className="ic-input"
                    placeholder="Enter KB"
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                    {TARGET_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTargetKB(p)}
                        style={{
                          padding: '5px 10px',
                          minHeight: '30px',
                          borderRadius: '999px',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          border: `1px solid ${Number(targetKB) === p ? '#10b981' : 'rgba(255,255,255,0.12)'}`,
                          background: Number(targetKB) === p ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)',
                          color: Number(targetKB) === p ? '#10b981' : '#cbd5e1',
                          touchAction: 'manipulation',
                        }}
                      >
                        {p >= 1000 ? p / 1000 + ' MB' : p + ' KB'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRIMARY COMPRESS BUTTON - RIGHT IN FRONT OF USER */}
              <button
                type="button"
                onClick={run}
                disabled={busy || pendingCount === 0}
                className="ic-btn-main-action"
              >
                {busy ? (
                  <>
                    <Loader2 size={17} className="spin-icon" /> Compressing…
                  </>
                ) : pendingCount === 0 ? (
                  <>
                    <CheckCircle size={17} /> All Done!
                  </>
                ) : (
                  <>
                    <Sparkles size={17} /> Compress {pendingCount} Photo{pendingCount > 1 ? 's' : ''} Now
                  </>
                )}
              </button>

              {/* DOWNLOAD ALL AS ZIP (IF MULTIPLE DONE) */}
              {done.length > 1 && (
                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={zipping}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    minHeight: '40px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    touchAction: 'manipulation',
                  }}
                >
                  {zipping ? (
                    <>
                      <Loader2 size={15} className="spin-icon" /> Creating ZIP…
                    </>
                  ) : (
                    <>
                      <Archive size={15} /> Download All ({done.length}) as ZIP
                    </>
                  )}
                </button>
              )}

              {/* ADVANCED SETTINGS TOGGLE */}
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '7px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '10px',
                  touchAction: 'manipulation',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Sliders size={13} style={{ color: '#10b981' }} /> Advanced Options (Resize, Format)
                </span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAdvanced && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Max Resolution
                    </div>
                    <CustomSelect options={SIDE_PRESETS} value={maxSide} onChange={(val) => setMaxSide(Number(val))} />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Output Format
                    </div>
                    <CustomSelect options={FORMATS} value={format} onChange={(val) => setFormat(val)} />
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
                100% Private: Processed in your browser. EXIF & metadata stripped.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
