'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, Archive, Palette, Info, Sun, Moon, Trash2,
  MessageSquare, Settings as SettingsIcon, User, Camera,
  Mail, Phone, MapPin, FileText, Lock, Star, Check, Shield,
  LogOut, Crown,
} from 'lucide-react';
import { getCsrfToken } from './utils/security';

const RECENT_LIMIT = 15;

export default function SettingsPage({
  sessions,
  onBack,
  onSwitchSession,
  deleteSession,
  theme,
  onToggleTheme,
  user,
  activePlan,
  onLogout,
  onUpgrade,
}) {
  const [active, setActive] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg('Image too large. Max 5MB.');
      return;
    }
    setAvatarUploading(true);
    try {
      const csrf = getCsrfToken();
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('/api/profile/avatar/', {
        method: 'POST',
        credentials: 'include',
        headers: csrf ? { 'X-CSRFToken': csrf } : {},
        body: fd,
      });
      const d = await res.json();
      if (d.success && d.avatar_url) {
        setProfile((prev) => ({ ...prev, avatar_url: d.avatar_url }));
        setSaveMsg('Photo updated!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg(d.error || 'Failed to upload photo.');
      }
    } catch {
      setSaveMsg('Network error uploading photo.');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/', { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setProfile(d);
        setFormName(d.name || '');
        setFormPhone(d.phone || '');
        setFormBio(d.bio || '');
        setFormLocation(d.location || '');
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAuthenticated) fetchProfile();
    else setLoading(false);
  }, [user, fetchProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const csrf = getCsrfToken();
      const res = await fetch('/api/profile/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRFToken': csrf } : {}),
        },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          bio: formBio,
          location: formLocation,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setSaveMsg('Profile updated successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg(d.error || 'Failed to update profile.');
      }
    } catch {
      setSaveMsg('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const nonPinned = Object.values(sessions).filter((s) => !s.pinned).reverse();
  const archived = nonPinned.slice(RECENT_LIMIT);

  const planLabel = activePlan?.plan_label || profile?.plan_label || 'Free Tier';
  const isPremium = activePlan?.active || profile?.is_premium;

  const NAV = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'archived', label: 'Archived Chats', icon: Archive },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'about', label: 'About', icon: Info },
  ];

  const avatarUrl = profile?.avatar_url || null;
  const initial = (formName || profile?.username || 'U')[0].toUpperCase();

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
          <span>Settings & Profile</span>
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
          {/* ────── PROFILE TAB ────── */}
          {active === 'profile' && (
            <div className="profile-tab">
              {/* Profile Card Header */}
              <div className="profile-header-card">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-large">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={formName || 'Avatar'} />
                    ) : (
                      <span className="profile-avatar-initial">{initial}</span>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={handleAvatarUpload}
                    />
                    <button
                      className="profile-avatar-edit"
                      title="Change Photo"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="profile-header-info">
                    <h2 className="profile-display-name">{formName || profile?.username || 'User'}</h2>
                    <p className="profile-email-display">{profile?.email || user?.email || ''}</p>
                    <span className={`profile-plan-badge ${isPremium ? 'premium' : 'free'}`}>
                      <Star size={12} /> {planLabel} {isPremium ? '' : '• Active'}
                    </span>
                  </div>
                </div>
                {!isPremium && (
                  <button className="profile-change-photo-btn" onClick={onUpgrade}>
                    <Crown size={14} /> Upgrade to Pro
                  </button>
                )}
              </div>

              {/* Personal Information Form */}
              <div className="profile-form-section">
                <h3 className="profile-section-title">
                  <User size={16} /> Personal Information
                </h3>

                <div className="profile-field">
                  <label className="profile-label">Full Name</label>
                  <div className="profile-input-wrapper">
                    <User size={16} className="profile-input-icon" />
                    <input
                      type="text"
                      className="profile-input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-label">
                    Email Address
                    <span className="profile-readonly-badge"><Lock size={10} /> READ-ONLY</span>
                  </label>
                  <div className="profile-input-wrapper readonly">
                    <Mail size={16} className="profile-input-icon" />
                    <input
                      type="email"
                      className="profile-input"
                      value={profile?.email || user?.email || ''}
                      readOnly
                      disabled
                    />
                    <Lock size={14} className="profile-lock-icon" />
                  </div>
                  <p className="profile-field-hint">Email is permanently linked to your account and cannot be changed.</p>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Location / Address</label>
                  <div className="profile-input-wrapper">
                    <MapPin size={16} className="profile-input-icon" />
                    <input
                      type="text"
                      className="profile-input"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Guwahati, Assam, India"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Phone / Mobile (Optional)</label>
                  <div className="profile-input-wrapper">
                    <Phone size={16} className="profile-input-icon" />
                    <input
                      type="tel"
                      className="profile-input"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label className="profile-label">Bio / About You</label>
                  <div className="profile-input-wrapper textarea">
                    <FileText size={16} className="profile-input-icon" style={{ alignSelf: 'flex-start', marginTop: '10px' }} />
                    <textarea
                      className="profile-input profile-textarea"
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="e.g. AI Explorer, Creator & Researcher"
                      rows={3}
                    />
                  </div>
                </div>

                {saveMsg && (
                  <div className={`profile-save-msg ${saveMsg.includes('success') ? 'success' : 'error'}`}>
                    {saveMsg.includes('success') ? <Check size={14} /> : null}
                    {saveMsg}
                  </div>
                )}

                <button
                  className="profile-save-btn"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <><Check size={16} /> Save Profile Changes</>
                  )}
                </button>
              </div>

              {/* Subscription & Plan Card */}
              <div className="profile-plan-section">
                <h3 className="profile-section-title">
                  <Star size={16} /> Subscription & Plan
                  <span className="profile-plan-active-badge">ACTIVE</span>
                </h3>

                <div className="profile-plan-card">
                  <h4 className="profile-plan-name">Axom AI {isPremium ? planLabel : 'Free'} Plan</h4>
                  <p className="profile-plan-desc">
                    {isPremium ? 'Premium access with enhanced features.' : 'Daily free allowance with standard model rotation.'}
                  </p>

                  <ul className="profile-plan-features">
                    <li><Check size={14} className="feature-check" /> Access to Axom 2.0 Pro model rotation</li>
                    <li><Check size={14} className="feature-check" /> Bilingual Assamese & English reasoning</li>
                    <li><Check size={14} className="feature-check" /> Document & PDF intelligence synthesis</li>
                    <li><Check size={14} className="feature-check" /> Live Web Search & real-time citations</li>
                    {!isPremium && (
                      <li className="feature-inactive"><span className="feature-circle" /> Standard generation speed</li>
                    )}
                  </ul>

                  {!isPremium && (
                    <button className="profile-upgrade-btn" onClick={onUpgrade}>
                      Upgrade to Axom Pro Plus
                    </button>
                  )}
                </div>
              </div>

              {/* Danger zone */}
              <div className="profile-danger-section">
                <div className="profile-danger-row" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>Sign Out of Axom AI</span>
                </div>
              </div>

              <p className="profile-version">Axom AI v2.0 • Neural Edition</p>
            </div>
          )}

          {/* ────── ARCHIVED CHATS TAB ────── */}
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

          {/* ────── APPEARANCE TAB ────── */}
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

          {/* ────── ABOUT TAB ────── */}
          {active === 'about' && (
            <div>
              <h2 className="settings-h2">About Axom AI</h2>
              <p className="settings-sub">Your multilingual AI assistant for Assam.</p>
              <div className="settings-about-card">
                <div className="settings-about-row"><span>Assistant</span><b>Axom AI</b></div>
                <div className="settings-about-row"><span>Languages</span><b>English, Assamese & Hindi</b></div>
                <div className="settings-about-row"><span>Knowledge base</span><b>Semantic search (MiniLM)</b></div>
                <div className="settings-about-row"><span>Chat history</span><b>Saved on server</b></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
