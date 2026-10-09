'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Loader2, Download, ImageDown, CheckCircle, AlertCircle, Trash2, ShieldCheck, Archive } from 'lucide-react';
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
  { v: 'auto', l: 'Auto (best)' },
  { v: 'jpeg', l: 'JPG' },
  { v: 'webp', l: 'WebP' },
  { v: 'png', l: 'PNG' },
];

const field = { width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary, transparent)', color: 'var(--text-primary)', fontSize: '0.86rem' };
const label = { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '14px 0 6px', textTransform: 'uppercase', letterSpacing: '0.03em' };

let seq = 0;

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
  const inputRef = useRef(null);
  const urlsRef = useRef(new Set());

  const track = (blob) => { const u = URL.createObjectURL(blob); urlsRef.current.add(u); return u; };
  const untrack = (u) => { if (u && urlsRef.current.has(u)) { URL.revokeObjectURL(u); urlsRef.current.delete(u); } };
  useEffect(() => () => { urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); urlsRef.current.clear(); }, []);

  const opts = { mode, quality: quality / 100, targetKB: Math.max(1, Number(targetKB) || 1), format, maxSide: Number(maxSide) || 0 };
  const optsKey = JSON.stringify(opts);

  const itemsRef = useRef([]);
  itemsRef.current = items;

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    const next = [...itemsRef.current];
    const problems = [];
    for (const f of incoming) {
      if (!ALLOWED.includes(f.type)) { problems.push(f.name + ': not a supported picture (use JPG, PNG, WebP, GIF, BMP or AVIF)'); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { problems.push(f.name + ': larger than ' + MAX_MB + ' MB'); continue; }
      if (next.some((i) => i.file.name === f.name && i.file.size === f.size && i.file.lastModified === f.lastModified)) continue;
      if (next.length >= MAX_FILES) { problems.push('Only ' + MAX_FILES + ' pictures at a time'); break; }
      next.push({ id: ++seq, file: f, thumb: track(f), status: 'ready', result: null, url: null, error: null, optsKey: null });
    }
    setItems(next);
    setErrorMsg(problems.length ? problems.slice(0, 3).join(' • ') : null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeItem = (id) => {
    const it = itemsRef.current.find((i) => i.id === id);
    if (it) { untrack(it.thumb); untrack(it.url); }
    setItems((cur) => cur.filter((i) => i.id !== id));
  };

  const clearAll = () => { items.forEach((it) => { untrack(it.thumb); untrack(it.url); }); setItems([]); setErrorMsg(null); };

  const patch = (id, p) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const run = async () => {
    setBusy(true); setErrorMsg(null);
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

  const save = (name, href) => { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };

  const downloadZip = async () => {
    setZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const used = new Set();
      for (const it of items) {
        if (it.status !== 'done') continue;
        let name = it.result.name; let n = 1;
        while (used.has(name)) { n += 1; name = it.result.name.replace(/(\.[^.]+)$/, '-' + n + '$1'); }
        used.add(name);
        zip.file(name, it.result.blob);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const u = URL.createObjectURL(blob);
      save('compressed-images.zip', u);
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    } catch (e) { setErrorMsg('Could not create the ZIP file.'); }
    setZipping(false);
  };

  const done = items.filter((i) => i.status === 'done');
  const totalBefore = done.reduce((s, i) => s + i.result.originalBytes, 0);
  const totalAfter = done.reduce((s, i) => s + i.result.bytes, 0);
  const pendingCount = items.filter((i) => i.status !== 'done' || i.optsKey !== optsKey).length;

  return (
    <div style={{ width: '100%', maxWidth: '1060px', margin: '0 auto', background: 'var(--bg-primary, #0b0b12)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '440px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <ImageDown size={18} style={{ color: 'var(--accent-purple, #10b981)' }} />
        <strong style={{ color: 'var(--text-primary)' }}>Image Compressor</strong>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={13} /> Pictures stay on your device</span>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} title="Close" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', display: 'inline-flex' }}><X size={16} /></button>
      </div>

      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px', minHeight: '340px' }}>
          <label
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
            style={{ cursor: 'pointer', border: `2px dashed ${dragActive ? 'var(--accent-purple,#10b981)' : 'var(--border-color)'}`, borderRadius: '16px', padding: '54px 40px', textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '520px', width: '100%' }}>
            <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
            <UploadCloud size={40} />
            <h3 style={{ margin: '12px 0 4px', color: 'var(--text-primary)' }}>Choose pictures to compress</h3>
            <p style={{ fontSize: '0.84rem', margin: 0 }}>Drag & drop or click to browse. JPG, PNG, WebP, GIF, BMP, AVIF • up to {MAX_FILES} pictures, {MAX_MB} MB each.</p>
            {errorMsg && <div className="converter-error-box" style={{ marginTop: '14px', textAlign: 'left' }}>{errorMsg}</div>}
          </label>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', gap: '22px', padding: '22px', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
          {/* pictures */}
          <div style={{ flex: '1 1 420px', maxWidth: '640px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{items.length} picture{items.length > 1 ? 's' : ''}</strong>
              {done.length > 0 && <span style={{ fontSize: '0.82rem', color: '#16a34a' }}>• saved {fmtSize(Math.max(0, totalBefore - totalAfter))} ({totalBefore ? Math.max(0, Math.round((1 - totalAfter / totalBefore) * 100)) : 0}%)</span>}
              <div style={{ flex: 1 }} />
              <button onClick={() => inputRef.current?.click()} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add more</button>
              <button onClick={clearAll} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>Clear all</button>
              <input ref={inputRef} type="file" accept={ACCEPT} multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />
            </div>
            {errorMsg && <div className="converter-error-box" style={{ marginBottom: '10px' }}>{errorMsg}</div>}
            {items.map((it) => {
              const r = it.result;
              const stale = it.status === 'done' && it.optsKey !== optsKey;
              return (
                <div key={it.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', marginBottom: '8px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <img src={it.thumb} alt="" style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: '8px', background: '#222', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.file.name}</div>
                    {it.status === 'ready' && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtSize(it.file.size)} • ready</div>}
                    {it.status === 'working' && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Loader2 size={13} className="spin-icon" /> Compressing…</div>}
                    {it.status === 'error' && <div style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertCircle size={13} /> {it.error}</div>}
                    {it.status === 'done' && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {fmtSize(r.originalBytes)} → <b style={{ color: r.savedPct > 0 ? '#16a34a' : 'var(--text-primary)' }}>{fmtSize(r.bytes)}</b>
                        {r.savedPct > 0 && <span style={{ color: '#16a34a' }}> (−{r.savedPct}%)</span>}
                        <span style={{ color: 'var(--text-muted)' }}> • {r.width}×{r.height}</span>
                        {stale && <span style={{ color: '#f59e0b' }}> • settings changed, compress again</span>}
                        {r.notes.length > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{r.notes.join(' ')}</div>}
                      </div>
                    )}
                  </div>
                  {it.status === 'done' && (
                    <button onClick={() => save(r.name, it.url)} title="Download" style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'var(--accent-purple, #10b981)', color: '#fff', cursor: 'pointer', display: 'inline-flex' }}><Download size={15} /></button>
                  )}
                  <button onClick={() => removeItem(it.id)} title="Remove" disabled={it.status === 'working'} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex' }}><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>

          {/* settings */}
          <div style={{ width: '320px', maxWidth: '100%', flexShrink: 0 }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[{ k: 'quality', l: 'By quality' }, { k: 'target', l: 'To a target size' }].map((m) => (
                  <button key={m.k} onClick={() => setMode(m.k)} style={{ flex: 1, padding: '8px', borderRadius: '9px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, border: `1.5px solid ${mode === m.k ? 'var(--accent-purple,#10b981)' : 'var(--border-color)'}`, background: mode === m.k ? 'rgba(16,185,129,0.1)' : 'transparent', color: 'var(--text-primary)' }}>{m.l}</button>
                ))}
              </div>

              {mode === 'quality' ? (
                <>
                  <span style={label}>Quality: {quality}%</span>
                  <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>Smaller file</span><span>Better picture</span></div>
                </>
              ) : (
                <>
                  <span style={label}>Each picture at most (KB)</span>
                  <input type="number" min="1" value={targetKB} onChange={(e) => setTargetKB(e.target.value)} style={field} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {TARGET_PRESETS.map((p) => (
                      <button key={p} onClick={() => setTargetKB(p)} style={{ padding: '4px 9px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.74rem', border: `1px solid ${Number(targetKB) === p ? 'var(--accent-purple,#10b981)' : 'var(--border-color)'}`, background: Number(targetKB) === p ? 'rgba(16,185,129,0.12)' : 'transparent', color: 'var(--text-secondary)' }}>{p >= 1000 ? p / 1000 + ' MB' : p + ' KB'}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>Good for forms and portals that ask for “photo under 50 KB”. If needed the picture is also made a little smaller.</div>
                </>
              )}

              <span style={label}>Longest side</span>
              <select value={maxSide} onChange={(e) => setMaxSide(Number(e.target.value))} style={field}>
                {SIDE_PRESETS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>

              <span style={label}>Save as</span>
              <select value={format} onChange={(e) => setFormat(e.target.value)} style={field}>
                {FORMATS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
              </select>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>Auto keeps JPG as JPG, uses WebP for transparent pictures, and JPG for the rest.</div>

              <button onClick={run} disabled={busy || pendingCount === 0}
                style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--accent-purple, #10b981)', color: '#fff', fontWeight: 700, cursor: busy || pendingCount === 0 ? 'default' : 'pointer', opacity: busy || pendingCount === 0 ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {busy ? <><Loader2 size={16} className="spin-icon" /> Compressing…</> : pendingCount === 0 ? <><CheckCircle size={16} /> All done</> : <>Compress {pendingCount} picture{pendingCount > 1 ? 's' : ''}</>}
              </button>
              {done.length > 1 && (
                <button onClick={downloadZip} disabled={zipping}
                  style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {zipping ? <><Loader2 size={15} className="spin-icon" /> Making ZIP…</> : <><Archive size={15} /> Download all ({done.length}) as ZIP</>}
                </button>
              )}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5 }}>Private: nothing is uploaded. Location and camera details (EXIF) are removed from the compressed copy.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
