import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { RESEARCH_MODELS_FAQS } from '@/components/researchModelsFaqsData';
import { getLandingCMS } from '@/lib/api';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Volume2,
  Mic,
  ArrowRight,
  ShieldCheck,
  Code2,
  Eye,
  Globe2,
  Search,
  Compass,
  FileCheck2,
  CheckCircle2,
  Activity,
  HardDrive,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Database,
  BarChart3,
  Bot
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  'Axom AI models',
  'Axom AI foundation models',
  'Axom AI research',
  'Progya LLM',
  'Puhor voice engine',
  'Xuna speech to text',
  'Xetu translation bridge',
  'XUWOR multimodal AI',
  'Assamese language models',
  'Assam generative AI models',
  'indigenous AI research India',
  'sovereign Assamese AI',
  'YOLOv8 helmet detection Assam',
  'Assamese Conformer ASR',
  'Flow matching diffusion TTS Assamese',
  'Assam AI engineering Guwahati',
  'Northeast India sovereign AI',
  'DPDP compliant AI models India',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Models — Sovereign Foundation Models & Assamese LLMs | Hugging Face Verified';
  const description =
    'Explore Axom AI\'s 7 sovereign foundation models and regional LLMs engineered in Assam: Progya 2B, XUWOR Multimodal, Puhor 24kHz Voice, Xuna Conformer ASR, Xetu Translation, Garima Vision, and AxomAI Sarkar. 100% CPU edge execution, 99.4% Assamese script purity, and open weights on Hugging Face.';
  const canonicalUrl = 'https://aiaxom.co.in/our-models/';
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title,
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Axom AI',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Axom AI Sovereign Foundation Models & Technical Research',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
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
  };
}

