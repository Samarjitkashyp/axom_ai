'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import {
  X, Upload, Download, RotateCcw, Image as ImageIcon,
  Scissors, Eye, ZoomIn, ZoomOut, Copy, Check,
  Sparkles, Palette, Zap, Sliders, ShieldCheck,
  Layers, Sun, Moon, Maximize2, Crop, FileImage,
  Paintbrush, Eraser, Undo2, Redo2, Circle, SunMedium,
  ShoppingBag, UserCheck, CheckCircle2, ChevronRight, SlidersHorizontal,
  FolderArchive, Grid, FileCheck, Move, FlipHorizontal, FlipVertical,
  Printer, Camera, Tag, Shield, Award, AlertCircle, RefreshCw,
  QrCode, Type, History, Compass, Box, Flame, Video, VideoOff
} from 'lucide-react';
import { getCsrfToken } from './utils/security';

const COLOR_CATEGORIES = [
  {
    category: 'Studio Neutrals',
    colors: ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8'],
  },
  {
    category: 'Dark & Luxury',
    colors: ['#000000', '#0f172a', '#18181b', '#1e293b', '#27272a', '#3f3f46'],
  },
  {
    category: 'Passport Official',
    colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#38bdf8', '#0284c7', '#f1f5f9'],
  },
  {
    category: 'Soft Pastels',
    colors: ['#fef3c7', '#d1fae5', '#dbeafe', '#ede9fe', '#fce7f3', '#ffedd5'],
  },
  {
    category: 'Vibrant & Brand',
    colors: ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
  },
];

