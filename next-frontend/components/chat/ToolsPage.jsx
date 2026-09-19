'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  FileType2,
  Image as ImageIcon,
  Combine,
  Scissors,
  FileOutput,
  Minimize2,
  Droplets,
  Eraser,
  Lock,
  Unlock,
  Presentation,
  FileSpreadsheet,
  ScanText,
  MessagesSquare,
  Languages,
  PenTool,
  Signature,
  ImagePlus,
  Images,
  Video,
  Network,
  RefreshCw,
  QrCode,
  Palette,
  Code,
  Laugh,
  Wrench,
  Shapes,
} from 'lucide-react';
import { ALL_TOOLS, TOOL_CATEGORIES } from './utils/toolsData';
import { getCsrfToken } from './utils/security';
import ToolWorkspace from './ToolWorkspace';
import Navbar from '../Navbar';
import Footer from '../Footer';

const ICON_MAP = {
  FileType2,
  ImageIcon,
  Combine,
  Scissors,
  FileOutput,
  Minimize2,
  Droplets,
  Eraser,
  Lock,
  Unlock,
  Presentation,
  FileSpreadsheet,
  ScanText,
  MessagesSquare,
  Languages,
  Sparkles,
  PenTool,
  Signature,
  ImagePlus,
  Images,
  Video,
  Network,
  RefreshCw,
  QrCode,
  Palette,
  Code,
  Laugh,
  Wrench,
  Shapes,
};

