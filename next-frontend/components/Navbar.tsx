'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Bot,
  PenTool,
  Image as ImageIcon,
  FileText,
  Code,
  Globe,
  FileCode,
  BarChart3,
  Languages,
  Users,
  Crown,
  ChevronDown,
  HelpCircle,
  Newspaper
} from 'lucide-react';
import { HeaderData } from '@/lib/api';

const DEFAULT_TOOLS = [
  { icon: Bot, title: 'AI Chat', desc: 'ChatGPT-style Assamese chat', color: 'text-fuchsia-400', url: 'https://chat.aiaxom.co.in/' },
  { icon: PenTool, title: 'AI Writer', desc: 'Emails, posts, essays', color: 'text-purple-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: ImageIcon, title: 'Image Generator', desc: 'FLUX + Pollinations + Gemini', color: 'text-pink-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: FileText, title: 'Document Analyzer', desc: 'Summarize PDFs & DOCX', color: 'text-blue-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: Code, title: 'Code Assistant', desc: 'Write, debug, explain code', color: 'text-indigo-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: Globe, title: 'Web Search', desc: 'Real-time answers via Tavily', color: 'text-amber-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: FileCode, title: 'PDF Tools', desc: 'Merge / split / OCR / edit', color: 'text-red-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: BarChart3, title: 'Data Analyzer', desc: 'Excel & CSV insights', color: 'text-cyan-400', url: 'https://chat.aiaxom.co.in/tools' },
  { icon: Languages, title: 'Translator', desc: 'IndicTrans2 Assamese', color: 'text-emerald-400', url: 'https://chat.aiaxom.co.in/tools' },
];

const ICON_MAP: Record<string, React.ElementType> = {
  'fa-solid fa-brain': Bot,
  'fa-solid fa-robot': Bot,
  'fa-solid fa-pen-nib': PenTool,
  'fa-solid fa-wand-magic-sparkles': ImageIcon,
  'fa-solid fa-file-pdf': FileText,
  'fa-solid fa-code': Code,
  'fa-solid fa-globe': Globe,
  'fa-solid fa-file-contract': FileCode,
  'fa-solid fa-chart-pie': BarChart3,
  'fa-solid fa-language': Languages,
  'fa-solid fa-microphone-lines': Sparkles,
};

interface NavbarProps {
  header?: HeaderData;
}

