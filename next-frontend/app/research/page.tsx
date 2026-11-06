import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { RESEARCH_MODELS_FAQS } from '@/components/researchModelsFaqsData';
import { getLandingCMS } from '@/lib/api';
import { pageTitle } from '@/lib/seoTitle';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Bot,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  'Axom AI Research',
  'Axom AI models research',
  'indigenous AI research Assam',
  'sovereign Assamese AI',
  'Progya LLM research',
  'Puhor TTS paper',
  'Xuna ASR Conformer speech',
  'Xetu Assamese neural translation',
  'XUWOR multimodal AI Assam',
  'YOLOv8 helmet detection CCTV Assam',
  'Assam generative AI Guwahati',
  'DPDP compliant AI research India',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Research — Sovereign Foundation Models & Technical Research from Assam';
  const description =
    'Practical AI built in Assam, published with real numbers. Explore empirical benchmarks, reproducible models, and open reports for Progya 2B, XUWOR, Puhor, Xuna, Xetu, and YOLOv8 Helmet Detection.';
  const canonicalUrl = 'https://aiaxom.co.in/research/';

  return {
    title: pageTitle(title),
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Axom AI Research',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: 'https://aiaxom.co.in/research/assets/og-helmet-detection.jpg',
          width: 1200,
          height: 630,
          alt: 'Axom AI Research Laboratory, Guwahati, Assam',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://aiaxom.co.in/research/assets/og-helmet-detection.jpg'],
    },
  };
}

