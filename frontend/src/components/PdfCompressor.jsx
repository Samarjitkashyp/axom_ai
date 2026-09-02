import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { X, UploadCloud, Loader2, Download, Minimize2, CheckCircle } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const LEVELS = [
  { k: 'basic', name: 'Basic', desc: 'Light compression, best quality (≈300 dpi)' },
  { k: 'moderate', name: 'Moderate', desc: 'Good balance of size and quality (≈150 dpi)' },
  { k: 'strong', name: 'Strong', desc: 'Smallest file, lower image quality (≈72 dpi)', tag: 'Smallest' },
];

const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`;

export default function PdfCompressor({ onClose }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [origBytes, setOrigBytes] = useState(0);
  const [level, setLevel] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  const renderPreview = useCallback(async (buf) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
      const page = await pdf.getPage(1);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = Math.min(280 / vp1.width, 380 / vp1.height);
      const vp = page.getViewport({ scale });
      const cv = document.createElement('canvas');
      cv.width = vp.width; cv.height = vp.height;
      await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
      setPreviewUrl(cv.toDataURL('image/png'));
    } catch (e) { setPreviewUrl(null); }
  }, []);

  const pickFile = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) { setErrorMsg('Please choose a .pdf file.'); return; }
    if (f.size > 100 * 1024 * 1024) { setErrorMsg('File exceeds the 100 MB limit.'); return; }
    setErrorMsg(null); setResult(null); setFile(f); setOrigBytes(f.size);
    setLoading(true);
    const buf = await f.arrayBuffer();
    await renderPreview(buf);
    setLoading(false);
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true); setErrorMsg(null); setResult(null);
    const fd = new FormData();
    fd.append('op', 'compress'); fd.append('level', level); fd.append('file', file);
    try {
      const r = await fetch('/api/pdf-tool/', { method: 'POST', headers: { 'X-CSRFToken': getCsrfToken() || '' }, body: fd });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || 'Compression failed.');
      setResult(d);
    } catch (e) { setErrorMsg(e.message || 'Something went wrong.'); }
    finally { setBusy(false); }
  };

  const download = async () => {
    try {
      const r = await fetch(result.download_url); const blob = await r.blob();
      const u = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = u; a.download = result.output_name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    } catch (e) { window.open(result.download_url, '_blank'); }
  };

  const reset = () => { setFile(null); setPreviewUrl(null); setResult(null); setErrorMsg(null); if (inputRef.current) inputRef.current.value = ''; };

  const reduction = result ? Math.max(0, Math.round((1 - result.output_bytes / result.original_bytes) * 100)) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary, #0b0b12)', zIndex: 60, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <Minimize2 size={18} style={{ color: 'var(--accent-purple, #8b5cf6)' }} />
        <strong style={{ color: 'var(--text-primary)' }}>Compress PDF</strong>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} title="Close" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '7px 9px', cursor: 'pointer' }}><X size={16} /></button>
      </div>

      {!file ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <label
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]); }}
            style={{ cursor: 'pointer', border: `2px dashed ${dragActive ? 'var(--accent-purple,#8b5cf6)' : 'var(--border-color)'}`, borderRadius: '16px', padding: '54px 70px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files?.[0])} />
            {loading ? <><Loader2 size={36} className="spin-icon" /><h3>Opening…</h3></>
              : <><UploadCloud size={40} /><h3 style={{ margin: '12px 0 4px' }}>Choose a PDF to compress</h3><p style={{ fontSize: '0.84rem' }}>Drag & drop or click to browse (up to 100 MB)</p></>}
          </label>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: '24px', padding: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Preview */}
          <div style={{ textAlign: 'center' }}>
            {previewUrl
              ? <img src={previewUrl} alt="preview" style={{ maxWidth: '280px', maxHeight: '380px', borderRadius: '8px', boxShadow: '0 6px 28px rgba(0,0,0,0.45)', background: '#fff' }} />
              : <div style={{ width: 220, height: 300, background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>PDF</div>}
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtSize(origBytes)}</div>
          </div>

          {/* Options / result */}
          <div style={{ width: '320px', maxWidth: '100%' }}>
            {!result ? (
              <>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 12px' }}>Compression level</h3>
                {LEVELS.map((l) => (
                  <label key={l.k} onClick={() => setLevel(l.k)}
                    style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px', marginBottom: '8px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${level === l.k ? 'var(--accent-purple,#8b5cf6)' : 'var(--border-color)'}`, background: level === l.k ? 'rgba(139,92,246,0.08)' : 'transparent' }}>
                    <span style={{ width: 16, height: 16, marginTop: '2px', borderRadius: '50%', border: `4px solid ${level === l.k ? 'var(--accent-purple,#8b5cf6)' : 'var(--border-color)'}`, flexShrink: 0 }} />
                    <span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{l.name}{l.tag && <span style={{ fontSize: '0.68rem', color: '#16a34a', marginLeft: '6px', fontWeight: 700 }}>{l.tag}</span>}</span>
                      <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{l.desc}</span>
                    </span>
                  </label>
                ))}
                {errorMsg && <div className="converter-error-box" style={{ marginTop: '8px' }}>{errorMsg}</div>}
                <button onClick={compress} disabled={busy}
                  style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--accent-purple, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: busy ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {busy ? <><Loader2 size={16} className="spin-icon" /> Compressing…</> : <>Compress PDF</>}
                </button>
                <button onClick={reset} style={{ width: '100%', marginTop: '8px', padding: '9px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Choose another file</button>
              </>
            ) : (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle size={22} style={{ color: '#16a34a' }} />
                  <strong style={{ color: 'var(--text-primary)' }}>Compressed!</strong>
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div>Original: <b>{fmtSize(result.original_bytes)}</b></div>
                  <div>New size: <b style={{ color: '#16a34a' }}>{fmtSize(result.output_bytes)}</b></div>
                  <div>Reduced by: <b style={{ color: '#16a34a' }}>{reduction}%</b></div>
                </div>
                {reduction === 0 && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>This PDF was already well-optimised, so little could be saved.</div>}
                <button onClick={download} style={{ width: '100%', marginTop: '14px', padding: '11px', borderRadius: '10px', border: 'none', background: 'var(--accent-purple, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Download size={16} /> Download
                </button>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => setResult(null)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Try another level</button>
                  <button onClick={reset} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>New file</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
