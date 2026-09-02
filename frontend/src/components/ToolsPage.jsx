import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  Search,
  X,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Layers,
  FileUp,
} from 'lucide-react';
import { ALL_TOOLS, TOOL_CATEGORIES } from '../utils/toolsData';
import { getCsrfToken } from '../utils/security';
import ToolWorkspace from './ToolWorkspace';

export default function ToolsPage({
  onBackToChat,
  onOpenEditor,
  onOpenCompressor,
  onOpenWmRemover,
  theme,
  onToggleTheme,
}) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState(null);

  // Runner state for active tool
  const [files, setFiles] = useState([]);
  const [paramText, setParamText] = useState('');
  const [angle, setAngle] = useState('90');
  const [dragActive, setDragActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((t) => {
      const matchCat = selectedCat === 'all' || t.cat === selectedCat;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.cat.toLowerCase().includes(q) ||
        (t.hint && t.hint.toLowerCase().includes(q)) ||
        (t.desc && t.desc.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts = { all: ALL_TOOLS.length };
    ALL_TOOLS.forEach((t) => {
      counts[t.cat] = (counts[t.cat] || 0) + 1;
    });
    return counts;
  }, []);

  // Category groupings for "All" view without search
  const categorizedSections = useMemo(() => {
    if (selectedCat !== 'all' || searchQuery.trim()) return null;
    const cats = TOOL_CATEGORIES.filter((c) => c.id !== 'all');
    return cats.map((cat) => ({
      ...cat,
      tools: ALL_TOOLS.filter((t) => t.cat === cat.id),
    }));
  }, [selectedCat, searchQuery]);

  const resetRunner = () => {
    setFiles([]);
    setParamText('');
    setAngle('90');
    setResult(null);
    setErrorMsg(null);
    setIsRunning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectTool = (t) => {
    if (t.editor) {
      onOpenEditor?.();
      return;
    }
    if (t.compressor) {
      onOpenCompressor?.();
      return;
    }
    if (t.wmeditor) {
      onOpenWmRemover?.();
      return;
    }
    resetRunner();
    setActiveTool(t);
    if (t.param === 'lang') setAngle('assamese');
  };

  const closeRunner = () => {
    resetRunner();
    setActiveTool(null);
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const chooseFiles = (fileList) => {
    if (!activeTool) return;
    setErrorMsg(null);
    setResult(null);
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    const allowed = (activeTool.accept || '').split(',');
    for (const f of arr) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (allowed.length > 0 && allowed[0] && !allowed.includes(ext)) {
        setErrorMsg(`"${f.name}" is not valid for this tool. Allowed: ${activeTool.hint}.`);
        return;
      }
      if (f.size > 40 * 1024 * 1024) {
        setErrorMsg(`"${f.name}" exceeds the 40 MB size limit.`);
        return;
      }
    }
    setFiles(activeTool.multi ? arr : [arr[0]]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) chooseFiles(e.dataTransfer.files);
  };

  const requiresParamText =
    activeTool && ['pages', 'password', 'question'].includes(activeTool.param);
  const canRun = files.length > 0 && (!requiresParamText || paramText.trim());

  const runTool = async () => {
    if (!canRun || !activeTool) return;
    setIsRunning(true);
    setErrorMsg(null);
    setResult(null);

    const fd = new FormData();
    const url =
      activeTool.ep === 'convert'
        ? '/api/convert-file/'
        : activeTool.ep === 'ai'
        ? '/api/pdf-ai/'
        : '/api/pdf-tool/';

    if (activeTool.ep === 'convert') fd.append('target', activeTool.target);
    else fd.append('op', activeTool.op);

    if (activeTool.multi) files.forEach((f) => fd.append('files', f));
    else fd.append('file', files[0]);

    if (activeTool.param === 'pages') fd.append('pages', paramText.trim());
    if (activeTool.param === 'text') fd.append('text', paramText.trim() || 'CONFIDENTIAL');
    if (activeTool.param === 'password') fd.append('password', paramText.trim());
    if (activeTool.param === 'question') fd.append('question', paramText.trim());
    if (activeTool.param === 'angle') fd.append('angle', angle);
    if (activeTool.param === 'lang') fd.append('lang', angle);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() || '' },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Operation failed.');
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong while processing your document.');
    } finally {
      setIsRunning(false);
    }
  };

  const downloadFile = async (url, name) => {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error();
      const blob = await r.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const paramLabel = {
    pages: 'Specify page numbers (e.g. 1, 3-5, 8)',
    text: 'Watermark text (e.g. CONFIDENTIAL / Axom AI)',
    password: activeTool?.op === 'unlock' ? 'Current document password' : 'New secure password',
    question: 'Ask any question about this PDF content…',
  };

  const getCategoryTheme = (catName) => {
    const found = TOOL_CATEGORIES.find((c) => c.id === catName);
    return found || { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' };
  };

  return (
    <div className="tools-page">
      {/* TOPBAR */}
      <header className="tools-topbar">
        <div className="tools-topbar-left">
          <button className="tools-back-btn" onClick={onBackToChat} id="btnBackToChat" title="Return to Chat (Esc)">
            <ChevronLeft size={18} />
            <span className="tools-back-text">Chat</span>
          </button>
        </div>

        <div className="tools-topbar-center">
          <div className="tools-brand-badge">
            <svg className="tools-sparkle-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#tools_sparkle_grad)" />
              <defs>
                <linearGradient id="tools_sparkle_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C084FC" />
                  <stop offset="1" stopColor="#E879F9" />
                </linearGradient>
              </defs>
            </svg>
            <span className="tools-topbar-brand">Axom Tools</span>
          </div>
        </div>

        <div className="tools-topbar-right">
          <button className="tools-icon-btn" onClick={onToggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="tools-main-container">
        {/* HERO SECTION */}
        <section className="tools-hero">
          <div className="tools-hero-badge">
            <Sparkles size={14} />
            <span>Document & PDF Productivity Suite</span>
          </div>
          <h1 className="tools-hero-title">
            All-in-One <span className="gradient-text">File & PDF Tools</span>
          </h1>
          <p className="tools-hero-subtitle">
            Convert, organize, edit, optimize, secure and unlock AI superpowers for your documents — fast, private, and seamlessly integrated with Axom AI.
          </p>

          {/* SEARCH BAR */}
          <div className="tools-search-wrapper">
            <Search size={18} className="tools-search-icon" />
            <input
              type="text"
              className="tools-search-input"
              placeholder="Search tools by name, action or format (e.g., word, compress, ai, ocr, merge)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="toolsSearchInput"
            />
            {searchQuery && (
              <button className="tools-search-clear" onClick={() => setSearchQuery('')} title="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="tools-categories-bar" role="tablist">
            {TOOL_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`tools-cat-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCat(cat.id)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span>{cat.name}</span>
                  <span className="tools-cat-count">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* STRUCTURED TOOLS GRID */}
        <section className="tools-grid-section">
          {/* Grouped View (When "All" is active and not searching) */}
          {categorizedSections ? (
            categorizedSections.map((section) => (
              <div key={section.id} className="tools-category-group">
                <div className="tools-group-header">
                  <div className="tools-group-title-wrap">
                    <span
                      className="tools-group-accent-dot"
                      style={{ background: section.color }}
                    />
                    <h2 className="tools-group-title">{section.name} Tools</h2>
                    <span className="tools-group-badge">{section.tools.length}</span>
                  </div>
                </div>

                <div className="tools-grid">
                  {section.tools.map((t) => {
                    const themeObj = getCategoryTheme(t.cat);
                    return (
                      <div
                        key={t.id}
                        className="tool-card"
                        onClick={() => handleSelectTool(t)}
                        style={{ '--cat-color': themeObj.color, '--cat-bg': themeObj.bg }}
                      >
                        <div className="tool-card-top">
                          <div className="tool-card-icon" style={{ color: themeObj.color, background: themeObj.bg }}>
                            <t.icon size={22} />
                          </div>
                          <span className="tool-card-cat" style={{ color: themeObj.color, background: themeObj.bg }}>
                            {t.cat}
                          </span>
                        </div>

                        <div className="tool-card-body">
                          <h3 className="tool-card-name">{t.name}</h3>
                          <p className="tool-card-desc">{t.desc}</p>
                        </div>

                        <div className="tool-card-footer">
                          <span className="tool-card-hint">
                            <Layers size={12} /> {t.hint}
                          </span>
                          <span className="tool-card-action">
                            Launch <ArrowRight size={14} className="tool-arrow-icon" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* Flat Filtered / Searched Grid */
            <div>
              {filteredTools.length === 0 ? (
                <div className="tools-empty-state">
                  <FileUp size={44} className="tools-empty-icon" />
                  <h3>No matching tools found</h3>
                  <p>Try searching for a different keyword or select "All Tools".</p>
                  <button
                    className="tools-reset-btn"
                    onClick={() => {
                      setSelectedCat('all');
                      setSearchQuery('');
                    }}
                  >
                    View All Tools
                  </button>
                </div>
              ) : (
                <div className="tools-grid">
                  {filteredTools.map((t) => {
                    const themeObj = getCategoryTheme(t.cat);
                    return (
                      <div
                        key={t.id}
                        className="tool-card"
                        onClick={() => handleSelectTool(t)}
                        style={{ '--cat-color': themeObj.color, '--cat-bg': themeObj.bg }}
                      >
                        <div className="tool-card-top">
                          <div className="tool-card-icon" style={{ color: themeObj.color, background: themeObj.bg }}>
                            <t.icon size={22} />
                          </div>
                          <span className="tool-card-cat" style={{ color: themeObj.color, background: themeObj.bg }}>
                            {t.cat}
                          </span>
                        </div>

                        <div className="tool-card-body">
                          <h3 className="tool-card-name">{t.name}</h3>
                          <p className="tool-card-desc">{t.desc}</p>
                        </div>

                        <div className="tool-card-footer">
                          <span className="tool-card-hint">
                            <Layers size={12} /> {t.hint}
                          </span>
                          <span className="tool-card-action">
                            Launch <ArrowRight size={14} className="tool-arrow-icon" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Full-screen tool workspace: instant preview + tool-specific options */}
      {activeTool && <ToolWorkspace tool={activeTool} onClose={closeRunner} />}
    </div>
  );
}