export default async function OurModelsPage() {
  const cms = await getLandingCMS().catch(() => ({} as any));

  // Structured Data Schemas
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Axom AI Sovereign Foundation Models & Research',
    description:
      'Technical architecture and measured benchmark evaluations for Axom AI\'s indigenous generative models: XUWOR, Progya, Puhor, Xuna, and Xetu.',
    url: 'https://aiaxom.co.in/our-models/',
    provider: {
      '@type': 'Organization',
      name: 'Axom AI',
      url: 'https://aiaxom.co.in',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guwahati',
        addressRegion: 'Assam',
        addressCountry: 'IN',
      },
    },
    hasPart: [
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Master — XUWOR (সুঁৱৰ)',
        applicationCategory: 'Multimodal AI Ecosystem',
        description:
          'Full-duplex multimodal conversational AI ecosystem synchronizing hearing, thinking, speaking, and translation under 3.8 GB RAM.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Brain — Progya (প্ৰজ্ঞা)',
        applicationCategory: 'Dense Language Model',
        description:
          'Sovereign 2.00 Billion parameter dense Assamese LLM with 68,096 native tokens and 6.19 Million verified cultural records.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Voice — Puhor (পোহৰ)',
        applicationCategory: 'Flow-Matching Diffusion TTS',
        description:
          '24,000 Hz studio-grade Flow-Matching Diffusion Transformer voice engine with 0.0% hallucination and dual regional personas.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Speech — Xuna (শুনা)',
        applicationCategory: 'Conformer ASR',
        description:
          '600 Million parameter Conformer ASR speech recognition running 3.8x faster than real-time on CPU with monsoon noise immunity.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Bridge — Xetu (সেতু)',
        applicationCategory: 'Neural Translation Bridge',
        description:
          '200 Million parameter bidirectional English-Assamese translation bridge preserving complex case inflections and legal precision.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Sarkar (অসম চৰকাৰ AI সহায়ক)',
        applicationCategory: 'Public Administration Small Language Model',
        description:
          'Sovereign 492 Million parameter public administration SLM trained on 3.3 Million+ verified citizen instruction pairs and 21 master datasets across all 35 districts and 130 LACs.',
      },
    ],
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
        name: 'Our Models',
        item: 'https://aiaxom.co.in/our-models/',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://aiaxom.co.in/our-models/#faq',
    mainEntity: RESEARCH_MODELS_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Global Navbar */}
      <Header header={cms?.header} />

      <main className="flex-1">
        {/* ==================== HERO SECTION (MATCHING /research EXACTLY) ==================== */}
        <div className="relative overflow-hidden pt-24 sm:pt-28 pb-10 sm:pb-14">
          {/* Ambient Gradient Glows (Exact match with /research & /use-cases) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[140px]" />
            <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 md:mb-16">
              
              {/* BADGE PILL */}
              <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 shadow-sm">
                <span>Official Model Registry • 7 Sovereign AI Architectures</span>
              </div>

              {/* H1 TITLE */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.2] sm:leading-tight mb-4 sm:mb-5 break-words">
                Sovereign AI Foundation Models,{' '}
                <span className="gradient-text">Engineered from Assam</span>
              </h1>

              {/* SUBTITLE */}
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 px-1">
                Explore Axom AI&apos;s family of 7 sovereign foundation models published on Hugging Face: Progya 2B (Dense LLM), XUWOR (Full-Duplex Multimodal), Puhor (24kHz Studio TTS), Xuna (Conformer ASR), Xetu (Neural Translation Bridge), Garima (Visual AI), and AxomAI Sarkar (Governance SLM). Built from scratch for native Assamese orthography and 100% CPU edge execution with zero cloud GPU dependency.
              </p>

              {/* FILTER PILLS */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <a
                  href="#foundation-models"
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium no-underline shadow-xs"
                >
                  Foundation LLMs &amp; SLMs
                </a>
                <a
                  href="#multimodal-xuwor"
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium no-underline shadow-xs"
                >
                  Multimodal &amp; Voice
                </a>
                <a
                  href="#governance-sarkar"
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium no-underline shadow-xs"
                >
                  Governance SLM
                </a>
                <a
                  href="https://huggingface.co/axom-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 transition-all font-bold no-underline shadow-xs flex items-center gap-1"
                >
                  <span>Hugging Face Hub &rarr;</span>
                </a>
              </div>

            </section>

            {/* ==================== OVERVIEW CARD (MATCHING /research EXACTLY) ==================== */}
            <section id="what-is-axom-ai-research" className="max-w-5xl mx-auto mb-10 sm:mb-14 scroll-mt-24">
              <div className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="space-y-4 sm:space-y-5 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Assam&apos;s Sovereign Model Ecosystem • Hugging Face Verified</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight leading-snug break-words">
                    About Axom AI Foundation Models — Indigenous Intelligence for Northeast India
                  </h2>

                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                    Axom AI models are purpose-built to solve the linguistic and technological neglect of regional Indian languages. While generic global models fracture Assamese into distorted multi-byte tokens, our indigenous architectures feature a dedicated 68,096-token native vocabulary, verified cultural corpora, sub-second CPU inference, and 100% Indian data sovereignty under the Digital Personal Data Protection (DPDP) Act 2023.
                  </p>

                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Section 1: Sovereign Assamese AI Foundation Models (November 2026) */}
        <section id="foundation-models" className="py-16 sm:py-24 border-b border-emerald-900/10 dark:border-white/5 relative bg-[#f0fdf4]/50 dark:bg-[#0b1220]/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Sovereign Foundation Models (November 2026)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#022c22] dark:text-white tracking-tight">
                Our Core Sovereign Foundation Models
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
                Indigenously trained and fine-tuned neural models designed for native Assamese orthography, phonetics, and multimodal edge compute.
              </p>
            </div>

            {/* Models Grid: 5 Core Foundation Models */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              
              {/* 1. XUWOR (Master Multimodal) */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white/90 dark:bg-slate-900/85 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Layers size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      Master Ecosystem
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#022c22] dark:text-white tracking-tight mb-2">
                    <a href="/research/axomai-multimodal-xuwor/" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                      Axom AI Master — XUWOR (সুঁৱৰ)
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Assam&apos;s first full-duplex multimodal conversational AI ecosystem. Synchronizes hearing (Xuna), thinking (Progya), speaking (Puhor), and translation (Xetu) under 3.8 GB RAM.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Memory Budget</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">&lt; 3.8 GB RAM</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Duplex Mode</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Hearing + Thinking + Voice</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Target Hardware</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Edge Laptop / Mobile</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Full-Duplex Speech · 12 min</span>
                  <a
                    href="/research/axomai-multimodal-xuwor/"
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    <span>Read report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* 2. PROGYA (2B Dense LLM) */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white/90 dark:bg-slate-900/85 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Cpu size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      2.00B Dense LLM
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#022c22] dark:text-white tracking-tight mb-2">
                    <a href="/research/axomai-brain-progya/" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                      Axom AI Brain — Progya (প্ৰজ্ঞা)
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Assam&apos;s sovereign 2 Billion parameter dense language model with 68,096 native Assamese tokens, grounded in 6.19 Million cultural and historical records.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Parameter Count</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">2.00 Billion Dense</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Tokenizer Vocabulary</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">68,096 Native Tokens</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Script Orthography</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">100% ৰ & ৱ Purified</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Dense LLM · 10 min</span>
                  <a
                    href="/research/axomai-brain-progya/"
                    className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                  >
                    <span>Read report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* 3. PUHOR (24kHz Studio TTS) */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white/90 dark:bg-slate-900/85 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Volume2 size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      24kHz Studio TTS
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#022c22] dark:text-white tracking-tight mb-2">
                    <a href="/research/axomai-voice-puhor/" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                      Axom AI Voice — Puhor (পোহৰ)
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Assam&apos;s first 24,000 Hz studio-grade Flow-Matching Diffusion Transformer (DiT) voice engine with 0.0% hallucination and dual sovereign Assamese personas.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Audio Resolution</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">24,000 Hz Studio</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Architecture</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Flow-Matching DiT</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Phoneme Hallucination</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">0.0% Hallucination Rate</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Flow-Matching TTS · 8 min</span>
                  <a
                    href="/research/axomai-voice-puhor/"
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    <span>Read report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* 4. XUNA (600M Conformer ASR) */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white/90 dark:bg-slate-900/85 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Mic size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      600M Conformer ASR
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#022c22] dark:text-white tracking-tight mb-2">
                    <a href="/research/axomai-speech-xuna/" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                      Axom AI Speech — Xuna (শুনা)
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Assam&apos;s 600M Conformer ASR engine running 3.8x faster than real-time (0.261x RTF) on CPU with extreme immunity to monsoon rain, fans, and mobile noise.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Real-Time Factor</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">0.261x RTF (3.8x Speed)</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Architecture</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Conformer 600M</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Acoustic Robustness</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Monsoon & Fan Noise Filtered</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Conformer ASR · 9 min</span>
                  <a
                    href="/research/axomai-speech-xuna/"
                    className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                  >
                    <span>Read report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* 5. XETU (200M Translation Bridge) */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white/90 dark:bg-slate-900/85 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Globe2 size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      200M Neural Bridge
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#022c22] dark:text-white tracking-tight mb-2">
                    <a href="/research/axomai-trans-xetu/" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                      Axom AI Bridge — Xetu (সেতু)
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Bidirectional English &harr; Assamese translation bridge preserving complex case inflections (-লৈ, -ৰ, -ত) and legal precision in an offline 1.03 GB model.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Offline Disk Size</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">1.03 GB Footprint</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Inflection Handling</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Grammatical (-লৈ, -ৰ, -ত)</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Primary Domain</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">Government, Legal & Media</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Neural Translation · 8 min</span>
                  <a
                    href="/research/axomai-trans-xetu/"
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    <span>Read report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* 6. AXOM AI SARKAR (492M Public Administration SLM) */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-white/90 dark:bg-slate-900/85 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <FileCheck2 size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      492M Governance SLM
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#022c22] dark:text-white tracking-tight mb-2">
                    <a href="/research/axomai-sarkar/" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                      Axom AI Sarkar (অসম চৰকাৰ AI সহায়ক)
                    </a>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    Assam&apos;s sovereign 492M public administration SLM trained on 3.3 Million+ instruction pairs across all 35 Districts, 130 LACs, Mission Basundhara, and Sewa Setu.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Training Corpus</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">3.3M+ Instructions (4.81 GB)</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Execution Mode</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">100% CPU Native (&lt; 500 MB RAM)</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Territorial Scope</span>
                      <strong className="font-bold text-emerald-950 dark:text-white">All 35 Districts &amp; 130 LACs</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Public Administration · 10 min</span>
                  <a
                    href="/research/axomai-sarkar/"
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    <span>Read report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* 7. Sovereign Infrastructure Highlight Card */}
              <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#022c22] to-[#0b1220] text-white border border-emerald-500/30 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      DPDP Act 2023
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white tracking-tight mb-2">
                    100% Sovereign Data Residency
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                    All tokenization, audio inference, and fine-tuning execute strictly within compliant Indian sovereign cloud regions with zero overseas routing.
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-slate-200">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-slate-400">Cloud Region</span>
                      <strong className="font-bold text-white">ap-south-1 (Mumbai / Delhi)</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-slate-400">Privacy Standard</span>
                      <strong className="font-bold text-emerald-400">Zero Prompt Retraining</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-slate-400">Local Engineering</span>
                      <strong className="font-bold text-white">Guwahati R&D Team</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Data Sovereignty</span>
                  <Link
                    href="/pricing#comparison"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>View Plan Tiers</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Featured Research — Computer Vision & Edge Systems */}
        <section className="py-16 sm:py-24 border-b border-emerald-900/10 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Eye size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Featured Applied Computer Vision</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#022c22] dark:text-white tracking-tight">
                Real-World Vision Systems: Helmet Detection
              </h2>
            </div>

            {/* Large Featured Card (.f-card style) */}
            <div className="rounded-3xl border border-emerald-900/15 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              
              {/* Content Column (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-9 md:p-11 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-extrabold uppercase tracking-wider text-[11px]">
                      Computer Vision · Road Safety
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                      <Clock size={13} /> 30 min read
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Oct 26, 2026</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#022c22] dark:text-white tracking-tight mb-4 leading-snug">
                    Helmet Detection: Every Rider Checked, from Phone Video or CCTV Cameras
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                    An end-to-end production pipeline: YOLOv8 object detection, per-rider deep sort tracking, an Android edge app, a real-time admin monitoring dashboard, and live automated CCTV alerts. Recall on held-out CCTV frames rose from <strong>0.62 to 0.79</strong> after regional fine-tuning; the live worker catches approximately <strong>90% of bare-headed riders at 2 analysed frames per second</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-white/[0.02] border border-emerald-900/10 dark:border-white/5 text-center">
                      <div className="text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">90%</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Live Detection</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-white/[0.02] border border-emerald-900/10 dark:border-white/5 text-center">
                      <div className="text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">0.79</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Held-out Recall</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-white/[0.02] border border-emerald-900/10 dark:border-white/5 text-center">
                      <div className="text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">2 FPS</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Edge Speed</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-emerald-900/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      SK
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">By Samarjit Kashyap</span>
                  </div>

                  <a
                    href="/research/helmet-detection/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md transform hover:-translate-y-0.5"
                  >
                    <span>Read Full Report</span>
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>

              {/* Image Column (5 cols) */}
              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-slate-950 overflow-hidden group">
                <img
                  src="/research/assets/detection-junction.jpg"
                  alt="Traffic junction where AI model detects rider helmets with bounding boxes"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white backdrop-blur-md">
                    Live CCTV Worker
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Guwahati Road Trial
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: More Research & Applied Regional Clients */}
        <section className="py-16 sm:py-24 border-b border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4]/30 dark:bg-[#0b1220]/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Compass size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Knowledge & Client Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#022c22] dark:text-white tracking-tight">
                Applied Systems & Knowledge Engineering
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Card 1: Crawler Bot */}
              <div className="rounded-3xl border border-emerald-900/15 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-md flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group">
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                    <img
                      src="/research/assets/card-crawler-bot.jpg"
                      alt="Crawler bot pipeline: website, clean text, questions, Axom AI chat"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
                      AI · Knowledge for Chat
                    </span>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
                      <span>Oct 26, 2026</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> 24 min read</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#022c22] dark:text-white tracking-tight mb-3">
                      <a href="/research/axom-ai-crawler-bot/" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                        Axom AI Crawler Bot: Websites & Documents Turned into Answers
                      </a>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      How an indigenous pipeline processes regional state portals, gazettes, and scanned Assamese, Hindi, and English textbooks, purifies noisy OCR outputs, and constructs grounded RAG question-answer pairs for Axom AI chat.
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      SK
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">Samarjit Kashyap</span>
                  </div>
                  <a
                    href="/research/axom-ai-crawler-bot/"
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    <span>Read Report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* Card 2: Axomai Browser */}
              <div className="rounded-3xl border border-emerald-900/15 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-xl overflow-hidden backdrop-blur-md flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group">
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                    <img
                      src="/research/assets/card-browser.jpg"
                      alt="Axomai Browser window with Axom AI chat panel beside Assam tea page"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
                      Product · Sovereign AI Browser
                    </span>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
                      <span>Oct 26, 2026</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> 22 min read</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#022c22] dark:text-white tracking-tight mb-3">
                      <a href="/research/axomai-browser/" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                        Axomai Browser: A Free Sovereign AI Browser Made in Assam
                      </a>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      A lightweight Windows and Android client engineered in Rust on Edge WebView2. Puts Axom AI directly alongside web pages with local prompt proxies, ad and tracker blocklists, and hardware-accelerated Assamese font rendering.
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                      SK
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">Samarjit Kashyap</span>
                  </div>
                  <a
                    href="/research/axomai-browser/"
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    <span>Read Report</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 4: Empirical Benchmark Matrix (Real Numbers) */}
        <section className="py-16 sm:py-24 border-b border-emerald-900/10 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <BarChart3 size={14} className="text-teal-600 dark:text-teal-400" />
                <span>Empirical Measurements & Specs</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#022c22] dark:text-white tracking-tight">
                Model Architecture & Empirical Specifications
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2">
                Published technical parameters and benchmark evaluations measured on held-out regional corpora.
              </p>
            </div>

            {/* Responsive Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Model 1 · Master Brain
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Progya (প্ৰজ্ঞা)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Architecture</span>
                    <strong className="text-slate-900 dark:text-white">2.00B Dense Transformer</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Vocabulary</span>
                    <strong className="text-slate-900 dark:text-white">68,096 tokens</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Training Corpus</span>
                    <strong className="text-slate-900 dark:text-white">6.19M Assamese records</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Specialty</span>
                    <strong className="text-slate-900 dark:text-white">Assam Exams, Law & Culture</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Model 2 · Voice Engine
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Puhor (পোহৰ)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Sampling Rate</span>
                    <strong className="text-slate-900 dark:text-white">24,000 Hz Studio</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Mechanism</span>
                    <strong className="text-slate-900 dark:text-white">Flow-Matching DiT</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Personas</span>
                    <strong className="text-slate-900 dark:text-white">Dual (Male & Female)</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Phoneme Hallucination</span>
                    <strong className="text-slate-900 dark:text-white">0.0% Measured</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Model 3 · Speech to Text
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Xuna (শুনা)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Size</span>
                    <strong className="text-slate-900 dark:text-white">600M Conformer</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Inference Speed</span>
                    <strong className="text-slate-900 dark:text-white">0.261x RTF (3.8x Speed)</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Execution Target</span>
                    <strong className="text-slate-900 dark:text-white">Standard CPU & Mobile</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Noise Handling</span>
                    <strong className="text-slate-900 dark:text-white">Monsoon & Fan Resilient</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Model 4 · Neural Translator
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Xetu (সেতু)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Parameter Size</span>
                    <strong className="text-slate-900 dark:text-white">200M Transformer</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Model Footprint</span>
                    <strong className="text-slate-900 dark:text-white">1.03 GB Offline</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Direction</span>
                    <strong className="text-slate-900 dark:text-white">Bidirectional En &harr; As</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Grammar Handling</span>
                    <strong className="text-slate-900 dark:text-white">Case Inflections Preserved</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Model 5 · Master Duplex
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">XUWOR (সুঁৱৰ)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Pipeline Type</span>
                    <strong className="text-slate-900 dark:text-white">Synchronized Multimodal</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Max RAM Usage</span>
                    <strong className="text-slate-900 dark:text-white">&lt; 3.8 GB Combined</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Turn-taking Latency</span>
                    <strong className="text-slate-900 dark:text-white">Sub-second Streamed</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Full Duplex</span>
                    <strong className="text-slate-900 dark:text-white">Simultaneous Listen & Talk</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  System 6 · Computer Vision
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Helmet Detection</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Vision Backbone</span>
                    <strong className="text-slate-900 dark:text-white">YOLOv8 Fine-Tuned</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Tracking Model</span>
                    <strong className="text-slate-900 dark:text-white">Deep SORT per Rider</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Held-out Recall</span>
                    <strong className="text-slate-900 dark:text-white">0.79 (0.62 baseline)</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Processing Speed</span>
                    <strong className="text-slate-900 dark:text-white">2 FPS on Live Stream</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-lg backdrop-blur-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  System 7 · Public Administration SLM
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Axom AI Sarkar (অসম চৰকাৰ)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Model Backbone</span>
                    <strong className="text-slate-900 dark:text-white">Qwen 2.5 Base (492M SLM)</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Instruction Training Pairs</span>
                    <strong className="text-slate-900 dark:text-white">3,300,227 Rows (4.81 GB)</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                    <span>Execution Hardware</span>
                    <strong className="text-slate-900 dark:text-white">100% CPU Native (&lt; 500 MB RAM)</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Master Datasets</span>
                    <strong className="text-slate-900 dark:text-white">21 Structured Masters</strong>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Section 5: Model Engineering & Inference FAQ */}
        <FAQSection
          faqs={RESEARCH_MODELS_FAQS}
          badge="Model Engineering & Research FAQ"
          title="Frequently Asked"
          titleHighlight="Questions"
          titleSuffix="about Axom AI Models"
          description="Everything you need to know about our sovereign foundation models, local CPU deployment, Assamese grammar precision, and enterprise integration."
          supportTitle="Have Technical Questions About Our Models?"
          supportDescription="Whether you are an academic researcher, AI engineer, government department, or startup, our Guwahati foundation research team is available to assist."
        />

        {/* Section 6: Bottom CTA Banner */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-950 via-slate-950 to-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Bot size={14} />
              <span>Experience Sovereign AI Live</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-5 leading-tight">
              Test Our Indigenous Models in Real-Time
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
              Axom AI powers conversations, OCR, study notes generation, and 20+ document utilities across Northeast India. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="https://chat.aiaxom.co.in/"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Start Chatting Free</span>
                <ArrowRight size={16} />
              </a>

              <Link
                href="/tools"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <span>Explore 20+ Production Tools</span>
              </Link>

              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <span>View Plan Pricing</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
