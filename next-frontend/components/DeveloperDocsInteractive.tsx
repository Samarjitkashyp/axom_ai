'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Zap,
  Globe,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Layers,
  Server,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  Clock,
  Play,
  RotateCcw,
  Sliders,
  Send,
  Trash2,
  Smartphone,
  AppWindow,
  FileCode,
  Laptop,
  Mic,
  Volume2,
  Radio,
  FileAudio,
  UploadCloud
} from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  contextWindow: string;
  latency: string;
  bestFor: string;
}

const PUBLIC_DEMO_KEY = 'sk_live_axom_demo_public_preview_2026';

const MODELS: ModelInfo[] = [
  {
    id: 'axom-indic-1',
    name: 'Axom Indic-1 (Flagship)',
    badge: 'Recommended',
    description: 'Proprietary Assamese, Hindi, and English high-reasoning multimodal engine with native script purification (ৰ/র correction).',
    contextWindow: '32,768 tokens',
    latency: '< 800ms',
    bestFor: 'General conversational AI, Assamese literature, education, document analysis, and citizen queries.',
  },
  {
    id: 'axom-fast',
    name: 'Axom Fast (Turbo Edge)',
    badge: 'Ultra Fast',
    description: 'High-speed, sub-second inference engine optimized for instantaneous interactive applications and high-throughput pipelines.',
    contextWindow: '8,192 tokens',
    latency: '< 300ms',
    bestFor: 'Real-time chatbots, voice assistants, classification, and sentiment extraction.',
  },
  {
    id: 'axom-pro',
    name: 'Axom Pro (Deep Reasoning)',
    badge: 'Pro Reasoning',
    description: 'High-reasoning multimodal model capable of deep mathematical analysis, coding, and multi-page document inspection.',
    contextWindow: '64,000 tokens',
    latency: '~1.2s',
    bestFor: 'STEM problem solving, code generation, in-depth research, and legal/financial drafting.',
  },
  {
    id: 'axom-voice-indic',
    name: 'Axom Voice Indic (STT)',
    badge: 'Sovereign Audio',
    description: 'Indigenous Assamese & Indic Speech-to-Text neural pipeline with acoustic phoneme decoding, anti-hallucination guardrails, and pure orthography (ৰ/ৱ).',
    contextWindow: '25 MB / 10 mins',
    latency: '< 1.2s',
    bestFor: 'Assamese voice typing, media transcription, WhatsApp voice bots, IVR customer support, and legal court documentation.',
  },
];

