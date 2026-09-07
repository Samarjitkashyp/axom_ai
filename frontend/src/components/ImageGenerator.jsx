import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Loader2, Download, ImagePlus, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

// Only Gemini now — FLUX is retired. The dropdown is gone from the UI; we
// still send a model key so old cached clients don't 400.
const MODELS = [
  { k: 'gemini', name: 'Google Gemini · Nano Banana', desc: 'Google Gemini 2.5 Flash Image · ~5-10 s' },
];

const SIZES = [
  { k: 'sq',  label: 'Square 1024 × 1024', w: 1024, h: 1024 },
  { k: 'ls',  label: 'Landscape 1024 × 768', w: 1024, h: 768 },
  { k: 'pt',  label: 'Portrait 768 × 1024', w: 768, h: 1024 },
  { k: 'wd',  label: 'Wide 1280 × 720',  w: 1280, h: 720 },
];

const MAX_PROMPT = 1000;
const MOBILE_BREAK = 820;

// Match the app's other pages: switch to a mobile layout at ≤ 820 px.
function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAK : false
  );
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= MOBILE_BREAK);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return mobile;
}

export default function ImageGenerator({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [modelKey, setModelKey] = useState('gemini');
  const [sizeKey, setSizeKey] = useState('sq');
  const [negative, setNegative] = useState('');
  const [seed, setSeed] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);   // { image, ms, width, height, model }
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const promptRef = useRef(null);
  const previewRef = useRef(null);
  const timerRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => { if (!isMobile) promptRef.current?.focus(); }, [isMobile]);

  // Live-elapsed counter while generating
  useEffect(() => {
    if (!busy) { clearInterval(timerRef.current); setElapsed(0); return; }
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(((Date.now() - t0) / 1000).toFixed(1)), 100);
    return () => clearInterval(timerRef.current);
  }, [busy]);

  // Esc to close (physical keyboard only)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  // On mobile, scroll the result into view as soon as it appears so the user
  // doesn't have to scroll down to find it.
  useEffect(() => {
    if (isMobile && result?.image && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isMobile]);

  const size = SIZES.find((s) => s.k === sizeKey) || SIZES[0];
  const canGenerate = prompt.trim().length > 0 && !busy;

  const generate = useCallback(async () => {
    if (!canGenerate) return;
    setBusy(true); setErrorMsg(null); setResult(null);
    try {
      const seedNum = seed.trim() ? Number(seed.trim()) : undefined;
      const body = {
        prompt: prompt.trim(),
        model: modelKey,
        width: size.w,
        height: size.h,
      };
      if (negative.trim()) body.negative_prompt = negative.trim();
      if (Number.isFinite(seedNum)) body.seed = seedNum;

      const r = await fetch('/api/generate-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || 'Image generation failed.');
      setResult(d);
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, [canGenerate, prompt, modelKey, size, negative, seed]);

  const downloadImg = () => {
    if (!result?.image) return;
    const a = document.createElement('a');
    a.href = result.image;
    const safe = prompt.trim().slice(0, 40).replace(/[^a-z0-9\-_ ]+/gi, '').trim().replace(/\s+/g, '_') || 'axom_image';
    a.download = `${safe}_${result.width}x${result.height}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const newImage = () => { setResult(null); setErrorMsg(null); promptRef.current?.focus(); };

  const S = getStyles(isMobile);

  return (
    <div style={S.overlay}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ ...S.iconBadge, color: '#ec4899', background: 'rgba(236,72,153,0.14)' }}>
            <ImagePlus size={isMobile ? 16 : 18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={S.headerTitle}>Image Generator</div>
            <div style={S.headerSub}>
              Text → image · HuggingFace FLUX
            </div>
          </div>
        </div>
        <button onClick={onClose} disabled={busy} title="Close (Esc)" style={S.closeBtn} aria-label="Close">
          <X size={isMobile ? 18 : 16} />
        </button>
      </div>

      {/* MAIN AREA */}
      <div style={S.main}>
        {/* On mobile, preview goes on top when there's a result or activity;
            otherwise a compact hint sits above so the prompt is instantly visible. */}
        {isMobile ? (
          <>
            <div ref={previewRef} style={S.previewMobile}>
              {renderPreview({ busy, result, prompt, modelKey, elapsed, isMobile, S, downloadImg, newImage })}
            </div>
            <div style={S.controlsMobile}>
              {renderControls({
                prompt, setPrompt, modelKey, setModelKey, sizeKey, setSizeKey,
                negative, setNegative, seed, setSeed,
                showAdvanced, setShowAdvanced,
                busy, errorMsg, canGenerate, generate, elapsed,
                promptRef, S,
              })}
            </div>
          </>
        ) : (
          <>
            <div style={S.controlsDesktop}>
              {renderControls({
                prompt, setPrompt, modelKey, setModelKey, sizeKey, setSizeKey,
                negative, setNegative, seed, setSeed,
                showAdvanced, setShowAdvanced,
                busy, errorMsg, canGenerate, generate, elapsed,
                promptRef, S,
              })}
            </div>
            <div style={S.previewDesktop}>
              {renderPreview({ busy, result, prompt, modelKey, elapsed, isMobile, S, downloadImg, newImage })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------- render helpers (kept as functions so both layouts stay in sync) ----------------

function renderControls({
  prompt, setPrompt, modelKey, setModelKey, sizeKey, setSizeKey,
  negative, setNegative, seed, setSeed,
  showAdvanced, setShowAdvanced,
  busy, errorMsg, canGenerate, generate, elapsed,
  promptRef, S,
}) {
  return (
    <>
      <label style={S.label}>
        Prompt
        <span style={S.counter}>{prompt.length} / {MAX_PROMPT}</span>
      </label>
      <textarea
        ref={promptRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT))}
        placeholder='Describe the image you want. e.g. "A snowy tea garden in Assam at sunrise, golden light, cinematic wide shot"'
        rows={4}
        style={S.textarea}
        disabled={busy}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate();
        }}
      />

      <label style={S.label}>Model</label>
      <div style={S.radioGroup}>
        {MODELS.map((m) => (
          <label key={m.k} style={{ ...S.radioCard, ...(modelKey === m.k ? S.radioCardActive : {}) }}>
            <input
              type="radio"
              name="model"
              checked={modelKey === m.k}
              onChange={() => setModelKey(m.k)}
              disabled={busy}
              style={{ display: 'none' }}
            />
            <div style={S.radioName}>{m.name}</div>
            <div style={S.radioDesc}>{m.desc}</div>
          </label>
        ))}
      </div>

      <label style={S.label}>Size / Aspect</label>
      <div style={S.selectWrap}>
        <select
          value={sizeKey}
          onChange={(e) => setSizeKey(e.target.value)}
          disabled={busy}
          style={S.select}
        >
          {SIZES.map((s) => <option key={s.k} value={s.k}>{s.label}</option>)}
        </select>
        <ChevronDown size={16} style={S.selectChevron} />
      </div>

      {/* Advanced */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        style={S.advToggle}
        disabled={busy}
      >
        <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
        Advanced options
      </button>
      {showAdvanced && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={S.label}>Negative prompt (what to avoid)</label>
          <textarea
            value={negative}
            onChange={(e) => setNegative(e.target.value.slice(0, 500))}
            rows={2}
            placeholder="blurry, low quality, extra fingers, watermark"
            disabled={busy}
            style={{ ...S.textarea, minHeight: 60 }}
          />
          <label style={S.label}>Seed (leave blank for random)</label>
          <input
            type="text"
            inputMode="numeric"
            value={seed}
            onChange={(e) => setSeed(e.target.value.replace(/[^0-9-]/g, '').slice(0, 12))}
            placeholder="e.g. 42"
            disabled={busy}
            style={S.input}
          />
        </div>
      )}

      {errorMsg && (
        <div style={S.error}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <button onClick={generate} disabled={!canGenerate} style={{ ...S.generateBtn, ...(canGenerate ? {} : S.generateBtnDisabled) }}>
        {busy ? (
          <>
            <Loader2 size={16} className="spin-icon" />
            <span>Generating… {elapsed}s</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Generate image</span>
          </>
        )}
      </button>
      <div style={S.hint}>
        Tip: press <kbd style={S.kbd}>Ctrl</kbd>+<kbd style={S.kbd}>Enter</kbd> to generate.
        <br />
        <b>Free tier: 2 images per user per day.</b> Powered by Google Gemini.
      </div>
    </>
  );
}

function renderPreview({ busy, result, prompt, modelKey, elapsed, isMobile, S, downloadImg, newImage }) {
  if (busy) {
    return (
      <div style={S.previewPlaceholder}>
        <Loader2 size={isMobile ? 34 : 42} className="spin-icon" />
        <div style={S.placeholderTitle}>Painting your image… ({elapsed}s)</div>
        <div style={S.placeholderSub}>
          Usually 5–10 seconds.
        </div>
      </div>
    );
  }

  if (result?.image) {
    return (
      <div style={S.resultBox}>
        <img src={result.image} alt={prompt} style={S.resultImg} />
        <div style={S.resultMeta}>
          <span>{result.width} × {result.height}</span>
          <span>·</span>
          <span>{(result.ms / 1000).toFixed(1)} s</span>
          <span>·</span>
          <span>Google Gemini</span>
        </div>
        {typeof result.remaining_today === 'number' && (
          <div
            style={{
              fontSize: 11,
              opacity: 0.75,
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            {result.remaining_today > 0
              ? `${result.remaining_today} of ${result.daily_limit} free images left for today.`
              : `You have used all ${result.daily_limit} free images for today.`}
          </div>
        )}
        <div style={S.resultActions}>
          <button onClick={downloadImg} style={S.downloadBtn}>
            <Download size={15} /> Download PNG
          </button>
          <button onClick={newImage} style={S.secondaryBtn}>
            Generate another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.previewPlaceholder}>
      <div style={{ ...S.iconBadge, width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, color: '#ec4899', background: 'rgba(236,72,153,0.14)' }}>
        <ImagePlus size={isMobile ? 24 : 30} />
      </div>
      <div style={S.placeholderTitle}>Your image will appear here</div>
      <div style={S.placeholderSub}>
        {isMobile
          ? 'Type a prompt below, tap Generate.'
          : 'Type a prompt on the left, choose a model and size, then hit Generate.'}
      </div>
    </div>
  );
}

// ---------------- styles (recomputed per layout) ----------------
function getStyles(isMobile) {
  return {
    overlay: {
      position: 'fixed', inset: 0, background: 'var(--bg-primary, #0b0b12)', zIndex: 60,
      display: 'flex', flexDirection: 'column',
      // Use dvh so the browser chrome (URL bar) can't hide our action button.
      height: '100dvh', minHeight: '100dvh',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, padding: isMobile ? '10px 12px' : '12px 16px',
      borderBottom: '1px solid var(--border-color)', flexShrink: 0,
    },
    iconBadge: {
      width: isMobile ? 30 : 34, height: isMobile ? 30 : 34, borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    headerTitle: {
      fontWeight: 700, color: 'var(--text-primary)',
      fontSize: isMobile ? '0.95rem' : '1rem',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    headerSub: {
      fontSize: isMobile ? '0.72rem' : '0.78rem', color: 'var(--text-secondary)',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    closeBtn: {
      background: 'transparent', border: '1px solid var(--border-color)',
      color: 'var(--text-secondary)', borderRadius: 8,
      padding: isMobile ? '8px 10px' : '7px 9px',
      cursor: 'pointer', flexShrink: 0,
      // Ensure a comfortable 40x40 touch target on mobile.
      minWidth: isMobile ? 40 : undefined, minHeight: isMobile ? 40 : undefined,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    main: {
      flex: 1,
      display: isMobile ? 'flex' : 'grid',
      flexDirection: isMobile ? 'column' : undefined,
      gridTemplateColumns: isMobile ? undefined : 'minmax(300px, 380px) 1fr',
      gap: isMobile ? 12 : 16,
      padding: isMobile ? 12 : 16,
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      minHeight: 0, minWidth: 0,
      boxSizing: 'border-box',
      width: '100%',
    },
    // Desktop-only wrappers
    controlsDesktop: {
      display: 'flex', flexDirection: 'column', gap: 10,
      overflowY: 'auto', padding: 4, minWidth: 0,
      boxSizing: 'border-box',
    },
    previewDesktop: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, borderRadius: 14, border: '1px dashed var(--border-color)',
      background: 'var(--bg-secondary, #14141c)', overflow: 'auto', minWidth: 0,
      boxSizing: 'border-box',
    },
    // Mobile stacked layout
    controlsMobile: {
      display: 'flex', flexDirection: 'column', gap: 10,
      minWidth: 0, width: '100%', boxSizing: 'border-box',
    },
    previewMobile: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12, borderRadius: 12, border: '1px dashed var(--border-color)',
      background: 'var(--bg-secondary, #14141c)',
      minHeight: 200,
      // Hard-constrain to viewport width so the image can never spill out
      // sideways on a narrow phone.
      width: '100%', maxWidth: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
      minWidth: 0,
    },
    // Shared form pieces
    label: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
      marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.03em',
    },
    counter: { fontSize: '0.72rem', color: 'var(--text-tertiary, #7b7b90)', fontWeight: 500, textTransform: 'none' },
    textarea: {
      width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 90,
      padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)',
      background: 'var(--bg-secondary, #14141c)', color: 'var(--text-primary)',
      fontFamily: 'inherit',
      // 16 px font on mobile prevents iOS Safari from zooming in on focus.
      fontSize: isMobile ? '16px' : '0.92rem',
      lineHeight: 1.4, outline: 'none',
    },
    input: {
      width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
      border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #14141c)',
      color: 'var(--text-primary)',
      fontSize: isMobile ? '16px' : '0.92rem',
      outline: 'none', minHeight: isMobile ? 44 : undefined,
    },
    radioGroup: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr',
      gap: 8,
    },
    radioCard: {
      display: 'block', cursor: 'pointer',
      padding: isMobile ? '12px 14px' : '10px 12px',
      borderRadius: 10,
      border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #14141c)',
      transition: 'border-color 0.15s, background 0.15s',
    },
    radioCardActive: { borderColor: '#ec4899', background: 'rgba(236,72,153,0.08)' },
    radioName: { fontWeight: 600, color: 'var(--text-primary)', fontSize: isMobile ? '0.95rem' : '0.9rem' },
    radioDesc: { fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 },
    selectWrap: { position: 'relative' },
    select: {
      width: '100%', appearance: 'none',
      padding: isMobile ? '12px 34px 12px 12px' : '10px 32px 10px 12px',
      borderRadius: 10,
      border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #14141c)',
      color: 'var(--text-primary)',
      fontSize: isMobile ? '16px' : '0.92rem',
      outline: 'none', cursor: 'pointer',
      minHeight: isMobile ? 44 : undefined,
    },
    selectChevron: {
      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      color: 'var(--text-secondary)', pointerEvents: 'none',
    },
    advToggle: {
      display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
      color: 'var(--text-secondary)', padding: '6px 0', cursor: 'pointer', fontSize: '0.85rem',
      fontWeight: 600, alignSelf: 'flex-start',
    },
    error: {
      display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10,
      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
      color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.35,
    },
    generateBtn: {
      marginTop: 6,
      padding: isMobile ? '14px 16px' : '12px 14px',
      borderRadius: 10, border: 'none', cursor: 'pointer',
      background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)', color: '#fff',
      fontWeight: 700,
      fontSize: isMobile ? '1rem' : '0.95rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', boxSizing: 'border-box',
      minHeight: isMobile ? 48 : undefined,
      // Natural flow — no sticky/absolute positioning, so it can never sit
      // on top of the preview image (a common source of "text overlapping
      // on my picture" on mobile).
    },
    generateBtnDisabled: { opacity: 0.55, cursor: 'not-allowed' },
    hint: { fontSize: '0.75rem', color: 'var(--text-tertiary, #7b7b90)', lineHeight: 1.4 },
    kbd: {
      padding: '1px 6px', borderRadius: 4, background: 'var(--bg-secondary, #14141c)',
      border: '1px solid var(--border-color)', fontSize: '0.72rem',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    previewPlaceholder: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      color: 'var(--text-secondary)', textAlign: 'center', padding: '8px',
    },
    placeholderTitle: {
      marginTop: 12, fontWeight: 600, color: 'var(--text-primary)',
      fontSize: isMobile ? '0.9rem' : '1rem',
    },
    placeholderSub: {
      marginTop: 6, fontSize: '0.82rem', color: 'var(--text-secondary)',
      maxWidth: 320, lineHeight: 1.4,
    },
    resultBox: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      maxWidth: '100%', width: '100%',
      minWidth: 0, boxSizing: 'border-box',
    },
    resultImg: {
      // Fit BOTH width and (on desktop) height to keep the image inside its
      // preview box. `display: block` kills the phantom inline-image baseline
      // gap that otherwise pushed things a few px around on mobile.
      display: 'block',
      maxWidth: '100%',
      width: 'auto',
      height: 'auto',
      maxHeight: isMobile ? 'none' : 'calc(100dvh - 260px)',
      borderRadius: 10,
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
      background: '#000',
      objectFit: 'contain',
    },
    resultMeta: {
      marginTop: 12, display: 'flex', gap: 6, fontSize: '0.82rem',
      color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap',
      justifyContent: 'center',
    },
    resultActions: {
      display: 'flex', gap: 10, marginTop: 12,
      flexWrap: 'wrap', justifyContent: 'center',
      width: isMobile ? '100%' : 'auto',
    },
    downloadBtn: {
      padding: isMobile ? '11px 16px' : '9px 14px',
      borderRadius: 9, border: 'none', cursor: 'pointer',
      background: '#ec4899', color: '#fff', fontWeight: 600,
      fontSize: isMobile ? '0.92rem' : '0.88rem',
      display: 'flex', alignItems: 'center', gap: 6,
      flex: isMobile ? '1 1 auto' : undefined,
      justifyContent: 'center',
      minHeight: isMobile ? 44 : undefined,
    },
    secondaryBtn: {
      padding: isMobile ? '11px 16px' : '9px 14px',
      borderRadius: 9, cursor: 'pointer',
      background: 'transparent', border: '1px solid var(--border-color)',
      color: 'var(--text-primary)', fontWeight: 600,
      fontSize: isMobile ? '0.92rem' : '0.88rem',
      flex: isMobile ? '1 1 auto' : undefined,
      minHeight: isMobile ? 44 : undefined,
    },
  };
}
