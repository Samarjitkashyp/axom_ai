'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight,
  HelpCircle,
  Newspaper,
  Mail,
  LogOut,
  User as UserIcon,
  Loader2,
  Cpu,
  Folder,
  FolderOpen,
  QrCode,
  Video,
  Scissors,
  Lock,
  Palette,
  Minimize2,
  Fuel,
  BookOpen,
  Search,
  Mic,
  Terminal,
  Boxes,
  Layers,
  Link2
} from 'lucide-react';
import { HeaderData, HeaderMegaMenuItem, HeaderNavItem } from '@/lib/api';

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

interface DropdownNode {
  id: number | string;
  icon: React.ElementType;
  iconClass?: string;
  title: string;
  desc: string;
  color: string;
  url: string;
  children: DropdownNode[];
}

const DEFAULT_TOOLS: HeaderMegaMenuItem[] = [
  {
    id: 9001,
    title: 'AI Assistants',
    description: 'Chat, notes & PDF intelligence',
    icon_class: 'fa-solid fa-brain',
    color_class: 'text-emerald-600 dark:text-emerald-400',
    url: '#',
    order: 1,
    children: [
      { id: 9011, title: 'Axom AI Chat', description: 'Pure Assamese AI chat', icon_class: 'fa-solid fa-robot', color_class: 'text-fuchsia-500', url: 'https://chat.aiaxom.co.in/', order: 1 },
      { id: 9012, title: 'AI Notes Generator', description: 'Smart study & lecture notes', icon_class: 'fa-solid fa-pen-nib', color_class: 'text-purple-500', url: '/tools/ai-notes-generator', order: 2 },
      { id: 9013, title: 'Voice Notes Generator', description: 'Assamese & English voice notes', icon_class: 'fa-solid fa-microphone-lines', color_class: 'text-amber-500', url: '/tools/voice-notes-generator', order: 3 },
      { id: 9014, title: 'Chat with PDF', description: 'Ask questions to PDFs', icon_class: 'fa-solid fa-file-pdf', color_class: 'text-blue-500', url: '/tools/chat-with-pdf', order: 4 },
    ],
  },
  {
    id: 9002,
    title: 'PDF & Document Tools',
    description: 'Edit, merge & convert PDFs',
    icon_class: 'fa-solid fa-file-pdf',
    color_class: 'text-rose-600 dark:text-rose-400',
    url: '#',
    order: 2,
    children: [
      { id: 9021, title: 'PDF Editor', description: 'Annotate & edit PDF pages', icon_class: 'fa-solid fa-pen-nib', color_class: 'text-rose-500', url: '/tools/edit-pdf', order: 1 },
      { id: 9022, title: 'Merge PDF', description: 'Combine multiple PDFs', icon_class: 'fa-solid fa-layer-group', color_class: 'text-pink-500', url: '/tools/merge-pdf', order: 2 },
      {
        id: 9023,
        title: 'PDF Converters',
        description: 'Word, JPG, PNG & Office',
        icon_class: 'fa-solid fa-folder-open',
        color_class: 'text-emerald-500',
        url: '#',
        order: 3,
        children: [
          { id: 9031, title: 'Word to PDF', description: 'DOCX to crisp PDF', icon_class: 'fa-solid fa-file-word', color_class: 'text-blue-500', url: '/tools/word-to-pdf', order: 1 },
          { id: 9032, title: 'PDF to Word', description: 'Editable DOCX extract', icon_class: 'fa-solid fa-file-word', color_class: 'text-indigo-500', url: '/tools/pdf-to-word', order: 2 },
          { id: 9033, title: 'PDF to JPG', description: 'High-res image export', icon_class: 'fa-solid fa-image', color_class: 'text-amber-500', url: '/tools/pdf-to-jpg', order: 3 },
        ],
      },
    ],
  },
  {
    id: 9003,
    title: 'Image, Video & Utilities',
    description: 'Media, QR & design studio',
    icon_class: 'fa-solid fa-wand-magic-sparkles',
    color_class: 'text-purple-600 dark:text-purple-400',
    url: '#',
    order: 3,
    children: [
      { id: 9041, title: 'Generate Image', description: 'AI image studio', icon_class: 'fa-solid fa-wand-magic-sparkles', color_class: 'text-pink-500', url: '/tools/ai-image-generator', order: 1 },
      { id: 9042, title: 'Background Remover', description: 'Instant clean cutout', icon_class: 'fa-solid fa-scissors', color_class: 'text-purple-500', url: '/tools/background-remover', order: 2 },
      { id: 9043, title: 'QR Code Generator', description: 'UPI, URL, WiFi QR codes', icon_class: 'fa-solid fa-qrcode', color_class: 'text-amber-500', url: '/tools/qr-code-generator', order: 3 },
      { id: 9044, title: 'Video Compressor', description: 'Reduce MP4 size cleanly', icon_class: 'fa-solid fa-video', color_class: 'text-sky-500', url: '/tools/video-compressor', order: 4 },
    ],
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  'fa-solid fa-brain': Bot,
  'fa-solid fa-robot': Bot,
  'fa-solid fa-pen-nib': PenTool,
  'fa-solid fa-wand-magic-sparkles': Sparkles,
  'fa-solid fa-file-pdf': FileText,
  'fa-solid fa-file-word': FileText,
  'fa-solid fa-file-excel': BarChart3,
  'fa-solid fa-file-powerpoint': FileCode,
  'fa-solid fa-file-image': ImageIcon,
  'fa-solid fa-file-contract': FileCode,
  'fa-solid fa-code': Code,
  'fa-solid fa-terminal': Terminal,
  'fa-solid fa-globe': Globe,
  'fa-solid fa-magnifying-glass': Search,
  'fa-solid fa-chart-pie': BarChart3,
  'fa-solid fa-language': Languages,
  'fa-solid fa-microphone-lines': Mic,
  'fa-solid fa-folder': Folder,
  'fa-solid fa-folder-open': FolderOpen,
  'fa-solid fa-folder-tree': FolderOpen,
  'fa-solid fa-sitemap': Layers,
  'fa-solid fa-layer-group': Layers,
  'fa-solid fa-cubes': Boxes,
  'fa-solid fa-qrcode': QrCode,
  'fa-solid fa-video': Video,
  'fa-solid fa-image': ImageIcon,
  'fa-solid fa-images': ImageIcon,
  'fa-solid fa-scissors': Scissors,
  'fa-solid fa-lock': Lock,
  'fa-solid fa-palette': Palette,
  'fa-solid fa-compress': Minimize2,
  'fa-solid fa-gas-pump': Fuel,
  'fa-solid fa-book-open': BookOpen,
  'fa-solid fa-link': Link2,
  'fa-solid fa-sparkles': Sparkles,
};

function resolveMenuIcon(iconClass?: string, hasChildren?: boolean): React.ElementType {
  if (iconClass) {
    const cleanKey = iconClass
      .split(/\s+/)
      .filter((t) => !t.startsWith('text-'))
      .join(' ')
      .trim();
    if (ICON_MAP[cleanKey]) return ICON_MAP[cleanKey];
  }
  return hasChildren ? FolderOpen : Bot;
}

function normalizeToolNodes(items?: HeaderMegaMenuItem[]): DropdownNode[] {
  if (!items || items.length === 0) return [];
  return items.map((m) => {
    const children = normalizeToolNodes(m.children);
    return {
      id: m.id,
      icon: resolveMenuIcon(m.icon_class, children.length > 0),
      iconClass: m.icon_class,
      title: m.title,
      desc: m.description || '',
      color: m.color_class || 'text-[#059669] dark:text-[#34d399]',
      url: m.url || '',
      children,
    };
  });
}

function normalizeNavChildren(items?: HeaderNavItem[]): DropdownNode[] {
  if (!items || items.length === 0) return [];
  return items.map((n) => {
    const children = normalizeNavChildren(n.children);
    return {
      id: n.id,
      icon: children.length > 0 ? FolderOpen : Link2,
      title: n.title,
      desc: '',
      color: 'text-[#059669] dark:text-[#34d399]',
      url: n.url || '',
      children,
    };
  });
}

function DropdownRow({
  item,
  resolveUrl,
}: {
  item: DropdownNode;
  resolveUrl: (u: string) => string;
}) {
  const [flipLeft, setFlipLeft] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const IconComponent = item.icon;
  const trimmedUrl = (item.url || '').trim();
  const isNavigable = trimmedUrl !== '' && trimmedUrl !== '#';
  const targetUrl = isNavigable ? resolveUrl(trimmedUrl) : '';
  const isExternal = targetUrl.startsWith('http');

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasChildren || typeof window === 'undefined') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setFlipLeft(rect.right + 275 > window.innerWidth);
  };

  const rowInner = (
    <>
      <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] dark:bg-[#0f172a] border border-[#cfe9dc]/90 dark:border-[#1f2f46] flex items-center justify-center shrink-0 text-[#059669] dark:text-[#34d399] group-hover/row:bg-[#059669] group-hover/row:text-white dark:group-hover/row:bg-[#10b981] dark:group-hover/row:text-[#022c22] transition-colors">
        <IconComponent className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-[13px] font-bold text-[#022c22] dark:text-white leading-tight truncate">
          {item.title}
        </div>
        {item.desc && (
          <div className="text-[11px] text-[#5b6b66] dark:text-[#94a3b8] leading-tight truncate mt-0.5">
            {item.desc}
          </div>
        )}
      </div>
      {hasChildren && (
        <ChevronRight className="w-3.5 h-3.5 text-[#059669] dark:text-[#34d399] opacity-75 group-hover/row:opacity-100 group-hover/row:translate-x-0.5 transition shrink-0" />
      )}
    </>
  );

  const rowClassName =
    'group/row w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition-colors';

  return (
    <div className="dropdown-item-wrap px-1.5" onMouseEnter={handleMouseEnter}>
      {!isNavigable ? (
        <button type="button" className={`${rowClassName} cursor-default`}>
          {rowInner}
        </button>
      ) : isExternal ? (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={rowClassName}
        >
          {rowInner}
        </a>
      ) : (
        <Link href={targetUrl} className={rowClassName}>
          {rowInner}
        </Link>
      )}

      {hasChildren && (
        <div className={`dropdown-submenu-wrap ${flipLeft ? 'flip-left' : ''}`}>
          <DropdownMenuBranch items={item.children} resolveUrl={resolveUrl} />
        </div>
      )}
    </div>
  );
}

