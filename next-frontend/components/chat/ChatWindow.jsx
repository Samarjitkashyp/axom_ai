'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Sun, Moon, Sliders, Send, Globe, Copy, Check, AlertTriangle,
  FileText, Mic, Volume2, ThumbsUp, ThumbsDown, Paperclip, Download,
  ExternalLink, Loader2, Sparkles, FileUp, Wrench
} from 'lucide-react';
import { formatMarkdown } from './utils/format';
import { getCsrfToken } from './utils/security';

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
  onOpenDocConverterModal,
  onOpenTools,
}) {
  const [inputText, setInputText] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [searchPhase, setSearchPhase] = useState(0); // 0 = Searching the web, 1 = Reading sources, 2 = Synthesizing
  const [isLoading, setIsLoading] = useState(false);
  const [isConvertingDoc, setIsConvertingDoc] = useState(false);
  const [convertingFileName, setConvertingFileName] = useState('');
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [streamingText, setStreamingText] = useState(null);
  const [streamingSources, setStreamingSources] = useState([]);
  const [streamingModel, setStreamingModel] = useState('');
  const [streamingFromDb, setStreamingFromDb] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  // Axom AI is Assamese-only: replies are always in Assamese regardless of input language.
  const [language] = useState('assamese');

  // Progressive ChatGPT-style search status step timer
  useEffect(() => {
    if (!isWebSearching || !isLoading) {
      setSearchPhase(0);
      return;
    }
    const t1 = setTimeout(() => setSearchPhase(1), 1200);
    const t2 = setTimeout(() => setSearchPhase(2), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isWebSearching, isLoading]);

  const [isListening, setIsListening] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const recognitionRef = useRef(null);
  const docFileInputRef = useRef(null);

  const langCode = () =>
    (language === 'english' ? 'en-IN' : language === 'assamese' ? 'as-IN' : 'hi-IN');

  const handleDocUpload = async (file) => {
    if (!file) return;
    const allowed = ['.docx', '.doc', '.txt', '.rtf', '.md'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setErrorMsg(`Unsupported file type: ${ext}. Please upload a .docx, .doc, or .txt file.`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB limit.');
      return;
    }

    setErrorMsg(null);
    setIsConvertingDoc(true);
    setConvertingFileName(file.name);

    let sessionId = currentSession?.id;
    if (!sessionId) {
      sessionId = onSendMessage(`📄 Convert Document: ${file.name}`);
    } else {
      onAddMessage(sessionId, 'user', `📄 Convert Document: ${file.name}`);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/convert-doc/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert document.');
      }

      onAddMessage(
        sessionId,
        'assistant',
        `আপোনাৰ নথিপত্ৰখন (**${data.original_name}**) সফলতাৰে PDF লৈ ৰূপান্তৰ কৰা হৈছে। তলৰ বুটামৰ পৰা আপুনি PDF ডাউনলোড বা প্ৰিভিউ কৰিব পাৰে:`,
        'Doc to PDF Converter',
        {
          doc_conversion: data,
        }
      );
    } catch (err) {
      setErrorMsg(`Document conversion error: ${err.message}`);
    } finally {
      setIsConvertingDoc(false);
      setConvertingFileName('');
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingDoc) setIsDraggingDoc(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDoc(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDoc(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDocUpload(e.dataTransfer.files[0]);
    }
  };

  // Voice input via the browser Web Speech API.
  const startVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser. Please try Google Chrome.');
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
    if (currentSession?.messages?.length > 0 || streamingText !== null || isLoading) {
      scrollToBottom();
    } else if (mainBodyRef.current) {
      mainBodyRef.current.scrollTop = 0;
    }
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

    if (webSearch) {
      setIsWebSearching(true);
      setCurrentSearchQuery(text);
      setSearchPhase(0);
    } else {
      setIsWebSearching(false);
      setCurrentSearchQuery('');
      setSearchPhase(0);
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
          web_search: webSearch,
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
        let kbSource = null;
        try { const s = res.headers.get('X-Source'); if (s) kbSource = JSON.parse(s); } catch (e) { /* ignore */ }
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
          setErrorMsg('No response received from Axom AI. Please try again.');
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
          source: kbSource,
        });
        setStreamingText(null);
        setStreamingSources([]);
        setIsLoading(false);
        return;
      }

      // --- Non-streaming path (Gemini / web search): full JSON, then typewriter ---
      const data = await res.json();
      setIsWebSearching(false);

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
        // Faster typewriter (~1.4 KB/s) so long replies stop feeling slow —
        // still visibly incremental for the "AI is writing" feel, but ~3x
        // quicker than the old 2 chars / 6 ms.
        const intervalId = setInterval(() => {
          if (i < responseText.length) {
            setStreamingText(responseText.substring(0, i + 6));
            i += 6;
          } else {
            clearInterval(intervalId);
            // Save final message to state
            onAddMessage(sessionId, 'assistant', responseText, 'Axom AI', {
              web_search: data.web_search,
              sources: data.sources,
              from_database: data.from_database,
              source: data.source || null,
            });
            setStreamingText(null);
            setStreamingSources([]);
            setIsLoading(false);
          }
        }, 4);
      } else {
        const err = data.error || 'Failed to get response from Axom AI.';
        setErrorMsg(err);
        setIsLoading(false);
      }
    } catch (err) {
      setIsWebSearching(false);
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
    <main
      className="main-content"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for document attachment */}
      <input
        type="file"
        ref={docFileInputRef}
        style={{ display: 'none' }}
        accept=".docx,.doc,.txt,.rtf,.md"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleDocUpload(e.target.files[0]);
          }
        }}
      />

      {/* Drag & Drop Visual Backdrop Overlay */}
      {isDraggingDoc && (
        <div className="drag-doc-overlay">
          <div className="drag-doc-content">
            <FileUp size={48} className="bounce-icon" />
            <h3>Drop your document here</h3>
            <p>Convert .docx, .doc, or .txt to formatted PDF</p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="top-header">
        <div className="header-left">
          <button className="icon-btn toggle-sidebar" onClick={onToggleLeftSidebar} title="Toggle Sidebar">
            <Menu size={20} />
          </button>
          <div className="model-selector-pill">
            <span className="model-name-text">Axom 2.0 Pro</span>
            <span className="model-badge">Assam AI</span>
          </div>
        </div>

        <div className="header-right">
          <button className="header-action-btn" onClick={onOpenTools} title="Open AI Tools & Document Studio">
            <Wrench size={14} />
            <span className="btn-label">Tools</span>
          </button>
          <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn toggle-sidebar" onClick={onToggleRightSidebar} title="Toggle Control Panel">
            <Sliders size={18} />
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
                {user.isAuthenticated ? `Hi, ${user.username}!` : "Hi, I'm Axom AI"}
                <span className="wave-emoji">👋</span>
              </h1>
              <p className="greeting-subtitle">How can I help you today?</p>
            </div>

            {/* Glowing Center Orb & Visual Graphic */}
            <div className="orb-hero-visual">
              <div className="orb-container">
                <div className="orb-aurora-glow"></div>
                <div className="orb-ring orb-ring-1"></div>
                <div className="orb-ring orb-ring-2"></div>
                <div className="orb-sphere">
                  <div className="orb-fluid-blob"></div>
                  <div className="orb-fluid-blob-2"></div>
                  <div className="orb-specular-highlight"></div>
                  <div className="orb-inner-sparkle"></div>
                </div>
                <div className="orb-orbit-particle p1"></div>
                <div className="orb-orbit-particle p2"></div>
                <div className="orb-orbit-particle p3"></div>
              </div>
              <h2 className="hero-tagline" style={{ fontSize: '0.92rem', maxWidth: '580px', lineHeight: 1.5, opacity: 0.85, margin: '16px auto 0' }}>
                Your AI workspace for <span className="gradient-text">everything about Assam</span> — reasoning, document tools, imagery and research. Replies natively in <span className="gradient-text">Assamese (অসমীয়া)</span>.
              </h2>
            </div>

            {/* ChatGPT-Style Prompt Starter Cards */}
            <div className="prompt-cards-grid">
              <div
                className="prompt-card"
                onClick={() => {
                  if (onOpenDocConverterModal) onOpenDocConverterModal();
                }}
              >
                <div className="prompt-card-icon">📄</div>
                <div className="prompt-card-content">
                  <div className="prompt-card-title">Document & PDF Studio</div>
                  <div className="prompt-card-desc">Convert, compress, summarize or edit documents</div>
                </div>
              </div>

              <div
                className="prompt-card"
                onClick={() => {
                  setInputText("Generate an image of Kaziranga sunrise with a majestic one-horned rhinoceros");
                  if (textareaRef.current) textareaRef.current.focus();
                }}
              >
                <div className="prompt-card-icon">🎨</div>
                <div className="prompt-card-content">
                  <div className="prompt-card-title">Generate AI Image</div>
                  <div className="prompt-card-desc">Photorealistic imagery powered by FLUX.1 & SDXL</div>
                </div>
              </div>

              <div
                className="prompt-card"
                onClick={() => {
                  setWebSearch(true);
                  setInputText("অসমৰ আজিৰ শেহতীয়া প্ৰধান বাতৰি আৰু খবৰবোৰ কি?");
                  if (textareaRef.current) textareaRef.current.focus();
                }}
              >
                <div className="prompt-card-icon">🌐</div>
                <div className="prompt-card-content">
                  <div className="prompt-card-title">Assam Live News</div>
                  <div className="prompt-card-desc">Real-time web research, verified facts and live citations</div>
                </div>
              </div>

              <div
                className="prompt-card"
                onClick={() => {
                  setInputText("অসমৰ জাতীয় সংস্কৃতি আৰু ৰঙালী বিহুৰ তাৎপৰ্য ব্যাখ্যা কৰক");
                  if (textareaRef.current) textareaRef.current.focus();
                }}
              >
                <div className="prompt-card-icon">✍️</div>
                <div className="prompt-card-content">
                  <div className="prompt-card-title">অসমীয়া সৃষ্টিশীল লেখনী</div>
                  <div className="prompt-card-desc">অসমীয়াত প্ৰবন্ধ, কবিতা বা আনুষ্ঠানিক আবেদন পত্ৰ লিখক</div>
                </div>
              </div>
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
                          {msg.doc_conversion && (
                            <span style={{ display: 'inline-block', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: '0.66rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                              📄 PDF Converted
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

                      {/* ChatGPT-style "Searched N sites" badge */}
                      {msg.web_search && msg.sources && msg.sources.length > 0 && (
                        <div className="searched-sites-header">
                          <div className="searched-sites-badge">
                            <Globe size={13} className="badge-globe-icon" />
                            <span>Searched {msg.sources.length} sites</span>
                          </div>
                          <div className="searched-domain-tags">
                            {msg.sources.slice(0, 4).map((src, sIdx) => {
                              let host = '';
                              try {
                                host = new URL(src.uri).hostname.replace(/^www\./, '');
                              } catch (e) {
                                host = src.title || 'Source';
                              }
                              return (
                                <a
                                  key={sIdx}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="searched-domain-pill"
                                  title={src.title || src.uri}
                                >
                                  {host}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="msg-text-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />

                      {/* Interactive Converted Document Result Card */}
                      {msg.doc_conversion && (
                        <div className="doc-pdf-result-card">
                          <div className="doc-pdf-card-top">
                            <div className="doc-pdf-icon-wrapper">
                              <FileText size={24} />
                            </div>
                            <div className="doc-pdf-details">
                              <div className="doc-pdf-filename">{msg.doc_conversion.pdf_name}</div>
                              <div className="doc-pdf-meta">
                                <span className="doc-pdf-pages">
                                  {msg.doc_conversion.page_count} {msg.doc_conversion.page_count === 1 ? 'Page' : 'Pages'}
                                </span>
                                <span className="doc-pdf-dot">&bull;</span>
                                <span className="doc-pdf-size">{msg.doc_conversion.file_size}</span>
                                <span className="doc-pdf-badge">PDF Ready</span>
                              </div>
                            </div>
                          </div>

                          <div className="doc-pdf-actions">
                            <a
                              href={msg.doc_conversion.direct_download_url || msg.doc_conversion.download_url}
                              download={msg.doc_conversion.pdf_name}
                              className="btn-download-pdf-card"
                            >
                              <Download size={14} />
                              <span>Download PDF</span>
                            </a>
                            <a
                              href={msg.doc_conversion.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-preview-pdf-card"
                            >
                              <ExternalLink size={14} />
                              <span>Preview</span>
                            </a>
                          </div>
                        </div>
                      )}

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

                      {/* Knowledge-base source attribution */}
                      {msg.source && (msg.source.name || msg.source.url) && (
                        <div className="kb-source" style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <span>📄 Source:</span>
                          {msg.source.url ? (
                            <a href={msg.source.url} target="_blank" rel="noopener noreferrer" className="source-link" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                              {msg.source.name || msg.source.url}
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>{msg.source.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Converting Document Live Status Indicator */}
            {isConvertingDoc && (
              <div className="message-bubble assistant">
                <div className="msg-avatar">✦</div>
                <div className="msg-body">
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)', marginBottom: '6px' }}>Doc to PDF Converter</div>
                  <div className="converting-doc-status">
                    <Loader2 size={16} className="spin-icon" />
                    <span>Converting <strong>{convertingFileName}</strong> to formatted PDF...</span>
                  </div>
                </div>
              </div>
            )}

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
                  {/* ChatGPT-style "Searched N sites" badge in streaming preview */}
                  {streamingSources && streamingSources.length > 0 && (
                    <div className="searched-sites-header">
                      <div className="searched-sites-badge">
                        <Globe size={13} className="badge-globe-icon" />
                        <span>Searched {streamingSources.length} sites</span>
                      </div>
                      <div className="searched-domain-tags">
                        {streamingSources.slice(0, 4).map((src, sIdx) => {
                          let host = '';
                          try {
                            host = new URL(src.uri).hostname.replace(/^www\./, '');
                          } catch (e) {
                            host = src.title || 'Source';
                          }
                          return (
                            <a
                              key={sIdx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="searched-domain-pill"
                              title={src.title || src.uri}
                            >
                              {host}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="msg-text-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(streamingText) }} />
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && streamingText === null && !isConvertingDoc && (
              <div className="message-bubble assistant">
                <div className="msg-avatar">✦</div>
                <div className="msg-body">
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)', marginBottom: '6px' }}>Axom AI</div>
                  {isWebSearching ? (
                    <div className="chatgpt-search-widget">
                      <div className="search-widget-header">
                        <div className="search-globe-wrapper">
                          <Globe size={15} className="search-globe-icon" />
                          <span className="search-ping-ring"></span>
                        </div>
                        <div className="search-status-text">
                          <span className="search-step-label">
                            {searchPhase === 0 && 'Searching the web...'}
                            {searchPhase === 1 && 'Browsing & reading sources...'}
                            {searchPhase >= 2 && 'Synthesizing grounded answer...'}
                          </span>
                          {currentSearchQuery && (
                            <span className="search-query-chip" title={currentSearchQuery}>
                              "{currentSearchQuery.length > 45 ? currentSearchQuery.slice(0, 45) + '...' : currentSearchQuery}"
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="search-shimmer-track">
                        <div className="search-shimmer-bar"></div>
                      </div>

                      <div className="search-skeleton-preview">
                        <div className="search-skeleton-line line-1"></div>
                        <div className="search-skeleton-line line-2"></div>
                        <div className="search-skeleton-line line-3"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="typing-dots" aria-label="Axom AI is typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
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
            <button
              type="button"
              className="btn-attach"
              onClick={() => docFileInputRef.current?.click()}
              title="Attach document (.docx, .doc, .txt)"
            >
              <Paperclip size={18} />
            </button>
            <textarea
              className="chat-textarea"
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Axom AI..."
              rows={1}
              disabled={isLoading || isConvertingDoc}
            />
          </div>
          <div className="input-controls-row">
            <div className="controls-left">
              <div className="lang-selector" title="Replies are always in Assamese">
                <span className="lang-btn active" style={{ cursor: 'default' }}>
                  ⇄ Reply in অসমীয়া
                </span>
              </div>
              <button
                type="button"
                className={`lang-btn ${webSearch ? 'active' : ''}`}
                onClick={() => setWebSearch((v) => !v)}
                title={webSearch
                  ? 'Web search ON — Axom AI will search the internet and cite sources. Limit: 5 searches per day.'
                  : 'Turn on web search — get up-to-date answers with sources, translated into Assamese.'}
                aria-pressed={webSearch}
              >
                <Globe size={13} /> Web {webSearch ? 'ON' : ''}
              </button>
              <button
                type="button"
                className="lang-btn"
                onClick={onOpenTools || onOpenDocConverterModal}
                title="Open all converter & PDF tools (/tools)"
                id="btnChatTools"
              >
                <Wrench size={13} /> Tools
              </button>
              {webSearch && (
                <span
                  className="web-limit-hint"
                  title="Free tier limit — resets every day"
                >
                  Only 5 searches per day
                </span>
              )}
            </div>
            <div className="controls-right">
              <button
                type="button"
                className={`btn-send-message ${inputText.trim() && !isLoading ? 'active' : ''}`}
                onClick={handleSend}
                disabled={isLoading || isConvertingDoc || !inputText.trim()}
                title="Send Message"
              >
                {isLoading ? <Loader2 size={16} className="spin-icon" /> : <Send size={15} />}
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
