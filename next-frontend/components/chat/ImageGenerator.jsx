'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Download,
  Copy,
  Check,
  Loader2,
  ArrowUp,
  Maximize2,
  Image as ImageIcon,
  Flame,
  Paperclip,
} from 'lucide-react';
import { getCsrfToken } from './utils/security';

const ASPECT_RATIOS = [
  { id: 'sq', label: '1:1', w: 1024, h: 1024, tag: '1:1' },
  { id: 'ls', label: '16:9', w: 1280, h: 720, tag: '16:9' },
  { id: 'pt', label: '9:16', w: 720, h: 1280, tag: '9:16' },
];

export default function ImageGenerator({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [aspectKey, setAspectKey] = useState('sq');
  const [modelKey, setModelKey] = useState('normal');

  const [messages, setMessages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [zoomImage, setZoomImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [userStatus, setUserStatus] = useState(null);

  const [refImage, setRefImage] = useState(null);
  const [refImagePreview, setRefImagePreview] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    fetch('/api/user-status/')
      .then((r) => r.json())
      .then((data) => {
        if (data) setUserStatus(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating, elapsed]);

  useEffect(() => {
    if (!generating) {
      clearInterval(timerRef.current);
      setElapsed(0);
      return;
    }
    const t0 = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(((Date.now() - t0) / 1000).toFixed(1));
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [generating]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (zoomImage) setZoomImage(null);
        else if (!generating) onClose?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [zoomImage, generating, onClose]);

  const selectedAspect = ASPECT_RATIOS.find((a) => a.id === aspectKey) || ASPECT_RATIOS[0];
  const isPro = !!userStatus?.is_premium;
  const remaining = userStatus?.remaining_today ?? 5;

  const handleTextareaInput = (e) => {
    setPrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a PNG, JPEG, WebP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB.');
      return;
    }
    setRefImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setRefImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearRefImage = () => {
    setRefImage(null);
    setRefImagePreview(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) return;
    setRefImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setRefImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (targetPrompt) => {
    const query = (targetPrompt || prompt).trim();
    if (!query || generating) return;

    const userMsgId = `u-${Date.now()}`;
    const assistantMsgId = `a-${Date.now()}`;

    const currentRefImage = refImage;
    const currentRefPreview = refImagePreview;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, type: 'user', text: query, refImagePreview: currentRefPreview },
      { id: assistantMsgId, type: 'assistant', loading: true, prompt: query },
    ]);

    setPrompt('');
    clearRefImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setGenerating(true);

    try {
      const styledPrompt = query.slice(0, 1000);
      let res;

      if (currentRefImage) {
        const formData = new FormData();
        formData.append('prompt', styledPrompt);
        formData.append('quality', modelKey);
        formData.append('width', selectedAspect.w);
        formData.append('height', selectedAspect.h);
        formData.append('image', currentRefImage);

        res = await fetch('/api/generate-image/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCsrfToken() || '' },
          body: formData,
        });
      } else {
        const body = {
          prompt: styledPrompt,
          model: modelKey,
          quality: modelKey,
          width: selectedAspect.w,
          height: selectedAspect.h,
        };

        res = await fetch('/api/generate-image/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken() || '',
          },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                loading: false,
                result: {
                  ...data,
                  prompt: query,
                  used_prompt: data.used_prompt || styledPrompt,
                  model_name:
                    data.model_id ||
                    (data.engine === 'gemini-vertex' || data.engine === 'gemini'
                      ? data.quality === 'extreme'
                        ? 'Gemini 3 Pro Image'
                        : 'Gemini 2.5 Flash Image'
                      : data.engine === 'cloudflare'
                      ? data.quality === 'extreme'
                        ? 'SDXL Turbo (fallback)'
                        : 'FLUX.1 Schnell (fallback)'
                      : data.engine === 'pollinations'
                      ? 'Pollinations (fallback)'
                      : 'Gemini'),
                  width: selectedAspect.w,
                  height: selectedAspect.h,
                  aspectLabel: selectedAspect.label,
                },
              }
            : msg
        )
      );

      if (typeof data.used_today === 'number') {
        setUserStatus((prev) =>
          prev
            ? { ...prev, used_today: data.used_today, remaining_today: data.remaining_today }
            : null
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, loading: false, error: err.message || 'Generation failed.' }
            : msg
        )
      );
    } finally {
      setGenerating(false);
      textareaRef.current?.focus();
    }
  };

  const handleDownload = (item) => {
    if (!item?.image) return;
    const a = document.createElement('a');
    a.href = item.image;
    const cleanName =
      (item.prompt || 'axom-ai-art')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40) || 'axom-artwork';
    a.download = `${cleanName}-${item.width}x${item.height}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyPrompt = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#0f0f14',
        color: '#e4e4e7',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        overflow: 'hidden',
      }}
    >
      {/* TOP BAR — clean Gemini style */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(15,15,20,0.97)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Image Generation</span>

          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', padding: 2, borderRadius: 10, marginLeft: 12 }}>
            <button
              type="button"
              onClick={() => setModelKey('normal')}
              style={{
                padding: '5px 14px',
                borderRadius: 8,
                border: 'none',
                background: modelKey === 'normal' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: modelKey === 'normal' ? '#fff' : '#71717a',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setModelKey('extreme')}
              style={{
                padding: '5px 14px',
                borderRadius: 8,
                border: 'none',
                background: modelKey === 'extreme' ? 'rgba(167,139,250,0.2)' : 'transparent',
                color: modelKey === 'extreme' ? '#c4b5fd' : '#71717a',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Extreme
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isPro ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 14,
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.3)',
                color: '#c4b5fd',
              }}
            >
              <Flame size={11} /> PRO
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#a1a1aa',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: remaining <= 1 ? '#ef4444' : '#22c55e',
                }}
              />
              {remaining}/5 today
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            title="Close (Esc)"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#71717a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* CONVERSATION AREA */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '28px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 720, width: '100%', display: 'flex', flexDirection: 'column', gap: 24, margin: 'auto 0' }}>
          {/* Empty State */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 8px 32px rgba(167,139,250,0.3)',
                  marginBottom: 20,
                }}
              >
                <ImageIcon size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
                Create anything you imagine
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#71717a', margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
                Describe what you want to create or upload an image to edit it. Supports English, Hindi, and Assamese.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            if (msg.type === 'user') {
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 18px',
                      borderRadius: '20px 20px 4px 20px',
                      background: 'rgba(167,139,250,0.12)',
                      border: '1px solid rgba(167,139,250,0.25)',
                      color: '#e4e4e7',
                      fontSize: '0.92rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.refImagePreview && (
                      <div style={{ marginBottom: 8 }}>
                        <img
                          src={msg.refImagePreview}
                          alt="Reference"
                          style={{ maxWidth: 120, maxHeight: 120, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  width: '100%',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                >
                  <Sparkles size={14} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {msg.loading ? (
                    <div
                      style={{
                        padding: '20px 18px',
                        borderRadius: 16,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(167,139,250,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <Loader2 size={22} className="animate-spin" style={{ color: '#a78bfa', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e4e4e7' }}>
                          Creating your image... ({elapsed}s)
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#71717a', marginTop: 2 }}>
                          {modelKey === 'extreme' ? 'Extreme quality' : 'Normal quality'}
                        </div>
                      </div>
                    </div>
                  ) : msg.error ? (
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: 14,
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#fca5a5',
                        fontSize: '0.88rem',
                      }}
                    >
                      <div>{msg.error}</div>
                      {msg.error.toLowerCase().includes('free images') && (
                        <a
                          href="/subscription/"
                          style={{
                            display: 'inline-block',
                            marginTop: 8,
                            color: '#a78bfa',
                            fontWeight: 700,
                            textDecoration: 'underline',
                          }}
                        >
                          Upgrade to Pro Plan
                        </a>
                      )}
                    </div>
                  ) : msg.result ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxWidth: '100%',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          borderRadius: 16,
                          overflow: 'hidden',
                          background: '#000',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setZoomImage(msg.result.image)}
                      >
                        <img
                          src={msg.result.image}
                          alt={msg.result.prompt}
                          style={{
                            display: 'block',
                            width: '100%',
                            maxHeight: 520,
                            objectFit: 'contain',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            opacity: 0.7,
                          }}
                        >
                          <Maximize2 size={13} />
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8,
                          padding: '2px 0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#71717a' }}>
                          <span style={{ color: '#a78bfa', fontWeight: 600 }}>
                            {msg.result.model_name}
                          </span>
                          <span>·</span>
                          <span>{msg.result.width}×{msg.result.height}</span>
                          <span>·</span>
                          <span>{((msg.result.ms || 0) / 1000).toFixed(1)}s</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(msg.result.used_prompt || msg.result.prompt, msg.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 8,
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#a1a1aa',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {copiedId === msg.id ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Prompt'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(msg.result)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 8,
                              background: 'rgba(167,139,250,0.15)',
                              border: '1px solid rgba(167,139,250,0.3)',
                              color: '#c4b5fd',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* BOTTOM INPUT BAR */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          width: '100%',
          padding: '10px 20px 16px',
          background: 'rgba(15,15,20,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: 720, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Aspect ratio pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {ASPECT_RATIOS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAspectKey(a.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: aspectKey === a.id ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                  border: aspectKey === a.id ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  color: aspectKey === a.id ? '#c4b5fd' : '#71717a',
                  transition: 'all 0.15s ease',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* Input card */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
            style={{
              background: 'rgba(24,25,35,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 22,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Reference image preview */}
            {refImagePreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src={refImagePreview} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={clearRefImage}
                    style={{
                      position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <X size={9} />
                  </button>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#a78bfa' }}>Edit this image with your prompt</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={generating}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: refImage ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
                  border: refImage ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: refImage ? '#a78bfa' : '#71717a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                title="Upload an image to edit"
              >
                <Paperclip size={15} />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={prompt}
                onInput={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder={refImage ? "Describe how to edit this image..." : "Describe what you want to create..."}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e4e4e7',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'none',
                  maxHeight: 120,
                  fontFamily: 'inherit',
                  padding: '4px 0',
                }}
                disabled={generating}
              />

              {/* Send button */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={generating || !prompt.trim()}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: prompt.trim() && !generating
                    ? 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)'
                    : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: prompt.trim() && !generating ? '#fff' : '#52525b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: prompt.trim() && !generating ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: prompt.trim() && !generating ? '0 2px 10px rgba(167,139,250,0.3)' : 'none',
                }}
                title="Generate"
              >
                {generating ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={16} />}
              </button>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.68rem',
              color: '#52525b',
              textAlign: 'center',
            }}
          >
            Powered by Gemini · English, Hindi &amp; Assamese supported
          </div>
        </div>
      </div>

      {/* FULLSCREEN ZOOM */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(5,5,10,0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomImage(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
          <img
            src={zoomImage}
            alt="Fullscreen zoom"
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
