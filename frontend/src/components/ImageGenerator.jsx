import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  X,
  Download,
  Copy,
  Check,
  Loader2,
  ArrowUp,
  Dices,
  RotateCcw,
  Maximize2,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Flame,
  Zap,
  Info,
} from 'lucide-react';
import { getCsrfToken } from '../utils/security';

const STARTER_PROMPTS = [
  {
    title: '🌿 Assam Tea Garden',
    prompt: 'A breathtaking tea garden in Assam at golden hour sunrise, morning mist rolling over green hills, cinematic 8k',
  },
  {
    title: '🦏 Kaziranga Rhino',
    prompt: 'Majestic Indian One-horned Rhino standing in lush Kaziranga marshland at sunset, photorealistic 8k octane render',
  },
  {
    title: '🏙️ Cyberpunk 3D City',
    prompt: 'Futuristic cyberpunk city floating in neon clouds above a wide river at midnight, ultra detailed 3d render',
  },
  {
    title: '🔮 3D Cute Character',
    prompt: 'Cute baby panda wearing astronaut helmet sitting on a floating crystal moon rock, 3d pixar animation style',
  },
];

const ASPECT_RATIOS = [
  { id: 'sq', label: '1:1 Square', w: 1024, h: 1024, tag: '1:1' },
  { id: 'ls', label: '16:9 Wide', w: 1280, h: 720, tag: '16:9' },
  { id: 'pt', label: '9:16 Portrait', w: 720, h: 1280, tag: '9:16' },
  { id: 'wd', label: '4:3 Classic', w: 1024, h: 768, tag: '4:3' },
];

const STYLE_PRESETS = [
  { id: 'none', label: 'Natural', suffix: '' },
  { id: 'cinematic', label: 'Cinematic 8K', suffix: ', cinematic lighting, 8k resolution, photorealistic masterpiece' },
  { id: 'anime', label: 'Anime 4K', suffix: ', vibrant makoto shinkai style, studio ghibli anime aesthetic, crisp lines, 4k digital art' },
  { id: 'cyberpunk', label: 'Cyberpunk', suffix: ', cyberpunk aesthetic, neon glow, futuristic night scene, octane render' },
  { id: 'oil', label: 'Oil Painting', suffix: ', classical oil painting, textured brushstrokes, artistic masterpiece' },
  { id: '3d', label: '3D Pixar', suffix: ', cute pixar 3d character style, octane render, soft ambient occlusion' },
  { id: 'photo', label: 'Photorealistic', suffix: ', hyperrealistic photograph, natural daylight, 8k' },
];

const SURPRISE_PROMPTS = [
  'A mystical tea garden in Assam surrounded by morning mist and golden sunrise light, cinematic wide shot 8k',
  'Majestic Indian One-horned Rhino standing in Kaziranga marshland at sunset, photorealistic 8k octane render',
  'Futuristic cyberpunk city floating in neon clouds above the Brahmaputra river at midnight, 3d render',
  'Ancient Indian palace courtyard with glowing lotus lanterns and reflecting pool under starry galaxy sky',
  'A wise tribal elder weaving traditional Assamese Eri silk with intricate golden patterns, dramatic portrait lighting',
  'Astronaut discovering a crystal cave with glowing bioluminescent alien flora on Mars, unreal engine 5 render',
  'Cute baby panda wearing astronaut helmet sitting on a floating moon rock eating bamboo, 3d pixar style',
  'Steampunk locomotive racing through snowy Himalayan mountain pass at dusk with glowing furnace smoke',
];

