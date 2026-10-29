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
  BookOpen,
  Key,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight
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
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#030712] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 overflow-hidden border-b border-emerald-900/10 dark:border-white/5">
          {/* Ambient Lighting Backgrounds */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-5 relative z-10">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span>Docs</span>
              <ChevronRight size={12} />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Developer API</span>
            </div>

            {/* Badge & Title */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef9c3] dark:bg-amber-950/40 border border-[#fde047] dark:border-amber-700/50 text-[#854d0e] dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Terminal size={13} className="text-amber-600" /> Axom AI Developer Platform
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
                Native Assamese &amp; Indic LLMs. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  OpenAI-Compatible API.
                </span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                Integrate Assam&apos;s indigenous AI into your mobile apps, web services, and bots. Drop-in replacement for OpenAI SDKs (<code className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 font-mono text-xs text-emerald-800 dark:text-emerald-300">base_url=&quot;https://aiaxom.co.in/v1&quot;</code>) with automatic Assamese grammar purification and sub-second inference.
              </p>

              {/* Quick Navigation Anchor Links */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <a
                  href="#api-keys"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98 transition-all inline-flex items-center gap-1.5"
                >
                  <Key size={13} /> Get API Key
                </a>
                <a
                  href="#quickstart"
                  className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all inline-flex items-center gap-1.5"
                >
                  <Code size={13} /> Quickstart
                </a>
                <a
                  href="#models"
                  className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all inline-flex items-center gap-1.5"
                >
                  <Layers size={13} /> Models
                </a>
                <a
                  href="#endpoints"
                  className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all inline-flex items-center gap-1.5"
                >
                  <BookOpen size={13} /> Endpoints
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Content Area */}
        <section className="max-w-7xl mx-auto px-5 py-8">
          <DeveloperDocsInteractive />
        </section>
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}