function DropdownMenuBranch({
  items,
  resolveUrl,
  showViewAllFooter = false,
}: {
  items: DropdownNode[];
  resolveUrl: (u: string) => string;
  showViewAllFooter?: boolean;
}) {
  return (
    <div className="w-[264px] py-1.5 bg-white/95 dark:bg-[#0b1220]/98 backdrop-blur-xl border border-[#cfe9dc] dark:border-[#1f2f46] rounded-2xl shadow-[0_18px_45px_rgba(5,150,105,0.16)] dark:shadow-[0_22px_55px_rgba(0,0,0,0.72)]">
      <div className="space-y-0.5 max-h-[72vh] overflow-y-visible">
        {items.map((node) => (
          <DropdownRow key={node.id} item={node} resolveUrl={resolveUrl} />
        ))}
      </div>
      {showViewAllFooter && (
        <div className="border-t border-[#cfe9dc] dark:border-[#1f2f46] mt-1.5 pt-1.5 px-3 pb-1">
          <Link
            href={resolveUrl('/tools')}
            className="text-xs text-[#059669] dark:text-[#34d399] hover:text-[#10b981] font-bold inline-flex items-center gap-1 hover:gap-2 transition-all py-0.5"
          >
            <span>All AI Tools</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileMenuBranch({
  items,
  prefix,
  depth,
  expandedIds,
  onToggleExpand,
  resolveUrl,
  onCloseDrawer,
}: {
  items: DropdownNode[];
  prefix: string;
  depth: number;
  expandedIds: Record<string, boolean>;
  onToggleExpand: (key: string) => void;
  resolveUrl: (u: string) => string;
  onCloseDrawer: () => void;
}) {
  return (
    <div className={`space-y-0.5 ${depth > 0 ? 'pl-3 ml-3 border-l border-[#cfe9dc] dark:border-[#1f2f46] mt-1' : ''}`}>
      {items.map((node) => {
        const key = `${prefix}_${node.id}`;
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = !!expandedIds[key];
        const IconComponent = node.icon;
        const trimmedUrl = (node.url || '').trim();
        const isNavigable = trimmedUrl !== '' && trimmedUrl !== '#';
        const targetUrl = isNavigable ? resolveUrl(trimmedUrl) : '';
        const isExternal = targetUrl.startsWith('http');

        return (
          <div key={key}>
            <div className="flex items-center gap-1">
              {!isNavigable ? (
                <button
                  type="button"
                  onClick={() => hasChildren && onToggleExpand(key)}
                  className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#166534] dark:text-[#94a3b8] hover:text-[#022c22] dark:hover:text-white hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition"
                >
                  <IconComponent className="w-4 h-4 text-[#059669] dark:text-[#34d399] shrink-0" />
                  <span className="truncate">{node.title}</span>
                </button>
              ) : isExternal ? (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onCloseDrawer}
                  className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#166534] dark:text-[#94a3b8] hover:text-[#022c22] dark:hover:text-white hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition"
                >
                  <IconComponent className="w-4 h-4 text-[#059669] dark:text-[#34d399] shrink-0" />
                  <span className="truncate">{node.title}</span>
                </a>
              ) : (
                <Link
                  href={targetUrl}
                  onClick={onCloseDrawer}
                  className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#166534] dark:text-[#94a3b8] hover:text-[#022c22] dark:hover:text-white hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition"
                >
                  <IconComponent className="w-4 h-4 text-[#059669] dark:text-[#34d399] shrink-0" />
                  <span className="truncate">{node.title}</span>
                </Link>
              )}

              {hasChildren && (
                <button
                  type="button"
                  onClick={() => onToggleExpand(key)}
                  aria-label={`Toggle ${node.title}`}
                  className="w-8 h-8 rounded-lg grid place-items-center text-[#059669] dark:text-[#34d399] hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition shrink-0"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <MobileMenuBranch
                items={node.children}
                prefix={key}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                resolveUrl={resolveUrl}
                onCloseDrawer={onCloseDrawer}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const pathname = usePathname();
  const [header, setHeader] = useState<HeaderData | undefined>(initialHeader);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

  const toggleMobileBranch = useCallback((key: string) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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
      fetch('/api/cms/landing/', { cache: 'no-store' })
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
    window.location.pathname.startsWith('/chat')
  );

  const resolveUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('mailto:') || url.startsWith('javascript:')) return url;

    // If on main domain and url points to https://aiaxom.co.in/..., strip domain so it's an internal Link
    if (!isChatDomain && (url.startsWith('https://aiaxom.co.in') || url.startsWith('http://aiaxom.co.in'))) {
      const path = url.replace(/^https?:\/\/aiaxom\.co\.in/, '') || '/';
      return path;
    }

    if (url.startsWith('http')) return url;

    if (isChatDomain) {
      if (url === '/tools' || url === '/chat/tools') return 'https://aiaxom.co.in/tools';
      return `https://aiaxom.co.in${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  // Resolve logo strictly from CMS settings or fallback to brand logo
  const rawLogo = header?.logo_image_url;
  let logoUrl = '/axom-brand-logo.png';
  if (rawLogo && rawLogo !== '/axom-logo.png' && rawLogo !== '/axom-logo.svg' && rawLogo !== '/axom-brand-logo.png' && rawLogo !== '/logo.png') {
    if (rawLogo.startsWith('http')) {
      logoUrl = rawLogo;
    } else if (rawLogo.startsWith('/media/')) {
      logoUrl = isChatDomain ? `https://aiaxom.co.in${rawLogo}` : rawLogo;
    } else {
      logoUrl = rawLogo;
    }
  }

  const logoAlt = header?.logo_alt_text || 'Axom AI — Smart. Assamese. AI For All.';
  const homeHref = isChatDomain ? 'https://aiaxom.co.in/' : '/';

  // Dynamic Nav Items (fallback to default standard set if none configured)
  const initialNavItems = header?.nav_items && header.nav_items.length > 0
    ? header.nav_items
    : [
        { id: 1, title: 'About', url: '/about', order: 1 },
        { id: 2, title: 'AI Tools', url: '/tools', order: 2 },
        { id: 25, title: 'Our Models', url: '/our-models', order: 2.5 },
        { id: 3, title: 'Use Cases', url: '/use-cases', order: 3 },
        { id: 4, title: 'Pricing', url: '/pricing', order: 4 },
        { id: 5, title: 'Blog & Insights', url: '/blog', order: 5 },
        { id: 6, title: 'FAQ', url: '/faq', order: 6 },
        { id: 7, title: 'Contact Us', url: '/contact', order: 7 },
      ];

  const hasOurModels = initialNavItems.some((i: any) => i.url === '/our-models' || i.title?.toLowerCase().includes('model'));
  const rawNavItems = hasOurModels ? initialNavItems : [
    ...initialNavItems.slice(0, 2),
    { id: -101, title: 'Our Models', url: '/our-models', order: 2.5 },
    ...initialNavItems.slice(2),
  ];

  const mappedNavItems = rawNavItems.map((item) => {
    const safeUrl = item.url || '';
    if (
      safeUrl === '/#usecases' ||
      safeUrl === '#usecases' ||
      safeUrl === '/#use-cases' ||
      (item.title.toLowerCase().includes('use case') && safeUrl.includes('usecase'))
    ) {
      return { ...item, url: '/use-cases' };
    }
    if (
      safeUrl === '/#pricing' ||
      safeUrl === '#pricing' ||
      (item.title.toLowerCase().includes('pricing') && safeUrl.includes('pricing'))
    ) {
      return { ...item, url: '/pricing' };
    }
    if (
      safeUrl === '/#contact' ||
      safeUrl === '#contact' ||
      safeUrl === 'mailto:samarjitkashyp@aiaxom.co.in' ||
      safeUrl === 'mailto:samarjitkashyp@gmail.com' ||
      safeUrl === 'mailto:support@aiaxom.co.in'
    ) {
      return { ...item, url: '/contact' };
    }
    return item;
  });

  // Ensure 'Contact Us' is present in navbar
  const hasContact = mappedNavItems.some(
    (item) => item.url === '/contact' || item.url === '/contact/' || item.title.toLowerCase().includes('contact')
  );
  const navItems = hasContact
    ? mappedNavItems
    : [...mappedNavItems, { id: -102, title: 'Contact Us', url: '/contact', order: 99 }];

  // Dynamic Multilevel Dropdown Items (for AI Tools)
  const rawToolsTree = header?.mega_menu_items && header.mega_menu_items.length > 0
    ? header.mega_menu_items
    : DEFAULT_TOOLS;
  const megaItems = normalizeToolNodes(rawToolsTree);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#f0fdf4]/95 dark:bg-[#0b1220]/95 backdrop-blur-xl border-b border-[#cfe9dc] dark:border-[#1f2f46] shadow-[0_8px_30px_rgba(5,150,105,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.40)] py-2'
            : 'bg-[#f0fdf4]/90 dark:bg-[#0b1220]/90 backdrop-blur-md border-b border-[#cfe9dc]/80 dark:border-[#1f2f46]/60 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <a
            href={homeHref}
            className="brand flex items-center gap-2.5 shrink-0 py-0.5 group no-underline text-[#022c22] dark:text-white font-extrabold tracking-tight"
          >
            <img
              src="/axom-browser-logo.png"
              alt="Axom AI"
              width={40}
              height={40}
              className="w-[40px] h-[40px] rounded-[10px] object-contain shadow-[0_4px_12px_rgba(5,150,105,0.25)] transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <span className="leading-none select-none font-sans font-extrabold text-[1.2rem] sm:text-[1.28rem] tracking-tight">
                Axom <span className="text-[#059669] dark:text-[#34d399]">AI</span>
              </span>
              <span className="text-[9px] sm:text-[9.5px] font-extrabold tracking-[0.12em] uppercase text-[#166534] dark:text-[#94a3b8] mt-1 leading-none select-none">
                Smart • Assamese • AI for All
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 text-[0.92rem]">
            {navItems.map((item) => {
              const isToolsMenu = item.title.toLowerCase().includes('tool') || item.url === '/#tools';
              const itemSubtree = isToolsMenu
                ? megaItems
                : normalizeNavChildren((item as HeaderNavItem).children);
              const hasDropdown = itemSubtree.length > 0;

              const rawNavUrl = (item.url || '').trim();
              const isNavigable = rawNavUrl !== '' && rawNavUrl !== '#';
              const targetUrl = isNavigable ? resolveUrl(rawNavUrl) : '#';
              const isExternal = targetUrl.startsWith('http');

              // Determine accurate active state based on current pathname
              const cleanTarget = targetUrl.replace(/\/+$/, '');
              const cleanPath = (pathname || '').replace(/\/+$/, '');
              const isActive =
                isNavigable &&
                cleanTarget !== '' &&
                cleanTarget !== '#' &&
                (cleanPath === cleanTarget || (cleanTarget !== '/' && cleanPath.startsWith(cleanTarget + '/')));

              const linkClass = isActive
                ? 'px-3.5 py-1.5 rounded-full text-[#059669] dark:text-[#34d399] font-extrabold bg-[#ecfdf5] dark:bg-[#111c2e] border border-[#cfe9dc] dark:border-[#1f2f46] shadow-sm transition inline-flex items-center gap-1.5'
                : 'px-3.5 py-1.5 rounded-full text-[#166534] dark:text-[#94a3b8] hover:text-[#022c22] dark:hover:text-white hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] font-bold transition inline-flex items-center gap-1.5';

              if (hasDropdown) {
                return (
                  <div key={item.id} className="nav-item relative">
                    {!isNavigable ? (
                      <button type="button" className={linkClass}>
                        <span>{item.title}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    ) : isExternal ? (
                      <a href={targetUrl} className={linkClass}>
                        <span>{item.title}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    ) : (
                      <Link href={targetUrl} className={linkClass}>
                        <span>{item.title}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </Link>
                    )}

                    <div className="nav-dropdown-wrap">
                      <DropdownMenuBranch
                        items={itemSubtree}
                        resolveUrl={resolveUrl}
                        showViewAllFooter={isToolsMenu}
                      />
                    </div>
                  </div>
                );
              }

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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
            className="lg:hidden w-10 h-10 rounded-full bg-[#ecfdf5] dark:bg-[#111c2e] border border-[#cfe9dc] dark:border-[#1f2f46] grid place-items-center text-[#022c22] dark:text-white hover:bg-[#cfe9dc]/50 dark:hover:bg-[#1f2f46] transition"
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
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Slide-in Mobile Drawer */}
      <aside
        className={`drawer lg:hidden ${open ? 'open' : ''} bg-[#f0fdf4] dark:bg-[#0b1220] border-l border-[#cfe9dc] dark:border-[#1f2f46]`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#cfe9dc] dark:border-[#1f2f46]">
          <div className="flex items-center gap-2.5">
            <img
              src="/axom-browser-logo.png"
              alt="Axom AI"
              width={38}
              height={38}
              className="w-[38px] h-[38px] rounded-[10px] object-contain shadow-[0_4px_12px_rgba(5,150,105,0.25)]"
            />
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-[1.18rem] text-[#022c22] dark:text-white tracking-tight leading-none">
                Axom <span className="text-[#059669] dark:text-[#34d399]">AI</span>
              </span>
              <span className="text-[8.5px] font-extrabold tracking-[0.10em] uppercase text-[#166534] dark:text-[#94a3b8] mt-1 leading-none">
                Smart • Assamese • AI for All
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full bg-[#ecfdf5] dark:bg-[#111c2e] border border-[#cfe9dc] dark:border-[#1f2f46] grid place-items-center text-[#022c22] dark:text-white hover:bg-[#cfe9dc]/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 text-sm">
          {navItems.map((it) => {
            const isToolsMenu = it.title.toLowerCase().includes('tool') || it.url === '/#tools';
            const subItems = isToolsMenu
              ? megaItems
              : normalizeNavChildren((it as HeaderNavItem).children);
            const hasSub = subItems.length > 0;
            const branchKey = `mob_root_${it.id}`;
            const isExpanded = !!mobileExpanded[branchKey];

            const IconComponent = it.title.toLowerCase().includes('about')
              ? HelpCircle
              : it.title.toLowerCase().includes('tool')
              ? Bot
              : (it.title.toLowerCase().includes('model') || (it.url || '').includes('model'))
              ? Cpu
              : it.title.toLowerCase().includes('case')
              ? Users
              : it.title.toLowerCase().includes('pric')
              ? Crown
              : it.title.toLowerCase().includes('blog')
              ? Newspaper
              : it.title.toLowerCase().includes('faq')
              ? HelpCircle
              : it.title.toLowerCase().includes('contact')
              ? Mail
              : Sparkles;

            const rawUrl = (it.url || '').trim();
            const isNavigable = rawUrl !== '' && rawUrl !== '#';
            const targetUrl = isNavigable ? resolveUrl(rawUrl) : '#';
            const isExternal = targetUrl.startsWith('http');
            const cleanTarget = targetUrl.replace(/\/+$/, '');
            const cleanPath = (pathname || '').replace(/\/+$/, '');
            const isDrawerActive =
              isNavigable &&
              cleanTarget !== '' &&
              cleanTarget !== '#' &&
              (cleanPath === cleanTarget || (cleanTarget !== '/' && cleanPath.startsWith(cleanTarget + '/')));

            const drawerItemClass = isDrawerActive
              ? "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold bg-[#ecfdf5] dark:bg-[#111c2e] text-[#059669] dark:text-[#34d399] border border-[#cfe9dc] dark:border-[#1f2f46] transition"
              : "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[#166534] dark:text-[#94a3b8] hover:text-[#022c22] dark:hover:text-white hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition";

            return (
              <div key={it.id}>
                <div className="flex items-center gap-1">
                  {!isNavigable ? (
                    <button
                      type="button"
                      onClick={() => hasSub && toggleMobileBranch(branchKey)}
                      className={drawerItemClass}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] dark:bg-[#0f172a] border border-[#cfe9dc] dark:border-[#1f2f46] grid place-items-center shrink-0 text-[#059669] dark:text-[#34d399]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{it.title}</span>
                    </button>
                  ) : isExternal ? (
                    <a
                      href={targetUrl}
                      onClick={() => setOpen(false)}
                      className={drawerItemClass}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] dark:bg-[#0f172a] border border-[#cfe9dc] dark:border-[#1f2f46] grid place-items-center shrink-0 text-[#059669] dark:text-[#34d399]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{it.title}</span>
                    </a>
                  ) : (
                    <Link
                      href={targetUrl}
                      onClick={() => setOpen(false)}
                      className={drawerItemClass}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] dark:bg-[#0f172a] border border-[#cfe9dc] dark:border-[#1f2f46] grid place-items-center shrink-0 text-[#059669] dark:text-[#34d399]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{it.title}</span>
                    </Link>
                  )}

                  {hasSub && (
                    <button
                      type="button"
                      onClick={() => toggleMobileBranch(branchKey)}
                      aria-label={`Toggle ${it.title} submenu`}
                      className="w-9 h-9 rounded-xl grid place-items-center text-[#059669] dark:text-[#34d399] hover:bg-[#ecfdf5] dark:hover:bg-[#111c2e] transition shrink-0"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {hasSub && isExpanded && (
                  <MobileMenuBranch
                    items={subItems}
                    prefix={branchKey}
                    depth={1}
                    expandedIds={mobileExpanded}
                    onToggleExpand={toggleMobileBranch}
                    resolveUrl={resolveUrl}
                    onCloseDrawer={() => setOpen(false)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Actions: Sign In / User Profile */}
        <div className="px-5 pt-5 pb-4 border-t border-[#cfe9dc] dark:border-[#1f2f46] mt-2">
          {user?.isAuthenticated ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#ecfdf5] dark:bg-[#111c2e] border border-[#cfe9dc] dark:border-[#1f2f46] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10b981] to-[#059669] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#022c22] dark:text-white truncate">{user.name}</div>
                  {user.email && <div className="text-xs text-[#5b6b66] dark:text-[#94a3b8] truncate">{user.email}</div>}
                </div>
              </div>
              <a
                href="https://chat.aiaxom.co.in/"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-sm px-4 py-2.5 rounded-full font-extrabold text-white bg-gradient-to-r from-[#10b981] to-[#059669] shadow-lg shadow-emerald-600/30"
              >
                AI Chat Workspace &rarr;
              </a>
              <button
                type="button"
                onClick={() => { setOpen(false); handleLogout(); }}
                className="block w-full text-center text-xs px-4 py-2.5 rounded-full font-bold text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>

        {/* Assamese Footer Tagline */}
        <div className="px-5 pb-6 pt-1">
          <p className="font-assamese text-xs text-[#059669]/80 dark:text-[#34d399]/80 text-center">অসমৰ নিজা AI প্লেটফৰ্ম • AI for All</p>
        </div>
      </aside>

      {/* Google Authentication Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#111c2e] border border-[#cfe9dc] dark:border-[#1f2f46] p-6 shadow-[0_20px_60px_rgba(5,150,105,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#ecfdf5] dark:bg-[#0f172a] hover:bg-[#cfe9dc]/50 dark:hover:bg-[#1f2f46] grid place-items-center text-[#5b6b66] dark:text-[#94a3b8] hover:text-[#022c22] dark:hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Logo / Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#059669] grid place-items-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 text-white">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-lg font-extrabold text-[#022c22] dark:text-white tracking-tight">Sign in to Axom AI</h3>
            <p className="text-xs text-[#5b6b66] dark:text-[#94a3b8] mt-1 mb-6">
              Sign in with your Google account to access all AI tools and native Assamese chat.
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs text-left">
                {authError}
              </div>
            )}

            {/* Google GSI button container */}
            <div className="flex flex-col items-center justify-center min-h-[48px] w-full">
              <div id="navbarGoogleBtnContainer" className="w-full flex justify-center" />
              {authLoading && (
                <div className="flex items-center gap-2 text-xs text-[#059669] dark:text-[#34d399] mt-3 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating with Google...</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#5b6b66] dark:text-[#94a3b8] mt-6">
              Fair use policy: 1 account per user. By continuing you agree to Axom AI Terms.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
