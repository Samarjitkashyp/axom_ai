'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, MessageSquare, LogOut,
  MoreVertical, Pin, PinOff, Trash2, Settings as SettingsIcon, FileText, X, Wrench, GraduationCap
} from 'lucide-react';

const RECENT_LIMIT = 20;

const FOLDERS = [
  { id: 'all', label: 'All' },
  { id: 'study', label: '📚 Study' },
  { id: 'coding', label: '💻 Code' },
  { id: 'assam_gk', label: '🏛️ GK' },
  { id: 'work', label: '🏢 Work' },
  { id: 'personal', label: '💡 Personal' },
];

export default function SidebarLeft({
  sessions,
  currentChatId,
  onSwitchSession,
  onNewChat,
  isCollapsed,
  user,
  deleteSession,
  togglePin,
  tagSession,
  clearAllSessions,
  onOpenSettings,
  onOpenDocConverter,
  onOpenTools,
  onOpenUpgrade,
  onTriggerLogin,
  onCloseSidebar,
  onLogout,
}) {
  const [menuFor, setMenuFor] = useState(null); // { id, top, left } — fixed-positioned
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [toolsCount, setToolsCount] = useState(34);
  const [selectedFolder, setSelectedFolder] = useState('all');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/tools/')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.total !== undefined && isMounted) {
          setToolsCount(d.total);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const closeAll = () => { setMenuFor(null); setHeaderMenuOpen(false); };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const openItemMenu = (e, id) => {
    e.stopPropagation();
    if (menuFor && menuFor.id === id) { setMenuFor(null); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const MENU_H = 140;
    const top = (window.innerHeight - r.bottom < MENU_H) ? r.top - MENU_H : r.bottom + 4;
    setMenuFor({ id, top, left: Math.max(8, r.right - 165) });
  };

  const all = Object.values(sessions);
  const filtered = selectedFolder === 'all' 
    ? all 
    : all.filter((s) => s.tag === selectedFolder);

  const pinned = filtered.filter((s) => s.pinned).reverse();
  const nonPinned = filtered.filter((s) => !s.pinned).reverse();
  const recent = nonPinned.slice(0, RECENT_LIMIT);
  const archivedCount = nonPinned.length - recent.length;

  const menuBtnStyle = {
    background: 'transparent', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', padding: '2px', borderRadius: '6px', display: 'flex',
    alignItems: 'center', flexShrink: 0,
  };
  const popStyle = {
    position: 'absolute', right: '8px', top: '30px', zIndex: 60,
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '10px', boxShadow: '0 8px 22px rgba(0,0,0,0.5)', padding: '4px',
    display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '150px',
  };
  const popItem = {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
    fontSize: '0.8rem', fontWeight: 600, background: 'transparent', border: 'none',
    color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '7px', textAlign: 'left',
  };

  const getTagBadge = (tag) => {
    const f = FOLDERS.find((item) => item.id === tag);
    if (!f || f.id === 'all') return null;
    return (
      <span
        style={{
          fontSize: '0.62rem',
          padding: '1px 5px',
          borderRadius: '4px',
          background: 'rgba(52, 211, 153, 0.12)',
          color: '#34d399',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          marginLeft: 'auto',
          marginRight: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {f.label}
      </span>
    );
  };

  const renderItem = (session) => (
    <div
      key={session.id}
      className={`chat-history-item ${currentChatId === session.id ? 'active' : ''}`}
      onClick={() => {
        onSwitchSession(session.id);
        if (window.innerWidth <= 850) onCloseSidebar?.();
      }}
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
    >
      {session.pinned ? <Pin size={13} className="chat-icon" /> : <MessageSquare size={14} className="chat-icon" />}
      <span className="chat-title" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.title}
      </span>
      {session.tag && getTagBadge(session.tag)}
      <button style={menuBtnStyle} title="Options" onClick={(e) => openItemMenu(e, session.id)}>
        <MoreVertical size={15} />
      </button>
    </div>
  );

  const menuSession = menuFor ? sessions[menuFor.id] : null;

  return (
    <aside className={`sidebar-left ${isCollapsed ? 'collapsed' : ''}`} id="sidebarLeft">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo">
          <svg className="brand-sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#sparkle_grad)" />
            <defs>
              <linearGradient id="sparkle_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-name">Axom AI</span>
        </div>
        <button
          className="sidebar-mobile-close-btn"
          onClick={onCloseSidebar}
          title="Close Sidebar"
          aria-label="Close Sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* New Chat & Tool Buttons */}
      <div className="new-chat-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          className="btn-new-chat"
          onClick={() => {
            onNewChat();
            if (window.innerWidth <= 850) onCloseSidebar?.();
          }}
          id="btnNewChat"
        >
          <Plus size={16} className="btn-icon" />
          <span className="btn-text">New Chat</span>
          <span className="shortcut-badge">Ctrl+K</span>
        </button>
        <a
          className="sidebar-tools-btn"
          href="https://aiaxom.co.in/tools/ai-notes-generator"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (window.innerWidth <= 850) onCloseSidebar?.();
          }}
          title="AI Notes Generator — Create High-Scoring Study Notes from PDFs & Books"
          style={{
            textDecoration: 'none',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 185, 129, 0.08))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={15} style={{ color: '#fbbf24' }} />
            <span>AI Notes Gen</span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #f59e0b, #10b981)',
              color: '#fff',
              letterSpacing: '0.04em',
            }}
          >
            NEW ⭐
          </span>
        </a>
        <a
          className="sidebar-tools-btn"
          href="https://aiaxom.co.in/tools"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (window.innerWidth <= 850) onCloseSidebar?.();
          }}
          title={`Open AI Tools & Document Studio (${toolsCount} Tools)`}
          style={{ textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={15} style={{ color: '#34d399' }} />
            <span>Tools & Studio</span>
          </div>
          <span className="tools-badge">{toolsCount}</span>
        </a>
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
            <div style={{ ...popStyle, top: '26px', minWidth: '190px' }} onClick={(e) => e.stopPropagation()}>
              {user.isAuthenticated && (
                <button style={popItem} onClick={() => { onOpenSettings(); setHeaderMenuOpen(false); }}>
                  <SettingsIcon size={14} />
                  <span>Settings</span>
                </button>
              )}
              <button
                style={{ ...popItem, color: '#f87171' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all conversations?')) clearAllSessions();
                  setHeaderMenuOpen(false);
                }}
              >
                <Trash2 size={14} />
                <span>Clear all conversations</span>
              </button>
            </div>
          )}
        </div>

        {/* Organized Folders / Tags Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            padding: '4px 8px 8px 8px',
            scrollbarWidth: 'none',
          }}
          className="folder-tabs-bar"
        >
          {FOLDERS.map((f) => {
            const isSel = selectedFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: isSel ? 700 : 500,
                  border: isSel ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--border-color)',
                  background: isSel ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: isSel ? '#34d399' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            );
          })}
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
            <div className="empty-chats-box" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '16px 8px', textAlign: 'center', lineHeight: 1.5 }}>
              <div style={{ marginBottom: '4px', opacity: 0.6 }}>💬</div>
              No conversations yet.<br />Start one with "New Chat".
            </div>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      {user.isAuthenticated && (
        <div className="user-profile-container" style={{ width: '100%' }}>
          <div className="user-profile-card" style={{ cursor: 'default' }}>
            <div className="user-avatar-wrapper" style={{ position: 'relative' }}>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl.startsWith('//media/') ? user.avatarUrl.slice(1) : user.avatarUrl}
                  alt={user.username}
                  className="user-avatar"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.user-avatar-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className="user-avatar-fallback"
                style={{
                  display: user.avatarUrl ? 'none' : 'flex',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {(user.name || user.username || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="user-info" style={{ flex: 1 }}>
              <span className="user-name">{user.name || user.username}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>
                {user.planLabel || 'Free Tier'}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenSettings();
                if (window.innerWidth <= 850) onCloseSidebar?.();
              }}
              title="Settings & Profile"
              aria-label="Settings & Profile"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '6px', borderRadius: '8px',
                transition: 'color 0.2s',
              }}
              className="sidebar-settings-btn"
            >
              <SettingsIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); if (onLogout) onLogout(); }}
              title="Sign Out"
              aria-label="Sign Out"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '6px', borderRadius: '8px',
                transition: 'color 0.2s',
              }}
              className="logout-inline-btn"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Non-authenticated prompt card */}
      {!user.isAuthenticated && (
        <div style={{ padding: '8px 4px', marginTop: 'auto', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Sign in to save chats</div>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Sync history & unlock full models</div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onTriggerLogin) {
                onTriggerLogin();
              } else {
                onOpenUpgrade();
              }
              if (window.innerWidth <= 850) onCloseSidebar?.();
            }}
            style={{
              width: '100%', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #34d399, #fbbf24)',
              color: '#0b1220', fontWeight: 700, fontSize: '0.80rem',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(52, 211, 153, 0.3)'
            }}
          >
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Per-chat menu — fixed positioning so it is never clipped by the list scroll */}
      {menuFor && menuSession && (
        <div
          style={{
            position: 'fixed', top: menuFor.top, left: menuFor.left, zIndex: 1000,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '10px', boxShadow: '0 8px 22px rgba(0,0,0,0.55)', padding: '6px',
            display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '160px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button style={popItem} onClick={() => { togglePin(menuFor.id); setMenuFor(null); }}>
            {menuSession.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            <span>{menuSession.pinned ? 'Unpin' : 'Pin'}</span>
          </button>
          
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '2px 8px', fontWeight: 600 }}>
            ASSIGN TAG / FOLDER
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', padding: '2px 4px' }}>
            {FOLDERS.filter(f => f.id !== 'all').map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  tagSession?.(menuFor.id, menuSession.tag === f.id ? null : f.id);
                  setMenuFor(null);
                }}
                style={{
                  fontSize: '0.68rem',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  border: menuSession.tag === f.id ? '1px solid #34d399' : '1px solid var(--border-color)',
                  background: menuSession.tag === f.id ? 'rgba(52,211,153,0.15)' : 'transparent',
                  color: menuSession.tag === f.id ? '#34d399' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />
          <button style={{ ...popItem, color: '#f87171' }} onClick={() => { deleteSession(menuFor.id); setMenuFor(null); }}>
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </aside>
  );
}
