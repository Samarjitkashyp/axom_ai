'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Copy,
  Check,
  Heart,
  Shuffle,
  Plus,
  Upload,
  Download,
  Lock,
  Unlock,
  Sliders,
  Search,
  Sparkles,
  Layout,
  Eye,
  Share2,
  Code,
  Palette,
  Layers,
  ChevronDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone,
  RotateCcw,
  Compass,
  Flame,
  Star,
  Clock,
  Bookmark,
  Brush,
} from 'lucide-react';

// ==========================================
// 1. CURATED COLOR HUNT PALETTES (60+ Hand-Curated)
// ==========================================
const CURATED_PALETTES = [
  // Trending / Popular
  { id: 'ch-1', name: 'Nordic Frost', colors: ['#222831', '#393E46', '#00ADB5', '#EEEEEE'], likes: 1420, tags: ['Cold', 'Dark', 'Minimal'], date: 'Trending' },
  { id: 'ch-2', name: 'Sunset Boulevard', colors: ['#F38181', '#FCE38A', '#EAFFD0', '#95E1D3'], likes: 1890, tags: ['Pastel', 'Summer', 'Warm'], date: 'Trending' },
  { id: 'ch-3', name: 'Matcha Latte', colors: ['#3A6351', '#E3CAA5', '#FFFBE9', '#AD8B73'], likes: 1120, tags: ['Earth', 'Nature', 'Vintage'], date: 'Popular' },
  { id: 'ch-4', name: 'Cyber Neon', colors: ['#08020F', '#1F1D36', '#864879', '#E9A6A6'], likes: 1650, tags: ['Neon', 'Dark', 'Cyberpunk'], date: 'Trending' },
  { id: 'ch-5', name: 'Retro Sunset', colors: ['#2B2E4A', '#E84545', '#903749', '#53354A'], likes: 980, tags: ['Retro', 'Vintage', 'Dark'], date: 'Popular' },
  { id: 'ch-6', name: 'Lavender Dream', colors: ['#EBE645', '#FE7A15', '#400036', '#4D4C7D'], likes: 780, tags: ['Warm', 'Summer', 'Retro'], date: 'Popular' },
  { id: 'ch-7', name: 'Sakura Petals', colors: ['#FFAAA7', '#FFD3B4', '#D5ECC2', '#98DDCA'], likes: 2150, tags: ['Pastel', 'Spring', 'Light'], date: 'Trending' },
  { id: 'ch-8', name: 'Midnight Gold', colors: ['#0B0C10', '#1F2833', '#C5C6C7', '#66FCF1'], likes: 2310, tags: ['Dark', 'Neon', 'Minimal'], date: 'Popular' },
  { id: 'ch-9', name: 'Warm Terracotta', colors: ['#2C363F', '#F2F5EA', '#E75A7C', '#BBC7A4'], likes: 1340, tags: ['Warm', 'Earth', 'Pastel'], date: 'Popular' },
  { id: 'ch-10', name: 'Oceanic Deep', colors: ['#03254C', '#1167B1', '#187BCD', '#2A9DF4'], likes: 1540, tags: ['Cold', 'Ocean', 'Minimal'], date: 'Trending' },
  { id: 'ch-11', name: 'Peach Sorbet', colors: ['#F76C6C', '#F8E9A1', '#24305E', '#374785'], likes: 1720, tags: ['Warm', 'Summer', 'Vintage'], date: 'Popular' },
  { id: 'ch-12', name: 'Espresso Bar', colors: ['#221E22', '#ECA72C', '#EE5622', '#F2F2F2'], likes: 1430, tags: ['Warm', 'Vintage', 'Retro'], date: 'Trending' },

  // Pastel
  { id: 'ch-13', name: 'Cotton Candy', colors: ['#B4ECE3', '#DFD3C3', '#F0ECE9', '#F9D5E5'], likes: 890, tags: ['Pastel', 'Light', 'Spring'], date: 'Pastel' },
  { id: 'ch-14', name: 'Mint Cream', colors: ['#809BCE', '#95B8D1', '#B8E0D2', '#D6EADF'], likes: 1210, tags: ['Pastel', 'Cold', 'Light'], date: 'Pastel' },
  { id: 'ch-15', name: 'Blush & Butter', colors: ['#FFC4D6', '#FFA6C1', '#FF87AB', '#FCC2FF'], likes: 970, tags: ['Pastel', 'Light', 'Spring'], date: 'Pastel' },
  { id: 'ch-16', name: 'Cloudberry', colors: ['#6B7AA1', '#11324D', '#C1CFC0', '#E7E0C9'], likes: 1100, tags: ['Pastel', 'Minimal', 'Cold'], date: 'Pastel' },
  { id: 'ch-17', name: 'Pistachio Dream', colors: ['#99B898', '#FECEAB', '#FF847C', '#E84A5F'], likes: 1890, tags: ['Pastel', 'Retro', 'Warm'], date: 'Pastel' },
  { id: 'ch-18', name: 'Marshmallow Sky', colors: ['#D0E8F2', '#79A3B1', '#456268', '#FCF8EC'], likes: 1330, tags: ['Pastel', 'Light', 'Cold'], date: 'Pastel' },

  // Vintage & Retro
  { id: 'ch-19', name: '70s Record Store', colors: ['#264653', '#2A9D8F', '#E76F51', '#F4A261'], likes: 2450, tags: ['Retro', 'Vintage', 'Warm'], date: 'Retro' },
  { id: 'ch-20', name: 'Polaroid Nostalgia', colors: ['#3D5A80', '#98C1D9', '#E0FBFC', '#EE6C4D'], likes: 1670, tags: ['Vintage', 'Cold', 'Warm'], date: 'Retro' },
  { id: 'ch-21', name: 'Mustard Velvet', colors: ['#4A0E4E', '#893168', '#EAE151', '#07004D'], likes: 850, tags: ['Retro', 'Dark', 'Neon'], date: 'Retro' },
  { id: 'ch-22', name: 'Diner Milkshake', colors: ['#F45B69', '#F6E8EA', '#22181C', '#5B616A'], likes: 790, tags: ['Retro', 'Vintage', 'Light'], date: 'Retro' },
  { id: 'ch-23', name: 'Old Library', colors: ['#2F3E46', '#354F52', '#52796F', '#84A98C'], likes: 1530, tags: ['Vintage', 'Nature', 'Dark'], date: 'Retro' },

  // Neon & Cyberpunk
  { id: 'ch-24', name: 'Tokyo Synthwave', colors: ['#1A1A24', '#7F00FF', '#E100FF', '#00FFCC'], likes: 3120, tags: ['Neon', 'Cyberpunk', 'Dark'], date: 'Neon' },
  { id: 'ch-25', name: 'Electric Velvet', colors: ['#0D0221', '#0F084B', '#26408B', '#A6CFE2'], likes: 1240, tags: ['Neon', 'Cold', 'Dark'], date: 'Neon' },
  { id: 'ch-26', name: 'Cyber Matrix', colors: ['#000000', '#003B00', '#008F11', '#00FF41'], likes: 2210, tags: ['Neon', 'Cyberpunk', 'Dark'], date: 'Neon' },
  { id: 'ch-27', name: 'Hyper Magenta', colors: ['#180A0A', '#711A75', '#F10086', '#F582A7'], likes: 1470, tags: ['Neon', 'Dark', 'Cyberpunk'], date: 'Neon' },
  { id: 'ch-28', name: 'Acid Sunset', colors: ['#2C061F', '#374045', '#EE4540', '#F7B733'], likes: 1060, tags: ['Neon', 'Retro', 'Warm'], date: 'Neon' },

  // Dark & Luxury
  { id: 'ch-29', name: 'Obsidian & Gold', colors: ['#121212', '#1E1E1E', '#D4AF37', '#F5E6BE'], likes: 2780, tags: ['Dark', 'Minimal', 'Gold'], date: 'Dark' },
  { id: 'ch-30', name: 'Deep Emerald', colors: ['#041C15', '#0E3B2F', '#2A7B62', '#7EDAB9'], likes: 1940, tags: ['Dark', 'Nature', 'Minimal'], date: 'Dark' },
  { id: 'ch-31', name: 'Carbon & Crimson', colors: ['#141414', '#262626', '#E50914', '#FFFFFF'], likes: 2650, tags: ['Dark', 'Minimal', 'Warm'], date: 'Dark' },
  { id: 'ch-32', name: 'Dark Monolith', colors: ['#16161A', '#242629', '#7F5AF0', '#2CB67D'], likes: 3410, tags: ['Dark', 'Neon', 'Minimal'], date: 'Dark' },
  { id: 'ch-33', name: 'Twilight Velvet', colors: ['#191825', '#865DFF', '#E384FF', '#FFA3FD'], likes: 1680, tags: ['Dark', 'Neon', 'Pastel'], date: 'Dark' },

  // Warm & Autumn
  { id: 'ch-34', name: 'Autumn Leaves', colors: ['#2B2B2B', '#D74E09', '#F2BB05', '#EFE9F4'], likes: 1190, tags: ['Warm', 'Autumn', 'Retro'], date: 'Warm' },
  { id: 'ch-35', name: 'Golden Hour', colors: ['#FFA36C', '#F9E0AE', '#6886C5', '#EB596E'], likes: 1820, tags: ['Warm', 'Summer', 'Sunset'], date: 'Warm' },
  { id: 'ch-36', name: 'Desert Dune', colors: ['#3A3042', '#DB9D47', '#FF7844', '#EBEBD3'], likes: 920, tags: ['Warm', 'Earth', 'Vintage'], date: 'Warm' },
  { id: 'ch-37', name: 'Pumpkin Spice', colors: ['#442211', '#B95A2B', '#E89242', '#F4D4A4'], likes: 1450, tags: ['Warm', 'Autumn', 'Earth'], date: 'Warm' },

  // Cold & Winter
  { id: 'ch-38', name: 'Glacier Bay', colors: ['#1B263B', '#415A77', '#778DA9', '#E0E1DD'], likes: 2130, tags: ['Cold', 'Minimal', 'Winter'], date: 'Cold' },
  { id: 'ch-39', name: 'Arctic Aurora', colors: ['#0B132B', '#1C2541', '#3A506B', '#5BC0BE'], likes: 2590, tags: ['Cold', 'Dark', 'Neon'], date: 'Cold' },
  { id: 'ch-40', name: 'Nordic Sea', colors: ['#22577A', '#38A3A5', '#57CC99', '#80ED99'], likes: 1980, tags: ['Cold', 'Nature', 'Summer'], date: 'Cold' },
  { id: 'ch-41', name: 'Deep Abyss', colors: ['#0A192F', '#172A45', '#303C55', '#64FFDA'], likes: 3100, tags: ['Cold', 'Dark', 'Neon'], date: 'Cold' },

  // Nature & Earth
  { id: 'ch-42', name: 'Sage & Olive', colors: ['#283618', '#606C38', '#DDA15E', '#FEFAE0'], likes: 2890, tags: ['Nature', 'Earth', 'Warm'], date: 'Nature' },
  { id: 'ch-43', name: 'Rainforest Mist', colors: ['#081C15', '#1B4332', '#2D6A4F', '#74C69D'], likes: 1870, tags: ['Nature', 'Cold', 'Dark'], date: 'Nature' },
  { id: 'ch-44', name: 'Botanical Garden', colors: ['#1E3F20', '#4A7C59', '#D9C5B2', '#FAF0CA'], likes: 1220, tags: ['Nature', 'Vintage', 'Earth'], date: 'Nature' },
  { id: 'ch-45', name: 'Earthy Clay', colors: ['#5F4B32', '#8F715B', '#C9A690', '#E5D4C0'], likes: 880, tags: ['Earth', 'Minimal', 'Vintage'], date: 'Nature' },

  // Summer & Beach
  { id: 'ch-46', name: 'Miami Breeze', colors: ['#00F0FF', '#FF007F', '#FFE600', '#181824'], likes: 2140, tags: ['Summer', 'Neon', 'Retro'], date: 'Summer' },
  { id: 'ch-47', name: 'Tropical Lagoon', colors: ['#05668D', '#028090', '#00A896', '#02C39A'], likes: 1740, tags: ['Summer', 'Ocean', 'Cold'], date: 'Summer' },
  { id: 'ch-48', name: 'Coral Reef', colors: ['#202040', '#543864', '#FF6363', '#FFBD69'], likes: 1530, tags: ['Summer', 'Warm', 'Sunset'], date: 'Summer' },

  // Minimal & Monochrome
  { id: 'ch-49', name: 'Slate Modern', colors: ['#0F172A', '#334155', '#94A3B8', '#F8FAFC'], likes: 2950, tags: ['Minimal', 'Dark', 'Cold'], date: 'Minimal' },
  { id: 'ch-50', name: 'Architectural Gray', colors: ['#18181B', '#27272A', '#71717A', '#FAFAFA'], likes: 2110, tags: ['Minimal', 'Dark', 'Light'], date: 'Minimal' },
  { id: 'ch-51', name: 'High Fashion Ivory', colors: ['#1C1917', '#78716C', '#D6D3D1', '#FAF8F5'], likes: 1670, tags: ['Minimal', 'Light', 'Warm'], date: 'Minimal' },
  { id: 'ch-52', name: 'Neo Brutalism', colors: ['#000000', '#FFDE59', '#FF5757', '#FFFFFF'], likes: 1840, tags: ['Minimal', 'Retro', 'Neon'], date: 'Minimal' },
];

