import React, { useState, useRef } from 'react';
import {
  X, UploadCloud, FileText, CheckCircle, AlertCircle, Download, Loader2,
  ChevronLeft, FileType2, Image as ImageIcon, Combine, Scissors, Trash2,
  FileOutput, RotateCw, Hash, Minimize2, Droplets, Lock, Unlock,
  Presentation, FileSpreadsheet, ScanText, MessagesSquare, Languages, Copy, Check, Sparkles,
  PenTool, Signature,
} from 'lucide-react';
import { getCsrfToken } from '../utils/security';

// Every tool. ep 'convert' -> /api/convert-file/ (target); ep 'pdf' -> /api/pdf-tool/ (op).
// param: extra input a tool needs — 'pages' | 'angle' | 'text' | 'password'.
const TOOLS = [
  { id: 'word2pdf', name: 'Word → PDF', cat: 'Convert', icon: FileType2, ep: 'convert', target: 'pdf', accept: '.docx,.doc,.txt,.rtf,.md', multi: false, hint: 'DOCX, DOC, TXT, RTF' },
  { id: 'pdf2word', name: 'PDF → Word', cat: 'Convert', icon: FileType2, ep: 'convert', target: 'docx', accept: '.pdf', multi: false, hint: 'PDF file' },
  { id: 'img2pdf', name: 'Image → PDF', cat: 'Convert', icon: ImageIcon, ep: 'convert', target: 'pdf', accept: '.png,.jpg,.jpeg,.webp', multi: true, hint: 'PNG, JPG (one or many)' },
  { id: 'pdf2jpg', name: 'PDF → JPG', cat: 'Convert', icon: ImageIcon, ep: 'convert', target: 'jpg', accept: '.pdf', multi: false, hint: 'PDF file' },
  { id: 'pdf2png', name: 'PDF → PNG', cat: 'Convert', icon: ImageIcon, ep: 'convert', target: 'png', accept: '.pdf', multi: false, hint: 'PDF file' },

  { id: 'merge', name: 'Merge PDF', cat: 'Organize', icon: Combine, ep: 'pdf', op: 'merge', accept: '.pdf', multi: true, hint: 'Two or more PDFs' },
  { id: 'split', name: 'Split PDF', cat: 'Organize', icon: Scissors, ep: 'pdf', op: 'split', accept: '.pdf', multi: false, hint: 'PDF file' },
  { id: 'delete', name: 'Delete Pages', cat: 'Organize', icon: Trash2, ep: 'pdf', op: 'delete', accept: '.pdf', multi: false, param: 'pages', hint: 'PDF file' },
  { id: 'extract', name: 'Extract Pages', cat: 'Organize', icon: FileOutput, ep: 'pdf', op: 'extract', accept: '.pdf', multi: false, param: 'pages', hint: 'PDF file' },
  { id: 'rotate', name: 'Rotate PDF', cat: 'Organize', icon: RotateCw, ep: 'pdf', op: 'rotate', accept: '.pdf', multi: false, param: 'angle', hint: 'PDF file' },
  { id: 'numbers', name: 'Add Page Numbers', cat: 'Organize', icon: Hash, ep: 'pdf', op: 'numbers', accept: '.pdf', multi: false, hint: 'PDF file' },

  { id: 'compress', name: 'Compress PDF', cat: 'Optimize', icon: Minimize2, ep: 'pdf', op: 'compress', accept: '.pdf', multi: false, hint: 'PDF file' },
  { id: 'watermark', name: 'Watermark PDF', cat: 'Optimize', icon: Droplets, ep: 'pdf', op: 'watermark', accept: '.pdf', multi: false, param: 'text', hint: 'PDF file' },

  { id: 'protect', name: 'Protect PDF', cat: 'Security', icon: Lock, ep: 'pdf', op: 'protect', accept: '.pdf', multi: false, param: 'password', hint: 'PDF file' },
  { id: 'unlock', name: 'Unlock PDF', cat: 'Security', icon: Unlock, ep: 'pdf', op: 'unlock', accept: '.pdf', multi: false, param: 'password', hint: 'Password-protected PDF' },

  // Office -> PDF (LibreOffice on the server)
  { id: 'ppt2pdf', name: 'PowerPoint → PDF', cat: 'Office', icon: Presentation, ep: 'convert', target: 'pdf', accept: '.pptx,.ppt,.odp', multi: false, hint: 'PPTX, PPT, ODP' },
  { id: 'excel2pdf', name: 'Excel → PDF', cat: 'Office', icon: FileSpreadsheet, ep: 'convert', target: 'pdf', accept: '.xlsx,.xls,.ods,.csv', multi: false, hint: 'XLSX, XLS, ODS, CSV' },
  { id: 'office2pdf', name: 'ODT / HTML / EPUB → PDF', cat: 'Office', icon: FileType2, ep: 'convert', target: 'pdf', accept: '.odt,.html,.htm,.epub,.rtf', multi: false, hint: 'ODT, HTML, EPUB, RTF' },

  // OCR (Tesseract: English + Assamese + Hindi)
  { id: 'ocr', name: 'OCR — Make Searchable', cat: 'OCR', icon: ScanText, ep: 'pdf', op: 'ocr', accept: '.pdf', multi: false, hint: 'Scanned PDF' },

  // AI (Groq)
  { id: 'chatpdf', name: 'Chat with PDF', cat: 'AI Tools', icon: MessagesSquare, ep: 'ai', op: 'chat', accept: '.pdf', multi: false, param: 'question', hint: 'PDF file' },
  { id: 'summarize', name: 'Summarize PDF', cat: 'AI Tools', icon: Sparkles, ep: 'ai', op: 'summarize', accept: '.pdf', multi: false, hint: 'PDF file' },
  { id: 'translatepdf', name: 'Translate PDF', cat: 'AI Tools', icon: Languages, ep: 'ai', op: 'translate', accept: '.pdf', multi: false, param: 'lang', hint: 'PDF file' },

  // Interactive editor (opens a full-screen canvas editor)
  { id: 'edit', name: 'Edit PDF', cat: 'Edit', icon: PenTool, editor: true },
  { id: 'sign', name: 'Sign PDF', cat: 'Edit', icon: Signature, editor: true },
];