const GRADIENT_PRESETS = [
  { label: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { label: 'Ocean Depths', value: 'linear-gradient(135deg, #0284c7, #06b6d4)' },
  { label: 'Emerald Aurora', value: 'linear-gradient(135deg, #059669, #10b981)' },
  { label: 'Cosmic Violet', value: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { label: 'Midnight Slate', value: 'linear-gradient(135deg, #0f172a, #312e81)' },
  { label: 'Golden Hour', value: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { label: 'Silk Rose', value: 'linear-gradient(135deg, #f43f5e, #fda4af)' },
  { label: 'Nordic Ice', value: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' },
];

const ASPECT_RATIOS = [
  { id: 'original', label: 'Original', ratio: null },
  { id: '1:1', label: '1:1 Square', ratio: 1 / 1 },
  { id: '4:5', label: '4:5 Insta', ratio: 4 / 5 },
  { id: '16:9', label: '16:9 Banner', ratio: 16 / 9 },
  { id: '9:16', label: '9:16 Story', ratio: 9 / 16 },
  { id: 'passport', label: 'Passport (7:9)', ratio: 7 / 9 },
];

const PASSPORT_PRESETS = [
  { id: 'in_passport', label: 'Indian Passport / PAN (3.5x4.5cm)', ratio: 7 / 9, bg: '#bae6fd' },
  { id: 'us_visa', label: 'US Visa / Green Card (2x2")', ratio: 1 / 1, bg: '#ffffff' },
  { id: 'schengen', label: 'Schengen / EU Visa (3.5x4.5cm)', ratio: 7 / 9, bg: '#f1f5f9' },
];

const PODIUM_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'marble', label: 'White Marble Stand' },
  { id: 'obsidian', label: 'Dark Obsidian Pedestal' },
  { id: 'wood', label: 'Natural Birch Wood Log' },
  { id: 'concrete', label: 'Minimalist Concrete Slab' },
  { id: 'gold', label: 'Luxury Gold Trim Stage' },
];

const NEON_COLORS = [
  { label: 'Cyan', color: '#00f0ff' },
  { label: 'Hot Pink', color: '#ff007f' },
  { label: 'Toxic Lime', color: '#39ff14' },
  { label: 'Violet', color: '#9d00ff' },
  { label: 'Gold', color: '#ffe600' },
  { label: 'Pure White', color: '#ffffff' },
];

const PROMO_BADGES = [
  { id: 'none', label: 'None', text: '' },
  { id: 'sale_50', label: 'SALE 50% OFF', text: 'SALE 50% OFF', bg: '#ef4444', color: '#fff' },
  { id: 'new_arrival', label: 'NEW ARRIVAL', text: '★ NEW ARRIVAL ★', bg: '#8b5cf6', color: '#fff' },
  { id: 'bestseller', label: 'BESTSELLER', text: '🔥 BESTSELLER', bg: '#f59e0b', color: '#000' },
  { id: 'verified', label: 'VERIFIED QUALITY', text: '✓ 100% VERIFIED', bg: '#10b981', color: '#fff' },
  { id: 'exclusive', label: 'EXCLUSIVE', text: '💎 EXCLUSIVE', bg: '#06b6d4', color: '#fff' },
];

const STICKER_COLORS = [
  '#ffffff', '#facc15', '#22d3ee', '#ec4899', '#10b981', '#a855f7', '#000000'
];

const CHECKER_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23222638'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23222638'/%3E%3Crect x='10' width='10' height='10' fill='%23171926'/%3E%3Crect y='10' width='10' height='10' fill='%23171926'/%3E%3C/svg%3E")`;

export default function BackgroundRemover({ onClose }) {
  const fileInputRef = useRef(null);
  const bulkInputRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const watermarkInputRef = useRef(null);
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const brushCanvasRef = useRef(null);

  // ── Mode Switcher: Studio Mode vs Batch/Bulk Mode ──────────────
  const [appMode, setAppMode] = useState('studio'); // 'studio' | 'bulk'

  // ── Studio Base States ─────────────────────────────────────────
  const [original, setOriginal] = useState(null);
  const [result, setResult] = useState(null); // base AI cutout
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  // Background options
  // 'transparent' | 'color' | 'gradient' | 'blur' | 'colorsplash' | 'custom'
  const [bgMode, setBgMode] = useState('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [customBgUrl, setCustomBgUrl] = useState(null);

  // ── DSLR Portrait Bokeh States ────────────────────────────────
  const [blurAmount, setBlurAmount] = useState(18); // 0 - 45px
  const [bokehStyle, setBokehStyle] = useState('smooth'); // 'smooth' | 'creamy' | 'vignette'

  // ── Color Splash States ───────────────────────────────────────
  const [desaturation, setDesaturation] = useState(100); // 0% - 100%

  // ── Custom Background Interactive Positioning ──────────────────
  const [subjectPosX, setSubjectPosX] = useState(0); // -150 to +150
  const [subjectPosY, setSubjectPosY] = useState(0); // -150 to +150
  const [subjectScale, setSubjectScale] = useState(1.0); // 0.5 to 1.6
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // ── 3D Studio Podiums & Mockups ───────────────────────────────
  const [podiumType, setPodiumType] = useState('none'); // 'none' | 'marble' | 'obsidian' | 'wood' | 'concrete' | 'gold'

  // ── Cyber Neon Glow & Aura Light ──────────────────────────────
  const [neonEnabled, setNeonEnabled] = useState(false);
  const [neonColor, setNeonColor] = useState('#00f0ff');
  const [neonRadius, setNeonRadius] = useState(16); // 2 - 45px
  const [neonIntensity, setNeonIntensity] = useState(0.85); // 0.2 - 1.0

  // ── 360° Directional Sunlight Shadow ──────────────────────────
  const [sunShadowEnabled, setSunShadowEnabled] = useState(false);
  const [sunAngle, setSunAngle] = useState(45); // 0° - 360°
  const [sunDistance, setSunDistance] = useState(24); // 0 - 90px
  const [sunBlur, setSunBlur] = useState(18); // 0 - 50px
  const [sunOpacity, setSunOpacity] = useState(0.5); // 0.1 - 1.0

  // ── Edge De-Fringe / Halo Cleaner ─────────────────────────────
  const [defringe, setDefringe] = useState(0); // 0% - 100%

  // ── Smart Typography & Price Tag Studio ───────────────────────
  const [textOverlay, setTextOverlay] = useState('');
  const [textFont, setTextFont] = useState('system-ui, sans-serif');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(36);
  const [textLayer, setTextLayer] = useState('front'); // 'front' | 'behind'
  const [textPosY, setTextPosY] = useState(50); // % vertical position

  // ── Dynamic QR Code Generator Overlay ─────────────────────────
  const [qrEnabled, setQrEnabled] = useState(false);
  const [qrText, setQrText] = useState('https://aiaxom.co.in');
  const [qrSize, setQrSize] = useState(110);
  const [qrPos, setQrPos] = useState('bottom-right');
  const [qrOpacity, setQrOpacity] = useState(0.9);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // ── Target File Size Compressor (Govt / KYC Mode) ─────────────
  const [targetKbMode, setTargetKbMode] = useState('auto'); // 'auto' | '20' | '50' | '100' | '200' | 'custom'
  const [customTargetKb, setCustomTargetKb] = useState(50);

  // ── Direct Mobile Camera Scan / Webcam ────────────────────────
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'

  // ── Local Project Autosave & History ──────────────────────────
  const [recentHistory, setRecentHistory] = useState([]);

  // Quality & Studio options
  const [quality, setQuality] = useState('standard'); // 'standard' | 'extreme'
  const [tab, setTab] = useState('compare'); // 'compare' | 'side' | 'result' | 'original' | 'touchup'
  const [zoom, setZoom] = useState(1);
  const [compositeUrl, setCompositeUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ── Next-Gen Export Settings ──────────────────────────────────
  const [exportFormat, setExportFormat] = useState('png'); // 'png' | 'webp' | 'jpeg'
  const [exportQuality, setExportQuality] = useState(0.92); // 0.8, 0.92, 1.0
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [estimatedSizes, setEstimatedSizes] = useState({ png: '', webp: '', jpeg: '' });
  const [upscale2x, setUpscale2x] = useState(false);

  // ── Studio Navigation Category Tabs ───────────────────────────
  // 'backdrop' | 'touchup' | 'lighting' | 'ecomm' | 'typography' | 'framing' | 'export'
  const [activeTabGroup, setActiveTabGroup] = useState('backdrop');

  // ── Advanced Creative Tools States ────────────────────────────
  const [aspectRatio, setAspectRatio] = useState('original');
  const [stickerEnabled, setStickerEnabled] = useState(false);
  const [stickerWidth, setStickerWidth] = useState(8);
  const [stickerColor, setStickerColor] = useState('#ffffff');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowOpacity, setShadowOpacity] = useState(0.45);
  const [shadowOffsetY, setShadowOffsetY] = useState(12);

  // ── Passport Mode & Alignment Guide ───────────────────────────
  const [passportMode, setPassportMode] = useState(null); // 'in_passport' | 'us_visa' | 'schengen' | null
  const [showPassportGuide, setShowPassportGuide] = useState(false);
  const [printSheetGenerated, setPrintSheetGenerated] = useState(false);

  // ── Manual Touch-up Brush Engine States ───────────────────────
  const [brushMode, setBrushMode] = useState('erase'); // 'erase' | 'restore' | 'spot'
  const [brushSize, setBrushSize] = useState(24);
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushPos, setBrushPos] = useState({ x: -100, y: -100 });
  const [brushMaskCanvas, setBrushMaskCanvas] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // ── Lighting & Color Harmonization States ─────────────────────
  const [brightness, setBrightness] = useState(0); // -50 to +50
  const [contrast, setContrast] = useState(0); // -50 to +50
  const [saturation, setSaturation] = useState(0); // -100 to +100
  const [warmth, setWarmth] = useState(0); // -50 (cool) to +50 (warm golden)
  const [edgeSharpness, setEdgeSharpness] = useState(0); // 0% to 100% detail enhancer

  // ── E-Commerce & Branding Presets States ───────────────────────
  const [floorShadow, setFloorShadow] = useState(false);
  const [floorShadowOpacity, setFloorShadowOpacity] = useState(0.5);
  const [mirrorReflection, setMirrorReflection] = useState(false);
  const [autoPadding, setAutoPadding] = useState(false); // 15% marketplace padding
  const [circularDp, setCircularDp] = useState(false);
  const [circularBorderColor, setCircularBorderColor] = useState('#ec4899');
  const [circularBorderWidth, setCircularBorderWidth] = useState(6);

  // ── Watermark & Promotional Badges ────────────────────────────
  const [watermarkUrl, setWatermarkUrl] = useState(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.75);
  const [watermarkPos, setWatermarkPos] = useState('bottom-right');
  const [watermarkScale, setWatermarkScale] = useState(20);
  const [activeBadge, setActiveBadge] = useState('none');
  const [badgePos, setBadgePos] = useState('top-left');

  // ── Batch / Bulk Processing States ────────────────────────────
  const [bulkQueue, setBulkQueue] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ completed: 0, total: 0 });
  const [bulkZipping, setBulkZipping] = useState(false);
  const [bulkZipFormat, setBulkZipFormat] = useState('png');

  // Load Recent History from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('axom_bgr_history');
      if (saved) {
        setRecentHistory(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to history when result is available
  const saveToHistory = useCallback((origUrl, resUrl) => {
    try {
      const newItem = {
        id: Date.now(),
        original: origUrl,
        result: resUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setRecentHistory((prev) => {
        const filtered = prev.filter((i) => i.original !== origUrl);
        const updated = [newItem, ...filtered].slice(0, 6);
        try {
          localStorage.setItem('axom_bgr_history', JSON.stringify(updated));
        } catch (err) {
          // ignore quota error
        }
        return updated;
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Live QR Code Generation
  useEffect(() => {
    if (qrEnabled && qrText) {
      QRCode.toDataURL(qrText, { width: 300, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    } else {
      setQrDataUrl(null);
    }
  }, [qrEnabled, qrText]);

  // Timer for feedback
  useEffect(() => {
    let timer;
    if (loading) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Initialize Touch-Up Alpha Mask when a new result arrives
  useEffect(() => {
    if (!result) {
      setBrushMaskCanvas(null);
      setHistoryStack([]);
      setHistoryStep(-1);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      setBrushMaskCanvas(c);
      const snapshot = ctx.getImageData(0, 0, c.width, c.height);
      setHistoryStack([snapshot]);
      setHistoryStep(0);
    };
    img.src = result;
  }, [result]);

  // Touch-Up Undo / Redo
  const handleUndo = () => {
    if (historyStep > 0 && brushMaskCanvas) {
      const newStep = historyStep - 1;
      const snapshot = historyStack[newStep];
      const ctx = brushMaskCanvas.getContext('2d');
      ctx.putImageData(snapshot, 0, 0);
      setHistoryStep(newStep);
      compositeImage();
    }
  };

  const handleRedo = () => {
    if (historyStep < historyStack.length - 1 && brushMaskCanvas) {
      const newStep = historyStep + 1;
      const snapshot = historyStack[newStep];
      const ctx = brushMaskCanvas.getContext('2d');
      ctx.putImageData(snapshot, 0, 0);
      setHistoryStep(newStep);
      compositeImage();
    }
  };

  const pushHistorySnapshot = () => {
    if (!brushMaskCanvas) return;
    const ctx = brushMaskCanvas.getContext('2d');
    const snapshot = ctx.getImageData(0, 0, brushMaskCanvas.width, brushMaskCanvas.height);
    const newStack = historyStack.slice(0, historyStep + 1);
    newStack.push(snapshot);
    if (newStack.length > 12) newStack.shift();
    setHistoryStack(newStack);
    setHistoryStep(newStack.length - 1);
  };

  // Interactive Touch-Up Brush Drawing
  const applyBrushStroke = (canvasX, canvasY) => {
    if (!brushMaskCanvas || !original) return;
    const ctx = brushMaskCanvas.getContext('2d');

    ctx.save();
    ctx.beginPath();
    const radius = brushSize / 2;
    ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);

    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
    } else if (brushMode === 'spot') {
      // Feathered spot blemish cleaner
      ctx.globalCompositeOperation = 'destination-out';
      const grad = ctx.createRadialGradient(canvasX, canvasY, radius * 0.2, canvasX, canvasY, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    } else {
      // Restore Mode: draw original pixels inside the brush circle
      ctx.clip();
      const origImg = new Image();
      origImg.src = original;
      ctx.drawImage(origImg, 0, 0, brushMaskCanvas.width, brushMaskCanvas.height);
    }
    ctx.restore();
    compositeImage();
  };

  const handleBrushStart = (e) => {
    if (tab !== 'touchup' || !brushCanvasRef.current || !brushMaskCanvas) return;
    setIsBrushing(true);
    const rect = brushCanvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = brushMaskCanvas.width / rect.width;
    const scaleY = brushMaskCanvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    applyBrushStroke(x, y);
  };

  const handleBrushMove = (e) => {
    if (!brushCanvasRef.current || !brushMaskCanvas) return;
    const rect = brushCanvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setBrushPos({ x: clientX - rect.left, y: clientY - rect.top });

    if (!isBrushing) return;
    const scaleX = brushMaskCanvas.width / rect.width;
    const scaleY = brushMaskCanvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    applyBrushStroke(x, y);
  };

  const handleBrushEnd = () => {
    if (isBrushing) {
      setIsBrushing(false);
      pushHistorySnapshot();
    }
  };

  // ── Master Canvas Compositing Engine (100% Client-Side) ───────
  const compositeImage = useCallback(async () => {
    if (!result) return;

    try {
      // Source image: user-edited mask canvas or original result
      const sourceCanvas = brushMaskCanvas || (await (async () => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        await new Promise((res) => { i.onload = res; i.src = result; });
        const c = document.createElement('canvas');
        c.width = i.naturalWidth || i.width;
        c.height = i.naturalHeight || i.height;
        c.getContext('2d').drawImage(i, 0, 0);
        return c;
      })());

      const origW = sourceCanvas.width;
      const origH = sourceCanvas.height;
      setImgDimensions({ width: origW, height: origH });

      // Determine dimensions with Aspect Ratio & Auto-Padding
      let targetW = origW;
      let targetH = origH;

      const targetRatioObj = ASPECT_RATIOS.find((r) => r.id === aspectRatio);
      if (targetRatioObj?.ratio) {
        const r = targetRatioObj.ratio;
        if (origW / origH > r) {
          targetW = origW;
          targetH = Math.round(origW / r);
        } else {
          targetH = origH;
          targetW = Math.round(origH * r);
        }
      }

      // Add uniform 15% marketplace padding if enabled
      if (autoPadding) {
        targetW = Math.round(targetW * 1.25);
        targetH = Math.round(targetH * 1.25);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Draw Background Layer
      if (bgMode === 'color' || (exportFormat === 'jpeg' && bgMode === 'transparent')) {
        ctx.fillStyle = bgMode === 'transparent' ? '#ffffff' : bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'gradient') {
        const p = GRADIENT_PRESETS.find((g) => g.value === bgGradient);
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (p?.label === 'Sunset Glow') {
          grad.addColorStop(0, '#f97316'); grad.addColorStop(1, '#ec4899');
        } else if (p?.label === 'Ocean Depths') {
          grad.addColorStop(0, '#0284c7'); grad.addColorStop(1, '#06b6d4');
        } else if (p?.label === 'Emerald Aurora') {
          grad.addColorStop(0, '#059669'); grad.addColorStop(1, '#10b981');
        } else if (p?.label === 'Cosmic Violet') {
          grad.addColorStop(0, '#8b5cf6'); grad.addColorStop(1, '#ec4899');
        } else if (p?.label === 'Midnight Slate') {
          grad.addColorStop(0, '#0f172a'); grad.addColorStop(1, '#312e81');
        } else if (p?.label === 'Golden Hour') {
          grad.addColorStop(0, '#f59e0b'); grad.addColorStop(1, '#ef4444');
        } else if (p?.label === 'Silk Rose') {
          grad.addColorStop(0, '#f43f5e'); grad.addColorStop(1, '#fda4af');
        } else {
          grad.addColorStop(0, '#e0f2fe'); grad.addColorStop(1, '#bae6fd');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'blur' && original) {
        // DSLR Portrait Bokeh Blur
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((res) => { bgImg.onload = res; bgImg.src = original; });
        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(bgImg, -20, -20, canvas.width + 40, canvas.height + 40);

        if (bokehStyle === 'vignette') {
          const vigGrad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.75
          );
          vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
          vigGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bokehStyle === 'creamy') {
          ctx.fillStyle = 'rgba(255, 240, 220, 0.08)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      } else if (bgMode === 'colorsplash' && original) {
        // Selective Greyscale (Color Splash)
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((res) => { bgImg.onload = res; bgImg.src = original; });
        ctx.save();
        ctx.filter = `grayscale(${desaturation}%) contrast(105%)`;
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (bgMode === 'custom' && customBgUrl) {
        const cImg = new Image();
        cImg.crossOrigin = 'anonymous';
        await new Promise((res) => { cImg.onload = res; cImg.src = customBgUrl; });
        ctx.drawImage(cImg, 0, 0, canvas.width, canvas.height);
      }

      // Cutout Placement Coordinates with Interactive Positioning & Scale
      const basePosX = Math.round((targetW - origW) / 2);
      const basePosY = Math.round((targetH - origH) / 2);
      const posX = basePosX + subjectPosX;
      const posY = basePosY + subjectPosY;

      // ── Typography Behind Subject (if textLayer === 'behind') ──────
      if (textOverlay && textLayer === 'behind') {
        ctx.save();
        ctx.font = `bold ${textSize}px ${textFont}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 10;
        ctx.fillText(textOverlay, canvas.width / 2, (canvas.height * textPosY) / 100);
        ctx.restore();
      }

      // ── 3D Studio Podiums & Surfaces (Beneath Subject) ───────────
      if (podiumType !== 'none') {
        const pCenterX = posX + (origW * subjectScale) / 2;
        const pCenterY = posY + origH * subjectScale * 0.94;
        const pRadiusX = (origW * subjectScale) * 0.58;
        const pRadiusY = pRadiusX * 0.32;
        const pHeight = pRadiusY * 1.5;

        ctx.save();
        // Ambient shadow beneath podium
        ctx.save();
        ctx.translate(pCenterX, pCenterY + pHeight * 0.9);
        ctx.scale(1, 0.28);
        const podAmbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pRadiusX * 1.15);
        podAmbGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        podAmbGrad.addColorStop(0.6, 'rgba(0,0,0,0.25)');
        podAmbGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = podAmbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pRadiusX * 1.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Podium Cylinder Body
        ctx.beginPath();
        ctx.ellipse(pCenterX, pCenterY, pRadiusX, pRadiusY, 0, 0, Math.PI);
        ctx.lineTo(pCenterX + pRadiusX, pCenterY + pHeight);
        ctx.ellipse(pCenterX, pCenterY + pHeight, pRadiusX, pRadiusY, 0, 0, Math.PI, false);
        ctx.lineTo(pCenterX - pRadiusX, pCenterY);
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(pCenterX - pRadiusX, 0, pCenterX + pRadiusX, 0);
        if (podiumType === 'marble') {
          bodyGrad.addColorStop(0, '#e2e8f0'); bodyGrad.addColorStop(0.5, '#f8fafc'); bodyGrad.addColorStop(1, '#cbd5e1');
        } else if (podiumType === 'obsidian') {
          bodyGrad.addColorStop(0, '#18181b'); bodyGrad.addColorStop(0.5, '#27272a'); bodyGrad.addColorStop(1, '#09090b');
        } else if (podiumType === 'wood') {
          bodyGrad.addColorStop(0, '#78350f'); bodyGrad.addColorStop(0.5, '#92400e'); bodyGrad.addColorStop(1, '#451a03');
        } else if (podiumType === 'gold') {
          bodyGrad.addColorStop(0, '#b45309'); bodyGrad.addColorStop(0.5, '#f59e0b'); bodyGrad.addColorStop(1, '#78350f');
        } else {
          // concrete
          bodyGrad.addColorStop(0, '#64748b'); bodyGrad.addColorStop(0.5, '#94a3b8'); bodyGrad.addColorStop(1, '#475569');
        }
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Podium Top Surface Ellipse
        ctx.beginPath();
        ctx.ellipse(pCenterX, pCenterY, pRadiusX, pRadiusY, 0, 0, Math.PI * 2);
        const topGrad = ctx.createRadialGradient(pCenterX, pCenterY - pRadiusY * 0.2, 0, pCenterX, pCenterY, pRadiusX);
        if (podiumType === 'marble') {
          topGrad.addColorStop(0, '#ffffff'); topGrad.addColorStop(1, '#e2e8f0');
        } else if (podiumType === 'obsidian') {
          topGrad.addColorStop(0, '#3f3f46'); topGrad.addColorStop(1, '#18181b');
        } else if (podiumType === 'wood') {
          topGrad.addColorStop(0, '#d97706'); topGrad.addColorStop(1, '#78350f');
        } else if (podiumType === 'gold') {
          topGrad.addColorStop(0, '#fef08a'); topGrad.addColorStop(1, '#d97706');
        } else {
          topGrad.addColorStop(0, '#cbd5e1'); topGrad.addColorStop(1, '#64748b');
        }
        ctx.fillStyle = topGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      // ── 360° Directional Sunlight Shadow ──────────────────────────
      if (sunShadowEnabled) {
        ctx.save();
        const rad = (sunAngle * Math.PI) / 180;
        const offX = Math.cos(rad) * sunDistance;
        const offY = Math.sin(rad) * sunDistance;
        ctx.shadowColor = `rgba(0, 0, 0, ${sunOpacity})`;
        ctx.shadowBlur = sunBlur;
        ctx.shadowOffsetX = offX;
        ctx.shadowOffsetY = offY;
        ctx.drawImage(sourceCanvas, posX, posY, origW * subjectScale, origH * subjectScale);
        ctx.restore();
      }

      // ── E-Commerce Floor Contact Shadow ───────────────────────────
      if (floorShadow) {
        ctx.save();
        ctx.translate(posX + (origW * subjectScale) / 2, posY + origH * subjectScale * 0.96);
        ctx.scale(1, 0.22);
        const fGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, origW * subjectScale * 0.42);
        fGrad.addColorStop(0, `rgba(0, 0, 0, ${floorShadowOpacity})`);
        fGrad.addColorStop(0.5, `rgba(0, 0, 0, ${floorShadowOpacity * 0.35})`);
        fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(0, 0, origW * subjectScale * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── E-Commerce Mirror / Glass Reflection ──────────────────────
      if (mirrorReflection) {
        ctx.save();
        ctx.translate(posX, posY + origH * subjectScale * 2);
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.28;
        ctx.drawImage(sourceCanvas, 0, 0, origW * subjectScale, origH * subjectScale);

        ctx.globalCompositeOperation = 'destination-out';
        const rGrad = ctx.createLinearGradient(0, 0, 0, origH * subjectScale);
        rGrad.addColorStop(0, 'rgba(0,0,0,0)');
        rGrad.addColorStop(0.65, 'rgba(0,0,0,1)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, 0, origW * subjectScale, origH * subjectScale);
        ctx.restore();
      }

      // ── Studio Drop Shadow ────────────────────────────────────────
      if (shadowEnabled) {
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = shadowOffsetY;
        ctx.drawImage(sourceCanvas, posX, posY, origW * subjectScale, origH * subjectScale);
        ctx.restore();
      }

      // ── Cyber Neon Glow & Aura Light ──────────────────────────────
      if (neonEnabled && neonRadius > 0) {
        ctx.save();
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = neonRadius;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = neonIntensity;
        // Double pass for intense neon radiation
        ctx.drawImage(sourceCanvas, posX, posY, origW * subjectScale, origH * subjectScale);
        ctx.drawImage(sourceCanvas, posX, posY, origW * subjectScale, origH * subjectScale);
        ctx.restore();
      }

      // ── Sticker Outline / Thumbnail Stroke ────────────────────────
      if (stickerEnabled && stickerWidth > 0) {
        const dCanvas = document.createElement('canvas');
        dCanvas.width = origW;
        dCanvas.height = origH;
        const dCtx = dCanvas.getContext('2d');
        dCtx.drawImage(sourceCanvas, 0, 0);
        dCtx.globalCompositeOperation = 'source-in';
        dCtx.fillStyle = stickerColor;
        dCtx.fillRect(0, 0, origW, origH);

        const steps = 16;
        for (let i = 0; i < steps; i++) {
          const angle = (i * 2 * Math.PI) / steps;
          const offX = Math.round(Math.cos(angle) * stickerWidth);
          const offY = Math.round(Math.sin(angle) * stickerWidth);
          ctx.drawImage(dCanvas, posX + offX, posY + offY, origW * subjectScale, origH * subjectScale);
        }
      }

      // ── Main Subject with Lighting, Scale, Flips ──────────────────
      ctx.save();
      ctx.translate(posX + (origW * subjectScale) / 2, posY + (origH * subjectScale) / 2);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.translate(-(posX + (origW * subjectScale) / 2), -(posY + (origH * subjectScale) / 2));

      const filterParts = [];
      if (brightness !== 0) filterParts.push(`brightness(${100 + brightness}%)`);
      if (contrast !== 0) filterParts.push(`contrast(${100 + contrast}%)`);
      if (saturation !== 0) filterParts.push(`saturate(${100 + saturation}%)`);
      if (warmth > 0) filterParts.push(`sepia(${warmth * 0.7}%)`);
      if (warmth < 0) filterParts.push(`hue-rotate(${warmth * 0.4}deg)`);

      if (filterParts.length > 0) {
        ctx.filter = filterParts.join(' ');
      }
      ctx.drawImage(sourceCanvas, posX, posY, origW * subjectScale, origH * subjectScale);
      ctx.restore();

      // ── Edge De-Fringe / Halo Cleaner & Detail Enhancer ───────────
      if (edgeSharpness > 0 || defringe > 0) {
        try {
          const sW = Math.min(canvas.width - posX, Math.round(origW * subjectScale));
          const sH = Math.min(canvas.height - posY, Math.round(origH * subjectScale));
          if (sW > 0 && sH > 0) {
            const imgData = ctx.getImageData(posX, posY, sW, sH);
            const d = imgData.data;
            const w = imgData.width;
            const h = imgData.height;
            const copy = new Uint8ClampedArray(d);

            // 1. Edge De-Fringe (Decontaminate background bleeding)
            if (defringe > 0) {
              const defFactor = defringe / 100;
              for (let i = 0; i < d.length; i += 4) {
                const alpha = d[i + 3];
                if (alpha > 5 && alpha < 220) {
                  // Semi-transparent edge pixel: suppress saturated edge cast
                  const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
                  d[i] = Math.round(d[i] * (1 - defFactor * 0.5) + avg * (defFactor * 0.5));
                  d[i + 1] = Math.round(d[i + 1] * (1 - defFactor * 0.5) + avg * (defFactor * 0.5));
                  d[i + 2] = Math.round(d[i + 2] * (1 - defFactor * 0.5) + avg * (defFactor * 0.5));
                }
              }
            }

            // 2. Unsharp detail sharpening kernel
            if (edgeSharpness > 0) {
              const factor = (edgeSharpness / 100) * 0.6;
              for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                  const idx = (y * w + x) * 4;
                  if (copy[idx + 3] === 0) continue;
                  for (let c = 0; c < 3; c++) {
                    const center = copy[idx + c];
                    const up = copy[((y - 1) * w + x) * 4 + c];
                    const down = copy[((y + 1) * w + x) * 4 + c];
                    const left = copy[(y * w + (x - 1)) * 4 + c];
                    const right = copy[(y * w + (x + 1)) * 4 + c];
                    const sharpVal = center + factor * (4 * center - up - down - left - right);
                    d[idx + c] = Math.min(255, Math.max(0, sharpVal));
                  }
                }
              }
            }
            ctx.putImageData(imgData, posX, posY);
          }
        } catch (e) {
          // fallback
        }
      }

      // ── Typography In Front of Subject ─────────────────────────────
      if (textOverlay && textLayer === 'front') {
        ctx.save();
        ctx.font = `bold ${textSize}px ${textFont}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;
        ctx.fillText(textOverlay, canvas.width / 2, (canvas.height * textPosY) / 100);
        ctx.restore();
      }

      // ── Render Dynamic QR Code ─────────────────────────────────────
      if (qrEnabled && qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((res) => { qrImg.onload = res; qrImg.src = qrDataUrl; });
        const margin = 20;
        let qx = canvas.width - qrSize - margin;
        let qy = canvas.height - qrSize - margin;

        if (qrPos === 'top-left') { qx = margin; qy = margin; }
        else if (qrPos === 'top-right') { qx = canvas.width - qrSize - margin; qy = margin; }
        else if (qrPos === 'bottom-left') { qx = margin; qy = canvas.height - qrSize - margin; }

        ctx.save();
        ctx.globalAlpha = qrOpacity;
        // White rounded card background for QR code
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(qx - 6, qy - 6, qrSize + 12, qrSize + 12, 8);
        ctx.fill();

        ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
        ctx.restore();
      }

      // ── Render Business Logo / Watermark ───────────────────────────
      if (watermarkUrl) {
        const wmImg = new Image();
        wmImg.crossOrigin = 'anonymous';
        await new Promise((res) => { wmImg.onload = res; wmImg.src = watermarkUrl; });
        const wmWidth = Math.round(canvas.width * (watermarkScale / 100));
        const wmHeight = Math.round((wmImg.height / wmImg.width) * wmWidth);
        const margin = 20;
        let wmX = canvas.width - wmWidth - margin;
        let wmY = canvas.height - wmHeight - margin;

        if (watermarkPos === 'top-left') { wmX = margin; wmY = margin; }
        else if (watermarkPos === 'top-right') { wmX = canvas.width - wmWidth - margin; wmY = margin; }
        else if (watermarkPos === 'bottom-left') { wmX = margin; wmY = canvas.height - wmHeight - margin; }
        else if (watermarkPos === 'center') { wmX = (canvas.width - wmWidth) / 2; wmY = (canvas.height - wmHeight) / 2; }

        ctx.save();
        ctx.globalAlpha = watermarkOpacity;
        ctx.drawImage(wmImg, wmX, wmY, wmWidth, wmHeight);
        ctx.restore();
      }

      // ── Render E-Commerce Promo Badge ──────────────────────────────
      if (activeBadge !== 'none') {
        const bInfo = PROMO_BADGES.find((b) => b.id === activeBadge);
        if (bInfo && bInfo.text) {
          ctx.save();
          ctx.font = 'bold 15px system-ui, sans-serif';
          const textWidth = ctx.measureText(bInfo.text).width;
          const bW = textWidth + 28;
          const bH = 34;
          let bx = 20;
          let by = 20;

          if (badgePos === 'top-right') bx = canvas.width - bW - 20;
          else if (badgePos === 'bottom-left') by = canvas.height - bH - 20;
          else if (badgePos === 'bottom-right') { bx = canvas.width - bW - 20; by = canvas.height - bH - 20; }

          ctx.fillStyle = bInfo.bg;
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(bx, by, bW, bH, 6);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = bInfo.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bInfo.text, bx + bW / 2, by + bH / 2);
          ctx.restore();
        }
      }

      // ── Render Circular Profile DP Mode ────────────────────────────
      if (circularDp) {
        const dpCanvas = document.createElement('canvas');
        const size = Math.min(canvas.width, canvas.height);
        dpCanvas.width = size;
        dpCanvas.height = size;
        const dpCtx = dpCanvas.getContext('2d');

        dpCtx.save();
        dpCtx.beginPath();
        dpCtx.arc(size / 2, size / 2, size / 2 - circularBorderWidth / 2, 0, Math.PI * 2);
        dpCtx.clip();
        dpCtx.drawImage(canvas, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size, 0, 0, size, size);
        dpCtx.restore();

        if (circularBorderWidth > 0) {
          dpCtx.beginPath();
          dpCtx.arc(size / 2, size / 2, size / 2 - circularBorderWidth / 2, 0, Math.PI * 2);
          dpCtx.strokeStyle = circularBorderColor;
          dpCtx.lineWidth = circularBorderWidth;
          dpCtx.stroke();
        }

        canvas.width = size;
        canvas.height = size;
        const mainCtx = canvas.getContext('2d');
        mainCtx.drawImage(dpCanvas, 0, 0);
      }

      // Generate Data URLs & Real Size Estimates
      const finalUrl = canvas.toDataURL('image/png', 1.0);
      setCompositeUrl(finalUrl);

      // Pre-calculate real file sizes
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          const kb = (pngBlob.size / 1024).toFixed(0);
          const mb = (pngBlob.size / (1024 * 1024)).toFixed(1);
          setEstimatedSizes((p) => ({ ...p, png: pngBlob.size > 1024 * 1024 ? `${mb} MB` : `${kb} KB` }));
        }
      }, 'image/png');

      canvas.toBlob((webpBlob) => {
        if (webpBlob) {
          const kb = (webpBlob.size / 1024).toFixed(0);
          setEstimatedSizes((p) => ({ ...p, webp: `${kb} KB` }));
        }
      }, 'image/webp', exportQuality);

      canvas.toBlob((jpgBlob) => {
        if (jpgBlob) {
          const kb = (jpgBlob.size / 1024).toFixed(0);
          setEstimatedSizes((p) => ({ ...p, jpeg: `${kb} KB` }));
        }
      }, 'image/jpeg', exportQuality);

    } catch (e) {
      console.error('Compositing failed:', e);
    }
  }, [
    result, brushMaskCanvas, bgMode, bgColor, bgGradient, blurAmount, bokehStyle,
    desaturation, original, customBgUrl,
    subjectPosX, subjectPosY, subjectScale, flipH, flipV,
    podiumType, neonEnabled, neonColor, neonRadius, neonIntensity,
    sunShadowEnabled, sunAngle, sunDistance, sunBlur, sunOpacity,
    defringe, edgeSharpness,
    textOverlay, textFont, textColor, textSize, textLayer, textPosY,
    qrEnabled, qrDataUrl, qrSize, qrPos, qrOpacity,
    aspectRatio, autoPadding, circularDp, circularBorderColor, circularBorderWidth,
    floorShadow, floorShadowOpacity, mirrorReflection,
    stickerEnabled, stickerWidth, stickerColor,
    shadowEnabled, shadowBlur, shadowOpacity, shadowOffsetY,
    brightness, contrast, saturation, warmth,
    watermarkUrl, watermarkOpacity, watermarkPos, watermarkScale,
    activeBadge, badgePos,
    exportFormat, exportQuality
  ]);

  useEffect(() => {
    compositeImage();
  }, [compositeImage]);

  // File Upload Handlers (Single Studio)
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (appMode === 'bulk') {
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) addFilesToBulkQueue(files);
      return;
    }
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            if (appMode === 'bulk') {
              addFilesToBulkQueue([file]);
            } else {
              processSelectedFile(file);
            }
            break;
          }
        }
      }
    },
    [quality, appMode]
  );

  const processSelectedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Image exceeds 25 MB limit. Please choose a smaller image.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setOriginal(dataUrl);
      processImage(dataUrl, file.type, quality);
    };
    reader.readAsDataURL(file);
  };

  // Background Removal API
  const processImage = async (dataUrl, mimeType, qualityMode = quality) => {
    setLoading(true);
    setError('');
    setResult(null);
    setCompositeUrl(null);
    setBrushMaskCanvas(null);
    setHistoryStack([]);
    setHistoryStep(-1);

    try {
      const base64Data = dataUrl.split(',')[1];
      const res = await fetch('/api/remove-background/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: JSON.stringify({
          image: base64Data,
          quality: qualityMode,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          // ignore
        }
      }

      if (!res.ok || !data) {
        throw new Error(data?.error || `Server error (${res.status}). Please try again.`);
      }

      if (!data.image) {
        throw new Error('No image returned from background removal service');
      }

      const resUrl = `data:image/png;base64,${data.image}`;
      setResult(resUrl);
      saveToHistory(dataUrl, resUrl);
    } catch (err) {
      setError(err.message || 'Failed to remove background. Please try another image.');
    } finally {
      setLoading(false);
    }
  };

  const reprocessWithQuality = (newQuality) => {
    setQuality(newQuality);
    if (original) {
      processImage(original, 'image/png', newQuality);
    }
  };

  // ── Camera / Webcam Functions ──────────────────────────────────
  const startCamera = async () => {
    setError('');
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera: ' + (err.message || 'Permission denied'));
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext('2d');
    ctx.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.95);
    stopCamera();
    setOriginal(dataUrl);
    processImage(dataUrl, 'image/jpeg', quality);
  };

  const handleCustomBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomBgUrl(ev.target.result);
      setBgMode('custom');
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setWatermarkUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setOriginal(null);
    setResult(null);
    setCompositeUrl(null);
    setError('');
    setCustomBgUrl(null);
    setBgMode('transparent');
    setZoom(1);
    setStickerEnabled(false);
    setShadowEnabled(false);
    setFloorShadow(false);
    setMirrorReflection(false);
    setAutoPadding(false);
    setCircularDp(false);
    setPodiumType('none');
    setNeonEnabled(false);
    setSunShadowEnabled(false);
    setDefringe(0);
    setTextOverlay('');
    setQrEnabled(false);
    setTargetKbMode('auto');
    setAspectRatio('original');
    setPassportMode(null);
    setShowPassportGuide(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setWarmth(0);
    setEdgeSharpness(0);
    setSubjectPosX(0);
    setSubjectPosY(0);
    setSubjectScale(1.0);
    setFlipH(false);
    setFlipV(false);
    setWatermarkUrl(null);
    setActiveBadge('none');
    setBrushMaskCanvas(null);
    setHistoryStack([]);
    setHistoryStep(-1);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (bgImageInputRef.current) bgImageInputRef.current.value = '';
    if (watermarkInputRef.current) watermarkInputRef.current.value = '';
  };

  // ── Next-Gen Download with Target File Size Binary Search ─────
  const downloadResult = async () => {
    const srcUrl = compositeUrl || result;
    if (!srcUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const scaleMultiplier = upscale2x ? 2 : 1;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scaleMultiplier;
      canvas.height = img.height * scaleMultiplier;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Auto-fill white if saving transparent PNG as JPEG
      if (exportFormat === 'jpeg' && bgMode === 'transparent') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType =
        exportFormat === 'webp'
          ? 'image/webp'
          : exportFormat === 'jpeg'
          ? 'image/jpeg'
          : 'image/png';

      // ── Target KB Compression Optimizer (Govt / KYC Mode) ──────
      const maxTargetKb =
        targetKbMode === '20'
          ? 20
          : targetKbMode === '50'
          ? 50
          : targetKbMode === '100'
          ? 100
          : targetKbMode === '200'
          ? 200
          : targetKbMode === 'custom'
          ? customTargetKb
          : null;

      let finalBlob = null;

      if (maxTargetKb && (mimeType === 'image/jpeg' || mimeType === 'image/webp')) {
        // Binary search for ideal quality factor
        let minQ = 0.1;
        let maxQ = 0.98;
        let bestBlob = null;

        for (let iter = 0; iter < 6; iter++) {
          const midQ = (minQ + maxQ) / 2;
          const testBlob = await new Promise((r) => canvas.toBlob(r, mimeType, midQ));
          if (testBlob) {
            const kb = testBlob.size / 1024;
            if (kb <= maxTargetKb) {
              bestBlob = testBlob;
              minQ = midQ; // try higher quality
            } else {
              maxQ = midQ; // compress more
            }
          }
        }

        // If still too large at minimum quality, scale dimensions down
        if (!bestBlob || bestBlob.size / 1024 > maxTargetKb) {
          const downCanvas = document.createElement('canvas');
          downCanvas.width = Math.round(canvas.width * 0.7);
          downCanvas.height = Math.round(canvas.height * 0.7);
          downCanvas.getContext('2d').drawImage(canvas, 0, 0, downCanvas.width, downCanvas.height);
          bestBlob = await new Promise((r) => downCanvas.toBlob(r, mimeType, 0.65));
        }

        finalBlob = bestBlob;
      }

      if (!finalBlob) {
        finalBlob = await new Promise((r) => canvas.toBlob(r, mimeType, exportQuality));
      }

      if (finalBlob) {
        const blobUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
        const targetLabel = maxTargetKb ? `_under${maxTargetKb}KB` : '';
        a.download = `axom_cutout_${Date.now()}${targetLabel}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    };
    img.src = srcUrl;
  };

  // ── 1-Click Passport 8-in-1 Print Sheet Generator ─────────────
  const generatePassportPrintSheet = () => {
    const srcUrl = compositeUrl || result;
    if (!srcUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const sheet = document.createElement('canvas');
      sheet.width = 1800;
      sheet.height = 1200;
      const ctx = sheet.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheet.width, sheet.height);

      const cols = 4;
      const rows = 2;
      const photoW = 360;
      const photoH = 460;
      const startX = Math.round((sheet.width - (cols * photoW + (cols - 1) * 40)) / 2);
      const startY = Math.round((sheet.height - (rows * photoH + (rows - 1) * 40)) / 2);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = startX + c * (photoW + 40);
          const py = startY + r * (photoH + 40);

          ctx.drawImage(img, px, py, photoW, photoH);

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, photoW, photoH);
        }
      }

      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Axom AI Passport Studio • Ready to Print on 4x6" (10x15cm) Photo Paper', sheet.width / 2, sheet.height - 24);

      sheet.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `axom_passport_sheet_4x6_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        setPrintSheetGenerated(true);
        setTimeout(() => setPrintSheetGenerated(false), 3000);
      }, 'image/jpeg', 0.96);
    };
    img.src = srcUrl;
  };

  // ── 1-Click Copy Cutout to Clipboard ───────────────────────────
  const copyResultToClipboard = async () => {
    const url = compositeUrl || result;
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setCopyToast(true);
      setTimeout(() => {
        setCopied(false);
        setCopyToast(false);
      }, 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  // ── Batch / Bulk Mode Functions ───────────────────────────────
  const addFilesToBulkQueue = (files) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 25 * 1024 * 1024
    );
    if (validFiles.length === 0) return;

    const newItems = validFiles.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB',
      status: 'pending',
      originalUrl: URL.createObjectURL(file),
      resultUrl: null,
      errorMsg: null,
    }));

    setBulkQueue((prev) => [...prev, ...newItems]);
  };

  const handleBulkUploadInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFilesToBulkQueue(files);
    }
  };

  const runBulkProcessing = async () => {
    if (isBulkProcessing || bulkQueue.length === 0) return;
    setIsBulkProcessing(true);

    const pending = bulkQueue.filter((item) => item.status === 'pending');
    let completedCount = bulkQueue.filter((item) => item.status === 'done').length;
    setBulkProgress({ completed: completedCount, total: bulkQueue.length });

    for (const item of pending) {
      setBulkQueue((q) =>
        q.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i))
      );

      try {
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result.split(',')[1]);
          reader.onerror = rej;
          reader.readAsDataURL(item.file);
        });

        const resp = await fetch('/api/remove-background/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken() || '',
          },
          body: JSON.stringify({ image: base64, quality }),
        });

        const data = await resp.json();
        if (resp.ok && data?.image) {
          const resDataUrl = `data:image/png;base64,${data.image}`;
          completedCount++;
          setBulkProgress({ completed: completedCount, total: bulkQueue.length });
          setBulkQueue((q) =>
            q.map((i) => (i.id === item.id ? { ...i, status: 'done', resultUrl: resDataUrl } : i))
          );
        } else {
          setBulkQueue((q) =>
            q.map((i) =>
              i.id === item.id ? { ...i, status: 'error', errorMsg: data?.error || 'Failed' } : i
            )
          );
        }
      } catch (err) {
        setBulkQueue((q) =>
          q.map((i) => (i.id === item.id ? { ...i, status: 'error', errorMsg: err.message } : i))
        );
      }
    }

    setIsBulkProcessing(false);
  };

  const downloadAllBulkAsZip = async () => {
    const doneItems = bulkQueue.filter((item) => item.status === 'done' && item.resultUrl);
    if (doneItems.length === 0) return;

    setBulkZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('axom_cutouts');

      for (let idx = 0; idx < doneItems.length; idx++) {
        const item = doneItems[idx];
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;

        if (bulkZipFormat === 'webp') {
          const img = new Image();
          await new Promise((res) => { img.onload = res; img.src = item.resultUrl; });
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          c.getContext('2d').drawImage(img, 0, 0);
          const blob = await new Promise((res) => c.toBlob(res, 'image/webp', exportQuality));
          folder.file(`${baseName}_cutout.webp`, blob);
        } else {
          const base64 = item.resultUrl.split(',')[1];
          folder.file(`${baseName}_cutout.png`, base64, { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `axom_bulk_cutouts_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('ZIP generation failed:', e);
    } finally {
      setBulkZipping(false);
    }
  };

  const downloadIndividualBulkItem = (item) => {
    if (!item.resultUrl) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${baseName}_cutout.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openBulkItemInStudio = (item) => {
    setOriginal(item.originalUrl);
    setResult(item.resultUrl);
    setAppMode('studio');
    setTab('result');
  };

  // Slider Mouse/Touch Handlers
  const handleSliderMove = useCallback((clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const p = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(p);
  }, []);

  const handleMouseMove = (e) => {
    if (!dragging) return;
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!dragging || !e.touches[0]) return;
    handleSliderMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleUp = () => setDragging(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // Compute Active Background Preview
  const currentPreviewBg =
    bgMode === 'transparent'
      ? CHECKER_BG
      : bgMode === 'color'
      ? bgColor
      : bgMode === 'gradient'
      ? bgGradient
      : 'transparent';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#090a10',
        display: 'flex',
        flexDirection: 'column',
        color: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onPaste={handlePaste}
    >
      <style>{`
        .bgr-header { display:flex; align-items:center; justify-content:space-between; padding:10px 18px; background:#0f111a; border-bottom:1px solid #1e2235; min-height:54px; }
        .bgr-title { font-size:16px; font-weight:700; background:linear-gradient(135deg,#ec4899,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; display:flex; align-items:center; gap:8px; white-space:nowrap; }
        .bgr-body { display:flex; flex:1; overflow:hidden; }
        .bgr-main { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#0b0d14; position:relative; }
        .bgr-sidebar { width:370px; background:#0f111a; border-left:1px solid #1e2235; display:flex; flex-direction:column; overflow-y:auto; }
        .bgr-sidebar-section { padding:13px 16px; border-bottom:1px solid #1e2235; }
        .bgr-sidebar-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:#94a3b8; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; }
        .bgr-drop { flex:1; display:flex; align-items:center; justify-content:center; padding:16px; overflow:hidden; position:relative; }
        .bgr-drop-zone { border:2px dashed #2a2f45; border-radius:18px; width:100%; max-width:680px; min-height:340px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; cursor:pointer; transition:all .2s; background:rgba(255,255,255,.015); padding:24px; text-align:center; }
        .bgr-drop-zone:hover { border-color:#ec4899; background:rgba(236,72,153,.04); }
        .bgr-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:8px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:all .2s; }
        .bgr-btn-primary { background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#fff; width:100%; justify-content:center; box-shadow:0 4px 14px rgba(236,72,153,.3); }
        .bgr-btn-primary:hover { opacity:.92; transform:translateY(-1px); }
        .bgr-btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; }
        .bgr-btn-secondary { background:rgba(236,72,153,.12); color:#f472b6; border:1px solid rgba(236,72,153,.3); }
        .bgr-btn-secondary:hover { background:rgba(236,72,153,.2); }
        .bgr-btn-icon { padding:7px; border-radius:8px; border:1px solid #23283c; background:#141724; color:#cbd5e1; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:all .15s; }
        .bgr-btn-icon:hover { background:#1e2338; border-color:#ec4899; color:#fff; }
        .bgr-compare { position:relative; width:100%; height:100%; overflow:hidden; border-radius:12px; cursor:col-resize; user-select:none; }
        .bgr-compare img { position:absolute; top:50%; left:50%; object-fit:contain; max-width:100%; max-height:100%; pointer-events:none; }
        .bgr-slider-line { position:absolute; top:0; bottom:0; width:2px; background:#ec4899; z-index:10; transform:translateX(-50%); pointer-events:none; box-shadow:0 0 8px rgba(236,72,153,.8); }
        .bgr-slider-handle { position:absolute; top:50%; width:34px; height:34px; border-radius:50%; background:#ec4899; border:3px solid #fff; z-index:11; transform:translate(-50%,-50%); cursor:col-resize; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,.6); }
        .bgr-label { position:absolute; top:12px; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; z-index:5; pointer-events:none; backdrop-filter:blur(6px); }
        .bgr-label-orig { left:12px; background:rgba(0,0,0,.7); color:#e2e8f0; border:1px solid rgba(255,255,255,.1); }
        .bgr-label-result { right:12px; background:rgba(236,72,153,.85); color:#fff; box-shadow:0 2px 8px rgba(236,72,153,.4); }
        .bgr-tabs { display:flex; gap:4px; padding:6px 14px; background:#0f111a; border-bottom:1px solid #1e2235; align-items:center; }
        .bgr-tab { padding:6px 12px; font-size:12px; font-weight:600; border-radius:6px; border:none; background:none; color:#94a3b8; cursor:pointer; transition:all .2s; }
        .bgr-tab:hover { color:#fff; background:rgba(255,255,255,.05); }
        .bgr-tab.active { color:#fff; background:#1e2235; border:1px solid #2e354e; }
        .bgr-color-category { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin:8px 0 4px; }
        .bgr-color-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:5px; margin-bottom:6px; }
        .bgr-color-swatch { width:100%; aspect-ratio:1; border-radius:6px; border:2px solid transparent; cursor:pointer; transition:all .15s; position:relative; }
        .bgr-color-swatch:hover { transform:scale(1.15); z-index:2; }
        .bgr-color-swatch.active { border-color:#ec4899; box-shadow:0 0 0 2px rgba(236,72,153,.5); transform:scale(1.1); }
        .bgr-grad-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
        .bgr-grad-swatch { aspect-ratio:2.6; border-radius:8px; border:2px solid transparent; cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .bgr-grad-swatch span { font-size:10px; font-weight:700; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,.8); padding:0 4px; }
        .bgr-grad-swatch:hover { transform:scale(1.03); }
        .bgr-grad-swatch.active { border-color:#ec4899; box-shadow:0 0 0 2px rgba(236,72,153,.5); }
        .bgr-mode-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
        .bgr-mode-btn { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; transition:all .15s; border:1px solid #23283c; background:#141724; color:#cbd5e1; }
        .bgr-mode-btn:hover { border-color:rgba(236,72,153,.4); background:#181c2d; color:#fff; }
        .bgr-mode-btn.active { border-color:#ec4899; background:rgba(236,72,153,.12); color:#f472b6; }
        .bgr-result-only { width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px; position:relative; }
        .bgr-result-only img { max-width:100%; max-height:100%; object-fit:contain; }
        .bgr-side-by-side { display:grid; grid-template-columns:1fr 1fr; width:100%; height:100%; gap:12px; padding:12px; }
        .bgr-side-pane { display:flex; flex-direction:column; align-items:center; justify-content:center; background:#141724; border-radius:10px; overflow:hidden; position:relative; }
        .bgr-side-pane img { max-width:100%; max-height:100%; object-fit:contain; }
        .bgr-progress { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; height:100%; }
        @keyframes bgr-spin { to { transform:rotate(360deg); } }
        @keyframes bgr-pulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .bgr-spinner { animation:bgr-spin 1.1s linear infinite; }
        .bgr-pulse { animation:bgr-pulse 2s ease-in-out infinite; }
        .bgr-zoom-controls { position:absolute; bottom:14px; right:14px; display:flex; gap:6px; z-index:50; background:rgba(15,17,26,.85); backdrop-filter:blur(8px); padding:4px; border-radius:8px; border:1px solid #23283c; }

        /* Format Pills */
        .bgr-format-pills { display:flex; background:#141724; padding:3px; border-radius:8px; border:1px solid #23283c; gap:4px; }
        .bgr-format-pill { flex:1; text-align:center; padding:7px 4px; border-radius:6px; border:none; cursor:pointer; font-size:12px; font-weight:700; background:transparent; color:#94a3b8; transition:all .15s; }
        .bgr-format-pill.active { background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#fff; box-shadow:0 2px 8px rgba(236,72,153,.3); }

        /* Mode Switcher Pill in Header */
        .bgr-appmode-switcher { display:flex; background:#141724; border:1px solid #23283c; border-radius:8px; padding:3px; gap:4px; }
        .bgr-appmode-btn { padding:5px 12px; border-radius:6px; border:none; background:transparent; font-size:12px; font-weight:700; color:#94a3b8; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .15s; }
        .bgr-appmode-btn.active { background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#fff; box-shadow:0 2px 6px rgba(236,72,153,.3); }

        /* Horizontal Studio Sub-Tabs */
        .bgr-subtabs-bar { display:flex; background:#0b0d14; border-bottom:1px solid #1e2235; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
        .bgr-subtabs-bar::-webkit-scrollbar { display:none; }
        .bgr-subtab-btn { flex:none; padding:10px 11px; border:none; background:transparent; font-size:11px; font-weight:700; cursor:pointer; color:#94a3b8; display:flex; align-items:center; gap:5px; border-bottom:2px solid transparent; transition:all .15s; white-space:nowrap; }
        .bgr-subtab-btn.active { color:#ec4899; background:#141724; border-bottom-color:#ec4899; }

        /* Interactive Touch-up Canvas */
        .bgr-brush-stage { position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; cursor:crosshair; user-select:none; }
        .bgr-brush-canvas { max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
        .bgr-brush-cursor-circle { position:absolute; pointer-events:none; border:2px solid #ec4899; border-radius:50%; transform:translate(-50%,-50%); box-shadow:0 0 8px rgba(236,72,153,.6); }

        /* Toast Popup */
        .bgr-toast { position:fixed; bottom:70px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; padding:8px 18px; border-radius:20px; font-size:12px; font-weight:700; z-index:10000; box-shadow:0 4px 16px rgba(0,0,0,.5); display:flex; align-items:center; gap:8px; animation:bgr-fadein .2s ease; }
        @keyframes bgr-fadein { from { opacity:0; transform:translate(-50%, 10px); } to { opacity:1; transform:translate(-50%, 0); } }

        /* Bulk Queue Grid */
        .bgr-bulk-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:12px; width:100%; max-height:100%; overflow-y:auto; padding:16px; }
        .bgr-bulk-card { background:#141724; border:1px solid #23283c; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; position:relative; transition:all .2s; }
        .bgr-bulk-card:hover { border-color:#ec4899; }
        .bgr-bulk-thumb { width:100%; aspect-ratio:1; background:#0b0d14; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
        .bgr-bulk-thumb img { width:100%; height:100%; object-fit:contain; }

        /* Camera Modal Viewfinder */
        .bgr-camera-modal { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:10005; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; }
        .bgr-camera-viewfinder { max-width:640px; width:100%; border-radius:14px; overflow:hidden; background:#000; position:relative; border:2px solid #23283c; }

        /* Full Mobile Responsiveness */
        @media (max-width:768px) {
          .bgr-header { padding:10px 12px; min-height:50px; flex-wrap:wrap; gap:8px; }
          .bgr-title { font-size:14px; }
          .bgr-body { flex-direction:column; overflow-y:auto; -webkit-overflow-scrolling:touch; }
          .bgr-main { min-height:38vh; max-height:42vh; height:40vh; flex:none; }
          .bgr-sidebar { width:100%; flex:none; border-left:none; border-top:1px solid #1e2235; overflow-y:visible; padding-bottom:95px; }
          .bgr-sidebar-section { padding:12px 14px; }
          .bgr-tabs { overflow-x:auto; white-space:nowrap; padding:6px 10px; -webkit-overflow-scrolling:touch; scrollbar-width:none; gap:6px; }
          .bgr-tabs::-webkit-scrollbar { display:none; }
          .bgr-tab { padding:6px 10px; font-size:11px; flex-shrink:0; min-height:32px; }
          .bgr-drop-zone { height:auto; min-height:260px; padding:20px 12px; }
          .bgr-side-by-side { grid-template-columns:1fr; grid-template-rows:1fr 1fr; gap:8px; padding:8px; }
          .bgr-btn-primary { min-height:44px; font-size:13px; }
          .bgr-zoom-controls { bottom:8px; right:8px; padding:2px; }
          .bgr-bulk-grid { grid-template-columns:repeat(2, 1fr); padding:8px; gap:8px; }
          
          /* Sticky Mobile Action Bar */
          .bgr-mobile-sticky-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(15,17,26,0.96);
            backdrop-filter: blur(12px);
            border-top: 1px solid #23283c;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 100;
          }
        }
      `}</style>

      {/* ── Top Header with App Mode Switcher ──────────────────── */}
      <div className="bgr-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="bgr-title">
            <Scissors size={18} style={{ color: '#ec4899' }} /> Axom Studio
          </span>

          {/* Single Studio vs Batch/Bulk Mode */}
          <div className="bgr-appmode-switcher">
            <button
              className={`bgr-appmode-btn ${appMode === 'studio' ? 'active' : ''}`}
              onClick={() => setAppMode('studio')}
            >
              <Scissors size={13} /> Studio
            </button>
            <button
              className={`bgr-appmode-btn ${appMode === 'bulk' ? 'active' : ''}`}
              onClick={() => setAppMode('bulk')}
            >
              <FolderArchive size={13} /> Batch Mode (Bulk)
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#ec4899', color: '#fff', marginLeft: 2 }}>NEW</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {appMode === 'studio' && original && (
            <button className="bgr-btn-icon" onClick={resetAll} title="Upload New Image">
              <RotateCcw size={15} />
            </button>
          )}
          {appMode === 'bulk' && bulkQueue.length > 0 && (
            <button className="bgr-btn-icon" onClick={() => setBulkQueue([])} title="Clear Batch Queue">
              <RotateCcw size={15} />
            </button>
          )}
          <button className="bgr-btn-icon" onClick={onClose} title="Close Studio">
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Copy Toast Alert */}
      {copyToast && (
        <div className="bgr-toast">
          <Check size={14} /> Cutout copied to clipboard! Paste directly with Ctrl+V.
        </div>
      )}

      {/* Camera Modal Viewfinder */}
      {cameraActive && (
        <div className="bgr-camera-modal">
          <div className="bgr-camera-viewfinder">
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
              <button
                className="bgr-btn-icon"
                onClick={() => {
                  const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
                  setCameraFacing(newFacing);
                  stopCamera();
                  setTimeout(() => startCamera(), 200);
                }}
                title="Switch Front/Back Camera"
              >
                <RefreshCw size={15} />
              </button>
              <button className="bgr-btn-icon" onClick={stopCamera} title="Close Camera">
                <X size={15} />
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={capturePhoto}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '4px solid #ec4899',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                }}
                title="Snap Photo"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 1: BATCH / BULK MODE ──────────────────────────── */}
      {appMode === 'bulk' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#0b0d14' }}>
          {/* Bulk Action Header Bar */}
          <div style={{ padding: '12px 18px', background: '#0f111a', borderBottom: '1px solid #1e2235', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                Batch Background Removal ({bulkQueue.length} Images)
              </span>
              {bulkQueue.length > 0 && (
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 4 }}>
                  {bulkQueue.filter((i) => i.status === 'done').length} Completed
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="bgr-btn bgr-btn-secondary"
                onClick={() => bulkInputRef.current?.click()}
                disabled={isBulkProcessing}
              >
                <Upload size={14} /> Add Images
              </button>

              <button
                className="bgr-btn bgr-btn-primary"
                style={{ width: 'auto', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}
                onClick={runBulkProcessing}
                disabled={isBulkProcessing || bulkQueue.filter((i) => i.status === 'pending').length === 0}
              >
                {isBulkProcessing ? (
                  <>
                    <RefreshCw size={14} className="bgr-spinner" /> Processing {bulkProgress.completed}/{bulkProgress.total}...
                  </>
                ) : (
                  <>
                    <Zap size={14} /> Process All ({bulkQueue.filter((i) => i.status === 'pending').length})
                  </>
                )}
              </button>

              {bulkQueue.filter((i) => i.status === 'done').length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    value={bulkZipFormat}
                    onChange={(e) => setBulkZipFormat(e.target.value)}
                    style={{ background: '#141724', border: '1px solid #23283c', color: '#cbd5e1', borderRadius: 6, padding: '7px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <option value="png">ZIP as PNG</option>
                    <option value="webp">ZIP as WebP</option>
                  </select>

                  <button
                    className="bgr-btn"
                    style={{ background: '#06b6d4', color: '#fff' }}
                    onClick={downloadAllBulkAsZip}
                    disabled={bulkZipping}
                  >
                    {bulkZipping ? (
                      <>
                        <RefreshCw size={14} className="bgr-spinner" /> Zipping...
                      </>
                    ) : (
                      <>
                        <FolderArchive size={14} /> Download All as ZIP
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Drop & Queue Display */}
          {bulkQueue.length === 0 ? (
            <div
              className="bgr-drop"
              onClick={() => bulkInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="bgr-drop-zone">
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(6,182,212,.15), rgba(139,92,246,.15))',
                    border: '1px solid rgba(6,182,212,.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderArchive size={34} style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                    Bulk / Batch Image Processing
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8' }}>
                    Drop multiple product photos, portraits, or catalogs (Up to 20 images at once)
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#64748b' }}>
                    Process automatically and download all cutouts in a single ZIP file
                  </p>
                </div>
                <button className="bgr-btn bgr-btn-primary" style={{ width: 'auto', background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
                  <Upload size={16} /> Select Multiple Images
                </button>
              </div>
            </div>
          ) : (
            <div className="bgr-bulk-grid">
              {bulkQueue.map((item) => (
                <div key={item.id} className="bgr-bulk-card">
                  <div className="bgr-bulk-thumb" style={{ background: item.resultUrl ? CHECKER_BG : '#090a10' }}>
                    <img src={item.resultUrl || item.originalUrl} alt={item.name} />
                    <div style={{ position: 'absolute', top: 6, right: 6 }}>
                      {item.status === 'done' && (
                        <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', padding: 3, display: 'inline-flex' }}>
                          <Check size={12} />
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span style={{ background: '#ec4899', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
                          Processing...
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span style={{ background: 'rgba(0,0,0,0.6)', color: '#94a3b8', borderRadius: 4, padding: '2px 6px', fontSize: 10 }}>
                          Queued
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span style={{ background: '#ef4444', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10 }}>
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>{item.size}</span>

                    {item.status === 'done' && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <button
                          className="bgr-btn bgr-btn-icon"
                          style={{ flex: 1, padding: 4, fontSize: 10 }}
                          onClick={() => downloadIndividualBulkItem(item)}
                          title="Download Cutout"
                        >
                          <Download size={12} /> Save
                        </button>
                        <button
                          className="bgr-btn bgr-btn-icon"
                          style={{ flex: 1, padding: 4, fontSize: 10, color: '#ec4899' }}
                          onClick={() => openBulkItemInStudio(item)}
                          title="Open in Studio"
                        >
                          <Sliders size={12} /> Studio
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            ref={bulkInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleBulkUploadInput}
          />
        </div>
      ) : (
        /* ── VIEW 2: SINGLE IMAGE STUDIO MODE ────────────────────── */
        !original ? (
          /* Empty / Upload View */
          <div
            className="bgr-drop"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="bgr-drop-zone">
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(236,72,153,.15), rgba(139,92,246,.15))',
                  border: '1px solid rgba(236,72,153,.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Scissors size={34} style={{ color: '#ec4899' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                  Upload an Image to Remove Background
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  Drag & drop, paste from clipboard (Ctrl+V), or click to browse
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>
                  E-Commerce, Portraits, Products, Animals, Jewelry, Fine Hair & Documents
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569' }}>
                  3D Podiums • Cyber Neon Glow • 360° Sunlight • Target KB • QR Generator • DSLR Bokeh
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  className="bgr-btn bgr-btn-primary"
                  style={{
                    width: 'auto',
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
                  }}
                >
                  <Upload size={16} /> Select Image
                </button>

                <button
                  className="bgr-btn bgr-btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  style={{ width: 'auto', padding: '10px 18px' }}
                >
                  <Camera size={16} /> Camera Scan
                </button>
              </div>

              {/* Recent History Quick-Access Carousel */}
              {recentHistory.length > 0 && (
                <div
                  style={{ width: '100%', marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e2235' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <History size={13} /> Recent Cutouts (Autosaved)
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', overflowX: 'auto', padding: '4px 0' }}>
                    {recentHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setOriginal(item.original);
                          setResult(item.result);
                          setTab('result');
                        }}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 8,
                          background: CHECKER_BG,
                          border: '1px solid #23283c',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all .15s',
                        }}
                        title={`Re-open cutout (${item.time})`}
                      >
                        <img src={item.result} alt="Recent" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
          </div>
        ) : (
          /* Active Processing / Preview View */
          <div className="bgr-body">
            <div className="bgr-main">
              {/* View Navigation Tabs */}
              {result && !loading && (
                <div className="bgr-tabs">
                  <button
                    className={`bgr-tab ${tab === 'compare' ? 'active' : ''}`}
                    onClick={() => setTab('compare')}
                  >
                    <Eye size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Split Compare
                  </button>
                  <button
                    className={`bgr-tab ${tab === 'side' ? 'active' : ''}`}
                    onClick={() => setTab('side')}
                  >
                    <ImageIcon size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Side by Side
                  </button>
                  <button
                    className={`bgr-tab ${tab === 'result' ? 'active' : ''}`}
                    onClick={() => setTab('result')}
                  >
                    <Scissors size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Cutout Only
                  </button>
                  <button
                    className={`bgr-tab ${tab === 'touchup' ? 'active' : ''}`}
                    onClick={() => {
                      setTab('touchup');
                      setActiveTabGroup('touchup');
                    }}
                  >
                    <Paintbrush size={13} style={{ marginRight: 5, verticalAlign: 'middle', color: '#ec4899' }} /> Touch-Up Brush
                  </button>
                  <button
                    className={`bgr-tab ${tab === 'original' ? 'active' : ''}`}
                    onClick={() => setTab('original')}
                  >
                    <ImageIcon size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} /> Original
                  </button>

                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {imgDimensions.width > 0 && (
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                        {imgDimensions.width} × {imgDimensions.height} px
                      </span>
                    )}
                    <button
                      className="bgr-btn bgr-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={copyResultToClipboard}
                      title="Copy Cutout to Clipboard (Ctrl+V into Photoshop, Figma, Canva, WhatsApp)"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy Cutout'}
                    </button>
                  </div>
                </div>
              )}

              {/* Main Stage */}
              <div className="bgr-drop">
                {loading && (
                  <div className="bgr-progress">
                    <div style={{ width: 80, height: 80 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80" className="bgr-spinner">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(236,72,153,.15)" strokeWidth="6" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="url(#bgr-grad)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="160"
                          strokeDashoffset="120"
                        />
                        <defs>
                          <linearGradient id="bgr-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }} className="bgr-pulse">
                      {quality === 'extreme' ? 'Extracting Cutout with High Precision...' : 'Removing Background...'}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                      {quality === 'extreme' ? `High-precision edge processing (${elapsedTime}s)` : `Processing image (${elapsedTime}s)`}
                    </p>
                  </div>
                )}

                {/* View 1: Split Compare */}
                {result && !loading && tab === 'compare' && (
                  <div
                    ref={sliderRef}
                    className="bgr-compare"
                    onMouseDown={() => setDragging(true)}
                    onTouchStart={() => setDragging(true)}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: currentPreviewBg }} />
                    <img
                      src={compositeUrl || result}
                      alt="Cutout"
                      style={{
                        clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
                        transform: `translate(-50%, -50%) scale(${zoom})`,
                      }}
                    />
                    <img
                      src={original}
                      alt="Original"
                      style={{
                        clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                        transform: `translate(-50%, -50%) scale(${zoom})`,
                      }}
                    />
                    <div className="bgr-slider-line" style={{ left: `${sliderPos}%` }} />
                    <div className="bgr-slider-handle" style={{ left: `${sliderPos}%` }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <div style={{ width: 2, height: 10, background: '#fff', borderRadius: 1 }} />
                        <div style={{ width: 2, height: 10, background: '#fff', borderRadius: 1 }} />
                      </div>
                    </div>
                    <span className="bgr-label bgr-label-orig">Original</span>
                    <span className="bgr-label bgr-label-result">Cutout Studio</span>
                  </div>
                )}

                {/* View 2: Side by Side */}
                {result && !loading && tab === 'side' && (
                  <div className="bgr-side-by-side">
                    <div className="bgr-side-pane">
                      <img src={original} alt="Original" style={{ transform: `scale(${zoom})` }} />
                      <span className="bgr-label bgr-label-orig">Original</span>
                    </div>
                    <div className="bgr-side-pane" style={{ background: currentPreviewBg }}>
                      <img src={compositeUrl || result} alt="Cutout" style={{ transform: `scale(${zoom})` }} />
                      <span className="bgr-label bgr-label-result">Studio Result</span>
                    </div>
                  </div>
                )}

                {/* View 3: Result Only */}
                {result && !loading && tab === 'result' && (
                  <div className="bgr-result-only" style={{ background: currentPreviewBg }}>
                    <img src={compositeUrl || result} alt="Cutout Result" style={{ transform: `scale(${zoom})` }} />

                    {/* Optional Passport Alignment Overlay */}
                    {showPassportGuide && (
                      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '48%', height: '62%', border: '2px dashed rgba(236,72,153,0.7)', borderRadius: '50% 50% 45% 45%', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#ec4899', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>
                            Face & Eye Line
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* View 4: Original Only */}
                {result && !loading && tab === 'original' && (
                  <div className="bgr-result-only">
                    <img src={original} alt="Original" style={{ transform: `scale(${zoom})` }} />
                  </div>
                )}

                {/* View 5: Touch-Up Brush Interactive Stage */}
                {result && !loading && tab === 'touchup' && (
                  <div
                    className="bgr-brush-stage"
                    onMouseDown={handleBrushStart}
                    onMouseMove={handleBrushMove}
                    onMouseUp={handleBrushEnd}
                    onTouchStart={handleBrushStart}
                    onTouchMove={handleBrushMove}
                    onTouchEnd={handleBrushEnd}
                  >
                    <img
                      ref={brushCanvasRef}
                      src={compositeUrl || result}
                      alt="Touchup Brush Canvas"
                      className="bgr-brush-canvas"
                      style={{ background: currentPreviewBg }}
                    />
                    {isBrushing && (
                      <div
                        className="bgr-brush-cursor-circle"
                        style={{
                          left: brushPos.x,
                          top: brushPos.y,
                          width: brushSize,
                          height: brushSize,
                          borderColor: brushMode === 'erase' ? '#ef4444' : brushMode === 'spot' ? '#f59e0b' : '#10b981',
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Stage Zoom Controls */}
                {result && !loading && (
                  <div className="bgr-zoom-controls">
                    <button className="bgr-btn-icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} title="Zoom Out">
                      <ZoomOut size={13} />
                    </button>
                    <span style={{ fontSize: 11, padding: '0 6px', color: '#94a3b8', lineHeight: '28px' }}>
                      {Math.round(zoom * 100)}%
                    </span>
                    <button className="bgr-btn-icon" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} title="Zoom In">
                      <ZoomIn size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Studio Right Sidebar Drawer ──────────────────────── */}
            <div className="bgr-sidebar">
              {/* Horizontal Category Switcher */}
              <div className="bgr-subtabs-bar">
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'backdrop' ? 'active' : ''}`}
                  onClick={() => setActiveTabGroup('backdrop')}
                >
                  <Palette size={13} /> Backdrops
                </button>
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'ecomm' ? 'active' : ''}`}
                  onClick={() => setActiveTabGroup('ecomm')}
                >
                  <Box size={13} /> Podiums & Brand
                </button>
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'lighting' ? 'active' : ''}`}
                  onClick={() => setActiveTabGroup('lighting')}
                >
                  <Sun size={13} /> Light & Neon
                </button>
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'typography' ? 'active' : ''}`}
                  onClick={() => setActiveTabGroup('typography')}
                >
                  <Type size={13} /> Typography & QR
                </button>
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'touchup' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTabGroup('touchup');
                    setTab('touchup');
                  }}
                >
                  <Paintbrush size={13} /> Touch-Up
                </button>
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'framing' ? 'active' : ''}`}
                  onClick={() => setActiveTabGroup('framing')}
                >
                  <Crop size={13} /> Passport & Frame
                </button>
                <button
                  className={`bgr-subtab-btn ${activeTabGroup === 'export' ? 'active' : ''}`}
                  onClick={() => setActiveTabGroup('export')}
                >
                  <FileImage size={13} /> Export
                </button>
              </div>

              {/* ── GROUP 1: BACKDROPS, DSLR BOKEH & COLOR SPLASH ─── */}
              {activeTabGroup === 'backdrop' && (
                <>
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Extraction Precision</span>
                      <ShieldCheck size={13} style={{ color: '#ec4899' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <button
                        className={`bgr-mode-btn ${quality === 'standard' ? 'active' : ''}`}
                        onClick={() => quality !== 'standard' && reprocessWithQuality('standard')}
                        style={{ justifyContent: 'center' }}
                      >
                        <Zap size={14} /> Fast
                      </button>
                      <button
                        className={`bgr-mode-btn ${quality === 'extreme' ? 'active' : ''}`}
                        onClick={() => quality !== 'extreme' && reprocessWithQuality('extreme')}
                        style={{ justifyContent: 'center' }}
                      >
                        <Sparkles size={14} /> High Precision
                      </button>
                    </div>
                  </div>

                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Background Mode</span>
                      <Palette size={13} style={{ color: '#94a3b8' }} />
                    </div>
                    <div className="bgr-mode-grid">
                      <button className={`bgr-mode-btn ${bgMode === 'transparent' ? 'active' : ''}`} onClick={() => setBgMode('transparent')}>
                        <Scissors size={14} /> Transparent
                      </button>
                      <button className={`bgr-mode-btn ${bgMode === 'color' ? 'active' : ''}`} onClick={() => setBgMode('color')}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: bgColor, border: '1px solid #666' }} /> Solid Color
                      </button>
                      <button className={`bgr-mode-btn ${bgMode === 'gradient' ? 'active' : ''}`} onClick={() => setBgMode('gradient')}>
                        <Sparkles size={14} /> Gradient
                      </button>
                      <button className={`bgr-mode-btn ${bgMode === 'blur' ? 'active' : ''}`} onClick={() => setBgMode('blur')}>
                        <Camera size={14} style={{ color: '#06b6d4' }} /> DSLR Bokeh
                      </button>
                      <button className={`bgr-mode-btn ${bgMode === 'colorsplash' ? 'active' : ''}`} onClick={() => setBgMode('colorsplash')}>
                        <Moon size={14} style={{ color: '#f59e0b' }} /> Color Splash
                      </button>
                      <button
                        className={`bgr-mode-btn ${bgMode === 'custom' ? 'active' : ''}`}
                        onClick={() => bgImageInputRef.current?.click()}
                      >
                        <Upload size={14} /> {customBgUrl ? 'Change Photo' : 'Custom Photo'}
                      </button>
                    </div>
                    <input ref={bgImageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCustomBgUpload} />
                  </div>

                  {/* DSLR Portrait Bokeh Settings */}
                  {bgMode === 'blur' && (
                    <div className="bgr-sidebar-section">
                      <div className="bgr-sidebar-title">
                        <span>DSLR Bokeh Blur</span>
                        <span>{blurAmount}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="45"
                        value={blurAmount}
                        onChange={(e) => setBlurAmount(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 8 }}>
                        {['smooth', 'creamy', 'vignette'].map((st) => (
                          <button
                            key={st}
                            className={`bgr-btn-icon ${bokehStyle === st ? 'active' : ''}`}
                            onClick={() => setBokehStyle(st)}
                            style={{ fontSize: 10, padding: '5px 4px', textTransform: 'capitalize' }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Splash Settings */}
                  {bgMode === 'colorsplash' && (
                    <div className="bgr-sidebar-section">
                      <div className="bgr-sidebar-title">
                        <span>Background Desaturation</span>
                        <span>{desaturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={desaturation}
                        onChange={(e) => setDesaturation(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                      />
                    </div>
                  )}

                  {/* Custom Background Interactive Positioning */}
                  {bgMode === 'custom' && (
                    <div className="bgr-sidebar-section">
                      <div className="bgr-sidebar-title">
                        <span>Cutout Transform</span>
                        <button
                          className="bgr-btn-icon"
                          style={{ padding: '2px 6px', fontSize: 10 }}
                          onClick={() => {
                            setSubjectPosX(0);
                            setSubjectPosY(0);
                            setSubjectScale(1.0);
                            setFlipH(false);
                            setFlipV(false);
                          }}
                        >
                          Reset
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>Scale</span>
                            <span>{Math.round(subjectScale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.6"
                            step="0.05"
                            value={subjectScale}
                            onChange={(e) => setSubjectScale(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>Position X</span>
                            <span>{subjectPosX}px</span>
                          </div>
                          <input
                            type="range"
                            min="-160"
                            max="160"
                            value={subjectPosX}
                            onChange={(e) => setSubjectPosX(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>Position Y</span>
                            <span>{subjectPosY}px</span>
                          </div>
                          <input
                            type="range"
                            min="-160"
                            max="160"
                            value={subjectPosY}
                            onChange={(e) => setSubjectPosY(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button
                            className={`bgr-btn-icon ${flipH ? 'active' : ''}`}
                            onClick={() => setFlipH(!flipH)}
                            style={{ flex: 1, padding: 6, fontSize: 11 }}
                          >
                            <FlipHorizontal size={13} /> Flip H
                          </button>
                          <button
                            className={`bgr-btn-icon ${flipV ? 'active' : ''}`}
                            onClick={() => setFlipV(!flipV)}
                            style={{ flex: 1, padding: 6, fontSize: 11 }}
                          >
                            <FlipVertical size={13} /> Flip V
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solid Color Palette */}
                  {bgMode === 'color' && (
                    <div className="bgr-sidebar-section">
                      <div className="bgr-sidebar-title">
                        <span>Color Palette</span>
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          style={{ width: 28, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                      </div>
                      {COLOR_CATEGORIES.map((cat) => (
                        <div key={cat.category}>
                          <div className="bgr-color-category">{cat.category}</div>
                          <div className="bgr-color-grid">
                            {cat.colors.map((c) => (
                              <div
                                key={c}
                                className={`bgr-color-swatch ${bgColor === c ? 'active' : ''}`}
                                style={{ background: c }}
                                onClick={() => setBgColor(c)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gradient Presets */}
                  {bgMode === 'gradient' && (
                    <div className="bgr-sidebar-section">
                      <div className="bgr-sidebar-title">Gradient Presets</div>
                      <div className="bgr-grad-grid">
                        {GRADIENT_PRESETS.map((g) => (
                          <div
                            key={g.label}
                            className={`bgr-grad-swatch ${bgGradient === g.value ? 'active' : ''}`}
                            style={{ background: g.value }}
                            onClick={() => setBgGradient(g.value)}
                          >
                            <span>{g.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── GROUP 2: 3D PODIUMS, E-COMMERCE & BRANDING ─────── */}
              {activeTabGroup === 'ecomm' && (
                <>
                  {/* 3D Studio Podiums */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>3D Studio Podiums & Stands</span>
                      <Box size={14} style={{ color: '#ec4899' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {PODIUM_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          className={`bgr-mode-btn ${podiumType === p.id ? 'active' : ''}`}
                          onClick={() => setPodiumType(p.id)}
                          style={{ fontSize: 10, padding: '7px 8px', justifyContent: 'center' }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* E-Commerce Product Features */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Product Enhancements</span>
                      <ShoppingBag size={14} style={{ color: '#06b6d4' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>Floor Contact Shadow</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>Natural ground shadow for products</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={floorShadow}
                          onChange={(e) => setFloorShadow(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>Glass Mirror Reflection</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>Luxury showroom glossy ground fade</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={mirrorReflection}
                          onChange={(e) => setMirrorReflection(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>15% Amazon / Flipkart Padding</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>Centers subject to meet strict 85% frame rule</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoPadding}
                          onChange={(e) => setAutoPadding(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>Circular DP Profile Avatar</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>1-Click round crop with colored ring</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={circularDp}
                          onChange={(e) => setCircularDp(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branding: Watermark Logo Upload */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Business Watermark / Logo</span>
                      {watermarkUrl && (
                        <button
                          className="bgr-btn-icon"
                          style={{ padding: '2px 6px', fontSize: 10, color: '#ef4444' }}
                          onClick={() => setWatermarkUrl(null)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <button
                      className="bgr-btn bgr-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
                      onClick={() => watermarkInputRef.current?.click()}
                    >
                      <Upload size={14} /> {watermarkUrl ? 'Change Logo' : 'Upload Logo PNG'}
                    </button>
                    <input ref={watermarkInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWatermarkUpload} />

                    {watermarkUrl && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Opacity</span>
                          <span>{Math.round(watermarkOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Promo & Sales Badges */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Promo Badges</span>
                      <Tag size={13} style={{ color: '#f59e0b' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {PROMO_BADGES.map((b) => (
                        <button
                          key={b.id}
                          className={`bgr-mode-btn ${activeBadge === b.id ? 'active' : ''}`}
                          onClick={() => setActiveBadge(b.id)}
                          style={{ fontSize: 10, padding: '6px 8px', justifyContent: 'center' }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── GROUP 3: LIGHTING, NEON GLOW & 360° SUNLIGHT ──── */}
              {activeTabGroup === 'lighting' && (
                <>
                  {/* Cyber Neon Glow & Aura Light */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Cyber Neon Glow & Aura</span>
                      <input
                        type="checkbox"
                        checked={neonEnabled}
                        onChange={(e) => setNeonEnabled(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#00f0ff', cursor: 'pointer' }}
                      />
                    </div>
                    {neonEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Glow Radius</span>
                          <span>{neonRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="45"
                          value={neonRadius}
                          onChange={(e) => setNeonRadius(Number(e.target.value))}
                          style={{ width: '100%', accentColor: neonColor, cursor: 'pointer' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginTop: 4 }}>
                          {NEON_COLORS.map((nc) => (
                            <div
                              key={nc.color}
                              onClick={() => setNeonColor(nc.color)}
                              style={{
                                width: '100%',
                                aspectRatio: 1,
                                borderRadius: 6,
                                background: nc.color,
                                border: neonColor === nc.color ? '2px solid #fff' : '1px solid #333',
                                cursor: 'pointer',
                                boxShadow: `0 0 6px ${nc.color}`,
                              }}
                              title={nc.label}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 360° Directional Sunlight Shadow */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>360° Directional Sunlight</span>
                      <input
                        type="checkbox"
                        checked={sunShadowEnabled}
                        onChange={(e) => setSunShadowEnabled(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#f59e0b', cursor: 'pointer' }}
                      />
                    </div>
                    {sunShadowEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>Light Angle ({sunAngle}°)</span>
                            <Compass size={13} style={{ transform: `rotate(${sunAngle}deg)` }} />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={sunAngle}
                            onChange={(e) => setSunAngle(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>Shadow Distance</span>
                            <span>{sunDistance}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            value={sunDistance}
                            onChange={(e) => setSunDistance(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edge De-Fringe & Halo Cleaner */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Edge De-Fringe (Halo Cleaner)</span>
                      <span>{defringe}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={defringe}
                      onChange={(e) => setDefringe(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: '#94a3b8' }}>
                      Cleans leftover green-screen or white background halo bleed from hair edges.
                    </p>
                  </div>

                  {/* Subject Lighting Sliders */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Subject Lighting & Tone</span>
                      <SunMedium size={14} style={{ color: '#f59e0b' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Brightness</span>
                          <span>{brightness > 0 ? `+${brightness}` : brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Contrast</span>
                          <span>{contrast > 0 ? `+${contrast}` : contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Detail Enhancer (Unsharp Mask)</span>
                          <span>{edgeSharpness}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={edgeSharpness}
                          onChange={(e) => setEdgeSharpness(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── GROUP 4: SMART TYPOGRAPHY & QR CODE ────────────── */}
              {activeTabGroup === 'typography' && (
                <>
                  {/* Smart Typography & Price Tag Studio */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Typography & Price Tag</span>
                      <Type size={14} style={{ color: '#ec4899' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter text (e.g. ₹499 / SALE / AXOM)"
                        value={textOverlay}
                        onChange={(e) => setTextOverlay(e.target.value)}
                        style={{ background: '#141724', border: '1px solid #23283c', color: '#fff', borderRadius: 6, padding: '7px 10px', fontSize: 12 }}
                      />

                      {textOverlay && (
                        <>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <select
                              value={textFont}
                              onChange={(e) => setTextFont(e.target.value)}
                              style={{ flex: 1, background: '#141724', border: '1px solid #23283c', color: '#cbd5e1', borderRadius: 6, padding: '6px', fontSize: 11 }}
                            >
                              <option value="system-ui, sans-serif">Modern Sans</option>
                              <option value="Impact, sans-serif">Impact Bold</option>
                              <option value="Georgia, serif">Luxury Serif</option>
                              <option value="cursive">Handwriting</option>
                            </select>

                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              style={{ width: 34, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <button
                              className={`bgr-mode-btn ${textLayer === 'front' ? 'active' : ''}`}
                              onClick={() => setTextLayer('front')}
                              style={{ justifyContent: 'center', fontSize: 11 }}
                            >
                              In Front of Subject
                            </button>
                            <button
                              className={`bgr-mode-btn ${textLayer === 'behind' ? 'active' : ''}`}
                              onClick={() => setTextLayer('behind')}
                              style={{ justifyContent: 'center', fontSize: 11 }}
                            >
                              Behind Subject
                            </button>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                              <span>Vertical Position</span>
                              <span>{textPosY}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              value={textPosY}
                              onChange={(e) => setTextPosY(Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dynamic QR Code Generator Overlay */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Dynamic QR Code Overlay</span>
                      <input
                        type="checkbox"
                        checked={qrEnabled}
                        onChange={(e) => setQrEnabled(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#06b6d4', cursor: 'pointer' }}
                      />
                    </div>

                    {qrEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                          type="text"
                          placeholder="QR Link (e.g. WhatsApp, UPI, Store URL)"
                          value={qrText}
                          onChange={(e) => setQrText(e.target.value)}
                          style={{ background: '#141724', border: '1px solid #23283c', color: '#fff', borderRadius: 6, padding: '7px 10px', fontSize: 12 }}
                        />

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>QR Code Size</span>
                            <span>{qrSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="200"
                            value={qrSize}
                            onChange={(e) => setQrSize(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                            <button
                              key={pos}
                              className={`bgr-btn-icon ${qrPos === pos ? 'active' : ''}`}
                              onClick={() => setQrPos(pos)}
                              style={{ fontSize: 9, padding: '4px 2px' }}
                            >
                              {pos.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── GROUP 5: TOUCH-UP BRUSH & SPOT ERASER ──────────── */}
              {activeTabGroup === 'touchup' && (
                <>
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Manual Touch-Up Brush</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="bgr-btn-icon"
                          style={{ padding: 4 }}
                          disabled={historyStep <= 0}
                          onClick={handleUndo}
                          title="Undo Brush Stroke"
                        >
                          <Undo2 size={13} />
                        </button>
                        <button
                          className="bgr-btn-icon"
                          style={{ padding: 4 }}
                          disabled={historyStep >= historyStack.length - 1}
                          onClick={handleRedo}
                          title="Redo Brush Stroke"
                        >
                          <Redo2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                      <button
                        className={`bgr-mode-btn ${brushMode === 'erase' ? 'active' : ''}`}
                        onClick={() => setBrushMode('erase')}
                        style={{ justifyContent: 'center', fontSize: 11, padding: '7px 4px' }}
                      >
                        <Eraser size={13} style={{ color: '#ef4444' }} /> Erase
                      </button>
                      <button
                        className={`bgr-mode-btn ${brushMode === 'restore' ? 'active' : ''}`}
                        onClick={() => setBrushMode('restore')}
                        style={{ justifyContent: 'center', fontSize: 11, padding: '7px 4px' }}
                      >
                        <Paintbrush size={13} style={{ color: '#10b981' }} /> Restore
                      </button>
                      <button
                        className={`bgr-mode-btn ${brushMode === 'spot' ? 'active' : ''}`}
                        onClick={() => setBrushMode('spot')}
                        style={{ justifyContent: 'center', fontSize: 11, padding: '7px 4px' }}
                      >
                        <Sparkles size={13} style={{ color: '#f59e0b' }} /> Spot
                      </button>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                        <span>Brush Size</span>
                        <span>{brushSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="72"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        style={{ width: '100%', accentColor: brushMode === 'erase' ? '#ef4444' : brushMode === 'spot' ? '#f59e0b' : '#10b981', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── GROUP 6: PASSPORT & FRAMING ────────────────────── */}
              {activeTabGroup === 'framing' && (
                <>
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Official Passport & Visa Maker</span>
                      <Printer size={14} style={{ color: '#06b6d4' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {PASSPORT_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          className={`bgr-mode-btn ${passportMode === p.id ? 'active' : ''}`}
                          onClick={() => {
                            setPassportMode(p.id);
                            setAspectRatio('passport');
                            setBgMode('color');
                            setBgColor(p.bg);
                            setShowPassportGuide(true);
                          }}
                          style={{ fontSize: 11 }}
                        >
                          <Shield size={13} style={{ color: '#06b6d4' }} /> {p.label}
                        </button>
                      ))}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '6px 0' }}>
                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>Face Alignment Guide Overlay</span>
                        <input
                          type="checkbox"
                          checked={showPassportGuide}
                          onChange={(e) => setShowPassportGuide(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#06b6d4', cursor: 'pointer' }}
                        />
                      </div>

                      <button
                        className="bgr-btn bgr-btn-primary"
                        onClick={generatePassportPrintSheet}
                        style={{
                          background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                          marginTop: 6,
                          fontSize: 12,
                        }}
                      >
                        <Printer size={14} /> {printSheetGenerated ? '✓ Sheet Downloaded!' : 'Download 8-in-1 Print Sheet (4x6")'}
                      </button>
                    </div>
                  </div>

                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Aspect Ratio Framing</span>
                      <Crop size={14} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {ASPECT_RATIOS.map((ar) => (
                        <button
                          key={ar.id}
                          onClick={() => {
                            setAspectRatio(ar.id);
                            if (ar.id !== 'passport') setShowPassportGuide(false);
                          }}
                          style={{
                            padding: '7px 4px',
                            borderRadius: 6,
                            border: aspectRatio === ar.id ? '1px solid #ec4899' : '1px solid #23283c',
                            background: aspectRatio === ar.id ? 'rgba(236,72,153,.15)' : '#141724',
                            color: aspectRatio === ar.id ? '#f472b6' : '#94a3b8',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all .15s',
                          }}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sticker Outline */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Sticker Outline Stroke</span>
                      <input
                        type="checkbox"
                        checked={stickerEnabled}
                        onChange={(e) => setStickerEnabled(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#ec4899', cursor: 'pointer' }}
                      />
                    </div>
                    {stickerEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                          <span>Outline Thickness</span>
                          <span>{stickerWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="24"
                          value={stickerWidth}
                          onChange={(e) => setStickerWidth(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── GROUP 7: NEXT-GEN EXPORT & TARGET KB COMPRESSOR ─ */}
              {activeTabGroup === 'export' && (
                <>
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Export Format</span>
                      <FileImage size={14} style={{ color: '#06b6d4' }} />
                    </div>

                    <div className="bgr-format-pills">
                      <button
                        className={`bgr-format-pill ${exportFormat === 'png' ? 'active' : ''}`}
                        onClick={() => setExportFormat('png')}
                      >
                        PNG
                      </button>
                      <button
                        className={`bgr-format-pill ${exportFormat === 'webp' ? 'active' : ''}`}
                        onClick={() => setExportFormat('webp')}
                      >
                        WebP
                      </button>
                      <button
                        className={`bgr-format-pill ${exportFormat === 'jpeg' ? 'active' : ''}`}
                        onClick={() => setExportFormat('jpeg')}
                      >
                        JPG
                      </button>
                    </div>
                  </div>

                  {/* Target File Size Compressor (Govt / KYC Mode) */}
                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">
                      <span>Target File Size (Govt/KYC)</span>
                      <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {[
                        { id: 'auto', label: 'Auto (Best)' },
                        { id: '20', label: '< 20 KB (Govt)' },
                        { id: '50', label: '< 50 KB (SSC)' },
                        { id: '100', label: '< 100 KB (UPSC)' },
                        { id: '200', label: '< 200 KB (Web)' },
                      ].map((kb) => (
                        <button
                          key={kb.id}
                          className={`bgr-mode-btn ${targetKbMode === kb.id ? 'active' : ''}`}
                          onClick={() => {
                            setTargetKbMode(kb.id);
                            if (kb.id !== 'auto' && exportFormat === 'png') {
                              setExportFormat('jpeg'); // Auto-switch to compressed format
                            }
                          }}
                          style={{ fontSize: 10, padding: '7px 4px', justifyContent: 'center' }}
                        >
                          {kb.label}
                        </button>
                      ))}
                    </div>
                    {targetKbMode !== 'auto' && (
                      <p style={{ margin: '6px 0 0', fontSize: 10, color: '#10b981' }}>
                        ✓ Binary compression enabled: Output guaranteed strictly under {targetKbMode} KB.
                      </p>
                    )}
                  </div>

                  <div className="bgr-sidebar-section">
                    <div className="bgr-sidebar-title">Specifications</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: '#cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Resolution</span>
                        <span>{upscale2x ? `${imgDimensions.width * 2} × ${imgDimensions.height * 2} px (2x HD)` : `${imgDimensions.width} × ${imgDimensions.height} px`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Target Size</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          {targetKbMode === 'auto' ? estimatedSizes[exportFormat] || 'Calculating...' : `< ${targetKbMode} KB`}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Desktop Export Action */}
              <div className="bgr-sidebar-section" style={{ marginTop: 'auto' }}>
                <div className="bgr-sidebar-title">
                  <span>Download Cutout</span>
                  <span style={{ color: '#06b6d4', textTransform: 'uppercase', fontSize: 10 }}>
                    .{exportFormat === 'jpeg' ? 'jpg' : exportFormat}
                  </span>
                </div>
                <button
                  className="bgr-btn bgr-btn-primary"
                  disabled={!result || loading}
                  onClick={downloadResult}
                  style={{
                    background:
                      exportFormat === 'webp'
                        ? 'linear-gradient(135deg,#06b6d4,#8b5cf6)'
                        : exportFormat === 'jpeg'
                        ? 'linear-gradient(135deg,#f59e0b,#ec4899)'
                        : 'linear-gradient(135deg,#ec4899,#8b5cf6)',
                  }}
                >
                  <Download size={15} /> Download as .{exportFormat === 'jpeg' ? 'jpg' : exportFormat.toUpperCase()} ({targetKbMode === 'auto' ? estimatedSizes[exportFormat] || 'Full Res' : `< ${targetKbMode} KB`})
                </button>
              </div>
            </div>

            {/* Sticky Mobile Download Action Bar */}
            <div className="bgr-mobile-sticky-bar">
              <div style={{ display: 'flex', background: '#141724', borderRadius: 6, padding: 2, border: '1px solid #23283c' }}>
                <button
                  onClick={() => setExportFormat('png')}
                  style={{
                    border: 'none',
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: exportFormat === 'png' ? '#ec4899' : 'transparent',
                    color: exportFormat === 'png' ? '#fff' : '#94a3b8',
                  }}
                >
                  PNG
                </button>
                <button
                  onClick={() => setExportFormat('webp')}
                  style={{
                    border: 'none',
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: exportFormat === 'webp' ? '#06b6d4' : 'transparent',
                    color: exportFormat === 'webp' ? '#fff' : '#94a3b8',
                  }}
                >
                  WebP
                </button>
                <button
                  onClick={() => setExportFormat('jpeg')}
                  style={{
                    border: 'none',
                    padding: '5px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: exportFormat === 'jpeg' ? '#f59e0b' : 'transparent',
                    color: exportFormat === 'jpeg' ? '#fff' : '#94a3b8',
                  }}
                >
                  JPG
                </button>
              </div>

              <button
                className="bgr-btn bgr-btn-primary"
                disabled={!result || loading}
                onClick={downloadResult}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  fontSize: 12,
                  background:
                    exportFormat === 'webp'
                      ? 'linear-gradient(135deg,#06b6d4,#8b5cf6)'
                      : exportFormat === 'jpeg'
                      ? 'linear-gradient(135deg,#f59e0b,#ec4899)'
                      : 'linear-gradient(135deg,#ec4899,#8b5cf6)',
                }}
              >
                <Download size={14} /> Download .{exportFormat === 'jpeg' ? 'jpg' : exportFormat.toUpperCase()} ({targetKbMode === 'auto' ? estimatedSizes[exportFormat] || '' : `< ${targetKbMode} KB`})
              </button>
            </div>
          </div>
        )
      )}

      {/* Hidden Master Image Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />
    </div>
  );
}