export default function ToolsPage({
  onBackToChat,
  onOpenEditor,
  onOpenCompressor,
  onOpenVideoCompressor,
  onOpenWmRemover,
  onOpenImageGen,
  onOpenImageFinder,
  onOpenVideoFinder,
  onOpenDiagramGen,
  onOpenSummarizer,
  onOpenSvgEditor,
  onOpenQrGen,
  onOpenPaletteGen,
  onOpenScreenshot2Code,
  onOpenMemeGen,
  onOpenBgRemover,
  onOpenCanva,
  theme,
  onToggleTheme,
}) {
  const router = useRouter();
  const [toolsList, setToolsList] = useState(ALL_TOOLS);
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState(null);

  // Fetch dynamic tools from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicTools = async () => {
      try {
        const res = await fetch('/api/tools/');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.tools) && isMounted) {
          const dynamicTools = data.tools
            .filter((apiTool) => apiTool.is_active !== false)
            .map((apiTool) => {
              const localBase = ALL_TOOLS.find((t) => t.id === apiTool.slug || t.id === apiTool.id) || {};
              const iconComponent = ICON_MAP[apiTool.lucide_icon] || localBase.icon || Sparkles;

              return {
                ...localBase,
                id: apiTool.slug || apiTool.id,
                name: apiTool.name || localBase.name,
                cat: apiTool.category || localBase.cat || 'AI Tools',
                desc: apiTool.description || localBase.desc,
                hint: apiTool.hint || localBase.hint,
                badge: apiTool.badge || localBase.badge,
                order: apiTool.order !== undefined ? apiTool.order : (localBase.order || 0),
                is_active: apiTool.is_active !== undefined ? apiTool.is_active : true,
                is_featured: apiTool.is_featured !== undefined ? apiTool.is_featured : localBase.is_featured,
                icon: iconComponent,
                accept: apiTool.accept_types || localBase.accept,
                multi: apiTool.is_multi_file !== undefined ? apiTool.is_multi_file : localBase.multi,
                ep: apiTool.endpoint_type || localBase.ep,
                op: apiTool.operation || localBase.op,
                target: apiTool.target || localBase.target,
                param: apiTool.param_type || localBase.param,
                custom_url: apiTool.custom_url || localBase.custom_url,
                ...(apiTool.handler_type ? { [apiTool.handler_type]: true } : {}),
              };
            });

          if (dynamicTools.length > 0 && isMounted) {
            const disabledIds = new Set(data.disabled_slugs || []);
            const dynamicIds = new Set(dynamicTools.map((t) => t.id));
            const localOnly = ALL_TOOLS.filter((t) => !dynamicIds.has(t.id) && !disabledIds.has(t.id));
            setToolsList([...dynamicTools, ...localOnly]);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic tools from server, using local defaults.', err);
      }
    };

    fetchDynamicTools();
    return () => { isMounted = false; };
  }, []);

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
    return toolsList.filter((t) => {
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
  }, [toolsList, selectedCat, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts = { all: toolsList.length };
    toolsList.forEach((t) => {
      counts[t.cat] = (counts[t.cat] || 0) + 1;
    });
    return counts;
  }, [toolsList]);

  // Category groupings for "All" view without search
  const categorizedSections = useMemo(() => {
    if (selectedCat !== 'all' || searchQuery.trim()) return null;
    const cats = TOOL_CATEGORIES.filter((c) => c.id !== 'all');
    return cats
      .map((cat) => ({
        ...cat,
        tools: toolsList.filter((t) => t.cat === cat.id),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [toolsList, selectedCat, searchQuery]);

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
    if (t.id === 'word2pdf') {
      router.push('/tools/word-to-pdf');
      return;
    }
    if (t.id === 'pdf2word') {
      router.push('/tools/pdf-to-word');
      return;
    }
    if (t.id === 'img2pdf') {
      router.push('/tools/image-to-pdf');
      return;
    }
    if (t.id === 'pdf2jpg') {
      router.push('/tools/pdf-to-jpg');
      return;
    }
    if (t.id === 'pdf2png') {
      router.push('/tools/pdf-to-png');
      return;
    }
    if (t.id === 'imgconvert') {
      router.push('/tools/image-format-converter');
      return;
    }
    if (t.editor) {
      onOpenEditor?.();
      return;
    }
    if (t.compressor) {
      onOpenCompressor?.();
      return;
    }
    if (t.videocompressor) {
      onOpenVideoCompressor?.();
      return;
    }
    if (t.wmeditor) {
      onOpenWmRemover?.();
      return;
    }
    if (t.imagegen) {
      onOpenImageGen?.();
      return;
    }
    if (t.imagefinder) {
      onOpenImageFinder?.();
      return;
    }
    if (t.videofinder) {
      onOpenVideoFinder?.();
      return;
    }
    if (t.diagramgen) {
      onOpenDiagramGen?.();
      return;
    }
    if (t.summarizer) {
      onOpenSummarizer?.();
      return;
    }
    if (t.svgeditor) {
      onOpenSvgEditor?.();
      return;
    }
    if (t.qrgen) {
      onOpenQrGen?.();
      return;
    }
    if (t.palettegen) {
      onOpenPaletteGen?.();
      return;
    }
    if (t.screenshot2code) {
      onOpenScreenshot2Code?.();
      return;
    }
    if (t.memegen) {
      onOpenMemeGen?.();
      return;
    }
    if (t.bgremover) {
      onOpenBgRemover?.();
      return;
    }
    if (t.canva || t.id === 'canva' || t.slug === 'canva') {
      onOpenCanva?.();
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
    <div className="tools-page min-h-screen flex flex-col bg-[#06060b] text-gray-100">
      {/* GLOBAL REUSABLE NAVBAR */}
      <Navbar onBackToChat={onBackToChat} />

      {/* SUB-BAR FOR WORKSPACE NAVIGATION */}
      <div className="tools-workspace-subbar pt-24 px-5 max-w-7xl mx-auto w-full flex items-center justify-between z-20">
        <button
          className="tools-back-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition text-xs font-semibold border border-white/10"
          onClick={onBackToChat}
          id="btnBackToChat"
          title="Return to Chat (Esc)"
        >
          <ChevronLeft size={16} />
          <span>Return to Chat</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="tools-brand-badge hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-medium">
            <Sparkles size={13} className="text-fuchsia-400" />
            <span>Productivity Suite</span>
          </div>
          <button
            className="tools-icon-btn w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center text-gray-300 hover:text-white transition"
            onClick={onToggleTheme}
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <main className="tools-main-container flex-1">
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
            {TOOL_CATEGORIES.filter((cat) => cat.id === 'all' || (categoryCounts[cat.id] || 0) > 0).map((cat) => {
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

      {/* GLOBAL REUSABLE FOOTER */}
      <Footer />

      {/* Full-screen tool workspace: instant preview + tool-specific options */}
      {activeTool && <ToolWorkspace tool={activeTool} onClose={closeRunner} />}
    </div>
  );
}
