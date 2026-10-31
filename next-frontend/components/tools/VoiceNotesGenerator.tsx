'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Download,
  Printer,
  Trash2,
  RefreshCw,
  UploadCloud,
  FileText,
  Globe2,
  Volume2
} from 'lucide-react';

type SpokenLanguage = 'assamese' | 'english' | 'hindi' | 'hinglish';
type TargetLanguage = 'same' | 'assamese' | 'english' | 'hindi';

export default function VoiceNotesGenerator() {
  // Transcript & Document Title
  const [rawTranscript, setRawTranscript] = useState('');
  const [docTitle, setDocTitle] = useState('Spoken Transcript (কথোপকথন)');

  // Language Settings
  const [spokenLang, setSpokenLang] = useState<SpokenLanguage>('assamese');
  const [translateTo, setTranslateTo] = useState<TargetLanguage>('same');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // UI helpers
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Audio & Recognition Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Helper: Append new text cleanly to transcript
  const appendTextToTranscript = useCallback((newText: string) => {
    if (!newText || !newText.trim()) return;
    setRawTranscript((prev) => {
      const trimmedPrev = prev.trim();
      const separator = trimmedPrev ? ' ' : '';
      return trimmedPrev + separator + newText.trim();
    });
  }, []);

  // Helper: Call Translation API if target language is different
  const translateIfNeeded = useCallback(
    async (text: string): Promise<string> => {
      if (!text || !text.trim()) return '';
      if (translateTo === 'same' || translateTo === spokenLang) {
        return text;
      }

      try {
        const res = await fetch('/api/voice-notes/translate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            source_lang: spokenLang,
            target_lang: translateTo,
          }),
        });

        const data = await res.json();
        if (data.success && data.translated_text) {
          return data.translated_text;
        }
        return text;
      } catch (err) {
        console.error('Translation error:', err);
        return text;
      }
    },
    [translateTo, spokenLang]
  );

  // Send Recorded Audio Blob to Axom AI STT API
  const processAudioChunk = async (blob: Blob) => {
    if (blob.size < 500) return;
    setIsProcessing(true);
    setStatusMessage('Transcribing speech...');

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');
      formData.append('language', spokenLang);

      const res = await fetch('/api/stt/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.text && data.text.trim()) {
        const originalText = data.text.trim();

        if (translateTo !== 'same' && translateTo !== spokenLang) {
          setStatusMessage(`Translating to ${translateTo}...`);
          const translated = await translateIfNeeded(originalText);
          appendTextToTranscript(translated);
        } else {
          appendTextToTranscript(originalText);
        }
      }
    } catch (err: any) {
      console.error('STT Error:', err);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Start Voice Recording (Dual Engine: Web Speech API for instant words + Server STT for deep acoustic precision)
  const startRecording = async () => {
    try {
      // 1. Check if browser native Speech Recognition is available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // MediaRecorder setup
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
        : undefined;

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const fullAudioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          // Process on stop if speech recognition wasn't active
          if (!speechRecognitionRef.current) {
            await processAudioChunk(fullAudioBlob);
          }
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      // 2. If Web Speech API is supported, use it for zero-latency live streaming words
      if (SpeechRecognition && (spokenLang === 'english' || spokenLang === 'hindi' || spokenLang === 'hinglish')) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = false;
          recognizer.lang =
            spokenLang === 'english'
              ? 'en-IN'
              : spokenLang === 'hindi' || spokenLang === 'hinglish'
              ? 'hi-IN'
              : 'as-IN';

          recognizer.onresult = async (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                const phrase = event.results[i][0].transcript.trim();
                if (phrase) {
                  if (translateTo !== 'same' && translateTo !== spokenLang) {
                    setIsProcessing(true);
                    setStatusMessage(`Translating to ${translateTo}...`);
                    const translated = await translateIfNeeded(phrase);
                    appendTextToTranscript(translated);
                    setIsProcessing(false);
                    setStatusMessage('');
                  } else {
                    appendTextToTranscript(phrase);
                  }
                }
              }
            }
          };

          recognizer.onerror = (e: any) => {
            console.warn('Speech recognition fallback to server audio:', e.error);
          };

          recognizer.start();
          speechRecognitionRef.current = recognizer;
        } catch (e) {
          speechRecognitionRef.current = null;
        }
      }

      setIsRecording(true);
      setRecordingSeconds(0);
      setStatusMessage('Listening...');

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert('Microphone access is required: ' + (err?.message || 'Permission denied'));
    }
  };

  // Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
    setStatusMessage('');
    clearInterval(timerIntervalRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Upload Pre-Recorded Audio File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Audio file size must be less than 25MB');
      return;
    }

    await processAudioChunk(file);
    e.target.value = '';
  };

  // Copy Transcript to Clipboard
  const handleCopy = () => {
    if (!rawTranscript) return;
    navigator.clipboard.writeText(rawTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to Microsoft Word (.docx)
  const handleExportDocx = async () => {
    if (!rawTranscript.trim()) {
      alert('Please speak or type some text first before exporting.');
      return;
    }

    setIsExportingDocx(true);
    try {
      const res = await fetch('/api/voice-notes/export-docx/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle || 'Voice Notes Transcript',
          notes: rawTranscript,
          mode: 'Spoken Transcript',
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(docTitle || 'Voice_Transcript').replace(/[^a-zA-Z0-9_-]/g, '_')}_AxomAI.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export Word error: ' + err.message);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Print / Save as Vector PDF
  const handlePrint = () => {
    if (!rawTranscript.trim()) {
      alert('Document is empty. Please speak or type some content first.');
      return;
    }
    window.print();
  };

  const wordCount = rawTranscript.split(/\s+/).filter(Boolean).length;
  const charCount = rawTranscript.length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* ============================================================== */}
      {/* FULL-WIDTH DOCUMENT EDITOR CONTAINER                          */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Editor Top Toolbar */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Left Controls: Mic Trigger & Language Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* The Main Mic Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 shadow-md active:scale-95 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
              }`}
              title={isRecording ? 'Click to Stop Speaking' : 'Click to Speak'}
            >
              {isRecording ? (
                <>
                  <MicOff size={16} />
                  <span>
                    Stop ({String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                    {String(recordingSeconds % 60).padStart(2, '0')})
                  </span>
                </>
              ) : (
                <>
                  <Mic size={16} />
                  <span>Tap to Speak (কওক)</span>
                </>
              )}
            </button>

            {/* Speaking Language Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 font-normal hidden sm:inline">Voice:</span>
              <select
                value={spokenLang}
                onChange={(e) => setSpokenLang(e.target.value as SpokenLanguage)}
                className="bg-transparent text-slate-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
                title="Language you will speak"
              >
                <option value="assamese" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  অসমীয়া (Assamese)
                </option>
                <option value="english" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  English
                </option>
                <option value="hindi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  हिन्दी (Hindi)
                </option>
                <option value="hinglish" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  Hinglish
                </option>
              </select>
            </div>

            {/* Translation Output Option */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Globe2 size={13} className="text-violet-500 shrink-0" />
              <span className="text-slate-400 font-normal hidden sm:inline">Translate:</span>
              <select
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value as TargetLanguage)}
                className="bg-transparent text-slate-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
                title="Select language to translate typing to"
              >
                <option value="same" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  Same as Spoken
                </option>
                <option value="assamese" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  To অসমীয়া (Assamese)
                </option>
                <option value="english" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  To English
                </option>
                <option value="hindi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  To हिन्दी (Hindi)
                </option>
              </select>
            </div>

            {/* Active Status Spinner */}
            {isProcessing && (
              <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1.5 animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                <span>{statusMessage || 'Typing...'}</span>
              </span>
            )}
          </div>

          {/* Right Action Tools: Word docx, PDF, Copy, Upload, Clear */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Simple Audio File Upload */}
            <label
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
              title="Upload existing audio file (mp3, wav, m4a)"
            >
              <UploadCloud size={13} className="text-emerald-500" />
              <span className="hidden sm:inline">Upload Audio</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!rawTranscript}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition flex items-center gap-1 disabled:opacity-40"
              title="Copy all text"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span className="hidden md:inline">Copy</span>
            </button>

            {/* Word .docx Export */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx || !rawTranscript.trim()}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 shadow-xs"
              title="Download Microsoft Word document"
            >
              <Download size={13} />
              <span>Word (.docx)</span>
            </button>

            {/* PDF / Print */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={!rawTranscript.trim()}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition flex items-center gap-1 disabled:opacity-40"
              title="Print or Save as Vector PDF"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => {
                if (rawTranscript && confirm('Are you sure you want to clear the transcript?')) {
                  setRawTranscript('');
                }
              }}
              disabled={!rawTranscript}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 transition disabled:opacity-30"
              title="Clear transcript"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Editor Body: Clean Full Width Document Surface */}
        <div className="p-5 sm:p-8 space-y-4">
          {/* Editable Document Title */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full text-base sm:text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 -ml-1 transition"
              placeholder="Document Title..."
            />
            <div className="text-xs font-mono text-slate-400 shrink-0 ml-4">
              {wordCount} words • {charCount} chars
            </div>
          </div>

          {/* Full Width Textarea (Direct Auto-Typing in Real Time) */}
          <textarea
            rows={16}
            value={rawTranscript}
            onChange={(e) => setRawTranscript(e.target.value)}
            placeholder="Tap 'Tap to Speak' above and speak in Assamese, English, or Hindi. Your voice will automatically type here in real time with high accuracy. You can also edit, paste, or format anytime..."
            className="w-full min-h-[380px] p-2 bg-transparent text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed font-sans focus:outline-none resize-y placeholder:text-slate-400/80"
          />
        </div>
      </div>
    </div>
  );
}
