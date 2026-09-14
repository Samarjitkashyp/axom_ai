'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Newspaper,
  LogOut,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { HeaderData } from '@/lib/api';

const GOOGLE_CLIENT_ID = "514662966676-fo4atqrjblkn8sadd2t0enhqi5mch5aq.apps.googleusercontent.com";

interface UserState {
  isAuthenticated: boolean;
  name: string;
  username: string;
  email: string;
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.substring(0, name.length + 1) === (name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return '';
}

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let devId = localStorage.getItem('axom_device_uid');
    if (!devId) {
      devId = 'axom_dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('axom_device_uid', devId);
    }
    return devId;
  } catch {
    return '';
  }
}

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
  onBackToChat?: () => void;
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

export default function Navbar({ header: initialHeader, onBackToChat }: NavbarProps) {
  const [header, setHeader] = useState<HeaderData | undefined>(initialHeader);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Authentication & User state
  const [user, setUser] = useState<UserState | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  const checkUserStatus = useCallback(async () => {
    try {
      // 1. Check local session on current origin
      const res = await fetch('/api/user-status/', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.is_authenticated) {
          setUser({
            isAuthenticated: true,
            name: data.name || data.username || 'User',
            username: data.username || '',
            email: data.email || '',
          });
          return;
        }
      }

      // 2. If unauthenticated on a subdomain (e.g. chat.aiaxom.co.in),
      // seamlessly check the apex domain (aiaxom.co.in) which will re-issue the cookie for .aiaxom.co.in
      if (
        typeof window !== 'undefined' &&
        window.location.hostname.endsWith('aiaxom.co.in') &&
        window.location.hostname !== 'aiaxom.co.in'
      ) {
        try {
          const syncRes = await fetch('https://aiaxom.co.in/api/user-status/', {
            credentials: 'include',
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.is_authenticated) {
              setUser({
                isAuthenticated: true,
                name: syncData.name || syncData.username || 'User',
                username: syncData.username || '',
                email: syncData.email || '',
              });
              window.dispatchEvent(new CustomEvent('axom_auth_state_changed', { detail: syncData }));
              return;
            }
          }
        } catch {
          // Ignore cross-origin error if any
        }
      }

      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkUserStatus();

    const handleAuthChange = () => {
      checkUserStatus();
    };

    window.addEventListener('axom_auth_state_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('axom_auth_state_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [checkUserStatus]);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  // Google Credential Callback
  const handleGoogleCredentialResponse = useCallback(async (response: any) => {
    if (!response?.credential) return;
    setAuthLoading(true);
    setAuthError(null);

    const deviceId = getOrCreateDeviceId();

    try {
      const res = await fetch('/api/auth/google/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({
          credential: response.credential,
          device_id: deviceId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser({
          isAuthenticated: true,
          name: data.name || data.username || 'User',
          username: data.username || '',
          email: data.email || '',
        });
        setShowAuthModal(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('axom_auth_state_changed', { detail: data }));
        }
      } else {
        setAuthError(data.error || 'Google authentication failed. Please try again.');
      }
    } catch (err) {
      setAuthError('Connection error during Google authentication. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Initialize Google Identity Services when modal opens
  useEffect(() => {
    if (!showAuthModal) return;

    setAuthError(null);
    let isCancelled = false;

    const setupGoogle = () => {
      if (isCancelled || typeof window === 'undefined') return;
      const g = (window as any).google;
      if (!g?.accounts?.id) return;

      try {
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById('navbarGoogleBtnContainer');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          g.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 280,
            text: 'continue_with',
            logo_alignment: 'left',
          });
        }

        g.accounts.id.prompt();
      } catch (e) {
        console.warn('Google GSI error:', e);
      }
    };

    if ((window as any).google?.accounts?.id) {
      setupGoogle();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          setupGoogle();
        }
      }, 150);
      return () => {
        isCancelled = true;
        clearInterval(timer);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [showAuthModal, handleGoogleCredentialResponse]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
      });
      if (
        typeof window !== 'undefined' &&
        window.location.hostname !== 'aiaxom.co.in' &&
        window.location.hostname.endsWith('aiaxom.co.in')
      ) {
        fetch('https://aiaxom.co.in/api/logout/', {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
      }
    } catch {}
    setUser(null);
    setUserDropdownOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('axom_auth_state_changed', { detail: { isAuthenticated: false } }));
    }
  };

  useEffect(() => {
    if (initialHeader) {
      setHeader(initialHeader);
    } else {
      // Automatically sync with CMS API on client pages (e.g. /tools)
      fetch('/api/cms/landing/')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.header) {
            setHeader(data.header);
          }
        })
        .catch(() => {});
    }
  }, [initialHeader]);

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

  const isChatDomain = typeof window !== 'undefined' && (
    window.location.hostname.startsWith('chat.') ||
    window.location.pathname.startsWith('/chat') ||
    window.location.pathname.startsWith('/tools')
  );

  const resolveUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('javascript:')) return url;
    if (isChatDomain) {
      if (url === '/tools' || url === '/chat/tools') return '/tools';
      return `https://aiaxom.co.in${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  // Resolve logo strictly from CMS settings (/media/brand/logo_... or /axom-brand-logo.png)
  const rawLogo = header?.logo_image_url;
  let logoUrl = '/axom-brand-logo.png';
  if (rawLogo && rawLogo !== '/axom-logo.png' && rawLogo !== '/axom-logo.svg') {
    if (rawLogo.startsWith('http')) {
      logoUrl = rawLogo;
    } else if (rawLogo.startsWith('/media/')) {
      logoUrl = isChatDomain ? `https://aiaxom.co.in${rawLogo}` : rawLogo;
    } else {
      logoUrl = rawLogo;
    }
  }

  const logoAlt = header?.logo_alt_text || 'Axom AI — Smart. Assamese. AI For All.';
  const logoWidth = toCssDimension(header?.logo_width, '11.25rem'); // 180px -> 11.25rem
  const logoHeight = toCssDimension(header?.logo_height, 'auto');
  const logoFit = (header?.logo_fit as React.CSSProperties['objectFit']) || 'contain';
  const homeHref = isChatDomain ? 'https://aiaxom.co.in/' : '/';

  // Dynamic Nav Items (fallback to default standard set if none configured)
  const navItems = header?.nav_items && header.nav_items.length > 0
    ? header.nav_items
    : [
        { id: 1, title: 'About', url: '/about', order: 1 },
        { id: 2, title: 'AI Tools', url: isChatDomain ? '/tools' : '/#tools', order: 2 },
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
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl'
            : 'bg-black/60 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <a href={homeHref} className="flex items-center gap-2 group shrink-0 py-0.5">
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
          </a>

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
                          href="https://chat.aiaxom.co.in/tools"
                          className="text-xs text-fuchsia-400 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          Launch all tools in Axom AI <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              const targetUrl = resolveUrl(item.url);
              const isExternal = targetUrl.startsWith('http');
              const linkClass = isBlog
                ? "px-4 py-2 rounded-full text-white bg-fuchsia-500/20 border border-fuchsia-500/35 font-semibold transition hover:bg-fuchsia-500/30"
                : "px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition";

              return isExternal ? (
                <a
                  key={item.id}
                  href={targetUrl}
                  className={linkClass}
                >
                  {item.title}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={targetUrl}
                  className={linkClass}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons: Sign In / User Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {user?.isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white transition group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-semibold max-w-[130px] truncate text-slate-100 group-hover:text-white">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0d0b1a] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2.5 border-b border-white/10">
                      <div className="text-[10px] uppercase tracking-wider text-fuchsia-400 font-bold">Signed in as</div>
                      <div className="text-sm font-bold text-white truncate mt-0.5">{user.name}</div>
                      {user.email && <div className="text-xs text-slate-400 truncate mt-0.5">{user.email}</div>}
                    </div>

                    <div className="py-1 space-y-0.5">
                      <a
                        href="https://chat.aiaxom.co.in/"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition"
                      >
                        <Bot className="w-4 h-4 text-fuchsia-400" />
                        <span>AI Chat Workspace</span>
                      </a>
                      <a
                        href="https://chat.aiaxom.co.in/tools"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>All AI Tools</span>
                      </a>
                    </div>

                    <div className="border-t border-white/10 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full inline-flex items-center gap-1.5 font-semibold shadow-lg shadow-fuchsia-600/25 transition cursor-pointer"
              >
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
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
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`drawer-overlay lg:hidden ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Slide-in Mobile Drawer */}
      <aside
        className={`drawer lg:hidden ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
        style={{
          backgroundColor: '#090814',
          backgroundImage:
            'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18), transparent 70%), linear-gradient(180deg, #100d22 0%, #07060e 100%)',
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt={logoAlt}
              style={{
                width: logoWidth,
                height: logoHeight,
                objectFit: logoFit,
                maxWidth: '8.75rem',
                maxHeight: '2.5rem',
              }}
              className="w-auto h-auto"
            />
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-gray-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 text-sm">
          {navItems.map((it) => {
            const IconComponent = it.title.toLowerCase().includes('about')
              ? HelpCircle
              : it.title.toLowerCase().includes('tool')
              ? Bot
              : it.title.toLowerCase().includes('case')
              ? Users
              : it.title.toLowerCase().includes('pric')
              ? Crown
              : it.title.toLowerCase().includes('blog')
              ? Newspaper
              : Sparkles;

            const targetUrl = resolveUrl(it.url);
            const isExternal = targetUrl.startsWith('http');

            return isExternal ? (
              <a
                key={it.id}
                href={targetUrl}
                onClick={() => setOpen(false)}
                className="drawer-item"
              >
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 grid place-items-center shrink-0">
                  <IconComponent className="w-4 h-4 text-fuchsia-400" />
                </div>
                <span>{it.title}</span>
              </a>
            ) : (
              <Link
                key={it.id}
                href={targetUrl}
                onClick={() => setOpen(false)}
                className="drawer-item"
              >
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 grid place-items-center shrink-0">
                  <IconComponent className="w-4 h-4 text-fuchsia-400" />
                </div>
                <span>{it.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Drawer Actions: Sign In / User Profile */}
        <div className="px-5 pt-5 pb-4 border-t border-white/10 mt-2">
          {user?.isAuthenticated ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{user.name}</div>
                  {user.email && <div className="text-xs text-slate-400 truncate">{user.email}</div>}
                </div>
              </div>
              <a
                href="https://chat.aiaxom.co.in/"
                onClick={() => setOpen(false)}
                className="btn-primary block w-full text-center text-sm px-4 py-2.5 rounded-full font-semibold shadow-lg shadow-fuchsia-600/30"
              >
                AI Chat Workspace &rarr;
              </a>
              <button
                type="button"
                onClick={() => { setOpen(false); handleLogout(); }}
                className="block w-full text-center text-xs px-4 py-2.5 rounded-full font-semibold text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2.5 font-semibold">Account</div>
              <button
                type="button"
                onClick={() => { setOpen(false); setShowAuthModal(true); }}
                className="btn-primary block w-full text-center text-sm px-4 py-3 rounded-full font-semibold shadow-lg shadow-fuchsia-600/30 cursor-pointer"
              >
                Sign in with Google &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Assamese Footer Tagline */}
        <div className="px-5 pb-6 pt-1">
          <p className="font-assamese text-xs text-fuchsia-300/60 text-center">অসমৰ নিজা AI প্লেটফৰ্ম • AI for All</p>
        </div>
      </aside>

      {/* Google Authentication Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-[#0b0a16] border border-white/15 p-6 shadow-2xl shadow-fuchsia-600/20 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 grid place-items-center text-slate-400 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Logo / Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-purple-600 grid place-items-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">Sign in to Axom AI</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Sign in with your Google account to access all AI tools and native Assamese chat.
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left">
                {authError}
              </div>
            )}

            {/* Google GSI button container */}
            <div className="flex flex-col items-center justify-center min-h-[48px] w-full">
              <div id="navbarGoogleBtnContainer" className="w-full flex justify-center" />
              {authLoading && (
                <div className="flex items-center gap-2 text-xs text-fuchsia-400 mt-3 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating with Google...</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-6">
              Fair use policy: 1 account per user. By continuing you agree to Axom AI Terms.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
