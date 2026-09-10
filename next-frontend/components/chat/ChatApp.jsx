'use client';

import React, { useState, useEffect } from 'react';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import ChatWindow from './ChatWindow';
import AdminPanel from './AdminPanel';
import SettingsPage from './SettingsPage';
import ToolsPage from './ToolsPage';
import LoginModal from './LoginModal';
import DocConverterModal from './DocConverterModal';
import PdfEditor from './PdfEditor';
import PdfCompressor from './PdfCompressor';
import WatermarkRemover from './WatermarkRemover';
import ImageGenerator from './ImageGenerator';
import ImageFinder from './ImageFinder';
import VideoFinder from './VideoFinder';
import DiagramGenerator from './DiagramGenerator';
import Summarize from './Summarize';
import SubscriptionPage from './SubscriptionPage';
import { useWordLimit } from './hooks/useWordLimit';
import { useChatSessions } from './hooks/useChatSessions';
import { getCsrfToken } from './utils/security';

export default function ChatApp() {
  // Dynamic Authentication state
  const [user, setUser] = useState({
    isAuthenticated: false,
    username: '',
    isStaff: false,
    isLoaded: false,
  });

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user-status/', { credentials: 'same-origin' });
      if (res.ok) {
        const d = await res.json();
        setUser({
          isAuthenticated: !!d.is_authenticated,
          username: d.username || '',
          isStaff: !!d.is_staff,
          isLoaded: true,
        });
      } else {
        setUser((prev) => ({ ...prev, isLoaded: true }));
      }
    } catch (e) {
      setUser((prev) => ({ ...prev, isLoaded: true }));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = (loginData) => {
    setUser({
      isAuthenticated: true,
      username: loginData.username || '',
      isStaff: !!loginData.is_staff,
      isLoaded: true,
    });
    setLoginModalState((prev) => ({ ...prev, isOpen: false }));
    // Refresh user status
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        credentials: 'same-origin',
      });
    } catch (e) {}
    setUser({
      isAuthenticated: false,
      username: '',
      isStaff: false,
      isLoaded: true,
    });
    setActivePlan(null);
    if (currentView === 'admin') {
      navigateToChat();
    }
  };

  // View state: 'chat' | 'admin' | 'settings' | 'tools' | 'upgrade'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window === 'undefined') return 'chat';
    const path = window.location.pathname;
    if (path.startsWith('/admin-panel')) return 'admin';
    if (path.startsWith('/tools')) return 'tools';
    if (path.startsWith('/upgrade') || path.startsWith('/subscription')) return 'upgrade';
    if (path.startsWith('/settings')) return 'settings';
    return 'chat';
  });

  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('axom_ai_theme') || 'dark';
  });

  // Sidebar collapse states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Document & Tool Modal states
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCompressorOpen, setIsCompressorOpen] = useState(false);
  const [isWmOpen, setIsWmOpen] = useState(false);
  const [isImgGenOpen, setIsImgGenOpen] = useState(false);
  const [isImageFinderOpen, setIsImageFinderOpen] = useState(false);
  const [isVideoFinderOpen, setIsVideoFinderOpen] = useState(false);
  const [isDiagramGenOpen, setIsDiagramGenOpen] = useState(false);
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);

  // Active paid plan
  const [activePlan, setActivePlan] = useState(null);
  useEffect(() => {
    if (!user.isAuthenticated) { setActivePlan(null); return; }
    fetch('/api/plan/status/', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setActivePlan(d); })
      .catch(() => {});
  }, [user.isAuthenticated, currentView]);

  // Login Modal state
  const [loginModalState, setLoginModalState] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
  });

  // Custom Hooks
  const { remainingWords, deductWords, maxWords } = useWordLimit(user.isAuthenticated);
  const {
    sessions,
    currentChatId,
    setCurrentChatId,
    startNewSession,
    addMessageToSession,
    resetCurrentSession,
    deleteSession,
    togglePin,
    clearAllSessions,
  } = useChatSessions();

  // Listen to popstate for browser back/forward without page reload
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin-panel')) {
        setCurrentView('admin');
      } else if (path.startsWith('/tools')) {
        setCurrentView('tools');
      } else if (path.startsWith('/upgrade') || path.startsWith('/subscription')) {
        setCurrentView('upgrade');
      } else if (path.startsWith('/settings')) {
        setCurrentView('settings');
      } else {
        setCurrentView('chat');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Sync theme class with document body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
    localStorage.setItem('axom_ai_theme', theme);
  }, [theme]);

  // Window resizing handles default sidebar collapse states
  useEffect(() => {
    const checkWindowSize = () => {
      if (window.innerWidth < 1100) {
        setRightSidebarCollapsed(true);
      } else {
        setRightSidebarCollapsed(false);
      }
      if (window.innerWidth < 850) {
        setLeftSidebarCollapsed(true);
      } else {
        setLeftSidebarCollapsed(false);
      }
    };

    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerLoginModal = (title, subtitle) => {
    setLoginModalState({
      isOpen: true,
      title: title || "Limit Reached",
      subtitle: subtitle || "You have used your free daily limit of 5,000 words. Please log in to unlock unlimited access.",
    });
  };

  const closeLoginModal = () => {
    setLoginModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSendMessage = (text) => {
    const newSessionId = startNewSession(text);
    addMessageToSession(newSessionId, 'user', text);
    return newSessionId;
  };

  const handleDocConvertedToChat = (data) => {
    let sessionId = currentChatId;
    if (!sessionId) {
      sessionId = startNewSession(`📄 Convert Document: ${data.original_name}`);
    } else {
      addMessageToSession(sessionId, 'user', `📄 Convert Document: ${data.original_name}`);
    }
    addMessageToSession(
      sessionId,
      'assistant',
      `আপোনাৰ নথিপত্ৰখন (**${data.original_name}**) সফলতাৰে PDF লৈ ৰূপান্তৰ কৰা হৈছে। আপুনি তলৰ বুটামৰ পৰা পোনপটীয়াকৈ PDF ডাউনলোড কৰিব পাৰে:`,
      'Doc to PDF Converter',
      { doc_conversion: data }
    );
  };

  // Zero-Reload Navigation Handlers
  const navigateToChat = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
    setCurrentView('chat');
  };

  const navigateToTools = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/tools');
    setCurrentView('tools');
  };

  const navigateToUpgrade = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/upgrade');
    setCurrentView('upgrade');
  };

  const navigateToSettings = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/settings');
    setCurrentView('settings');
  };

  const navigateToAdmin = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/admin-panel');
    setCurrentView('admin');
  };

  // Render Admin View (Protected Staff Gate)
  if (currentView === 'admin') {
    if (user.isLoaded && !user.isStaff) {
      return (
        <div className="min-h-screen bg-[#0b0b14] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 grid place-items-center text-rose-400 mb-4">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Staff Access Required</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            The Admin Panel requires staff permissions. Please sign in with an authorized administrator account.
          </p>
          <div className="flex gap-3">
            <button
              onClick={navigateToChat}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Return to Chat
            </button>
            {!user.isAuthenticated && (
              <button
                onClick={() => triggerLoginModal("Staff Login", "Sign in with your administrator account.")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-fuchsia-600/30 transition"
              >
                Sign In
              </button>
            )}
          </div>
          <LoginModal
            isOpen={loginModalState.isOpen}
            onClose={closeLoginModal}
            onLoginSuccess={handleLoginSuccess}
            title={loginModalState.title}
            subtitle={loginModalState.subtitle}
          />
        </div>
      );
    }

    return (
      <AdminPanel onBackToChat={navigateToChat} />
    );
  }

  // Render Settings View
  if (currentView === 'settings') {
    return (
      <SettingsPage
        sessions={sessions}
        onBack={navigateToChat}
        onSwitchSession={(id) => { setCurrentChatId(id); navigateToChat(); }}
        deleteSession={deleteSession}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Render Tools View (/tools)
  if (currentView === 'tools') {
    return (
      <>
        <ToolsPage
          onBackToChat={navigateToChat}
          onOpenEditor={() => setIsEditorOpen(true)}
          onOpenCompressor={() => setIsCompressorOpen(true)}
          onOpenWmRemover={() => setIsWmOpen(true)}
          onOpenImageGen={() => setIsImgGenOpen(true)}
          onOpenImageFinder={() => setIsImageFinderOpen(true)}
          onOpenVideoFinder={() => setIsVideoFinderOpen(true)}
          onOpenDiagramGen={() => setIsDiagramGenOpen(true)}
          onOpenSummarizer={() => setIsSummarizeOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        {isEditorOpen && <PdfEditor onClose={() => setIsEditorOpen(false)} />}
        {isCompressorOpen && <PdfCompressor onClose={() => setIsCompressorOpen(false)} />}
        {isWmOpen && <WatermarkRemover onClose={() => setIsWmOpen(false)} />}
        {isImgGenOpen && <ImageGenerator onClose={() => setIsImgGenOpen(false)} />}
        {isImageFinderOpen && <ImageFinder onClose={() => setIsImageFinderOpen(false)} />}
        {isVideoFinderOpen && <VideoFinder onClose={() => setIsVideoFinderOpen(false)} />}
        {isDiagramGenOpen && <DiagramGenerator onClose={() => setIsDiagramGenOpen(false)} />}
        {isSummarizeOpen && <Summarize onClose={() => setIsSummarizeOpen(false)} />}
      </>
    );
  }

  // Render Upgrade / Subscription View (/upgrade or /subscription)
  if (currentView === 'upgrade') {
    return (
      <SubscriptionPage
        user={user}
        onBackToChat={navigateToChat}
        theme={theme}
      />
    );
  }

  const currentSession = currentChatId ? sessions[currentChatId] : null;

  // Main Default Chat View (/)
  return (
    <div className="app-layout">
      {/* LEFT SIDEBAR */}
      <SidebarLeft
        sessions={sessions}
        currentChatId={currentChatId}
        onSwitchSession={setCurrentChatId}
        onNewChat={resetCurrentSession}
        isCollapsed={leftSidebarCollapsed}
        user={user}
        deleteSession={deleteSession}
        togglePin={togglePin}
        clearAllSessions={clearAllSessions}
        onOpenSettings={navigateToSettings}
        onOpenDocConverter={() => setIsDocModalOpen(true)}
        onOpenTools={navigateToTools}
        onOpenUpgrade={navigateToUpgrade}
        onCloseSidebar={() => setLeftSidebarCollapsed(true)}
        onLogout={handleLogout}
      />

      {/* MAIN CHAT CANVAS */}
      <ChatWindow
        currentSession={currentSession}
        onSendMessage={handleSendMessage}
        onAddMessage={addMessageToSession}
        user={user}
        onToggleLeftSidebar={() => setLeftSidebarCollapsed((prev) => !prev)}
        onToggleRightSidebar={() => setRightSidebarCollapsed((prev) => !prev)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        remainingWords={remainingWords}
        deductWords={deductWords}
        onUpgrade={navigateToUpgrade}
        onOpenDocConverterModal={() => setIsDocModalOpen(true)}
        onOpenTools={navigateToTools}
      />

      {/* RIGHT SIDEBAR */}
      <SidebarRight
        user={user}
        activePlan={activePlan}
        remainingWords={remainingWords}
        maxWords={maxWords}
        onUpgrade={navigateToUpgrade}
        isCollapsed={rightSidebarCollapsed}
        onClose={() => setRightSidebarCollapsed(true)}
      />

      {/* MOBILE SCRIM BACKDROP */}
      <div
        className={`mobile-backdrop ${(!leftSidebarCollapsed || !rightSidebarCollapsed) ? 'visible' : ''}`}
        onClick={() => {
          setLeftSidebarCollapsed(true);
          setRightSidebarCollapsed(true);
        }}
        aria-hidden="true"
      />

      {/* DOCUMENT CONVERTER MODAL */}
      <DocConverterModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onOpenEditor={() => { setIsDocModalOpen(false); setIsEditorOpen(true); }}
        onOpenCompressor={() => { setIsDocModalOpen(false); setIsCompressorOpen(true); }}
        onDocConvertedToChat={handleDocConvertedToChat}
      />

      {/* FULL-SCREEN PDF EDITOR */}
      {isEditorOpen && <PdfEditor onClose={() => setIsEditorOpen(false)} />}

      {/* FULL-SCREEN PDF COMPRESSOR */}
      {isCompressorOpen && <PdfCompressor onClose={() => setIsCompressorOpen(false)} />}

      {/* FULL-SCREEN WATERMARK REMOVER */}
      {isWmOpen && <WatermarkRemover onClose={() => setIsWmOpen(false)} />}

      {/* FULL-SCREEN IMAGE GENERATOR */}
      {isImgGenOpen && <ImageGenerator onClose={() => setIsImgGenOpen(false)} />}

      {/* FULL-SCREEN AI IMAGE FINDER */}
      {isImageFinderOpen && <ImageFinder onClose={() => setIsImageFinderOpen(false)} />}

      {/* FULL-SCREEN AI VIDEO FINDER */}
      {isVideoFinderOpen && <VideoFinder onClose={() => setIsVideoFinderOpen(false)} />}

      {/* FULL-SCREEN AI DIAGRAM GENERATOR */}
      {isDiagramGenOpen && <DiagramGenerator onClose={() => setIsDiagramGenOpen(false)} />}

      {/* FULL-SCREEN SUMMARIZE */}
      {isSummarizeOpen && <Summarize onClose={() => setIsSummarizeOpen(false)} />}

      {/* CREDENTIALS LOGIN MODAL */}
      <LoginModal
        isOpen={loginModalState.isOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
        title={loginModalState.title}
        subtitle={loginModalState.subtitle}
      />
    </div>
  );
}
