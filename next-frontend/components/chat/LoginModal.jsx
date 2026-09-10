'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getCsrfToken } from './utils/security';

function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return '';
  try {
    let devId = localStorage.getItem('axom_device_uid');
    if (!devId) {
      devId = 'axom_dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('axom_device_uid', devId);
    }
    return devId;
  } catch (e) {
    return '';
  }
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  title = "Sign In to Axom AI",
  subtitle = "Unlock unlimited intelligence, personalized chats, and fast web search."
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setIsDeviceBlocked(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(data);
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        setErrorMsg(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setIsDeviceBlocked(false);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const deviceId = getOrCreateDeviceId();

    try {
      const res = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
          confirm_password: confirmPassword,
          device_id: deviceId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(data);
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        if (data.code === 'DEVICE_REGISTRATION_RESTRICTED') {
          setIsDeviceBlocked(true);
        }
        setErrorMsg(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please verify your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="loginModal">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {/* Mode Switch Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'login' ? 'var(--primary-color, #10a37f)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
              fontWeight: mode === 'login' ? '600' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'register' ? 'var(--primary-color, #10a37f)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
              fontWeight: mode === 'register' ? '600' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Create Account
          </button>
        </div>

        <div className="modal-header">
          <div className="modal-icon">
            {mode === 'login' ? <Lock size={20} /> : <UserPlus size={20} />}
          </div>
          <h2 className="modal-title">
            {mode === 'login' ? title : "Create Axom AI Account"}
          </h2>
          <p className="modal-subtitle">
            {mode === 'login'
              ? subtitle
              : "Fair use policy: Strictly 1 account permitted per device / IP."}
          </p>
        </div>

        {errorMsg && (
          <div id="modalError" className="modal-error" style={{
            fontSize: '12px',
            lineHeight: '1.45',
            padding: '10px 14px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: isDeviceBlocked ? '1px solid rgba(239, 68, 68, 0.4)' : undefined,
            background: isDeviceBlocked ? 'rgba(239, 68, 68, 0.1)' : undefined
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
              <span>{errorMsg}</span>
            </div>
            {isDeviceBlocked && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                style={{
                  marginTop: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Sign in to your existing account →
              </button>
            )}
          </div>
        )}

        {mode === 'login' ? (
          <form id="modalLoginForm" className="modal-form" onSubmit={handleLogin}>
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="modalUsername">Username</label>
              <input
                type="text"
                id="modalUsername"
                className="modal-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="modalPassword">Password</label>
              <input
                type="password"
                id="modalPassword"
                className="modal-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-modal-submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In & Continue'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color, #10a37f)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Create one (1 per device)
              </button>
            </div>
          </form>
        ) : (
          <form id="modalRegisterForm" className="modal-form" onSubmit={handleRegister}>
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="regUsername">Username *</label>
              <input
                type="text"
                id="regUsername"
                className="modal-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username (e.g. kalyan_99)"
                required
                disabled={isLoading || isDeviceBlocked}
                autoFocus
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="regEmail">Email (Optional)</label>
              <input
                type="email"
                id="regEmail"
                className="modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isLoading || isDeviceBlocked}
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="regPassword">Password *</label>
              <input
                type="password"
                id="regPassword"
                className="modal-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                disabled={isLoading || isDeviceBlocked}
              />
            </div>
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="regConfirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="regConfirmPassword"
                className="modal-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                minLength={6}
                disabled={isLoading || isDeviceBlocked}
              />
            </div>

            <button
              type="submit"
              className="btn-modal-submit"
              disabled={isLoading || isDeviceBlocked}
            >
              {isLoading ? 'Creating account...' : 'Create Account & Sign In'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
              Already registered on this device?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color, #10a37f)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