export default function ImageGenerator({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [aspectKey, setAspectKey] = useState('sq');
  const [modelKey, setModelKey] = useState('normal'); // 'normal' | 'extreme'
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [negative, setNegative] = useState('');
  const [seed, setSeed] = useState('');

  // Chat conversation messages: [{ id, type: 'user' | 'assistant', prompt, result, loading, elapsed, error }]
  const [messages, setMessages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Lightbox Zoom Modal
  const [zoomImage, setZoomImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [userStatus, setUserStatus] = useState(null);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Auto focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Fetch User Plan & Model Configuration
  useEffect(() => {
    fetch('/api/user-status/')
      .then((r) => r.json())
      .then((data) => {
        if (data) setUserStatus(data);
      })
      .catch(() => {});
  }, []);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating, elapsed]);

  // Live timer while generating
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

  // Escape to close
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

  // Auto resize textarea
  const handleTextareaInput = (e) => {
    setPrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Surprise Prompt Picker
  const handleSurprisePrompt = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      }, 0);
    }
  };

  // Send & Generate Action
  const handleGenerate = async (targetPrompt) => {
    const query = (targetPrompt || prompt).trim();
    if (!query || generating) return;

    const userMsgId = `u-${Date.now()}`;
    const assistantMsgId = `a-${Date.now()}`;

    // Append user message & assistant loading placeholder
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, type: 'user', text: query },
      { id: assistantMsgId, type: 'assistant', loading: true, prompt: query },
    ]);

    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setGenerating(true);

    try {
      const activeStyleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
      const styledPrompt = (query + (activeStyleObj?.suffix || '')).slice(0, 1000);

      const seedNum = seed.trim() ? Number(seed.trim()) : undefined;
      const body = {
        prompt: styledPrompt,
        model: modelKey,
        quality: modelKey,
        width: selectedAspect.w,
        height: selectedAspect.h,
      };
      if (negative.trim()) body.negative_prompt = negative.trim();
      if (Number.isFinite(seedNum)) body.seed = seedNum;

      const res = await fetch('/api/generate-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      // Update assistant message with completed image
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
                    data.engine === 'cloudflare'
                      ? data.quality === 'extreme'
                        ? 'SDXL Turbo'
                        : 'FLUX.1 Schnell'
                      : data.engine === 'pollinations'
                      ? 'Pollinations FLUX'
                      : 'SDXL 1.0 Base',
                  width: selectedAspect.w,
                  height: selectedAspect.h,
                  aspectLabel: selectedAspect.label,
                },
              }
            : msg
        )
      );

      // Update quota
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

  // Download Handler
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

  // Copy Prompt
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
        background: '#0d0d12',
        color: '#ececec',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        overflow: 'hidden',
      }}
    >
      {/* 1. TOP MINIMALIST CHATGPT-STYLE NAVBAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(13, 13, 18, 0.95)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Model Selector Pill (ChatGPT Style Dropdown) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            <Sparkles size={15} style={{ color: '#a855f7' }} />
            <span>
              {modelKey === 'normal'
                ? isPro
                  ? 'SDXL Turbo'
                  : 'FLUX.1 Schnell'
                : isPro
                ? 'SDXL 1.0 Base'
                : 'SDXL Turbo'}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 7px',
                borderRadius: 12,
                background: modelKey === 'extreme' ? 'rgba(168,85,247,0.2)' : 'rgba(34,197,94,0.15)',
                color: modelKey === 'extreme' ? '#c084fc' : '#4ade80',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {modelKey === 'extreme' ? 'HD' : 'Fast'}
            </span>
          </div>

          {/* Model Switch Pills */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 10 }}>
            <button
              type="button"
              onClick={() => setModelKey('normal')}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: 'none',
                background: modelKey === 'normal' ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: modelKey === 'normal' ? '#fff' : '#94a3b8',
                fontSize: '0.74rem',
                fontWeight: 700,
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
                padding: '4px 10px',
                borderRadius: 8,
                border: 'none',
                background: modelKey === 'extreme' ? 'rgba(168,85,247,0.25)' : 'transparent',
                color: modelKey === 'extreme' ? '#c084fc' : '#94a3b8',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Extreme Quality
            </button>
          </div>
        </div>

        {/* Right: Plan Status & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isPro ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 14,
                background: 'rgba(168,85,247,0.18)',
                border: '1px solid rgba(168,85,247,0.4)',
                color: '#c084fc',
              }}
            >
              <Flame size={12} /> PRO PLAN
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '4px 11px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: remaining <= 1 ? '#ef4444' : '#22c55e',
                }}
              />
              {remaining} of 5 free today
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            title="Close (Esc)"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={17} />
          </button>
        </div>
      </header>

      {/* 2. CENTER CONVERSATION & ARTWORK FEED (CHATGPT STYLE) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 24, margin: 'auto 0' }}>
          {/* Empty Starter State */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 30px rgba(168, 85, 247, 0.35)',
                  marginBottom: 16,
                }}
              >
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
                What would you like to create?
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 24px', maxWidth: 440, lineHeight: 1.5 }}>
                Type any idea or prompt below in English, Hindi, or Assamese to generate instant high-fidelity artworks.
              </p>

              {/* Starter Suggestions Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 12,
                  width: '100%',
                }}
              >
                {STARTER_PROMPTS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleGenerate(item.prompt)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {item.prompt.slice(0, 75)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Stream */}
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
                      maxWidth: '85%',
                      padding: '12px 18px',
                      borderRadius: '20px 20px 4px 20px',
                      background: 'rgba(168, 85, 247, 0.18)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      color: '#ffffff',
                      fontSize: '0.94rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }

            // Assistant Response
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  width: '100%',
                  alignItems: 'flex-start',
                }}
              >
                {/* Sparkle Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                >
                  <Sparkles size={16} />
                </div>

                {/* Content Box */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {msg.loading ? (
                    /* Generating Shimmer Card */
                    <div
                      style={{
                        padding: '24px 20px',
                        borderRadius: 18,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <Loader2 size={24} className="animate-spin" style={{ color: '#c084fc', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                          Painting your image… ({elapsed}s)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                          Synthesizing latent diffusion layers with {modelKey === 'extreme' ? 'Extreme Quality' : 'FLUX.1 Schnell'}
                        </div>
                      </div>
                    </div>
                  ) : msg.error ? (
                    /* Error Card */
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: 14,
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
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
                            color: '#c084fc',
                            fontWeight: 700,
                            textDecoration: 'underline',
                          }}
                        >
                          Upgrade to Pro Plan 🚀
                        </a>
                      )}
                    </div>
                  ) : msg.result ? (
                    /* Completed Generated Image Card (ChatGPT Style) */
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        maxWidth: '100%',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          borderRadius: 18,
                          overflow: 'hidden',
                          background: '#000000',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
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
                      </div>

                      {/* Info & Action Toolbar (Below Image) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 10,
                          padding: '4px 2px',
                        }}
                      >
                        {/* Meta Tags */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#94a3b8' }}>
                          <span style={{ color: '#c084fc', fontWeight: 700 }}>
                            {msg.result.model_name}
                          </span>
                          <span>·</span>
                          <span>{msg.result.width} × {msg.result.height}</span>
                          <span>·</span>
                          <span>{((msg.result.ms || 0) / 1000).toFixed(1)}s</span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(msg.result.used_prompt || msg.result.prompt, msg.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#cbd5e1',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            {copiedId === msg.id ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Prompt'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(msg.result)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Download size={13} />
                            <span>Download PNG</span>
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

      {/* 3. DOCKED CHATGPT-STYLE INPUT BAR AT BOTTOM (NATURAL FLOW - ZERO OVERLAP) */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          width: '100%',
          padding: '12px 20px 18px',
          background: 'rgba(13, 13, 18, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Quick Option Pills (Aspect Ratio + Styles + Surprise) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {/* Aspect Ratio Pills */}
            {ASPECT_RATIOS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAspectKey(a.id)}
                style={{
                  flexShrink: 0,
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: aspectKey === a.id ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.05)',
                  border: aspectKey === a.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                  color: aspectKey === a.id ? '#ffffff' : '#94a3b8',
                }}
              >
                {a.label}
              </button>
            ))}

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', flexShrink: 0, margin: '0 4px' }} />

            {/* Art Style Selector Dropdown Pill */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '4px 22px 4px 10px',
                  borderRadius: 14,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedStyle !== 'none' ? 'rgba(236,72,153,0.22)' : 'rgba(255,255,255,0.05)',
                  border: selectedStyle !== 'none' ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
                  color: selectedStyle !== 'none' ? '#ffffff' : '#94a3b8',
                  outline: 'none',
                }}
              >
                {STYLE_PRESETS.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: '#181926', color: '#fff' }}>
                    Style: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
            </div>

            {/* Surprise Me Pill */}
            <button
              type="button"
              onClick={handleSurprisePrompt}
              style={{
                flexShrink: 0,
                padding: '4px 10px',
                borderRadius: 14,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#c084fc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginLeft: 'auto',
              }}
            >
              <Dices size={12} />
              <span>Surprise Prompt</span>
            </button>
          </div>

          {/* ChatGPT Style Input Card */}
          <div
            style={{
              position: 'relative',
              background: 'rgba(24, 25, 38, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 24,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
              transition: 'border-color 0.2s ease',
            }}
          >
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
              placeholder="Describe what to create with AI (e.g. 'A serene Himalayan monastery at dawn')..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.94rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'none',
                maxHeight: 120,
                fontFamily: 'inherit',
                padding: '4px 0',
              }}
              disabled={generating}
            />

            {/* Send / Generate Button (ChatGPT Circular Arrow) */}
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={generating || !prompt.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: prompt.trim() && !generating
                  ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: prompt.trim() && !generating ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: prompt.trim() && !generating ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: prompt.trim() && !generating ? '0 4px 14px rgba(168,85,247,0.4)' : 'none',
              }}
              title="Generate image"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>

          <div
            style={{
              fontSize: '0.7rem',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            Powered by FLUX.1 Schnell &amp; SDXL Turbo · English, Hindi &amp; Assamese supported
          </div>
        </div>
      </div>

      {/* 4. FULLSCREEN ZOOM LIGHTBOX MODAL */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(5, 5, 10, 0.95)',
            backdropFilter: 'blur(16px)',
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
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
          <img
            src={zoomImage}
            alt="Fullscreen zoom"
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 14,
              boxShadow: '0 20px 70px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
