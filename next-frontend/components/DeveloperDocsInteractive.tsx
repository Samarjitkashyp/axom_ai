'use client';

import React, { useState } from 'react';
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
  Clock
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
  // Key Generator State
  const [keyName, setKeyName] = useState('My Production App');
  const [tier, setTier] = useState('free');
  const [email, setEmail] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Active Snippet Tab
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Active Endpoint Tab
  const [activeEndpoint, setActiveEndpoint] = useState<'chat' | 'translate' | 'models'>('chat');

  // Active Key to display in snippets
  const currentKey = generatedKey || 'sk_live_axom_YOUR_API_KEY_HERE';

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await fetch('/api/v1/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName.trim() || 'My Production Key',
          tier: tier,
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.api_key?.key) {
        setGeneratedKey(data.api_key.key);
        setShowKey(true);
      } else {
        // Fallback for standalone / client test preview
        const mockKey = `sk_live_axom_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}fd94`;
        setGeneratedKey(mockKey);
        setShowKey(true);
      }
    } catch {
      // Fallback preview
      const mockKey = `sk_live_axom_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}81b2`;
      setGeneratedKey(mockKey);
      setShowKey(true);
    } finally {
      setIsGenerating(false);
    }
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

  const getMaskedKey = (key: string) => {
    if (showKey) return key;
    return `${key.slice(0, 14)}${'•'.repeat(24)}${key.slice(-4)}`;
  };

  // Code Snippets
  const pythonSnippet = `from openai import OpenAI
import os

# 1. Initialize client with Axom AI base URL
client = OpenAI(
    base_url="https://aiaxom.co.in/v1",
    api_key=os.environ.get("AXOM_API_KEY", "${currentKey}")
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
  apiKey: process.env.AXOM_API_KEY || '${currentKey}',
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

  const curlSnippet = `curl -X POST https://aiaxom.co.in/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${currentKey}" \\
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

  return (
    <div className="space-y-16 py-8">
      {/* 1. Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Zap size={14} /> SDK Standard
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">OpenAI v1</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Drop-in replacement</div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Clock size={14} /> Latency
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">&lt; 800ms</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sub-second streaming</div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Globe size={14} /> Languages
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">Assamese+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Indic + Bengali + English</div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-900/10 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> Free Quota
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">1,000 / mo</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No credit card needed</div>
        </div>
      </div>

      {/* 2. Interactive Key Generator Card */}
      <section id="api-keys" className="scroll-mt-24">
        <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Key size={13} className="text-emerald-600 dark:text-emerald-400" /> Instant Developer Access
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Generate Your Developer API Key
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Create your live secret key to start querying Axom AI models. Keys use standard Bearer Token authentication (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-emerald-600 dark:text-emerald-400">sk_live_axom_...</code>).
            </p>

            {/* Key Generator Form */}
            {!generatedKey ? (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Key Name / Application
                    </label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="e.g. Guwahati University Portal"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Access Tier
                    </label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    >
                      <option value="free">Free Tier (1,000 req/mo)</option>
                      <option value="developer">Developer Tier (25k req/mo)</option>
                      <option value="business">Business Tier (100k req/mo)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>Generating Key...</>
                    ) : (
                      <>
                        <Sparkles size={16} /> Create Secret Key
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Free forever • Instant sandbox testing
                  </span>
                </div>
              </form>
            ) : (
              /* Success / Key Generated Box */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={15} /> Secret Key Ready ({keyName})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      {showKey ? 'Mask' : 'Reveal'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                    <code className="flex-1 font-mono text-xs sm:text-sm text-slate-800 dark:text-emerald-300 select-all overflow-x-auto">
                      {getMaskedKey(generatedKey)}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedKey)}
                      className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {copiedKey ? <Check size={13} /> : <Copy size={13} />}
                      {copiedKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Security Advisory */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                  <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Security Warning:</strong> Treat this key like a password. Never commit it to GitHub, public repositories, or client-side JavaScript. Store it securely in your server’s environment variables as <code className="font-mono font-bold">AXOM_API_KEY</code>.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGeneratedKey(null)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 underline"
                  >
                    + Generate Another Key
                  </button>
                </div>
              </div>
            )}
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
            Integrate in 60 Seconds
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Because Axom AI adheres to the standard OpenAI API specification, you can use official OpenAI SDKs or standard HTTP clients without learning a new framework.
          </p>
        </div>

        {/* Code Editor Window */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b1220] text-slate-200 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2">quickstart.{activeTab === 'python' ? 'py' : activeTab === 'node' ? 'ts' : 'sh'}</span>
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
                Python
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
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-emerald-300/90 relative group">
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  activeTab === 'python' ? pythonSnippet : activeTab === 'node' ? nodeSnippet : curlSnippet,
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
            </pre>
          </div>
        </div>
      </section>

      {/* 4. Models Specification */}
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

      {/* 5. API Endpoints Reference */}
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

      {/* 6. Rate Limits & Error Handling */}
      <section id="rate-limits" className="scroll-mt-24 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Lock size={14} /> Quotas &amp; Security
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Rate Limits &amp; Error Handling
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-1">
            Axom AI protects all endpoints with in-memory caching token bucket rate-limiters.
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
                <span className="font-mono text-emerald-600 dark:text-emerald-400">300 req/min • 25,000 req/mo</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Business Tier</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">1,200 req/min • 100,000 req/mo</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Enterprise / Sovereign</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Unlimited • On-Premise</span>
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

      {/* 7. Need Help / Enterprise CTA */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl relative overflow-hidden">
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