export default function DeveloperDocsInteractive() {
  // Developer Testing Key State (Session Only)
  const [userKey, setUserKey] = useState<string>(PUBLIC_DEMO_KEY);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // Developer Subscription Pricing Cycle State (Monthly vs Annual - Save 20%)
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Quickstart Tab
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl' | 'translate' | 'voice'>('python');

  // Full-Stack Architecture Tab (Mobile, Web, PHP, Python, JS)
  const [activeStack, setActiveStack] = useState<'mobile' | 'web' | 'php' | 'python' | 'node'>('mobile');

  // Active Endpoint Tab in Documentation
  const [activeEndpoint, setActiveEndpoint] = useState<'chat' | 'audio' | 'translate' | 'models'>('chat');

  // Live Playground State
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<'chat' | 'audio' | 'translate' | 'models'>('chat');
  const [chatModel, setChatModel] = useState<string>('axom-indic-1');
  const [chatPrompt, setChatPrompt] = useState<string>('নমস্কাৰ! আপুনি মোক কি কি বিষয়ত সহায় কৰিব পাৰিব?');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [translateText, setTranslateText] = useState<string>('Artificial Intelligence is empowering the youth of Assam.');
    const [translateTarget, setTranslateTarget] = useState<string>('as');

  // Audio Playground State
  const [audioModel, setAudioModel] = useState<string>('axom-voice-indic');
  const [audioLanguage, setAudioLanguage] = useState<string>('as');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const mediaRecorderRef = React.useRef<any>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerIntervalRef = React.useRef<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseViewMode, setResponseViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [responseCopied, setResponseCopied] = useState<boolean>(false);

  // Custom Dropdown states
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const modelDropdownRef = React.useRef<HTMLDivElement>(null);
  const langDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Markdown renderer helper for clean formatted preview (removes raw ** and renders bold, bullets, headings)
  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    const formatInline = (str: string): React.ReactNode => {
      const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={i} className="italic text-slate-300">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-xs border border-purple-500/20"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
        return;
      }

      // Headings (###)
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4
            key={`h4-${index}`}
            className="text-sm sm:text-base font-bold text-emerald-400 mt-3 mb-1 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {formatInline(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-base sm:text-lg font-bold text-white mt-4 mb-1.5"
          >
            {formatInline(trimmed.slice(3))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-lg sm:text-xl font-bold text-white mt-4 mb-2"
          >
            {formatInline(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // Bullet points (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <div key={`bullet-${index}`} className="flex items-start gap-2.5 ml-1 my-1">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-2 shrink-0"></span>
            <span className="text-slate-200 leading-relaxed text-xs sm:text-sm">
              {formatInline(trimmed.slice(2))}
            </span>
          </div>
        );
        return;
      }

      // Normal paragraph
      elements.push(
        <p
          key={`p-${index}`}
          className="text-slate-200 leading-relaxed text-xs sm:text-sm my-1"
        >
          {formatInline(line)}
        </p>
      );
    });

    return elements;
  };

  const handleCopyResponse = () => {
    if (!apiResponse) return;
    let textToCopy = '';
    if (responseViewMode === 'formatted') {
      if (apiResponse?.choices?.[0]?.message?.content) {
        textToCopy = apiResponse.choices[0].message.content;
      } else if (apiResponse?.text) {
        textToCopy = apiResponse.text;
      } else if (apiResponse?.translated_text) {
        textToCopy = apiResponse.translated_text;
      } else {
        textToCopy = JSON.stringify(apiResponse, null, 2);
      }
    } else {
      textToCopy = JSON.stringify(apiResponse, null, 2);
    }
    navigator.clipboard.writeText(textToCopy);
    setResponseCopied(true);
    setTimeout(() => setResponseCopied(false), 2000);
  };

  // Load key from sessionStorage on mount (never leaves user browser)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('axom_docs_dev_key');
      if (saved) setUserKey(saved);
    } catch {}
  }, []);

  const handleSaveKey = (val: string) => {
    const trimmed = val.trim();
    setUserKey(trimmed);
    try {
      if (trimmed) {
        sessionStorage.setItem('axom_docs_dev_key', trimmed);
      } else {
        sessionStorage.removeItem('axom_docs_dev_key');
      }
    } catch {}
  };

  const handleUseDemoKey = () => {
    handleSaveKey(PUBLIC_DEMO_KEY);
    setShowKey(true);
  };

  const handleClearKey = () => {
    setUserKey('');
    try {
      sessionStorage.removeItem('axom_docs_dev_key');
    } catch {}
  };

  const copyToClipboard = (text: string, isSnippet = false) => {
    navigator.clipboard.writeText(text);
    if (isSnippet) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const isUsingDemo = userKey === PUBLIC_DEMO_KEY;
  const activeKeyForSnippets = userKey || 'sk_live_axom_••••••••••••••••••••••••••••••••••••••••';

  // Helper to generate a small valid 16kHz mono WAV tone blob for instant testing without mic
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const createSampleAudioBlob = (): Blob => {
    const sampleRate = 16000;
    const duration = 1.0;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.2;
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        setSelectedAudioFile(null);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert('Microphone access denied or unavailable: ' + (err?.message || ''));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Live Playground API Trigger
  const runLiveTest = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setHttpStatus(null);
    setResponseTimeMs(null);

    const startTime = performance.now();

    try {
      let url = '/v1/chat/completions';
      let options: RequestInit = {};
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userKey) {
        headers['Authorization'] = `Bearer ${userKey}`;
      }

      if (playgroundEndpoint === 'chat') {
        url = '/v1/chat/completions';
        options = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: chatModel,
            messages: [
              { role: 'system', content: 'You are Axom AI assistant.' },
              { role: 'user', content: chatPrompt },
            ],
            temperature: temperature,
          }),
        };
      } else if (playgroundEndpoint === 'translate') {
        url = '/v1/translate';
        options = {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: translateText,
            source_lang: 'en',
            target_lang: translateTarget,
          }),
        };
      } else if (playgroundEndpoint === 'audio') {
        url = '/v1/audio/transcriptions';
        const formData = new FormData();
        if (selectedAudioFile) {
          formData.append('file', selectedAudioFile);
        } else if (recordedAudioBlob) {
          formData.append('file', recordedAudioBlob, 'recording.webm');
        } else {
          const sampleBlob = createSampleAudioBlob();
          formData.append('file', sampleBlob, 'sample_assamese.wav');
        }
        formData.append('model', audioModel || 'axom-voice-indic');
        formData.append('language', audioLanguage || 'as');
        formData.append('response_format', 'verbose_json');

        const audioHeaders: Record<string, string> = {};
        if (userKey) {
          audioHeaders['Authorization'] = `Bearer ${userKey}`;
        }
        options = {
          method: 'POST',
          headers: audioHeaders,
          body: formData,
        };
      } else if (playgroundEndpoint === 'models') {
        url = '/v1/models';
        options = {
          method: 'GET',
          headers,
        };
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      setHttpStatus(res.status);
      setResponseTimeMs(elapsed);

      let data: any;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Non-JSON response from server' };
      }
      setApiResponse(data);
    } catch (err: any) {
      const endTime = performance.now();
      setHttpStatus(0);
      setResponseTimeMs(Math.round(endTime - startTime));
      setApiResponse({ error: err?.message || 'Network request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quickstart Code Snippets
  const voiceSnippet = `from openai import OpenAI
import os

# 1. Initialize client with Axom AI base URL
client = OpenAI(
    base_url="https://aiaxom.co.in/v1",
    api_key=os.environ.get("AXOM_API_KEY", "${activeKeyForSnippets}")
)

# 2. Transcribe Assamese audio with authentic orthography (ৰ/ৱ) & anti-hallucination
with open("speech.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="axom-voice-indic",
        file=audio_file,
        language="as",
        response_format="verbose_json"
    )

# 3. Print verified Assamese transcript
print("Transcript:", transcript.text)
print("Duration:", transcript.duration, "seconds")`;

  const pythonSnippet = `from openai import OpenAI
import os

# 1. Initialize client with Axom AI base URL
client = OpenAI(
    base_url="https://aiaxom.co.in/v1",
    api_key=os.environ.get("AXOM_API_KEY", "${activeKeyForSnippets}")
)

# 2. Query Axom Indic-1 with full OpenAI compatibility
response = client.chat.completions.create(
    model="axom-indic-1",
    messages=[
        {"role": "system", "content": "You are Axom AI, a helpful Assamese language assistant."},
        {"role": "user", "content": "অসমৰ ঐতিহ্য আৰু প্ৰধান উৎসৱসমূহৰ বিষয়ে চমুকৈ কওক।"}
    ],
    temperature=0.7
)

# 3. Print the purified Assamese response
print(response.choices[0].message.content)`;

  const nodeSnippet = `import OpenAI from 'openai';

// 1. Point standard OpenAI SDK to Axom AI
const openai = new OpenAI({
  baseURL: 'https://aiaxom.co.in/v1',
  apiKey: process.env.AXOM_API_KEY || '${activeKeyForSnippets}',
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'axom-indic-1',
    messages: [
      { role: 'system', content: 'You are Axom AI, a helpful Assamese AI assistant.' },
      { role: 'user', content: 'অসমৰ প্ৰধান অৰ্থনৈতিক উৎসসমূহ কি কি?' }
    ],
    temperature: 0.7
  });

  console.log(completion.choices[0].message.content);
}

main();`;

  const curlSnippet = `curl -X POST https://aiaxom.co.in/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${activeKeyForSnippets}" \
  -d '{
    "model": "axom-indic-1",
    "messages": [
      {
        "role": "user",
        "content": "নমস্কাৰ, আপুনি মোক কেনেদৰে সহায় কৰিব পাৰে?"
      }
    ],
    "temperature": 0.7
  }'`;

  const translateSnippet = `curl -X POST https://aiaxom.co.in/v1/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${activeKeyForSnippets}" \
  -d '{
    "text": "Artificial Intelligence is transforming Assam.",
    "source_lang": "en",
    "target_lang": "as"
  }'`;

  // Full-Stack Architecture Code Snippets
  const flutterSnippet = `// Flutter / Dart (mobile app integration via your backend API proxy)
// Security Standard: Never embed secret keys in APK binaries! Route calls through your backend.

import 'dart:convert';
import 'package:http/http.dart' as http;

Future<String> askAxomAI(String userPrompt) async {
  // Option A: Via your secure mobile backend proxy (Recommended)
  final url = Uri.parse('https://your-api.com/api/chat');
  
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'prompt': userPrompt,
      'model': 'axom-indic-1'
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['reply'];
  } else {
    throw Exception('Failed to connect to Axom AI');
  }
}`;

  const nextjsSnippet = `// Next.js App Router (app/api/chat/route.ts)
// Server-side Route Handler: Secret key is never exposed to the client browser!

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://aiaxom.co.in/v1',
  apiKey: process.env.AXOM_API_KEY, // Stored safely in .env.local
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await client.chat.completions.create({
      model: 'axom-indic-1',
      messages: [
        { role: 'system', content: 'You are Axom AI assistant.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`;

  const phpSnippet = `<?php
// PHP / Laravel / WordPress Backend Integration
// Uses cURL to securely query Axom AI from your Linux server

$apiKey = getenv('AXOM_API_KEY') ?: '${activeKeyForSnippets}';
$apiUrl = 'https://aiaxom.co.in/v1/chat/completions';

$payload = json_encode([
    'model' => 'axom-indic-1',
    'messages' => [
        ['role' => 'system', 'content' => 'You are Axom AI assistant.'],
        ['role' => 'user', 'content' => 'অসমৰ প্ৰধান পৰ্যটনস্থলীসমূহ কি কি?']
    ],
    'temperature' => 0.7
]);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);
echo $result['choices'][0]['message']['content'];
?>`;

  const fastapiSnippet = `# Python FastAPI Backend (main.py)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()

client = OpenAI(
    base_url="https://aiaxom.co.in/v1",
    api_key=os.environ.get("AXOM_API_KEY") # Safe backend environment
)

class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="axom-indic-1",
            messages=[{"role": "user", "content": req.prompt}],
            temperature=0.7
        )
        return {"content": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))`;

  const expressSnippet = `// Node.js Express Backend (server.js)
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const client = new OpenAI({
  baseURL: 'https://aiaxom.co.in/v1',
  apiKey: process.env.AXOM_API_KEY, // Stored safely on server
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await client.chat.completions.create({
      model: 'axom-indic-1',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`;

  return (
    <div className="w-full space-y-16 py-6">
      {/* 1. Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Zap size={14} /> SDK Standard
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">OpenAI v1</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drop-in replacement</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Lock size={14} /> Security
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Bearer Auth</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Strict TLS 1.3 encryption</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Globe size={14} /> Languages
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Assamese+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Purified ৰ/র orthography</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> Free Quota
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">1,000 / mo</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instant developer tier</div>
        </div>
      </div>

      {/* 2. Official Key Management & Security Section */}
      <section id="api-keys" className="scroll-mt-24 space-y-6">
        <div className="w-full p-6 sm:p-10 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="w-full space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Key size={13} className="text-emerald-600 dark:text-emerald-400" />
              Cryptographic Key Management
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Generate &amp; Manage Your API Secret Keys
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              To guarantee zero quota hijacking and adhere to strict industry security standards, Axom AI secret keys are cryptographically generated, user-bound, and managed inside the dedicated <strong>Axom AI Developer Console</strong>.
            </p>

            {/* Developer Console Launch Card */}
            <div className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 my-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Official Developer Console
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  user.aiaxom.co.in
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Sign in with your developer account to generate new secret keys, monitor real-time monthly usage quotas, set burst rate limits, and instantly revoke compromised keys.
                </p>
              </div>

              <a
                href="https://user.aiaxom.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 shrink-0"
              >
                <span>Open Developer Console</span>
                <ExternalLink size={16} />
              </a>
            </div>

            {/* 3 Steps Visual Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">1</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Sign In or Register</div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Authenticate at user.aiaxom.co.in to protect your account quota.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">2</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">+ Create Secret Key</div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Click Create Key and label your application (e.g. Web App, Mobile).</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">3</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">Save in Environment</div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Export as <code className="font-mono text-emerald-600 dark:text-emerald-400">AXOM_API_KEY</code> and use with standard OpenAI SDK.</p>
              </div>
            </div>

            {/* Interactive Key Sandbox Input for Live Playground & Snippets */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={15} className="text-indigo-600 dark:text-indigo-400" />
                    Documentation Testing Key Sandbox
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Paste your own key or click <strong>&quot;⚡ Use Public Demo Key&quot;</strong> to test live endpoints right on this page.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleUseDemoKey}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <span>⚡ Use Public Demo Key</span>
                  </button>

                  {userKey && (
                    <button
                      onClick={handleClearKey}
                      className="px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={userKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    placeholder="Paste your sk_live_axom_... key or click '⚡ Use Public Demo Key'"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showKey ? 'Mask key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(userKey || '')}
                  disabled={!userKey}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  {copiedKey ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {isUsingDemo && (
                <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <strong>Demo Key Active:</strong> Strictly rate-limited to <strong>5 requests per minute per IP</strong>.
                  </span>
                  <a href="https://user.aiaxom.co.in" target="_blank" className="font-bold underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                    Get 1K Free Personal Key →
                  </a>
                </div>
              )}

              <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-600" />
                <span>Zero telemetry: Key is kept strictly in your local browser sessionStorage and only used for your direct requests.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Developer Subscription Pricing & Capacity Tiers (Placed Above Quickstart) */}
      <section id="pricing" className="scroll-mt-24 space-y-6">
        <div className="w-full p-6 sm:p-10 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700/50 text-indigo-800 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <Layers size={13} className="text-indigo-600 dark:text-indigo-400" />
                  API Plans &amp; Capacity Tiers
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Transparent Developer Pricing
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                  Start in the free sandbox, scale seamlessly as your application grows. High burst rate limits, zero artificial queuing, and transparent billing in Indian Rupees (INR).
                </p>
              </div>

              {/* Monthly / Annual Billing Toggle */}
              <div className="bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 inline-flex items-center shadow-inner self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setPricingCycle('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    pricingCycle === 'monthly'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setPricingCycle('yearly')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    pricingCycle === 'yearly'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                    SAVE 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
              
              {/* Plan 1: Free Developer Sandbox */}
              <div className="rounded-3xl p-6 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Sandbox Tier
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Instant Access
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Free Developer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                    Ideal for prototyping, testing SDKs, hackathons, and personal experimentation.
                  </p>

                  <div className="mt-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">₹0</span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">/ forever</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">No credit card required</div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Calls</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">1,000</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Burst Rate</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">60 RPM</div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>1,000 monthly API requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Mic size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      <span><strong>30 Minutes</strong> Voice STT included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>60 requests / minute burst rate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>1 active API secret key</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Axom Indic-1 AI Model</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Standard community support</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href="https://user.aiaxom.co.in/signup/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition gap-2"
                  >
                    <span>Get Free API Key</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* Plan 2: Starter Developer */}
              <div className="rounded-3xl p-6 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300">
                      Starter Plan
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Light Production
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Starter Developer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                    Designed for indie hackers, commercial mobile backends, and early-stage MVPs.
                  </p>

                  <div className="mt-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        ₹{pricingCycle === 'yearly' ? '159' : '199'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {pricingCycle === 'yearly' ? '₹1,908 billed annually (Save ₹480)' : 'Billed monthly (taxes included)'}
                    </div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Calls</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">5,000</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Burst Rate</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">90 RPM</div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>5,000</strong> monthly API requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Mic size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      <span><strong>300 Mins (5 hrs)</strong> Voice STT included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>90 req/min</strong> burst rate limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Up to <strong>2 active secret keys</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Axom Indic-1 &amp; Turbo access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Automated GST tax invoices</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href="https://user.aiaxom.co.in/login/?next=/subscription/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition gap-2"
                  >
                    <span>Subscribe to Starter</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Plan 3: Pro Developer (Featured / Popular) */}
              <div className="rounded-3xl p-6 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/30 dark:via-slate-900/90 dark:to-slate-900/90 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 flex flex-col justify-between relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-500/30 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-300" />
                  <span>MOST POPULAR</span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 mt-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                      ⚡ High Scale
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Production Ready
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pro Developer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                    Scaling SaaS platforms, commercial backends, and multi-tenant AI agents.
                  </p>

                  <div className="mt-4 pb-4 border-b border-indigo-200 dark:border-indigo-800/60">
                    <div className="flex items-baseline">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        ₹{pricingCycle === 'yearly' ? '399' : '499'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">/ month</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      {pricingCycle === 'yearly' ? '₹4,788 billed annually (Save ₹1,200)' : 'Billed monthly (taxes included)'}
                    </div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60">
                      <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Monthly Calls</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">25,000</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60">
                      <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Burst Rate</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">120 RPM</div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>25,000</strong> monthly API requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Mic size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      <span><strong>1,500 Mins (25 hrs)</strong> Voice STT included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>120 req/min</strong> burst rate limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Up to <strong>5 active secret keys</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Axom Pro Deep Reasoning Engine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Priority Developer Support (4h SLA)</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-800/60">
                  <a
                    href="https://user.aiaxom.co.in/login/?next=/subscription/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition gap-2"
                  >
                    <span>Subscribe to Pro</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Plan 4: Enterprise API */}
              <div className="rounded-3xl p-6 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Enterprise
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                      Zero Queuing
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Enterprise API</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                    Heavy-volume workloads, institutional platforms, and high-concurrency systems.
                  </p>

                  <div className="mt-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                        ₹{pricingCycle === 'yearly' ? '1,199' : '1,499'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">/ month</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      {pricingCycle === 'yearly' ? '₹14,388 billed annually (Save ₹3,600)' : 'Billed monthly (taxes included)'}
                    </div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Calls</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">100,000</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Burst Rate</div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">300 RPM</div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>100,000</strong> monthly API requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Mic size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      <span><strong>6,000 Mins (100 hrs)</strong> Voice STT included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>300 req/min</strong> burst rate limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Up to <strong>10 active secret keys</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Zero-queuing priority model pool</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Dedicated Account Manager &amp; 99.9% SLA</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href="https://user.aiaxom.co.in/login/?next=/subscription/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition gap-2"
                  >
                    <span>Subscribe to Enterprise</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

            </div>

            {/* Account Required Security & Billing Notice */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lock size={16} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Account Authentication Required to Subscribe
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    To activate paid tiers, bind secret API keys, and process payments via Razorpay (UPI, Netbanking, Cards), you must sign in or register on the Developer Console.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="https://user.aiaxom.co.in/login/?next=/subscription/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Sign In to Subscribe</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://user.aiaxom.co.in/signup/?next=/subscription/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5"
                >
                  <span>Create Account</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Multi-Language Quickstart Code Tabs */}
      <section id="quickstart" className="scroll-mt-24 space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Terminal size={14} /> Quickstart Guide
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Integrate in Under 60 Seconds
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Because Axom AI adheres to the standard OpenAI API specification, you can use official OpenAI SDKs or standard HTTP clients without learning a new framework.
          </p>
        </div>

        {/* Code Editor Window */}
        <div className="w-full rounded-2xl border border-slate-800 bg-[#0b1220] text-slate-200 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                quickstart.{activeTab === 'python' ? 'py' : activeTab === 'node' ? 'ts' : 'sh'}
              </span>
            </div>

            {/* Language Selector Tabs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'python'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python (OpenAI)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('node')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'node'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Node.js
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'curl'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('translate')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'translate'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Translation API
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-emerald-300/90 relative group">
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  activeTab === 'python'
                    ? pythonSnippet
                    : activeTab === 'node'
                    ? nodeSnippet
                    : activeTab === 'curl'
                    ? curlSnippet
                    : translateSnippet,
                  true
                )
              }
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-all opacity-80 group-hover:opacity-100"
            >
              {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copiedSnippet ? 'Copied' : 'Copy Code'}
            </button>

            <pre className="text-slate-200">
              {activeTab === 'python' && pythonSnippet}
              {activeTab === 'node' && nodeSnippet}
              {activeTab === 'curl' && curlSnippet}
              {activeTab === 'translate' && translateSnippet}
            </pre>
          </div>
        </div>
      </section>

      {/* 4. FULL-STACK INTEGRATION GUIDES (Mobile, Web, PHP, Python, JS Backend) */}
      <section id="stacks" className="scroll-mt-24 space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Layers size={14} /> Full-Stack Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Integration Guides for Mobile, Web &amp; Backends
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Best practices and production code snippets for every major software architecture.
          </p>
        </div>

        {/* Stack Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveStack('mobile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeStack === 'mobile'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Smartphone size={16} />
            <span>Mobile Apps (Flutter &amp; React Native)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStack('web')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeStack === 'web'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <AppWindow size={16} />
            <span>Websites &amp; Next.js</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStack('php')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeStack === 'php'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileCode size={16} />
            <span>PHP &amp; Laravel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStack('python')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeStack === 'python'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Laptop size={16} />
            <span>Python (FastAPI / Django)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStack('node')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeStack === 'node'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Server size={16} />
            <span>Node.js / Express</span>
          </button>
        </div>

        {/* Stack Content Display */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          {activeStack === 'mobile' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Critical Mobile Security Rule:</strong> Never bundle your secret API key inside an Android APK or iOS IPA binary. Attackers can decompile APKs in seconds and steal your key. Instead, route your mobile app requests through your own secure backend proxy.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-300">{flutterSnippet}</pre>
              </div>
            </div>
          )}

          {activeStack === 'web' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Server-Side Next.js Integration:</strong> By using a Next.js App Router Route Handler (<code className="font-mono">app/api/chat/route.ts</code>), your secret key remains 100% on the server and is never exposed to browser developer tools.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-300">{nextjsSnippet}</pre>
              </div>
            </div>
          )}

          {activeStack === 'php' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
                <Server size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong>PHP / WordPress Integration:</strong> Perfect for connecting WordPress plugins, custom CMS portals, or enterprise Laravel applications to Axom AI via standard cURL with Bearer headers.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-300">{phpSnippet}</pre>
              </div>
            </div>
          )}

          {activeStack === 'python' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                <Zap size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Python FastAPI &amp; Django:</strong> Leverage the official <code className="font-mono">openai</code> Python library as a drop-in replacement. Set <code className="font-mono">base_url=&quot;https://aiaxom.co.in/v1&quot;</code> and run asynchronous inference pipelines.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-300">{fastapiSnippet}</pre>
              </div>
            </div>
          )}

          {activeStack === 'node' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
                <Laptop size={18} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Node.js &amp; Express Microservices:</strong> High-throughput server-side integration using Node.js, Bun, or Deno with standard OpenAI npm packages.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre className="text-emerald-300">{expressSnippet}</pre>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. LIVE INTERACTIVE API PLAYGROUND */}
      <section id="playground" className="scroll-mt-24 space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Play size={14} /> Live Interactive Sandbox
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Test Endpoints Live
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Execute real HTTP requests against the Axom AI production endpoints directly from your browser.
          </p>
        </div>

        <div className="w-full p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Endpoint Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlaygroundEndpoint('chat');
                  setApiResponse(null);
                  setHttpStatus(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  playgroundEndpoint === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">POST</span>
                <span>/v1/chat/completions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlaygroundEndpoint('audio');
                  setApiResponse(null);
                  setHttpStatus(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  playgroundEndpoint === 'audio'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">POST</span>
                <Mic size={13} className="text-amber-400" />
                <span>/v1/audio/transcriptions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlaygroundEndpoint('translate');
                  setApiResponse(null);
                  setHttpStatus(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  playgroundEndpoint === 'translate'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">POST</span>
                <span>/v1/translate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlaygroundEndpoint('models');
                  setApiResponse(null);
                  setHttpStatus(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  playgroundEndpoint === 'models'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">GET</span>
                <span>/v1/models</span>
              </button>
            </div>

            {/* Quick Demo Key Injector in Sandbox Header */}
            {!userKey && (
              <button
                type="button"
                onClick={handleUseDemoKey}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-md hover:from-indigo-600 hover:to-violet-700 transition flex items-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Try with Public Demo Key</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Config Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Request Payload Configuration
                </span>
                {isUsingDemo && (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    ⚡ Demo Key (Max 5 req/min)
                  </span>
                )}
              </div>

              {playgroundEndpoint === 'chat' && (
                <>
                  <div ref={modelDropdownRef} className="relative">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={13} className="text-indigo-600 dark:text-indigo-400" />
                        Target Model
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Active Neural Tier</span>
                    </label>

                    {/* Custom Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelDropdownOpen(!isModelDropdownOpen);
                        setIsLangDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 hover:bg-slate-50 dark:hover:bg-slate-900/90 text-left transition-all duration-150 flex items-center justify-between gap-2 shadow-xs group focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center shrink-0">
                          {chatModel === 'axom-indic-1' ? (
                            <Sparkles size={14} className="text-emerald-500" />
                          ) : chatModel === 'axom-fast' ? (
                            <Zap size={14} className="text-amber-500" />
                          ) : (
                            <Cpu size={14} className="text-purple-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {chatModel}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              chatModel === 'axom-indic-1'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : chatModel === 'axom-fast'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            }`}>
                              {chatModel === 'axom-indic-1' ? 'Flagship' : chatModel === 'axom-fast' ? 'Ultra Fast' : 'Deep Logic'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {chatModel === 'axom-indic-1'
                              ? 'Native Assamese & Indic • 32k context'
                              : chatModel === 'axom-fast'
                              ? 'Sub-second real-time inference'
                              : 'Multi-step STEM & deep reasoning'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 shrink-0 ${
                          isModelDropdownOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </button>

                    {/* Custom Dropdown Menu Popover */}
                    {isModelDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-2 p-1.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        {/* Option 1: axom-indic-1 */}
                        <button
                          type="button"
                          onClick={() => {
                            setChatModel('axom-indic-1');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 ${
                            chatModel === 'axom-indic-1'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles size={15} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                  axom-indic-1
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Recommended
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Native Assamese &amp; Indic multimodal engine with script purification (ৰ/র).
                              </p>
                            </div>
                          </div>
                          {chatModel === 'axom-indic-1' && (
                            <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </button>

                        {/* Option 2: axom-fast */}
                        <button
                          type="button"
                          onClick={() => {
                            setChatModel('axom-fast');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 ${
                            chatModel === 'axom-fast'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Zap size={15} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                  axom-fast
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Sub-300ms
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Ultra-fast throughput engine optimized for interactive bots &amp; edge apps.
                              </p>
                            </div>
                          </div>
                          {chatModel === 'axom-fast' && (
                            <Check size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                        </button>

                        {/* Option 3: axom-pro */}
                        <button
                          type="button"
                          onClick={() => {
                            setChatModel('axom-pro');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 ${
                            chatModel === 'axom-pro'
                              ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700/50'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-700/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Cpu size={15} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                  axom-pro
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  Deep Logic
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Multi-step STEM reasoning, complex coding, and 128k large document synthesis.
                              </p>
                            </div>
                          </div>
                          {chatModel === 'axom-pro' && (
                            <Check size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">User Prompt</label>
                    <textarea
                      rows={4}
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type your question or query here..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Temperature</span>
                      <span>{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {playgroundEndpoint === 'audio' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={13} className="text-violet-600 dark:text-violet-400" />
                        Speech-to-Text Model
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Active Audio Tier</span>
                    </label>
                    <div className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio size={16} className="text-violet-600 dark:text-violet-400 animate-pulse" />
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">axom-voice-indic</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                          Sovereign Audio
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">₹0.25/min (₹0.004/s)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Language ISO
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { code: 'as', label: 'Assamese (অসমীয়া)' },
                        { code: 'en', label: 'English' },
                        { code: 'hi', label: 'Hindi (हिंदी)' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setAudioLanguage(lang.code)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition ${
                            audioLanguage === lang.code
                              ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-500 text-violet-700 dark:text-violet-300 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Recording / Upload Box */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-800/60 bg-violet-50/30 dark:bg-violet-950/20 space-y-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                          <Mic size={14} />
                          <span>Record with Mic</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 animate-pulse"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                          <span>Stop ({recordingSeconds}s)</span>
                        </button>
                      )}

                      <label className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                        <UploadCloud size={14} />
                        <span>Upload Audio File</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedAudioFile(e.target.files[0]);
                              setRecordedAudioBlob(null);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedAudioFile ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 size={13} /> Selected: {selectedAudioFile.name} ({(selectedAudioFile.size / 1024).toFixed(1)} KB)
                        </span>
                      ) : recordedAudioBlob ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 size={13} /> Microphone Recording Ready ({(recordedAudioBlob.size / 1024).toFixed(1)} KB)
                        </span>
                      ) : (
                        <span>Ready to test. You can also click <strong>&quot;Send Request&quot;</strong> directly to test with our built-in Assamese speech audio tone!</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {playgroundEndpoint === 'translate' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Source Text (English)</label>
                    <textarea
                      rows={4}
                      value={translateText}
                      onChange={(e) => setTranslateText(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Source Language</label>
                      <input
                        type="text"
                        disabled
                        value="en (English)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 font-mono"
                      />
                    </div>
                    <div ref={langDropdownRef} className="relative">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Globe size={13} className="text-indigo-600 dark:text-indigo-400" />
                        Target Language
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setIsLangDropdownOpen(!isLangDropdownOpen);
                          setIsModelDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 hover:bg-slate-50 dark:hover:bg-slate-900/90 text-left transition-all duration-150 flex items-center justify-between gap-2 shadow-xs group focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                            {translateTarget}
                          </span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {translateTarget === 'as'
                              ? 'Assamese (অসমীয়া)'
                              : translateTarget === 'hi'
                              ? 'Hindi (हिन्दी)'
                              : translateTarget === 'bn'
                              ? 'Bengali (বাংলা)'
                              : 'English'}
                          </span>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 shrink-0 ${
                            isLangDropdownOpen ? 'rotate-180 text-indigo-500' : ''
                          }`}
                        />
                      </button>

                      {/* Language Dropdown Popover */}
                      {isLangDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-2 p-1.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl space-y-1 animate-in fade-in zoom-in-95 duration-100">
                          {[
                            { code: 'as', label: 'Assamese (অসমীয়া - Purified)', badge: 'Native' },
                            { code: 'hi', label: 'Hindi (हिन्दी)', badge: 'Indic' },
                            { code: 'bn', label: 'Bengali (বাংলা)', badge: 'Indic' },
                            { code: 'en', label: 'English (US/UK)', badge: 'Global' }
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setTranslateTarget(lang.code);
                                setIsLangDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between text-xs ${
                                translateTarget === lang.code
                                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold border border-indigo-200 dark:border-indigo-800/50'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                  {lang.code}
                                </span>
                                <span>{lang.label}</span>
                              </div>
                              {translateTarget === lang.code && (
                                <Check size={14} className="text-indigo-600 dark:text-indigo-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {playgroundEndpoint === 'models' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <p>GET /v1/models queries the active catalog of models running on the Axom AI cluster.</p>
                  <p className="mt-2 font-mono text-[11px] text-slate-500">Requires Bearer key authorization header.</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={runLiveTest}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw size={16} className="animate-spin" />
                      <span>Executing Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Send Live Request</span>
                    </>
                  )}
                </button>
                {!userKey && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>No key entered. Click &quot;Try with Public Demo Key&quot; above or test 401 Unauthorized handling.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Output Inspector Panel with Formatted & Raw JSON View */}
            <div className="space-y-2 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Live Server Response</span>
                  {httpStatus !== null && (
                    <span className="flex items-center gap-1.5 normal-case font-normal">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          httpStatus === 200
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : httpStatus === 401
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        HTTP {httpStatus}
                      </span>
                      {responseTimeMs !== null && (
                        <span className="text-[11px] text-slate-400 font-mono font-normal">
                          {responseTimeMs}ms
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* View Mode Toggle: Formatted vs Raw JSON */}
                {apiResponse && (
                  <div className="flex items-center gap-2 normal-case font-normal">
                    <div className="inline-flex items-center rounded-xl bg-slate-200/90 dark:bg-slate-800/90 p-0.5 border border-slate-300/80 dark:border-slate-700/80 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setResponseViewMode('formatted')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          responseViewMode === 'formatted'
                            ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Sparkles size={13} className={responseViewMode === 'formatted' ? 'text-emerald-500' : ''} />
                        <span>Formatted Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseViewMode('raw')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          responseViewMode === 'raw'
                            ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Code size={13} className={responseViewMode === 'raw' ? 'text-purple-500' : ''} />
                        <span>Raw JSON</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyResponse}
                      className="px-2.5 py-1 rounded-lg bg-slate-200/90 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all flex items-center gap-1 border border-slate-300/60 dark:border-slate-700/60"
                      title="Copy response"
                    >
                      {responseCopied ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-[280px] max-h-[420px] rounded-2xl bg-[#0b1220] p-4 sm:p-5 text-slate-200 overflow-auto border border-slate-800 shadow-inner">
                {apiResponse ? (
                  responseViewMode === 'formatted' ? (
                    /* Formatted Preview Mode */
                    <div className="space-y-3 font-sans">
                      {apiResponse?.text !== undefined ? (
                        <div>
                          {/* Audio Metadata Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                              <span className="font-semibold text-white">
                                {apiResponse.model || 'axom-voice-indic'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 text-[10px] font-mono border border-violet-500/30">
                                Transcribed Audio
                              </span>
                            </div>
                            {apiResponse?.duration && (
                              <div className="text-[11px] text-emerald-400 font-mono">
                                Processed {apiResponse.duration}s Audio (Language: {apiResponse.language || 'assamese'})
                              </div>
                            )}
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                              <Mic size={13} className="text-violet-400" />
                              <span>Purified Assamese Transcription Result:</span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                              {apiResponse.text || <span className="text-slate-400 italic">Zero speech detected (Audio below minimum silence threshold)</span>}
                            </p>
                          </div>
                        </div>
                      ) : apiResponse?.choices?.[0]?.message?.content ? (
                        <div>
                          {/* Metadata Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span className="font-semibold text-white">
                                {apiResponse.model || 'Axom Model'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                                Assistant Reply
                              </span>
                            </div>
                            {apiResponse?.usage && (
                              <div className="text-[11px] text-slate-400 font-mono">
                                Total {apiResponse.usage.total_tokens} tokens ({apiResponse.usage.prompt_tokens} in • {apiResponse.usage.completion_tokens} out)
                              </div>
                            )}
                          </div>

                          {/* Markdown Rendered Content */}
                          <div className="space-y-2 text-slate-200">
                            {renderMarkdownText(apiResponse.choices[0].message.content)}
                          </div>
                        </div>
                      ) : apiResponse?.translated_text ? (
                        /* Translation Result */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <Sparkles size={13} />
                              Neural Translation Output
                            </span>
                            <span className="font-mono text-[11px]">
                              {apiResponse.source_language || 'auto'} → {apiResponse.target_language || translateTarget}
                            </span>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-200 text-sm sm:text-base leading-relaxed">
                            {apiResponse.translated_text}
                          </div>
                        </div>
                      ) : apiResponse?.data && Array.isArray(apiResponse.data) ? (
                        /* Models List */
                        <div className="space-y-2">
                          <div className="text-xs text-slate-400 pb-2 border-b border-white/10 flex items-center justify-between">
                            <span>Available Production Models ({apiResponse.data.length})</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {apiResponse.data.map((m: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="font-mono text-xs font-bold text-white">{m.id}</div>
                                  <div className="text-[10px] text-slate-400">Owner: {m.owned_by || 'axom-ai'}</div>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Active
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : apiResponse?.error ? (
                        /* API Error Presentation */
                        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-2">
                          <div className="flex items-center gap-2 font-bold text-rose-300">
                            <AlertCircle size={16} />
                            <span>{apiResponse.error.code ? `Error: ${apiResponse.error.code}` : 'API Error'}</span>
                          </div>
                          <p className="leading-relaxed">
                            {apiResponse.error.message || JSON.stringify(apiResponse.error)}
                          </p>
                        </div>
                      ) : (
                        /* Generic Object Fallback */
                        <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed font-mono text-xs">
                          {JSON.stringify(apiResponse, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    /* Raw JSON View */
                    <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed font-mono text-xs">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                    <Terminal size={32} className="opacity-40 mb-2" />
                    <span>Click &quot;Send Live Request&quot; to test the endpoint.</span>
                    <span className="text-[11px] opacity-70 mt-1">Formatted Preview and Raw JSON output will appear here.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Enterprise Security & Architecture Section */}
      <section id="security" className="scroll-mt-24 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Lock size={14} /> Security Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Enterprise Security &amp; Compliance
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Axom AI endpoints are engineered according to OWASP API Security Top 10 standards to protect high-concurrency production applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Bearer Authorization</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              API keys must strictly be transmitted via the <code className="font-mono text-emerald-600 dark:text-emerald-400">Authorization: Bearer &lt;key&gt;</code> HTTP header. Passing keys via URL query strings is blocked to prevent intermediate proxy access-log leakage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Server size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Client-Side Exposure</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Never bundle secret keys into client-side SPAs or mobile binaries where users can inspect network requests. Always route queries through a backend server (e.g. Next.js API route or Express proxy).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sliding-Window Rate Limits</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In-memory token bucket rate limiters protect the cluster against burst floods, DDoS attempts, and runaway billings. When thresholds are reached, requests receive an immediate 429 status code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Secret Scanner Ready</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              All secret keys begin with the deterministic prefix <code className="font-mono text-emerald-600 dark:text-emerald-400">sk_live_axom_</code>, allowing automated tools like GitHub Secret Scanning and GitGuardian to automatically catch accidentally committed keys.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <RotateCcw size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Instant Key Invalidation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If an API key is ever compromised, it can be revoked instantly inside the Developer Console. The cache lookup is deleted in milliseconds, cutting off unauthorized requests immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict TLS 1.3 Encryption</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              All endpoints require modern TLS 1.3 ciphers with forward secrecy. Plain HTTP connections are unconditionally dropped or upgraded with HTTP Strict Transport Security (HSTS).
            </p>
          </div>
        </div>
      </section>

      {/* 7. Models Specification */}
      <section id="models" className="scroll-mt-24 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Cpu size={14} /> Model Lineup
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Available Inference Models
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Select the appropriate model name in your API request payload (<code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">&quot;model&quot;: &quot;axom-indic-1&quot;</code>).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODELS.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {m.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef9c3] dark:bg-amber-950/60 text-[#854d0e] dark:text-amber-300 border border-[#fde047] dark:border-amber-700/50">
                    {m.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{m.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {m.description}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Context:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{m.contextWindow}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{m.latency}</strong>
                </div>
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 font-sans italic">
                  Best for: {m.bestFor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. API Endpoints Reference */}
      <section id="endpoints" className="scroll-mt-24 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Layers size={14} /> Endpoints Reference
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            API Endpoints Specification
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Every request must include your secret API key in the <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">Authorization: Bearer &lt;key&gt;</code> header.
          </p>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveEndpoint('chat')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeEndpoint === 'chat'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-xs font-mono">POST</span>
            /v1/chat/completions
          </button>
          <button
            type="button"
            onClick={() => setActiveEndpoint('audio')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeEndpoint === 'audio'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-xs font-mono">POST</span>
            <Mic size={13} className="text-amber-300" />
            /v1/audio/transcriptions
          </button>
          <button
            type="button"
            onClick={() => setActiveEndpoint('translate')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeEndpoint === 'translate'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-xs font-mono">POST</span>
            /v1/translate
          </button>
          <button
            type="button"
            onClick={() => setActiveEndpoint('models')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeEndpoint === 'models'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-xs font-mono">GET</span>
            /v1/models
          </button>
        </div>

        {/* Tab 1: /v1/chat/completions */}
        {activeEndpoint === 'chat' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                  POST
                </span>
                <code className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  https://aiaxom.co.in/v1/chat/completions
                </code>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Creates a model response for the given chat conversation. Supports multilingual prompt understanding with automatic Assamese grammar &amp; character purification.
              </p>

              {/* Request Parameters Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 font-semibold">Parameter</th>
                      <th className="py-2.5 font-semibold">Type</th>
                      <th className="py-2.5 font-semibold">Required</th>
                      <th className="py-2.5 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">messages</td>
                      <td className="py-2.5 font-mono text-slate-500">array</td>
                      <td className="py-2.5 font-semibold text-amber-600">Yes</td>
                      <td className="py-2.5">A list of messages comprising the conversation so far (<code className="font-mono">[&#123;&quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;...&quot;&#125;]</code>).</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">model</td>
                      <td className="py-2.5 font-mono text-slate-500">string</td>
                      <td className="py-2.5 text-slate-400">Optional</td>
                      <td className="py-2.5">ID of the model to use. Defaults to <code className="font-mono">axom-indic-1</code>. Also supports <code className="font-mono">axom-fast</code> and <code className="font-mono">axom-pro</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">temperature</td>
                      <td className="py-2.5 font-mono text-slate-500">number</td>
                      <td className="py-2.5 text-slate-400">Optional</td>
                      <td className="py-2.5">What sampling temperature to use, between 0 and 2. Default is 0.7.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">language</td>
                      <td className="py-2.5 font-mono text-slate-500">string</td>
                      <td className="py-2.5 text-slate-400">Optional</td>
                      <td className="py-2.5">Enforce output language: <code className="font-mono">&quot;assamese&quot;</code> (default), <code className="font-mono">&quot;english&quot;</code>, or <code className="font-mono">&quot;hindi&quot;</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Response */}
            <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200">
              <div className="text-xs font-mono text-slate-400 mb-2">// 200 OK Response (Standard OpenAI JSON)</div>
              <pre className="font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
{`{
  "id": "chatcmpl-axom-7f82c9e13d4b",
  "object": "chat.completion",
  "created": 1730193600,
  "model": "axom-indic-1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "নমস্কাৰ! মই Axom AI। অসমৰ সংস্কৃতি আৰু ভাষা সংৰক্ষণৰ বাবে মই আপোনাক সহায় কৰিবলৈ সাজু।"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 32,
    "total_tokens": 46
  }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab: /v1/audio/transcriptions */}
        {activeEndpoint === 'audio' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 font-mono text-xs font-bold">
                  POST
                </span>
                <code className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white">
                  https://aiaxom.co.in/v1/audio/transcriptions
                </code>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Standard OpenAI-compatible Speech-to-Text endpoint. Transcribes binary audio files (mp3, wav, m4a, webm, ogg) into authentic Assamese and Indic text with automatic Bengali script purification (ৰ/ৱ correction) and acoustic anti-hallucination guardrails.
              </p>
            </div>

            {/* Request Headers */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Headers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="py-2 font-mono">Header</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-600 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">Authorization</td>
                      <td className="py-2.5 text-slate-400">string</td>
                      <td className="py-2.5 font-sans">Required. Bearer authentication token: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Bearer sk_live_...</code></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">Content-Type</td>
                      <td className="py-2.5 text-slate-400">string</td>
                      <td className="py-2.5 font-sans">Required. Must be <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">multipart/form-data</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Request Form Parameters */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Multipart Form Parameters</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="py-2 font-mono">Parameter</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-600 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">file</td>
                      <td className="py-2.5 text-slate-400">binary</td>
                      <td className="py-2.5 font-sans">Required. Binary audio recording. Max size 25MB. Supports MP3, WAV, M4A, WEBM, OGG.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">model</td>
                      <td className="py-2.5 text-slate-400">string</td>
                      <td className="py-2.5 font-sans">Optional. Default: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&quot;axom-voice-indic&quot;</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">language</td>
                      <td className="py-2.5 text-slate-400">string</td>
                      <td className="py-2.5 font-sans">Optional. ISO 639-1 language code (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&quot;as&quot;</code> for Assamese, <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&quot;en&quot;</code>, <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&quot;hi&quot;</code>).</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">response_format</td>
                      <td className="py-2.5 text-slate-400">string</td>
                      <td className="py-2.5 font-sans">Optional. <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&quot;json&quot;</code> (default) or <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&quot;verbose_json&quot;</code> (includes duration and metadata).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Response Example */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Response Specification (200 OK)</span>
                <span className="text-xs font-mono text-emerald-400">application/json</span>
              </h3>
              <pre className="text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`{
  "task": "transcribe",
  "language": "assamese",
  "duration": 4.25,
  "text": "নমস্কাৰ! আপোনাৰ দিনটো শুভ হওক।"
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: /v1/translate */}
        {activeEndpoint === 'translate' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                  POST
                </span>
                <code className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  https://aiaxom.co.in/v1/translate
                </code>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Direct neural translation endpoint optimized for Assamese, English, and Indic regional languages with context retention.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 font-semibold">Parameter</th>
                      <th className="py-2.5 font-semibold">Type</th>
                      <th className="py-2.5 font-semibold">Required</th>
                      <th className="py-2.5 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">text</td>
                      <td className="py-2.5 font-mono text-slate-500">string</td>
                      <td className="py-2.5 font-semibold text-amber-600">Yes</td>
                      <td className="py-2.5">The string text to translate.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">source_lang</td>
                      <td className="py-2.5 font-mono text-slate-500">string</td>
                      <td className="py-2.5 text-slate-400">Optional</td>
                      <td className="py-2.5">Source language code (e.g. <code className="font-mono">&quot;en&quot;</code>). Default is <code className="font-mono">&quot;en&quot;</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400">target_lang</td>
                      <td className="py-2.5 font-mono text-slate-500">string</td>
                      <td className="py-2.5 text-slate-400">Optional</td>
                      <td className="py-2.5">Target language code (e.g. <code className="font-mono">&quot;as&quot;</code> for Assamese, <code className="font-mono">&quot;hi&quot;</code> for Hindi). Default is <code className="font-mono">&quot;as&quot;</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200">
              <div className="text-xs font-mono text-slate-400 mb-2">// 200 OK Response</div>
              <pre className="font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
{`{
  "success": true,
  "source_lang": "en",
  "target_lang": "as",
  "original_text": "Artificial Intelligence is transforming regional education in Assam.",
  "translated_text": "কৃত্ৰিম বুদ্ধিমত্তাই অসমত আঞ্চলিক শিক্ষা ব্যৱস্থাক ৰূপান্তৰিত কৰিছে।"
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: /v1/models */}
        {activeEndpoint === 'models' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold">
                  GET
                </span>
                <code className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  https://aiaxom.co.in/v1/models
                </code>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Lists all currently available models and their capabilities. No request body required.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6 text-slate-200">
              <div className="text-xs font-mono text-slate-400 mb-2">// 200 OK Response</div>
              <pre className="font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
{`{
  "object": "list",
  "data": [
    {
      "id": "axom-indic-1",
      "object": "model",
      "created": 1730000000,
      "owned_by": "axom-ai",
      "description": "Primary Assamese, Hindi, and English high-reasoning multimodal model"
    },
    {
      "id": "axom-fast",
      "object": "model",
      "created": 1730000000,
      "owned_by": "axom-ai",
      "description": "Axom Turbo: Sub-second high-throughput neural inference engine optimized for real-time bots and edge devices"
    },
    {
      "id": "axom-pro",
      "object": "model",
      "created": 1730000000,
      "owned_by": "axom-ai",
      "description": "Axom Deep Reasoning: Advanced STEM problem-solving, multi-step logic, and 128k large-context document processing"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* 9. Rate Limits & Error Handling */}
      <section id="rate-limits" className="scroll-mt-24 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Lock size={14} /> Quotas &amp; Error Standards
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Rate Limits &amp; Error Handling
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Axom AI protects all endpoints with in-memory caching sliding-window rate-limiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rate Limits Table */}
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Tier Quotas</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Free Tier</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">60 req/min • 1,000 req/mo</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Developer Tier</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">120 req/min • 25,000 req/mo</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Business Tier</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">300 req/min • 100,000 req/mo</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Enterprise / Sovereign</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Custom Limits • Dedicated GPUs</span>
              </div>
            </div>
          </div>

          {/* Error Codes Table */}
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">HTTP Status Codes</h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">200</span>
                <span className="text-slate-600 dark:text-slate-400 font-sans">Request succeeded and output returned</span>
              </div>
              <div className="flex items-center gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold">401</span>
                <span className="text-slate-600 dark:text-slate-400 font-sans">Missing or invalid Authorization Bearer key</span>
              </div>
              <div className="flex items-center gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">429</span>
                <span className="text-slate-600 dark:text-slate-400 font-sans">Rate limit exceeded or monthly quota exhausted</span>
              </div>
              <div className="flex items-center gap-3 py-1.5">
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold">500</span>
                <span className="text-slate-600 dark:text-slate-400 font-sans">Model failover inference error</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Need Help / Enterprise CTA */}
      <div className="w-full p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            Enterprise &amp; Sovereign AI
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Need Higher Limits or On-Premise Deployment?</h3>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            For Assam Government departments, banks, universities, or high-volume enterprise pipelines, we offer custom dedicated instances, private VPC peering, and air-gapped on-premise model installations.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow hover:bg-emerald-50 active:scale-98 transition-all"
            >
              Contact Solutions Team <ArrowRight size={15} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
