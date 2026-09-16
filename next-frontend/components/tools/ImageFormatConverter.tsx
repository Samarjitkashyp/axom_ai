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
  Sparkles,
  ArrowRight,
  Layers,
  Files,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import { getCsrfToken } from '../chat/utils/security';

const ALLOWED_EXTS = ['.jfif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.gif', '.ico', '.avif', '.heic', '.heif', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
const FREE_DAILY_LIMIT = 20; // 20 files per day for free users
const PRO_BATCH_LIMIT = 20; // Up to 20 files at once for Pro users

const TARGET_FORMATS = [
  { value: 'png', label: 'PNG', desc: 'Lossless, Transparent' },
  { value: 'jpg', label: 'JPG', desc: 'Compressed, Smaller' },
  { value: 'webp', label: 'WebP', desc: 'Modern, Best Quality/Size' },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getTodayUsageKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `axom_ifc_usage_${today}`;
}

export interface ImageFormatConverterProps {
  freeDailyLimit?: number;
  proBatchLimit?: number;
  maxFileSizeMb?: number;
}

export default function ImageFormatConverter({
  freeDailyLimit = 20,
  proBatchLimit = 20,
  maxFileSizeMb = 25,
}: ImageFormatConverterProps = {}) {
  const effectiveMaxFileSize = (maxFileSizeMb || 25) * 1024 * 1024;
  const effectiveDailyLimit = freeDailyLimit || 20;
  const effectiveBatchLimit = proBatchLimit || 20;

  // Pro Subscription status
  const [isPro, setIsPro] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>('');

  // Daily Usage Tracking
  const [dailyUsage, setDailyUsage] = useState<number>(0);

  // Mode: 'single' | 'batch'
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Target format
  const [targetFormat, setTargetFormat] = useState<string>('png');

  // Files state (supports 1 or up to 20 files)
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<{
    downloadUrl: string;
    outputName: string;
    fileSize: string;
    isBatch?: boolean;
    count?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load daily usage and plan status on mount
  useEffect(() => {
    setMounted(true);
    // Read daily conversions count
    try {
      const key = getTodayUsageKey();
      const count = parseInt(localStorage.getItem(key) || '0', 10);
      setDailyUsage(isNaN(count) ? 0 : count);
    } catch (e) {}

    // Check Pro plan status from backend
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
    if (isPro) return; // Pro users have unlimited daily usage
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

      // If user is trying to upload multiple files in single mode or without Pro
      if (rawArr.length > 1 && !isPro && mode === 'single') {
        setShowUpgradeModal(true);
      }

      // Check daily limit for free user
      if (!isPro && dailyUsage >= effectiveDailyLimit) {
        setErrorMsg(`You have reached the free limit of ${effectiveDailyLimit} files for today. Please upgrade to Axom AI Premium for unlimited conversions.`);
        return;
      }

      const validFiles: File[] = [];
      for (const f of rawArr) {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTS.includes(ext)) {
          setErrorMsg(`"${f.name}" is not a supported image format (${ALLOWED_EXTS.join(', ')}).`);
          return;
        }
        if (f.size > effectiveMaxFileSize) {
          setErrorMsg(`"${f.name}" exceeds the ${maxFileSizeMb || 25} MB limit.`);
          return;
        }
        validFiles.push(f);
      }

      // If not Pro, only allow 1 file
      if (!isPro && mode !== 'batch') {
        const singleFile = validFiles[0];
        setFiles([singleFile]);
        return;
      }

      // In Batch mode or Pro mode
      if (rawArr.length > 1 && !isPro) {
        // Free user attempted batch
        setShowUpgradeModal(true);
        // Fallback to first file
        setFiles([validFiles[0]]);
        return;
      }

      // Cap at effectiveBatchLimit
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
    if (files.length <= 1) {
      resetAll();
    }
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
    setProgressMsg(isBatch ? `Uploading ${files.length} images securely...` : 'Uploading image securely...');

    const timer1 = setTimeout(() => {
      setProgressMsg(isBatch ? `Converting ${files.length} images to ${targetFormat.toUpperCase()}...` : `Converting to ${targetFormat.toUpperCase()} format...`);
    }, 900);
    const timer2 = setTimeout(() => {
      setProgressMsg(isBatch ? 'Bundling converted images into package...' : 'Finalizing high-quality output...');
    }, 2000);

    try {
      const formData = new FormData();
      formData.append('target', targetFormat);

      if (isBatch) {
        files.forEach((f) => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }

      const csrfToken = getCsrfToken();
      const res = await fetch('/api/convert-file/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: formData,
        credentials: 'same-origin',
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed. Please verify your image and try again.');
      }

      // Record daily usage for free users
      incrementDailyUsage(files.length);

      setResult({
        downloadUrl: data.download_url,
        outputName: data.output_name || (isBatch ? `converted_${files.length}_images.zip` : `${files[0].name.replace(/\.[^/.]+$/, '')}.${targetFormat}`),
        fileSize: data.file_size || (isBatch ? 'ZIP Archive' : `${targetFormat.toUpperCase()} Image`),
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
      {/* Tool Container Box with Glowing Border */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-fuchsia-500/30 via-purple-600/20 to-slate-900/40 shadow-2xl shadow-purple-950/40">
        <div className="relative rounded-[22px] bg-[#0c0d16]/95 backdrop-blur-xl p-5 sm:p-8 md:p-10 border border-white/5">

          {/* Header Title inside Widget & Mode Selector */}
          <div className="text-center mb-6">

            {/* Limit & Tier Indicator Banner */}
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
                  <span className="text-slate-500">•</span>
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
              Convert Image Format
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              Free users get <span className="text-purple-300 font-semibold">20 files/day</span>. Premium subscribers can convert up to <span className="text-fuchsia-300 font-semibold">20 files at once</span> with Pro Batch Mode.
            </p>

            {/* Mode Switcher (Single File vs Pro Batch) */}
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
                <ImageIcon size={14} />
                <span>Single Image (Free)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPro) {
                    setShowUpgradeModal(true);
                  } else {
                    setMode('batch');
                  }
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

          {/* Daily Limit Reached Warning */}
          {isDailyLimitReached && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold">Daily Free Limit Reached ({effectiveDailyLimit}/{effectiveDailyLimit} files): </span>
                  You have used your free daily quota of {effectiveDailyLimit} conversions. Upgrade to Premium to continue converting without limits.
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

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Notice: </span>
                {errorMsg}
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-rose-400 hover:text-white transition p-1"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* STATE 1: RESULT READY */}
          {result ? (
            <div className="py-8 px-4 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {result.isBatch ? `${result.count} Images Converted Successfully!` : 'Your Image is Ready!'}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {result.isBatch
                  ? `All ${result.count} images were converted to ${targetFormat.toUpperCase()} and packaged into a ZIP archive.`
                  : `Successfully converted to ${targetFormat.toUpperCase()} with quality preserved.`}
              </p>

              {/* Converted File Card */}
              <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 text-left truncate">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    {result.isBatch ? <Files size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-white truncate">
                      {result.outputName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {result.fileSize} • Converted via Axom AI
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  READY
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                <a
                  href={result.downloadUrl}
                  download={result.outputName}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-fuchsia-600/25 hover:shadow-fuchsia-600/40 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span>{result.isBatch ? 'Download All (ZIP)' : `Download ${targetFormat.toUpperCase()} Image`}</span>
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
            /* STATE 2: FILE(S) SELECTED / READY TO CONVERT */
            <div className="space-y-6 animate-in fade-in duration-150">

              {/* If Single File */}
              {files.length === 1 ? (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <ImageIcon size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-white truncate">
                        {files[0].name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{formatBytes(files[0].size)}</span>
                        <span>•</span>
                        <span className="uppercase text-purple-400 font-medium">
                          {files[0].name.split('.').pop()} image
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={resetAll}
                      disabled={isConverting}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition disabled:opacity-50"
                      title="Remove file"
                      aria-label="Remove selected image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Multi-File Batch View (Up to 20 files) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 px-1">
                    <span className="font-semibold flex items-center gap-2">
                      <Crown size={15} className="text-amber-400" />
                      <span>{files.length} Images Selected (Batch Mode)</span>
                    </span>
                    <span className="text-slate-400">
                      Total: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {files.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-slate-500 font-mono text-xs w-5">{idx + 1}.</span>
                          <ImageIcon size={16} className="text-blue-400 shrink-0" />
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

              {/* Target Format Selector */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Target Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TARGET_FORMATS.map((fmt) => (
                    <button
                      key={fmt.value}
                      type="button"
                      onClick={() => setTargetFormat(fmt.value)}
                      className={`p-3 rounded-xl border text-center transition ${
                        targetFormat === fmt.value
                          ? 'bg-purple-600/20 border-purple-500/50 shadow-md shadow-purple-600/10'
                          : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className={`text-sm font-bold ${targetFormat === fmt.value ? 'text-purple-300' : 'text-white'}`}>
                        {fmt.label}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                        {fmt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Action Button */}
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
                          ? `Convert All ${files.length} Images to ${targetFormat.toUpperCase()}`
                          : `Convert to ${targetFormat.toUpperCase()} Now`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STATE 3: DROPZONE (EMPTY) */
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
                id="image-file-input"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:text-fuchsia-300 transition duration-300">
                <UploadCloud size={32} />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition">
                {mode === 'batch' || isPro
                  ? 'Click to browse or drop up to 20 images'
                  : 'Click to browse or drop your image here'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
                Supports <span className="text-purple-300 font-semibold">JFIF</span>,{' '}
                <span className="text-purple-300 font-semibold">WebP</span>,{' '}
                <span className="text-purple-300 font-semibold">SVG</span>,{' '}
                <span className="text-purple-300 font-semibold">HEIC</span>,{' '}
                BMP, TIFF, GIF, ICO, AVIF, PNG, JPG and more
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold group-hover:bg-purple-600/30 transition">
                <ImageIcon size={14} />
                <span>
                  {mode === 'batch' || isPro
                    ? 'Select up to 20 Images (Batch Mode)'
                    : 'Select Image File (Free 20/day)'}
                </span>
              </div>
            </div>
          )}

          {/* Trust & Policy Details */}
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
              <span>Zero Retention • SSL Encrypted</span>
            </div>
          </div>

        </div>
      </div>

      {/* PRO BATCH MODAL (When free user attempts batch conversion) */}
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
              Free users can convert <strong className="text-purple-300">1 image at a time (up to 20 images per day)</strong>.
              <br className="hidden sm:inline" />
              Upgrade to <strong className="text-amber-300">Axom AI Premium</strong> to convert <strong className="text-white">up to 20 images simultaneously</strong> with 1-click batch ZIP download and unlimited daily access!
            </p>

            <div className="space-y-2.5 mb-6 text-left text-xs bg-slate-900/90 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Batch convert up to 20 images in 1 click</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Unlimited daily image conversions</span>
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
