'use client';
import { useState, useRef, useCallback } from 'react';
import { X, Upload, Code, Copy, Download, RotateCcw, Loader2, CheckCircle, Image as ImageIcon, Sparkles, FileCode, Eye } from 'lucide-react';
import { getCsrfToken } from './utils/security';

export default function ScreenshotToCode({ onClose }) {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [framework, setFramework] = useState('html');

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10 MB)'); return; }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
    setCode('');
    setShowPreview(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError('');
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
      setCode('');
      setShowPreview(false);
    }
  }, []);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        setImageFile(file);
        setError('');
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target.result);
        reader.readAsDataURL(file);
        setCode('');
        setShowPreview(false);
        break;
      }
    }
  }, []);

  const generateCode = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    setCode('');
    setShowPreview(false);
    try {
      const base64 = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      const csrfToken = getCsrfToken();
      const res = await fetch('/api/screenshot-to-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        credentials: 'same-origin',
        body: JSON.stringify({ image: base64, mime_type: mimeType, framework }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setCode(data.code || '');
    } catch (err) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const ext = framework === 'html' ? 'html' : framework === 'react' ? 'jsx' : 'html';
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `screenshot-code.${ext}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const resetAll = () => {
    setImage(null);
    setImageFile(null);
    setCode('');
    setError('');
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg-primary, #0a0a0f)',
        display: 'flex', flexDirection: 'column',
        color: 'var(--text-primary, #e0e0e0)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onPaste={handlePaste}
    >
      <style>{`
        .s2c-header { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:var(--bg-secondary, #111118); border-bottom:1px solid var(--border, #2a2a35); }
        .s2c-title { font-size:18px; font-weight:700; background:linear-gradient(135deg,#3b82f6,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .s2c-body { display:flex; flex:1; overflow:hidden; }
        .s2c-left { width:45%; display:flex; flex-direction:column; border-right:1px solid var(--border, #2a2a35); }
        .s2c-right { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .s2c-drop { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; cursor:pointer; transition:all .2s; }
        .s2c-drop.has-img { cursor:default; }
        .s2c-drop-zone { border:2px dashed var(--border, #2a2a35); border-radius:12px; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; transition:all .2s; overflow:hidden; position:relative; }
        .s2c-drop-zone:hover { border-color:#3b82f6; }
        .s2c-drop-zone img { max-width:100%; max-height:100%; object-fit:contain; }
        .s2c-controls { padding:12px 16px; background:var(--bg-secondary, #111118); border-top:1px solid var(--border, #2a2a35); display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .s2c-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:all .2s; }
        .s2c-btn-primary { background:linear-gradient(135deg,#3b82f6,#06b6d4); color:#fff; }
        .s2c-btn-primary:hover { opacity:.9; transform:translateY(-1px); }
        .s2c-btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .s2c-btn-secondary { background:rgba(59,130,246,.1); color:#3b82f6; border:1px solid rgba(59,130,246,.3); }
        .s2c-btn-icon { padding:6px; border-radius:6px; border:1px solid var(--border, #2a2a35); background:none; color:var(--text-primary, #e0e0e0); cursor:pointer; }
        .s2c-btn-icon:hover { background:rgba(59,130,246,.15); border-color:#3b82f6; }
        .s2c-select { padding:6px 10px; border-radius:6px; border:1px solid var(--border, #2a2a35); background:var(--bg-primary, #0a0a0f); color:var(--text-primary, #e0e0e0); font-size:13px; outline:none; }
        .s2c-code-area { flex:1; overflow:auto; position:relative; }
        .s2c-code-area pre { margin:0; padding:16px; font-size:13px; line-height:1.5; font-family:'JetBrains Mono','Fira Code',Consolas,monospace; white-space:pre-wrap; word-break:break-all; }
        .s2c-code-header { display:flex; align-items:center; justify-content:space-between; padding:8px 16px; background:var(--bg-secondary, #111118); border-bottom:1px solid var(--border, #2a2a35); }
        .s2c-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:12px; color:var(--text-secondary, #888); }
        .s2c-preview { flex:1; border:none; width:100%; height:100%; background:#fff; }
        .s2c-error { padding:8px 12px; background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); border-radius:6px; color:#ef4444; font-size:13px; margin:0 16px; }
        .s2c-tabs { display:flex; gap:0; }
        .s2c-tab { padding:8px 16px; font-size:13px; font-weight:600; border:none; background:none; color:var(--text-secondary, #888); cursor:pointer; border-bottom:2px solid transparent; }
        .s2c-tab.active { color:#3b82f6; border-bottom-color:#3b82f6; }
        @keyframes s2c-spin { to { transform:rotate(360deg); } }
        .s2c-spinner { animation:s2c-spin 1s linear infinite; }
        @media (max-width:768px) {
          .s2c-body { flex-direction:column; }
          .s2c-left { width:100%; max-height:45vh; }
        }
      `}</style>

      {/* Header */}
      <div className="s2c-header">
        <span className="s2c-title">Screenshot to Code</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {image && <button className="s2c-btn-icon" onClick={resetAll} title="Reset"><RotateCcw size={16} /></button>}
          <button className="s2c-btn-icon" onClick={onClose} title="Close"><X size={18} /></button>
        </div>
      </div>

      <div className="s2c-body">
        {/* Left - Image upload */}
        <div className="s2c-left">
          <div
            className={`s2c-drop ${image ? 'has-img' : ''}`}
            onClick={() => !image && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="s2c-drop-zone">
              {image ? (
                <img src={image} alt="Uploaded screenshot" />
              ) : (
                <>
                  <Upload size={36} style={{ color: '#3b82f6', opacity: 0.6 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Drop screenshot here, paste, or click to upload</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>PNG, JPG, WebP — Max 10 MB</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          </div>
          <div className="s2c-controls">
            <select className="s2c-select" value={framework} onChange={(e) => setFramework(e.target.value)}>
              <option value="html">HTML + CSS</option>
              <option value="tailwind">HTML + Tailwind CSS</option>
              <option value="react">React + CSS</option>
            </select>
            <button
              className="s2c-btn s2c-btn-primary"
              disabled={!image || loading}
              onClick={generateCode}
            >
              {loading ? <><Loader2 size={16} className="s2c-spinner" /> Generating...</> : <><Sparkles size={16} /> Generate Code</>}
            </button>
            {image && !loading && (
              <button className="s2c-btn s2c-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} /> Change Image
              </button>
            )}
          </div>
          {error && <div className="s2c-error">{error}</div>}
        </div>

        {/* Right - Code output */}
        <div className="s2c-right">
          {code ? (
            <>
              <div className="s2c-code-header">
                <div className="s2c-tabs">
                  <button className={`s2c-tab ${!showPreview ? 'active' : ''}`} onClick={() => setShowPreview(false)}>
                    <FileCode size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Code
                  </button>
                  {framework === 'html' && (
                    <button className={`s2c-tab ${showPreview ? 'active' : ''}`} onClick={() => setShowPreview(true)}>
                      <Eye size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Preview
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="s2c-btn-icon" onClick={copyCode} title="Copy">
                    {copied ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                  </button>
                  <button className="s2c-btn-icon" onClick={downloadCode} title="Download"><Download size={16} /></button>
                </div>
              </div>
              <div className="s2c-code-area">
                {showPreview ? (
                  <iframe className="s2c-preview" srcDoc={code} sandbox="allow-scripts" title="Preview" />
                ) : (
                  <pre>{code}</pre>
                )}
              </div>
            </>
          ) : (
            <div className="s2c-empty">
              <Code size={48} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: 15 }}>Upload a screenshot and click Generate Code</p>
              <p style={{ fontSize: 12, maxWidth: 300, textAlign: 'center' }}>AI will analyze the screenshot and produce matching HTML/CSS code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