const CATEGORY_TAGS = [
  'All',
  'Pastel',
  'Vintage',
  'Retro',
  'Neon',
  'Dark',
  'Warm',
  'Cold',
  'Summer',
  'Autumn',
  'Winter',
  'Spring',
  'Nature',
  'Earth',
  'Cyberpunk',
  'Minimal',
  'Sunset',
];

const COLOR_HUES = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Dark', hex: '#1E293B' },
  { name: 'Light', hex: '#F1F5F9' },
];

// ==========================================
// 2. COLOR MATHEMATICS & UTILITIES
// ==========================================
function hexToRgb(hex) {
  const c = (hex || '#000000').replace('#', '');
  const n = parseInt(c, 16) || 0;
  if (c.length === 3) {
    return {
      r: ((n >> 8) & 0xf) * 17,
      g: ((n >> 4) & 0xf) * 17,
      b: (n & 0xf) * 17,
    };
  }
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((brighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function getContrastingTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#111827' : '#FFFFFF';
}

function generateRandomAestheticPalette() {
  const baseH = Math.floor(Math.random() * 360);
  const styles = [
    // 1: Pastel/Warm
    () => [
      hslToHex(baseH, 45, 22),
      hslToHex((baseH + 25) % 360, 60, 48),
      hslToHex((baseH + 50) % 360, 75, 70),
      hslToHex((baseH + 75) % 360, 80, 92),
    ],
    // 2: Modern Dark Accent
    () => [
      hslToHex(baseH, 30, 10),
      hslToHex(baseH, 25, 20),
      hslToHex((baseH + 180) % 360, 85, 58),
      hslToHex((baseH + 180) % 360, 90, 88),
    ],
    // 3: Triadic Balance
    () => [
      hslToHex(baseH, 50, 25),
      hslToHex((baseH + 120) % 360, 65, 50),
      hslToHex((baseH + 240) % 360, 70, 75),
      hslToHex(baseH, 40, 94),
    ],
    // 4: Earthy Natural
    () => [
      hslToHex(baseH, 25, 18),
      hslToHex((baseH + 30) % 360, 35, 40),
      hslToHex((baseH + 60) % 360, 50, 65),
      hslToHex((baseH + 40) % 360, 45, 90),
    ],
  ];
  return styles[Math.floor(Math.random() * styles.length)]();
}

function extract4ColorsFromImage(img) {
  const canvas = document.createElement('canvas');
  const size = 120;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const buckets = {};
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }

  const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  const colors = [];

  for (const [key] of sorted) {
    if (colors.length >= 4) break;
    const [r, g, b] = key.split(',').map(Number);
    const hex = rgbToHex(r, g, b);
    const isDistinct = colors.every(c => {
      const o = hexToRgb(c);
      const dist = Math.sqrt((r - o.r) ** 2 + (g - o.g) ** 2 + (b - o.b) ** 2);
      return dist > 55;
    });
    if (isDistinct) colors.push(hex);
  }

  while (colors.length < 4) {
    colors.push(hslToHex(Math.floor(Math.random() * 360), 65, 50));
  }

  // Sort by luminance (dark to light) for Color Hunt's aesthetic proportion
  return colors.sort((a, b) => {
    const ra = hexToRgb(a), rb = hexToRgb(b);
    return getLuminance(ra.r, ra.g, ra.b) - getLuminance(rb.r, rb.g, rb.b);
  });
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function ColorPaletteGen({ onClose }) {
  // Unified Primary Navigation Tabs:
  // 'trending' | 'popular' | 'new' | 'random' | 'saved' | 'generator' | 'create' | 'extract'
  const [activeTab, setActiveTab] = useState('trending');
  const [randomSeed, setRandomSeed] = useState(1);
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedHue, setSelectedHue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Likes & Saved state (stored in localStorage)
  const [likes, setLikes] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('axom_colorhunt_likes') || '{}');
    } catch {
      return {};
    }
  });

  const [savedPalettes, setSavedPalettes] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('axom_colorhunt_custom') || '[]');
    } catch {
      return [];
    }
  });

  // Generator State
  const [genColors, setGenColors] = useState(() => CURATED_PALETTES[0].colors);
  const [lockedSlots, setLockedSlots] = useState([false, false, false, false]);

  // Custom Creator State
  const [customColors, setCustomColors] = useState(['#1E293B', '#3B82F6', '#60A5FA', '#F8FAFC']);
  const [customName, setCustomName] = useState('My Brand Palette');
  const [customTag, setCustomTag] = useState('Minimal');

  // Image Extractor State
  const [extractedColors, setExtractedColors] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Palette Inspector / Detail Modal
  const [inspectPalette, setInspectPalette] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(null);
  const [copiedFormat, setCopiedFormat] = useState(null);

  // Sync likes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('axom_colorhunt_likes', JSON.stringify(likes));
    } catch {}
  }, [likes]);

  // Sync custom palettes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('axom_colorhunt_custom', JSON.stringify(savedPalettes));
    } catch {}
  }, [savedPalettes]);

  // Keyboard shortcut: Spacebar in generator mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && activeTab === 'generator' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        rollGenerator();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, lockedSlots]);

  // Copy with floating toast
  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedNotification(hex);
    setTimeout(() => setCopiedNotification(null), 1600);
  };

  // Toggle like on palette
  const toggleLike = (palette) => {
    setLikes(prev => {
      const isLiked = !!prev[palette.id];
      const next = { ...prev };
      if (isLiked) {
        delete next[palette.id];
      } else {
        next[palette.id] = true;
      }
      return next;
    });
  };

  // Generator Roll
  const rollGenerator = useCallback(() => {
    const newAesthetic = generateRandomAestheticPalette();
    setGenColors(prev => prev.map((c, i) => lockedSlots[i] ? c : newAesthetic[i]));
  }, [lockedSlots]);

  // Generator Slot Color Change
  const updateGenColor = (index, hex) => {
    setGenColors(prev => {
      const n = [...prev];
      n[index] = hex;
      return n;
    });
  };

  // Save current generator palette
  const saveGenPalette = () => {
    const newPal = {
      id: 'gen-' + Date.now(),
      name: `Palette #${Math.floor(1000 + Math.random() * 9000)}`,
      colors: [...genColors],
      likes: 1,
      tags: ['Custom', 'Generator'],
      date: 'Just now',
    };
    setSavedPalettes(prev => [newPal, ...prev]);
    setLikes(prev => ({ ...prev, [newPal.id]: true }));
    handleCopy(newPal.colors.join(' '));
  };

  // Save custom created palette
  const saveCustomPalette = () => {
    const newPal = {
      id: 'custom-' + Date.now(),
      name: customName || 'Custom Palette',
      colors: [...customColors],
      likes: 1,
      tags: [customTag || 'Custom'],
      date: 'Just now',
    };
    setSavedPalettes(prev => [newPal, ...prev]);
    setLikes(prev => ({ ...prev, [newPal.id]: true }));
    setActiveTab('trending');
  };

  // Handle Image Upload for Extractor
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      const img = new Image();
      img.onload = () => {
        const pal = extract4ColorsFromImage(img);
        setExtractedColors(pal);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Export as PNG Card (Color Hunt Style)
  const downloadPaletteCardAsPng = (palette) => {
    const colors = palette.colors;
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 750;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background Card
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Header Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText('COLOR HUNT', 40, 52);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(palette.name || 'Axom Palette', width - 40, 52);
    ctx.textAlign = 'left';

    // Palette Proportions (Color Hunt ratios)
    const startY = 80;
    const cardHeight = height - 160;
    const heights = [cardHeight * 0.38, cardHeight * 0.24, cardHeight * 0.20, cardHeight * 0.18];
    let currY = startY;

    colors.forEach((c, idx) => {
      const h = heights[idx];
      ctx.fillStyle = c;
      if (idx === 0) {
        ctx.beginPath();
        ctx.roundRect(40, currY, width - 80, h, [14, 14, 0, 0]);
        ctx.fill();
      } else if (idx === 3) {
        ctx.beginPath();
        ctx.roundRect(40, currY, width - 80, h, [0, 0, 14, 14]);
        ctx.fill();
      } else {
        ctx.fillRect(40, currY, width - 80, h);
      }

      // Hex code label
      const textColor = getContrastingTextColor(c);
      ctx.fillStyle = textColor;
      ctx.font = '600 18px monospace';
      ctx.fillText(c.toUpperCase(), 60, currY + h / 2 + 6);

      currY += h;
    });

    // Footer
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('Curated on Axom AI · https://colorhunt.co', 40, height - 35);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(palette.name || 'palette').toLowerCase().replace(/\s+/g, '-')}-colorhunt.png`;
    a.click();
  };

  // Export Formats (CSS, SVG, Tailwind, JSON)
  const exportFormat = (palette, format) => {
    const c = palette.colors;
    let content = '';

    if (format === 'css') {
      content = `:root {\n  --color-1: ${c[0]};\n  --color-2: ${c[1]};\n  --color-3: ${c[2]};\n  --color-4: ${c[3]};\n}`;
    } else if (format === 'tailwind') {
      content = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: '${c[0]}',\n        secondary: '${c[1]}',\n        accent: '${c[2]}',\n        surface: '${c[3]}',\n      }\n    }\n  }\n}`;
    } else if (format === 'json') {
      content = JSON.stringify({ name: palette.name, colors: c, tags: palette.tags }, null, 2);
    } else if (format === 'svg') {
      content = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="400" height="500" rx="16" fill="#181824"/>
  <rect x="20" y="20" width="360" height="180" rx="10" fill="${c[0]}"/>
  <rect x="20" y="200" width="360" height="110" fill="${c[1]}"/>
  <rect x="20" y="310" width="360" height="90" fill="${c[2]}"/>
  <rect x="20" y="400" width="360" height="80" rx="10" fill="${c[3]}"/>
</svg>`;
    }

    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  // Count saved / liked palettes
  const savedCount = useMemo(() => {
    const likedCount = Object.keys(likes).length;
    const customCount = savedPalettes.filter(p => !likes[p.id]).length;
    return likedCount + customCount;
  }, [likes, savedPalettes]);

  // Filtered Palettes
  const displayedPalettes = useMemo(() => {
    let list = [...CURATED_PALETTES, ...savedPalettes];

    // 1. Tab Sorting / Filtering
    if (activeTab === 'saved') {
      list = list.filter(p => !!likes[p.id] || p.id.startsWith('custom-') || p.id.startsWith('gen-'));
    } else if (activeTab === 'popular') {
      list = [...list].sort((a, b) => {
        const likesA = (a.likes || 0) + (likes[a.id] ? 1 : 0);
        const likesB = (b.likes || 0) + (likes[b.id] ? 1 : 0);
        return likesB - likesA;
      });
    } else if (activeTab === 'new') {
      list = [...list].reverse();
    } else if (activeTab === 'random') {
      // Fisher-Yates stable shuffle based on randomSeed
      const shuffled = [...list];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      list = shuffled;
    }
    // For 'trending', use the default curated order

    // 2. Hue filtering
    if (selectedHue) {
      list = list.filter(p => p.colors.some(col => {
        const hsl = hexToHsl(col);
        switch (selectedHue.name) {
          case 'Red': return (hsl.h >= 345 || hsl.h <= 15) && hsl.s > 25 && hsl.l > 15;
          case 'Orange': return hsl.h >= 16 && hsl.h <= 45 && hsl.s > 30;
          case 'Yellow': return hsl.h >= 46 && hsl.h <= 70 && hsl.s > 30;
          case 'Green': return hsl.h >= 71 && hsl.h <= 165 && hsl.s > 25;
          case 'Cyan': return hsl.h >= 166 && hsl.h <= 200 && hsl.s > 25;
          case 'Blue': return hsl.h >= 201 && hsl.h <= 260 && hsl.s > 25;
          case 'Purple': return hsl.h >= 261 && hsl.h <= 315 && hsl.s > 25;
          case 'Pink': return hsl.h >= 316 && hsl.h <= 344 && hsl.s > 25;
          case 'Dark': return hsl.l <= 22;
          case 'Light': return hsl.l >= 82;
          default: return true;
        }
      }));
    }

    // 3. Category Tag filtering
    if (selectedTag !== 'All') {
      list = list.filter(p => p.tags.includes(selectedTag));
    }

    // 4. Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.colors.some(c => c.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, randomSeed, selectedHue, selectedTag, searchQuery, likes, savedPalettes]);

  const isPaletteView = ['trending', 'popular', 'new', 'random', 'saved'].includes(activeTab);

  return (
    <div style={styles.overlay}>
      {/* Toast Notification for Copied Hex */}
      {copiedNotification && (
        <div style={styles.toast}>
          <CheckCircle2 size={16} style={{ color: '#10B981' }} />
          <span>Copied <strong style={{ color: '#F3F4F6' }}>{copiedNotification}</strong> to clipboard!</span>
        </div>
      )}

      {/* Main Container */}
      <div style={styles.container}>
        {/* ==========================================
            TOP HEADER & UNIFIED NAVIGATION BAR
        ========================================== */}
        <header style={styles.header}>
          {/* Left: Brand Logo & Title */}
          <div style={styles.brand}>
            <div style={styles.logoBadge}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#3B82F6' }} />
            </div>
            <div>
              <div style={styles.brandTitle}>Color Hunt</div>
              <div style={styles.brandSubtitle}>Palettes &amp; Color Picker</div>
            </div>
          </div>

          {/* Center: Palette Tabs (Trending, Popular, New, Random, Saved) */}
          <nav style={styles.tabNav}>
            <button
              type="button"
              onClick={() => setActiveTab('trending')}
              style={{ ...styles.navTab, ...(activeTab === 'trending' ? styles.navTabActive : {}) }}
            >
              <Flame size={15} /> Trending
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              style={{ ...styles.navTab, ...(activeTab === 'popular' ? styles.navTabActive : {}) }}
            >
              <Star size={15} /> Popular
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              style={{ ...styles.navTab, ...(activeTab === 'new' ? styles.navTabActive : {}) }}
            >
              <Clock size={15} /> New
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('random');
                setRandomSeed(prev => prev + 1);
              }}
              style={{ ...styles.navTab, ...(activeTab === 'random' ? styles.navTabActive : {}) }}
            >
              <Shuffle size={15} /> Random
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              style={{ ...styles.navTab, ...(activeTab === 'saved' ? styles.navTabActive : {}) }}
            >
              <Heart size={15} fill={savedCount > 0 ? '#EF4444' : 'transparent'} color={savedCount > 0 ? '#EF4444' : '#9CA3AF'} />
              <span>Saved</span>
              <span style={styles.counterBadge}>{savedCount}</span>
            </button>
          </nav>

          {/* Right: Creative Mode Tools (Generator, Create, Extract, Close) */}
          <div style={styles.toolNavGroup}>
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              style={{ ...styles.toolBtn, ...(activeTab === 'generator' ? styles.toolBtnActive : {}) }}
              title="Spacebar Generator"
            >
              <Shuffle size={14} /> Generator <span style={styles.spaceBadge}>Space</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              style={{ ...styles.toolBtn, ...(activeTab === 'create' ? styles.toolBtnActive : {}) }}
              title="Create Custom Palette"
            >
              <Brush size={14} /> Create
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('extract')}
              style={{ ...styles.toolBtn, ...(activeTab === 'extract' ? styles.toolBtnActive : {}) }}
              title="Extract from Image"
            >
              <Upload size={14} /> Image
            </button>
            <button
              type="button"
              onClick={onClose}
              style={styles.closeBtn}
              title="Close Color Palette Tool"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ==========================================
            VIEW 1: PALETTE VIEWS (Trending, Popular, New, Random, Saved)
        ========================================== */}
        {isPaletteView && (
          <div style={styles.bodyContent}>
            {/* Filter Sub-bar */}
            <div style={styles.filterSection}>
              <div style={styles.filterRow}>
                {/* Random Reshuffle Button if on Random tab */}
                {activeTab === 'random' && (
                  <button
                    type="button"
                    onClick={() => setRandomSeed(prev => prev + 1)}
                    style={styles.shuffleBtn}
                  >
                    <Shuffle size={14} /> Reshuffle Random
                  </button>
                )}

                {/* Color Hue Filter Circles */}
                <div style={styles.hueCircles}>
                  <button
                    type="button"
                    onClick={() => setSelectedHue(null)}
                    style={{
                      ...styles.hueDot,
                      background: 'linear-gradient(135deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6)',
                      border: !selectedHue ? '2px solid #FFFFFF' : '2px solid transparent',
                    }}
                    title="All Colors"
                  />
                  {COLOR_HUES.map((hue) => (
                    <button
                      key={hue.name}
                      type="button"
                      onClick={() => setSelectedHue(selectedHue?.name === hue.name ? null : hue)}
                      style={{
                        ...styles.hueDot,
                        background: hue.hex,
                        border: selectedHue?.name === hue.name ? '2px solid #FFFFFF' : '2px solid transparent',
                        transform: selectedHue?.name === hue.name ? 'scale(1.2)' : 'scale(1)',
                      }}
                      title={`Filter ${hue.name}`}
                    />
                  ))}
                </div>

                {/* Search Bar */}
                <div style={styles.searchBox}>
                  <Search size={15} style={{ color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Search color, tag, or #hex..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={styles.clearSearchBtn}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tags Chips */}
              <div style={styles.tagChipsBar}>
                {CATEGORY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      ...styles.tagChip,
                      ...(selectedTag === tag ? styles.tagChipActive : {}),
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* PALETTE CARDS GRID */}
            <div style={styles.gridContainer}>
              {displayedPalettes.length === 0 ? (
                <div style={styles.emptyState}>
                  <Palette size={48} style={{ color: '#4B5563', marginBottom: 16 }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#E5E7EB' }}>
                    {activeTab === 'saved' ? 'No saved palettes yet' : 'No color palettes found'}
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: 6, maxWidth: 420 }}>
                    {activeTab === 'saved'
                      ? 'Click the heart icon on any palette card across Trending, Popular, or New to save your favorites here!'
                      : 'Try clearing your search query or color hue filter to see more results.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'saved') {
                        setActiveTab('trending');
                      } else {
                        setSelectedTag('All');
                        setSelectedHue(null);
                        setSearchQuery('');
                      }
                    }}
                    style={styles.resetBtn}
                  >
                    <RotateCcw size={14} />
                    {activeTab === 'saved' ? 'Explore Trending Palettes' : 'Reset Filters'}
                  </button>
                </div>
              ) : (
                <div style={styles.cardsGrid}>
                  {displayedPalettes.map((palette) => (
                    <ColorHuntCard
                      key={palette.id}
                      palette={palette}
                      isLiked={!!likes[palette.id]}
                      onToggleLike={() => toggleLike(palette)}
                      onCopyColor={handleCopy}
                      onInspect={() => setInspectPalette(palette)}
                      onOpenGenerator={() => {
                        setGenColors([...palette.colors]);
                        setActiveTab('generator');
                      }}
                      onDownloadPng={() => downloadPaletteCardAsPng(palette)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 2: SPACEBAR GENERATOR MODE
        ========================================== */}
        {activeTab === 'generator' && (
          <div style={styles.generatorContainer}>
            {/* Top Generator Control Bar */}
            <div style={styles.genControlBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" onClick={rollGenerator} style={styles.primaryGenBtn}>
                  <Shuffle size={16} /> Generate Palette
                </button>
                <div style={styles.genHint}>
                  Press <kbd style={styles.kbd}>SPACEBAR</kbd> on your keyboard to instantly roll palettes
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={saveGenPalette} style={styles.genSaveBtn}>
                  <Bookmark size={15} /> Save Palette
                </button>
                <button
                  type="button"
                  onClick={() => setInspectPalette({ id: 'gen', name: 'Generated Palette', colors: genColors, tags: ['Custom'] })}
                  style={styles.genInspectBtn}
                >
                  <Eye size={15} /> Inspect Mockup
                </button>
                <button
                  type="button"
                  onClick={() => downloadPaletteCardAsPng({ name: 'Generated Palette', colors: genColors })}
                  style={styles.genInspectBtn}
                >
                  <Download size={15} /> PNG Card
                </button>
              </div>
            </div>

            {/* 4 Interactive Generator Columns */}
            <div style={styles.genColumns}>
              {genColors.map((color, index) => {
                const isLocked = lockedSlots[index];
                const textColor = getContrastingTextColor(color);
                const hsl = hexToHsl(color);
                const rgb = hexToRgb(color);

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.genColumn,
                      background: color,
                    }}
                  >
                    {/* Top Action / Lock Button */}
                    <div style={styles.genColTop}>
                      <button
                        type="button"
                        onClick={() => {
                          const n = [...lockedSlots];
                          n[index] = !n[index];
                          setLockedSlots(n);
                        }}
                        style={{
                          ...styles.genActionBtn,
                          color: textColor,
                          background: isLocked ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.18)',
                        }}
                        title={isLocked ? 'Unlock color' : 'Lock color'}
                      >
                        {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    </div>

                    {/* Middle Info & Color Picker Trigger */}
                    <div style={styles.genColBottom}>
                      {/* HEX Title */}
                      <div
                        onClick={() => handleCopy(color)}
                        style={{ ...styles.genHexText, color: textColor }}
                        title="Click to copy HEX"
                      >
                        {color.toUpperCase()}
                      </div>

                      {/* RGB / HSL Subtext */}
                      <div style={{ ...styles.genSubText, color: textColor }}>
                        RGB({rgb.r}, {rgb.g}, {rgb.b})
                      </div>
                      <div style={{ ...styles.genSubText, color: textColor }}>
                        HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)
                      </div>

                      {/* Native Color Picker Input */}
                      <div style={styles.colorPickerWrapper}>
                        <label
                          style={{
                            ...styles.pickerLabel,
                            color: textColor,
                            borderColor: textColor + '44',
                          }}
                        >
                          <Sliders size={13} />
                          <span>Adjust</span>
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => updateGenColor(index, e.target.value)}
                            style={styles.hiddenColorInput}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleCopy(color)}
                          style={{
                            ...styles.pickerLabel,
                            color: textColor,
                            borderColor: textColor + '44',
                          }}
                        >
                          <Copy size={13} /> Copy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 3: CREATE CUSTOM 4-COLOR PALETTE
        ========================================== */}
        {activeTab === 'create' && (
          <div style={styles.createContainer}>
            <div style={styles.createCard}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F3F4F6', marginBottom: 8 }}>
                Design Your Custom 4-Color Palette
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: 24 }}>
                Choose 4 harmonious colors. Your palette will be styled into a Color Hunt card and saved to your library.
              </p>

              {/* Name & Tag Inputs */}
              <div style={styles.createInputsRow}>
                <div style={{ flex: 2 }}>
                  <label style={styles.inputLabel}>Palette Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Neon Horizon"
                    style={styles.formInput}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.inputLabel}>Category Tag</label>
                  <select
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    style={styles.formInput}
                  >
                    {CATEGORY_TAGS.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4 Color Pickers */}
              <div style={styles.createPickersGrid}>
                {customColors.map((color, idx) => (
                  <div key={idx} style={styles.createColorBox}>
                    <div
                      style={{
                        height: 90,
                        borderRadius: 10,
                        background: color,
                        marginBottom: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const n = [...customColors];
                          n[idx] = e.target.value;
                          setCustomColors(n);
                        }}
                        style={styles.inlineColorPicker}
                      />
                      <input
                        type="text"
                        value={color.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') && val.length <= 7) {
                            const n = [...customColors];
                            n[idx] = val;
                            setCustomColors(n);
                          }
                        }}
                        style={styles.hexInputField}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Preview Card */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
                <ColorHuntCard
                  palette={{
                    id: 'preview',
                    name: customName || 'Custom Palette',
                    colors: customColors,
                    likes: 1,
                    tags: [customTag],
                    date: 'Preview',
                  }}
                  isLiked={false}
                  onToggleLike={() => {}}
                  onCopyColor={handleCopy}
                  onInspect={() => {}}
                  onOpenGenerator={() => {}}
                  onDownloadPng={() => {}}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors(generateRandomAestheticPalette());
                  }}
                  style={styles.secondaryBtn}
                >
                  <Shuffle size={15} /> Randomize Colors
                </button>
                <button type="button" onClick={saveCustomPalette} style={styles.primaryBtn}>
                  <Check size={16} /> Save to Collection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            VIEW 4: IMAGE TO 4-COLOR PALETTE EXTRACTOR
        ========================================== */}
        {activeTab === 'extract' && (
          <div style={styles.extractContainer}>
            <div style={styles.extractCard}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F3F4F6', marginBottom: 8 }}>
                Extract 4-Color Palette from Any Image
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: 20 }}>
                Upload a photograph, digital artwork, or UI design. Our quantization algorithm will extract the 4 most prominent, harmonious colors into a Color Hunt palette.
              </p>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={styles.dropzone}
              >
                <Upload size={36} style={{ color: '#3B82F6', marginBottom: 12 }} />
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#E5E7EB' }}>
                  Click or drag image to upload
                </div>
                <div style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: 4 }}>
                  PNG, JPG, WebP, GIF, or SVG supported
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Image & Extracted Palette Result */}
              {imagePreview && extractedColors && (
                <div style={styles.extractResultRow}>
                  {/* Left: Uploaded Image Preview */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#D1D5DB', marginBottom: 10 }}>
                      Original Image
                    </div>
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      style={{
                        width: '100%',
                        maxHeight: 280,
                        objectFit: 'cover',
                        borderRadius: 12,
                        border: '1px solid #374151',
                      }}
                    />
                  </div>

                  {/* Right: Extracted Color Hunt Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#D1D5DB', marginBottom: 10 }}>
                      Extracted Palette
                    </div>
                    <ColorHuntCard
                      palette={{
                        id: 'extracted-' + Date.now(),
                        name: 'Extracted Palette',
                        colors: extractedColors,
                        likes: 1,
                        tags: ['Extracted', 'Image'],
                        date: 'Photo',
                      }}
                      isLiked={false}
                      onToggleLike={() => {}}
                      onCopyColor={handleCopy}
                      onInspect={() => setInspectPalette({
                        id: 'extracted',
                        name: 'Extracted Palette',
                        colors: extractedColors,
                        tags: ['Extracted'],
                      })}
                      onOpenGenerator={() => {
                        setGenColors([...extractedColors]);
                        setActiveTab('generator');
                      }}
                      onDownloadPng={() => downloadPaletteCardAsPng({
                        name: 'Extracted Palette',
                        colors: extractedColors,
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            PALETTE INSPECTOR & LIVE UI MOCKUP MODAL
        ========================================== */}
        {inspectPalette && (
          <PaletteInspectorModal
            palette={inspectPalette}
            onClose={() => setInspectPalette(null)}
            onCopyColor={handleCopy}
            onDownloadPng={() => downloadPaletteCardAsPng(inspectPalette)}
            onExportFormat={(fmt) => exportFormat(inspectPalette, fmt)}
            copiedFormat={copiedFormat}
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. SIGNATURE COLOR HUNT 4-COLOR CARD
// ==========================================
function ColorHuntCard({
  palette,
  isLiked,
  onToggleLike,
  onCopyColor,
  onInspect,
  onOpenGenerator,
  onDownloadPng,
}) {
  const [hoveredColorIndex, setHoveredColorIndex] = useState(null);
  const colors = palette.colors;

  return (
    <div style={cardStyles.card}>
      {/* 4 Layer Proportional Bands (Color Hunt signature shape) */}
      <div style={cardStyles.bandsContainer}>
        {colors.map((color, idx) => {
          // Color Hunt height ratios: top largest (38%), 2nd (24%), 3rd (20%), bottom (18%)
          const heights = ['38%', '24%', '20%', '18%'];
          const textColor = getContrastingTextColor(color);
          const isHovered = hoveredColorIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => onCopyColor(color)}
              onMouseEnter={() => setHoveredColorIndex(idx)}
              onMouseLeave={() => setHoveredColorIndex(null)}
              style={{
                height: heights[idx],
                background: color,
                position: 'relative',
                cursor: 'pointer',
                transition: 'filter 0.15s ease',
                filter: isHovered ? 'brightness(1.05)' : 'none',
              }}
            >
              {/* Hex Code Badge on Hover */}
              <div
                style={{
                  ...cardStyles.hexBadge,
                  color: textColor,
                  background: isHovered ? 'rgba(0,0,0,0.35)' : 'transparent',
                  opacity: isHovered ? 1 : 0.88,
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.88rem' }}>
                  {color.toUpperCase()}
                </span>
                {isHovered && <Copy size={12} style={{ marginLeft: 6 }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Footer */}
      <div style={cardStyles.footer}>
        {/* Like Button */}
        <button
          type="button"
          onClick={onToggleLike}
          style={{
            ...cardStyles.likeBtn,
            color: isLiked ? '#EF4444' : '#9CA3AF',
            borderColor: isLiked ? '#EF444455' : '#374151',
          }}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={14} fill={isLiked ? '#EF4444' : 'transparent'} />
          <span>{palette.likes + (isLiked ? 1 : 0)}</span>
        </button>

        {/* Tag or Date */}
        <div style={cardStyles.tagLabel}>
          {palette.tags?.[0] || 'Palette'}
        </div>

        {/* Quick Actions (Mockup, Generator, Download) */}
        <div style={cardStyles.actionIcons}>
          <button type="button" onClick={onInspect} style={cardStyles.iconActionBtn} title="Inspect Live UI Mockup">
            <Eye size={14} />
          </button>
          <button type="button" onClick={onOpenGenerator} style={cardStyles.iconActionBtn} title="Open in Generator">
            <Shuffle size={14} />
          </button>
          <button type="button" onClick={onDownloadPng} style={cardStyles.iconActionBtn} title="Download Color Hunt PNG Card">
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. PALETTE INSPECTOR & LIVE UI MOCKUP MODAL
// ==========================================
function PaletteInspectorModal({
  palette,
  onClose,
  onCopyColor,
  onDownloadPng,
  onExportFormat,
  copiedFormat,
}) {
  const [activeMockupView, setActiveMockupView] = useState('desktop'); // 'desktop' | 'mobile'
  const c = palette.colors;

  // Background and Accent assignments
  const bgDark = c[0];
  const surface = c[1];
  const primary = c[2];
  const lightAccent = c[3];

  // Contrast Ratios
  const contrastPrimaryOnBg = getContrastRatio(primary, bgDark);
  const contrastLightOnBg = getContrastRatio(lightAccent, bgDark);
  const contrastLightOnPrimary = getContrastRatio(lightAccent, primary);

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.modalHeader}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F3F4F6' }}>
              {palette.name || 'Palette Inspector'}
            </h3>
            <div style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: 2 }}>
              Color Hunt Palette · Live UI Preview &amp; WCAG Contrast Analysis
            </div>
          </div>
          <button type="button" onClick={onClose} style={modalStyles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* 4 Swatches Strip */}
        <div style={modalStyles.swatchesRow}>
          {c.map((color, idx) => {
            const rgb = hexToRgb(color);
            const hsl = hexToHsl(color);
            const textColor = getContrastingTextColor(color);

            return (
              <div
                key={idx}
                onClick={() => onCopyColor(color)}
                style={{ ...modalStyles.swatchCol, background: color }}
              >
                <div style={{ color: textColor, fontWeight: 700, fontSize: '1.05rem', fontFamily: 'monospace' }}>
                  {color.toUpperCase()}
                </div>
                <div style={{ color: textColor, opacity: 0.8, fontSize: '0.75rem', marginTop: 4 }}>
                  rgb({rgb.r}, {rgb.g}, {rgb.b})
                </div>
                <div style={{ color: textColor, opacity: 0.8, fontSize: '0.75rem' }}>
                  hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
                </div>
                <div style={{ ...modalStyles.copyPill, color: textColor, borderColor: textColor + '55' }}>
                  <Copy size={11} /> Copy
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle: Live UI Mockup Preview */}
        <div style={modalStyles.mockupSection}>
          <div style={modalStyles.mockupControls}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#E5E7EB' }}>
              Live UI Mockup Preview
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setActiveMockupView('desktop')}
                style={{
                  ...modalStyles.deviceBtn,
                  ...(activeMockupView === 'desktop' ? modalStyles.deviceBtnActive : {}),
                }}
              >
                <Laptop size={14} /> Website Hero
              </button>
              <button
                type="button"
                onClick={() => setActiveMockupView('mobile')}
                style={{
                  ...modalStyles.deviceBtn,
                  ...(activeMockupView === 'mobile' ? modalStyles.deviceBtnActive : {}),
                }}
              >
                <Smartphone size={14} /> Mobile App Card
              </button>
            </div>
          </div>

          {/* Rendered Mockup Container */}
          {activeMockupView === 'desktop' ? (
            <div
              style={{
                ...modalStyles.mockupFrame,
                background: bgDark,
                borderColor: surface + '55',
              }}
            >
              {/* Fake Navbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: primary }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: lightAccent }}>AXOM AI</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: '0.8rem', color: lightAccent, opacity: 0.8 }}>Features</span>
                  <span style={{ fontSize: '0.8rem', color: lightAccent, opacity: 0.8 }}>Pricing</span>
                  <span style={{ fontSize: '0.8rem', color: primary, fontWeight: 600 }}>Get Started</span>
                </div>
              </div>

              {/* Hero Section */}
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 99,
                    background: surface,
                    color: primary,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  <Sparkles size={12} /> Next-Gen Creative AI
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: lightAccent, marginBottom: 10, lineHeight: 1.2 }}>
                  Build Faster with Beautiful Palettes
                </h1>
                <p style={{ fontSize: '0.88rem', color: lightAccent, opacity: 0.8, maxWidth: 440, margin: '0 auto 20px' }}>
                  Seamlessly inspect how your 4-color palette balances contrast, branding, typography, and call-to-actions.
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button
                    type="button"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      background: primary,
                      color: getContrastingTextColor(primary),
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Start Free Trial
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      background: surface,
                      color: lightAccent,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: '1px solid ' + lightAccent + '33',
                      cursor: 'pointer',
                    }}
                  >
                    Documentation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              {/* Mobile Phone Simulation Card */}
              <div
                style={{
                  width: 320,
                  borderRadius: 20,
                  padding: 18,
                  background: bgDark,
                  border: '2px solid ' + surface,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: lightAccent, opacity: 0.7 }}>
                    Mobile Card Preview
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: primary }} />
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: surface,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: primary, marginBottom: 4 }}>
                    FEATURED PROJECT
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: lightAccent, marginBottom: 6 }}>
                    E-Commerce Mobile Redesign
                  </div>
                  <div style={{ fontSize: '0.8rem', color: lightAccent, opacity: 0.8, lineHeight: 1.4 }}>
                    Custom styled interface using high-contrast harmonious accent colors.
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 10,
                    background: primary,
                    color: getContrastingTextColor(primary),
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* WCAG Contrast Ratio Checker */}
        <div style={modalStyles.wcagSection}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#E5E7EB', marginBottom: 8 }}>
            WCAG Accessibility Contrast Ratings
          </div>
          <div style={modalStyles.wcagGrid}>
            <div style={modalStyles.wcagCard}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Accent vs Background</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F3F4F6' }}>
                {contrastPrimaryOnBg}:1
              </div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: contrastPrimaryOnBg >= 4.5 ? '#10B981' : '#F59E0B',
              }}>
                {contrastPrimaryOnBg >= 7.0 ? 'AAA Pass' : contrastPrimaryOnBg >= 4.5 ? 'AA Pass' : 'Large Text Only'}
              </div>
            </div>

            <div style={modalStyles.wcagCard}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Light vs Dark Background</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F3F4F6' }}>
                {contrastLightOnBg}:1
              </div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: contrastLightOnBg >= 4.5 ? '#10B981' : '#F59E0B',
              }}>
                {contrastLightOnBg >= 7.0 ? 'AAA Pass' : contrastLightOnBg >= 4.5 ? 'AA Pass' : 'Low Contrast'}
              </div>
            </div>

            <div style={modalStyles.wcagCard}>
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Light vs Accent</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F3F4F6' }}>
                {contrastLightOnPrimary}:1
              </div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: contrastLightOnPrimary >= 4.5 ? '#10B981' : '#9CA3AF',
              }}>
                {contrastLightOnPrimary >= 4.5 ? 'AA Pass' : 'Subtle Contrast'}
              </div>
            </div>
          </div>
        </div>

        {/* Export Suite */}
        <div style={modalStyles.modalFooter}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={onDownloadPng} style={modalStyles.exportBtn}>
              <Download size={14} /> Color Hunt PNG Card
            </button>
            <button type="button" onClick={() => onExportFormat('css')} style={modalStyles.exportBtn}>
              <Code size={14} /> {copiedFormat === 'css' ? 'Copied CSS!' : 'Copy CSS Variables'}
            </button>
            <button type="button" onClick={() => onExportFormat('tailwind')} style={modalStyles.exportBtn}>
              <Sparkles size={14} /> {copiedFormat === 'tailwind' ? 'Copied Tailwind!' : 'Copy Tailwind Config'}
            </button>
            <button type="button" onClick={() => onExportFormat('json')} style={modalStyles.exportBtn}>
              {copiedFormat === 'json' ? 'Copied JSON!' : 'Copy JSON'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. STYLES DEFINITION (Dark Theme Glassmorphism)
// ==========================================
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: '#0B0F19',
    color: '#F3F4F6',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  toast: {
    position: 'fixed',
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 11000,
    background: 'rgba(17, 24, 39, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    padding: '10px 18px',
    borderRadius: 99,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.88rem',
    color: '#E5E7EB',
    animation: 'fadeIn 0.2s ease',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#111827',
    borderBottom: '1px solid #1F2937',
    flexShrink: 0,
    gap: 12,
    flexWrap: 'wrap',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logoBadge: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 9px)',
    gap: 4,
    padding: 5,
    background: '#1F2937',
    borderRadius: 7,
    border: '1px solid #374151',
  },
  brandTitle: {
    fontWeight: 800,
    fontSize: '1.1rem',
    letterSpacing: -0.4,
    color: '#FFFFFF',
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontSize: '0.72rem',
    color: '#9CA3AF',
  },
  tabNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: '#0F172A',
    padding: '4px',
    borderRadius: 10,
    border: '1px solid #1E293B',
    overflowX: 'auto',
    maxWidth: '100%',
  },
  navTab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 13px',
    borderRadius: 7,
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '0.83rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  navTabActive: {
    background: '#1E293B',
    color: '#FFFFFF',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  counterBadge: {
    fontSize: '0.7rem',
    padding: '1px 6px',
    borderRadius: 99,
    background: '#374151',
    color: '#E5E7EB',
    fontWeight: 700,
  },
  toolNavGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  toolBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#CBD5E1',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  toolBtnActive: {
    background: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  spaceBadge: {
    fontSize: '0.65rem',
    padding: '2px 5px',
    borderRadius: 4,
    background: 'rgba(59, 130, 246, 0.25)',
    color: '#60A5FA',
    fontWeight: 700,
    marginLeft: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#9CA3AF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bodyContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  filterSection: {
    padding: '12px 20px',
    background: '#0F172A',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flexShrink: 0,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  shuffleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 8,
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid #3B82F6',
    color: '#60A5FA',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  hueCircles: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  hueDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    transition: 'transform 0.15s, border 0.15s',
    outline: 'none',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '6px 12px',
    minWidth: 220,
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#F3F4F6',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
  },
  clearSearchBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: 2,
    display: 'flex',
  },
  tagChipsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    overflowX: 'auto',
    paddingBottom: 2,
  },
  tagChip: {
    padding: '4px 10px',
    borderRadius: 99,
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#94A3B8',
    fontSize: '0.78rem',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  tagChipActive: {
    background: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  gridContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 20,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: 16,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    background: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },

  // Generator Styles
  generatorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  genControlBar: {
    padding: '12px 20px',
    background: '#111827',
    borderBottom: '1px solid #1F2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryGenBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 18px',
    borderRadius: 8,
    background: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  genHint: {
    fontSize: '0.85rem',
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  kbd: {
    padding: '2px 6px',
    borderRadius: 4,
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#E5E7EB',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  genSaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    background: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  genInspectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#D1D5DB',
    fontWeight: 500,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  genColumns: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  genColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    transition: 'background 0.25s ease',
  },
  genColTop: {
    display: 'flex',
    justifyContent: 'center',
  },
  genColBottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  genActionBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.15s',
  },
  genHexText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: 1,
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 8,
    transition: 'background 0.15s',
  },
  genSubText: {
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  colorPickerWrapper: {
    display: 'flex',
    gap: 8,
    marginTop: 10,
  },
  pickerLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid',
    background: 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(6px)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    position: 'relative',
  },
  hiddenColorInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: 'none',
  },

  // Custom Creator Styles
  createContainer: {
    flex: 1,
    padding: '30px 20px',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
  },
  createCard: {
    maxWidth: 640,
    width: '100%',
    background: '#111827',
    borderRadius: 16,
    border: '1px solid #1F2937',
    padding: '24px',
  },
  createInputsRow: {
    display: 'flex',
    gap: 14,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  formInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#F3F4F6',
    fontSize: '0.9rem',
    outline: 'none',
  },
  createPickersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  createColorBox: {
    background: '#1F2937',
    borderRadius: 12,
    padding: 10,
    border: '1px solid #374151',
  },
  inlineColorPicker: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
  },
  hexInputField: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#F3F4F6',
    fontFamily: 'monospace',
    fontWeight: 600,
    fontSize: '0.82rem',
    outline: 'none',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 8,
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#D1D5DB',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 8,
    background: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },

  // Image Extractor Styles
  extractContainer: {
    flex: 1,
    padding: '30px 20px',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
  },
  extractCard: {
    maxWidth: 720,
    width: '100%',
    background: '#111827',
    borderRadius: 16,
    border: '1px solid #1F2937',
    padding: '24px',
  },
  dropzone: {
    border: '2px dashed #374151',
    borderRadius: 14,
    padding: '36px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#1A2234',
    transition: 'border-color 0.2s',
  },
  extractResultRow: {
    marginTop: 24,
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
};

// ==========================================
// 7. COLOR HUNT CARD STYLES
// ==========================================
const cardStyles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#111827',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #1F2937',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  bandsContainer: {
    height: 240,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '14px 14px 0 0',
    overflow: 'hidden',
  },
  hexBadge: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    padding: '2px 8px',
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.15s ease',
  },
  footer: {
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#111827',
    borderTop: '1px solid #1F2937',
  },
  likeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 7,
    border: '1px solid #374151',
    background: '#1F2937',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tagLabel: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    fontWeight: 500,
  },
  actionIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s, background 0.15s',
  },
};

// ==========================================
// 8. PALETTE INSPECTOR MODAL STYLES
// ==========================================
const modalStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: 'rgba(5, 7, 13, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxWidth: 780,
    width: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    background: '#111827',
    borderRadius: 18,
    border: '1px solid #1F2937',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #1F2937',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  swatchesRow: {
    display: 'flex',
    height: 120,
    borderBottom: '1px solid #1F2937',
  },
  swatchCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'flex 0.2s',
  },
  copyPill: {
    marginTop: 8,
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid',
    background: 'rgba(0,0,0,0.15)',
    backdropFilter: 'blur(4px)',
    fontSize: '0.7rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  mockupSection: {
    padding: '20px 24px',
    borderBottom: '1px solid #1F2937',
  },
  mockupControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deviceBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 7,
    background: '#1F2937',
    border: '1px solid #374151',
    color: '#9CA3AF',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  deviceBtnActive: {
    background: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  mockupFrame: {
    borderRadius: 14,
    border: '1px solid',
    padding: '24px 28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  wcagSection: {
    padding: '18px 24px',
    borderBottom: '1px solid #1F2937',
  },
  wcagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  wcagCard: {
    background: '#1F2937',
    borderRadius: 10,
    border: '1px solid #374151',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  modalFooter: {
    padding: '16px 24px',
    background: '#0F172A',
    borderRadius: '0 0 18px 18px',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    background: '#1E293B',
    border: '1px solid #334155',
    color: '#E2E8F0',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
