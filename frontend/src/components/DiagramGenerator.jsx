import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  Network,
  X,
  Copy,
  Check,
  Loader2,
  Sparkles,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Code2,
  Layers,
  Palette,
  FileCode,
  FileImage,
  Eye,
  Dices,
  Zap,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { getCsrfToken } from '../utils/security';

const DIAGRAM_TYPES = [
  { id: 'flowchart', label: 'Flowchart', icon: '🔀', desc: 'Process & Logic Flow' },
  { id: 'sequence', label: 'Sequence', icon: '⚡', desc: 'APIs & Messaging Flow' },
  { id: 'architecture', label: 'Architecture', icon: '🏛️', desc: 'System & Cloud Infra' },
  { id: 'er', label: 'Database ER', icon: '🗄️', desc: 'Tables & Relations' },
  { id: 'mindmap', label: 'Mindmap', icon: '🧠', desc: 'Brainstorm & Concepts' },
  { id: 'state', label: 'State Machine', icon: '🔄', desc: 'Lifecycle & Transitions' },
  { id: 'gantt', label: 'Gantt Chart', icon: '📅', desc: 'Timelines & Roadmaps' },
  { id: 'class', label: 'Class / OOP', icon: '📦', desc: 'OOP Models & Structures' },
];

const THEME_OPTIONS = [
  { id: 'dark', label: 'Cyber Dark' },
  { id: 'forest', label: 'Emerald' },
  { id: 'neutral', label: 'Slate' },
  { id: 'base', label: 'Indigo' },
];

const STARTER_PROMPTS = [
  {
    title: '🔐 JWT Auth & Refresh Flow',
    type: 'sequence',
    prompt: 'Create a complete user login, JWT access token generation, API request verification, and automatic refresh token rotation sequence diagram between Client, API Gateway, Auth Service, and Redis.',
  },
  {
    title: '🛒 E-Commerce Checkout Flow',
    type: 'flowchart',
    prompt: 'Design a comprehensive flowchart for an e-commerce checkout flow: Cart validation, stock check, discount coupon apply, payment gateway (UPI/Cards), order creation, invoice generation, and fallback for failed payments.',
  },
  {
    title: '☁️ Microservices Architecture',
    type: 'architecture',
    prompt: 'Architecture diagram of a scalable modern SaaS on AWS: Cloudflare CDN, AWS ALB, Kubernetes pods (Auth, Chat, Billing), Redis cache, PostgreSQL cluster with read replica, and S3 media storage.',
  },
  {
    title: '🗄️ SaaS Multi-tenant DB Schema',
    type: 'er',
    prompt: 'Entity Relationship (ER) database schema for a SaaS platform with Users, Workspaces, Memberships, Subscriptions, Invoices, UsageLogs, and API Keys with proper foreign keys and datatypes.',
  },
  {
    title: '🤖 AI Agent Decision Loop',
    type: 'flowchart',
    prompt: 'Flowchart showing an Autonomous AI Agent decision loop: User prompt -> Intent classification -> Tool calling (Web search, Code interpreter, Vector DB) -> Reasoning loop -> Final answer formatting.',
  },
  {
    title: '🚀 Startup Launch Roadmap 2026',
    type: 'gantt',
    prompt: 'Gantt chart for 2026 Q1-Q4 Product Launch Roadmap: Market research, UI/UX design, MVP build, Security audit, Beta testing, Marketing launch, and Enterprise expansion.',
  },
];

const SURPRISE_PROMPTS = [
  'Generate a sequence diagram of Google OAuth 2.0 PKCE authentication flow between Mobile App, Auth Server, and Resource Server',
  'Flowchart for automated CI/CD deployment pipeline with GitHub Actions, Docker build, unit tests, staging rollout, and production canary deployment',
  'State diagram for Ride Hailing trip lifecycle (Requested, Driver Assigned, In Transit, Payment Processing, Completed, Cancelled)',
  'Mindmap of Modern Full-Stack Web Development roadmap covering Frontend, Backend, DevOps, Databases, and AI Engineering',
  'ER diagram for an Uber-like taxi booking app: Riders, Drivers, Vehicles, Rides, Locations, Reviews, and Payments',
  'Architecture diagram for real-time multiplayer gaming server with WebSocket gateway, Game Room managers, and Redis Pub/Sub',
];

