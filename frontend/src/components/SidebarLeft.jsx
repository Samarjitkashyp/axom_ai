import React, { useState, useEffect } from 'react';
import {
  Plus, MessageSquare, LogOut, ChevronDown, LayoutDashboard,
  MoreVertical, Pin, PinOff, Trash2, Archive, X,
} from 'lucide-react';

const RECENT_LIMIT = 15;

export default function SidebarLeft({
  sessions,
  currentChatId,
  onSwitchSession,
  onNewChat,
  isCollapsed,
  user,
  deleteSession,
  togglePin,
  clearAllSessions,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);      // per-chat 3-dot menu
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    const closeAll = () => { setDropdownOpen(false); setOpenMenuId(null); setHeaderMenuOpen(false); };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const handleProfileClick = (e) => { e.stopPropagation(); setDropdownOpen((p) => !p); };

  const all = Object.values(sessions);
  const pinned = all.filter((s) => s.pinned).reverse();
  const nonPinned = all.filter((s) => !s.pinned).reverse();
  const recent = nonPinned.slice(0, RECENT_LIMIT);
  const archived = nonPinned.slice(RECENT_LIMIT);

  const menuBtnStyle = {
    background: 'transparent', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', padding: '2px', borderRadius: '6px', display: 'flex',
    alignItems: 'center', flexShrink: 0,
  };
  const popStyle = {
    position: 'absolute', right: '8px', top: '30px', zIndex: 60,
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '10px', boxShadow: '0 8px 22px rgba(0,0,0,0.5)', padding: '4px',
    display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '130px',
  };
  const popItem = {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
    fontSize: '0.8rem', fontWeight: 600, background: 'transparent', border: 'none',
    color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '7px', textAlign: 'left',
  };

  const renderItem = (session) => (
    <div
      key={session.id}
      className={`chat-history-item ${currentChatId === session.id ? 'active' : ''}`}
      onClick={() => onSwitchSession(session.id)}
      style={{ position: 'relative' }}
    >
      {session.pinned ? <Pin size={13} className="chat-icon" /> : <MessageSquare size={14} className="chat-icon" />}
      <span className="chat-title">{session.title}</span>
      <button
        style={menuBtnStyle}
        title="Options"
        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === session.id ? null : session.id); }}
      >
        <MoreVertical size={15} />
      </button>
      {openMenuId === session.id && (
        <div style={popStyle} onClick={(e) => e.stopPropagation()}>
          <button style={popItem} onClick={() => { togglePin(session.id); setOpenMenuId(null); }}>
            {session.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            <span>{session.pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button style={{ ...popItem, color: '#f87171' }} onClick={() => { deleteSession(session.id); setOpenMenuId(null); }}>
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );

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
        <div className="section-header" style={{ position: 'relative' }}>
          <span className="section-title">Recent Chats</span>
          <button
            style={menuBtnStyle}
            title="Chat options"
            onClick={(e) => { e.stopPropagation(); setHeaderMenuOpen((p) => !p); }}
          >
            <MoreVertical size={16} />
          </button>
          {headerMenuOpen && (
            <div style={{ ...popStyle, top: '26px', minWidth: '180px' }} onClick={(e) => e.stopPropagation()}>
              <button style={popItem} onClick={() => { setArchiveOpen(true); setHeaderMenuOpen(false); }}>
                <Archive size={14} />
                <span>Archived chats ({archived.length})</span>
              </button>
              <button
                style={{ ...popItem, color: '#f87171' }}
                onClick={() => {
                  if (window.confirm('Saari conversations delete kar dein?')) clearAllSessions();
                  setHeaderMenuOpen(false);
                }}
              >
                <Trash2 size={14} />
                <span>Clear all conversations</span>
              </button>
            </div>
          )}
        </div>

        <div className="recent-chats-list" id="recentChatsList">
          {pinned.length > 0 && (
            <>
              <div className="chat-group-label">📌 Pinned</div>
              {pinned.map(renderItem)}
              <div className="chat-group-label" style={{ marginTop: '8px' }}>Recent</div>
            </>
          )}
          {recent.map(renderItem)}
          {all.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '12px 8px' }}>
              Koi chat nahi. "New Chat" se shuru karo.
            </div>
          )}
          {archived.length > 0 && (
            <button className="archive-link" onClick={() => setArchiveOpen(true)}>
              <Archive size={14} />
              <span>Archived chats ({archived.length})</span>
            </button>
          )}
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
              style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown-menu" style={{
              position: 'absolute', bottom: '70px', left: '16px', right: '16px',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', padding: '8px',
              zIndex: 100, display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              {user.isStaff && (
                <a
                  href="/admin-panel/"
                  onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/admin-panel/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '8px' }}
                  className="dropdown-item"
                >
                  <LayoutDashboard size={14} style={{ color: 'var(--accent-pink)' }} />
                  <span>Admin Panel</span>
                </a>
              )}
              {user.isStaff && <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />}
              <a
                href="/admin-panel/logout/"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', textDecoration: 'none', borderRadius: '8px' }}
                className="dropdown-item"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Archive Modal */}
      {archiveOpen && (
        <div className="archive-overlay" onClick={() => setArchiveOpen(false)}>
          <div className="archive-modal" onClick={(e) => e.stopPropagation()}>
            <div className="archive-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <Archive size={18} /> Archived Chats ({archived.length})
              </div>
              <button style={menuBtnStyle} onClick={() => setArchiveOpen(false)}><X size={18} /></button>
            </div>
            <div className="archive-modal-body">
              {archived.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>
                  Koi archived chat nahi. (16+ purani chats yahan aati hain.)
                </div>
              ) : (
                archived.map((s) => (
                  <div key={s.id} className="archive-row">
                    <MessageSquare size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span
                      className="archive-title"
                      onClick={() => { onSwitchSession(s.id); setArchiveOpen(false); }}
                    >
                      {s.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', flexShrink: 0 }}>{s.time}</span>
                    <button style={{ ...menuBtnStyle, color: '#f87171' }} title="Delete" onClick={() => deleteSession(s.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {archived.length > 0 && (
              <div className="archive-modal-footer">
                <button
                  className="btn-delete-all"
                  onClick={() => {
                    if (window.confirm('Saari archived chats delete kar dein?')) {
                      archived.forEach((s) => deleteSession(s.id));
                    }
                  }}
                >
                  <Trash2 size={14} /> Delete all archived
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
