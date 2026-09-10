'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Lock, UserPlus, ShieldAlert } from 'lucide-react';
import { getCsrfToken } from './utils/security';

const GOOGLE_CLIENT_ID = "514662966676-fo4atqrjblkn8sadd2t0enhqi5mch5aq.apps.googleusercontent.com";

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

  // Google Credential Callback
  const handleGoogleCredentialResponse = useCallback(async (response) => {
    if (!response?.credential) return;
    setIsLoading(true);
    setErrorMsg(null);
    setIsDeviceBlocked(false);

    const deviceId = getOrCreateDeviceId();

    try {
      const res = await fetch('/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({
          credential: response.credential,
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
        setErrorMsg(data.error || 'Google authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Connection error during Google authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onLoginSuccess, onClose]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const setupGoogle = () => {
      if (!mounted || typeof window === 'undefined' || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnContainer = document.getElementById('googleGsiBtnContainer');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          const targetWidth = Math.min(Math.max(btnContainer.offsetWidth || 340, 240), 380);
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            width: targetWidth,
            text: mode === 'login' ? 'signin_with' : 'signup_with',
            logo_alignment: 'left',
          });
        }
      } catch (e) {
        console.warn('Google GSI initialization error:', e);
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          setupGoogle();
        }
      }, 150);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      mounted = false;
    };
  }, [isOpen, mode, handleGoogleCredentialResponse]);

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
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {/* Mode Switch Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '18px',
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

        <div className="modal-header" style={{ marginBottom: '16px' }}>
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

        {/* --- GOOGLE ONE-CLICK SIGN IN / SIGN UP BUTTON (Mobile & Desktop) --- */}
        <div style={{ marginBottom: '14px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div
            id="googleGsiBtnContainer"
            style={{
              width: '100%',
              minHeight: '44px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Initial button displayed while Google Identity script initializes */}
            <button
              type="button"
              disabled={isLoading || (mode === 'register' && isDeviceBlocked)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#f8fafc',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: (mode === 'register' && isDeviceBlocked) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, rgba(255, 255, 255, 0.1))' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', letterSpacing: '0.04em' }}>
            OR
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, rgba(255, 255, 255, 0.1))' }} />
        </div>

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

            <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
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

            <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
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
