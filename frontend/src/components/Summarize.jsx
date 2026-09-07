import React, { useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { getCsrfToken } from '../utils/security';

const MAX_MB = 40;
const ACCEPT = '.pdf,.docx,.txt';
const LENGTH_OPTIONS = [
  { id: 'short', label: 'Short', hint: '~80 words' },
  { id: 'medium', label: 'Medium', hint: '~200 words' },
  { id: 'detailed', label: 'Detailed', hint: '~450 words' },
];
const LANGUAGE_OPTIONS = [
  { id: 'assamese', label: 'অসমীয়া' },
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'हिंदी' },
];

export default function Summarize({ onClose }) {
  const [mode, setMode] = useState('file'); // 'file' | 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [length, setLength] = useState('medium');
  const [language, setLanguage] = useState('assamese');
  const [dragActive, setDragActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const chooseFile = (f) => {
    setError(null);
    setResult(null);
    if (!f) return;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPT.split(',').includes(ext)) {
      setError(`"${f.name}" is not supported. Allowed: PDF, DOCX, TXT.`);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`"${f.name}" is larger than ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) chooseFile(e.dataTransfer.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const canRun = mode === 'file' ? !!file : text.trim().length >= 40;

  const runSummarize = async () => {
    setError(null);
    setResult(null);
    setIsRunning(true);
    try {
      let resp;
      if (mode === 'file') {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('length', length);
        fd.append('language', language);
        resp = await fetch('/api/summarize/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCsrfToken() },
          body: fd,
        });
      } else {
        resp = await fetch('/api/summarize/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify({ text: text.trim(), length, language }),
        });
      }
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.error || `Request failed (${resp.status})`);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e.message || 'Network error.');
    } finally {
      setIsRunning(false);
    }
  };

  const copySummary = async () => {
    if (!result?.summary) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setFile(null);
    setText('');
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'auto',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 2,
        }}
      >
        <button
          onClick={onClose}
          style={btn('ghost')}
          aria-label="Back to tools"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <Sparkles size={18} style={{ color: 'var(--accent-color, #ec4899)' }} />
          <div style={{ fontWeight: 600, fontSize: 15 }}>Summarize</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            · PDF / DOCX / TXT / pasted text
          </div>
        </div>
        <button onClick={onClose} style={btn('ghost')} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: '28px 20px 80px',
          display: 'grid',
          gap: 20,
        }}
      >
        {/* Mode switch */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setMode('file');
              setError(null);
            }}
            style={{ ...pill(mode === 'file') }}
          >
            <UploadCloud size={14} /> Upload a file
          </button>
          <button
            onClick={() => {
              setMode('text');
              setError(null);
            }}
            style={{ ...pill(mode === 'text') }}
          >
            <FileText size={14} /> Paste text
          </button>
        </div>

        {/* Input */}
        {mode === 'file' ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${
                dragActive
                  ? 'var(--accent-color, #ec4899)'
                  : 'var(--border-color)'
              }`,
              borderRadius: 10,
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive
                ? 'rgba(236, 72, 153, 0.06)'
                : 'var(--bg-secondary)',
              transition: 'all 150ms ease',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={(e) => chooseFile(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
            {file ? (
              <div style={{ display: 'grid', gap: 6 }}>
                <FileText
                  size={28}
                  style={{ margin: '0 auto', opacity: 0.7 }}
                />
                <div style={{ fontWeight: 600 }}>{file.name}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  style={{
                    ...btn('ghost'),
                    fontSize: 12,
                    margin: '4px auto 0',
                  }}
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                <UploadCloud
                  size={32}
                  style={{ margin: '0 auto', opacity: 0.7 }}
                />
                <div style={{ fontWeight: 600 }}>
                  Drop a file here or click to browse
                </div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  PDF · DOCX · TXT — up to {MAX_MB} MB
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the text you want summarised — an article, an essay, meeting notes, a chapter, anything from ~40 characters up to ~60,000."
              rows={12}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                padding: 14,
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div
              style={{
                fontSize: 11,
                opacity: 0.55,
                marginTop: 6,
                textAlign: 'right',
              }}
            >
              {text.length.toLocaleString()} chars
            </div>
          </div>
        )}

        {/* Length + language */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}
        >
          <div>
            <div style={label}>Length</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LENGTH_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setLength(o.id)}
                  style={pill(length === o.id)}
                  title={o.hint}
                >
                  {o.label}
                  <span style={{ opacity: 0.6, marginLeft: 6, fontSize: 11 }}>
                    {o.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={label}>Language</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LANGUAGE_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setLanguage(o.id)}
                  style={pill(language === o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              fontSize: 13,
            }}
          >
            <AlertCircle
              size={16}
              style={{ color: '#ef4444', marginTop: 2, flexShrink: 0 }}
            />
            <div>{error}</div>
          </div>
        )}

        {/* Run button */}
        <div>
          <button
            disabled={!canRun || isRunning}
            onClick={runSummarize}
            style={{
              ...btn('primary'),
              opacity: !canRun || isRunning ? 0.5 : 1,
              cursor: !canRun || isRunning ? 'not-allowed' : 'pointer',
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="spin" /> Summarising…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Summarize
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result?.summary && (
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              background: 'var(--bg-secondary)',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              <Sparkles size={14} /> Summary
              <span style={{ marginLeft: 'auto', fontSize: 11 }}>
                {result.chars_in.toLocaleString()} chars in ·{' '}
                {result.chars_out.toLocaleString()} chars out ·{' '}
                {(result.ms / 1000).toFixed(1)}s
              </span>
            </div>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {result.summary}
            </div>
            <div style={{ marginTop: 16 }}>
              <button onClick={copySummary} style={btn('ghost')}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy summary'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const label = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.6,
  marginBottom: 8,
  fontWeight: 600,
};

const pill = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 999,
  border: `1px solid ${active ? 'var(--accent-color, #ec4899)' : 'var(--border-color)'}`,
  background: active ? 'rgba(236, 72, 153, 0.10)' : 'transparent',
  color: active ? 'var(--accent-color, #ec4899)' : 'var(--text-primary)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 120ms ease',
});

const btn = (variant) => {
  if (variant === 'primary') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--accent-color, #ec4899)',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '8px 14px',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
    };
  }
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  };
};
