import React, { useState } from 'react';
import {
  ChevronLeft, Archive, Palette, Info, Sun, Moon, Trash2,
  MessageSquare, Settings as SettingsIcon,
} from 'lucide-react';

const RECENT_LIMIT = 15;

export default function SettingsPage({
  sessions,
  onBack,
  onSwitchSession,
  deleteSession,
  theme,
  onToggleTheme,
}) {
  const [active, setActive] = useState('archived');

  const nonPinned = Object.values(sessions).filter((s) => !s.pinned).reverse();
  const archived = nonPinned.slice(RECENT_LIMIT);

  const NAV = [
    { key: 'archived', label: 'Archived Chats', icon: Archive },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="settings-page">
      {/* Top bar */}
      <header className="settings-topbar">
        <button className="settings-back-btn" onClick={onBack}>
          <ChevronLeft size={16} />
          <span>Back to Chat</span>
        </button>
        <div className="settings-topbar-title">
          <SettingsIcon size={18} />
          <span>Settings</span>
        </div>
        <div style={{ width: '120px' }} />
      </header>

      {/* Body: nav + content */}
      <div className="settings-body">
        <nav className="settings-nav">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`settings-nav-item ${active === key ? 'active' : ''}`}
              onClick={() => setActive(key)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="settings-content">
          {active === 'archived' && (
            <div>
              <div className="settings-section-head">
                <div>
                  <h2 className="settings-h2">Archived Chats</h2>
                  <p className="settings-sub">
                    Conversations older than your 15 most recent are automatically archived here. Click to open.
                  </p>
                </div>
                {archived.length > 0 && (
                  <button
                    className="btn-delete-all"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete all archived chats?')) {
                        archived.forEach((s) => deleteSession(s.id));
                      }
                    }}
                  >
                    <Trash2 size={14} /> Delete all
                  </button>
                )}
              </div>

              {archived.length === 0 ? (
                <div className="settings-empty">
                  <Archive size={40} style={{ opacity: 0.4 }} />
                  <p>No archived chats yet.</p>
                  <span>When you have more than 15 conversations, older ones will appear here.</span>
                </div>
              ) : (
                <div className="archive-grid">
                  {archived.map((s) => (
                    <div key={s.id} className="archive-card">
                      <div
                        className="archive-card-main"
                        onClick={() => { onSwitchSession(s.id); onBack(); }}
                      >
                        <div className="archive-card-icon"><MessageSquare size={16} /></div>
                        <div className="archive-card-text">
                          <span className="archive-card-title">{s.title}</span>
                          <span className="archive-card-time">
                            {s.time} · {(s.messages || []).length} messages
                          </span>
                        </div>
                      </div>
                      <button
                        className="archive-card-del"
                        title="Delete"
                        onClick={() => deleteSession(s.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {active === 'appearance' && (
            <div>
              <h2 className="settings-h2">Appearance</h2>
              <p className="settings-sub">Choose your preferred theme — saved automatically to your device.</p>
              <div className="settings-row">
                <div className="settings-row-left">
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  <div>
                    <div className="settings-row-title">Theme</div>
                    <div className="settings-row-desc">Current: {theme === 'dark' ? 'Dark' : 'Light'} mode</div>
                  </div>
                </div>
                <button className="settings-toggle-btn" onClick={onToggleTheme}>
                  {theme === 'dark' ? <><Sun size={15} /> Light</> : <><Moon size={15} /> Dark</>}
                </button>
              </div>
            </div>
          )}

          {active === 'about' && (
            <div>
              <h2 className="settings-h2">About Axom AI</h2>
              <p className="settings-sub">Your multilingual AI assistant for Assam.</p>
              <div className="settings-about-card">
                <div className="settings-about-row"><span>Assistant</span><b>Axom AI</b></div>
                <div className="settings-about-row"><span>Languages</span><b>English, Assamese & Hindi</b></div>
                <div className="settings-about-row"><span>Knowledge base</span><b>Semantic search (bge-m3)</b></div>
                <div className="settings-about-row"><span>Chat history</span><b>Saved on server</b></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
