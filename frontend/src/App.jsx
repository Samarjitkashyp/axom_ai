import React, { useState, useEffect } from 'react';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import ChatWindow from './components/ChatWindow';
import AdminPanel from './components/AdminPanel';
import SettingsPage from './components/SettingsPage';
import ToolsPage from './components/ToolsPage';
import LoginModal from './components/LoginModal';
import DocConverterModal from './components/DocConverterModal';
import PdfEditor from './components/PdfEditor';
import PdfCompressor from './components/PdfCompressor';
import WatermarkRemover from './components/WatermarkRemover';
import SubscriptionPage from './components/SubscriptionPage';
import { useWordLimit } from './hooks/useWordLimit';
import { useChatSessions } from './hooks/useChatSessions';

export default function App() {
  // Read Django injected window variables
  const user = {
    isAuthenticated: !!window.isAuthenticated,
    username: window.username || '',
    isStaff: !!window.isStaff,
  };

  // View state: 'chat' | 'admin' | 'settings' | 'tools' | 'upgrade'
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin-panel')) return 'admin';
    if (path.startsWith('/tools')) return 'tools';
    if (path.startsWith('/upgrade') || path.startsWith('/subscription')) return 'upgrade';
    return 'chat';
  });

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('axom_ai_theme') || 'dark';
  });

  // Sidebar collapse states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Document Converter Modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCompressorOpen, setIsCompressorOpen] = useState(false);
  const [isWmOpen, setIsWmOpen] = useState(false);

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

  // Listen to popstate (back/forward browser buttons or custom dispatch)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin-panel')) {
        setCurrentView('admin');
      } else if (path.startsWith('/tools')) {
        setCurrentView('tools');
      } else if (path.startsWith('/upgrade') || path.startsWith('/subscription')) {
        setCurrentView('upgrade');
      } else {
        setCurrentView('chat');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Sync theme class with document body
  useEffect(() => {
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
    // Add user message
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

  const navigateToChat = () => {
    window.history.pushState(null, '', '/');
    setCurrentView('chat');
  };

  const navigateToTools = () => {
    window.history.pushState(null, '', '/tools');
    setCurrentView('tools');
  };

  const navigateToUpgrade = () => {
    window.history.pushState(null, '', '/upgrade');
    setCurrentView('upgrade');
  };

  // Render Admin View
  if (currentView === 'admin' && user.isStaff) {
    return (
      <AdminPanel onBackToChat={navigateToChat} />
    );
  }

  // Render Settings View
  if (currentView === 'settings') {
    return (
      <SettingsPage
        sessions={sessions}
        onBack={() => setCurrentView('chat')}
        onSwitchSession={setCurrentChatId}
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
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        {/* FULL-SCREEN PDF EDITOR */}
        {isEditorOpen && <PdfEditor onClose={() => setIsEditorOpen(false)} />}

        {/* FULL-SCREEN PDF COMPRESSOR */}
        {isCompressorOpen && <PdfCompressor onClose={() => setIsCompressorOpen(false)} />}
      </>
    );
  }

  // Render Subscription View (/upgrade)
  if (currentView === 'upgrade') {
    return (
      <>
        <SubscriptionPage
          onBackToChat={navigateToChat}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          user={user}
          onOpenLogin={triggerLoginModal}
        />
        {loginModalState.isOpen && (
          <LoginModal
            isOpen={loginModalState.isOpen}
            onClose={closeLoginModal}
            title={loginModalState.title}
            subtitle={loginModalState.subtitle}
          />
        )}
      </>
    );
  }

  // Render Main Layout (Chat View)
  const currentSession = currentChatId ? sessions[currentChatId] : null;

  return (
    <div className="app-layout">
      {/* Mobile backdrop — tap the dark area to close an open sidebar */}
      <div
        className={`mobile-backdrop ${(!leftSidebarCollapsed || !rightSidebarCollapsed) ? 'visible' : ''}`}
        onClick={() => {
          setLeftSidebarCollapsed(true);
          setRightSidebarCollapsed(true);
        }}
      />

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
        onOpenSettings={() => setCurrentView('settings')}
        onOpenDocConverter={() => setIsDocModalOpen(true)}
        onOpenTools={navigateToTools}
        onOpenUpgrade={navigateToUpgrade}
        onCloseSidebar={() => setLeftSidebarCollapsed(true)}
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
        remainingWords={remainingWords}
        maxWords={maxWords}
        onUpgrade={navigateToUpgrade}
        isCollapsed={rightSidebarCollapsed}
        onClose={() => setRightSidebarCollapsed(true)}
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

      {/* BEAUTIFUL CREDENTIALS MODAL */}
      <LoginModal
        isOpen={loginModalState.isOpen}
        onClose={closeLoginModal}
        title={loginModalState.title}
        subtitle={loginModalState.subtitle}
      />
    </div>
  );
}
