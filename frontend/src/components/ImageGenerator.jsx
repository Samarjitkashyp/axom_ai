import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Loader2, Download, ImagePlus, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

const MODELS = [
  { k: 'schnell', name: 'Fast (FLUX.1 schnell)', desc: 'Apache-2.0 · ~7 s · balanced quality' },
  { k: 'dev',     name: 'Better (FLUX.1 dev)',   desc: 'Higher fidelity · ~7-15 s · non-commercial' },
];

const SIZES = [
  { k: 'sq',  label: 'Square 1024 × 1024', w: 1024, h: 1024 },
  { k: 'ls',  label: 'Landscape 1024 × 768', w: 1024, h: 768 },
  { k: 'pt',  label: 'Portrait 768 × 1024', w: 768, h: 1024 },
  { k: 'wd',  label: 'Wide 1280 × 720',  w: 1280, h: 720 },
];

const MAX_PROMPT = 1000;

export default function ImageGenerator({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [modelKey, setModelKey] = useState('schnell');
  const [sizeKey, setSizeKey] = useState('sq');
  const [negative, setNegative] = useState('');
  const [seed, setSeed] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);   // { image, ms, width, height, model }
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const promptRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { promptRef.current?.focus(); }, []);

  // Live-elapsed counter while generating
  useEffect(() => {
    if (!busy) { clearInterval(timerRef.current); setElapsed(0); return; }
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(((Date.now() - t0) / 1000).toFixed(1)), 100);
    return () => clearInterval(timerRef.current);
  }, [busy]);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

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

  return (
    <div style={S.overlay}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ ...S.iconBadge, color: '#ec4899', background: 'rgba(236,72,153,0.14)' }}>
            <ImagePlus size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Image Generator</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Text → image · powered by HuggingFace FLUX
            </div>
          </div>
        </div>
        <button onClick={onClose} disabled={busy} title="Close (Esc)" style={S.closeBtn}>
          <X size={16} />
        </button>
      </div>

      {/* MAIN GRID: left = controls, right = result/preview */}
      <div style={S.main}>
        {/* LEFT — controls */}
        <div style={S.controls}>
          <label style={S.label}>
            Prompt
            <span style={S.counter}>{prompt.length} / {MAX_PROMPT}</span>
          </label>
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT))}
            placeholder='Describe the image you want. e.g. "A snowy tea garden in Assam at sunrise, golden light, cinematic wide shot"'
            rows={5}
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
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.desc}</div>
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
            Tip: press <kbd style={S.kbd}>Ctrl</kbd>+<kbd style={S.kbd}>Enter</kbd> to generate. Model runs on HF GPUs — nothing loads on this server.
          </div>
        </div>

        {/* RIGHT — result canvas */}
        <div style={S.previewArea}>
          {busy && (
            <div style={S.previewPlaceholder}>
              <Loader2 size={42} className="spin-icon" />
              <div style={{ marginTop: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Painting your image… ({elapsed}s)
              </div>
              <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {modelKey === 'schnell' ? 'Usually 5–10 seconds.' : 'FLUX.1 dev takes ~10–15 seconds.'}
              </div>
            </div>
          )}

          {!busy && result?.image && (
            <div style={S.resultBox}>
              <img
                src={result.image}
                alt={prompt}
                style={S.resultImg}
              />
              <div style={S.resultMeta}>
                <span>{result.width} × {result.height}</span>
                <span>·</span>
                <span>{(result.ms / 1000).toFixed(1)} s</span>
                <span>·</span>
                <span>{MODELS.find((m) => m.k === result.model)?.name || result.model}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button onClick={downloadImg} style={S.downloadBtn}>
                  <Download size={15} /> Download PNG
                </button>
                <button onClick={newImage} style={S.secondaryBtn}>
                  Generate another
                </button>
              </div>
            </div>
          )}

          {!busy && !result?.image && (
            <div style={S.previewPlaceholder}>
              <div style={{ ...S.iconBadge, width: 56, height: 56, color: '#ec4899', background: 'rgba(236,72,153,0.14)' }}>
                <ImagePlus size={30} />
              </div>
              <div style={{ marginTop: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Your image will appear here
              </div>
              <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 320, textAlign: 'center' }}>
                Type a prompt on the left, choose a model and size, then hit Generate.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- inline styles (matches the app's dark-first look, plays with light theme) ----
const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'var(--bg-primary, #0b0b12)', zIndex: 60,
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
  },
  iconBadge: {
    width: 34, height: 34, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtn: {
    background: 'transparent', border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer',
  },
  main: {
    flex: 1, display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr',
    gap: 16, padding: 16, overflow: 'hidden',
  },
  controls: {
    display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto',
    padding: 4, minWidth: 0,
  },
  label: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
    marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.03em',
  },
  counter: { fontSize: '0.72rem', color: 'var(--text-tertiary, #7b7b90)', fontWeight: 500, textTransform: 'none' },
  textarea: {
    width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 100,
    padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary, #14141c)', color: 'var(--text-primary)',
    fontFamily: 'inherit', fontSize: '0.92rem', lineHeight: 1.4, outline: 'none',
  },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #14141c)',
    color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none',
  },
  radioGroup: { display: 'grid', gridTemplateColumns: '1fr', gap: 8 },
  radioCard: {
    display: 'block', cursor: 'pointer', padding: '10px 12px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #14141c)',
    transition: 'border-color 0.15s, background 0.15s',
  },
  radioCardActive: { borderColor: '#ec4899', background: 'rgba(236,72,153,0.08)' },
  selectWrap: { position: 'relative' },
  select: {
    width: '100%', appearance: 'none', padding: '10px 32px 10px 12px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--bg-secondary, #14141c)',
    color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none', cursor: 'pointer',
  },
  selectChevron: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--text-secondary)', pointerEvents: 'none',
  },
  advToggle: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
    color: 'var(--text-secondary)', padding: '4px 0', cursor: 'pointer', fontSize: '0.85rem',
    fontWeight: 600, alignSelf: 'flex-start',
  },
  error: {
    display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10,
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.35,
  },
  generateBtn: {
    marginTop: 6, padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)', color: '#fff',
    fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  generateBtnDisabled: { opacity: 0.55, cursor: 'not-allowed' },
  hint: { fontSize: '0.75rem', color: 'var(--text-tertiary, #7b7b90)', lineHeight: 1.4 },
  kbd: {
    padding: '1px 6px', borderRadius: 4, background: 'var(--bg-secondary, #14141c)',
    border: '1px solid var(--border-color)', fontSize: '0.72rem',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  previewArea: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, border: '1px dashed var(--border-color)',
    background: 'var(--bg-secondary, #14141c)', overflow: 'auto', minWidth: 0,
  },
  previewPlaceholder: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)',
  },
  resultBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    maxWidth: '100%', maxHeight: '100%',
  },
  resultImg: {
    maxWidth: '100%', maxHeight: 'calc(100vh - 260px)', borderRadius: 10,
    boxShadow: '0 12px 34px rgba(0,0,0,0.35)', background: '#000',
  },
  resultMeta: {
    marginTop: 12, display: 'flex', gap: 6, fontSize: '0.82rem',
    color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap',
    justifyContent: 'center',
  },
  downloadBtn: {
    padding: '9px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
    background: '#ec4899', color: '#fff', fontWeight: 600, fontSize: '0.88rem',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  secondaryBtn: {
    padding: '9px 14px', borderRadius: 9, cursor: 'pointer',
    background: 'transparent', border: '1px solid var(--border-color)',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem',
  },
};