function sanitizeMermaidCode(code) {
  if (!code) return '';
  let cleaned = code.trim();
  if (cleaned.startsWith('```mermaid')) cleaned = cleaned.replace(/^```mermaid\s*/i, '');
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '');
  if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\s*```$/, '');

  // Normalize Unicode dashes and non-breaking spaces
  cleaned = cleaned.replace(/[\u2011\u2013\u2014]/g, '-').replace(/\u00A0/g, ' ');

  // Fix invalid decision syntax: {["..."]} or {[...]} -> {"..."}
  cleaned = cleaned.replace(/\{\s*\[\s*"([^"]*)"\s*\]\s*\}/g, '{"$1"}');
  cleaned = cleaned.replace(/\{\s*\[\s*'([^']*)'\s*\]\s*\}/g, '{"$1"}');
  cleaned = cleaned.replace(/\{\s*\[([^\]]+)\]\s*\}/g, '{"$1"}');

  // Fix unquoted parentheses in node shapes
  cleaned = cleaned.replace(/(\b[A-Za-z0-9_]+)\[([^"\]\n\r]*\([^"\]\n\r]*\)[^"\]\n\r]*)\]/g, '$1["$2"]');
  cleaned = cleaned.replace(/(\b[A-Za-z0-9_]+)\{([^"\}\n\r]*\([^"\}\n\r]*\)[^"\}\n\r]*)\}/g, '$1{"$2"}');
  cleaned = cleaned.replace(/(\b[A-Za-z0-9_]+)\(([^"\)\n\r]*\([^"\)\n\r]*\)[^"\)\n\r]*)\)/g, '$1("$2")');

  return cleaned.trim();
}

function cleanStrayMermaidElements() {
  try {
    const stray = document.querySelectorAll('body > [id^="dmermaid"], body > [id^="mermaid"]');
    stray.forEach(el => el.remove());
  } catch (e) {
    // ignore
  }
}

class DiagramErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('DiagramGenerator ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="diagram-studio-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 460, background: '#111827', padding: 28, borderRadius: 14, border: '1px solid #374151', boxShadow: '0 12px 36px rgba(0,0,0,0.6)' }}>
            <h3 style={{ color: '#f87171', margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: 700 }}>Diagram Studio Notice</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 14, lineHeight: 1.5 }}>
              The canvas encountered a temporary render exception. You can retry generating or reset the canvas.
            </p>
            {this.state.error?.message && (
              <p style={{ color: '#ef4444', fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: 6, marginBottom: 16, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {this.state.error.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{ padding: '8px 18px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => this.props.onClose?.()}
                style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DiagramGeneratorInner({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('flowchart');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [mermaidCode, setMermaidCode] = useState('');
  const [svgOutput, setSvgOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [renderingError, setRenderingError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code' | 'split'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [quotaInfo, setQuotaInfo] = useState({ free_daily_limit: 5, remaining: 5, is_paid: false });
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const canvasRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function checkQuota() {
      try {
        const res = await fetch('/api/user-status/');
        if (res.ok && isMounted) {
          const data = await res.json();
          setQuotaInfo(prev => ({
            ...prev,
            is_paid: data.is_paid || false,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch user status', err);
      }
    }
    checkQuota();
    return () => { isMounted = false; };
  }, []);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.innerHTML = svgOutput || '';
    }
  }, [svgOutput]);

  const codeDebounceRef = useRef(null);
  useEffect(() => {
    return () => {
      if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
    };
  }, []);

  const renderDiagram = useCallback(async (code, theme = selectedTheme) => {
    const sanitized = sanitizeMermaidCode(code);
    if (!sanitized) {
      setSvgOutput('');
      setRenderingError(null);
      return;
    }

    try {
      cleanStrayMermaidElements();
      setRenderingError(null);
      const m = mermaid?.default || mermaid;
      m.initialize({
        startOnLoad: false,
        suppressErrorRendering: true,
        theme: theme,
        themeVariables: {
          darkMode: theme !== 'neutral',
          background: theme === 'dark' ? '#0b0f19' : theme === 'forest' ? '#064e3b' : theme === 'base' ? '#1e1b4b' : '#1e293b',
          primaryColor: '#6366f1',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#818cf8',
          lineColor: '#94a3b8',
          secondaryColor: '#ec4899',
          tertiaryColor: '#1e293b',
          textColor: '#e2e8f0',
          fontSize: '14px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        securityLevel: 'strict',
      });
      m.parseError = (err) => {
        console.warn('Mermaid parse warning:', err);
      };

      // 1. Validate syntax with parse first
      try {
        await m.parse(sanitized);
      } catch (parseErr) {
        console.warn('Mermaid parse check warning:', parseErr);
        cleanStrayMermaidElements();
        setRenderingError(parseErr?.message || 'Syntax error in diagram code.');
        return;
      }

      // 2. Render to clean SVG
      const uniqueId = 'mermaid_canvas_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const res = await m.render(uniqueId, sanitized);
      const output = res?.svg || (typeof res === 'string' ? res : '');
      setSvgOutput(output);
      cleanStrayMermaidElements();
    } catch (err) {
      console.warn('Mermaid render error:', err);
      cleanStrayMermaidElements();
      setRenderingError(err?.message || 'Syntax error in diagram structure.');
    }
  }, [selectedTheme]);

  const handleGenerate = async (customPrompt = null, customType = null) => {
    const p = (customPrompt !== null ? customPrompt : prompt).trim();
    const type = customType || selectedType;
    if (!p || generating) return;

    setGenerating(true);
    setRenderingError(null);

    try {
      const csrfToken = getCsrfToken();
      const res = await fetch('/api/generate-diagram/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          prompt: p,
          diagram_type: type,
          theme: selectedTheme,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Diagram generation failed. Please try again.');
      }

      const returnedCode = data.code || data.mermaid_code || '';
      setMermaidCode(returnedCode);
      setQuotaInfo({
        free_daily_limit: data.daily_limit ?? 5,
        remaining: data.remaining_today ?? 5,
        is_paid: data.is_premium ?? false,
      });

      await renderDiagram(returnedCode, selectedTheme);
    } catch (err) {
      console.error('Generation error:', err);
      setRenderingError(err.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    if (mermaidCode) {
      renderDiagram(mermaidCode, newTheme);
    }
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setMermaidCode(newCode);
    if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
    codeDebounceRef.current = setTimeout(() => {
      renderDiagram(newCode);
    }, 350);
  };

  const handleDownloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axom-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!svgOutput) return;
    try {
      const svgElement = canvasRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const bBox = svgElement.getBoundingClientRect();
      const scale = 2;
      canvas.width = (bBox.width || 800) * scale;
      canvas.height = (bBox.height || 600) * scale;

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = selectedTheme === 'dark' ? '#0b0f19' : selectedTheme === 'forest' ? '#064e3b' : '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `axom-diagram-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobURL);
      };
      img.src = blobURL;
    } catch (err) {
      console.error('PNG export failed', err);
      alert('Could not export PNG directly. You can download the SVG vector format.');
    }
  };

  const handleCopyCode = async () => {
    if (!mermaidCode) return;
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleSurpriseMe = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
  };

  return (
    <div
      className="diagram-studio-root"
      onClick={e => e.stopPropagation()}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 1. TOP HEADER BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '8px 12px' : '10px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          <div
            style={{
              width: isMobile ? 32 : 38,
              height: isMobile ? 32 : 38,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              flexShrink: 0,
            }}
          >
            <Network size={isMobile ? 18 : 20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: isMobile ? '0.92rem' : '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                AI Diagram Studio
              </span>
              {!isMobile && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    textTransform: 'uppercase',
                  }}
                >
                  Mermaid 11.4
                </span>
              )}
            </div>
            {!isMobile && (
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                Flowcharts, Sequence, ER Models & Cloud Architectures
              </p>
            )}
          </div>
        </div>

        {/* Right: Controls & Quota */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          {/* Quota Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: isMobile ? '4px 8px' : '5px 12px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: isMobile ? '0.72rem' : '0.76rem',
              color: '#cbd5e1',
            }}
          >
            <Zap size={13} color={quotaInfo.is_paid ? '#facc15' : '#818cf8'} />
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>
              {quotaInfo.is_paid
                ? 'Unlimited'
                : `${quotaInfo.remaining ?? 5}/${quotaInfo.free_daily_limit || 5} Free`}
            </span>
          </div>

          {/* View Mode Switcher (Desktop only) */}
          {mermaidCode && !isMobile && (
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 2,
                borderRadius: 8,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '4px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeTab === 'preview' ? '#4f46e5' : 'transparent',
                  color: activeTab === 'preview' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Eye size={13} /> Visual
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                style={{
                  padding: '4px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeTab === 'split' ? '#4f46e5' : 'transparent',
                  color: activeTab === 'split' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Layers size={13} /> Split
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                style={{
                  padding: '4px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeTab === 'code' ? '#4f46e5' : 'transparent',
                  color: activeTab === 'code' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Code2 size={13} /> Code
              </button>
            </div>
          )}

          {/* Export Actions */}
          {svgOutput && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <button
                type="button"
                onClick={handleDownloadPng}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}
              >
                <FileImage size={13} /> PNG
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <FileCode size={13} /> SVG
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Mermaid Code"
                style={{
                  padding: '5px 8px',
                  borderRadius: 7,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Close Studio Button */}
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            style={{
              padding: '6px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={isMobile ? 18 : 20} />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#070b14',
        }}
      >
        {/* Canvas & Visual Area */}
        {(activeTab === 'preview' || activeTab === 'split' || !mermaidCode) && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              position: 'relative',
              overflow: 'hidden',
              borderRight: activeTab === 'split' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            }}
          >
            {/* Overlay Toolbar: Zoom & Reset */}
            {svgOutput && (
              <div
                style={{
                  position: 'absolute',
                  top: isMobile ? 8 : 14,
                  right: isMobile ? 8 : 14,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: 3,
                  borderRadius: 8,
                  backgroundColor: 'rgba(15, 23, 42, 0.88)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.15))}
                  title="Zoom Out"
                  style={{
                    padding: '3px 5px',
                    borderRadius: 5,
                    border: 'none',
                    background: 'transparent',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  <ZoomOut size={14} />
                </button>
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', minWidth: 36, textAlign: 'center', color: '#94a3b8' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.15))}
                  title="Zoom In"
                  style={{
                    padding: '3px 5px',
                    borderRadius: 5,
                    border: 'none',
                    background: 'transparent',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  <ZoomIn size={14} />
                </button>
                <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  title="Reset 100%"
                  style={{
                    padding: '3px 5px',
                    borderRadius: 5,
                    border: 'none',
                    background: 'transparent',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}

            {/* Overlay Toolbar: Theme Picker */}
            {svgOutput && (
              <div
                style={{
                  position: 'absolute',
                  top: isMobile ? 8 : 14,
                  left: isMobile ? 8 : 14,
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 6px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(15, 23, 42, 0.88)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <Palette size={13} color="#818cf8" style={{ marginLeft: 2 }} />
                {THEME_OPTIONS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThemeChange(t.id)}
                    style={{
                      padding: '2px 7px',
                      borderRadius: 5,
                      border: 'none',
                      background: selectedTheme === t.id ? '#4f46e5' : 'transparent',
                      color: selectedTheme === t.id ? '#ffffff' : '#94a3b8',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable / Zoomable SVG Render Container */}
            <div
              className="diagram-custom-scroll"
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '12px' : '24px',
                boxSizing: 'border-box',
              }}
            >
              {generating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 15,
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Loader2 size={26} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 600, color: '#f1f5f9' }}>
                      Synthesizing Architecture & Logic...
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#94a3b8', maxWidth: 340 }}>
                      Building precise Mermaid nodes, relations, and layout vectors with AI.
                    </p>
                  </div>
                </div>
              ) : renderingError ? (
                <div
                  style={{
                    maxWidth: 440,
                    padding: '18px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(127, 29, 29, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    textAlign: 'center',
                  }}
                >
                  <AlertTriangle size={26} color="#f87171" style={{ margin: '0 auto 8px auto' }} />
                  <h3 style={{ margin: 0, fontSize: '0.88rem', color: '#fca5a5' }}>Diagram Render Error</h3>
                  <p style={{ margin: '6px 0 14px 0', fontSize: '0.74rem', fontFamily: 'monospace', color: '#f87171', wordBreak: 'break-word' }}>
                    {renderingError}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#991b1b',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Regenerate Diagram
                  </button>
                </div>
              ) : svgOutput ? (
                <div
                  ref={canvasRef}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                    maxWidth: '100%',
                  }}
                />
              ) : (
                /* Empty State: Starter Prompt Cards */
                <div style={{ width: '100%', maxWidth: '880px', padding: isMobile ? '6px 0' : '12px 0' }}>
                  <div style={{ textAlign: 'center', marginBottom: isMobile ? 14 : 22 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: '#a5b4fc',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        marginBottom: 10,
                      }}
                    >
                      <Sparkles size={13} />
                      Next-Gen Visual Architecture & Diagramming
                    </div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
                      What would you like to visualize today?
                    </h2>
                    <p style={{ margin: 0, fontSize: isMobile ? '0.76rem' : '0.82rem', color: '#94a3b8', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
                      Describe any system flow, database schema, sequence interaction or mindmap.
                    </p>
                  </div>

                  {/* 6 Starter Cards Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                      gap: 12,
                    }}
                  >
                    {STARTER_PROMPTS.map((card, idx) => (
                      <div
                        key={idx}
                        className="diagram-prompt-card"
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPrompt(card.prompt);
                          setSelectedType(card.type);
                          handleGenerate(card.prompt, card.type);
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 5 }}>
                            {card.title}
                          </span>
                          <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {card.prompt}
                          </p>
                        </div>
                        <div
                          style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.7rem',
                            color: '#818cf8',
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>{card.type}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            Generate <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Code Editor (Desktop only) */}
        {(activeTab === 'code' || activeTab === 'split') && mermaidCode && !isMobile && (
          <div
            style={{
              width: activeTab === 'split' ? '450px' : '100%',
              backgroundColor: '#050811',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(11, 15, 25, 0.9)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={14} color="#818cf8" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0' }}>Mermaid Code Editor</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {copiedCode ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ flex: 1, padding: 10, minHeight: 0 }}>
              <textarea
                ref={textareaRef}
                value={mermaidCode}
                onChange={handleCodeChange}
                spellCheck="false"
                style={{
                  width: '100%',
                  height: '100%',
                  padding: 10,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.76rem',
                  lineHeight: 1.48,
                  color: '#c7d2fe',
                  backgroundColor: 'rgba(11, 15, 25, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 8,
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROL BAR */}
      <div
        style={{
          padding: isMobile ? '10px 12px' : '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 15, 25, 0.96)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Diagram Type Chips (Scrollbar Hidden) */}
        <div
          className="diagram-hide-scroll"
          style={{
            maxWidth: 920,
            margin: '0 auto 10px auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 2,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {!isMobile && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: 4 }}>
              Type:
            </span>
          )}
          {DIAGRAM_TYPES.map(t => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedType(t.id);
                }}
                className={`diagram-type-chip ${isSelected ? 'active' : ''}`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Prompt Box */}
        <div
          style={{
            maxWidth: 920,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Surprise Me Dice Button */}
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleSurpriseMe();
            }}
            title="Surprise me with a random prompt"
            style={{
              padding: isMobile ? '10px' : '11px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Dices size={18} />
          </button>

          {/* Main Input Field */}
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleGenerate();
              }
            }}
            placeholder={isMobile ? "Describe diagram (e.g. AWS architecture)..." : "Describe your diagram... (e.g. AWS Multi-Region architecture or Stripe payment flow)"}
            style={{
              flex: 1,
              padding: isMobile ? '11px 14px' : '12px 16px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              fontSize: isMobile ? '0.82rem' : '0.86rem',
              color: '#f8fafc',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Generate Action Button */}
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleGenerate();
            }}
            disabled={!prompt.trim() || generating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: isMobile ? '11px 16px' : '12px 22px',
              borderRadius: 10,
              border: 'none',
              background:
                !prompt.trim() || generating
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)',
              color: !prompt.trim() || generating ? '#64748b' : '#ffffff',
              fontSize: isMobile ? '0.82rem' : '0.86rem',
              fontWeight: 700,
              cursor: !prompt.trim() || generating ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              boxShadow: !prompt.trim() || generating ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            {generating ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Sparkles size={16} />
                <span style={{ display: isMobile ? 'none' : 'inline' }}>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiagramGenerator(props) {
  return (
    <DiagramErrorBoundary onClose={props.onClose}>
      <DiagramGeneratorInner {...props} />
    </DiagramErrorBoundary>
  );
}

