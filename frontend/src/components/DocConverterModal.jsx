import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Download, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

// Every conversion the unified /api/convert-file/ endpoint supports.
const MODES = [
  { key: 'word2pdf', label: 'Word → PDF', accept: '.docx,.doc,.txt,.rtf,.md', target: 'pdf', multi: false, hint: 'DOCX, DOC, TXT, RTF' },
  { key: 'pdf2word', label: 'PDF → Word', accept: '.pdf', target: 'docx', multi: false, hint: 'PDF file' },
  { key: 'img2pdf', label: 'Image → PDF', accept: '.png,.jpg,.jpeg,.webp', target: 'pdf', multi: true, hint: 'PNG, JPG (one or many)' },
  { key: 'pdf2jpg', label: 'PDF → JPG', accept: '.pdf', target: 'jpg', multi: false, hint: 'PDF file' },
  { key: 'pdf2png', label: 'PDF → PNG', accept: '.pdf', target: 'png', multi: false, hint: 'PDF file' },
];

export default function DocConverterModal({ isOpen, onClose, onDocConvertedToChat }) {
  const [dragActive, setDragActive] = useState(false);
  const [modeKey, setModeKey] = useState('word2pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const mode = MODES.find((m) => m.key === modeKey) || MODES[0];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateAndProcessFiles = (fileList) => {
    setErrorMsg(null);
    setConversionResult(null);
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const allowed = mode.accept.split(',');
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        setErrorMsg(`"${file.name}" is not valid for ${mode.label}. Allowed: ${mode.hint}.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 25 MB limit.`);
        return;
      }
    }
    startConversion(mode.multi ? files : [files[0]]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) validateAndProcessFiles(e.target.files);
  };

  const startConversion = async (files) => {
    setIsConverting(true);
    setErrorMsg(null);
    setConversionResult(null);

    const formData = new FormData();
    formData.append('target', mode.target);
    if (mode.multi) files.forEach((f) => formData.append('files', f));
    else formData.append('file', files[0]);

    try {
      const response = await fetch('/api/convert-file/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() || '' },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed.');
      }
      setConversionResult(data);
      if (onDocConvertedToChat) onDocConvertedToChat(data);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const resetModal = () => {
    setConversionResult(null);
    setErrorMsg(null);
    setIsConverting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchMode = (key) => {
    setModeKey(key);
    resetModal();
  };

  return (
    <div className="doc-converter-overlay" onClick={onClose}>
      <div className="doc-converter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">File Converter</h3>
              <p className="modal-subtitle">Convert between Word, PDF and images — fast and offline</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Mode selector */}
        <div className="converter-mode-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 20px 4px' }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => switchMode(m.key)}
              disabled={isConverting}
              className={`converter-mode-btn ${modeKey === m.key ? 'active' : ''}`}
              style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: modeKey === m.key ? 'var(--accent-purple, #8b5cf6)' : 'transparent',
                color: modeKey === m.key ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {!conversionResult && (
            <div
              className={`dropzone-card ${dragActive ? 'active' : ''} ${isConverting ? 'converting' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isConverting && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept={mode.accept}
                multiple={mode.multi}
                onChange={handleFileChange}
                disabled={isConverting}
              />

              {isConverting ? (
                <div className="dropzone-converting">
                  <Loader2 size={36} className="spin-icon" />
                  <h4>Converting…</h4>
                  <p>Producing a high-quality {mode.target.toUpperCase()} file</p>
                  <div className="conversion-progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              ) : (
                <div className="dropzone-idle">
                  <div className="dropzone-icon">
                    <UploadCloud size={32} />
                  </div>
                  <h4>Choose a file or drag & drop here</h4>
                  <p className="dropzone-sub">{mode.label} — supports {mode.hint} (up to 25MB)</p>
                  <button type="button" className="btn-browse-file">Browse File{mode.multi ? 's' : ''}</button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="converter-error-box">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success / Result View */}
          {conversionResult && (
            <div className="converter-success-box">
              <div className="success-header">
                <CheckCircle size={22} className="success-icon" />
                <div>
                  <h4 className="success-title">Conversion Complete!</h4>
                  <p className="success-sub">{conversionResult.output_name}</p>
                </div>
              </div>

              <div className="pdf-details-card">
                <div className="pdf-card-left">
                  <div className="pdf-badge-icon">
                    <FileText size={24} />
                  </div>
                  <div className="pdf-info">
                    <span className="pdf-name">{conversionResult.output_name}</span>
                    <span className="pdf-meta">{conversionResult.file_size}</span>
                  </div>
                </div>
              </div>

              <div className="success-actions">
                <a
                  href={conversionResult.download_url}
                  download={conversionResult.output_name}
                  className="btn-download-pdf"
                >
                  <Download size={16} />
                  <span>Download</span>
                </a>
              </div>

              <div className="convert-another-wrapper">
                <button className="btn-convert-another" onClick={resetModal}>
                  Convert Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
