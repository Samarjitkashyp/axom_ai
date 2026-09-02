import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  X, Type, Pen, Highlighter, PenTool, ImagePlus, Trash2, Download,
  MousePointer2, UploadCloud, Loader2, Bold, Italic, Minus, Plus,
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DISPLAY_W = 760;                 // page render width in CSS px
const COLORS = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#ffffff'];
const BG_COLORS = ['#fde047', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#111827'];

const fmtBtn = (active) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '28px', borderRadius: '7px', cursor: 'pointer',
  border: '1px solid var(--border-color)',
  background: active ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
  color: active ? '#fff' : 'var(--text-secondary)',
});

// A tiny signature pad rendered in a popup.
function SignaturePad({ onDone, onCancel }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const padW = typeof window !== 'undefined' ? Math.min(380, window.innerWidth - 56) : 340;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#111827';
    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [t.clientX - r.left, t.clientY - r.top];
    };
    const down = (e) => { drawing.current = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); };
    const move = (e) => { if (!drawing.current) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); e.preventDefault(); };
    const up = () => { drawing.current = false; };
    cv.addEventListener('mousedown', down); cv.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    cv.addEventListener('touchstart', down, { passive: false }); cv.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
    return () => {
      cv.removeEventListener('mousedown', down); cv.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
      cv.removeEventListener('touchstart', down); cv.removeEventListener('touchmove', move); window.removeEventListener('touchend', up);
    };
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '18px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <h4 style={{ margin: '0 0 10px', color: '#111827', fontSize: '1rem', fontWeight: 700 }}>Draw your signature</h4>
        <canvas ref={ref} width={padW} height={150} style={{ width: '100%', height: '150px', border: '1px dashed #94a3b8', borderRadius: '10px', background: '#fff', touchAction: 'none', display: 'block' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'flex-end' }}>
          <button onClick={() => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); }} style={btnStyle('#e5e7eb', '#111827')}>Clear</button>
          <button onClick={onCancel} style={btnStyle('#e5e7eb', '#111827')}>Cancel</button>
          <button onClick={() => onDone(ref.current.toDataURL('image/png'))} style={btnStyle('#8b5cf6', '#fff')}>Add</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg, fg) => ({ background: bg, color: fg, border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' });

export default function PdfEditor({ onClose }) {
  const [fileBytes, setFileBytes] = useState(null);   // ArrayBuffer of the original PDF
  const [pages, setPages] = useState([]);              // [{num, wPts, hPts, wPx, hPx}]
  const [elements, setElements] = useState([]);        // text & image overlays
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#111827');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const bgRefs = useRef({});    // page num -> bg canvas
  const drawRefs = useRef({});  // page num -> draw overlay canvas
  const imgInputRef = useRef(null);
  const drag = useRef(null);
  const stroke = useRef(null);
  const resize = useRef(null);

  // ---- Load a PDF ----
  const loadPdf = useCallback(async (buf) => {
    setLoading(true);
    try {
      const bytesForRender = buf.slice(0);
      const pdf = await pdfjsLib.getDocument({ data: bytesForRender }).promise;
      const meta = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp1 = page.getViewport({ scale: 1 });
        const scale = DISPLAY_W / vp1.width;
        const vp = page.getViewport({ scale });
        meta.push({ num: i, wPts: vp1.width, hPts: vp1.height, wPx: vp.width, hPx: vp.height, _page: page, _vp: vp });
      }
      setPages(meta);
      setElements([]);
      // render after DOM is ready
      setTimeout(async () => {
        for (const m of meta) {
          const cv = bgRefs.current[m.num];
          if (cv) {
            cv.width = m.wPx; cv.height = m.hPx;
            await m._page.render({ canvasContext: cv.getContext('2d'), viewport: m._vp }).promise;
          }
          const dc = drawRefs.current[m.num];
          if (dc) { dc.width = m.wPx; dc.height = m.hPx; }
        }
      }, 50);
    } catch (e) {
      alert('Could not open this PDF.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onPickFile = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) { alert('Please choose a .pdf file.'); return; }
    const buf = await f.arrayBuffer();
    setFileBytes(buf);
    loadPdf(buf);
  };

  // ---- Add elements ----
  const addText = (pageNum, x, y) => {
    const id = Date.now() + Math.random();
    setElements((els) => [...els, { id, type: 'text', page: pageNum, x, y, text: 'Text', size: 18, color, bold: false, italic: false, bg: 'transparent' }]);
    setSelectedId(id); setTool('select');
  };

  const selectedEl = elements.find((e) => e.id === selectedId) || null;
  const updateSel = (props) => setElements((els) => els.map((e) => e.id === selectedId ? { ...e, ...props } : e));
  const addImage = (dataUrl, isSig) => {
    const first = pages[0]?.num || 1;
    const id = Date.now() + Math.random();
    const w = isSig ? 180 : 220;
    setElements((els) => [...els, { id, type: 'image', page: first, x: 60, y: 60, w, h: isSig ? 70 : 160, dataUrl }]);
    setSelectedId(id); setTool('select');
  };

  // ---- Page click (place text) ----
  const onPageMouseDown = (e, m) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (tool === 'text') { addText(m.num, x, y); return; }
    if (tool === 'draw' || tool === 'highlight') {
      const dc = drawRefs.current[m.num]; const ctx = dc.getContext('2d');
      ctx.strokeStyle = tool === 'highlight' ? hexA(color, 0.35) : color;
      ctx.lineWidth = tool === 'highlight' ? 14 : 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x, y);
      stroke.current = { page: m.num };
    }
  };
  const onPageMouseMove = (e, m) => {
    if (!stroke.current || stroke.current.page !== m.num) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dc = drawRefs.current[m.num]; const ctx = dc.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
  };
  const endStroke = () => { stroke.current = null; };

  // ---- Element drag ----
  const onElemMouseDown = (e, el) => {
    e.stopPropagation();
    setSelectedId(el.id);
    if (tool !== 'select') return;
    drag.current = { id: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y };
  };
  const startResize = (e, el) => {
    e.stopPropagation(); setSelectedId(el.id);
    resize.current = { id: el.id, sx: e.clientX, ow: el.w, oh: el.h };
  };
  useEffect(() => {
    const move = (e) => {
      if (drag.current) {
        const { id, sx, sy, ox, oy } = drag.current;
        setElements((els) => els.map((el) => el.id === id ? { ...el, x: ox + (e.clientX - sx), y: oy + (e.clientY - sy) } : el));
      } else if (resize.current) {
        const { id, sx, ow, oh } = resize.current;
        const w = Math.max(30, ow + (e.clientX - sx));
        setElements((els) => els.map((el) => el.id === id ? { ...el, w, h: Math.max(20, w * oh / ow) } : el));
      }
    };
    const up = () => { drag.current = null; resize.current = null; };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  const deleteSelected = () => { if (selectedId) { setElements((els) => els.filter((e) => e.id !== selectedId)); setSelectedId(null); } };

  // ---- Export via pdf-lib ----
  const exportPdf = async () => {
    if (!fileBytes) return;
    setExporting(true);
    try {
      const doc = await PDFDocument.load(fileBytes.slice(0));
      const fonts = {
        n: await doc.embedFont(StandardFonts.Helvetica),
        b: await doc.embedFont(StandardFonts.HelveticaBold),
        i: await doc.embedFont(StandardFonts.HelveticaOblique),
        bi: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
      };
      const pickFont = (el) => el.bold && el.italic ? fonts.bi : el.bold ? fonts.b : el.italic ? fonts.i : fonts.n;
      const docPages = doc.getPages();
      for (const m of pages) {
        const page = docPages[m.num - 1];
        const S = m.wPx / m.wPts;   // px per pt
        // 1. freehand drawing overlay -> PNG covering the whole page
        const dc = drawRefs.current[m.num];
        if (dc) {
          const blank = document.createElement('canvas'); blank.width = dc.width; blank.height = dc.height;
          if (dc.toDataURL() !== blank.toDataURL()) {
            const png = await doc.embedPng(dc.toDataURL('image/png'));
            page.drawImage(png, { x: 0, y: 0, width: m.wPts, height: m.hPts });
          }
        }
        // 2. text + images
        for (const el of elements.filter((e) => e.page === m.num)) {
          if (el.type === 'text') {
            const sizePt = el.size / S;
            const f = pickFont(el);
            const txt = el.text || '';
            const xPt = el.x / S;
            const baseY = m.hPts - (el.y / S) - sizePt;
            // Background colour behind the text (like a highlight box).
            if (el.bg && el.bg !== 'transparent') {
              const wPt = f.widthOfTextAtSize(txt, sizePt);
              page.drawRectangle({
                x: xPt - 2, y: baseY - sizePt * 0.28,
                width: wPt + 4, height: sizePt * 1.28,
                color: hexToRgb(el.bg),
              });
            }
            page.drawText(txt, { x: xPt, y: baseY, size: sizePt, font: f, color: hexToRgb(el.color) });
          } else if (el.type === 'image') {
            const png = await doc.embedPng(el.dataUrl);
            page.drawImage(png, { x: el.x / S, y: m.hPts - (el.y / S) - (el.h / S), width: el.w / S, height: el.h / S });
          }
        }
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'edited.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + (e.message || e));
    } finally {
      setExporting(false);
    }
  };

  const TOOLS = [
    { k: 'select', icon: MousePointer2, label: 'Select / Move' },
    { k: 'text', icon: Type, label: 'Add Text' },
    { k: 'draw', icon: Pen, label: 'Draw' },
    { k: 'highlight', icon: Highlighter, label: 'Highlight' },
    { k: 'sign', icon: PenTool, label: 'Signature' },
    { k: 'image', icon: ImagePlus, label: 'Image' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary, #0b0b12)', zIndex: 60, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        <strong style={{ color: 'var(--text-primary)', marginRight: '8px', flexShrink: 0 }}>PDF Editor</strong>
        {pages.length > 0 && TOOLS.map((t) => (
          <button key={t.k} title={t.label}
            onClick={() => { if (t.k === 'sign') { setShowSign(true); } else if (t.k === 'image') { imgInputRef.current?.click(); } else setTool(t.k); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border-color)', background: tool === t.k ? 'var(--accent-purple, #8b5cf6)' : 'transparent', color: tool === t.k ? '#fff' : 'var(--text-secondary)', flexShrink: 0 }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
        {pages.length > 0 && (
          <div style={{ display: 'inline-flex', gap: '5px', marginLeft: '4px' }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} title="Colour"
                style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: '0 0 0 1px var(--border-color)' }} />
            ))}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {pages.length > 0 && (
          <>
            <button onClick={deleteSelected} disabled={!selectedId} title="Delete selected" style={{ ...btnStyle('transparent', 'var(--text-secondary)'), border: '1px solid var(--border-color)', opacity: selectedId ? 1 : 0.5 }}><Trash2 size={14} /></button>
            <button onClick={exportPdf} disabled={exporting} style={{ ...btnStyle('var(--accent-purple, #8b5cf6)', '#fff'), display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {exporting ? <Loader2 size={14} className="spin-icon" /> : <Download size={14} />} Download
            </button>
          </>
        )}
        <button onClick={onClose} title="Close" style={{ ...btnStyle('transparent', 'var(--text-secondary)'), border: '1px solid var(--border-color)' }}><X size={16} /></button>
      </div>

      {/* Contextual text-formatting toolbar (Canva-style) */}
      {selectedEl && selectedEl.type === 'text' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary, rgba(255,255,255,0.02))', flexWrap: 'wrap' }}>
          <button onClick={() => updateSel({ bold: !selectedEl.bold })} title="Bold"
            style={fmtBtn(selectedEl.bold)}><Bold size={14} /></button>
          <button onClick={() => updateSel({ italic: !selectedEl.italic })} title="Italic"
            style={fmtBtn(selectedEl.italic)}><Italic size={14} /></button>
          <span style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 2px' }} />
          <button onClick={() => updateSel({ size: Math.max(8, selectedEl.size - 2) })} title="Smaller" style={fmtBtn(false)}><Minus size={14} /></button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '26px', textAlign: 'center' }}>{selectedEl.size}</span>
          <button onClick={() => updateSel({ size: Math.min(96, selectedEl.size + 2) })} title="Bigger" style={fmtBtn(false)}><Plus size={14} /></button>
          <span style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 2px' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Text</span>
          {COLORS.map((c) => (
            <button key={c} onClick={() => updateSel({ color: c })} title="Text colour"
              style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: selectedEl.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: '0 0 0 1px var(--border-color)' }} />
          ))}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>Fill</span>
          <button onClick={() => updateSel({ bg: 'transparent' })} title="No fill"
            style={{ width: 18, height: 18, borderRadius: '50%', background: 'transparent', border: selectedEl.bg === 'transparent' ? '2px solid #fff' : '2px solid var(--border-color)', cursor: 'pointer', position: 'relative', color: '#ef4444', fontSize: '12px', lineHeight: '14px' }}>⃠</button>
          {BG_COLORS.map((c) => (
            <button key={c} onClick={() => updateSel({ bg: c })} title="Background colour"
              style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: selectedEl.bg === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: '0 0 0 1px var(--border-color)' }} />
          ))}
        </div>
      )}

      <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => addImage(r.result, false); r.readAsDataURL(f); } }} />

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
        {pages.length === 0 ? (
          <label style={{ cursor: 'pointer', border: '2px dashed var(--border-color)', borderRadius: '14px', padding: '48px 60px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '8vh' }}>
            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => onPickFile(e.target.files?.[0])} />
            {loading ? <><Loader2 size={34} className="spin-icon" /><h3>Opening…</h3></>
              : <><UploadCloud size={38} /><h3 style={{ margin: '10px 0 4px' }}>Open a PDF to edit</h3><p style={{ fontSize: '0.82rem' }}>Add text, draw, highlight, images & signatures — then download.</p></>}
          </label>
        ) : pages.map((m) => (
          <div key={m.num} style={{ position: 'relative', width: m.wPx, height: m.hPx, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', background: '#fff', flexShrink: 0 }}
            onMouseDown={(e) => onPageMouseDown(e, m)} onMouseMove={(e) => onPageMouseMove(e, m)} onMouseUp={endStroke} onMouseLeave={endStroke}>
            <canvas ref={(el) => (bgRefs.current[m.num] = el)} style={{ position: 'absolute', inset: 0 }} />
            <canvas ref={(el) => (drawRefs.current[m.num] = el)} style={{ position: 'absolute', inset: 0, cursor: (tool === 'draw' || tool === 'highlight') ? 'crosshair' : (tool === 'text' ? 'text' : 'default') }} />
            {elements.filter((e) => e.page === m.num).map((el) => (
              el.type === 'text' ? (
                <input key={el.id} value={el.text}
                  onChange={(ev) => setElements((els) => els.map((x) => x.id === el.id ? { ...x, text: ev.target.value } : x))}
                  onMouseDown={(ev) => onElemMouseDown(ev, el)}
                  style={{ position: 'absolute', left: el.x, top: el.y, fontSize: el.size, color: el.color, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', border: selectedId === el.id ? '1px dashed #8b5cf6' : '1px solid transparent', background: el.bg && el.bg !== 'transparent' ? el.bg : 'transparent', outline: 'none', fontFamily: 'Helvetica, Arial, sans-serif', minWidth: '40px', cursor: 'move', padding: '0 2px' }} />
              ) : (
                <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h, outline: selectedId === el.id ? '1px dashed #8b5cf6' : 'none' }}>
                  <img src={el.dataUrl} alt="" draggable={false}
                    onMouseDown={(ev) => onElemMouseDown(ev, el)}
                    style={{ width: '100%', height: '100%', cursor: 'move', display: 'block' }} />
                  {selectedId === el.id && (
                    <div onMouseDown={(ev) => startResize(ev, el)} title="Drag to resize"
                      style={{ position: 'absolute', right: -7, bottom: -7, width: 14, height: 14, background: '#8b5cf6', borderRadius: '50%', cursor: 'nwse-resize', border: '2px solid #fff' }} />
                  )}
                </div>
              )
            ))}
          </div>
        ))}
      </div>

      {showSign && <SignaturePad onCancel={() => setShowSign(false)} onDone={(url) => { setShowSign(false); addImage(url, true); }} />}
    </div>
  );
}

// helpers
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
function hexA(hex, a) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
