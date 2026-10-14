'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Sun, Moon, Sliders, Send, Globe, Copy, Check, AlertTriangle,
  FileText, Mic, MicOff, Volume2, ThumbsUp, ThumbsDown, Paperclip, Download,
  ExternalLink, Loader2, Sparkles, FileUp, Wrench, Languages, ChevronDown,
  X, MessageSquare, Image as ImageIcon, Plus, Zap, ScanText, BookOpen
} from 'lucide-react';
import { formatMarkdown } from './utils/format';
import { getCsrfToken } from './utils/security';
import { readSpeed } from '../../lib/voiceSpeed';
import { noiseFloor, speechThreshold, followFloor, MAX_THRESHOLD } from '../../lib/voiceLevel';

const PHONETIC_PATTERNS = [
  /\b(aji|bohut|bhal|lagil|moi|tumi|apuni|aponar|kene|asa|aso|khobor|axom|asom|dhonyobad|dhanyabad|kenekoi|kiba|kobo|mor|naam|ghor|kot|jaba|ki|kotha|bhalne)\b/i
];

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
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [phoneticSuggestion, setPhoneticSuggestion] = useState(null);
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);

  const langMenuRef = useRef(null);
  const attachMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setIsAttachMenuOpen(false);
      }
    };
    if (isLangMenuOpen || isAttachMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isLangMenuOpen, isAttachMenuOpen]);

  // Phonetic Assamese detection in input text
  useEffect(() => {
    if (!inputText || inputText.trim().length < 3 || /[\u0980-\u09FF]/.test(inputText)) {
      setPhoneticSuggestion(null);
      return;
    }
    const isPhonetic = PHONETIC_PATTERNS.some((p) => p.test(inputText));
    if (isPhonetic) {
      setPhoneticSuggestion(inputText.trim());
    } else {
      setPhoneticSuggestion(null);
    }
  }, [inputText]);

  const handleTransliterate = async () => {
    if (!inputText.trim() || isTransliterating) return;
    setIsTransliterating(true);
    try {
      const res = await fetch('/api/chat/transliterate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: JSON.stringify({ text: inputText }),
      });
      const d = await res.json();
      if (d.success && d.transliterated) {
        setInputText(d.transliterated);
        setPhoneticSuggestion(null);
      }
    } catch {
      // fallback: keep input as is
    } finally {
      setIsTransliterating(false);
    }
  };

  const handleExtractOcr = async (fileToOcr = attachedFile) => {
    if (!fileToOcr || isOcrLoading) return;
    setIsOcrLoading(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      if (fileToOcr.file) {
        fd.append('file', fileToOcr.file);
      } else if (fileToOcr.preview) {
        fd.append('image_base64', fileToOcr.preview);
        fd.append('filename', fileToOcr.name || 'document.jpg');
      }
      const res = await fetch('/api/chat/ocr/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken() || '',
        },
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.text) {
        setOcrData(data);
        setInputText((prev) => (prev ? `${prev}\n\n[OCR Extracted Text]:\n${data.text}` : `[OCR Text from ${fileToOcr.name}]:\n${data.text}`));
      } else {
        setErrorMsg(data.error || 'Failed to extract text from document/image.');
      }
    } catch {
      setErrorMsg('Network error extracting text. Please try again.');
    } finally {
      setIsOcrLoading(false);
    }
  };

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
  const [voiceLoading, setVoiceLoading] = useState(null);   // index of the answer whose Assamese voice is being made
  const [voiceNote, setVoiceNote] = useState(null);         // { index, text }: why the voice did not play
  const voiceRef = useRef({ token: 0, audio: null });
  const [isTranscribing, setIsTranscribing] = useState(false);   // a recording was sent to the server and is being written down
  const recognitionRef = useRef(null);
  const docFileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);

  // ---------------------------------------------------------------- voice input (speech to text)
  // 1. Server voice typing (default): the microphone is recorded with the browser's noise suppression, echo cancellation and gain control
  //    switched on, the recording stops by itself after a pause, the server cleans it and writes down what was said (Gemini).
  // 2. The browser's own speech recognition: used when the server says no (switched off, limit, not reachable) or MediaRecorder is missing.
  // Either way the text box is set to (what was typed before) + (what was heard), never appended to: appending doubled "How are you".
  const VOICE_VAD = { tickMs: 100, calibrateMs: 500, pauseMs: 1100, waitForSpeechMs: 8000, maxMs: 40000, minSpeechMs: 250 };
  const micStreamRef = useRef(null);
  const sttModeRef = useRef('server');           // 'server' until the server cannot be used, then 'browser'
  const recorderRef = useRef(null);

  const releaseMic = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  };

  const micConstraints = { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } };

  const sttLanguage = () => (language === 'english' ? 'english' : language === 'assamese' ? 'assamese' : 'hinglish');

  const sendRecording = async (blob, base) => {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('audio', blob, 'speech.' + (blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'));
      fd.append('language', sttLanguage());
      const controller = new AbortController();
      const giveUp = setTimeout(() => controller.abort(), 40000);          // the server itself gives up after about 30 s
      let res;
      try { res = await fetch('/api/stt/', { method: 'POST', credentials: 'include', body: fd, signal: controller.signal }); } finally { clearTimeout(giveUp); }
      let data = {};
      try { data = await res.json(); } catch (e) { /* not JSON */ }
      if (res.ok && data.success) {
        if (data.text) setInputText(base + data.text);
        else setErrorMsg('I could not catch any words. Please speak a little closer and try again.');
        return;
      }
      if (res.status === 429) {
        setErrorMsg((data.error || "Today's voice-typing limit is over.") + (data.upgrade_required ? ' Upgrade for more.' : ''));
        return;
      }
      if (res.status === 413 || res.status === 400) { setErrorMsg(data.error || 'That recording could not be used. Please try again.'); return; }
      sttModeRef.current = 'browser';                              // switched off, or the server voice typing is down
      setErrorMsg('Server voice typing is not available right now. Tap the microphone again to use your browser voice typing.');
    } catch (e) {
      sttModeRef.current = 'browser';
      setErrorMsg('Voice typing could not reach the server. Tap the microphone again to use your browser voice typing.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startServerRecording = async () => {
    const base = inputText && inputText.trim() ? inputText.trim() + ' ' : '';
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(micConstraints);
    } catch (err) {
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        setErrorMsg('Could not access microphone. Please allow microphone permissions.');
      } else {
        setErrorMsg('No microphone was found.');
      }
      return;
    }
    micStreamRef.current = stream;
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported(m));
    let recorder;
    try {
      recorder = new window.MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    } catch (err) {
      releaseMic();
      sttModeRef.current = 'browser';
      startBrowserRecognition();
      return;
    }
    const chunks = [];
    let speechMs = 0;                  // how long the person has been heard so far
    let lastSpeechAt = 0;
    let startedAt = Date.now();
    let floor = null;                  // the room's own noise level, measured in the first moments
    let calib = [];
    let ctx = null;
    let timer = null;
    let stopped = false;

    const finish = () => {
      if (stopped) return;
      stopped = true;
      if (timer) clearInterval(timer);
      try { if (ctx && ctx.close) ctx.close(); } catch (e) { /* closed */ }
      try { if (recorder.state !== 'inactive') recorder.stop(); } catch (e) { /* stopped */ }
    };

    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      releaseMic();
      recorderRef.current = null;
      setIsListening(false);
      if (speechMs < VOICE_VAD.minSpeechMs || !chunks.length) {
        setErrorMsg('I did not hear anything. Tap the microphone and speak.');
        return;
      }
      sendRecording(new Blob(chunks, { type: recorder.mimeType || mime || 'audio/webm' }), base);
    };
    recorder.onerror = () => { releaseMic(); recorderRef.current = null; setIsListening(false); };

    // Level meter: after a pause of about a second and a half the recording stops by itself.
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      timer = setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const level = Math.sqrt(sum / buf.length);
        const now = Date.now();
        if (floor === null) {
          calib.push(level);
          if (level > MAX_THRESHOLD) { speechMs += VOICE_VAD.tickMs; lastSpeechAt = now; }       // a person who starts talking at once is heard too
          if (now - startedAt >= VOICE_VAD.calibrateMs) {
            floor = noiseFloor(calib);                                                          // only the quiet samples count, so early speech cannot raise the limit
          }
          return;
        }
        floor = followFloor(floor, level);
        const speaking = level > speechThreshold(floor);
        if (speaking) { speechMs += VOICE_VAD.tickMs; lastSpeechAt = now; }
        if (speechMs >= VOICE_VAD.minSpeechMs && now - lastSpeechAt >= VOICE_VAD.pauseMs) finish();
        else if (speechMs < VOICE_VAD.minSpeechMs && now - startedAt >= VOICE_VAD.waitForSpeechMs) finish();
        else if (now - startedAt >= VOICE_VAD.maxMs) finish();
      }, VOICE_VAD.tickMs);
    } catch (e) {
      // no level meter in this browser: record until the person taps the microphone again (or the longest time)
      speechMs = VOICE_VAD.minSpeechMs;
      timer = setInterval(() => { if (Date.now() - startedAt >= VOICE_VAD.maxMs) finish(); }, 1000);
    }

    recorderRef.current = { stop: finish };
    setIsListening(true);
    startedAt = Date.now();
    recorder.start();
  };

  const startBrowserRecognition = async () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Where the browser lets speech recognition take a microphone track (new Chrome), the track is opened with noise suppression on.
    let track = null;
    const takesTrack = typeof SpeechRec.available === 'function' || 'processLocally' in SpeechRec.prototype;
    if (takesTrack && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(micConstraints);
        micStreamRef.current = stream;
        track = stream.getAudioTracks()[0] || null;
      } catch (err) {
        if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
          setErrorMsg('Could not access microphone. Please allow microphone permissions.');
          return;
        }
        track = null;
      }
    }

    try {
      const base = inputText && inputText.trim() ? inputText.trim() + ' ' : '';
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = langCode();

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event) => {
        let heard = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const alt = res[0];
          // a finished phrase the recogniser itself is hardly sure of is usually the noise around the speaker, heard as words
          if (res.isFinal && alt.confidence > 0 && alt.confidence < 0.25) continue;
          heard += alt.transcript;
        }
        setInputText(base + heard.trim());
      };
      rec.onerror = (e) => {
        releaseMic();
        setIsListening(false);
        if (e && (e.error === 'not-allowed' || e.error === 'service-not-allowed')) {
          setErrorMsg('Could not access microphone. Please allow microphone permissions.');
        }
      };
      rec.onend = () => { releaseMic(); setIsListening(false); };

      recognitionRef.current = rec;
      if (track) {
        try { rec.start(track); } catch (e) { rec.start(); }
      } else {
        rec.start();
      }
    } catch (err) {
      releaseMic();
      setIsListening(false);
      setErrorMsg('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const toggleSpeechRecognition = async () => {
    if (typeof window === 'undefined' || isTranscribing) return;
    if (isListening) {                                             // a tap while listening stops it
      if (recorderRef.current) recorderRef.current.stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* already stopped */ }
      }
      return;
    }
    const canRecord = !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (sttModeRef.current === 'server' && canRecord) await startServerRecording();
    else await startBrowserRecognition();
  };

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

  // Read an answer aloud. Assamese text is spoken by the Axom AI Assamese voice (server side, one sentence at a time so that the
  // first sentence starts early and the next one is made while it plays); any other text, or a voice that is not available,
  // uses the browser's own voice.
  const stopSpeaking = () => {
    voiceRef.current.token += 1;                                  // a read-aloud that is running sees the new number and stops
    if (voiceRef.current.audio) { voiceRef.current.audio.pause(); voiceRef.current.audio = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    setVoiceLoading(null);
  };

  useEffect(() => () => {
    voiceRef.current.token += 1;
    if (voiceRef.current.audio) voiceRef.current.audio.pause();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const browserSpeak = (text, index) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[#*`>_]/g, ''));
    u.lang = langCode();
    u.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(u);
  };

  // An answer cut into pieces for the voice. The server makes about one second of speech per second, so the FIRST piece is kept
  // short (the first sound comes after about 5 seconds, not 15) and the later pieces are about 150 characters.
  const FIRST_PIECE = 90;
  const NEXT_PIECE = 150;
  const splitForVoice = (text) => {
    const sentences = text.replace(/```[\s\S]*?```/g, ' ').split(/(?<=[।.?!])\s+|\n+/).map((p) => p.trim()).filter(Boolean);
    // 1. every sentence that is too long for the voice is cut at a comma, or at a space
    const cutAt = (str, limit) => {
      const parts = [];
      let rest = str.trim();
      while (rest.length > limit) {
        let cut = Math.max(rest.lastIndexOf(', ', limit - 1), rest.lastIndexOf('; ', limit - 1));
        if (cut < limit * 0.4) cut = rest.lastIndexOf(' ', limit - 1);
        const end = cut < limit * 0.4 ? limit : cut + 1;          // no comma or space to cut at: cut in the middle of the word
        parts.push(rest.slice(0, end).trim());
        rest = rest.slice(end).trim();
      }
      if (rest) parts.push(rest);
      return parts;
    };
    const flat = [];
    sentences.forEach((p) => { if (p.length > NEXT_PIECE) flat.push(...cutAt(p, NEXT_PIECE)); else flat.push(p); });
    if (!flat.length) return [];
    // 2. the first piece is the first sentence (cut short if needed); the others are joined up to about NEXT_PIECE characters
    const out = [];
    let first = flat.shift();
    while (first.length < 50 && flat.length && (first + ' ' + flat[0]).length <= FIRST_PIECE) first += ' ' + flat.shift();   // a very short first sentence is joined to the next
    if (first.length > FIRST_PIECE) {
      const parts = cutAt(first, FIRST_PIECE);
      first = parts.shift();
      flat.unshift(...parts);
    }
    out.push(first);
    let cur = '';
    for (const p of flat) {
      if (cur && (cur + ' ' + p).length > NEXT_PIECE) { out.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p;
    }
    if (cur) out.push(cur);
    return out;
  };

  const fetchVoice = async (sentence) => {
    let voice = 'male';
    try { voice = localStorage.getItem('axom_tts_voice') === 'female' ? 'female' : 'male'; } catch (e) { /* private mode */ }
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch('/api/tts/speak/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence, voice }),
      });
      if (res.ok) return URL.createObjectURL(await res.blob());
      let body = {};
      try { body = await res.json(); } catch (e) { /* not JSON */ }
      if (res.status === 429) { const err = new Error(body.error || 'Voice limit reached.'); err.limit = true; err.upgrade = !!body.upgrade_required; throw err; }
      if (res.status === 503 && body.retry) { await new Promise((r) => setTimeout(r, 2500)); continue; }   // the voice is busy: wait a little
      if (res.status === 422 || res.status === 413) return null;                                          // nothing to say in this piece
      const err = new Error(body.error || 'The Assamese voice is not available.');
      err.unavailable = true;
      throw err;
    }
    return null;
  };

  const playUrl = (url, token) => new Promise((resolve) => {
    if (voiceRef.current.token !== token) { URL.revokeObjectURL(url); resolve(); return; }
    const audio = new Audio(url);
    audio.playbackRate = readSpeed();                              // the speed chosen in Settings (the pitch stays the same)
    voiceRef.current.audio = audio;
    const done = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onended = done;
    audio.onerror = done;
    audio.onpause = () => { if (voiceRef.current.token !== token) done(); };
    audio.play().catch(done);
  });

  const speak = async (text, index) => {
    if (speakingIndex === index || voiceLoading === index) { stopSpeaking(); return; }
    stopSpeaking();
    setVoiceNote(null);
    const token = voiceRef.current.token;
    if (!/[ঀ-৿]/.test(text)) { browserSpeak(text, index); return; }
    const sentences = splitForVoice(text);
    if (!sentences.length) { browserSpeak(text, index); return; }
    setVoiceLoading(index);
    // every piece becomes { url } or { err } at once, so a piece that fails while the one before it is playing is never an unhandled error
    const make = (sentence) => fetchVoice(sentence).then((url) => ({ url }), (err) => ({ err }));
    let played = 0;
    let handedOver = false;
    try {
      let next = make(sentences[0]);
      for (let i = 0; i < sentences.length; i++) {
        const r = await next;
        if (voiceRef.current.token !== token) { if (r.url) URL.revokeObjectURL(r.url); return; }
        if (i + 1 < sentences.length) next = make(sentences[i + 1]);
        if (r.err) {
          if (r.err.limit || (!played && i === 0)) throw r.err;      // over the limit, or the voice is down at the very start
          continue;                                                  // a later piece failed: go on with the next one
        }
        if (r.url) {
          setVoiceLoading(null);
          setSpeakingIndex(index);
          await playUrl(r.url, token);
          played += 1;
          if (voiceRef.current.token !== token) return;
        }
      }
    } catch (e) {
      if (voiceRef.current.token === token) {
        if (e.limit) setVoiceNote({ index, text: e.upgrade ? "Today's voice limit is over. Upgrade for more." : "Today's voice limit is over." });
        else if (!played) { handedOver = true; browserSpeak(text, index); }      // the server voice is down: the browser's own voice
      }
    } finally {
      if (voiceRef.current.token === token) {
        voiceRef.current.audio = null;
        setVoiceLoading(null);
        if (!handedOver) setSpeakingIndex(null);
      }
    }
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
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
          custom_instructions: typeof window !== 'undefined' ? (
            (localStorage.getItem('axom_custom_persona_about') ? 'User Profile: ' + localStorage.getItem('axom_custom_persona_about') + '\n' : '') +
            (localStorage.getItem('axom_custom_persona_response') ? 'Response Style: ' + localStorage.getItem('axom_custom_persona_response') : '')
          ).trim() : '',
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

            {/* Quick Exam & General Prompt Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '660px', margin: '20px auto 0', padding: '0 12px' }}>
              {(
                <>
                  <button
                    type="button"
                    onClick={() => handleSendWithText('অসমৰ প্ৰধান উৎসৱসমূহ আৰু বিহুৰ তাৎপৰ্য ব্যাখ্যা কৰক')}
                    style={{ padding: '7px 13px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    🌾 অসমৰ উৎসৱ আৰু বিহুৰ তাৎপৰ্য
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendWithText('Explain the difference between Python lists, tuples, and sets with clear code examples')}
                    style={{ padding: '7px 13px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    💻 Python Data Structures with Code
                  </button>
                </>
              )}
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
                            <span style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.66rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                              📄 PDF Converted
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            className="btn-copy-msg"
                            onClick={() => speak(msg.text, index)}
                            style={{ background: 'transparent', border: 'none', color: speakingIndex === index ? 'var(--accent-pink)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', opacity: voiceLoading === index ? 0.6 : 1 }}
                            title={voiceLoading === index ? 'Making the voice… (tap to stop)' : speakingIndex === index ? 'Stop' : 'Read aloud'}
                          >
                            <Volume2 size={13} style={voiceLoading === index ? { animation: 'pulse 1s ease-in-out infinite' } : undefined} />
                            {voiceLoading === index && <span>…</span>}
                            {voiceNote && voiceNote.index === index && <span style={{ color: '#fbbf24' }}>{voiceNote.text}</span>}
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
                              <Sparkles size={14} style={{ color: '#f59e0b' }} />
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
                  <div className="msg-text-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(streamingText) + '<span class="chat-streaming-cursor"></span>' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <Zap size={11} style={{ color: '#34d399' }} />
                    <span>Streaming response...</span>
                  </div>
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
                    <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
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

                    {/* 2. OCR Text Extraction */}
                    <button
                      type="button"
                      onClick={() => handleExtractOcr(attachedFile)}
                      className="file-action-chip"
                      disabled={isOcrLoading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {isOcrLoading ? <Loader2 size={13} className="spin-icon" /> : <ScanText size={13} />}
                      <span>{isOcrLoading ? 'Extracting OCR...' : 'Extract OCR Text'}</span>
                    </button>

                    {/* 3. Summarize */}
                    <button
                      type="button"
                      onClick={handleExecuteSummarize}
                      className="file-action-chip"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <FileText size={13} />
                      <span>Summarize & Notes</span>
                    </button>

                    {/* 4. Image Generation / Editing */}
                    <button
                      type="button"
                      onClick={() => handleExecuteGeminiImage()}
                      className="file-action-chip"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', padding: '5px 12px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <Sparkles size={13} />
                      <span>{attachedFile.isImage ? 'AI Image Edit' : 'Generate Image'}</span>
                    </button>

                    {/* 5. Convert to PDF (Only for document files) */}
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

          {/* Phonetic Assamese Transliteration Suggestion Chip */}
          {phoneticSuggestion && !isLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                marginBottom: '8px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.14), rgba(245, 158, 11, 0.08))',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                fontSize: '0.76rem',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#34d399' }} />
                <span>Assamese Phonetic detected: Convert to <b>অসমীয়া</b> script?</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTransliterate}
                  disabled={isTransliterating}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: '#34d399',
                    color: '#0b1220',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isTransliterating ? <Loader2 size={12} className="spin-icon" /> : <Languages size={12} />}
                  <span>{isTransliterating ? 'Converting...' : 'Convert to অসমীয়া'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneticSuggestion(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="input-row">
            <div ref={attachMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className={`btn-attach ${isAttachMenuOpen ? 'active' : ''}`}
                onClick={() => setIsAttachMenuOpen((v) => !v)}
                title="Add attachments or tools"
                aria-expanded={isAttachMenuOpen}
              >
                <Plus size={18} style={{ transform: isAttachMenuOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {isAttachMenuOpen && (
                <div className="attachment-popover">
                  <button
                    type="button"
                    className="attachment-popover-item"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      docFileInputRef.current?.click();
                    }}
                  >
                    <div className="popover-icon-box" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                      <FileText size={15} />
                    </div>
                    <div>
                      <div>Upload Document</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>PDF, Word (.docx), TXT</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="attachment-popover-item"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      docFileInputRef.current?.click();
                    }}
                  >
                    <div className="popover-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      <ImageIcon size={15} />
                    </div>
                    <div>
                      <div>Upload Image & Scan</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>PNG, JPG, WebP OCR analysis</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="attachment-popover-item"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      docFileInputRef.current?.click();
                    }}
                  >
                    <div className="popover-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                      <ScanText size={15} />
                    </div>
                    <div>
                      <div>Scan Document / OCR</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>Extract Assamese & English Text</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="attachment-popover-item"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      setIsGeneratingImage(true);
                      setInputText('/image A cinematic portrait in Assam tea gardens, 8k resolution');
                    }}
                  >
                    <div className="popover-icon-box" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <div>Generate AI Image</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>Create images from prompt</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="attachment-popover-item"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      toggleSpeechRecognition();
                    }}
                  >
                    <div className="popover-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      <Mic size={15} />
                    </div>
                    <div>
                      <div>Voice Dictation</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>Speak in Assamese/English</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <textarea
              className="chat-textarea"
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={attachedFile ? (attachedFile.isImage ? "Ask about this image, or describe what to generate/edit..." : "Ask questions about this document or choose an action above...") : (isListening ? "Listening... speak now..." : isTranscribing ? "Writing down what you said..." : "Message Axom AI...")}
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
                  <Languages size={13} style={{ color: '#fbbf24' }} />
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
                        background: language === 'assamese' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                        color: language === 'assamese' ? '#fbbf24' : 'var(--text-primary, #fff)',
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
                        background: language === 'english' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                        color: language === 'english' ? '#fbbf24' : 'var(--text-primary, #fff)',
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
                        background: language === 'hinglish' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                        color: language === 'hinglish' ? '#fbbf24' : 'var(--text-primary, #fff)',
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
              {webSearch && (
                <span
                  className="web-limit-hint"
                  title="Strict IP-based limit: max 5 searches per day"
                >
                  {remainingSearches !== null ? `${remainingSearches}/5 searches left today` : 'Limit: 5 searches/day (IP-based)'}
                </span>
              )}
            </div>
            <div className="controls-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className={`lang-btn ${isListening || isTranscribing ? 'active' : ''}`}
                onClick={toggleSpeechRecognition}
                disabled={isTranscribing}
                title={isTranscribing ? "Writing down what you said..." : isListening ? "Listening... Click to stop" : "Voice Input (Speech to Text)"}
                style={{
                  color: isListening ? '#ef4444' : 'var(--text-secondary)',
                  borderColor: isListening ? 'rgba(239, 68, 68, 0.5)' : undefined,
                  background: isListening ? 'rgba(239, 68, 68, 0.15)' : undefined
                }}
              >
                {isListening || isTranscribing ? <MicOff size={14} className="spin-icon" /> : <Mic size={14} />}
              </button>
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
