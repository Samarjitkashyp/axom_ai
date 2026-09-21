'use client';

import React, { useState, lazy, Suspense, useEffect } from 'react';

const TOOL_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'youtube-downloader': lazy(() => import('../chat/YouTubeDownloader')),
  'video-downloader': lazy(() => import('../chat/VideoDownloader')),
  'color-palette': lazy(() => import('../chat/ColorPaletteGen')),
  'ai-image-finder': lazy(() => import('../chat/ImageFinder')),
  'ai-video-finder': lazy(() => import('../chat/VideoFinder')),
  'ai-image-generator': lazy(() => import('../chat/ImageGenerator')),
  'ai-diagram-generator': lazy(() => import('../chat/DiagramGenerator')),
  'background-remover': lazy(() => import('../chat/BackgroundRemover')),
  'video-compressor': lazy(() => import('../chat/VideoCompressor')),
  'edit-pdf': lazy(() => import('../chat/PdfEditor')),
  'sign-pdf': lazy(() => import('../chat/PdfEditor')),
  'meme-generator': lazy(() => import('../chat/MemeGenerator')),
  'svg-editor': lazy(() => import('../chat/SvgEditor')),
  'remove-watermark': lazy(() => import('../chat/WatermarkRemover')),
  'summarize': lazy(() => import('../chat/Summarize')),
  'qr-code-generator': lazy(() => import('../chat/QrGenerator')),
  'screenshot-to-code': lazy(() => import('../chat/ScreenshotToCode')),
};

const DAILY_LIMIT_CONFIG: Record<string, { limit: number; keyPrefix: string; unit: string }> = {
  'youtube-downloader': { limit: 20, keyPrefix: 'axom_ytdl_usage_', unit: 'downloads' },
  'video-downloader': { limit: 20, keyPrefix: 'axom_vdl_usage_', unit: 'downloads' },
};

function getTodayUsage(keyPrefix: string): number {
  try {
    const d = new Date();
    const key = `${keyPrefix}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  } catch { return 0; }
}

const LoadingFallback = () => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="rounded-3xl p-1 bg-gradient-to-b from-fuchsia-500/30 via-purple-600/20 to-slate-900/40">
      <div className="rounded-[22px] bg-[#0c0d16]/95 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p className="text-slate-400 text-sm">Loading tool...</p>
      </div>
    </div>
  </div>
);

interface ToolEmbedClientProps {
  toolKey: string;
  buttonLabel?: string;
}

export default function ToolEmbedClient({ toolKey, buttonLabel = 'Use This Tool Now — Free' }: ToolEmbedClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(0);
  const ToolComponent = TOOL_MAP[toolKey];
  const limitConfig = DAILY_LIMIT_CONFIG[toolKey];

  useEffect(() => {
    if (limitConfig) {
      setDailyUsed(getTodayUsage(limitConfig.keyPrefix));
    }
  }, [isOpen]);

  if (!ToolComponent) {
    return <p className="text-red-400 text-center py-8">Tool not found: {toolKey}</p>;
  }

  if (isOpen) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ToolComponent onClose={() => setIsOpen(false)} />
      </Suspense>
    );
  }

  const remaining = limitConfig ? Math.max(0, limitConfig.limit - dailyUsed) : 0;
  const isLimitReached = limitConfig ? dailyUsed >= limitConfig.limit : false;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {limitConfig && (
        <div className="w-full max-w-lg mx-auto mb-2">
          <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">⚡</span>
              <span className="text-slate-300">
                Free Limit: <strong className="text-white">{remaining} / {limitConfig.limit} {limitConfig.unit}</strong> remaining today
              </span>
            </div>
            <a href="/pricing" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Upgrade for unlimited →
            </a>
          </div>
          {isLimitReached && (
            <div className="mt-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
              <span className="text-red-400 text-sm font-semibold">Daily Free Limit Reached ({limitConfig.limit}/{limitConfig.limit} {limitConfig.unit}): </span>
              <span className="text-slate-300 text-sm">Upgrade to Pro for unlimited access</span>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLimitReached}
        className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 ${
          isLimitReached
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.03]'
        }`}
      >
        <span>{buttonLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
      <p className="text-slate-400 text-sm">100% Free • No Sign-up Required • Secure & Private</p>
    </div>
  );
}