export default async function ResearchPage() {
  const cms = await getLandingCMS().catch(() => ({} as any));

  // Structured Data Schemas
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Axom AI Research — Sovereign Foundation Models & Applied Systems',
    description:
      'Technical architecture and measured benchmark evaluations for Axom AI indigenous generative models: XUWOR, Progya, Puhor, Xuna, Xetu, Sarkar, and Helmet Detection.',
    url: 'https://aiaxom.co.in/research/',
    publisher: {
      '@type': 'Organization',
      name: 'Axom AI',
      url: 'https://aiaxom.co.in',
      logo: 'https://aiaxom.co.in/axom-browser-logo.png',
      foundingLocation: {
        '@type': 'Place',
        name: 'Guwahati, Assam, India',
      },
    },
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
        name: 'Research',
        item: 'https://aiaxom.co.in/research/',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://aiaxom.co.in/research/#faq',
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

      {/* Global Shared Header / Navbar */}
      <Header header={cms?.header} />

      <main className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 relative overflow-hidden pt-24 sm:pt-28 pb-14 sm:pb-20">
        
        {/* Ambient Gradient Glows (Exact match with /use-cases) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ==================== HERO SECTION (MATCHING /use-cases EXACTLY) ==================== */}
          <section className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 md:mb-16">
            
            {/* BADGE PILL */}
            <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 shadow-sm">
              <span>Official Axom AI Research • Sovereign Foundation Models</span>
            </div>

            {/* H1 TITLE */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.2] sm:leading-tight mb-4 sm:mb-5 break-words">
              Practical AI built in Assam,{' '}
              <span className="gradient-text">published with real numbers</span>
            </h1>

            {/* SUBTITLE */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 px-1">
              What we built, how we measured it, what worked, what failed and what we still cannot do. Every technical report links to its open-source code, verified training datasets, and empirical limits.
            </p>

            {/* FILTER PILLS */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <a
                href="#applied-systems"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium no-underline shadow-xs"
              >
                Applied Systems
              </a>
              <a
                href="#foundation-models"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium no-underline shadow-xs"
              >
                Foundation LLMs &amp; SLMs
              </a>
              <a
                href="/research/helmet-detection/"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium no-underline shadow-xs"
              >
                Computer Vision &amp; CCTV
              </a>
            </div>

            {/* BYLINE */}
            <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              By <strong className="text-slate-800 dark:text-slate-200 font-bold">Axom AI Team</strong>
            </p>

          </section>

          {/* ==================== OVERVIEW CARD ==================== */}
          <section id="what-is-axom-ai-research" className="max-w-5xl mx-auto mb-16 sm:mb-20 md:mb-24 scroll-mt-24">
            <div className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="space-y-4 sm:space-y-5 relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight leading-snug">
                  What is Axom AI Research? Sovereign Artificial Intelligence &amp; Foundation Models from Assam
                </h2>

                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                  <strong>Axom AI Research</strong> is the indigenous AI engineering laboratory of Axom AI based in Guwahati, Assam (PIN 781001). We publish open technical reports, reproducible empirical benchmarks, and sovereign model architectures built specifically for Northeast India. Each release documents what we engineered, our held-out test metrics, resource footprints on standard CPU edge hardware, and the precise failure boundaries we are solving next.
                </p>

                {/* 3-Column Knowledge Specification Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Entity &amp; Location
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                      Sovereign AI Research Lab
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Guwahati, Assam (781001)
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Foundation LLMs &amp; SLMs
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                      Progya (2B) &amp; Sarkar (492M)
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Xetu, Puhor, Xuna, XUWOR
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Open Access &amp; Licensing
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                      Apache-2.0 &amp; MIT Licenses
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Hugging Face &amp; GitHub Verified
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ==================== SECTION 1: APPLIED AI SYSTEMS ==================== */}
          <section id="applied-systems" className="mb-16 sm:mb-20 md:mb-24 scroll-mt-24">
            <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3">
                <span>Applied Systems • Field Deployments</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-3">
                Applied AI Systems &amp; <span className="gradient-text">Field Implementations</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                End-to-end computer vision, automated web indexing, and browser architectures built for high-throughput edge operation in Assam and India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Card 1: Helmet Detection */}
              <a
                href="/research/helmet-detection/"
                className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden no-underline"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-950/20">
                  <img
                    src="/research/assets/detection-junction.jpg"
                    alt="Helmet detection results on traffic camera footage with verdict boxes"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/65 border border-white/20 text-white backdrop-blur-md">
                    Computer vision • Road safety
                  </span>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
                      <span>Updated Nov 5, 2026</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      Helmet Detection: every rider checked, from a phone video or a CCTV camera
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 mb-4 line-clamp-3">
                      An end-to-end computer vision system that detects motorcycle riders, evaluates individual helmet compliance per person, and sends instant photo alerts to Telegram, dashboard, and Android app on 100% CPU.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">By Axom AI Research</span>
                    <span className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      Read Report &rarr;
                    </span>
                  </div>
                </div>
              </a>

              {/* Card 2: Crawler Bot */}
              <a
                href="/research/axom-ai-crawler-bot/"
                className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden no-underline"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-950/20">
                  <img
                    src="/research/assets/card-crawler-bot.jpg"
                    alt="Crawler bot pipeline: website, clean text, questions, Axom AI chat"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/65 border border-white/20 text-white backdrop-blur-md">
                    AI • Knowledge for chat
                  </span>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
                      <span>Updated Oct 27, 2026</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      Axom AI Crawler Bot: websites and documents turned into answers
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 mb-4 line-clamp-3">
                      How a private tool reads websites and scanned Assamese, Hindi and English documents, cleans the text and writes a question for every passage, so the Axom AI chat can answer from them.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">By Axom AI Research</span>
                    <span className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      Read Report &rarr;
                    </span>
                  </div>
                </div>
              </a>

              {/* Card 3: Axomai Browser */}
              <a
                href="/research/axomai-browser/"
                className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden no-underline"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-emerald-950/20">
                  <img
                    src="/research/assets/card-browser.jpg"
                    alt="Axomai Browser homepage with Assamese AI quick search and news"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/65 border border-white/20 text-white backdrop-blur-md">
                    Mobile • Sovereign Browser
                  </span>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
                      <span>Updated Oct 26, 2026</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      Axomai Browser: a free AI browser made in Assam
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 mb-4 line-clamp-3">
                      A lightweight Android browser engineered in Assam featuring native Assamese speech synthesis, intelligent ad-blocking, offline reader mode, and local AI search integration.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">By Axom AI Research</span>
                    <span className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      Read Report &rarr;
                    </span>
                  </div>
                </div>
              </a>

            </div>
          </section>

          {/* ==================== SECTION 2: SOVEREIGN ASSAMESE AI FOUNDATION MODELS ==================== */}
          <section id="foundation-models" className="mb-16 sm:mb-20 md:mb-24 scroll-mt-24">
            <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3">
                <span>Foundational Architectures • 6 Sovereign Models</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-3">
                Sovereign Assamese AI <span className="gradient-text">Foundation Models</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Six specialized indigenous neural networks engineered from the ground up for the Assamese script, public administration, and 100% CPU edge execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              
              {/* 1. XUWOR (Master Multimodal) */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-500/30 dark:border-emerald-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      MODEL 01 • MULTIMODAL
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      Speech • Vision • Text
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <a href="/research/axomai-multimodal-xuwor/" className="no-underline text-inherit">
                      Axom AI Master &mdash; XUWOR (সুঁৱৰ)
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Assam&apos;s first full-duplex multimodal conversational AI ecosystem. Synchronizes hearing (Xuna), thinking (Progya), speaking (Puhor), and translation (Xetu) under 3.8 GB RAM.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">&lt; 3.8 GB RAM • 12 min</span>
                  <a
                    href="/research/axomai-multimodal-xuwor/"
                    className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold no-underline"
                  >
                    Read Report &rarr;
                  </a>
                </div>
              </div>

              {/* 2. PROGYA (2B LLM) */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      MODEL 02 • REASONING
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      2.00B Dense LLM
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <a href="/research/axomai-brain-progya/" className="no-underline text-inherit">
                      Axom AI Brain &mdash; Progya (প্ৰজ্ঞা)
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Assam&apos;s sovereign 2 Billion parameter dense language model with 68,096 native Assamese tokens, grounded in 6.19 Million cultural and historical records.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">1.2 GB Q4_K_M • 10 min</span>
                  <a
                    href="/research/axomai-brain-progya/"
                    className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold no-underline"
                  >
                    Read Report &rarr;
                  </a>
                </div>
              </div>

              {/* 3. PUHOR (TTS) */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      MODEL 03 • SPEECH VOICE
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      24kHz Studio TTS
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <a href="/research/axomai-voice-puhor/" className="no-underline text-inherit">
                      Axom AI Voice &mdash; Puhor (পোহৰ)
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Assam&apos;s first 24,000 Hz studio-grade Flow-Matching Diffusion Transformer (DiT) voice engine with 0.0% hallucination and dual sovereign Assamese personas.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Flow-Matching DiT • 8 min</span>
                  <a
                    href="/research/axomai-voice-puhor/"
                    className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold no-underline"
                  >
                    Read Report &rarr;
                  </a>
                </div>
              </div>

              {/* 4. XUNA (ASR) */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      MODEL 04 • SPEECH AUDIO
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      600M Conformer ASR
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <a href="/research/axomai-speech-xuna/" className="no-underline text-inherit">
                      Axom AI Speech &mdash; Xuna (শুনা)
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Assam&apos;s 600M Conformer ASR engine running 3.8x faster than real-time (0.261x RTF) on CPU with extreme immunity to monsoon rain, fans, and mobile noise.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">0.261x RTF CPU • 9 min</span>
                  <a
                    href="/research/axomai-speech-xuna/"
                    className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold no-underline"
                  >
                    Read Report &rarr;
                  </a>
                </div>
              </div>

              {/* 5. XETU (Translation) */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      MODEL 05 • TRANSLATION
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      200M Neural Bridge
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <a href="/research/axomai-trans-xetu/" className="no-underline text-inherit">
                      Axom AI Bridge &mdash; Xetu (সেতু)
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Bidirectional English &harr; Assamese translation bridge preserving complex case inflections (-লৈ, -ৰ, -ত) and legal precision in an offline 1.03 GB model.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">1.03 GB Offline • 8 min</span>
                  <a
                    href="/research/axomai-trans-xetu/"
                    className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold no-underline"
                  >
                    Read Report &rarr;
                  </a>
                </div>
              </div>

              {/* 6. SARKAR (Governance SLM) */}
              <div className="group rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                      MODEL 06 • GOVERNANCE
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      492M Governance SLM
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <a href="/research/axomai-sarkar/" className="no-underline text-inherit">
                      Axom AI Sarkar (অসম চৰকাৰ AI সহায়ক)
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Assam&apos;s sovereign 492M public administration SLM trained on 3.3 Million+ instruction pairs across all 35 Districts, 130 LACs, Mission Basundhara, and Sewa Setu.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">468 MB GGUF • 10 min</span>
                  <a
                    href="/research/axomai-sarkar/"
                    className="text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold no-underline"
                  >
                    Read Report &rarr;
                  </a>
                </div>
              </div>

            </div>
          </section>

          {/* ==================== SECTION 3: REUSABLE FAQ COMPONENT ==================== */}
          <FAQSection
            faqs={RESEARCH_MODELS_FAQS}
            badge="Research & Foundation Models FAQ"
            title="Frequently Asked"
            titleHighlight="Questions"
            titleSuffix="about Axom AI Research"
            description="Everything you need to know about Axom AI Research, our sovereign foundation models, Assamese language capabilities, public utility tools, and sovereign data residency."
            supportTitle="Direct Support from Assam's AI Research Team"
            supportDescription="Can't find what you're looking for? Whether you are a student, researcher, developer, academic institution, or public sector partner, our local team is ready to help."
            className="!py-12 sm:!py-16 md:!py-20 !bg-transparent"
          />

          {/* ==================== SECTION 4: FINAL CTA ==================== */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-950 via-slate-950 to-black text-white relative overflow-hidden rounded-3xl mt-12 sm:mt-16 border border-emerald-900/30 shadow-2xl">
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 no-underline"
                >
                  <span>Start Chatting Free</span>
                  <ArrowRight size={16} />
                </a>

                <Link
                  href="/tools"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 no-underline"
                >
                  <span>Explore 20+ Production Tools</span>
                </Link>

                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 no-underline"
                >
                  <span>View Plan Pricing</span>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
