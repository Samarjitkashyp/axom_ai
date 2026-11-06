import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { RESEARCH_MODELS_FAQS } from '@/components/researchModelsFaqsData';
import { getLandingCMS } from '@/lib/api';
import { pageTitle } from '@/lib/seoTitle';
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
  'ai model assam',
  'ai models in assam',
  'artificial intelligence in assam',
  'ai company assam',
  'ai companies in assam',
  'ai company guwahati',
  'ai companies in guwahati',
  'best ai company in assam',
  'top ai company in assam',
  'artificial intelligence guwahati',
  'artificial intelligence company in assam',
  'artificial intelligence lab assam',
  'ai research and development assam',
  'ai development company in guwahati',
  'ai startup in assam',
  'ai startup guwahati',
  'assamese ai model',
  'assamese large language model',
  'assamese llm',
  'largest assamese language model',
  'assamese language models',
  'sovereign ai assam',
  'sovereign foundation models assam',
  'progya 2b assamese llm',
  'progya llm',
  'xuwor multimodal ai',
  'puhor voice assamese',
  'puhor tts',
  'xuna asr assam',
  'xetu assamese translation',
  'axom ai sarkar',
  'garima visual ai',
  'assam generative ai',
  'assam ai assistant',
  'indigenous ai research assam',
  'sovereign ai india',
  'dpdp compliant sovereign ai',
  'who built ai in assam',
  'first ai company in assam',
  'northeast india ai models',
  'huggingface axom ai',
  'cpu native ai model assam',
  'Axom AI Models',
  'Axom AI foundation models',
  'Axom AI ecosystem',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Models — #1 AI Models & Artificial Intelligence Company in Assam';
  const description =
    'Axom AI is Assam\'s premier sovereign artificial intelligence company and foundation models developer in Guwahati. Discover our indigenous models: Progya 2B (Assamese LLM), XUWOR (Multimodal AI), Puhor (24kHz Voice), Xuna (Conformer ASR), Xetu (Translation), Garima (Vision), and Axom AI Sarkar (Governance SLM). 100% CPU edge execution, 99.4% Assamese script purity, and DPDP Act 2023 compliance.';
  const canonicalUrl = 'https://aiaxom.co.in/our-models/';
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

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
      siteName: 'Axom AI',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Axom AI Sovereign Foundation Models & Artificial Intelligence Ecosystem, Guwahati, Assam',
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

  // Comprehensive Unified Knowledge Graph Schema (Extreme SEO, GEO & AEO for Google AI Overview, ChatGPT, Claude, Gemini, Groq, Perplexity)
  const unifiedKnowledgeGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        alternateName: [
          'অসম এআই',
          'Axom Artificial Intelligence',
          'AxomAI',
          'Axom AI Models',
          'Axom AI Guwahati',
          'Axom AI Company Assam',
          'Axom AI Research Laboratory',
        ],
        url: 'https://aiaxom.co.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://aiaxom.co.in/axom-browser-logo.png',
          caption: 'Axom AI Sovereign Artificial Intelligence Company',
        },
        slogan: 'Building the Next Generation of AI, From Assam to the World',
        description:
          'Axom AI is Assam’s premier sovereign artificial intelligence company and foundation models developer headquartered in Guwahati, Assam. Pioneering native Assamese Large Language Models (LLMs), multimodal conversational intelligence, streaming speech recognition, and CPU-native edge inference.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Guwahati R&D Lab',
          addressLocality: 'Guwahati',
          addressRegion: 'Assam',
          postalCode: '781001',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '26.1445',
          longitude: '91.7362',
        },
        founder: {
          '@type': 'Person',
          name: 'Samarjit Kashyap',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Assam' },
          { '@type': 'AdministrativeArea', name: 'Northeast India' },
          { '@type': 'Country', name: 'India' },
        ],
        knowsAbout: [
          'Artificial Intelligence in Assam',
          'AI Companies in Assam',
          'AI Models in Assam',
          'Assamese Large Language Model (LLM)',
          'Sovereign AI Foundation Models',
          'Generative Artificial Intelligence',
          'Progya 2B Assamese LLM',
          'XUWOR Multimodal AI',
          'Puhor 24kHz Diffusion TTS',
          'Xuna Conformer ASR',
          'Xetu Neural Translation Bridge',
          'Axom AI Sarkar 492M Governance SLM',
          '100% CPU Native Edge Deployment',
          'India DPDP Act 2023 Data Sovereignty',
        ],
        sameAs: [
          'https://huggingface.co/axom-ai',
          'https://github.com/axom-ai',
          'https://x.com/AXOM__AI',
          'https://www.linkedin.com/company/ai-axom/',
          'https://www.youtube.com/@axom-ai',
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://aiaxom.co.in/our-models/#webpage',
        url: 'https://aiaxom.co.in/our-models/',
        name: 'Axom AI Models — #1 Sovereign AI Models & Artificial Intelligence Company in Assam',
        description:
          'Official model registry and technical directory of Axom AI sovereign foundation models: Progya 2B, XUWOR, Puhor, Xuna, Xetu, and Axom AI Sarkar.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://aiaxom.co.in/#website',
          url: 'https://aiaxom.co.in',
          name: 'Axom AI',
        },
        about: [
          { '@type': 'Thing', name: 'Artificial Intelligence in Assam' },
          { '@type': 'Thing', name: 'AI Models in Assam' },
          { '@type': 'Thing', name: 'AI Companies in Assam' },
          { '@type': 'Thing', name: 'Assamese Large Language Model (LLM)' },
          { '@type': 'Thing', name: 'Sovereign AI Foundation Models' },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': 'https://aiaxom.co.in/our-models/#models-list',
        name: 'Axom AI Sovereign Foundation Models Ecosystem',
        description: 'Family of 7 sovereign artificial intelligence models engineered in Assam.',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Axom AI Brain — Progya (প্ৰজ্ঞা)',
            description: '2.00B Dense Assamese Cognitive Large Language Model with 68,096 tokens.',
            url: 'https://huggingface.co/axom-ai/axomai-brain-progya',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Axom AI Master — XUWOR (সুঁৱৰ)',
            description: 'Assam’s first full-duplex multimodal conversational AI ecosystem under 3.8 GB RAM.',
            url: 'https://huggingface.co/axom-ai/axomai-multimodal-xuwor',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Axom AI Voice — Puhor (পোহৰ)',
            description: '24,000 Hz studio-grade Flow-Matching Diffusion Transformer (DiT) voice engine.',
            url: 'https://huggingface.co/axom-ai/axomai-voice-puhor',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Axom AI Speech — Xuna (শুনা)',
            description: '600M Conformer ASR running 3.8x faster than real-time on standard CPU.',
            url: 'https://huggingface.co/axom-ai/axomai-speech-xuna',
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: 'Axom AI Bridge — Xetu (সেতু)',
            description: '200M parameter bidirectional English-Assamese neural translation bridge.',
            url: 'https://huggingface.co/axom-ai/axomai-trans-xetu',
          },
          {
            '@type': 'ListItem',
            position: 6,
            name: 'Axom AI Sarkar (অসম চৰকাৰ AI সহায়ক)',
            description: '492M public governance SLM trained on 3.3 Million+ instruction pairs across Assam.',
            url: 'https://huggingface.co/axom-ai/AxomAI-Sarkar',
          },
          {
            '@type': 'ListItem',
            position: 7,
            name: 'Axom AI Visual — Garima (গৰিমা)',
            description: 'Regional Visual Intelligence & Generative Image Engine for Northeast India.',
            url: 'https://huggingface.co/axom-ai/axomai-visual-garima',
          },
        ],
      },
      {
        '@type': 'DefinedTermSet',
        '@id': 'https://aiaxom.co.in/our-models/#terms',
        name: 'Assam Sovereign AI & Foundation Model Terminology',
        hasDefinedTerm: [
          {
            '@type': 'DefinedTerm',
            name: 'Artificial Intelligence in Assam',
            termCode: 'AI-ASSAM',
            description:
              'The ecosystem of indigenous sovereign artificial intelligence engineered in Assam by Axom AI, encompassing foundational LLMs, speech technologies, and edge computing tailored for regional linguistic identity and state infrastructure.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'AI Companies in Assam',
            termCode: 'AI-COMPANIES-ASSAM',
            description:
              'Technology enterprises operating in Assam focused on machine learning and artificial intelligence. Axom AI is Assam’s pioneer indigenous AI research and foundation model company headquartered in Guwahati.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Assamese Large Language Model (Assamese LLM)',
            termCode: 'ASSAMESE-LLM',
            description:
              'A foundation transformer model trained specifically on Assamese linguistic corpora with dedicated tokenization, ensuring 99.4% script purity without Bengali contamination, exemplified by Axom AI Brain (Progya 2B).',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Progya 2B (প্ৰজ্ঞা)',
            termCode: 'PROGYA-2B',
            description:
              'Assam’s flagship 2.00 Billion parameter dense Assamese foundation LLM with 68,096 native tokens, running locally on CPU with zero cloud GPU lock-in.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'XUWOR Multimodal (সুঁৱৰ)',
            termCode: 'XUWOR-AI',
            description:
              'Assam’s full-duplex multimodal conversational AI combining vision, listening, thinking, and speaking under 3.8 GB RAM.',
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://aiaxom.co.in/our-models/#breadcrumb',
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
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/our-models/#faq-schema',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Which is the leading AI company in Assam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI is Assam’s premier sovereign artificial intelligence company and research laboratory headquartered in Guwahati. Axom AI has engineered and published 7 indigenous foundation models (including Progya 2B, XUWOR, and Sarkar) verified on Hugging Face.',
            },
          },
          {
            '@type': 'Question',
            name: 'What AI models are developed in Assam by Axom AI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI has engineered 7 sovereign AI models: Progya 2B (Dense Assamese LLM), XUWOR (Full-Duplex Multimodal), Puhor (24kHz Studio Voice TTS), Xuna (600M Conformer ASR), Xetu (Bidirectional Translation), Axom AI Sarkar (492M Governance SLM), and Garima (Visual AI).',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the largest Assamese Large Language Model (LLM)?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI Brain (Progya 2B) is Assam’s largest indigenous dense language model, featuring 2.00 Billion parameters, 68,096 native Assamese tokens, 99.4% script purity, and 6.19 Million regional training records.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can Axom AI models run on standard CPUs without costly GPUs?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. All Axom AI foundation models are engineered for 100% CPU edge execution with memory budgets from under 500 MB RAM (Sarkar SLM) to 3.8 GB RAM (XUWOR multimodal duplex), enabling offline deployment on budget laptops, school PCs, and local servers across Assam.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does Axom AI ensure data sovereignty under Indian law?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'All Axom AI training, inference, and tokenization comply strictly with India’s Digital Personal Data Protection (DPDP) Act 2023, with zero prompt retraining and 100% data residency inside Indian sovereign data centers.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Unified Structured Data Knowledge Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedKnowledgeGraph) }}
      />

      {/* Global Navbar */}
      <Header header={cms?.header} />

      <main className="flex-1">
        {/* ==================== HERO SECTION (MATCHING /research EXACTLY) ==================== */}
        <div className="relative overflow-hidden pt-20 sm:pt-28 pb-8 sm:pb-12">
          {/* Ambient Gradient Glows (Exact match with /research & /use-cases) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[140px]" />
            <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
              
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
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 px-2 space-y-3 sm:space-y-4">
                <p>
                  Welcome to the Axom AI Model Ecosystem — a growing family of indigenous AI models engineered to understand Assamese language, voice, culture, knowledge, and real-world needs.
                </p>
                <p>
                  From large language models and generative voice technology to speech recognition, neural translation, computer vision, and public-sector intelligence, each model is built with a clear purpose: to make AI more local, more capable, and more useful for the people and communities it serves.
                </p>
              </div>

              {/* ACTION BUTTONS (Fully Mobile Responsive) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto px-2 sm:px-0">
                <a
                  href="#foundation-models"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 no-underline"
                >
                  <span>Explore Our Models</span>
                  <ArrowRight size={16} />
                </a>
                <a
                  href="/research"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 active:scale-95 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 no-underline"
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



        {/* Section: Model Engineering & Inference FAQ */}
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
