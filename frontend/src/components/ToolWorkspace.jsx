import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  X, UploadCloud, Loader2, Download, CheckCircle, AlertCircle, Copy, Check, FileText,
} from 'lucide-react';
import { getCsrfToken } from '../utils/security';
import { TOOL_CATEGORIES } from '../utils/toolsData';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const themeFor = (cat) => TOOL_CATEGORIES.find((c) => c.id === cat) || { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' };
const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(2)} MB`;

/**
 * Full-screen workspace for a single tool: file(s) load instantly with a live
 * preview on the left and the tool's own options on the right. Handles convert,
 * pdf-ops and AI tools. (Compress / Edit / Sign have their own screens.)
 */
export default function ToolWorkspace({ tool, onClose }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);   // dataURLs (pdf 1st page / image)
  const [paramText, setParamText] = useState('');
  const [angle, setAngle] = useState(tool.param === 'lang' ? 'assamese' : '90');
  const [dragActive, setDragActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [wm, setWm] = useState({ text: 'CONFIDENTIAL', position: 'diagonal', opacity: 0.15, size: 48, color: '#888888' });
  const inputRef = useRef(null);
  const theme = themeFor(tool.cat);
  const WM_COLORS = ['#888888', '#dc2626', '#2563eb', '#16a34a', '#111827'];

  const makePreview = useCallback(async (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
    }
    if (ext === 'pdf') {
      try {
        const buf = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(1);
        const v1 = page.getViewport({ scale: 1 });
        const scale = Math.min(300 / v1.width, 400 / v1.height);
        const vp = page.getViewport({ scale });
        const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
        await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
        return cv.toDataURL('image/png');
      } catch (e) { return null; }
    }
    return null; // office/other -> generic icon
  }, []);

  const chooseFiles = async (fileList) => {
    setErrorMsg(null); setResult(null);
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    const allowed = (tool.accept || '').split(',');
    for (const f of arr) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (allowed[0] && !allowed.includes(ext)) { setErrorMsg(`"${f.name}" is not valid for this tool. Allowed: ${tool.hint}.`); return; }
      if (f.size > 40 * 1024 * 1024) { setErrorMsg(`"${f.name}" exceeds the 40 MB limit.`); return; }
    }
    // For multi-file tools (merge, image→PDF) APPEND to the existing list so
    // "Add more" accumulates files instead of replacing them.
    const merged = tool.multi ? [...files, ...arr] : [arr[0]];
    setFiles(merged);
    setPreviews(await Promise.all(merged.map(makePreview)));
    if (inputRef.current) inputRef.current.value = ''; // allow re-picking the same file
  };

  const removeFile = (idx) => {
    setFiles((fs) => fs.filter((_, i) => i !== idx));
    setPreviews((ps) => ps.filter((_, i) => i !== idx));
    setResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.length) chooseFiles(e.dataTransfer.files); };

  const requiresParamText = ['pages', 'password', 'question'].includes(tool.param);
  const canRun = files.length > 0 && (!requiresParamText || paramText.trim()) && (!tool.multi || files.length >= (tool.op === 'merge' ? 2 : 1));

  const run = async () => {
    if (!canRun) return;
    setIsRunning(true); setErrorMsg(null); setResult(null);
    const fd = new FormData();
    const url = tool.ep === 'convert' ? '/api/convert-file/' : tool.ep === 'ai' ? '/api/pdf-ai/' : '/api/pdf-tool/';
    if (tool.ep === 'convert') fd.append('target', tool.target); else fd.append('op', tool.op);
    if (tool.multi) files.forEach((f) => fd.append('files', f)); else fd.append('file', files[0]);
    if (tool.param === 'pages') fd.append('pages', paramText.trim());
    if (tool.param === 'text') fd.append('text', paramText.trim() || 'CONFIDENTIAL');
    if (tool.param === 'password') fd.append('password', paramText.trim());
    if (tool.param === 'question') fd.append('question', paramText.trim());
    if (tool.param === 'angle') fd.append('angle', angle);
    if (tool.param === 'lang') fd.append('lang', angle);
    if (tool.op === 'watermark') {
      fd.append('text', (wm.text || 'CONFIDENTIAL'));
      fd.append('position', wm.position);
      fd.append('opacity', String(wm.opacity));
      fd.append('size', String(wm.size));
      fd.append('color', wm.color);
      fd.append('rotation', ['center', 'top', 'bottom'].includes(wm.position) ? '0' : '45');
    }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'X-CSRFToken': getCsrfToken() || '' }, body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Operation failed.');
      setResult(data);
    } catch (e) { setErrorMsg(e.message || 'Something went wrong.'); }
    finally { setIsRunning(false); }
  };

  const download = async () => {
    try {
      const r = await fetch(result.download_url); const blob = await r.blob();
      const u = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = u; a.download = result.output_name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    } catch (e) { window.open(result.download_url, '_blank'); }
  };

  const reset = () => { setFiles([]); setPreviews([]); setParamText(''); setResult(null); setErrorMsg(null); if (inputRef.current) inputRef.current.value = ''; };

  const paramLabel = { pages: 'Pages to keep (e.g. 1,3,5-7)', text: 'Watermark text', password: tool.op === 'unlock' ? 'Current password' : 'New password', question: 'Ask a question about this PDF…' };

  return (
    <div className="tool-ws-overlay">
      {/* Top bar */}
      <div className="tool-ws-topbar">
        <div className="tool-ws-title-area">
          <span className="tool-ws-badge" style={{ color: theme.color, background: theme.bg }}><tool.icon size={18} /></span>
          <div>
            <h3 className="tool-ws-title">{tool.name}</h3>
            <p className="tool-ws-sub">{tool.desc || `Supports ${tool.hint}`}</p>
          </div>
        </div>
        <button className="tool-ws-close" onClick={onClose} title="Close"><X size={18} /></button>
      </div>

      {files.length === 0 ? (
        /* Upload */
        <div className="tool-ws-uploadwrap">
          <label
            className={`tool-ws-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" accept={tool.accept} multiple={tool.multi} style={{ display: 'none' }}
              onChange={(e) => e.target.files?.length && chooseFiles(e.target.files)} />
            <div className="tool-ws-upicon" style={{ color: theme.color }}><UploadCloud size={40} /></div>
            <h3>Choose file{tool.multi ? 's' : ''} or drag &amp; drop</h3>
            <p>Accepts {tool.hint} · up to 40 MB</p>
            <span className="tool-ws-browse" style={{ background: theme.color }}>Browse File{tool.multi ? 's' : ''}</span>
          </label>
        </div>
      ) : (
        /* Workspace: preview + options */
        <div className="tool-ws-body">
          {/* Preview */}
          <div className="tool-ws-preview">
            {files.length > 1 ? (
              <div className="tool-ws-thumbs">
                {files.map((f, i) => (
                  <div key={i} className="tool-ws-thumb">
                    <button className="tool-ws-thumb-x" title="Remove" onClick={() => removeFile(i)}><X size={13} /></button>
                    {previews[i] ? <img src={previews[i]} alt="" /> : <div className="tool-ws-fileicon"><FileText size={30} /></div>}
                    <span title={f.name}>{i + 1}. {f.name}</span>
                  </div>
                ))}
              </div>
            ) : previews[0] ? (
              <img className="tool-ws-preview-img" src={previews[0]} alt="preview" />
            ) : (
              <div className="tool-ws-fileicon-lg"><FileText size={54} /><span>{files[0].name}</span></div>
            )}
            <div className="tool-ws-fileinfo">{files.length === 1 ? files[0].name : `${files.length} files`} · {fmtSize(files.reduce((a, f) => a + f.size, 0))}</div>
          </div>

          {/* Options / result */}
          <div className="tool-ws-panel">
            {!result ? (
              <>
                <h3 className="tool-ws-panel-title">Options</h3>

                {tool.op === 'watermark' && (
                  <>
                    <label className="tool-ws-field"><span>Watermark text</span>
                      <input type="text" value={wm.text} onChange={(e) => setWm({ ...wm, text: e.target.value })} placeholder="CONFIDENTIAL" />
                    </label>
                    <label className="tool-ws-field"><span>Position</span>
                      <select value={wm.position} onChange={(e) => setWm({ ...wm, position: e.target.value })}>
                        <option value="diagonal">Diagonal (centre, 45°)</option>
                        <option value="tile">Tiled (repeat across page)</option>
                        <option value="center">Centre (horizontal)</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </label>
                    <label className="tool-ws-field"><span>Opacity — {Math.round(wm.opacity * 100)}%</span>
                      <input type="range" min="5" max="80" value={Math.round(wm.opacity * 100)} onChange={(e) => setWm({ ...wm, opacity: e.target.value / 100 })} style={{ width: '100%' }} />
                    </label>
                    <label className="tool-ws-field"><span>Font size — {wm.size}px</span>
                      <input type="range" min="18" max="120" value={wm.size} onChange={(e) => setWm({ ...wm, size: +e.target.value })} style={{ width: '100%' }} />
                    </label>
                    <div className="tool-ws-field"><span>Colour</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {WM_COLORS.map((c) => (
                          <button key={c} onClick={() => setWm({ ...wm, color: c })} title={c}
                            style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: wm.color === c ? '2px solid var(--text-primary)' : '2px solid transparent', boxShadow: '0 0 0 1px var(--border-color)' }} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {tool.param === 'angle' && (
                  <label className="tool-ws-field"><span>Rotation angle</span>
                    <select value={angle} onChange={(e) => setAngle(e.target.value)}>
                      <option value="90">Rotate 90° clockwise</option>
                      <option value="180">Rotate 180°</option>
                      <option value="270">Rotate 270° counter-clockwise</option>
                    </select>
                  </label>
                )}
                {tool.param === 'lang' && (
                  <label className="tool-ws-field"><span>Translate to</span>
                    <select value={angle} onChange={(e) => setAngle(e.target.value)}>
                      <option value="assamese">Assamese (অসমীয়া)</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi (हिन्दी)</option>
                    </select>
                  </label>
                )}
                {['pages', 'text', 'password', 'question'].includes(tool.param) && (
                  <label className="tool-ws-field"><span>{paramLabel[tool.param]}</span>
                    <input type="text" value={paramText} onChange={(e) => setParamText(e.target.value)} placeholder={paramLabel[tool.param]} />
                  </label>
                )}
                {tool.multi && (
                  <button className="tool-ws-addmore" onClick={() => inputRef.current?.click()}>+ Add more file{tool.op === 'merge' ? 's' : ''}</button>
                )}
                {!tool.param && !tool.multi && tool.op !== 'watermark' && (
                  <p className="tool-ws-note">No settings needed — just run the tool.</p>
                )}

                {errorMsg && <div className="tool-ws-error"><AlertCircle size={15} /> {errorMsg}</div>}

                <button className="tool-ws-run" style={{ background: theme.color, opacity: canRun && !isRunning ? 1 : 0.55 }} onClick={run} disabled={!canRun || isRunning}>
                  {isRunning ? <><Loader2 size={16} className="spin-icon" /> Processing…</> : <>Run {tool.name}</>}
                </button>
                <button className="tool-ws-secondary" onClick={reset}>Choose another file</button>
                {isRunning && <p className="tool-ws-note" style={{ marginTop: '10px' }}>Large / Office / OCR files can take a few seconds — hang tight.</p>}
              </>
            ) : result.text ? (
              /* AI text result */
              <>
                <div className="tool-ws-success"><CheckCircle size={20} /> Done</div>
                <div className="tool-ws-textout">{result.text}</div>
                <div className="tool-ws-actions">
                  <button className="tool-ws-run" style={{ background: theme.color }} onClick={() => { try { navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* */ } }}>
                    {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy text</>}
                  </button>
                  <button className="tool-ws-secondary" onClick={reset}>New file</button>
                </div>
              </>
            ) : (
              /* File result */
              <>
                <div className="tool-ws-success"><CheckCircle size={20} /> Your file is ready!</div>
                <div className="tool-ws-resultcard">
                  <FileText size={26} style={{ color: theme.color }} />
                  <div><b>{result.output_name}</b><span>{result.file_size}</span></div>
                </div>
                <button className="tool-ws-run" style={{ background: theme.color }} onClick={download}><Download size={16} /> Download</button>
                <button className="tool-ws-secondary" onClick={() => setResult(null)}>Run again</button>
                <button className="tool-ws-secondary" onClick={reset}>New file</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
