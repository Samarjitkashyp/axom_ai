'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Download, Type, Palette, RotateCcw, ZoomIn, ZoomOut, Bold, Italic, AlignCenter, Image as ImageIcon, Upload, Trash2, Move } from 'lucide-react';

const MEME_TEMPLATES = [
  { id: 'drake', name: 'Drake', url: 'https://i.imgflip.com/30b1gx.jpg', topY: 0.25, botY: 0.75 },
  { id: 'distracted', name: 'Distracted BF', url: 'https://i.imgflip.com/1ur9b0.jpg', topY: 0.12, botY: 0.88 },
  { id: 'twobuttons', name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg', topY: 0.1, botY: 0.85 },
  { id: 'changemymind', name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg', topY: 0.08, botY: 0.78 },
  { id: 'disaster', name: 'Disaster Girl', url: 'https://i.imgflip.com/23ls.jpg', topY: 0.08, botY: 0.88 },
  { id: 'rollsafe', name: 'Roll Safe', url: 'https://i.imgflip.com/1h7in3.jpg', topY: 0.08, botY: 0.88 },
  { id: 'waiting', name: 'Waiting Skeleton', url: 'https://i.imgflip.com/2fm6x.jpg', topY: 0.05, botY: 0.88 },
  { id: 'exitramp', name: 'Left Exit 12', url: 'https://i.imgflip.com/22bdq6.jpg', topY: 0.05, botY: 0.88 },
  { id: 'success', name: 'Success Kid', url: 'https://i.imgflip.com/1bhk.jpg', topY: 0.08, botY: 0.88 },
  { id: 'onedoesnot', name: 'One Does Not Simply', url: 'https://i.imgflip.com/1bij.jpg', topY: 0.08, botY: 0.88 },
  { id: 'brace', name: 'Brace Yourselves', url: 'https://i.imgflip.com/1bhm.jpg', topY: 0.08, botY: 0.88 },
  { id: 'everywhere', name: 'X Everywhere', url: 'https://i.imgflip.com/1ihzfe.jpg', topY: 0.08, botY: 0.88 },
];

const FONT_OPTIONS = [
  'Impact', 'Arial Black', 'Comic Sans MS', 'Bangers', 'Roboto', 'Oswald', 'Permanent Marker',
];

const COLOR_PRESETS = [
  '#FFFFFF', '#000000', '#FF0000', '#FFFF00', '#00FF00', '#00BFFF', '#FF69B4', '#FFA500',
];

export default function MemeGenerator({ onClose }) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(42);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [loadedImg, setLoadedImg] = useState(null);
  const [tab, setTab] = useState('templates');

  const loadImage = useCallback((src) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedImg(img);
    img.onerror = () => {
      const img2 = new window.Image();
      img2.onload = () => setLoadedImg(img2);
      img2.src = src;
    };
    img.src = src;
  }, []);

  const selectTemplate = (t) => {
    setSelectedTemplate(t);
    setCustomImage(null);
    loadImage(t.url);
    setTab('edit');
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomImage(ev.target.result);
      setSelectedTemplate(null);
      loadImage(ev.target.result);
      setTab('edit');
    };
    reader.readAsDataURL(file);
  };

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImg) return;
    const ctx = canvas.getContext('2d');
    const W = loadedImg.naturalWidth || loadedImg.width;
    const H = loadedImg.naturalHeight || loadedImg.height;
    canvas.width = W;
    canvas.height = H;
    ctx.drawImage(loadedImg, 0, 0, W, H);

    const scale = W / 600;
    const fs = fontSize * scale;
    const sw = strokeWidth * scale;
    const weight = isBold ? 'bold' : 'normal';
    const style = isItalic ? 'italic' : 'normal';
    ctx.font = `${style} ${weight} ${fs}px "${fontFamily}", Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = sw;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const wrapText = (text, x, y, maxW, lineH, fromBottom) => {
      const words = text.split(' ');
      const lines = [];
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      const startY = fromBottom ? y - (lines.length - 1) * lineH : y;
      lines.forEach((l, i) => {
        const ly = startY + i * lineH;
        ctx.strokeText(l, x, ly);
        ctx.fillText(l, x, ly);
      });
    };

    const pad = W * 0.05;
    const maxW = W - pad * 2;
    const lineH = fs * 1.15;

    if (topText) {
      const ty = selectedTemplate ? H * selectedTemplate.topY : fs + 10 * scale;
      wrapText(topText.toUpperCase(), W / 2, ty, maxW, lineH, false);
    }
    if (bottomText) {
      const by = selectedTemplate ? H * selectedTemplate.botY : H - 20 * scale;
      wrapText(bottomText.toUpperCase(), W / 2, by, maxW, lineH, true);
    }
  }, [loadedImg, topText, bottomText, fontSize, fontFamily, textColor, strokeColor, strokeWidth, isBold, isItalic, selectedTemplate]);

  useEffect(() => { drawMeme(); }, [drawMeme]);

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetAll = () => {
    setSelectedTemplate(null);
    setCustomImage(null);
    setLoadedImg(null);
    setTopText('');
    setBottomText('');
    setFontSize(42);
    setFontFamily('Impact');
    setTextColor('#FFFFFF');
    setStrokeColor('#000000');
    setStrokeWidth(3);
    setIsBold(true);
    setIsItalic(false);
    setTab('templates');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-primary, #0a0a0f)',
      display: 'flex', flexDirection: 'column',
      color: 'var(--text-primary, #e0e0e0)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        .mg-header { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:var(--bg-secondary, #111118); border-bottom:1px solid var(--border, #2a2a35); }
        .mg-title { font-size:18px; font-weight:700; background:linear-gradient(135deg,#a855f7,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .mg-body { display:flex; flex:1; overflow:hidden; }
        .mg-sidebar { width:320px; background:var(--bg-secondary, #111118); border-right:1px solid var(--border, #2a2a35); display:flex; flex-direction:column; overflow-y:auto; }
        .mg-tabs { display:flex; border-bottom:1px solid var(--border, #2a2a35); }
        .mg-tab { flex:1; padding:10px; text-align:center; cursor:pointer; font-size:13px; font-weight:600; border:none; background:none; color:var(--text-secondary, #888); transition:all .2s; }
        .mg-tab.active { color:#a855f7; border-bottom:2px solid #a855f7; }
        .mg-canvas-area { flex:1; display:flex; align-items:center; justify-content:center; padding:20px; background:var(--bg-primary, #0a0a0f); overflow:auto; }
        .mg-canvas-area canvas { max-width:100%; max-height:100%; border-radius:8px; box-shadow:0 4px 24px rgba(0,0,0,.4); }
        .mg-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--text-secondary, #888); }
        .mg-tmpl-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:12px; }
        .mg-tmpl { border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:all .2s; position:relative; }
        .mg-tmpl:hover, .mg-tmpl.sel { border-color:#a855f7; transform:scale(1.02); }
        .mg-tmpl img { width:100%; height:90px; object-fit:cover; display:block; }
        .mg-tmpl span { display:block; text-align:center; font-size:11px; padding:4px; background:rgba(0,0,0,.6); color:#fff; }
        .mg-section { padding:12px 16px; }
        .mg-section h4 { font-size:12px; text-transform:uppercase; color:var(--text-secondary, #888); margin:0 0 8px; letter-spacing:.5px; }
        .mg-input { width:100%; padding:8px 12px; border-radius:6px; border:1px solid var(--border, #2a2a35); background:var(--bg-primary, #0a0a0f); color:var(--text-primary, #e0e0e0); font-size:14px; outline:none; }
        .mg-input:focus { border-color:#a855f7; }
        .mg-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .mg-color { width:28px; height:28px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:all .15s; }
        .mg-color:hover, .mg-color.sel { border-color:#fff; transform:scale(1.15); }
        .mg-select { padding:6px 10px; border-radius:6px; border:1px solid var(--border, #2a2a35); background:var(--bg-primary, #0a0a0f); color:var(--text-primary, #e0e0e0); font-size:13px; outline:none; flex:1; }
        .mg-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:6px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:all .2s; }
        .mg-btn-icon { padding:6px; border-radius:6px; border:1px solid var(--border, #2a2a35); background:none; color:var(--text-primary, #e0e0e0); cursor:pointer; transition:all .15s; }
        .mg-btn-icon:hover { background:rgba(168,85,247,.15); border-color:#a855f7; }
        .mg-btn-icon.active { background:rgba(168,85,247,.25); border-color:#a855f7; color:#a855f7; }
        .mg-upload-zone { border:2px dashed var(--border, #2a2a35); border-radius:10px; padding:24px; text-align:center; cursor:pointer; transition:all .2s; margin:12px; }
        .mg-upload-zone:hover { border-color:#a855f7; background:rgba(168,85,247,.05); }
        .mg-slider { -webkit-appearance:none; width:100%; height:4px; border-radius:2px; background:var(--border, #2a2a35); outline:none; }
        .mg-slider::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#a855f7; cursor:pointer; }
        @media (max-width:768px) {
          .mg-body { flex-direction:column; }
          .mg-sidebar { width:100%; max-height:45vh; }
          .mg-canvas-area { min-height:40vh; }
        }
      `}</style>

      {/* Header */}
      <div className="mg-header">
        <span className="mg-title">Meme Generator</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {loadedImg && (
            <>
              <button className="mg-btn" style={{ background: '#a855f7', color: '#fff' }} onClick={downloadMeme}>
                <Download size={16} /> Download
              </button>
              <button className="mg-btn-icon" onClick={resetAll} title="Reset"><RotateCcw size={16} /></button>
            </>
          )}
          <button className="mg-btn-icon" onClick={onClose} title="Close"><X size={18} /></button>
        </div>
      </div>

      <div className="mg-body">
        {/* Sidebar */}
        <div className="mg-sidebar">
          <div className="mg-tabs">
            <button className={`mg-tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>Templates</button>
            <button className={`mg-tab ${tab === 'edit' ? 'active' : ''}`} onClick={() => setTab('edit')}>Edit Text</button>
            <button className={`mg-tab ${tab === 'style' ? 'active' : ''}`} onClick={() => setTab('style')}>Style</button>
          </div>

          {tab === 'templates' && (
            <>
              <div className="mg-upload-zone" onClick={() => fileInputRef.current?.click()}>
                <Upload size={28} style={{ color: '#a855f7', marginBottom: 6 }} />
                <p style={{ margin: 0, fontSize: 13 }}>Upload your own image</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#666' }}>PNG, JPG, WebP</p>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCustomUpload} />
              </div>
              <div className="mg-tmpl-grid">
                {MEME_TEMPLATES.map((t) => (
                  <div key={t.id} className={`mg-tmpl ${selectedTemplate?.id === t.id ? 'sel' : ''}`} onClick={() => selectTemplate(t)}>
                    <img src={t.url} alt={t.name} loading="lazy" />
                    <span>{t.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'edit' && (
            <>
              <div className="mg-section">
                <h4>Top Text</h4>
                <input className="mg-input" placeholder="Enter top text..." value={topText} onChange={(e) => setTopText(e.target.value)} />
              </div>
              <div className="mg-section">
                <h4>Bottom Text</h4>
                <input className="mg-input" placeholder="Enter bottom text..." value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
              </div>
              <div className="mg-section">
                <h4>Font Size ({fontSize}px)</h4>
                <input type="range" className="mg-slider" min={16} max={80} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} />
              </div>
              <div className="mg-section">
                <h4>Stroke Width ({strokeWidth}px)</h4>
                <input type="range" className="mg-slider" min={0} max={10} value={strokeWidth} onChange={(e) => setStrokeWidth(+e.target.value)} />
              </div>
            </>
          )}

          {tab === 'style' && (
            <>
              <div className="mg-section">
                <h4>Font Family</h4>
                <select className="mg-select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="mg-section">
                <h4>Text Style</h4>
                <div className="mg-row">
                  <button className={`mg-btn-icon ${isBold ? 'active' : ''}`} onClick={() => setIsBold(!isBold)}><Bold size={16} /></button>
                  <button className={`mg-btn-icon ${isItalic ? 'active' : ''}`} onClick={() => setIsItalic(!isItalic)}><Italic size={16} /></button>
                </div>
              </div>
              <div className="mg-section">
                <h4>Text Color</h4>
                <div className="mg-row">
                  {COLOR_PRESETS.map((c) => (
                    <div key={c} className={`mg-color ${textColor === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setTextColor(c)} />
                  ))}
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }} />
                </div>
              </div>
              <div className="mg-section">
                <h4>Stroke Color</h4>
                <div className="mg-row">
                  {COLOR_PRESETS.map((c) => (
                    <div key={c} className={`mg-color ${strokeColor === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setStrokeColor(c)} />
                  ))}
                  <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="mg-canvas-area">
          {loadedImg ? (
            <canvas ref={canvasRef} />
          ) : (
            <div className="mg-empty">
              <ImageIcon size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 15 }}>Choose a template or upload an image to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