function toCssDimension(val?: string, defaultVal?: string): string | undefined {
  if (!val) return defaultVal;
  const trimmed = val.trim();
  if (!trimmed) return defaultVal;
  if (trimmed.toLowerCase() === 'auto') return 'auto';
  const pxMatch = trimmed.match(/^([0-9.]+)(?:px)?$/i);
  if (pxMatch) {
    const px = parseFloat(pxMatch[1]);
    if (!isNaN(px)) {
      return `${(px / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
    }
  }
  return trimmed;
}

export default function Navbar({ header }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const logoUrl = (header?.logo_image_url && header.logo_image_url !== '/axom-logo.png')
    ? header.logo_image_url
    : '/axom-logo.svg';
  const logoAlt = header?.logo_alt_text || 'Axom AI — Smart. Assamese. AI For All.';
  const logoWidth = toCssDimension(header?.logo_width, '11.25rem'); // 180px -> 11.25rem
  const logoHeight = toCssDimension(header?.logo_height, 'auto');
  const logoFit = (header?.logo_fit as React.CSSProperties['objectFit']) || 'contain';
  const signinText = header?.cta_signin_text || 'Sign in';
  const signinUrl = header?.cta_signin_url || 'https://chat.aiaxom.co.in/';
  const chatText = header?.cta_chat_text || 'Open Chat';
  const chatUrl = header?.cta_chat_url || 'https://chat.aiaxom.co.in/';

  // Dynamic Nav Items (fallback to default standard set if none configured)
  const navItems = header?.nav_items && header.nav_items.length > 0
    ? header.nav_items
    : [
        { id: 1, title: 'About', url: '/about', order: 1 },
        { id: 2, title: 'AI Tools', url: '/#tools', order: 2 },
        { id: 3, title: 'Use Cases', url: '/#usecases', order: 3 },
        { id: 4, title: 'Pricing', url: '/#pricing', order: 4 },
        { id: 5, title: 'Blog & Insights', url: '/blog', order: 5 },
        { id: 6, title: 'FAQ', url: '/faq', order: 6 },
      ];

  // Dynamic Mega Menu Items
  const megaItems = header?.mega_menu_items && header.mega_menu_items.length > 0
    ? header.mega_menu_items.map((m) => ({
        icon: ICON_MAP[m.icon_class] || Bot,
        iconClass: m.icon_class,
        title: m.title,
        desc: m.description,
        color: m.color_class || 'text-fuchsia-400',
        url: m.url || 'https://chat.aiaxom.co.in/tools',
      }))
    : DEFAULT_TOOLS.map((t) => ({
        icon: t.icon,
        iconClass: '',
        title: t.title,
        desc: t.desc,
        color: t.color,
        url: t.url,
      }));

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'bg-black/60 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
        {/* Brand Logo - pure Next.js SPA Link */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 py-0.5">
          <img
            src={logoUrl}
            alt={logoAlt}
            style={{
              width: logoWidth,
              height: logoHeight,
              objectFit: logoFit,
              maxWidth: '100%',
              maxHeight: '3.75rem', // 60px max height constraint
            }}
            className="w-auto h-auto transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const isMega = item.title.toLowerCase().includes('tool') || item.url === '/#tools';
            const isBlog = item.url === '/blog' || item.url === '/blog/';

            if (isMega) {
              return (
                <div key={item.id} className="nav-item relative">
                  <Link
                    href={item.url}
                    className="px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition inline-flex items-center gap-1.5"
                  >
                    <span>{item.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </Link>
                  <div className="mega-menu w-[640px] p-3 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-fuchsia-500/10 mt-2">
                    <div className="text-[10px] uppercase tracking-widest text-fuchsia-400 font-bold px-3 pt-2 pb-1">
                      Explore AI Tools
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {megaItems.map((m, idx) => {
                        const IconComponent = m.icon;
                        const isExternal = m.url.startsWith('http');
                        return isExternal ? (
                          <a
                            key={idx}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mega-item"
                          >
                            <div className="mega-icon">
                              <IconComponent className={`w-4 h-4 ${m.color}`} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{m.title}</div>
                              <div className="text-xs text-gray-400">{m.desc}</div>
                            </div>
                          </a>
                        ) : (
                          <Link
                            key={idx}
                            href={m.url}
                            className="mega-item"
                          >
                            <div className="mega-icon">
                              <IconComponent className={`w-4 h-4 ${m.color}`} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{m.title}</div>
                              <div className="text-xs text-gray-400">{m.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/5 mt-2 pt-2 px-3">
                      <a
                        href={chatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-fuchsia-400 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Launch all tools in Axom Chat <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            const isExternal = item.url.startsWith('http');
            const linkClass = isBlog
              ? "px-4 py-2 rounded-full text-white bg-fuchsia-500/20 border border-fuchsia-500/35 font-semibold transition hover:bg-fuchsia-500/30"
              : "px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition";

            return isExternal ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {item.title}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.url}
                className={linkClass}
              >
                {item.title}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={signinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition px-3 font-medium"
          >
            {signinText}
          </a>
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-lg shadow-fuchsia-600/25 font-semibold"
          >
            <span>{chatText}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
          className="lg:hidden w-10 h-10 rounded-full bg-white/10 border border-white/15 grid place-items-center text-white hover:bg-white/15 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`drawer-overlay lg:hidden ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside className={`drawer lg:hidden ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt={logoAlt}
              style={{
                width: logoWidth,
                height: logoHeight,
                objectFit: logoFit,
                maxWidth: '140px',
                maxHeight: '44px',
              }}
              className="w-auto h-auto"
            />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2">
          {navItems.map((it) => {
            const isExternal = it.url.startsWith('http');
            const iconMap: Record<string, React.ElementType> = {
              'AI Tools': Bot,
              'Use Cases': Users,
              'Pricing': Crown,
              'Blog & Insights': Newspaper,
              'Blog': Newspaper,
              'FAQ': HelpCircle,
            };
            const IconComponent = iconMap[it.title] || Sparkles;

            return isExternal ? (
              <a
                key={it.id}
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="drawer-item"
              >
                <IconComponent className="w-4 h-4 text-fuchsia-400" />
                {it.title}
              </a>
            ) : (
              <Link
                key={it.id}
                href={it.url}
                onClick={() => setOpen(false)}
                className="drawer-item"
              >
                <IconComponent className="w-4 h-4 text-fuchsia-400" />
                {it.title}
              </Link>
            );
          })}
        </div>

        <div className="px-5 pt-5 pb-6 border-t border-white/5 mt-auto">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Get Started</div>
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-primary block text-center text-sm px-4 py-3 rounded-full mb-2.5 font-semibold"
          >
            {chatText} &rarr;
          </a>
          <a
            href={signinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-ghost block text-center text-sm px-4 py-3 rounded-full font-medium"
          >
            {signinText}
          </a>
        </div>

        <div className="px-5 mb-5">
          <p className="font-assamese text-xs text-fuchsia-300/60 text-center">অসমৰ নিজা AI প্লেটফৰ্ম • AI for All</p>
        </div>
      </aside>
    </nav>
  );
}
