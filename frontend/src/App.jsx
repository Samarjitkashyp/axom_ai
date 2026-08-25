import React, { useState, useEffect } from 'react';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import ChatWindow from './components/ChatWindow';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { useWordLimit } from './hooks/useWordLimit';
import { useChatSessions } from './hooks/useChatSessions';

export default function App() {
  // Read Django injected window variables
  const user = {
    isAuthenticated: !!window.isAuthenticated,
    username: window.username || '',
    isStaff: !!window.isStaff,
  };

  // View state: 'chat' | 'admin'
  const [currentView, setCurrentView] = useState(() => {
    return window.location.pathname.startsWith('/admin-panel') ? 'admin' : 'chat';
  });

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('axom_ai_theme') || 'dark';
  });

  // Sidebar collapse states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Login Modal state
  const [loginModalState, setLoginModalState] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
  });

  // Web search status
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);

  // Custom Hooks
  const { remainingWords, deductWords, maxWords } = useWordLimit(user.isAuthenticated);
  const {
    sessions,
    currentChatId,
    setCurrentChatId,
    startNewSession,
    addMessageToSession,
    resetCurrentSession,
  } = useChatSessions();

  // Listen to popstate (back/forward browser buttons or custom dispatch)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(window.location.pathname.startsWith('/admin-panel') ? 'admin' : 'chat');
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

  const handleToggleWebSearch = () => {
    if (!user.isAuthenticated) {
      triggerLoginModal(
        "Web Search Locked",
        "Login is required to activate real-time web search. Please sign in to continue."
      );
      return;
    }
    setIsWebSearchActive((prev) => !prev);
  };

  const navigateToChat = () => {
    window.history.pushState(null, '', '/');
    setCurrentView('chat');
  };

  // Render Admin View
  if (currentView === 'admin' && user.isStaff) {
    return (
      <AdminPanel onBackToChat={navigateToChat} />
    );
  }

  // Render Main Layout (Chat View)
  const currentSession = currentChatId ? sessions[currentChatId] : null;

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
      />

      {/* MAIN CHAT CANVAS */}
      <ChatWindow
        currentSession={currentSession}
        onSendMessage={handleSendMessage}
        onAddMessage={addMessageToSession}
        isWebSearchActive={isWebSearchActive}
        onToggleWebSearch={handleToggleWebSearch}
        user={user}
        onToggleLeftSidebar={() => setLeftSidebarCollapsed((prev) => !prev)}
        onToggleRightSidebar={() => setRightSidebarCollapsed((prev) => !prev)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        remainingWords={remainingWords}
        deductWords={deductWords}
        onUpgrade={() => triggerLoginModal("Upgrade to Pro", "Log in to unlock advanced models, plugins, and unlimited words access.")}
      />

      {/* RIGHT SIDEBAR */}
      <SidebarRight
        user={user}
        remainingWords={remainingWords}
        maxWords={maxWords}
        onUpgrade={() => triggerLoginModal("Upgrade to Pro", "Log in to unlock advanced models, plugins, and unlimited words access.")}
        isCollapsed={rightSidebarCollapsed}
      />

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
