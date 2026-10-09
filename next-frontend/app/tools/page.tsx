'use client';

import React, { useState } from 'react';
import ToolsPage from '@/components/chat/ToolsPage';
import PdfEditor from '@/components/chat/PdfEditor';
import PdfCompressor from '@/components/chat/PdfCompressor';
import VideoCompressor from '@/components/chat/VideoCompressor';
import ImageGenerator from '@/components/chat/ImageGenerator';
import ImageFinder from '@/components/chat/ImageFinder';
import VideoFinder from '@/components/chat/VideoFinder';
import DiagramGenerator from '@/components/chat/DiagramGenerator';
import SvgEditor from '@/components/chat/SvgEditor';
import QrGenerator from '@/components/chat/QrGenerator';
import ColorPaletteGen from '@/components/chat/ColorPaletteGen';
import ScreenshotToCode from '@/components/chat/ScreenshotToCode';
import MemeGenerator from '@/components/chat/MemeGenerator';
import BackgroundRemover from '@/components/chat/BackgroundRemover';
import VideoDownloader from '@/components/chat/VideoDownloader';
import YouTubeDownloader from '@/components/chat/YouTubeDownloader';
import '@/app/chat/chat.css';

export default function ToolsIndexPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCompressorOpen, setIsCompressorOpen] = useState(false);
  const [isVideoCompressorOpen, setIsVideoCompressorOpen] = useState(false);
  const [isImgGenOpen, setIsImgGenOpen] = useState(false);
  const [isImageFinderOpen, setIsImageFinderOpen] = useState(false);
  const [isVideoFinderOpen, setIsVideoFinderOpen] = useState(false);
  const [isDiagramGenOpen, setIsDiagramGenOpen] = useState(false);
  const [isSvgEditorOpen, setIsSvgEditorOpen] = useState(false);
  const [isQrGenOpen, setIsQrGenOpen] = useState(false);
  const [isPaletteGenOpen, setIsPaletteGenOpen] = useState(false);
  const [isScreenshot2CodeOpen, setIsScreenshot2CodeOpen] = useState(false);
  const [isMemeGenOpen, setIsMemeGenOpen] = useState(false);
  const [isBgRemoverOpen, setIsBgRemoverOpen] = useState(false);
  const [isVideoDownloaderOpen, setIsVideoDownloaderOpen] = useState(false);
  const [isYouTubeDownloaderOpen, setIsYouTubeDownloaderOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('axom_ai_theme') || 'dark';
  });

  const handleToggleTheme = () => {
    setTheme((prev: string) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('axom_ai_theme', next);
      document.body.className = next;
      return next;
    });
  };

  const handleBackToChat = () => {
    window.location.href = 'https://chat.aiaxom.co.in/';
  };

  return (
    <>
      <ToolsPage
        onBackToChat={handleBackToChat}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenCompressor={() => setIsCompressorOpen(true)}
        onOpenVideoCompressor={() => setIsVideoCompressorOpen(true)}
        onOpenImageGen={() => setIsImgGenOpen(true)}
        onOpenImageFinder={() => setIsImageFinderOpen(true)}
        onOpenVideoFinder={() => setIsVideoFinderOpen(true)}
        onOpenDiagramGen={() => setIsDiagramGenOpen(true)}
        onOpenSvgEditor={() => setIsSvgEditorOpen(true)}
        onOpenQrGen={() => setIsQrGenOpen(true)}
        onOpenPaletteGen={() => setIsPaletteGenOpen(true)}
        onOpenScreenshot2Code={() => setIsScreenshot2CodeOpen(true)}
        onOpenMemeGen={() => setIsMemeGenOpen(true)}
        onOpenBgRemover={() => setIsBgRemoverOpen(true)}
        onOpenVideoDownloader={() => setIsVideoDownloaderOpen(true)}
        onOpenYouTubeDownloader={() => setIsYouTubeDownloaderOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      {isEditorOpen && <PdfEditor onClose={() => setIsEditorOpen(false)} />}
      {isCompressorOpen && <PdfCompressor onClose={() => setIsCompressorOpen(false)} />}
      {isVideoCompressorOpen && <VideoCompressor onClose={() => setIsVideoCompressorOpen(false)} />}
      {isImgGenOpen && <ImageGenerator onClose={() => setIsImgGenOpen(false)} />}
      {isImageFinderOpen && <ImageFinder onClose={() => setIsImageFinderOpen(false)} />}
      {isVideoFinderOpen && <VideoFinder onClose={() => setIsVideoFinderOpen(false)} />}
      {isDiagramGenOpen && <DiagramGenerator onClose={() => setIsDiagramGenOpen(false)} />}
      {isSvgEditorOpen && <SvgEditor onClose={() => setIsSvgEditorOpen(false)} />}
      {isQrGenOpen && <QrGenerator onClose={() => setIsQrGenOpen(false)} />}
      {isPaletteGenOpen && <ColorPaletteGen onClose={() => setIsPaletteGenOpen(false)} />}
      {isScreenshot2CodeOpen && <ScreenshotToCode onClose={() => setIsScreenshot2CodeOpen(false)} />}
      {isMemeGenOpen && <MemeGenerator onClose={() => setIsMemeGenOpen(false)} />}
      {isBgRemoverOpen && <BackgroundRemover onClose={() => setIsBgRemoverOpen(false)} />}
      {isVideoDownloaderOpen && <VideoDownloader onClose={() => setIsVideoDownloaderOpen(false)} />}
      {isYouTubeDownloaderOpen && <YouTubeDownloader onClose={() => setIsYouTubeDownloaderOpen(false)} />}
    </>
  );
}
