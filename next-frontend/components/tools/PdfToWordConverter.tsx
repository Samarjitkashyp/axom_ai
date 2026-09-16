'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  RefreshCw,
  X,
  FileCheck,
  Shield,
  Zap,
  Lock,
  Crown,
  ArrowRight,
  Files
} from 'lucide-react';
import { getCsrfToken } from '../chat/utils/security';

const ALLOWED_EXTS = ['.pdf'];
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const FREE_DAILY_LIMIT = 20;
const PRO_BATCH_LIMIT = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getTodayUsageKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `axom_p2w_usage_${today}`;
}

export interface PdfToWordConverterProps {
  freeDailyLimit?: number;
  proBatchLimit?: number;
  maxFileSizeMb?: number;
}

export default function PdfToWordConverter({
  freeDailyLimit = 20,
  proBatchLimit = 20,
  maxFileSizeMb = 25,
}: PdfToWordConverterProps = {}) {
  const effectiveMaxFileSize = (maxFileSizeMb || 25) * 1024 * 1024;
  const effectiveDailyLimit = freeDailyLimit || 20;
  const effectiveBatchLimit = proBatchLimit || 20;

  const [isPro, setIsPro] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>('');
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [result, setResult] = useState<{
    downloadUrl: string;
    outputName: string;
    fileSize: string;
    isBatch?: boolean;
    count?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const key = getTodayUsageKey();
      const count = parseInt(localStorage.getItem(key) || '0', 10);
      setDailyUsage(isNaN(count) ? 0 : count);
    } catch (e) {}

    fetch('/api/plan/status/', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.active) {
          setIsPro(true);
          setPlanName(data.name || data.plan || 'Premium');
        }
      })
      .catch(() => {});
  }, []);

  const incrementDailyUsage = (count: number = 1) => {
    if (isPro) return;
    try {
      const key = getTodayUsageKey();
      const current = parseInt(localStorage.getItem(key) || '0', 10);
      const newCount = (isNaN(current) ? 0 : current) + count;
      localStorage.setItem(key, newCount.toString());
      setDailyUsage(newCount);
    } catch (e) {}
  };

  const isDailyLimitReached = !isPro && dailyUsage >= effectiveDailyLimit;
  const remainingFree = Math.max(0, effectiveDailyLimit - dailyUsage);

  const resetAll = () => {
    setFiles([]);
    setIsConverting(false);
    setErrorMsg(null);
    setResult(null);
    setProgressMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processSelectedFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setErrorMsg(null);
      setResult(null);

      const rawArr = Array.from(fileList);
      if (!rawArr.length) return;

      if (rawArr.length > 1 && !isPro && mode === 'single') {
        setShowUpgradeModal(true);
      }

      if (!isPro && dailyUsage >= effectiveDailyLimit) {
        setErrorMsg(`You have reached the free limit of ${effectiveDailyLimit} files for today. Please upgrade to Axom AI Premium for unlimited conversions.`);
        return;
      }

      const validFiles: File[] = [];
      for (const f of rawArr) {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTS.includes(ext)) {
          setErrorMsg(`"${f.name}" is not a supported PDF file.`);
          return;
        }
        if (f.size > effectiveMaxFileSize) {
          setErrorMsg(`"${f.name}" exceeds the ${maxFileSizeMb || 25} MB limit.`);
          return;
        }
        validFiles.push(f);
      }

      if (!isPro && mode !== 'batch') {
        setFiles([validFiles[0]]);
        return;
      }

      if (rawArr.length > 1 && !isPro) {
        setShowUpgradeModal(true);
        setFiles([validFiles[0]]);
        return;
      }

      const capped = validFiles.slice(0, effectiveBatchLimit);
      setFiles(capped);
    },
    [isPro, mode, dailyUsage, effectiveDailyLimit, effectiveMaxFileSize, effectiveBatchLimit, maxFileSizeMb]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (files.length <= 1) resetAll();
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    if (isDailyLimitReached) {
      setErrorMsg(`Daily free limit reached (${effectiveDailyLimit}/${effectiveDailyLimit} files converted). Please upgrade to Premium for unlimited conversions.`);
      return;
    }

    setIsConverting(true);
    setErrorMsg(null);

    const isBatch = files.length > 1;
    setProgressMsg(isBatch ? `Uploading ${files.length} PDF files securely...` : 'Uploading PDF securely...');

    const timer1 = setTimeout(() => {
      setProgressMsg(isBatch ? `Extracting text, tables and images from ${files.length} PDFs...` : 'Extracting text, tables and layout...');
    }, 900);
    const timer2 = setTimeout(() => {
      setProgressMsg(isBatch ? 'Building editable Word documents...' : 'Building editable Word document...');
    }, 2000);

    try {
      const formData = new FormData();
      formData.append('target', 'docx');

      if (isBatch) {
        files.forEach((f) => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }

      const csrfToken = getCsrfToken();
      const res = await fetch('/api/convert-file/', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formData,
        credentials: 'same-origin',
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed. Please verify your PDF file and try again.');
      }

      incrementDailyUsage(files.length);

      setResult({
        downloadUrl: data.download_url,
        outputName: data.output_name || (isBatch ? `converted_${files.length}_documents.zip` : `${files[0].name.replace(/\.[^/.]+$/, '')}.docx`),
        fileSize: data.file_size || (isBatch ? 'ZIP Archive' : 'Word Document'),
        isBatch,
        count: files.length,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during conversion.');
    } finally {
      setIsConverting(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-fuchsia-500/30 via-purple-600/20 to-slate-900/40 shadow-2xl shadow-purple-950/40">
        <div className="relative rounded-[22px] bg-[#0c0d16]/95 backdrop-blur-xl p-5 sm:p-8 md:p-10 border border-white/5">

          <div className="text-center mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {isPro ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-sm">
                  <Crown size={13} className="text-amber-400" />
                  <span>Pro Plan Active: Unlimited Conversions & 20-File Batch Mode</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold">
                  <Zap size={13} className="text-purple-400" />
                  <span>
                    Free Limit: <strong className="text-white">{remainingFree} / {FREE_DAILY_LIMIT} files</strong> remaining today
                  </span>
                  <span className="text-slate-500">|</span>
                  <a
                    href="https://chat.aiaxom.co.in/subscription"
                    className="text-fuchsia-400 hover:text-fuchsia-300 underline font-medium flex items-center gap-1 transition"
                  >
                    <span>Upgrade for Unlimited</span>
                    <ArrowRight size={11} />
                  </a>
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Convert PDF to Editable Word (.docx)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              Free users get <span className="text-purple-300 font-semibold">20 files/day</span>. Premium subscribers can convert up to <span className="text-fuchsia-300 font-semibold">20 files at once</span> with Pro Batch Mode.
            </p>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 mt-5 max-w-full">
              <button
                type="button"
                onClick={() => {
                  setMode('single');
                  if (files.length > 1) setFiles([files[0]]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  mode === 'single'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                <span>Single Document (Free)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPro) setShowUpgradeModal(true);
                  else setMode('batch');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  mode === 'batch'
                    ? 'bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Crown size={14} className="text-amber-400" />
                <span>Pro Batch (Up to {effectiveBatchLimit} Files)</span>
                {!isPro && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                    PRO
                  </span>
                )}
              </button>
            </div>
          </div>

          {isDailyLimitReached && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold">Daily Free Limit Reached ({effectiveDailyLimit}/{effectiveDailyLimit} files): </span>
                  You have used your free daily quota. Upgrade to Premium to continue converting without limits.
                </div>
              </div>
              <a
                href="https://chat.aiaxom.co.in/subscription"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white font-bold text-xs whitespace-nowrap shadow-md shadow-amber-500/20 hover:scale-105 transition"
              >
                Upgrade to Premium
              </a>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Notice: </span>
                {errorMsg}
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white transition p-1" aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}

          {result ? (
            <div className="py-8 px-4 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {result.isBatch ? `${result.count} Word Documents Ready!` : 'Your Word Document is Ready!'}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {result.isBatch
                  ? `All ${result.count} PDFs were converted to editable Word documents and packaged into a ZIP archive.`
                  : 'Successfully converted to an editable Word document with layout preserved.'}
              </p>

              <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 text-left truncate">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    {result.isBatch ? <Files size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-white truncate">{result.outputName}</div>
                    <div className="text-xs text-slate-400">{result.fileSize} &bull; Converted via Axom AI</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  READY
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                <a
                  href={result.downloadUrl}
                  download={result.outputName}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-fuchsia-600/25 hover:shadow-fuchsia-600/40 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span>{result.isBatch ? 'Download All (ZIP)' : 'Download Word Document'}</span>
                </a>

                <button
                  onClick={resetAll}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium text-sm transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>Convert More</span>
                </button>
              </div>
            </div>
          ) : files.length > 0 ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {files.length === 1 ? (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <FileText size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-white truncate">{files[0].name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{formatBytes(files[0].size)}</span>
                        <span>&bull;</span>
                        <span className="uppercase text-red-400 font-medium">PDF document</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetAll}
                    disabled={isConverting}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition disabled:opacity-50 self-end sm:self-auto"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 px-1">
                    <span className="font-semibold flex items-center gap-2">
                      <Crown size={15} className="text-amber-400" />
                      <span>{files.length} PDFs Selected (Batch Mode)</span>
                    </span>
                    <span className="text-slate-400">Total: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {files.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-slate-500 font-mono text-xs w-5">{idx + 1}.</span>
                          <FileText size={16} className="text-red-400 shrink-0" />
                          <span className="text-white truncate font-medium">{f.name}</span>
                          <span className="text-slate-400 text-xs shrink-0">({formatBytes(f.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          disabled={isConverting}
                          className="text-slate-400 hover:text-rose-400 p-1 transition"
                          title="Remove this file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting || isDailyLimitReached}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-fuchsia-600/30 hover:shadow-fuchsia-600/50 hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isConverting ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-white" />
                      <span>{progressMsg || 'Converting...'}</span>
                    </>
                  ) : (
                    <>
                      <FileCheck size={20} />
                      <span>
                        {files.length > 1
                          ? `Convert All ${files.length} PDFs to Word`
                          : 'Convert to Word Now'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition duration-200 group ${
                dragActive
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01]'
                  : 'border-white/15 bg-slate-900/40 hover:border-purple-400/50 hover:bg-slate-900/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={mode === 'batch' || isPro}
                accept={ALLOWED_EXTS.join(',')}
                onChange={handleFileChange}
                className="hidden"
                id="pdf-file-input"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:text-fuchsia-300 transition duration-300">
                <UploadCloud size={32} />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition">
                {mode === 'batch' || isPro
                  ? 'Click to browse or drop up to 20 PDF files'
                  : 'Click to browse or drop your PDF file here'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
                Supports <span className="text-purple-300 font-semibold">.PDF</span> files up to {maxFileSizeMb || 25} MB
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold group-hover:bg-purple-600/30 transition">
                <FileText size={14} />
                <span>
                  {mode === 'batch' || isPro
                    ? 'Select up to 20 Files (Batch Mode)'
                    : 'Select PDF File (Free 20/day)'}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5 text-slate-400 text-xs text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Shield size={16} className="text-emerald-400 shrink-0" />
              <span>Free Tier: 20 Files/Day</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Crown size={16} className="text-amber-400 shrink-0" />
              <span>Pro: Batch 20 Files at Once</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Lock size={16} className="text-fuchsia-400 shrink-0" />
              <span>Zero Retention &bull; SSL Encrypted</span>
            </div>
          </div>

        </div>
      </div>

      {showUpgradeModal && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-3xl bg-[#0e0f1c] border border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-black/80 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-fuchsia-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
              <Crown size={32} />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
              Unlock Pro Batch Conversion
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Free users can convert <strong className="text-purple-300">1 file at a time (up to 20 files per day)</strong>.
              <br className="hidden sm:inline" />
              Upgrade to <strong className="text-amber-300">Axom AI Premium</strong> to convert <strong className="text-white">up to 20 PDF files simultaneously</strong> with 1-click batch ZIP download and unlimited daily access!
            </p>

            <div className="space-y-2.5 mb-6 text-left text-xs bg-slate-900/90 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Batch convert up to 20 files in 1 click</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Unlimited daily document conversions</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Highest priority cloud conversion speeds</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href="https://chat.aiaxom.co.in/subscription"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-fuchsia-600/30 hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <Crown size={16} />
                <span>Upgrade to Premium Now</span>
              </a>

              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Continue with Free Single Mode (20 files/day)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
