'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Sun, Moon, Sliders, Send, Globe, Copy, Check, AlertTriangle,
  FileText, Mic, Volume2, ThumbsUp, ThumbsDown, Paperclip, Download,
  ExternalLink, Loader2, Sparkles, FileUp, Wrench, Languages, ChevronDown,
  X, MessageSquare, Image as ImageIcon
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
  const [attachedFile, setAttachedFile] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [streamingText, setStreamingText] = useState(null);
  const [streamingSources, setStreamingSources] = useState([]);
  const [streamingModel, setStreamingModel] = useState('');
  const [streamingFromDb, setStreamingFromDb] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [remainingSearches, setRemainingSearches] = useState(null);
  // Language selection: default to Assamese
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('axom_chat_language') || 'assamese';
    }
    return 'assamese';
  });
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isLangMenuOpen]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setIsLangMenuOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('axom_chat_language', newLang);
    }
  };

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

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['.docx', '.doc', '.txt', '.rtf', '.md', '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setErrorMsg(`Unsupported file type: ${ext}. Please upload a document (.docx, .pdf, .txt) or image (.png, .jpg, .webp).`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB limit.');
      return;
    }

    setErrorMsg(null);
    const isImg = file.type.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
    const fileObj = {
      file,
      name: file.name,
      size: file.size,
      ext,
      isImage: isImg,
      preview: null,
      textSnippet: '',
    };

    if (isImg || ext === '.pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachedFile((prev) => (prev ? { ...prev, preview: e.target?.result } : null));
      };
      reader.readAsDataURL(file);
    }
    if (ext === '.txt' || ext === '.md') {
      file.text().then((txt) => {
        setAttachedFile((prev) => (prev ? { ...prev, textSnippet: txt.slice(0, 5000) } : null));
      }).catch(() => {});
    } else if (ext === '.docx' || ext === '.pdf') {
      const fd = new FormData();
      fd.append('file', file);
      fetch('/api/ai-notes/analyze/', {
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() || '' },
        body: fd,
      }).then((r) => r.json()).then((d) => {
        if (d && d.sample_text) {
          setAttachedFile((prev) => (prev ? { ...prev, textSnippet: d.sample_text } : null));
        }
      }).catch(() => {});
    }

    setAttachedFile(fileObj);
    if (docFileInputRef.current) docFileInputRef.current.value = '';
  };

  const handleClearAttachedFile = () => {
    setAttachedFile(null);
    if (docFileInputRef.current) docFileInputRef.current.value = '';
  };

  const handleExecuteConvertDoc = async (fileToUse) => {
    const file = fileToUse || attachedFile?.file;
    if (!file) return;

    setErrorMsg(null);
    setIsConvertingDoc(true);
    setConvertingFileName(file.name);
    setAttachedFile(null);

    const fileMeta = {
      attached_file: {
        name: file.name,
        size: file.size,
        isImage: false,
        ext: '.' + file.name.split('.').pop().toLowerCase(),
      }
    };

    let sessionId = currentSession?.id;
    if (!sessionId) {
      sessionId = onSendMessage(`📄 Convert Document: ${file.name}`, fileMeta);
    } else {
      onAddMessage(sessionId, 'user', `📄 Convert Document: ${file.name}`, 'Axom AI', fileMeta);
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
        'Axom AI',
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

  const handleExecuteGeminiImage = async (customPrompt) => {
    const promptToUse = (customPrompt || inputText).trim();
    if (!promptToUse && !attachedFile?.isImage) {
      setInputText('A beautiful landscape in Assam');
      textareaRef.current?.focus();
      return;
    }

    const finalPrompt = promptToUse || (attachedFile?.isImage ? 'Enhance and stylize this image in ultra-high quality' : 'A beautiful realistic scene');

    setIsGeneratingImage(true);
    setIsLoading(true);
    setErrorMsg(null);

    const currentFile = attachedFile;
    const fileMeta = currentFile ? {
      attached_file: {
        name: currentFile.name,
        size: currentFile.size,
        isImage: currentFile.isImage,
        preview: currentFile.preview,
        ext: currentFile.ext,
      }
    } : {};

    let sessionId = currentSession?.id;
    const userPromptDisplay = `🎨 Generate Image: ${finalPrompt}`;
    if (!sessionId) {
      sessionId = onSendMessage(userPromptDisplay, fileMeta);
    } else {
      onAddMessage(sessionId, 'user', userPromptDisplay, 'Axom AI', fileMeta);
    }

    setAttachedFile(null);
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      let res;
      if (currentFile?.isImage) {
        const formData = new FormData();
        formData.append('prompt', finalPrompt);
        formData.append('quality', 'normal');
        formData.append('width', '1024');
        formData.append('height', '1024');
        formData.append('image', currentFile.file);

        res = await fetch('/api/generate-image/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCsrfToken() || '' },
          body: formData,
        });
      } else {
        res = await fetch('/api/generate-image/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken() || '',
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            quality: 'normal',
            width: 1024,
            height: 1024,
          }),
        });
      }

      const data = await res.json();
      const imgData = data?.image || data?.image_url;
      if (!res.ok || !data.success || !imgData) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      onAddMessage(
        sessionId,
        'assistant',
        `আপোনাৰ অনুৰোধ অনুসৰি প্ৰস্তুত কৰা ছবিখন:\n\n**বিৱৰণ:** *${finalPrompt}*`,
        'Axom AI',
        {
          image: imgData,
          image_url: imgData,
          image_engine: 'Axom AI',
          image_prompt: finalPrompt,
        }
      );
    } catch (err) {
      setErrorMsg(`Image generation error: ${err.message}`);
    } finally {
      setIsGeneratingImage(false);
      setIsLoading(false);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  const handleExecuteSummarize = () => {
    if (!attachedFile) return;
    const summaryPrompt = `Please provide a clear, comprehensive summary and key takeaways of the attached file: "${attachedFile.name}".`;
    handleSendWithText(summaryPrompt);
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
      handleFileSelect(e.dataTransfer.files[0]);
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
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Check if user has scrolled away from the bottom (ChatGPT-style scroll detection)
  const handleScroll = () => {
    if (!mainBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mainBodyRef.current;
    const isAwayFromBottom = scrollHeight - scrollTop - clientHeight > 100;
    isUserScrolledUpRef.current = isAwayFromBottom;
    setShowScrollBottom(isAwayFromBottom);
  };

  // Smart auto-scroll: follows stream ONLY if user hasn't scrolled up to read earlier text
  const scrollToBottom = (force = false) => {
    if (mainBodyRef.current) {
      if (force || !isUserScrolledUpRef.current) {
        mainBodyRef.current.scrollTop = mainBodyRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (currentSession?.messages?.length > 0 || streamingText !== null || isLoading) {
      scrollToBottom(false);
    } else if (mainBodyRef.current) {
      mainBodyRef.current.scrollTop = 0;
    }
  }, [currentSession?.messages, streamingText, isLoading, errorMsg]);

  // When switching chat sessions, reset scroll to bottom
  useEffect(() => {
    isUserScrolledUpRef.current = false;
    setShowScrollBottom(false);
    scrollToBottom(true);
  }, [currentSession?.id]);

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
    if ((!text && !attachedFile) || isLoading || isConvertingDoc || isGeneratingImage) return;

    handleSendWithText(text);
  };

  const handleSendWithText = async (textToSend) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && !attachedFile) return;

    if (remainingWords <= 0 && !user.isAuthenticated) {
      setInputText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      onUpgrade();
      return;
    }

    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setErrorMsg(null);

    const currentFile = attachedFile;
    const fileMeta = currentFile ? {
      attached_file: {
        name: currentFile.name,
        size: currentFile.size,
        isImage: currentFile.isImage,
        preview: currentFile.preview,
        ext: currentFile.ext,
      }
    } : {};
    setAttachedFile(null);

    let fullPrompt = text;
    let userDisplayPrompt = text;

    if (currentFile) {
      if (!userDisplayPrompt) {
        userDisplayPrompt = currentFile.isImage ? `📷 ${currentFile.name}` : `📎 ${currentFile.name}`;
      }
      if (currentFile.isImage) {
        fullPrompt = text ? text : 'Please inspect this image, read any visible text, and explain what is depicted in detail.';
      } else if (currentFile.textSnippet) {
        fullPrompt = `${fullPrompt ? fullPrompt + '\n\n' : ''}[Attached Document: ${currentFile.name}]\nDocument Content:\n${currentFile.textSnippet.slice(0, 4500)}`;
      } else {
        fullPrompt = `${fullPrompt ? fullPrompt + '\n\n' : ''}[Attached Document: ${currentFile.name}]`;
      }
    }

    // Calculate prompt words and deduct
    const wordCount = (userDisplayPrompt || 'file').split(/\s+/).filter(w => w.length > 0).length;
    deductWords(wordCount);

    // If no active session, trigger creation on parent
    let sessionId = currentSession?.id;
    if (!sessionId) {
      sessionId = onSendMessage(userDisplayPrompt, fileMeta);
    } else {
      onAddMessage(sessionId, 'user', userDisplayPrompt, 'Axom AI', fileMeta);
    }

    if (webSearch) {
      setIsWebSearching(true);
      setCurrentSearchQuery(userDisplayPrompt);
      setSearchPhase(0);
    } else {
      setIsWebSearching(false);
      setCurrentSearchQuery('');
      setSearchPhase(0);
    }
    isUserScrolledUpRef.current = false;
    setShowScrollBottom(false);
    scrollToBottom(true);
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
          prompt: fullPrompt,
          web_search: webSearch,
          session_id: sessionId,
          language,
          history: (currentSession?.messages || [])
            .slice(-20)
            .map((m) => ({ role: m.role, text: m.text })),
          attached_image: currentFile?.isImage && currentFile.preview ? currentFile.preview : null,
          has_attached_image: !!(currentFile?.isImage),
          attached_pdf: currentFile?.ext === '.pdf' && currentFile.preview ? currentFile.preview : null,
          attached_filename: currentFile?.name || null,
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

      // --- Non-streaming path (Gemini / web search): safe JSON parsing with fallback ---
      let data = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (parseErr) {
          console.warn('Could not parse response as JSON:', parseErr);
        }
      } else {
        try {
          const rawText = await res.text();
          if (rawText && rawText.trim().startsWith('{') && rawText.trim().endsWith('}')) {
            data = JSON.parse(rawText);
          }
        } catch (tErr) {
          // non-json response (HTML error page from proxy/gateway/firewall)
        }
      }
      setIsWebSearching(false);

      // --- Instant AI Image Response (when OpenAI detects user requested image generation) ---
      if (res.ok && data && (data.image || data.image_url)) {
        setIsLoading(false);
        setStreamingText(null);
        onAddMessage(sessionId, 'assistant', data.response, 'Axom AI', {
          image: data.image || data.image_url,
          image_url: data.image || data.image_url,
          image_engine: 'Axom AI',
          image_prompt: data.image_prompt || userDisplayPrompt,
        });
        return;
      }

      if (res.ok && data && data.response) {
        if (typeof data.remaining_today === 'number') {
          setRemainingSearches(data.remaining_today);
        }
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
        if (data && (data.remaining_today === 0 || res.status === 429)) {
          setRemainingSearches(0);
        }
        let err = data?.error;
        if (!err) {
          if (res.status === 403) {
            err = 'অনুমতি নাই বা অধিৱেশন শেষ হ’ল (Session refreshed). অনুগ্ৰহ কৰি পেজটো ৰিফ্ৰেছ কৰক।';
          } else if (res.status === 429) {
            err = 'বহুত বেছি মেচেজ — অলপ সময় অপেক্ষা কৰি পুনৰ চেষ্টা কৰক (Rate limit reached).';
          } else if (res.status >= 500) {
            err = 'Axom AI সেৱা ব্যস্ত আছে (Server busy). অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।';
          } else {
            err = 'Failed to get response from Axom AI. Please try again.';
          }
        }
        setErrorMsg(err);
        setIsLoading(false);
      }
    } catch (err) {
      setIsWebSearching(false);
      if (err.name !== 'AbortError') {
        let msg = err.message || 'Connection error.';
        if (msg.includes('Unexpected token') || msg.includes('not valid JSON') || msg.includes('DOCTYPE') || msg.includes('<')) {
          msg = 'Axom AI সেৱা সংযোগত সমস্যা হৈছে। অনুগ্ৰহ কৰি পেজটো ৰিফ্ৰেছ কৰি পুনৰ চেষ্টা কৰক (Connection error).';
        }
        setErrorMsg(msg);
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
      {/* Hidden file input for document and image attachments */}
      <input
        type="file"
        ref={docFileInputRef}
        style={{ display: 'none' }}
        accept=".docx,.doc,.txt,.rtf,.md,.pdf,.png,.jpg,.jpeg,.webp,.gif"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Drag & Drop Visual Backdrop Overlay */}
      {isDraggingDoc && (
        <div className="drag-doc-overlay">
          <div className="drag-doc-content">
            <FileUp size={48} className="bounce-icon" />
            <h3>Drop your file or image here</h3>
            <p>Ask questions, summarize, convert to PDF, or generate imagery with AI</p>
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
            <span className="model-name-text">Axom AI</span>
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
      <div className="main-body" id="mainBody" ref={mainBodyRef} onScroll={handleScroll}>
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


          </div>
        ) : (
          /* Chat Messages Feed */
          <div className="chat-messages-container" id="chatMessagesContainer">
            {currentSession.messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                {msg.role === 'user' ? (
                  <>
                    <div className="msg-body">
                      {msg.attached_file && (
                        <div className="user-attached-file-box">
                          {msg.attached_file.isImage && msg.attached_file.preview ? (
                            <div className="user-attached-img-wrap">
                              <img
                                src={msg.attached_file.preview}
                                alt={msg.attached_file.name || 'Attached image'}
                                className="user-attached-img-thumb"
                              />
                              <span className="user-attached-img-name">{msg.attached_file.name}</span>
                            </div>
                          ) : (
                            <div className="user-attached-doc-badge">
                              <FileText size={18} className="user-doc-icon" />
                              <div className="user-doc-details">
                                <span className="user-doc-name">{msg.attached_file.name}</span>
                                {msg.attached_file.size ? (
                                  <span className="user-doc-size">
                                    {msg.attached_file.size / 1024 < 1024
                                      ? `${(msg.attached_file.size / 1024).toFixed(1)} KB`
                                      : `${(msg.attached_file.size / (1024 * 1024)).toFixed(1)} MB`}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                    <div className="msg-avatar">{user.username ? user.username.substring(0, 2).toUpperCase() : 'US'}</div>
                  </>
                ) : (
                  <>
                    <div className="msg-avatar">✦</div>
                    <div className="msg-body" style={{ position: 'relative', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)' }}>Axom AI</span>
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

                      {/* Interactive Generated / Attached Image Result Card */}
                      {(msg.image_url || msg.image) && (
                        <div className="chat-image-result-card">
                          <img
                            src={msg.image_url || msg.image}
                            alt={msg.image_prompt || 'Generated with Axom AI'}
                            loading="lazy"
                          />
                          <div className="chat-image-footer">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Sparkles size={14} style={{ color: '#ec4899' }} />
                              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Axom AI
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <a
                                href={msg.image_url || msg.image}
                                download={`axom-ai-${Date.now()}.png`}
                                className="btn-download-image-card"
                              >
                                <Download size={13} />
                                <span>Download</span>
                              </a>
                              <a
                                href={msg.image_url || msg.image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-preview-pdf-card"
                                style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                                title="Open full image"
                              >
                                <ExternalLink size={13} />
                              </a>
                            </div>
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
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-pink)' }}>Axom AI</span>
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
      <div className="chat-input-area" style={{ position: 'relative' }}>
        {/* Floating Scroll to Bottom button (ChatGPT style) */}
        {showScrollBottom && (
          <button
            type="button"
            className="btn-scroll-bottom"
            onClick={() => {
              isUserScrolledUpRef.current = false;
              setShowScrollBottom(false);
              if (mainBodyRef.current) {
                mainBodyRef.current.scrollTo({ top: mainBodyRef.current.scrollHeight, behavior: 'smooth' });
              }
            }}
            title="Scroll to bottom"
            style={{
              position: 'absolute',
              top: '-46px',
              right: '32px',
              zIndex: 50,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-card, #1a1a2e)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.18))',
              color: 'var(--text-primary, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronDown size={18} />
          </button>
        )}
        <div className="input-card">
          {/* Attached File Preview & Action Banner */}
          {attachedFile && (
            <div className="attached-file-banner">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  {attachedFile.isImage && attachedFile.preview ? (
                    <img
                      src={attachedFile.preview}
                      alt="preview"
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                      <FileText size={20} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                      {attachedFile.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {(attachedFile.size / 1024).toFixed(1)} KB • {attachedFile.isImage ? 'Image' : 'Document'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearAttachedFile}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                  title="Remove attached file"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Action Chips: ONLY shown when user has NOT asked/typed a question */}
              {!inputText.trim() && (
                <>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    এই ফাইলটোৰ সৈতে আপুনি কি কৰিব বিচাৰে? (Choose an action or type a message below)
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '2px' }}>
                    {/* 1. Ask / Chat */}
                    <button
                      type="button"
                      onClick={() => {
                        setInputText(`Explain what is in this file (${attachedFile.name})`);
                        textareaRef.current?.focus();
                      }}
                      className="file-action-chip"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <MessageSquare size={13} />
                      <span>Ask / Chat</span>
                    </button>

                    {/* 2. Summarize */}
                    <button
                      type="button"
                      onClick={handleExecuteSummarize}
                      className="file-action-chip"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <FileText size={13} />
                      <span>Summarize & Notes</span>
                    </button>

                    {/* 3. Image Generation / Editing */}
                    <button
                      type="button"
                      onClick={() => handleExecuteGeminiImage()}
                      className="file-action-chip"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#f472b6', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <Sparkles size={13} />
                      <span>{attachedFile.isImage ? 'AI Image Edit' : 'Generate Image'}</span>
                    </button>

                    {/* 4. Convert to PDF (Only for document files) */}
                    {!attachedFile.isImage && (
                      <button
                        type="button"
                        onClick={() => handleExecuteConvertDoc()}
                        className="file-action-chip"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <Download size={13} />
                        <span>Convert to PDF</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="input-row">
            <button
              type="button"
              className="btn-attach"
              onClick={() => docFileInputRef.current?.click()}
              title="Attach document or image"
            >
              <Paperclip size={18} />
            </button>
            <textarea
              className="chat-textarea"
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={attachedFile ? (attachedFile.isImage ? "Ask about this image, or describe what to generate/edit..." : "Ask questions about this document or choose an action above...") : "Message Axom AI..."}
              rows={1}
              disabled={isLoading || isConvertingDoc || isGeneratingImage}
            />
          </div>
          <div className="input-controls-row">
            <div className="controls-left">
              {/* Language Switcher Dropdown */}
              <div ref={langMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="lang-btn active"
                  onClick={() => setIsLangMenuOpen((v) => !v)}
                  title="Choose response language (Default: Assamese)"
                  aria-haspopup="true"
                  aria-expanded={isLangMenuOpen}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                >
                  <Languages size={13} style={{ color: '#e879f9' }} />
                  <span>
                    {language === 'assamese' && 'অসমীয়া (Default)'}
                    {language === 'english' && 'English'}
                    {language === 'hinglish' && 'Hinglish'}
                  </span>
                  <ChevronDown
                    size={11}
                    style={{
                      transform: isLangMenuOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>

                {isLangMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 6px)',
                      left: 0,
                      background: 'var(--bg-card, #12131f)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      padding: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      minWidth: '150px',
                      zIndex: 100,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('assamese')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: language === 'assamese' ? 'rgba(232, 121, 249, 0.15)' : 'transparent',
                        color: language === 'assamese' ? '#e879f9' : 'var(--text-primary, #fff)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>অসমীয়া (Default)</span>
                      {language === 'assamese' && <Check size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('english')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: language === 'english' ? 'rgba(232, 121, 249, 0.15)' : 'transparent',
                        color: language === 'english' ? '#e879f9' : 'var(--text-primary, #fff)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>English</span>
                      {language === 'english' && <Check size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('hinglish')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: language === 'hinglish' ? 'rgba(232, 121, 249, 0.15)' : 'transparent',
                        color: language === 'hinglish' ? '#e879f9' : 'var(--text-primary, #fff)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>Hinglish</span>
                      {language === 'hinglish' && <Check size={12} />}
                    </button>
                  </div>
                )}
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
                  title="Strict IP-based limit: max 5 searches per day"
                >
                  {remainingSearches !== null ? `${remainingSearches}/5 searches left today` : 'Limit: 5 searches/day (IP-based)'}
                </span>
              )}
            </div>
            <div className="controls-right">
              <button
                type="button"
                className={`btn-send-message ${(inputText.trim() || attachedFile) && !isLoading && !isGeneratingImage ? 'active' : ''}`}
                onClick={handleSend}
                disabled={isLoading || isConvertingDoc || isGeneratingImage || (!inputText.trim() && !attachedFile)}
                title="Send Message"
              >
                {isLoading || isGeneratingImage ? <Loader2 size={16} className="spin-icon" /> : <Send size={15} />}
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