const CATS = ['Convert', 'Office', 'Organize', 'Optimize', 'Security', 'OCR', 'AI Tools', 'Edit'];

export default function DocConverterModal({ isOpen, onClose, onOpenEditor }) {
  const [tool, setTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [paramText, setParamText] = useState('');
  const [angle, setAngle] = useState('90');
  const [dragActive, setDragActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const reset = () => {
    setFiles([]); setParamText(''); setAngle('90');
    setResult(null); setErrorMsg(null); setIsRunning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const pickTool = (t) => {
    if (t.editor) { onClose?.(); onOpenEditor?.(); return; }
    reset(); setTool(t); if (t.param === 'lang') setAngle('assamese');
  };
  const backToGrid = () => { reset(); setTool(null); };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const chooseFiles = (fileList) => {
    setErrorMsg(null); setResult(null);
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    const allowed = tool.accept.split(',');
    for (const f of arr) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) { setErrorMsg(`"${f.name}" is not valid here. Allowed: ${tool.hint}.`); return; }
      if (f.size > 40 * 1024 * 1024) { setErrorMsg(`"${f.name}" exceeds the 40 MB limit.`); return; }
    }
    setFiles(tool.multi ? arr : [arr[0]]);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.length) chooseFiles(e.dataTransfer.files);
  };

  const requiresParamText = tool && ['pages', 'password', 'question'].includes(tool.param);
  const canRun = files.length > 0 && (!requiresParamText || paramText.trim());

  const runTool = async () => {
    if (!canRun) return;
    setIsRunning(true); setErrorMsg(null); setResult(null);
    const fd = new FormData();
    const url = tool.ep === 'convert' ? '/api/convert-file/'
      : tool.ep === 'ai' ? '/api/pdf-ai/' : '/api/pdf-tool/';
    if (tool.ep === 'convert') fd.append('target', tool.target);
    else fd.append('op', tool.op);
    if (tool.multi) files.forEach((f) => fd.append('files', f));
    else fd.append('file', files[0]);
    if (tool.param === 'pages') fd.append('pages', paramText.trim());
    if (tool.param === 'text') fd.append('text', paramText.trim() || 'CONFIDENTIAL');
    if (tool.param === 'password') fd.append('password', paramText.trim());
    if (tool.param === 'question') fd.append('question', paramText.trim());
    if (tool.param === 'angle') fd.append('angle', angle);
    if (tool.param === 'lang') fd.append('lang', angle); // reuse `angle` state as lang for translate

    try {
      const res = await fetch(url, { method: 'POST', headers: { 'X-CSRFToken': getCsrfToken() || '' }, body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Operation failed.');
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setIsRunning(false);
    }
  };

  const paramLabel = {
    pages: 'Pages (e.g. 2,4-6)',
    text: 'Watermark text',
    password: tool?.op === 'unlock' ? 'Current password' : 'New password',
    question: 'Ask a question about this PDF…',
  };

  return (
    <div className="doc-converter-overlay" onClick={onClose}>
      <div className="doc-converter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            {tool && (
              <button className="modal-close-btn" onClick={backToGrid} title="Back to all tools" style={{ marginRight: '4px' }}>
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="modal-icon-badge">
              {tool ? <tool.icon size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <h3 className="modal-title">{tool ? tool.name : 'All Converter & PDF Tools'}</h3>
              <p className="modal-subtitle">
                {tool ? `Supports ${tool.hint} (up to 40MB)` : 'Convert, organize, optimize and secure your files — fast & offline'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close"><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* ---- Tool grid ---- */}
          {!tool && (
            <div className="tools-grid-wrap" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {CATS.map((cat) => (
                <div key={cat} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '4px 2px 8px' }}>{cat}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                    {TOOLS.filter((t) => t.cat === cat).map((t) => (
                      <button key={t.id} onClick={() => pickTool(t)} className="tool-grid-card"
                        style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '11px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input, rgba(255,255,255,0.02))', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                        <t.icon size={17} style={{ color: 'var(--accent-purple, #8b5cf6)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- Single tool ---- */}
          {tool && !result && (
            <>
              <div
                className={`dropzone-card ${dragActive ? 'active' : ''} ${isRunning ? 'converting' : ''}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => !isRunning && fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept={tool.accept} multiple={tool.multi}
                  onChange={(e) => e.target.files?.length && chooseFiles(e.target.files)} disabled={isRunning} />
                {isRunning ? (
                  <div className="dropzone-converting">
                    <Loader2 size={34} className="spin-icon" />
                    <h4>Working…</h4>
                    <p>Processing your file</p>
                    <div className="conversion-progress-bar"><div className="progress-fill"></div></div>
                  </div>
                ) : files.length ? (
                  <div className="dropzone-idle">
                    <div className="dropzone-icon"><CheckCircle size={30} /></div>
                    <h4>{files.length === 1 ? files[0].name : `${files.length} files selected`}</h4>
                    <p className="dropzone-sub">Click to choose different file{tool.multi ? 's' : ''}</p>
                  </div>
                ) : (
                  <div className="dropzone-idle">
                    <div className="dropzone-icon"><UploadCloud size={30} /></div>
                    <h4>Choose file{tool.multi ? 's' : ''} or drag & drop</h4>
                    <p className="dropzone-sub">{tool.hint}</p>
                    <button type="button" className="btn-browse-file">Browse</button>
                  </div>
                )}
              </div>

              {/* Params */}
              {tool.param && files.length > 0 && !isRunning && (
                <div style={{ marginTop: '12px' }}>
                  {tool.param === 'angle' ? (
                    <select value={angle} onChange={(e) => setAngle(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border-color)', background: 'var(--bg-input, rgba(255,255,255,0.03))', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      <option value="90">Rotate 90° (clockwise)</option>
                      <option value="180">Rotate 180°</option>
                      <option value="270">Rotate 270° (counter-clockwise)</option>
                    </select>
                  ) : tool.param === 'lang' ? (
                    <select value={angle} onChange={(e) => setAngle(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border-color)', background: 'var(--bg-input, rgba(255,255,255,0.03))', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      <option value="assamese">Translate to Assamese (অসমীয়া)</option>
                      <option value="english">Translate to English</option>
                      <option value="hindi">Translate to Hindi (हिन्दी)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={paramText} onChange={(e) => setParamText(e.target.value)}
                      placeholder={paramLabel[tool.param]}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1px solid var(--border-color)', background: 'var(--bg-input, rgba(255,255,255,0.03))', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="converter-error-box"><AlertCircle size={16} /><span>{errorMsg}</span></div>
              )}

              {files.length > 0 && !isRunning && (
                <button className="btn-convert-another" onClick={runTool} disabled={!canRun}
                  style={{ marginTop: '14px', width: '100%', opacity: canRun ? 1 : 0.5, background: 'var(--accent-purple, #8b5cf6)', color: '#fff', border: 'none', padding: '11px', borderRadius: '10px', fontWeight: 600, cursor: canRun ? 'pointer' : 'not-allowed' }}>
                  Run {tool.name}
                </button>
              )}
            </>
          )}

          {/* ---- Result (AI text) ---- */}
          {tool && result && result.text && (
            <div className="converter-success-box">
              <div className="success-header">
                <CheckCircle size={22} className="success-icon" />
                <div>
                  <h4 className="success-title">Done!</h4>
                  <p className="success-sub">{tool.name}</p>
                </div>
              </div>
              <div style={{ maxHeight: '46vh', overflowY: 'auto', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input, rgba(255,255,255,0.03))', fontSize: '0.86rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                {result.text}
              </div>
              <div className="convert-another-wrapper" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn-convert-another" onClick={() => { try { navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* ignore */ } }}>
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
                <button className="btn-convert-another" onClick={reset}>Use again</button>
                <button className="btn-convert-another" onClick={backToGrid}>← All tools</button>
              </div>
            </div>
          )}

          {/* ---- Result (file download) ---- */}
          {tool && result && !result.text && (
            <div className="converter-success-box">
              <div className="success-header">
                <CheckCircle size={22} className="success-icon" />
                <div>
                  <h4 className="success-title">Done!</h4>
                  <p className="success-sub">{result.output_name}</p>
                </div>
              </div>
              <div className="pdf-details-card">
                <div className="pdf-card-left">
                  <div className="pdf-badge-icon"><FileText size={24} /></div>
                  <div className="pdf-info">
                    <span className="pdf-name">{result.output_name}</span>
                    <span className="pdf-meta">{result.file_size}</span>
                  </div>
                </div>
              </div>
              <div className="success-actions">
                <a href={result.download_url} download={result.output_name} className="btn-download-pdf">
                  <Download size={16} /><span>Download</span>
                </a>
              </div>
              <div className="convert-another-wrapper" style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-convert-another" onClick={reset}>Use this tool again</button>
                <button className="btn-convert-another" onClick={backToGrid}>← All tools</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
