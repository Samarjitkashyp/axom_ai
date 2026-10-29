import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import DeveloperDocsInteractive from '../../../components/DeveloperDocsInteractive';
import { getLandingCMS } from '../../../lib/api';
import {
  Sparkles,
  Terminal,
  Code,
  Key,
  ChevronRight,
  Layers,
  Cpu,
  Lock,
  Play,
  ShieldCheck
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Developer API Documentation — OpenAI-Compatible Assamese & Indic LLMs | Axom AI',
  description:
    'Build next-generation apps with Axom AI. Standard OpenAI-compatible API endpoints (/v1/chat/completions, /v1/models, /v1/translate) for Assamese, Bengali, Hindi, and English with sub-second latency.',
  keywords: [
    'Axom AI Developer API',
    'Assamese AI API',
    'OpenAI compatible API Assam',
    'Indic LLM API',
    'Assamese chatbot API',
    'Assamese neural translation API',
    'Northeast India AI API',
    'Axom AI SDK'
  ],
  alternates: {
    canonical: 'https://aiaxom.co.in/docs/developer',
  },
  openGraph: {
    title: 'Axom AI Developer API Documentation',
    description: 'Standard OpenAI-compatible endpoints for native Assamese & Indic LLMs. Drop-in replacement for OpenAI SDKs.',
    url: 'https://aiaxom.co.in/docs/developer',
    siteName: 'Axom AI',
    type: 'article',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axom AI Developer API Documentation',
    description: 'Build native Assamese & Indic AI apps with standard OpenAI-compatible endpoints.',
  },
};

export default async function DeveloperDocsPage() {
  const cms = await getLandingCMS().catch(() => null);

  // Schema.org Structured Data
  const techArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Axom AI Developer API Documentation — OpenAI-Compatible Assamese & Indic LLMs',
    description:
      'Technical guide and reference for integrating Axom AI models using standard OpenAI SDKs and REST APIs.',
    url: 'https://aiaxom.co.in/docs/developer',
    author: {
      '@type': 'Organization',
      name: 'Axom AI',
      url: 'https://aiaxom.co.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Axom AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
      },
    },
    inLanguage: 'en-US',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://aiaxom.co.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Docs',
        item: 'https://aiaxom.co.in/docs/developer',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Developer API',
        item: 'https://aiaxom.co.in/docs/developer',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Global Navbar */}
      <Navbar header={cms?.header} />

      <main className="min-h-screen relative overflow-hidden pt-28 pb-20 flex-1">
        {/* Ambient Gradient Glows (matching use-cases) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-fuchsia-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-purple-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ==================== HERO SECTION (USE-CASES PATTERN) ==================== */}
          <section className="text-center max-w-4xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-semibold mb-5 shadow-sm">
              <Sparkles size={14} className="text-fuchsia-700 dark:text-fuchsia-400" />
              <span>⚡ Native Assamese &amp; Indic LLMs • OpenAI-Compatible v1 API</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight sm:leading-tight mb-5">
              Developer API Platform{' '}
              <span className="gradient-text">
                for Native Assamese &amp; Indic AI
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Build world-class apps, websites, and bots powered by Assam&apos;s first indigenous AI platform. Seamless drop-in replacement for OpenAI SDKs in Python, Node.js, and cURL with automatic Assamese grammar purification and sub-second latency.
            </p>

            {/* Quick Filter / Jump Bar (Pill buttons from use-cases) */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <a
                href="#api-keys"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Key size={15} className="text-fuchsia-600 dark:text-fuchsia-400" />
                <span>Get API Key</span>
              </a>
              <a
                href="#quickstart"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Code size={15} className="text-purple-600 dark:text-purple-400" />
                <span>Quickstart SDK</span>
              </a>
              <a
                href="#playground"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Play size={15} className="text-indigo-600 dark:text-indigo-400" />
                <span>Live Sandbox</span>
              </a>
              <a
                href="#security"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Security Architecture</span>
              </a>
              <a
                href="#models"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Cpu size={15} className="text-indigo-600 dark:text-indigo-400" />
                <span>Model Specs</span>
              </a>
              <a
                href="#endpoints"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Layers size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Endpoints</span>
              </a>
              <a
                href="#rate-limits"
                className="px-4 py-2 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Lock size={15} className="text-amber-600 dark:text-amber-400" />
                <span>Rate Limits</span>
              </a>
            </div>
          </section>

          {/* ==================== AEO DIRECT OVERVIEW BOX ==================== */}
          <section className="mb-14 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-100/40 dark:from-purple-950/40 via-white/60 dark:via-slate-900/60 to-indigo-100/40 dark:to-indigo-950/40 border border-purple-500/25 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 mt-1 shadow-inner">
                  <Terminal size={24} className="text-fuchsia-700 dark:text-fuchsia-400" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                    <span>Official OpenAI Compatibility Specification</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-white tracking-tight">
                    One Base URL. Zero Code Rewrites.
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                    Axom AI provides a standard OpenAI-compliant REST interface. Any existing codebase, library, or agentic framework (LangChain, LlamaIndex, LiteLLM, AutoGen, CrewAI) connects immediately by simply pointing <code className="font-mono text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">base_url=&quot;https://aiaxom.co.in/v1&quot;</code> and passing an Axom API Key.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== INTERACTIVE DOCS & KEY GENERATOR ==================== */}
          <DeveloperDocsInteractive />
        </div>
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
