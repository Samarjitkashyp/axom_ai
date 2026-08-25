import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import { getCsrfToken } from '../utils/security';

export default function LoginModal({
  isOpen,
  onClose,
  title = "Limit Reached",
  subtitle = "You have used your free daily limit of 5,000 words. Please log in to unlock unlimited access."
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
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
        window.location.reload();
      } else {
        setErrorMsg(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="loginModal">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Lock size={20} />
          </div>
          <h2 className="modal-title">{title}</h2>
          <p className="modal-subtitle">{subtitle}</p>
        </div>

        {errorMsg && (
          <div id="modalError" className="modal-error">
            {errorMsg}
          </div>
        )}

        <form id="modalLoginForm" className="modal-form" onSubmit={handleSubmit}>
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
        </form>
      </div>
    </div>
  );
}
