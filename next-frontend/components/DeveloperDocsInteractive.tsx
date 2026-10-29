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
  Clock,
  Play,
  RotateCcw,
  Sliders,
  Send,
  Trash2,
  HelpCircle
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
    name: 'Axom Fast (Llama-3/Groq)',
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
];

export default function DeveloperDocsInteractive() {
  // Developer Testing Key State (Session Only)
  const [userKey, setUserKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // Active Snippet Tab
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl' | 'translate'>('python');

  // Active Endpoint Tab in Documentation
  const [activeEndpoint, setActiveEndpoint] = useState<'chat' | 'translate' | 'models'>('chat');

  // Live Playground State
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<'chat' | 'translate' | 'models'>('chat');
  const [chatModel, setChatModel] = useState<string>('axom-indic-1');
  const [chatPrompt, setChatPrompt] = useState<string>('নমস্কাৰ! আপুনি মোক কি কি বিষয়ত সহায় কৰিব পাৰিব?');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [translateText, setTranslateText] = useState<string>('Artificial Intelligence is empowering the youth of Assam.');
  const [translateTarget, setTranslateTarget] = useState<string>('as');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

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

  // Masked Key helper for snippets
  const activeKeyForSnippets = userKey || 'sk_live_axom_••••••••••••••••••••••••••••••••••••••••';

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

  // Code Snippets
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

  return (
    <div className="space-y-16 py-6">
      {/* 1. Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Zap size={14} /> SDK Standard
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">OpenAI v1</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drop-in replacement</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Lock size={14} /> Security
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Bearer Auth</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Strict TLS 1.3 encryption</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Globe size={14} /> Languages
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Assamese+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Purified ৰ/র orthography</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> Free Quota
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">1,000 / mo</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instant developer tier</div>
        </div>
      </div>

      {/* 2. Official Key Management & Security Section */}
      <section id="api-keys" className="scroll-mt-24 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Key size={13} className="text-emerald-600 dark:text-emerald-400" />
              Cryptographic Key Management
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Generate &amp; Manage Your API Secret Keys
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              To guarantee zero quota hijacking and adhere to strict industry security standards, Axom AI secret keys are cryptographically generated, user-bound, and managed inside the dedicated <strong>Axom AI Developer Console</strong>.
            </p>

            {/* Developer Console Launch Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 my-4">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Official Developer Console
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white">
                  user.aiaxom.co.in
                </div>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Sign in with your developer account to generate new secret keys, monitor real-time monthly usage quotas, set burst rate limits, and instantly revoke compromised keys.
                </p>
              </div>

              <a
                href="https://user.aiaxom.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 shrink-0"
              >
                <span>Open Developer Console</span>
                <ExternalLink size={15} />
              </a>
            </div>

            {/* 3 Steps Visual Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">1</div>
                <div className="font-bold text-slate-900 dark:text-white">Sign In or Register</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Authenticate at user.aiaxom.co.in to protect your account quota.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">2</div>
                <div className="font-bold text-slate-900 dark:text-white">+ Create Secret Key</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Click Create Key and label your application (e.g. Web App, Mobile).</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">3</div>
                <div className="font-bold text-slate-900 dark:text-white">Save in Environment</div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Export as <code className="font-mono text-emerald-600 dark:text-emerald-400">AXOM_API_KEY</code> and use with standard OpenAI SDK.</p>
              </div>
            </div>

            {/* Interactive Key Sandbox Input for Live Playground & Snippets */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Documentation Testing Key Sandbox
                </label>
                {userKey && (
                  <button
                    onClick={handleClearKey}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Trash2 size={12} /> Clear from browser memory
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Paste your secret key below to automatically update the code snippets and test live API endpoints directly on this page.
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={userKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    placeholder="Paste your sk_live_axom_... key here"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  {copiedKey ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-600" />
                <span>Zero telemetry: Key is kept strictly in your local browser sessionStorage and only used for your direct requests.</span>
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
        <div className="rounded-2xl border border-slate-800 bg-[#0b1220] text-slate-200 shadow-2xl overflow-hidden">
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
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
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

      {/* 4. LIVE INTERACTIVE API PLAYGROUND */}
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

        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Endpoint Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Config Panel */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Request Payload Configuration
              </div>

              {playgroundEndpoint === 'chat' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Model</label>
                    <select
                      value={chatModel}
                      onChange={(e) => setChatModel(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="axom-indic-1">axom-indic-1 (Flagship Assamese/Indic)</option>
                      <option value="axom-fast">axom-fast (Sub-second Groq/Llama-3)</option>
                      <option value="axom-pro">axom-pro (Deep Reasoning & STEM)</option>
                    </select>
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
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Language</label>
                      <select
                        value={translateTarget}
                        onChange={(e) => setTranslateTarget(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="as">as (Assamese - Purified)</option>
                        <option value="hi">hi (Hindi)</option>
                        <option value="bn">bn (Bengali)</option>
                      </select>
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
                      <span>Sending Request...</span>
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
                    <span>No testing key set above. This request will test 401 Unauthorized handling!</span>
                  </p>
                )}
              </div>
            </div>

            {/* Output Inspector Panel */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span>Live Server Response</span>
                {httpStatus !== null && (
                  <span className="flex items-center gap-2">
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

              <div className="flex-1 min-h-[260px] max-h-[360px] rounded-2xl bg-[#0b1220] p-4 text-slate-200 font-mono text-xs overflow-auto border border-slate-800">
                {apiResponse ? (
                  <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                    <Terminal size={32} className="opacity-40 mb-2" />
                    <span>Click &quot;Send Live Request&quot; to test the endpoint.</span>
                    <span className="text-[11px] opacity-70 mt-1">Real JSON output and timing will appear here.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Enterprise Security & Architecture Section */}
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

      {/* 6. Models Specification */}
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

      {/* 7. API Endpoints Reference */}
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
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
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
      "description": "Ultra low-latency Llama-3/Groq powered chat engine"
    },
    {
      "id": "axom-pro",
      "object": "model",
      "created": 1730000000,
      "owned_by": "axom-ai",
      "description": "Google Gemini 2.5 Flash / Pro reasoning engine"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* 8. Rate Limits & Error Handling */}
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

      {/* 9. Need Help / Enterprise CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
            Enterprise &amp; Sovereign AI
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold">Need Higher Limits or On-Premise Deployment?</h3>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            For Assam Government departments, banks, universities, or high-volume enterprise pipelines, we offer custom dedicated instances, private VPC peering, and air-gapped on-premise model installations.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow hover:bg-emerald-50 active:scale-98 transition-all"
            >
              Contact Solutions Team <ArrowRight size={15} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
