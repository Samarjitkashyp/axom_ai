'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Download, Loader2,
  RefreshCw, X, FileCheck, Shield, Zap, Lock, Eye, EyeOff, Crown,
  ArrowRight, Files, Image, Video, FileSpreadsheet, Presentation,
} from 'lucide-react';
import { getCsrfToken } from '../chat/utils/security';

const FREE_DAILY_LIMIT = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getTodayUsageKey(toolId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `axom_tool_usage_${toolId}_${today}`;
}

function getFileIcon(accept: string) {
  if (accept.includes('.pptx') || accept.includes('.ppt')) return Presentation;
  if (accept.includes('.xlsx') || accept.includes('.xls')) return FileSpreadsheet;
  if (accept.includes('.jpg') || accept.includes('.png') || accept.includes('.webp')) return Image;
  if (accept.includes('.mp4') || accept.includes('.mov')) return Video;
  return FileText;
}

export interface ToolConfig {
  id: string;
  name: string;
  cat: string;
  accept: string;
  hint: string;
  desc?: string;
  multi?: boolean;
  ep?: string;
  op?: string;
  target?: string;
  param?: string;
  customEndpoint?: string;
}

interface InlineToolConverterProps {
  tool: ToolConfig;
  maxFileSizeMb?: number;
  heading?: string;
  subheading?: string;
}

