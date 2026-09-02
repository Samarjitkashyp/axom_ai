import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { X, UploadCloud, Loader2, Download, ScanSearch, Eraser, Wand2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
const DISPLAY_W = 720;

export default function WatermarkRemover({ onClose }) {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);           // {num, wPx, hPx}
  const [regions, setRegions] = useState({});        // { num: [[x0,y0,x1,y1] normalised] }
  const [mode, setMode] = useState('inpaint');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);      // {found, text}
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const bgRefs = useRef({});
  const draw = useRef(null);                          // {num, x0, y0, x1, y1}
  const [drawBox, setDrawBox] = useState(null);
  const inputRef = useRef(null);

  const loadPdf = useCallback(async (buf) => {
    setLoading(true);
    try {
      const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
      const meta = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const v1 = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: DISPLAY_W / v1.width });
        meta.push({ num: i, wPx: vp.width, hPx: vp.height, _page: page, _vp: vp });
      }
      setPages(meta);
      setTimeout(async () => {
        for (const m of meta) {
          const cv = bgRefs.current[m.num];
          if (cv) { cv.width = m.wPx; cv.height = m.hPx; await m._page.render({ canvasContext: cv.getContext('2d'), viewport: m._vp }).promise; }
        }
      }, 40);
    } catch (e) { setErrorMsg('Could not open this PDF.'); }
    finally { setLoading(false); }
  }, []);

  const pickFile = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) { setErrorMsg('Please choose a .pdf file.'); return; }
    if (f.size > 40 * 1024 * 1024) { setErrorMsg('File exceeds the 40 MB limit.'); return; }
    setErrorMsg(null); setResult(null); setRegions({}); setScanMsg(null);
    setFile(f);
    const buf = await f.arrayBuffer();
    await loadPdf(buf);
    scan(f);   // auto-scan on load
  };

  const scan = async (f) => {
    setScanning(true); setScanMsg(null);
    const fd = new FormData(); fd.append('file', f);
    try {
      const r = await fetch('/api/detect-watermark/', { method: 'POST', headers: { 'X-CSRFToken': getCsrfToken() || '' }, body: fd });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || 'Scan failed');
      if (d.found) {
        setScanMsg({ found: true, text: 'Possible watermark detected: ' + d.reasons.join('; ') + '. Highlighted below — adjust boxes if needed, then Remove.' });
        if (d.suspects && Object.keys(d.suspects).length) setRegions(d.suspects);
      } else {
        setScanMsg({ found: false, text: 'No watermark found in this PDF. If you can still see one, draw a box over it manually and remove.' });
      }
    } catch (e) { setScanMsg({ found: false, text: 'Scan error: ' + e.message }); }
    finally { setScanning(false); }
  };

  // ---- box drawing ----
  const onDown = (e, m) => {
    const r = e.currentTarget.getBoundingClientRect();
    draw.current = { num: m.num, x0: e.clientX - r.left, y0: e.clientY - r.top, x1: e.clientX - r.left, y1: e.clientY - r.top };
    setDrawBox({ ...draw.current });
  };
  const onMove = (e) => {
    if (!draw.current) return;
    const cont = document.getElementById('wm-page-' + draw.current.num);
    const r = cont.getBoundingClientRect();
    draw.current.x1 = Math.max(0, Math.min(r.width, e.clientX - r.left));
    draw.current.y1 = Math.max(0, Math.min(r.height, e.clientY - r.top));
    setDrawBox({ ...draw.current });
  };
  const onUp = () => {
    const d = draw.current; draw.current = null; setDrawBox(null);
    if (!d) return;
    const m = pages.find((p) => p.num === d.num); if (!m) return;
    const x0 = Math.min(d.x0, d.x1), y0 = Math.min(d.y0, d.y1), x1 = Math.max(d.x0, d.x1), y1 = Math.max(d.y0, d.y1);
    if (x1 - x0 < 6 || y1 - y0 < 6) return;   // ignore tiny
    const box = [x0 / m.wPx, y0 / m.hPx, x1 / m.wPx, y1 / m.hPx];
    setRegions((rs) => ({ ...rs, [d.num]: [...(rs[d.num] || []), box] }));
  };
  useEffect(() => {
    const up = () => onUp();
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  });

  const removeBox = (num, idx) => setRegions((rs) => ({ ...rs, [num]: (rs[num] || []).filter((_, i) => i !== idx) }));
  const boxCount = Object.values(regions).reduce((a, b) => a + b.length, 0);

  const runRemove = async () => {
    if (!file || boxCount === 0) { setErrorMsg('Draw a box over the watermark first.'); return; }
    setProcessing(true); setErrorMsg(null); setResult(null);
    // regions keyed by 0-based page index for the server
    const server = {};
    Object.entries(regions).forEach(([num, boxes]) => { server[String(num - 1)] = boxes; });
    const fd = new FormData();
    fd.append('file', file); fd.append('mode', mode); fd.append('regions', JSON.stringify(server));
    try {
      const r = await fetch('/api/remove-watermark/', { method: 'POST', headers: { 'X-CSRFToken': getCsrfToken() || '' }, body: fd });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.error || 'Removal failed');
      setResult(d);
    } catch (e) { setErrorMsg(e.message); }
    finally { setProcessing(false); }
  };

  const download = async () => {
    try {
      const r = await fetch(result.download_url); const blob = await r.blob();
      const u = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = u; a.download = result.output_name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    } catch (e) { window.open(result.download_url, '_blank'); }
  };

  return (
    <div className="wm-overlay">
      {/* Top bar */}
      <div className="wm-topbar">
        <div className="wm-title-area">
          <span className="wm-badge"><Eraser size={18} /></span>
          <div><h3 className="wm-title">Remove Watermark</h3><p className="wm-sub">Scan, box any watermark, and erase it</p></div>
        </div>
        {file && (
          <div className="wm-tools">
            <button className={`wm-modebtn ${mode === 'inpaint' ? 'on' : ''}`} onClick={() => setMode('inpaint')} title="Content-aware fill (reconstructs background)"><Wand2 size={14} /> Smart remove</button>
            <button className={`wm-modebtn ${mode === 'white' ? 'on' : ''}`} onClick={() => setMode('white')} title="Cover with white"><Eraser size={14} /> White erase</button>
            <button className="wm-modebtn" onClick={() => scan(file)} disabled={scanning}>{scanning ? <Loader2 size={14} className="spin-icon" /> : <ScanSearch size={14} />} Scan</button>
            <button className="wm-run" onClick={runRemove} disabled={processing || boxCount === 0}>
              {processing ? <><Loader2 size={14} className="spin-icon" /> Removing…</> : <>Remove ({boxCount})</>}
            </button>
          </div>
        )}
        <button className="wm-close" onClick={onClose}><X size={18} /></button>
      </div>

      <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files?.[0])} />

      {!file ? (
        <div className="wm-uploadwrap">
          <div className={`wm-dropzone ${dragActive ? 'active' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]); }}>
            {loading ? <><Loader2 size={36} className="spin-icon" /><h3>Opening…</h3></>
              : <><UploadCloud size={40} /><h3>Open a PDF to remove watermark</h3><p>It's scanned automatically — then box any watermark and Remove.</p><span className="wm-browse">Browse File</span></>}
          </div>
        </div>
      ) : (
        <>
          {scanMsg && (
            <div className={`wm-scanbar ${scanMsg.found ? 'warn' : 'ok'}`}>
              {scanMsg.found ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {scanMsg.text}
            </div>
          )}
          {errorMsg && <div className="wm-scanbar err"><AlertCircle size={15} /> {errorMsg}</div>}

          {result ? (
            <div className="wm-result">
              <CheckCircle size={40} style={{ color: '#22c55e' }} />
              <h3>Watermark removed!</h3>
              <p>{result.output_name} · {result.file_size}</p>
              <button className="wm-run" onClick={download}><Download size={16} /> Download</button>
              <button className="wm-modebtn" onClick={() => { setResult(null); }}>Back to editing</button>
            </div>
          ) : (
            <div className="wm-canvas-area">
              {pages.map((m) => (
                <div key={m.num} id={'wm-page-' + m.num} className="wm-page" style={{ width: m.wPx, height: m.hPx }}
                  onMouseDown={(e) => onDown(e, m)} onMouseMove={onMove}>
                  <canvas ref={(el) => (bgRefs.current[m.num] = el)} style={{ position: 'absolute', inset: 0 }} />
                  {(regions[m.num] || []).map((b, i) => (
                    <div key={i} className="wm-box" style={{ left: b[0] * m.wPx, top: b[1] * m.hPx, width: (b[2] - b[0]) * m.wPx, height: (b[3] - b[1]) * m.hPx }}>
                      <button className="wm-box-x" onClick={(e) => { e.stopPropagation(); removeBox(m.num, i); }}><Trash2 size={11} /></button>
                    </div>
                  ))}
                  {drawBox && drawBox.num === m.num && (
                    <div className="wm-box drawing" style={{ left: Math.min(drawBox.x0, drawBox.x1), top: Math.min(drawBox.y0, drawBox.y1), width: Math.abs(drawBox.x1 - drawBox.x0), height: Math.abs(drawBox.y1 - drawBox.y0) }} />
                  )}
                </div>
              ))}
              <p className="wm-hint">Tip: click-drag a box over each watermark. Use <b>Smart remove</b> for watermarks over images/text, <b>White erase</b> for a plain white cover.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
