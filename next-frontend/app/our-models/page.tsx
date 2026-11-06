import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { RESEARCH_MODELS_FAQS } from '@/components/researchModelsFaqsData';
import { getLandingCMS } from '@/lib/api';
import {
  Cpu,
  Layers,
  Sparkles,
  Volume2,
  Mic,
  ArrowRight,
  ArrowUpRight,
  Globe2,
  FileCheck2,
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
  const title = 'Building the Next Generation of AI, From Assam to the World | Axom AI Models';
  const description =
    'Welcome to the Axom AI Model Ecosystem — a growing family of indigenous AI models engineered to understand Assamese language, voice, culture, knowledge, and real-world needs. From LLMs to speech and vision, explore sovereign AI built in Assam.';
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
                <span>Official Model Registry • Sovereign AI Ecosystem</span>
              </div>

              {/* H1 TITLE */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.2] sm:leading-tight mb-4 sm:mb-5 break-words">
                Building the Next Generation of AI,{' '}
                <span className="gradient-text">From Assam to the World</span>
              </h1>

              {/* SUBTITLE */}
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 px-1 space-y-4">
                <p>
                  Welcome to the Axom AI Model Ecosystem — a growing family of indigenous AI models engineered to understand Assamese language, voice, culture, knowledge, and real-world needs.
                </p>
                <p>
                  From large language models and generative voice technology to speech recognition, neural translation, computer vision, and public-sector intelligence, each model is built with a clear purpose: to make AI more local, more capable, and more useful for the people and communities it serves.
                </p>
                <p>
                  Explore the models, technologies, benchmarks, and systems we are building to put Assam on the map of global AI innovation.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#foundation-models"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 no-underline"
                >
                  <span>Explore Our Models</span>
                  <ArrowRight size={16} />
                </a>
                <a
                  href="/research"
                  className="px-6 py-3 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 no-underline"
                >
                  <span>View Research &amp; Benchmarks</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>

            </section>

          </div>
        </div>

        {/* Section 1: Sovereign Assamese AI Foundation Models */}
        <section id="foundation-models" className="py-16 sm:py-24 border-b border-emerald-900/10 dark:border-white/5 relative bg-[#f0fdf4]/50 dark:bg-[#0b1220]/50 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Sovereign Foundation Models</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#022c22] dark:text-white tracking-tight">
                Our Core Sovereign Foundation Models
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-2">
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


      </main>

      {/* Global Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