export default function InlineToolConverter({
  tool,
  maxFileSizeMb = 25,
  heading,
  subheading,
}: InlineToolConverterProps) {
  const effectiveMaxFileSize = maxFileSizeMb * 1024 * 1024;
  const allowedExts = tool.accept.split(',').map(e => e.trim());
  const FileIcon = getFileIcon(tool.accept);

  const [isPro, setIsPro] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Param input (pages, password, text, question, lang)
  const [paramText, setParamText] = useState('');
  const [angle, setAngle] = useState(tool.param === 'lang' ? 'assamese' : '');

  const [result, setResult] = useState<{
    downloadUrl: string;
    outputName: string;
    fileSize: string;
    isBatch?: boolean;
    count?: number;
    text?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const key = getTodayUsageKey(tool.id);
      const count = parseInt(localStorage.getItem(key) || '0', 10);
      setDailyUsage(isNaN(count) ? 0 : count);
    } catch {}
    fetch('/api/plan/status/', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.active) setIsPro(true); })
      .catch(() => {});
  }, [tool.id]);

  const incrementUsage = (count = 1) => {
    if (isPro) return;
    try {
      const key = getTodayUsageKey(tool.id);
      const cur = parseInt(localStorage.getItem(key) || '0', 10);
      const n = (isNaN(cur) ? 0 : cur) + count;
      localStorage.setItem(key, n.toString());
      setDailyUsage(n);
    } catch {}
  };

  const isDailyLimitReached = !isPro && dailyUsage >= FREE_DAILY_LIMIT;
  const remainingFree = Math.max(0, FREE_DAILY_LIMIT - dailyUsage);

  const needsParam = tool.param && ['pages', 'password', 'text', 'question'].includes(tool.param);
  const needsLang = tool.param === 'lang';

  const resetAll = () => {
    setFiles([]);
    setIsProcessing(false);
    setErrorMsg(null);
    setResult(null);
    setProgressMsg('');
    setParamText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = useCallback((fileList: FileList | File[]) => {
    setErrorMsg(null);
    setResult(null);
    const arr = Array.from(fileList);
    if (!arr.length) return;

    if (arr.length > 1 && !isPro) setShowUpgradeModal(true);
    if (!isPro && dailyUsage >= FREE_DAILY_LIMIT) {
      setErrorMsg(`You've reached the free limit of ${FREE_DAILY_LIMIT} files today. Upgrade for unlimited.`);
      return;
    }

    const valid: File[] = [];
    for (const f of arr) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext)) {
        setErrorMsg(`"${f.name}" is not supported. Allowed: ${tool.hint}`);
        return;
      }
      if (f.size > effectiveMaxFileSize) {
        setErrorMsg(`"${f.name}" exceeds the ${maxFileSizeMb} MB limit.`);
        return;
      }
      valid.push(f);
    }

    if (!isPro && mode !== 'batch') {
      setFiles([valid[0]]);
    } else if (arr.length > 1 && !isPro) {
      setShowUpgradeModal(true);
      setFiles([valid[0]]);
    } else {
      setFiles(valid.slice(0, 20));
    }
  }, [isPro, mode, dailyUsage, allowedExts, effectiveMaxFileSize, maxFileSizeMb, tool.hint]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleProcess = async () => {
    if (!files.length) return;
    if (isDailyLimitReached) {
      setErrorMsg(`Daily free limit reached. Upgrade to Premium for unlimited access.`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    const isBatch = files.length > 1;
    setProgressMsg(isBatch ? `Uploading ${files.length} files...` : 'Uploading file securely...');

    const t1 = setTimeout(() => setProgressMsg('Processing with AI engine...'), 1200);
    const t2 = setTimeout(() => setProgressMsg('Generating output...'), 3000);

    try {
      const fd = new FormData();
      const isConvert = tool.ep === 'convert';
      const endpoint = tool.customEndpoint || (isConvert ? '/api/convert-file/' : tool.ep === 'ai' ? '/api/pdf-ai/' : '/api/pdf-tool/');

      if (isConvert) {
        fd.append('target', tool.target || 'pdf');
      } else {
        fd.append('op', tool.op || tool.id);
      }

      if (isBatch || tool.multi) {
        files.forEach(f => fd.append('files', f));
      } else {
        fd.append('file', files[0]);
      }

      if (tool.param === 'pages') fd.append('pages', paramText.trim());
      if (tool.param === 'text') fd.append('text', paramText.trim() || 'CONFIDENTIAL');
      if (tool.param === 'password') fd.append('password', paramText.trim());
      if (tool.param === 'question') fd.append('question', paramText.trim());
      if (tool.param === 'lang') fd.append('lang', angle);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() },
        body: fd,
        credentials: 'same-origin',
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Processing failed. Please try again.');
      }

      incrementUsage(files.length);

      setResult({
        downloadUrl: data.download_url,
        outputName: data.output_name || `${tool.name.replace(/[^a-zA-Z0-9]/g, '_')}_result.pdf`,
        fileSize: data.file_size || 'Ready',
        isBatch,
        count: files.length,
        text: data.text || data.answer || data.summary,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  const paramLabels: Record<string, { label: string; placeholder: string }> = {
    pages: { label: 'Page Range', placeholder: 'e.g. 1, 3-5, 8' },
    password: { label: tool.op === 'unlock' ? 'Current Password' : 'Set Password', placeholder: 'Enter password...' },
    text: { label: 'Watermark Text', placeholder: 'e.g. CONFIDENTIAL' },
    question: { label: 'Your Question', placeholder: 'Ask a question about this PDF...' },
  };

  const languages = [
    { value: 'assamese', label: 'Assamese (অসমীয়া)' },
    { value: 'hindi', label: 'Hindi (हिन्दी)' },
    { value: 'bengali', label: 'Bengali (বাংলা)' },
    { value: 'english', label: 'English' },
    { value: 'tamil', label: 'Tamil (தமிழ்)' },
    { value: 'telugu', label: 'Telugu (తెలుగు)' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-fuchsia-500/30 via-purple-600/20 to-slate-900/40 shadow-2xl shadow-purple-950/40">
        <div className="relative rounded-[22px] bg-[#0c0d16]/95 backdrop-blur-xl p-5 sm:p-8 md:p-10 border border-white/5">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {isPro ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                  <Crown size={13} className="text-amber-400" />
                  <span>Pro Plan Active: Unlimited & Batch Mode</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold">
                  <Zap size={13} className="text-purple-400" />
                  <span>Free: <strong className="text-white">{remainingFree}/{FREE_DAILY_LIMIT}</strong> remaining today</span>
                  <span className="text-slate-500">•</span>
                  <a href="https://chat.aiaxom.co.in/subscription" className="text-fuchsia-400 hover:text-fuchsia-300 underline font-medium flex items-center gap-1 transition">
                    <span>Upgrade</span><ArrowRight size={11} />
                  </a>
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {heading || tool.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              {subheading || `Free users: ${FREE_DAILY_LIMIT} files/day. Premium: unlimited + batch mode.`}
            </p>

            {/* Mode Switcher */}
            {tool.multi && (
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 mt-5">
                <button onClick={() => { setMode('single'); if (files.length > 1) setFiles([files[0]]); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${mode === 'single' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                  <FileText size={14} /><span>Single (Free)</span>
                </button>
                <button onClick={() => isPro ? setMode('batch') : setShowUpgradeModal(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${mode === 'batch' ? 'bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-amber-300'}`}>
                  <Crown size={14} className="text-amber-400" /><span>Batch (Pro)</span>
                  {!isPro && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 rounded border border-amber-500/30 font-bold">PRO</span>}
                </button>
              </div>
            )}
          </div>

          {/* Daily Limit Warning */}
          {isDailyLimitReached && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-amber-400 shrink-0" />
                <span><strong>Daily limit reached.</strong> Upgrade for unlimited access.</span>
              </div>
              <a href="https://chat.aiaxom.co.in/subscription" className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white font-bold text-xs whitespace-nowrap shadow-md hover:scale-105 transition">
                Upgrade
              </a>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white transition p-1"><X size={16} /></button>
            </div>
          )}

          {/* RESULT STATE */}
          {result ? (
            <div className="py-8 px-4 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {result.isBatch ? `${result.count} Files Processed!` : 'Done! Your file is ready.'}
              </h3>

              {/* Text result for chat/summarize/translate */}
              {result.text && (
                <div className="w-full max-w-2xl mt-4 mb-4 p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 text-left text-sm text-slate-300 max-h-60 overflow-y-auto">
                  {result.text}
                </div>
              )}

              {result.downloadUrl && (
                <>
                  <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 text-left truncate">
                      <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                        {result.isBatch ? <Files size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-semibold text-white truncate">{result.outputName}</div>
                        <div className="text-xs text-slate-400">{result.fileSize} • via Axom AI</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">READY</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                    <a href={result.downloadUrl} download={result.outputName}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-fuchsia-600/25 hover:shadow-fuchsia-600/40 hover:scale-[1.02] transition flex items-center justify-center gap-2">
                      <Download size={18} /><span>{result.isBatch ? 'Download All (ZIP)' : 'Download Result'}</span>
                    </a>
                    <button onClick={resetAll} className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium text-sm transition flex items-center justify-center gap-2">
                      <RefreshCw size={16} /><span>Process More</span>
                    </button>
                  </div>
                </>
              )}
              {!result.downloadUrl && (
                <button onClick={resetAll} className="mt-4 py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium text-sm transition flex items-center justify-center gap-2">
                  <RefreshCw size={16} /><span>Process Another File</span>
                </button>
              )}
            </div>
          ) : files.length > 0 ? (
            /* FILE SELECTED STATE */
            <div className="space-y-5">
              {files.length === 1 ? (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <FileIcon size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-white truncate">{files[0].name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{formatBytes(files[0].size)}</span>
                        <span className="uppercase text-purple-400 font-medium">{files[0].name.split('.').pop()}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={resetAll} disabled={isProcessing} className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition disabled:opacity-50" title="Remove file">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                    <span className="font-semibold flex items-center gap-2"><Crown size={15} className="text-amber-400" />{files.length} Files Selected</span>
                    <span className="text-slate-400">Total: {formatBytes(files.reduce((a, f) => a + f.size, 0))}</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {files.map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-slate-500 font-mono w-5">{i + 1}.</span>
                          <FileIcon size={16} className="text-blue-400 shrink-0" />
                          <span className="text-white truncate font-medium">{f.name}</span>
                          <span className="text-slate-400 shrink-0">({formatBytes(f.size)})</span>
                        </div>
                        <button onClick={() => { setFiles(p => p.filter((_, j) => j !== i)); if (files.length <= 1) resetAll(); }} disabled={isProcessing} className="text-slate-400 hover:text-rose-400 p-1 transition"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Param Input */}
              {needsParam && tool.param && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">{paramLabels[tool.param]?.label || tool.param}</label>
                  {tool.param === 'question' ? (
                    <textarea value={paramText} onChange={e => setParamText(e.target.value)} placeholder={paramLabels[tool.param]?.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none resize-none" rows={3} />
                  ) : (
                    <input type={tool.param === 'password' ? 'password' : 'text'} value={paramText} onChange={e => setParamText(e.target.value)} placeholder={paramLabels[tool.param]?.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:border-purple-500/50 focus:outline-none" />
                  )}
                </div>
              )}

              {/* Language Selector */}
              {needsLang && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Target Language</label>
                  <select value={angle} onChange={e => setAngle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none">
                    {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              )}

              {/* Process Button */}
              <button onClick={handleProcess} disabled={isProcessing || isDailyLimitReached}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-fuchsia-600/30 hover:shadow-fuchsia-600/50 hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
                {isProcessing ? (
                  <><Loader2 size={20} className="animate-spin" /><span>{progressMsg || 'Processing...'}</span></>
                ) : (
                  <><FileCheck size={20} /><span>{files.length > 1 ? `Process All ${files.length} Files` : `${tool.name} — Convert Now`}</span></>
                )}
              </button>
            </div>
          ) : (
            /* DROPZONE STATE */
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition group ${
                dragActive ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01]' : 'border-white/15 bg-slate-900/40 hover:border-purple-400/50 hover:bg-slate-900/70'
              }`}>
              <input ref={fileInputRef} type="file" multiple={tool.multi && (mode === 'batch' || isPro)} accept={tool.accept}
                onChange={e => { if (e.target.files?.length) processFiles(e.target.files); }} className="hidden" />
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:text-fuchsia-300 transition duration-300">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition">
                Click to browse or drop your file here
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
                Supports <span className="text-purple-300 font-semibold">{tool.hint}</span> files
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold group-hover:bg-purple-600/30 transition">
                <FileIcon size={14} />
                <span>Select File (Free {FREE_DAILY_LIMIT}/day)</span>
              </div>
            </div>
          )}

          {/* Trust Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5 text-slate-400 text-xs text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Shield size={16} className="text-emerald-400 shrink-0" /><span>Free: {FREE_DAILY_LIMIT} Files/Day</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Crown size={16} className="text-amber-400 shrink-0" /><span>Pro: Unlimited + Batch</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Lock size={16} className="text-fuchsia-400 shrink-0" /><span>Zero Retention • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md p-4 flex items-center justify-center" onClick={() => setShowUpgradeModal(false)}>
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e0f1c] border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"><X size={18} /></button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4"><Crown size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Unlock Pro Batch Mode</h3>
            <p className="text-xs text-slate-300 mb-6">Free users: 1 file at a time ({FREE_DAILY_LIMIT}/day). Upgrade for batch processing up to 20 files.</p>
            <div className="space-y-2.5 mb-6 text-left text-xs bg-slate-900/90 p-4 rounded-xl border border-white/5">
              {['Batch up to 20 files at once', 'Unlimited daily usage', 'Priority processing speed'].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300"><CheckCircle2 size={14} className="text-emerald-400 shrink-0" /><span>{t}</span></div>
              ))}
            </div>
            <a href="https://chat.aiaxom.co.in/subscription" className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2">
              <Crown size={16} /><span>Upgrade to Premium</span>
            </a>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2.5 mt-2 text-xs text-slate-400 hover:text-slate-200 transition">Continue with Free</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
