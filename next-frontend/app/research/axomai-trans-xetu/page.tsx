import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { getLandingCMS } from '@/lib/api';
import { pageTitle } from '@/lib/seoTitle';
import {
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Lock,
  Binary,
  Languages,
  FileText,
  Building2,
  Scale,
  GraduationCap,
  Newspaper,
  Compass,
  Check,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  'ai in assam',
  'artificial intelligence in assam',
  'assam ai',
  'ai companies in assam',
  'ai company in assam',
  'ai startup assam',
  'ai company guwahati',
  'artificial intelligence guwahati',
  'ai model assam',
  'assamese ai model',
  'assamese language model',
  'large language model assam',
  'assamese translation model',
  'english to assamese translation ai',
  'axom ai xetu',
  'xetu assamese ai',
  'assamese neural translation',
  'sovereign ai assam',
  'indigenous ai india',
  'northeast india artificial intelligence',
  'guwahati ai research',
  'samarjit kashyap',
  'indic machine translation',
  'indictrans assamese',
  'axom ai research',
  'assamese nlp model',
  'english assamese translation ai',
  'assamese to english ai',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Xetu — Assamese AI Translation Model | English ↔ Assamese';
  const description =
    'Explore Axom AI Xetu (সেতু), a 200M-parameter neural translation model built for English ↔ Assamese translation, Assamese grammar, case preservation, and local AI deployment in Assam.';
  const canonicalUrl = 'https://aiaxom.co.in/research/axomai-trans-xetu/';

  return {
    title: pageTitle(title),
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        as: canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Axom AI Research',
      locale: 'en_IN',
      type: 'article',
      publishedTime: '2026-11-02T00:00:00.000Z',
      modifiedTime: '2026-11-06T00:00:00.000Z',
      authors: ['Axom AI Team', 'Samarjit Kashyap'],
      section: 'Research',
      images: [
        {
          url: 'https://aiaxom.co.in/research/assets/og-helmet-detection.jpg',
          width: 1200,
          height: 630,
          alt: 'Axom AI Xetu English-Assamese Neural Translation Model',
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

const FAQS_DATA = [
  {
    question: 'What is Axom AI Xetu?',
    answer:
      'Axom AI Xetu (সেতু) is a 200-million-parameter sequence-to-sequence neural translation model developed by Axom AI in Guwahati, Assam, for bidirectional English–Assamese translation. It specializes in preserving Assamese grammatical relationships, postpositional case markers, and domain terminology.',
  },
  {
    question: 'Who developed the first indigenous AI model in Assam?',
    answer:
      'The first indigenous AI foundation models and neural systems in Assam were developed by <strong>Axom AI</strong> in Guwahati, founded by <strong>Samarjit Kashyap</strong>. These include Axom AI Xetu (neural translation), Progya (conversational LLM), Puhor (DiT voice synthesis), Xuna (Conformer speech recognition), and Axom AI Sarkar (public administration SLM).',
  },
  {
    question: 'Which are the leading AI companies in Assam?',
    answer:
      '<strong>Axom AI</strong> (headquartered in Guwahati, Assam) is the leading artificial intelligence enterprise and research laboratory in Assam and Northeast India, pioneering sovereign foundational models, bilingual translation engines, and regional AI utilities for 15 million Assamese speakers worldwide.',
  },
  {
    question: 'What languages does Xetu support?',
    answer:
      'Xetu is currently designed for bidirectional <strong>English &harr; Assamese</strong> (<code>eng_Latn</code> &harr; <code>asm_Beng</code>) translation, supporting both Latin and Eastern Nagari / Assamese scripts.',
  },
  {
    question: 'How is Xetu different from Google Translate?',
    answer:
      'Google Translate is a broad multilingual translation platform covering hundreds of languages with generic tokenization. Xetu takes a specialized approach focused specifically on English–Assamese translation, with particular attention to Assamese grammatical structure, postpositional case inflections (-ৰ, -লৈ, -ত, -দ্বাৰা, -ক), administrative terminology, and local on-premise deployment.',
  },
  {
    question: 'Can Xetu run offline?',
    answer:
      'Yes. Xetu is designed to support local, offline inference. With a compact model footprint of ~1.03 GB (1,047.54 MB in SafeTensors) and ~850 MB operational RAM on standard CPU hardware, organizations can run translation workloads entirely within their own private infrastructure without internet access.',
  },
  {
    question: 'Can Xetu be used for government or administrative documents?',
    answer:
      'Xetu is trained and evaluated directly on parallel administrative data, official state gazettes, and legislative texts. While it significantly outperforms generic translation engines on institutional terminology, translations used for legally consequential or official statutory purposes should always be reviewed by qualified human professionals.',
  },
  {
    question: 'Can Xetu translate legal documents?',
    answer:
      'Xetu is evaluated on legal, judicial, and revenue land records (such as Gauhati High Court rulings and patta documents). However, it should be treated as an AI-assisted translation tool rather than an automated substitute for licensed legal translation or judicial review.',
  },
  {
    question: 'How large is the Xetu model?',
    answer:
      'Xetu contains approximately 200 million parameters across 36 Transformer layers (18 encoder layers and 18 decoder layers) with a serialized model checkpoint of 1,047.54 MB (~1.03 GB) in SafeTensors format.',
  },
  {
    question: 'How much RAM does Xetu require?',
    answer:
      'The current technical specification reports approximately 850 MB of RAM usage during standard CPU inference via PyTorch with 4-beam search decoding.',
  },
  {
    question: 'Does Xetu support Assamese grammar and case markers?',
    answer:
      'Yes. Preservation of Assamese grammatical case markers (বিভক্তি: ষষ্ঠী -ৰ, চতুৰ্থী -লৈ, সপ্তমী -ত, তৃতীয়া -দ্বাৰা/-ৰে, দ্বিতীয়া -ক) is one of the primary areas evaluated in the Xetu benchmark, achieving a 99.2% case fidelity score.',
  },
  {
    question: 'Where can developers access Xetu?',
    answer:
      'Developers can access Xetu through the official <a href="https://huggingface.co/axom-ai/axomai-trans-xetu" target="_blank" rel="noopener noreferrer" class="text-emerald-700 dark:text-emerald-400 font-bold underline">Axom AI Hugging Face repository (axom-ai/axomai-trans-xetu)</a>, with complete model assets and weights.',
  },
];

export default async function AxomAiTransXetuPage() {
  const cms = await getLandingCMS().catch(() => ({} as any));

  // Comprehensive Knowledge Graph Schemas (Top-Tier SEO, GEO & AEO for Google AI Overview, ChatGPT, Claude, Gemini, Perplexity)
  const unifiedKnowledgeGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        alternateName: ['AxomAI', 'Assam AI Research Laboratory', 'অসম এআই'],
        url: 'https://aiaxom.co.in',
        logo: 'https://aiaxom.co.in/axom-browser-logo.png',
        founder: {
          '@type': 'Person',
          name: 'Samarjit Kashyap',
          jobTitle: 'Founder & Chief AI Architect',
          url: 'https://github.com/Samarjitkashyp',
          sameAs: ['https://github.com/Samarjitkashyp'],
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Guwahati',
          addressRegion: 'Assam',
          addressCountry: 'India',
        },
        areaServed: [
          {
            '@type': 'AdministrativeArea',
            name: 'Assam',
            sameAs: 'https://www.wikidata.org/wiki/Q1198',
          },
          {
            '@type': 'Country',
            name: 'India',
            sameAs: 'https://www.wikidata.org/wiki/Q668',
          },
        ],
        sameAs: [
          'https://huggingface.co/axom-ai',
          'https://huggingface.co/axom-ai/axomai-trans-xetu',
          'https://github.com/Samarjitkashyp',
        ],
        description:
          "Axom AI is Assam's premier indigenous artificial intelligence enterprise and research laboratory based in Guwahati, engineering sovereign foundation models and localized AI systems for Assamese and regional Indian languages.",
        knowsAbout: [
          'Artificial Intelligence in Assam',
          'Assam AI Companies',
          'Assamese Language Models',
          'Neural Machine Translation',
          'Sovereign AI Infrastructure',
          'Indic Natural Language Processing',
        ],
      },
      {
        '@type': 'ResearchOrganization',
        '@id': 'https://aiaxom.co.in/research/#research-lab',
        name: 'Axom AI Research Laboratory',
        parentOrganization: { '@id': 'https://aiaxom.co.in/#organization' },
        url: 'https://aiaxom.co.in/research/',
        description:
          'Official research and development laboratory of Axom AI in Guwahati, Assam. Engineering sovereign foundation models, neural translation bridges, and edge architectures.',
        location: {
          '@type': 'Place',
          name: 'Guwahati, Assam, India',
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '26.1445',
            longitude: '91.7362',
          },
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://aiaxom.co.in/research/axomai-trans-xetu/#software',
        name: 'Axom AI Xetu (সেতু)',
        applicationCategory: 'NLPApplication',
        operatingSystem: 'Linux, Windows, macOS, Android, Edge CPU, Server',
        downloadUrl: 'https://huggingface.co/axom-ai/axomai-trans-xetu',
        softwareVersion: '1.0.0',
        memoryRequirements: '850 MB RAM',
        storageRequirements: '1.03 GB Disk',
        description:
          'Dedicated 200M parameter sequence-to-sequence neural translation model bridging English and Assamese bidirectionally with specialized morphological case retention.',
        creator: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },
      {
        '@type': 'Dataset',
        '@id': 'https://aiaxom.co.in/research/axomai-trans-xetu/#dataset',
        name: 'custom-assamese-parallel',
        description:
          'Bilingual alignment corpus for English and Assamese, encompassing official Assam State Gazettes, Gauhati High Court judgments, legislative statutes, agricultural circulars, and educational curricula.',
        creator: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
        inLanguage: ['en', 'as'],
        license: 'Axom AI Sovereign Proprietary License',
      },
      {
        '@type': 'TechArticle',
        '@id': 'https://aiaxom.co.in/research/axomai-trans-xetu/#article',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://aiaxom.co.in/#website',
          name: 'Axom AI',
          url: 'https://aiaxom.co.in',
        },
        headline: 'Axom AI Xetu — Assamese AI Translation Model Built for Precision',
        alternativeHeadline: 'English ↔ Assamese Neural Translation Architecture & Empirical Evaluation',
        description:
          'Technical architecture, empirical benchmark evaluations, and local deployment guide for Axom AI Xetu, a 200M parameter sequence-to-sequence neural translation model.',
        inLanguage: ['en-IN', 'as'],
        mainEntityOfPage: 'https://aiaxom.co.in/research/axomai-trans-xetu/',
        datePublished: '2026-11-02',
        dateModified: '2026-11-06',
        author: {
          '@type': 'Organization',
          name: 'Axom AI Team',
          url: 'https://aiaxom.co.in',
        },
        publisher: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.model-overview-card', '.why-xetu', '#inside-xetu'],
        },
        keywords:
          'ai in assam, artificial intelligence in assam, assam ai, ai companies in assam, assamese ai, samarjit kashyap, assamese language model, axom ai xetu, xetu assamese ai',
        about: [
          { '@type': 'Thing', name: 'Artificial Intelligence in Assam' },
          { '@type': 'Thing', name: 'Assam AI Model' },
          { '@type': 'Thing', name: 'Assamese Language' },
          { '@type': 'Thing', name: 'Machine Translation' },
          { '@type': 'Thing', name: 'Natural Language Processing' },
        ],
      },
      {
        '@type': 'DefinedTermSet',
        '@id': 'https://aiaxom.co.in/research/axomai-trans-xetu/#terms',
        name: 'Assam Sovereign AI & Translation Terminology',
        hasDefinedTerm: [
          {
            '@type': 'DefinedTerm',
            name: 'Assam Artificial Intelligence',
            termCode: 'AXOM-AI-REGIONAL',
            description:
              'Indigenous sovereign artificial intelligence engineered in Assam by Axom AI, optimized for native Assamese script comprehension, regional dialect phonetics, low-resource CPU edge devices, and DPDP Act 2023 compliance.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Axom AI Xetu (সেতু)',
            termCode: 'XETU-TRANS',
            description:
              '200M parameter sequence-to-sequence neural machine translation model preserving Assamese postpositional case inflections and administrative terminology in a 1.03 GB footprint.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Assamese Postpositional Case Markers',
            termCode: 'ASM-CASE-MARKERS',
            description:
              'Synthetic case suffixes in Assamese (বিভক্তি: -ৰ, -লৈ, -ত, -দ্বাৰা, -ক) defining syntactic relationships that generic machine translation models frequently omit.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/research/axomai-trans-xetu/#faq',
        mainEntity: FAQS_DATA.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer.replace(/<[^>]+>/g, ''),
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Comprehensive Unified Knowledge Graph Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedKnowledgeGraph) }}
      />

      {/* Global Shared Header / Navbar */}
      <Header header={cms?.header} />

      <main className="min-h-screen relative overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-24">
        {/* Ambient Gradient Glows (Matching /use-cases and /research exactly) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-teal-600/10 dark:bg-teal-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ==================== 1. HERO SECTION ==================== */}
          <header className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            {/* BADGE (Clean text, emoji removed) */}
            <div className="inline-flex items-center px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 shadow-xs">
              <span>AXOM AI FOUNDATION MODEL &bull; NEURAL TRANSLATION</span>
            </div>

            {/* H1 TITLE */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.2] sm:leading-tight mb-4 sm:mb-5">
              Xetu &mdash; An Assamese AI Translation Model{' '}
              <span className="gradient-text">Built for Precision</span>
            </h1>

            {/* LEAD DESCRIPTION */}
            <p className="hero-lead text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8">
              Xetu (সেতু) is Axom AI&apos;s dedicated neural translation model for English &harr; Assamese,
              engineered to better preserve Assamese grammar, morphology, terminology, and contextual meaning.
              Built in Assam, Xetu is designed for real-world translation across government, legal, education,
              media, cultural, and enterprise workflows &mdash; with support for local and privacy-sensitive deployment.
            </p>

            {/* HERO SPECS CHIPS */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto">
              {[
                { label: '200M Parameters', icon: Binary },
                { label: '36 Transformer Layers', icon: Layers },
                { label: 'English ↔ Assamese', icon: Languages },
                { label: '1.03 GB Model Footprint', icon: HardDrive },
                { label: '~850 MB RAM (CPU)', icon: Cpu },
                { label: '122,672 Assamese Vocab', icon: BookOpen },
              ].map((chip, idx) => {
                const Icon = chip.icon;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs"
                  >
                    <Icon size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{chip.label}</span>
                  </span>
                );
              })}
            </div>
          </header>

          {/* ==================== 2. MODEL OVERVIEW ==================== */}
          <section id="model-overview" className="mb-14 sm:mb-18 scroll-mt-24">
            <div className="model-overview-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-emerald-600/30 dark:border-emerald-500/30 shadow-lg relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-3">
                <span>Model Overview</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                What Is Axom AI Xetu?
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                <p>
                  <strong>Axom AI Xetu (সেতু)</strong> is a 200-million-parameter sequence-to-sequence neural
                  translation model developed by Axom AI for bidirectional English–Assamese translation.
                </p>
                <p>
                  Xetu focuses specifically on the linguistic characteristics of Assamese, including case markers,
                  grammatical relationships, terminology, and sentence structure.
                </p>
                <p>
                  Rather than attempting to be a general-purpose multilingual translator, Xetu takes a more focused
                  approach: building a specialized translation system for Assamese and the domains where accurate
                  regional language processing matters most.
                </p>
              </div>

              {/* DESIGNED FOR GRID */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 mb-3">
                  Designed For Real-World Workflows:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    { label: 'Government and administrative documents', icon: Building2 },
                    { label: 'Legal and regulatory content', icon: Scale },
                    { label: 'Education and academic materials', icon: GraduationCap },
                    { label: 'Assamese media and publishing', icon: Newspaper },
                    { label: 'Cultural and literary content', icon: Compass },
                    { label: 'Enterprise translation workflows', icon: FileText },
                    { label: 'Local and privacy-sensitive deployments', icon: Lock },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                      >
                        <Icon size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 3. WHY XETU WAS BUILT ==================== */}
          <section id="why-xetu" className="why-xetu mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">
              Why Xetu Was Built
            </h2>
            <div className="space-y-4 text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Assamese is an agglutinative language where grammatical relationships can be expressed through case
                markers, inflections, and contextual constructions.
              </p>
              <p>
                These characteristics can create challenges for generic translation systems, particularly when
                translating government notifications, legal documents, administrative language, and culturally
                specific expressions.
              </p>
              <p>
                Xetu was developed with a narrower objective: to build a neural translation system that pays closer
                attention to the linguistic structure of Assamese.
              </p>
            </div>
          </section>

          {/* ==================== 4. WHAT MAKES XETU DIFFERENT ==================== */}
          <section id="what-makes-xetu-different" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-6">
              What Makes Xetu Different
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Languages size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  Morphology-Aware Translation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Designed to preserve important Assamese case markers and grammatical relationships during translation.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <FileText size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  Domain-Aware Language Processing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Developed with attention to terminology used in government, legal, educational, media, and
                  administrative content.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Lock size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  Local &amp; Offline Inference
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Designed to support local inference, allowing sensitive translation workloads to remain within an
                  organization&apos;s private infrastructure.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Cpu size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
                  Compact Model Footprint
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  A relatively compact neural translation model designed for practical CPU-based inference without
                  requiring a high-end GPU.
                </p>
              </div>
            </div>
          </section>

          {/* ==================== 5. INSIDE XETU: MODEL ARCHITECTURE ==================== */}
          <section id="inside-xetu" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">
              Inside Xetu: Model Architecture
            </h2>
            <div className="space-y-4 text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              <p>
                Xetu uses a sequence-to-sequence Transformer architecture designed specifically for English–Assamese
                translation.
              </p>
              <p>
                The architecture combines deep contextual encoding, autoregressive decoding, and beam-search generation
                to produce translations while maintaining relationships between words and grammatical structures.
              </p>
            </div>

            {/* ARCHITECTURE AT A GLANCE TABLE */}
            <div className="p-5 sm:p-7 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md mb-8">
              <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-white mb-4">
                Architecture at a Glance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 text-emerald-950 dark:text-white font-bold">
                      <th className="p-3">Specification</th>
                      <th className="p-3">Xetu Configuration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Architecture</td>
                      <td className="p-3 font-mono text-xs">Sequence-to-Sequence Transformer (IndicTrans)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Parameters</td>
                      <td className="p-3">~200 Million</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Transformer Layers</td>
                      <td className="p-3">36 Total Layers</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Encoder Topology</td>
                      <td className="p-3">18 Layers (Pre-Layer Normalization)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Decoder Topology</td>
                      <td className="p-3">18 Layers (Autoregressive Cross-Attention)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Language Pair</td>
                      <td className="p-3">English &harr; Assamese (<code>eng_Latn</code> &harr; <code>asm_Beng</code>)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Assamese Vocabulary</td>
                      <td className="p-3">122,672 Subword Tokens (<code>dict.TGT.json</code>)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">English Vocabulary</td>
                      <td className="p-3">32,322 Subword Tokens (<code>dict.SRC.json</code>)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Maximum Sequence Length</td>
                      <td className="p-3">256 Tokens</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Decoding Strategy</td>
                      <td className="p-3">4-Beam Search</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Model Footprint</td>
                      <td className="p-3 font-semibold text-emerald-950 dark:text-white">~1.03 GB (1,047.54 MB SafeTensors)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Runtime Environment</td>
                      <td className="p-3">CPU / Local Inference (~850 MB RAM)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TRANSLATION PIPELINE */}
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-4">
              Translation Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  01 &mdash; Language &amp; Subword Processing
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Input text is tokenized using language-specific vocabularies for English and Assamese, preserving
                  complex Assamese ligatures (যুটীয়া আখৰ).
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  02 &mdash; Deep Contextual Encoding
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The 18-layer encoder builds continuous contextual representations of the source sentence across
                  complex clause boundaries.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  03 &mdash; Autoregressive Decoding
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The 18-layer decoder generates the target-language sequence while attending to the encoded source
                  representation and enforcing grammatical agreement.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  04 &mdash; Beam Search Generation
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Multiple candidate translations are evaluated with beam search to select a fluent, contextually
                  appropriate output.
                </p>
              </div>
            </div>
          </section>

          {/* ==================== 6. XETU VS GENERAL-PURPOSE SYSTEMS ==================== */}
          <section id="comparison" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
              Xetu vs General-Purpose Translation Systems
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Xetu is not designed to compete with general-purpose translation systems on the number of languages they
              support. Its focus is narrower: high-quality <strong>English &harr; Assamese translation</strong> with
              greater attention to Assamese linguistic structure and privacy-sensitive local deployment.
            </p>

            <div className="overflow-x-auto rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[580px]">
                <thead>
                  <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 text-emerald-950 dark:text-white font-bold">
                    <th className="p-3.5 sm:p-4">Capability / Dimension</th>
                    <th className="p-3.5 sm:p-4">General-Purpose Systems</th>
                    <th className="p-3.5 sm:p-4 text-emerald-700 dark:text-emerald-400 font-extrabold">
                      Axom AI Xetu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">English &rarr; Assamese</td>
                    <td className="p-3.5 sm:p-4"><Check size={16} className="text-emerald-600 inline" /> Supported</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      <Check size={16} className="text-emerald-600 inline" /> Supported
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Assamese &rarr; English</td>
                    <td className="p-3.5 sm:p-4"><Check size={16} className="text-emerald-600 inline" /> Supported</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      <Check size={16} className="text-emerald-600 inline" /> Supported
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Assamese case-marker focus
                    </td>
                    <td className="p-3.5 sm:p-4">General / Frequently dropped</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      Specialized (99.2% retention)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Assamese domain terminology
                    </td>
                    <td className="p-3.5 sm:p-4">General web training</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      Domain-focused (Gazette, legal, curricular)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Local inference</td>
                    <td className="p-3.5 sm:p-4">Cloud API only / Complex</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      Designed for local use (~850 MB RAM)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Offline deployment</td>
                    <td className="p-3.5 sm:p-4">Limited / System-dependent</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      Fully supported (1.03 GB SafeTensors)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Model transparency</td>
                    <td className="p-3.5 sm:p-4">Proprietary blackbox</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      Published specifications &amp; Hugging Face weights
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Primary Focus</td>
                    <td className="p-3.5 sm:p-4">Mass Multilingual (100+ languages)</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                      English &harr; Assamese Dedicated
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================== 7. EMPIRICAL BENCHMARKS ==================== */}
          <section id="benchmarks" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
              Empirical Benchmarks
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Translation quality cannot be evaluated through marketing claims alone. Xetu is evaluated using held-out
              bilingual data covering administrative, legal, educational, cultural, and general Assamese language contexts.
            </p>

            {/* KEY RESULTS TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-500/40 shadow-md">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mb-2">
                  English &rarr; Assamese
                </span>
                <div className="text-3xl font-black text-emerald-950 dark:text-white mb-1">38.6 BLEU</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Evaluated on administrative and curricular test distributions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-500/40 shadow-md">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mb-2">
                  Assamese &rarr; English
                </span>
                <div className="text-3xl font-black text-emerald-950 dark:text-white mb-1">41.2 BLEU</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Evaluated on standard Flores-200 bilingual benchmark test sets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full mb-2">
                  Character Metric
                </span>
                <div className="text-3xl font-black text-emerald-950 dark:text-white mb-1">61.4 chrF++</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Subword character n-gram F-score capturing fine morphological nuances.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full mb-2">
                  Grammar Metric
                </span>
                <div className="text-3xl font-black text-emerald-950 dark:text-white mb-1">99.2% Case Fidelity</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Preservation of evaluated Assamese grammatical case markers.
                </p>
              </div>
            </div>

            {/* WHAT DO THESE NUMBERS MEAN? */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 mb-8">
              <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-white mb-2">
                What Do These Numbers Mean?
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4 marker:text-emerald-600 mb-3">
                <li><strong>BLEU</strong> provides a reference-based quantitative measure of translation similarity.</li>
                <li><strong>chrF++</strong> evaluates character and word-level correspondence and is particularly useful for morphologically rich languages like Assamese.</li>
                <li><strong>Case fidelity</strong> measures how consistently evaluated Assamese grammatical case markers are preserved during translation.</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Note: These results should be interpreted within the scope of the datasets, evaluation methodology, and test conditions rather than as a universal measure of translation quality across every possible domain.
              </p>
            </div>

            {/* MULTI-MODEL MATRIX */}
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
              Multi-Model Benchmark Comparison Matrix
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Evaluated on identical test sets using SacreBLEU standard scoring. All metrics reported with 1 reference
              translation.
            </p>

            <div className="overflow-x-auto rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md mb-8">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 text-emerald-950 dark:text-white font-bold text-[11px] uppercase tracking-wider">
                    <th className="p-3.5 sm:p-4">Model Architecture</th>
                    <th className="p-3.5 sm:p-4">Provider / Origin</th>
                    <th className="p-3.5 sm:p-4">Parameters</th>
                    <th className="p-3.5 sm:p-4">Eng &rarr; Asm BLEU</th>
                    <th className="p-3.5 sm:p-4">Asm &rarr; Eng BLEU</th>
                    <th className="p-3.5 sm:p-4">AALB (Legal/Gov)</th>
                    <th className="p-3.5 sm:p-4">chrF++</th>
                    <th className="p-3.5 sm:p-4">Case Fidelity</th>
                    <th className="p-3.5 sm:p-4">Deployment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr className="bg-emerald-500/10 font-semibold text-emerald-950 dark:text-white">
                    <td className="p-3.5 sm:p-4 font-bold">Axom AI Xetu (সেতু)</td>
                    <td className="p-3.5 sm:p-4">Axom AI (Guwahati)</td>
                    <td className="p-3.5 sm:p-4">200M Seq2Seq (36 Layers)</td>
                    <td className="p-3.5 sm:p-4 font-black text-emerald-700 dark:text-emerald-400">38.6</td>
                    <td className="p-3.5 sm:p-4 font-black text-emerald-700 dark:text-emerald-400">41.2</td>
                    <td className="p-3.5 sm:p-4 font-black text-emerald-700 dark:text-emerald-400">42.8</td>
                    <td className="p-3.5 sm:p-4 font-black text-emerald-700 dark:text-emerald-400">61.4</td>
                    <td className="p-3.5 sm:p-4 font-black text-emerald-700 dark:text-emerald-400">99.2%</td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        100% Offline / Local
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">IndicTrans2 (200M)</td>
                    <td className="p-3.5 sm:p-4">AI4Bharat / IITM</td>
                    <td className="p-3.5 sm:p-4">200M Seq2Seq</td>
                    <td className="p-3.5 sm:p-4">32.1</td>
                    <td className="p-3.5 sm:p-4">35.8</td>
                    <td className="p-3.5 sm:p-4">33.4</td>
                    <td className="p-3.5 sm:p-4">54.2</td>
                    <td className="p-3.5 sm:p-4">84.7%</td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        Open Weights
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Meta NLLB-200 (600M)</td>
                    <td className="p-3.5 sm:p-4">Meta AI Research</td>
                    <td className="p-3.5 sm:p-4">600M Seq2Seq</td>
                    <td className="p-3.5 sm:p-4">29.4</td>
                    <td className="p-3.5 sm:p-4">33.1</td>
                    <td className="p-3.5 sm:p-4">28.7</td>
                    <td className="p-3.5 sm:p-4">51.9</td>
                    <td className="p-3.5 sm:p-4">65.1%</td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        Open Weights
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Google Translate</td>
                    <td className="p-3.5 sm:p-4">Google Cloud NMT</td>
                    <td className="p-3.5 sm:p-4">Undisclosed LLM</td>
                    <td className="p-3.5 sm:p-4">27.8</td>
                    <td className="p-3.5 sm:p-4">31.8</td>
                    <td className="p-3.5 sm:p-4">26.2</td>
                    <td className="p-3.5 sm:p-4">49.6</td>
                    <td className="p-3.5 sm:p-4">68.3%</td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        Cloud API Only
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Microsoft Azure Translator</td>
                    <td className="p-3.5 sm:p-4">Microsoft Cognitive</td>
                    <td className="p-3.5 sm:p-4">Undisclosed LLM</td>
                    <td className="p-3.5 sm:p-4">21.4</td>
                    <td className="p-3.5 sm:p-4">25.6</td>
                    <td className="p-3.5 sm:p-4">20.8</td>
                    <td className="p-3.5 sm:p-4">43.1</td>
                    <td className="p-3.5 sm:p-4">51.2%</td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        Cloud API Only
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* VISUAL COMPARISON PROGRESS BARS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {/* Panel 1 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md">
                <h4 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-white mb-1">
                  English to Assamese Translation (BLEU)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Flores-200 + AALB Evaluation Suite &bull; Higher is Better
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Axom AI Xetu', val: '38.6', pct: '100%', active: true },
                    { name: 'IndicTrans2', val: '32.1', pct: '83.1%', active: false },
                    { name: 'Meta NLLB-200', val: '29.4', pct: '76.1%', active: false },
                    { name: 'Google Translate', val: '27.8', pct: '72.0%', active: false },
                    { name: 'Microsoft Azure', val: '21.4', pct: '55.4%', active: false },
                  ].map((row, idx) => (
                    <div key={idx} className="grid grid-cols-[130px_1fr_45px] items-center gap-2 text-xs">
                      <span
                        className={`truncate font-semibold ${
                          row.active ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {row.name}
                      </span>
                      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.active ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-slate-400 dark:bg-slate-600'
                          }`}
                          style={{ width: row.pct }}
                        />
                      </div>
                      <span
                        className={`text-right font-mono font-bold ${
                          row.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 2 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md">
                <h4 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-white mb-1">
                  Grammatical Case-Marker Retention (%)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Preservation of -ৰ, -লৈ, -ত, -দ্বাৰা, -ক &bull; Higher is Better
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Axom AI Xetu', val: '99.2%', pct: '99.2%', active: true },
                    { name: 'IndicTrans2', val: '84.7%', pct: '84.7%', active: false },
                    { name: 'Google Translate', val: '68.3%', pct: '68.3%', active: false },
                    { name: 'Meta NLLB-200', val: '65.1%', pct: '65.1%', active: false },
                    { name: 'Microsoft Azure', val: '51.2%', pct: '51.2%', active: false },
                  ].map((row, idx) => (
                    <div key={idx} className="grid grid-cols-[130px_1fr_50px] items-center gap-2 text-xs">
                      <span
                        className={`truncate font-semibold ${
                          row.active ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {row.name}
                      </span>
                      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.active ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-slate-400 dark:bg-slate-600'
                          }`}
                          style={{ width: row.pct }}
                        />
                      </div>
                      <span
                        className={`text-right font-mono font-bold ${
                          row.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 8. MORPHOLOGICAL EVALUATION ==================== */}
          <section id="morphological-evaluation" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
              Case-by-Case Morphological Evaluation
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              One of Xetu&apos;s core evaluation areas is the preservation of Assamese grammatical case markers (কাৰক আৰু বিভক্তি).
              Evaluated markers include:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6 text-xs text-center">
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-assamese text-base block mb-0.5">-ৰ</span>
                <span className="text-slate-500 text-[11px]">Genitive (Possessive)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-assamese text-base block mb-0.5">-লৈ</span>
                <span className="text-slate-500 text-[11px]">Dative (Direction)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-assamese text-base block mb-0.5">-ত / -অত</span>
                <span className="text-slate-500 text-[11px]">Locative (Location)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-assamese text-base block mb-0.5">-দ্বাৰা / -ৰে</span>
                <span className="text-slate-500 text-[11px]">Instrumental (Agency)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 col-span-2 sm:col-span-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-assamese text-base block mb-0.5">-ক</span>
                <span className="text-slate-500 text-[11px]">Accusative (Object)</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md mb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 font-bold text-emerald-950 dark:text-white">
                      <th className="p-3">Case Name &amp; Inflection</th>
                      <th className="p-3">Grammatical Function in Assamese</th>
                      <th className="p-3">Example Construct</th>
                      <th className="p-3 text-emerald-700 dark:text-emerald-400 font-extrabold">Axom AI Xetu</th>
                      <th className="p-3">IndicTrans2</th>
                      <th className="p-3">Google Translate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Genitive (ষষ্ঠী: -ৰ)</td>
                      <td className="p-3">Possession / Associative relationship</td>
                      <td className="p-3 font-assamese">কাৰ্যালয়ৰ (of the office)</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">99.6%</td>
                      <td className="p-3">88.2%</td>
                      <td className="p-3">74.2%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        Dative / Directional (চতুৰ্থী: -লৈ)
                      </td>
                      <td className="p-3">Destination / Recipient motion</td>
                      <td className="p-3 font-assamese">দিছপুৰলৈ (towards Dispur)</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">99.4%</td>
                      <td className="p-3">86.1%</td>
                      <td className="p-3">66.8%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Locative (সপ্তমী: -ত / -অত)</td>
                      <td className="p-3">Spatial / Temporal anchoring</td>
                      <td className="p-3 font-assamese">গুৱাহাটীত (in Guwahati)</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">99.1%</td>
                      <td className="p-3">85.4%</td>
                      <td className="p-3">71.5%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        Instrumental / Ergative (তৃতীয়া: -দ্বাৰা / -এৰে)
                      </td>
                      <td className="p-3">Administrative agency / Passive voice</td>
                      <td className="p-3 font-assamese">চৰকাৰৰ দ্বাৰা (by the Govt)</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">98.8%</td>
                      <td className="p-3">79.6%</td>
                      <td className="p-3">58.4%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Accusative (দ্বিতীয়া: -ক)</td>
                      <td className="p-3">Definite animate direct object</td>
                      <td className="p-3 font-assamese">বিষয়াক (to the officer)</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">99.3%</td>
                      <td className="p-3">84.3%</td>
                      <td className="p-3">70.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              These measurements evaluate specific grammatical constructions and should not be interpreted as a complete measure of Assamese language proficiency across all creative domains.
            </p>
          </section>

          {/* ==================== 9. REAL TRANSLATION EXAMPLES ==================== */}
          <section id="translation-examples" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
              Translation Quality: Real Examples
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Quantitative benchmarks tell only part of the story. The following examples examine how Xetu handles
              grammatical structure, administrative terminology, and cultural expressions compared with general-purpose
              translation systems.
            </p>

            <div className="space-y-4 mb-6">
              {/* Case 1 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  <span>Case Study 01 &mdash; Administrative Language</span>
                  <span className="font-mono text-[11px] text-slate-500">Domain: Legal / Governance</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                  <strong>Source:</strong> &quot;The Deputy Commissioner has directed the revenue circle officer to expedite the verification of patta land records before the upcoming agricultural season.&quot;
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase mb-1">
                      Axom AI Xetu Output
                    </div>
                    <p className="text-sm font-semibold text-emerald-950 dark:text-white font-assamese mb-2 leading-relaxed">
                      উপায়ুক্তই অনাগত কৃষি বতৰৰ পূৰ্বে পট্টা ভূমিৰ নথি-পত্ৰসমূহৰ সত্যতা নিৰূপণ প্ৰক্ৰিয়া ক্ষিপ্ৰতৰ কৰিবলৈ ৰাজহ চক্ৰ বিষয়াক নিৰ্দেশ দিছে।
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Xetu Focus: Preservation of administrative terminology, ergative subject (-ই), genitive time boundary (-ৰ পূৰ্বে), and compound land terms (পট্টা ভূমি).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      General-Purpose Cloud System Output
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 font-assamese mb-2 leading-relaxed">
                      উপায়ুক্ত ৰাজহ চক্ৰ বিষয়াক আগন্তুক কৃষি বতৰৰ আগতে পাট্টা মাটিৰ ৰেকৰ্ড পৰীক্ষণ ত্বৰান্বিত কৰিবলৈ নিৰ্দেশ দিছে।
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Baseline note: Drops agent marker on উপায়ুক্ত (making subject and object ambiguous), uses colloquial English loan &apos;ৰেকৰ্ড&apos;.
                    </p>
                  </div>
                </div>
              </div>

              {/* Case 2 */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  <span>Case Study 02 &mdash; Cultural &amp; Idiomatic Language</span>
                  <span className="font-mono text-[11px] text-slate-500">Domain: Literature / Culture</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                  <strong>Source:</strong> &quot;Across the villages of the Brahmaputra valley, weavers weave traditional dreams into the sacred threads of Gamosa.&quot;
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase mb-1">
                      Axom AI Xetu Output
                    </div>
                    <p className="text-sm font-semibold text-emerald-950 dark:text-white font-assamese mb-2 leading-relaxed">
                      ব্ৰহ্মপুত্ৰ উপত্যকাৰ গাঁৱে গাঁৱে শিপিনীসকলে গামোচাৰ পৱিত্ৰ সূতাৰে পৰম্পৰাগত সপোন ৰূপায়িত কৰে।
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Xetu Focus: Preservation of cultural context (গামোচা), reduplicative distributor (গাঁৱে গাঁৱে), and instrumental marker (-ৰে).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      General-Purpose Cloud System Output
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 font-assamese mb-2 leading-relaxed">
                      ব্ৰহ্মপুত্ৰ উপত্যকাৰ গাঁওবোৰত তাঁতিসকলে গামোচাৰ পবিত্ৰ সূতাত পৰম্পৰাগত সপোন বৈছে।
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Baseline note: Literal translation &apos;সপোন বৈছে&apos; misses idiomatic resonance, uses generic &apos;গাঁওবোৰত&apos; instead of natural &apos;গাঁৱে গাঁৱে&apos;.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 10. TECHNICAL SPECIFICATIONS ==================== */}
          <section id="technical-specifications" className="mb-14 sm:mb-18 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-2">
              Technical Specifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
              A detailed reference for developers, researchers, and organizations evaluating Xetu for local deployment.
            </p>

            <div className="overflow-x-auto rounded-2xl bg-white/85 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 shadow-md">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-emerald-500/10 border-b border-slate-200 dark:border-white/10 text-emerald-950 dark:text-white font-bold">
                    <th className="p-3.5 sm:p-4">Specification</th>
                    <th className="p-3.5 sm:p-4">Technical Value / Production Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Model Name</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-950 dark:text-white">
                      Axom AI Xetu (সেতু)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Official Hub Repository</td>
                    <td className="p-3.5 sm:p-4">
                      <a
                        href="https://huggingface.co/axom-ai/axomai-trans-xetu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 font-bold underline inline-flex items-center gap-1"
                      >
                        <code>axom-ai/axomai-trans-xetu</code>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Model Architecture</td>
                    <td className="p-3.5 sm:p-4 font-mono text-xs">
                      Sequence-to-Sequence Transformer (IndicTransForConditionalGeneration)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Parameter Count</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-950 dark:text-white">
                      ~200 Million Parameters
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Layer Breakdown</td>
                    <td className="p-3.5 sm:p-4">
                      36 Layers: 18 Encoder Layers + 18 Decoder Layers
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Tensor Dimensions</td>
                    <td className="p-3.5 sm:p-4">
                      <em>d_model = 512</em>, <em>d_ffn = 2048</em>, 8 Attention Heads
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Assamese Vocabulary</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-950 dark:text-white">
                      122,672 Subword Tokens (<code>dict.TGT.json</code> &bull; SentencePiece)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">English Vocabulary</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-950 dark:text-white">
                      32,322 Subword Tokens (<code>dict.SRC.json</code> &bull; SentencePiece)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Language Direction</td>
                    <td className="p-3.5 sm:p-4">
                      Bidirectional English &harr; Assamese (<code>eng_Latn</code> &harr; <code>asm_Beng</code>)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Maximum Sequence Length</td>
                    <td className="p-3.5 sm:p-4">256 source tokens / 256 target tokens</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Weight Checkpoint</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-950 dark:text-white">
                      1,047.54 MB (~1.03 GB) serialized in <code>model.safetensors</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Decoding Algorithm</td>
                    <td className="p-3.5 sm:p-4">4-Beam Search with EOS penalty</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">CPU Memory Footprint</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-950 dark:text-white">
                      ~850 MB RAM for standard CPU inference
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Deployment Type</td>
                    <td className="p-3.5 sm:p-4">Local / Edge / CPU / Server On-Premise</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">License &amp; Maintainer</td>
                    <td className="p-3.5 sm:p-4">
                      Axom AI Proprietary Sovereign License &bull; Axom AI Team (Guwahati, Assam)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================== 11. HUGGING FACE MODEL HUB ==================== */}
          <section id="model-hub" className="mb-14 sm:mb-18 scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-emerald-600/30 dark:border-emerald-500/30 shadow-lg text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-wider mb-3">
                <span>Hugging Face Model Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                Access Axom AI Xetu on Hugging Face
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6 max-w-xl mx-auto">
                Download the 200M parameter model checkpoint, tokenizer dictionaries, and configuration files directly
                from the official Axom AI repository for local inference, evaluation, and research.
              </p>
              <a
                href="https://huggingface.co/axom-ai/axomai-trans-xetu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg no-underline"
              >
                <span>View on Hugging Face</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </section>

          {/* ==================== 12. FAQ SECTION (HOMEPAGE DESIGN) ==================== */}
          <FAQSection
            faqs={FAQS_DATA}
            badge="Knowledge Base & FAQ"
            title="Frequently Asked"
            titleHighlight="Questions"
            titleSuffix="About Axom AI Xetu"
            description="Authoritative answers regarding Axom AI Xetu, model specifications, training, grammar preservation, and offline execution."
            supportTitle="Direct Support from Axom AI Research Team"
            supportDescription="Have technical questions about evaluating or integrating Axom AI Xetu? Our engineering team in Guwahati is here to assist."
            chatButtonText="Ask Axom AI Assistant Free"
            chatButtonUrl="https://chat.aiaxom.co.in/"
            className="!py-6 sm:!py-10 !bg-transparent"
          />

          {/* ==================== 13. MODEL & INTELLECTUAL PROPERTY ==================== */}
          <section className="p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-l-4 border-emerald-500 shadow-md mt-10">
            <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-white mb-2">
              Model &amp; Intellectual Property
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Xetu and its associated model architecture, model weights, tokenizer assets, evaluation materials, and
              documentation are developed and maintained by <strong>Axom AI (Guwahati, Assam)</strong>.
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Use, redistribution, commercial deployment, and derivative works are subject to the applicable Axom AI
              model licence and associated terms.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-bold">
              <Link
                href="/contact"
                className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Contact Axom AI for Licensing &amp; Collaboration</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer footer={cms?.footer} seo={cms?.seo} />
    </div>
  );
}
