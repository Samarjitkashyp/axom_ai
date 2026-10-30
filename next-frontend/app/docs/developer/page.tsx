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
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Globe2,
  Zap,
  Server,
  FileCode2,
  ArrowRight,
  Database,
  Building2,
  Languages,
  Compass,
  Check,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Axom AI Developer API Docs — OpenAI-Compatible Assamese & Indic LLMs | REST Endpoints, SDKs & Pricing',
  description:
    'Official Axom AI Developer Documentation. Integrate OpenAI-compatible REST endpoints (/v1/chat/completions, /v1/models, /v1/translate) for native Assamese & Indic LLMs. Complete SDK quickstarts (Python, Node.js, PHP, cURL, Flutter), API keys, live sandbox, pricing, and latency benchmarks.',
  keywords: [
    'Axom AI Developer API',
    'Assamese AI API documentation',
    'OpenAI compatible API Assam',
    'Indic LLM API endpoints',
    'Assamese chatbot API',
    'Assamese neural translation API',
    'Northeast India AI developer platform',
    'Axom AI SDK Python Node.js',
    'Guwahati AI platform API',
    'Bhashini alternative Assam AI',
    'v1 chat completions Assamese',
    'Axom Indic-1 model',
    'Assamese LLM API keys',
    'AI developer pricing India',
    'Indic NLP API',
    'Assam artificial intelligence',
    'OpenAI drop-in replacement Indic',
    'Assamese language model API',
    'Axom AI token quota',
    'Sovereign AI Northeast India',
    'Guwahati Assam tech startup AI',
    'Assamese orthography grammar purification'
  ],
  authors: [{ name: 'Axom AI Engineering Team', url: 'https://aiaxom.co.in' }],
  creator: 'Axom AI',
  publisher: 'Axom AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://aiaxom.co.in/docs/developer',
    languages: {
      'en-US': 'https://aiaxom.co.in/docs/developer',
      'as-IN': 'https://aiaxom.co.in/docs/developer',
    },
  },
  openGraph: {
    title: 'Axom AI Developer API Docs — OpenAI-Compatible Assamese & Indic LLMs',
    description:
      'Official documentation for Axom AI API. Drop-in OpenAI-compatible REST endpoints (/v1/chat/completions, /v1/models, /v1/translate) for native Assamese & Indic LLMs. Sub-280ms latency, SDK quickstarts, and live sandbox.',
    url: 'https://aiaxom.co.in/docs/developer',
    siteName: 'Axom AI Developer Platform',
    type: 'article',
    locale: 'en_IN',
    images: [
      {
        url: 'https://aiaxom.co.in/axom-browser-logo.png',
        width: 1200,
        height: 630,
        alt: 'Axom AI Developer API Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AxomAI',
    creator: '@AxomAI',
    title: 'Axom AI Developer API Docs — OpenAI-Compatible Assamese & Indic LLMs',
    description:
      'Build native Assamese & Indic AI apps with standard OpenAI-compatible endpoints. Sub-second latency, zero code rewrites, and instant secret API keys.',
    images: ['https://aiaxom.co.in/axom-browser-logo.png'],
  },
  other: {
    'geo.region': 'IN-AS',
    'geo.placename': 'Guwahati, Assam, India',
    'geo.position': '26.1445;91.7362',
    'ICBM': '26.1445, 91.7362',
    'DC.title': 'Axom AI Developer API Documentation',
    'DC.creator': 'Axom AI',
    'DC.subject': 'Artificial Intelligence, Assamese LLM, Developer API, OpenAI Compatible, Indic NLP',
    'DC.coverage': 'World, India, Assam, Northeast India, Guwahati',
    'classification': 'Software Development / AI Inference API Documentation',
    'target': 'Developers, AI Engineers, Software Architects, Researchers',
  },
};

export default async function DeveloperDocsPage() {
  const cms = await getLandingCMS().catch(() => null);

  // Multi-Graph Schema.org Structured Data (Extreme SEO, GEO, AEO)
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        url: 'https://aiaxom.co.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://aiaxom.co.in/axom-browser-logo.png',
        },
        sameAs: [
          'https://twitter.com/AxomAI',
          'https://github.com/axom-ai',
          'https://www.linkedin.com/company/axom-ai',
        ],
        address: {
          '@type': 'PostalAddress',
          'addressLocality': 'Guwahati',
          'addressRegion': 'Assam',
          'addressCountry': 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 26.1445,
          longitude: 91.7362,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@aiaxom.co.in',
          contactType: 'technical support',
          areaServed: 'IN',
          availableLanguage: ['English', 'Assamese', 'Hindi'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://aiaxom.co.in/#website',
        url: 'https://aiaxom.co.in/',
        name: 'Axom AI',
        description: 'Assam & Northeast India sovereign AI ecosystem and OpenAI-compatible developer platform.',
        publisher: { '@id': 'https://aiaxom.co.in/#organization' },
      },
      {
        '@type': 'TechArticle',
        '@id': 'https://aiaxom.co.in/docs/developer#article',
        isPartOf: { '@id': 'https://aiaxom.co.in/#website' },
        headline: 'Axom AI Developer API Documentation — OpenAI-Compatible Assamese & Indic LLMs',
        description:
          'Comprehensive technical guide and API reference for integrating Axom AI Assamese & Indic LLM endpoints using standard OpenAI SDKs in Python, Node.js, PHP, and REST.',
        url: 'https://aiaxom.co.in/docs/developer',
        author: { '@id': 'https://aiaxom.co.in/#organization' },
        publisher: { '@id': 'https://aiaxom.co.in/#organization' },
        inLanguage: 'en-US',
        proficiencyLevel: 'Beginner to Advanced',
        programmingLanguage: ['Python', 'JavaScript', 'TypeScript', 'PHP', 'Dart', 'cURL', 'Bash'],
        dependencies: 'OpenAI SDK, Requests, Axios, Flutter HTTP',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://aiaxom.co.in/docs/developer#application',
        name: 'Axom AI Developer API Platform',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'AI Inference & NLP API Platform',
        operatingSystem: 'All Platforms (Cloud REST API)',
        url: 'https://aiaxom.co.in/docs/developer',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: '1499',
          priceCurrency: 'INR',
          offerCount: '4',
        },
        featureList: [
          'OpenAI v1 REST Drop-in Replacement (/v1/chat/completions, /v1/models, /v1/translate)',
          'Sub-280ms Latency on Indian GPU Cloud Infrastructure (Asia-South-1)',
          'Grammatically Pure Native Assamese Orthography (No Bengali script contamination)',
          'Free Sandbox Developer Tier with Instant API Key Generation',
          'Full Support for Python, Node.js, Next.js, LangChain, LlamaIndex, LiteLLM, Flutter, PHP',
          'India DPDP Act 2023 Compliant and TLS 1.3 Encrypted',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://aiaxom.co.in/docs/developer#breadcrumbs',
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
            name: 'Documentation',
            item: 'https://aiaxom.co.in/docs/developer',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Developer API Reference',
            item: 'https://aiaxom.co.in/docs/developer',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/docs/developer#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the Axom AI Developer API?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Axom AI Developer API is an enterprise-grade, OpenAI-compatible REST API providing developers direct programmatic access to Assam\'s first indigenous Large Language Models (LLMs) and Indic neural intelligence engines. It enables developers to integrate high-speed chat completions (/v1/chat/completions), embeddings, model listings (/v1/models), and neural Assamese translation (/v1/translate) into web apps, mobile apps, bots, and automated pipelines with sub-280ms response times.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does Axom AI achieve 100% OpenAI compatibility?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI adheres strictly to the OpenAI REST specification. Developers can use official OpenAI SDKs in Python (openai), Node.js/TypeScript (openai), PHP, cURL, or frameworks like LangChain, LlamaIndex, LiteLLM, and AutoGen simply by setting base_url="https://aiaxom.co.in/v1" and passing an Axom AI API key in the Authorization: Bearer <axom-api-key> header. No code rewrite is required.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I obtain an Axom AI API key?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can generate secret API keys by registering or signing in to the official Developer Console at https://user.aiaxom.co.in/. Once logged in, navigate to the API Keys & Credentials tab, click "Create New Secret Key", and copy your cryptographically signed bearer token (prefixed with axom-). Free tier accounts immediately receive starter credits and 50 requests/day.',
            },
          },
          {
            '@type': 'Question',
            name: 'What models are supported on the Axom AI Developer Platform?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI provides three production-grade model tiers: 1) axom-indic-1 (Flagship pedagogical and bilingual Assamese-English reasoning model with native Indic orthography), 2) axom-turbo-v2 (Ultra-low-latency sub-280ms high-throughput neural model for conversational bots and mobile apps), and 3) axom-pro (Deep reasoning STEM and 128k long-context document processing model).',
            },
          },
          {
            '@type': 'Question',
            name: 'How does Axom AI handle Assamese orthography and Bengali script contamination?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Standard global LLMs frequently contaminate Assamese text by confusing Assamese characters ৰ (Ra) and ৱ (Va) with Bengali glyphs (র and ব). Axom AI features a proprietary Assamese grammatical purifier and custom Indic BPE tokenizer trained on regional literary, historical, scientific, and administrative corpora to ensure 100% grammatically and orthographically accurate Assamese output.',
            },
          },
          {
            '@type': 'Question',
            name: 'What are the pricing plans and token quotas for the Axom AI API?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI offers transparent, developer-friendly pricing: Free Sandbox Tier (₹0/mo, 50 req/day, 1 key), Starter Tier (₹199/mo or ₹159/mo billed annually, 5,000 req/mo, 3 keys), Pro Tier (₹499/mo or ₹399/mo billed annually, 25,000 req/mo, unlimited keys, priority queue), and Enterprise Tier (₹1,499/mo or ₹1,199/mo billed annually, 100,000 req/mo, 99.9% uptime SLA, dedicated support). Payments are processed via Razorpay.',
            },
          },
          {
            '@type': 'Question',
            name: 'What rate limits apply to the Axom AI API?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Rate limits operate on an in-memory sliding-window cache: Free Sandbox allows 60 req/min and 1,000 req/mo; Starter Tier allows 120 req/min and 5,000 req/mo; Pro Tier allows 300 req/min and 25,000 req/mo; Enterprise Tier offers up to 1,000+ req/min with dedicated GPU pooling and zero concurrency bottlenecks.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is data processed by Axom AI secure and compliant with Indian data regulations?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. All API traffic is encrypted in transit using TLS 1.3 with SHA-256 ciphers. Axom AI adheres to the Digital Personal Data Protection (DPDP) Act 2023 of India. Developer API payloads and completions are strictly stateless, never cached permanently, and never used to train base foundation models without explicit enterprise consent. Infrastructure is hosted in India (Asia-South-1).',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Schema Injection for Googlebot, Perplexity, SearchGPT, Claude, Bingbot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* Global Navbar */}
      <Navbar header={cms?.header} />

      <main className="min-h-screen relative overflow-hidden pt-28 pb-20 flex-1">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[750px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[36rem] h-[36rem] bg-fuchsia-600/15 rounded-full blur-[160px]" />
          <div className="absolute top-20 right-1/4 w-[36rem] h-[36rem] bg-purple-600/15 rounded-full blur-[160px]" />
        </div>

        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          {/* ==================== SEMANTIC BREADCRUMBS ==================== */}
          <nav aria-label="Breadcrumbs" className="mb-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-slate-400" />
            <Link href="/docs/developer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Documentation
            </Link>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Developer API Platform (OpenAI-Compatible)
            </span>
          </nav>

          {/* ==================== HERO SECTION (HIGH CONVERSION & SEARCH AUTHORITY) ==================== */}
          <section className="text-center max-w-5xl mx-auto mb-12 sm:mb-14">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-semibold shadow-sm">
                <Sparkles size={14} className="text-fuchsia-700 dark:text-fuchsia-400" />
                <span>⚡ Native Assamese &amp; Indic LLMs • OpenAI-Compatible v1 REST API</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
                <Globe2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>🇮🇳 Sovereign AI Infrastructure • Guwahati, Assam</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight sm:leading-tight mb-5">
              Developer API Platform{' '}
              <span className="gradient-text">
                for Native Assamese &amp; Indic AI
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto mb-8">
              Build production apps, enterprise bots, and bilingual platforms powered by Assam&apos;s first sovereign AI engine. Seamless drop-in replacement for OpenAI SDKs in Python, Node.js, PHP, Next.js, and Flutter with sub-280ms latency, zero code rewrites, and 100% pure Assamese orthography.
            </p>

            {/* Quick Navigation Jump Bar (All Key Anchors) */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
              <a
                href="#specifications"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Server size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Fact Sheet (AEO)</span>
              </a>
              <a
                href="#linguistic-engine"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-purple-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-purple-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Languages size={14} className="text-purple-600 dark:text-purple-400" />
                <span>Sovereign Architecture (GEO)</span>
              </a>
              <a
                href="#pricing"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm font-semibold"
              >
                <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>API Pricing</span>
              </a>
              <a
                href="#quickstart"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-fuchsia-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Code size={14} className="text-fuchsia-600 dark:text-fuchsia-400" />
                <span>SDK Quickstart</span>
              </a>
              <a
                href="#api-keys"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Key size={14} className="text-fuchsia-600 dark:text-fuchsia-400" />
                <span>Get API Key</span>
              </a>
              <a
                href="#playground"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Play size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>Live Sandbox</span>
              </a>
              <a
                href="#stacks"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-purple-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-purple-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FileCode2 size={14} className="text-purple-600 dark:text-purple-400" />
                <span>Frameworks</span>
              </a>
              <a
                href="#models"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-indigo-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Cpu size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>Model Specs</span>
              </a>
              <a
                href="#security"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Security</span>
              </a>
              <a
                href="#faq"
                className="px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-amber-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 hover:border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm font-semibold"
              >
                <HelpCircle size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Developer FAQ</span>
              </a>
            </div>
          </section>

          {/* ==================== AEO DIRECT SPECIFICATION BOX ==================== */}
          <section className="mb-10 max-w-5xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-100/40 dark:from-purple-950/40 via-white/60 dark:via-slate-900/60 to-indigo-100/40 dark:to-indigo-950/40 border border-purple-500/25 shadow-xl relative overflow-hidden group">
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

          {/* ==================== AEO DEVELOPER FACT SHEET & KEY SPECIFICATIONS ==================== */}
          <section id="specifications" className="mb-14 max-w-5xl mx-auto scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Server size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      Axom AI Developer API Fact Sheet &amp; Specifications (AEO)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standard technical specifications for Google AI Overviews, Perplexity, SearchGPT &amp; LLM agents
                    </p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-medium">
                  REST v1.0 Spec
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Base REST Endpoint</span>
                  <code className="text-emerald-700 dark:text-emerald-400 font-mono font-bold block text-xs break-all">
                    https://aiaxom.co.in/v1
                  </code>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
                    OpenAI SDK drop-in base_url
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Authentication Scheme</span>
                  <div className="font-mono text-purple-700 dark:text-purple-300 font-bold text-xs">
                    Bearer axom-...
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
                    Via <code className="bg-slate-200/50 dark:bg-slate-700/50 px-1 rounded">Authorization</code> HTTP Header
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Primary LLM Models</span>
                  <div className="text-slate-900 dark:text-white font-semibold text-xs space-y-0.5">
                    <div><code>axom-indic-1</code> (Bilingual Flagship)</div>
                    <div><code>axom-turbo-v2</code> (Sub-280ms)</div>
                    <div><code>axom-pro</code> (Deep STEM Reasoning)</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Supported Languages</span>
                  <div className="text-slate-900 dark:text-white font-semibold text-xs space-y-0.5">
                    <div>Assamese (অসমীয়া • <code>as-IN</code>)</div>
                    <div>Bengali, Bodo, Hindi &amp; English</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Inference Latency</span>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    &lt; 280ms TTFT
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
                    Time To First Token on Indian GPU clusters
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Data Residency &amp; Cloud</span>
                  <div className="text-slate-900 dark:text-white font-semibold text-xs">
                    AWS Asia-South-1 (Mumbai, India)
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
                    DPDP Act 2023 &amp; ISO 27001 TLS 1.3
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">SDK Compatibility</span>
                  <div className="text-slate-900 dark:text-white font-semibold text-xs">
                    Python, Node.js, PHP, Dart, cURL
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
                    LangChain, LlamaIndex, LiteLLM, CrewAI
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold block">Free Sandbox Tier</span>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    ₹0 / Month
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
                    50 req/day • Instant Developer Key
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== GEO SOVEREIGN LINGUISTIC ARCHITECTURE ==================== */}
          <section id="linguistic-engine" className="mb-14 max-w-5xl mx-auto scroll-mt-24">
            <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white/90 via-emerald-50/30 to-purple-50/30 dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-purple-950/20 border border-emerald-900/15 dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="max-w-4xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Languages size={14} /> Sovereign Indic Linguistic Engine (GEO)
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Why Global AI Fails at Assamese — And How Axom AI Solves It
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  Most international LLMs (GPT-4, Claude, Gemini) produce substandard Assamese outputs because their tokenizers treat Assamese as a low-resource dialect of Bengali. This introduces severe script contamination, orthographic hallucinations, and broken grammar. Axom AI was built from the ground up to solve these sovereign linguistic challenges.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      ১
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pristine Assamese Orthography</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Rigid Unicode script enforcement ensures Assamese characters <strong className="text-emerald-600 dark:text-emerald-400">ৰ (U+09F0)</strong> and <strong className="text-emerald-600 dark:text-emerald-400">ৱ (U+09F1)</strong> are never corrupted into Bengali glyphs (<code className="text-red-500">র</code> and <code className="text-red-500">ব</code>).
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                      ২
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Northeast Cultural Grounding</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pre-trained on historical Ahom chronicles (Buranji), Sankardev&apos;s Borgeet, regional Assam administrative vocabulary, and local geography across all 35 Assam districts.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                      ৩
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">India Data Sovereign Hosting</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Hosted locally in India (Asia-South-1) ensuring compliance with the Digital Personal Data Protection (DPDP) Act 2023 with ultra-low latency for Indian telecom networks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== INTERACTIVE DOCS & KEY GENERATOR ==================== */}
          <DeveloperDocsInteractive />

          {/* ==================== AEO / GEO COMPREHENSIVE DEVELOPER FAQ SECTION ==================== */}
          <section id="faq" className="mt-20 mb-14 max-w-5xl mx-auto scroll-mt-24 space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                <HelpCircle size={14} /> Developer Q&amp;A Knowledge Base (AEO / FAQ)
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions — Axom AI Developer Platform
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct answers to common developer questions regarding API keys, OpenAI SDK compatibility, Indic language capabilities, rate limits, and enterprise pricing.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {/* FAQ Item 1 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>What is the Axom AI Developer API?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>
                    The <strong>Axom AI Developer API</strong> is an enterprise-grade, OpenAI-compatible REST API providing developers direct programmatic access to Assam&apos;s first indigenous Large Language Models (LLMs) and Indic neural intelligence engines. It enables developers to integrate high-speed chat completions (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/v1/chat/completions</code>), model listings (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/v1/models</code>), and neural Assamese translation (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/v1/translate</code>) into web applications, mobile apps, bots, and automated workflows with sub-280ms response times.
                  </p>
                </div>
              </details>

              {/* FAQ Item 2 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>How does Axom AI achieve 100% OpenAI compatibility?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>
                    Axom AI adheres strictly to the OpenAI REST specification. Developers can use official OpenAI SDKs in Python (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">openai</code>), Node.js/TypeScript (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">openai</code>), PHP, cURL, or frameworks like LangChain, LlamaIndex, LiteLLM, and AutoGen simply by setting <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">base_url=&quot;https://aiaxom.co.in/v1&quot;</code> and passing an Axom AI API key in the <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;axom-api-key&gt;</code> header. <strong>No code rewrites or custom adapter packages are required.</strong>
                  </p>
                </div>
              </details>

              {/* FAQ Item 3 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>How do I obtain an Axom AI API key?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>
                    You can generate secret API keys by registering or signing in to the official Developer Console at <a href="https://user.aiaxom.co.in/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-4">user.aiaxom.co.in</a>. Once logged in, navigate to the <strong>API Keys &amp; Credentials</strong> tab, click &quot;Create New Secret Key&quot;, and copy your cryptographically signed bearer token (prefixed with <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">axom-</code>). Free Sandbox tier accounts immediately receive starter credits and 50 requests/day.
                  </p>
                </div>
              </details>

              {/* FAQ Item 4 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>What models are supported on the Axom AI Developer Platform?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>Axom AI provides three production-grade model tiers accessible via the API:</p>
                  <ul className="list-disc pl-5 space-y-1 pt-1">
                    <li><strong className="text-slate-900 dark:text-white font-mono">axom-indic-1</strong>: Flagship pedagogical and bilingual Assamese-English reasoning model with native Indic orthography and literature grounding.</li>
                    <li><strong className="text-slate-900 dark:text-white font-mono">axom-turbo-v2</strong>: Ultra-low-latency (sub-280ms) high-throughput neural model optimized for conversational bots, real-time customer support, and mobile apps.</li>
                    <li><strong className="text-slate-900 dark:text-white font-mono">axom-pro</strong>: Deep reasoning STEM and long-context (128k tokens) model for complex document extraction, summarization, and coding.</li>
                  </ul>
                </div>
              </details>

              {/* FAQ Item 5 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>How does Axom AI handle Assamese orthography and Bengali script contamination?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>
                    Standard global LLMs frequently contaminate Assamese text by confusing Assamese characters <strong>ৰ (Ra)</strong> and <strong>ৱ (Va)</strong> with Bengali glyphs (র and ব). Axom AI features a proprietary Assamese grammatical purifier and custom Indic BPE tokenizer trained on regional literary, historical, scientific, and administrative corpora to ensure 100% grammatically and orthographically accurate Assamese output.
                  </p>
                </div>
              </details>

              {/* FAQ Item 6 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>What are the pricing plans and token quotas for the Axom AI API?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>Axom AI provides transparent, developer-friendly pricing with monthly and annual discount options:</p>
                  <ul className="list-disc pl-5 space-y-1 pt-1">
                    <li><strong>Free Sandbox:</strong> ₹0/month — 50 req/day, 1 key, community support.</li>
                    <li><strong>Starter Tier:</strong> ₹199/month (₹159/month billed annually) — 5,000 req/month, 3 API keys.</li>
                    <li><strong>Pro Tier (Most Popular):</strong> ₹499/month (₹399/month billed annually) — 25,000 req/month, unlimited API keys, priority inference queue.</li>
                    <li><strong>Enterprise Tier:</strong> ₹1,499/month (₹1,199/month billed annually) — 100,000 req/month, 99.9% SLA, dedicated engineering support.</li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    * Payments are securely processed via Razorpay (UPI, Credit/Debit Cards, Netbanking) through the Developer Console.
                  </p>
                </div>
              </details>

              {/* FAQ Item 7 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>What rate limits apply to the Axom AI API?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>
                    Rate limits operate on an in-memory sliding-window cache to prevent abusive bot scraping and guarantee consistent latency for all clients:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 pt-1">
                    <li>Free Tier: 60 requests/minute and 1,000 requests/month.</li>
                    <li>Starter Tier: 120 requests/minute and 5,000 requests/month.</li>
                    <li>Pro Tier: 300 requests/minute and 25,000 requests/month.</li>
                    <li>Enterprise Tier: Custom burst limits up to 1,000+ requests/minute with dedicated GPU allocation.</li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    When limits are reached, the API returns HTTP 429 with standard <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">Retry-After</code> response headers.
                  </p>
                </div>
              </details>

              {/* FAQ Item 8 */}
              <details className="group p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/10 dark:border-white/10 shadow-sm hover:border-emerald-500/40 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  <span>Is data processed by Axom AI secure and compliant with Indian data regulations?</span>
                  <span className="transition group-open:rotate-180 text-emerald-600 dark:text-emerald-400 font-mono text-xl shrink-0 ml-4">
                    ▾
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
                  <p>
                    Yes. All API traffic is strictly encrypted in transit using <strong>TLS 1.3 with SHA-256 ciphers</strong>. Axom AI complies with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>. Developer API payloads and completions are strictly stateless, never cached permanently, and <strong>never used to train base foundation models</strong> without explicit enterprise consent. Infrastructure is hosted securely within India (Asia-South-1).
                  </p>
                </div>
              </details>
            </div>
          </section>
        </div>
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}