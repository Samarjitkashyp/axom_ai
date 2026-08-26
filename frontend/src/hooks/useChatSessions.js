import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/security';

export function useChatSessions() {
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem('axom_ai_sessions');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Could not parse sessions from localStorage:", e);
      return {};
    }
  });

  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('axom_ai_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error("Could not write sessions to localStorage:", e);
    }
  }, [sessions]);

  // On startup, merge in this browser-session's server-saved chat history.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/history/', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.sessions)) return;
        setSessions((prev) => {
          const merged = { ...prev };
          data.sessions.forEach((s) => {
            merged[s.id] = {
              id: s.id,
              title: s.title,
              time: s.time,
              pinned: !!s.pinned,
              messages: s.messages || [],
            };
          });
          return merged;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const postAction = (body) =>
    fetch('/api/history/action/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() || '' },
      body: JSON.stringify(body),
    }).catch(() => {});

  const startNewSession = (firstPrompt) => {
    const sessionId = 'chat_' + Date.now();
    const shortTitle = firstPrompt.length > 28 ? firstPrompt.substring(0, 28) + '...' : firstPrompt;
    setSessions((prev) => ({
      ...prev,
      [sessionId]: { id: sessionId, title: shortTitle, time: 'Just now', pinned: false, messages: [] },
    }));
    setCurrentChatId(sessionId);
    return sessionId;
  };

  const addMessageToSession = (sessionId, role, text, model = 'Axom AI', extra = {}) => {
    setSessions((prev) => {
      const session = prev[sessionId];
      if (!session) return prev;
      return {
        ...prev,
        [sessionId]: { ...session, messages: [...session.messages, { role, text, model, ...extra }] },
      };
    });
  };

  const resetCurrentSession = () => setCurrentChatId(null);

  const deleteSession = (id) => {
    setSessions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setCurrentChatId((cur) => (cur === id ? null : cur));
    postAction({ action: 'delete', session_id: id });
  };

  const togglePin = (id) => {
    setSessions((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], pinned: !prev[id].pinned } } : prev));
    postAction({ action: 'pin', session_id: id });
  };

  const clearAllSessions = () => {
    setSessions({});
    setCurrentChatId(null);
    postAction({ action: 'clear' });
  };

  return {
    sessions,
    currentChatId,
    setCurrentChatId,
    startNewSession,
    addMessageToSession,
    resetCurrentSession,
    deleteSession,
    togglePin,
    clearAllSessions,
  };
}
