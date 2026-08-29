import React, { useState, useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Sliders, Send, Globe, Copy, Check, AlertTriangle, FileText, Mic, Volume2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatMarkdown } from '../utils/format';
import { getCsrfToken } from '../utils/security';

export default function ChatWindow({
  currentSession,
  onSendMessage,
  onAddMessage,
  user,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  theme,
  onToggleTheme,
  remainingWords,
  deductWords,
  onUpgrade,
}) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState(null);
  const [streamingSources, setStreamingSources] = useState([]);
  const [streamingModel, setStreamingModel] = useState('');
  const [streamingFromDb, setStreamingFromDb] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  // Axom AI is Assamese-only: replies are always in Assamese regardless of input language.
  const [language] = useState('assamese');

  const [isListening, setIsListening] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const recognitionRef = useRef(null);

  const langCode = () =>
    (language === 'english' ? 'en-IN' : language === 'assamese' ? 'as-IN' : 'hi-IN');

  // Voice input via the browser Web Speech API.
  const startVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Aapke browser me voice input support nahi hai. Chrome try karein.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const rec = new SR();
    rec.lang = langCode();
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInputText((prev) => (prev ? prev + ' ' : '') + text);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    setIsListening(true);
    rec.start();
  };

  // Read an answer aloud (browser TTS). Assamese voice depends on the device.
  const speak = (text, index) => {
    if (!window.speechSynthesis) return;
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[#*`>_]/g, ''));
    u.lang = langCode();
    u.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(u);
  };

  const sendFeedback = (question, answer, rating, index) => {
    setFeedbackGiven((prev) => ({ ...prev, [index]: rating }));
    fetch('/api/feedback/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() || '' },
      body: JSON.stringify({ question, answer, rating, language }),
    }).catch(() => {});
  };

  const abortControllerRef = useRef(null);
  const mainBodyRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages change or streaming updates
  const scrollToBottom = () => {
    if (mainBodyRef.current) {
      mainBodyRef.current.scrollTop = mainBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, streamingText, isLoading, errorMsg]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Keyboard shortcut Ctrl+K to focus input textarea
  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    if (remainingWords <= 0 && !user.isAuthenticated) {
      setInputText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      onUpgrade();
      return;
    }

    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setErrorMsg(null);

    // Calculate prompt words and deduct
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    deductWords(wordCount);

    // If no active session, trigger creation on parent
    let sessionId = currentSession?.id;
    if (!sessionId) {
      sessionId = onSendMessage(text);
    } else {
      onAddMessage(sessionId, 'user', text);
    }

    setIsLoading(true);

    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          prompt: text,
          web_search: false,
          session_id: sessionId,
          language,
          history: (currentSession?.messages || [])
            .slice(-20)
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      // --- Streaming path (local Ollama or Gemini): tokens arrive live ---
      if (res.ok && res.headers.get('X-Engine') && res.body) {
        const fromDb = res.headers.get('X-From-Database') === 'true';
        setStreamingSources([]);
        setStreamingModel('Axom AI');
        setStreamingFromDb(fromDb);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            full += chunk;
            setStreamingText(full); // pehla token aate hi dots hat kar text dikhne lagta hai
          }
        }

        if (full.trim().length === 0) {
          setErrorMsg('Axom AI se koi response nahi mila.');
          setStreamingText(null);
          setIsLoading(false);
          return;
        }

        const aiWords = full.split(/\s+/).filter(w => w.length > 0).length;
        deductWords(aiWords);
        onAddMessage(sessionId, 'assistant', full, 'Axom AI', {
          web_search: false,
          sources: [],
          from_database: fromDb,
        });
        setStreamingText(null);
        setStreamingSources([]);
        setIsLoading(false);
        return;
      }

      // --- Non-streaming path (Gemini / web search): full JSON, then typewriter ---
      const data = await res.json();

      if (res.ok && data.response) {
        const aiWords = data.response.split(/\s+/).filter(w => w.length > 0).length;
        deductWords(aiWords);

        // Start client-side typewriter simulation
        let i = 0;
        setStreamingText('');
        setStreamingSources(data.sources || []);
        setStreamingModel(data.model || 'Axom AI');
        setStreamingFromDb(!!data.from_database);

        const responseText = data.response;
        const intervalId = setInterval(() => {
          if (i < responseText.length) {
            setStreamingText(responseText.substring(0, i + 2));
            i += 2;
          } else {
            clearInterval(intervalId);
            // Save final message to state
            onAddMessage(sessionId, 'assistant', responseText, 'Axom AI', {
              web_search: data.web_search,
              sources: data.sources,
              from_database: data.from_database,
            });
            setStreamingText(null);
            setStreamingSources([]);
            setIsLoading(false);
          }
        }, 6);
      } else {
        const err = data.error || 'Failed to get response from Axom AI.';
        setErrorMsg(err);
        setIsLoading(false);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Connection error.');
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  return (
    <main className="main-content">
      {/* Top Header Bar */}
      <header className="top-header">
        <div className="header-left">
          <button className="icon-btn toggle-sidebar" onClick={onToggleLeftSidebar} title="Toggle Sidebar">
            <Menu size={20} />
          </button>
        </div>

        <div className="header-right">
          <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="icon-btn toggle-sidebar" onClick={onToggleRightSidebar} title="Toggle Control Panel">
            <Sliders size={20} />
          </button>
        </div>
      </header>

      {/* Dashboard Body / Dynamic Chat View Container */}
      <div className="main-body" id="mainBody" ref={mainBodyRef}>
        {!currentSession || currentSession.messages.length === 0 ? (
          /* Initial Welcome / Hero View */
          <div className="hero-container" id="heroContainer">
            <div className="hero-greeting">
              <h1 className="greeting-title">
                {user.isAuthenticated ? `Hi ${user.username}!` : "Hi, I'm Axom AI"}
                <span className="wave-emoji">👋</span>
              </h1>
              <p className="greeting-subtitle">How can I help you today?</p>
            </div>

            {/* Glowing Center Orb & Visual Graphic */}
            <div className="orb-hero-visual">
              <div className="orb-container">
                <div className="orb-glow-layer"></div>
                <div className="orb-core">
                  <div className="orb-swirl"></div>
                </div>
                <div className="orb-particles"></div>
              </div>
              <h2 className="hero-tagline" style={{ fontSize: '0.98rem', maxWidth: '620px', lineHeight: 1.5, opacity: 0.85, margin: '20px auto 0' }}>
                I'm your AI assistant for <span className="gradient-text">everything about Assam</span> — its history, culture, festivals, tourism, food and people. Ask me in English, Hindi or Hinglish, and I'll always reply in <span className="gradient-text">Assamese (অসমীয়া)</span>.
              </h2>
            </div>
          </div>
        ) : (
          /* Chat Messages Feed */
          <div className="chat-messages-container" id="chatMessagesContainer">
            {currentSession.messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                {msg.role === 'user' ? (
                  <>
                    <div className="msg-body">{msg.text}</div>
                    <div className="msg-avatar">{user.username ? user.username.substring(0, 2).toUpperCase() : 'US'}</div>
                  </>
                ) : (
                  <>
                    <div className="msg-avatar">✦</div>
                    <div className="msg-body" style={{ position: 'relative', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)' }}>{msg.model || 'Axom AI'}</span>
                          {msg.from_database && (
                            <span style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.66rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                              📁 Database Match
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            className="btn-copy-msg"
                            onClick={() => speak(msg.text, index)}
                            style={{ background: 'transparent', border: 'none', color: speakingIndex === index ? 'var(--accent-pink)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                            title="Read aloud"
                          >
                            <Volume2 size={13} />
                          </button>
                          <button
                            className="btn-copy-msg"
                            onClick={() => handleCopy(msg.text, index)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontFamily: 'inherit', transition: 'color 0.2s' }}
                            title="Copy to clipboard"
                          >
                            {copiedMessageIndex === index ? (
                              <>
                                <Check size={12} style={{ color: '#4ade80' }} />
                                <span style={{ color: '#4ade80' }}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="msg-text-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />

                      {/* Feedback (👍 / 👎) — helps improve the knowledge base */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                        {feedbackGiven[index] ? (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {feedbackGiven[index] === 'up' ? '👍 Thanks!' : '👎 Thanks — we\'ll improve this.'}
                          </span>
                        ) : (
                          <>
                            <button
                              title="Helpful"
                              onClick={() => sendFeedback(currentSession.messages[index - 1]?.text || '', msg.text, 'up', index)}
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '7px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              title="Not helpful"
                              onClick={() => sendFeedback(currentSession.messages[index - 1]?.text || '', msg.text, 'down', index)}
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '7px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Render sources and references */}
                      {msg.web_search && msg.sources && msg.sources.length > 0 && (
                        <div className="web-sources-container" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={12} />
                            <span>Sources & References</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {msg.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-link"
                                style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textDecoration: 'none', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                              >
                                <span>{src.title || src.uri}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Typewriter streaming message */}
            {streamingText !== null && (
              <div className="message-bubble assistant">
                <div className="msg-avatar">✦</div>
                <div className="msg-body" style={{ position: 'relative', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)' }}>{streamingModel}</span>
                      {streamingFromDb && (
                        <span style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.66rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                          📁 Database Match
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="msg-text-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(streamingText) }} />
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && streamingText === null && (
              <div className="message-bubble assistant">
                <div className="msg-avatar">✦</div>
                <div className="msg-body">
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)', marginBottom: '6px' }}>Axom AI</div>
                  <div className="typing-dots" aria-label="Axom AI is typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="message-bubble assistant">
                <div className="msg-avatar" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                  <AlertTriangle size={14} />
                </div>
                <div className="msg-body">
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>Error</div>
                  <span style={{ color: '#f87171' }}>⚠️ {errorMsg}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Chat Input Area */}
      <div className="chat-input-area">
        <div className="input-card">
          <div className="input-row">
            <textarea
              className="chat-textarea"
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Axom AI..."
              rows={1}
              disabled={isLoading}
            />
          </div>
          <div className="input-controls-row">
            <div className="controls-left">
              <div className="lang-selector" title="Replies are always in Assamese">
                <span className="lang-btn active" style={{ cursor: 'default' }}>
                  ⇄ Reply in অসমীয়া
                </span>
              </div>
            </div>
            <div className="controls-right">
              <button
                className={`btn-mic ${isListening ? 'listening' : ''}`}
                onClick={startVoiceInput}
                title={isListening ? 'Listening… tap to stop' : 'Voice input'}
              >
                <Mic size={15} />
              </button>
              <button
                className="btn-send-message"
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                title="Send Message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="input-disclaimer">
          Axom AI can make mistakes. Please verify important information.
        </div>
      </div>
    </main>
  );
}
