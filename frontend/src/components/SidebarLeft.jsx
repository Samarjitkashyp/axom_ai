import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';

export default function SidebarLeft({
  sessions,
  currentChatId,
  onSwitchSession,
  onNewChat,
  isCollapsed,
  user,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => setDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => {
      // Memory management cleanup of global event listener
      window.removeEventListener('click', handleClose);
    };
  }, []);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  // Convert sessions object to array and reverse to show most recent first
  const sessionsList = Object.values(sessions).reverse();

  return (
    <aside className={`sidebar-left ${isCollapsed ? 'collapsed' : ''}`} id="sidebarLeft">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo">
          <svg className="brand-sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#sparkle_grad)" />
            <defs>
              <linearGradient id="sparkle_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C084FC" />
                <stop offset="1" stopColor="#E879F9" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-name">Axom AI</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="new-chat-wrapper">
        <button className="btn-new-chat" onClick={onNewChat} id="btnNewChat">
          <Plus size={16} className="btn-icon" />
          <span className="btn-text">New Chat</span>
          <span className="shortcut-badge">Ctrl+K</span>
        </button>
      </div>

      {/* Recent Chats Section */}
      <div className="recent-chats-section">
        <div className="section-header">
          <span className="section-title">Recent Chats</span>
        </div>
        <div className="recent-chats-list" id="recentChatsList">
          {sessionsList.map((session) => (
            <div
              key={session.id}
              className={`chat-history-item ${currentChatId === session.id ? 'active' : ''}`}
              onClick={() => onSwitchSession(session.id)}
            >
              <MessageSquare size={14} className="chat-icon" />
              <span className="chat-title">{session.title}</span>
              <span className="chat-time">{session.time || 'Just now'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Card */}
      {user.isAuthenticated && (
        <div className="user-profile-container" style={{ position: 'relative', width: '100%' }}>
          <div className="user-profile-card" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <div className="user-avatar-wrapper">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt={user.username}
                className="user-avatar"
              />
            </div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-badge">{user.isStaff ? 'Admin / Staff' : 'Premium User'}</span>
            </div>
            <ChevronDown
              size={16}
              className="chevron-icon"
              style={{
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </div>

          {/* Floating Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="profile-dropdown-menu"
              style={{
                position: 'absolute',
                bottom: '70px',
                left: '16px',
                right: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {user.isStaff && (
                <a
                  href="/admin-panel/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', '/admin-panel/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                  }}
                  className="dropdown-item"
                >
                  <LayoutDashboard size={14} style={{ color: 'var(--accent-pink)' }} />
                  <span>Admin Panel</span>
                </a>
              )}
              {user.isStaff && <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />}
              <a
                href="/admin-panel/logout/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#ef4444',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
                className="dropdown-item"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </a>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
