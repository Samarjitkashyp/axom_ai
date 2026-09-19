import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import WordToPdfConverter from '../../../components/tools/WordToPdfConverter';
import WordToPdfFaq from '../../../components/tools/WordToPdfFaq';
import { WORD_TO_PDF_FAQS } from '../../../components/tools/wordToPdfData';
import { getWordToPdfCMS } from '../../../lib/api';
import {
  FileText,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  Smartphone,
  Award,
  Check,
  X as XIcon,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Monitor,
  Globe2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'word to pdf converter',
  // Secondary SEO Keywords
  'word to pdf',
  'convert word to pdf',
  'online word to pdf converter',
  'free word to pdf converter',
  'convert docx to pdf',
  'docx to pdf converter',
  'doc to pdf converter',
  'online document to pdf converter',
  'word document to pdf converter',
  'microsoft word to pdf',
  'convert word document to pdf online',
  'free docx to pdf converter',
  'word file to pdf converter',
  'document converter to pdf',
  'word to pdf online free',
  // AEO Keywords (Question-Based)
  'how to convert Word to PDF',
  'how to convert a Word document to PDF',
  'how can I convert DOCX to PDF online',
  'how to convert Word to PDF for free',
  'what is the easiest way to convert Word to PDF',
  'can I convert Word files to PDF online',
  'how do I convert a DOC file to PDF',
  'how to convert Word to PDF without installing software',
  'how to convert multiple Word files to PDF',
  'is Word to PDF conversion free',
  'can I convert Word to PDF on mobile',
  'can I convert DOCX to PDF without Microsoft Word',
  'how to convert a Word file to PDF online',
  // GEO Keywords (Generative Engine Optimization)
  'best free Word to PDF converter online',
  'free online Word to PDF converter',
  'reliable Word to PDF converter',
  'secure Word to PDF converter online',
  'Word to PDF converter without watermark',
  'easy Word to PDF converter',
  'fast Word to PDF converter',
  'online DOCX to PDF converter',
  'Word to PDF converter for mobile',
  'Word to PDF converter for Windows',
  'Word to PDF converter for Mac',
  'Word to PDF converter for students',
  'Word to PDF converter for business documents',
  'Word to PDF converter with no software installation',
  'privacy-friendly Word to PDF converter',
  // Long-Tail Keywords
  'free word to pdf converter online without watermark',
  'convert Word document to PDF online for free',
  'convert DOCX file to PDF online',
  'convert Word file to PDF without Microsoft Word',
  'convert Word to PDF online without installing software',
  'free DOCX to PDF converter online',
  'convert multiple Word documents to PDF online',
  'Word to PDF converter for mobile devices',
  'secure online Word to PDF converter',
  'fast Word document to PDF converter',
  // India / Local GEO
  'word to pdf converter online India',
  'free word to pdf converter India',
  'online document converter India',
  'free PDF tools India',
  'Word to PDF converter online free India',
  'DOCX to PDF converter India',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getWordToPdfCMS();

  const title = cms?.meta_title || 'Word to PDF Converter Online Free — Convert DOCX to PDF | Axom AI';
  const description =
    cms?.meta_description ||
    'Free online Word to PDF converter. Convert Word documents (.docx, .doc) to PDF online in seconds with 100% original formatting, tables, and fonts preserved. No watermark, no software installation, completely free.';
  const canonicalUrl = cms?.canonical_url || 'https://aiaxom.co.in/tools/word-to-pdf';
  const ogImage = cms?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';
  const keywords = cms?.meta_keywords
    ? [...new Set([...cms.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean), ...TARGET_KEYWORDS])]
    : TARGET_KEYWORDS;

  return {
    title,
    description,
    keywords,
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
          alt: title,
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

export default async function WordToPdfPage() {
  const cms = await getWordToPdfCMS();

  const activeFaqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : WORD_TO_PDF_FAQS;

  // Structured JSON-LD Schemas for AEO & GEO
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Axom AI Word to PDF Converter',
    alternateName: [
      'Word to PDF Converter Online',
      'Free DOCX to PDF Converter',
      'Axom AI Document Converter',
      'Online Word Document to PDF Converter',
    ],
    url: cms?.canonical_url || 'https://aiaxom.co.in/tools/word-to-pdf',
    description:
      cms?.meta_description ||
      'Free online Word to PDF converter utility by Axom AI to convert Microsoft Word documents (.docx, .doc) to publication-quality PDF files while preserving typography, tables, and formatting with zero watermarks.',
    applicationCategory: 'BusinessApplication, UtilitiesApplication',
    operatingSystem: 'All (Web Browser, Windows 11/10, macOS, Linux, Android, iOS, ChromeOS)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      '100% Free Word to PDF conversion online',
      'Convert DOCX to PDF and DOC to PDF in under 3 seconds',
      'Lossless layout, font, and table preservation',
      'No watermark added to output files, 100% clean',
      'Zero software installation or Microsoft Office needed',
      '256-bit SSL encrypted transfer with automatic file purging',
      'Cross-platform support on Mobile (Android/iOS), Windows, and Mac',
      'Pro Batch Mode converting up to 20 files simultaneously',
      `Supports ${cms?.tech_spec_inputs || '.docx, .doc, .rtf, .txt, and .odt'} documents up to ${cms?.max_file_size_mb || 25} MB`,
    ],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: '2.5',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '3420',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Word to PDF Online for Free',
    description:
      'Step-by-step guide to convert Word documents (.docx, .doc) into high-resolution, watermark-free PDF files online in seconds without installing software.',
    totalTime: 'PT10S',
    tool: {
      '@type': 'HowToTool',
      name: 'Axom AI Word to PDF Converter Online',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your Word Document (.docx or .doc)',
        text: 'Drag and drop your Microsoft Word document (.docx or .doc) into the converter box above or click to browse files from your computer or phone.',
        url: 'https://aiaxom.co.in/tools/word-to-pdf#converter',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Instant High-Fidelity Conversion',
        text: 'Click Convert to PDF Now. Our high-fidelity document engine parses structures, styles, margins, and tables in 2–3 seconds without altering layouts.',
        url: 'https://aiaxom.co.in/tools/word-to-pdf#converter',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download Your Clean PDF',
        text: 'Click Download PDF to save your publication-ready, watermark-free PDF document directly to your device.',
        url: 'https://aiaxom.co.in/tools/word-to-pdf#converter',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: activeFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
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
        name: 'Tools',
        item: 'https://aiaxom.co.in/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Word to PDF Converter',
        item: cms?.canonical_url || 'https://aiaxom.co.in/tools/word-to-pdf',
      },
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    description: "Axom AI is India and Assam's leading sovereign artificial intelligence and intelligent document processing platform.",
    sameAs: [
      'https://twitter.com/axom_ai',
      'https://github.com/Samarjitkashyp/axom_ai',
    ],
  };

  // Comparison matrix fallback rows
  const comparisonRows =
    cms?.comparison_matrix && cms.comparison_matrix.length > 0
      ? cms.comparison_matrix
      : [
          {
            feature: 'Daily Limit & Cost',
            axom: 'Free 20 files/day (Unlimited on Pro)',
            other: '1-2 files per day limit',
            paid: '$10 - $20 / month',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Batch Conversion',
            axom: 'Up to 20 files at once (Pro)',
            other: 'Single file only',
            paid: 'Supported (Paid only)',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Watermarks',
            axom: 'Never (100% Clean)',
            other: 'Added to PDF',
            paid: 'Clean (Paid only)',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Account / Registration',
            axom: 'No signup needed',
            other: 'Often forced signup',
            paid: 'Required signup + Card',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Document Privacy',
            axom: 'Auto-purged immediately',
            other: 'Stored up to 24 hours',
            paid: 'Cloud stored',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Typography & Tables',
            axom: 'High-precision rendering',
            other: 'Frequent alignment errors',
            paid: 'High-precision',
            axom_check: true,
            other_check: false,
          },
        ];

  return (
    <>
      {/* Inject Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Global Shared Header / Navbar */}
      <Navbar />

      <main className="min-h-screen bg-[#06060b] text-slate-200 relative overflow-hidden pt-28 pb-20">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* HERO SECTION */}
          <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4 shadow-sm">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span>{cms?.hero_badge_text || '⚡ Free: 20 Files / Day • 🛡️ No Watermark • 👑 Pro Batch Mode'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {cms?.hero_heading_prefix || 'Free'}{' '}
              <span className="gradient-text">{cms?.hero_heading_highlight || 'Word to PDF Converter'}</span>{' '}
              {cms?.hero_heading_suffix || 'Online'}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {cms?.hero_description ||
                'Convert your Microsoft Word (.DOCX, .DOC), Rich Text, and text files into professional, print-ready PDF documents instantly. Fast, secure, and 100% free with zero watermarks. Preserve tables, fonts, and layouts without installing software.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Convert DOCX & DOC
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> 100% Free Daily Quota
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Zero Watermarks
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> 256-Bit TLS Encryption
              </span>
            </div>
          </section>

          {/* CONVERTER WIDGET (IN-PAGE, NO POPUPS!) */}
          <section id="converter" className="mb-14">
            <WordToPdfConverter
              freeDailyLimit={cms?.free_daily_limit}
              proBatchLimit={cms?.pro_batch_limit}
              maxFileSizeMb={cms?.max_file_size_mb}
            />
          </section>

          {/* AEO DIRECT ANSWER & GENERATIVE ENGINE SUMMARY BOX */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/25 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1 shadow-inner">
                  <Sparkles size={22} className="text-fuchsia-400" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    <span>Quick Answer • Generative Engine Summary</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    What is Axom AI Word to PDF Converter?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI Word to PDF Converter</strong> is an online document utility engineered to convert Microsoft Word documents (<strong>.docx</strong> and <strong>.doc</strong>), Rich Text (<strong>.rtf</strong>), and text files into high-resolution, vector-quality PDF documents in under 3 seconds. Operating entirely in modern web browsers, it requires <strong>no software installation</strong>, <strong>no account signup</strong>, and adds <strong>zero watermarks</strong>. It guarantees 100% layout fidelity, preserving complex tables, custom fonts, footnotes, and margins.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> 100% Free Daily Conversions
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> No Watermark Added
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Instant Server Purge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: HOW IT WORKS (HOWTO) */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.how_it_works_title || 'How to Convert Word to PDF in 3 Easy Steps'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.how_it_works_subheading ||
                  'No complex software installation or account creation required. Fast, reliable, and frictionless.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_1_title || 'Upload Your Word File'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_1_desc ||
                    'Drag and drop your DOCX or DOC file into the converter box above or choose it from your local storage.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_2_title || 'Instant Conversion'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_2_desc ||
                    'Click Convert. Our high-fidelity document engine parses structures, styles, margins, and media in seconds.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_3_title || 'Download PDF'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_3_desc ||
                    'Download your clean, publication-ready PDF document directly to your device. No watermarks, ever.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHY AXOM AI (BENEFITS & ARCHITECTURE) */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.why_title || 'Why Axom AI Word to PDF is the Superior Choice'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.why_subheading ||
                  'Engineered for students, educators, legal professionals, and businesses who demand accuracy and privacy.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_1_title || 'Lossless Layout Fidelity'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_1_desc ||
                    'Headers, footers, footnotes, complex tables, embedded charts, and custom fonts stay strictly aligned without shifting pages.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_2_title || 'Zero Watermarks, 100% Free'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_2_desc ||
                    'No hidden subscription traps or promotional watermarks stamped across your pages. Clean documents ready for official submissions.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_3_title || 'Automatic File Purging'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_3_desc ||
                    'Documents are processed securely via SSL encryption and purged automatically from our server memory right after conversion.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_4_title || 'Universal Device Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_4_desc ||
                    'Works seamlessly on iOS, Android, macOS, Windows, and Linux. No apps or browser extensions needed.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_5_title || 'Sub-3-Second Speed'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_5_desc ||
                    'High-speed optimized micro-services convert standard documents in less than 3 seconds with minimal bandwidth usage.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_6_title || 'Multi-Format Compatibility'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_6_desc ||
                    'Handles DOCX, DOC, RTF, TXT, and ODT with automatic format detection and smart structure extraction.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2.5: TAILORED USE CASES FOR GEO & USER PERSONAS */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
                <span>Versatile Applications</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Tailored for Every Workflow & Industry
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Discover why students, corporate teams, mobile users, and educators choose Axom AI for mission-critical document conversions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Word to PDF for Students & Academics</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Convert college dissertations, assignments, thesis papers, and CV resumes. Retain exact mathematical formulas, citations, footnotes, and bibliography charts without page break shifts.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Briefcase size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Word to PDF for Business & Legal Documents</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Convert contracts, client NDAs, commercial invoices, and financial reports. Benefit from enterprise 256-bit SSL encryption and guaranteed instantaneous file purging upon completion.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-fuchsia-500/30 transition flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center shrink-0">
                  <Smartphone size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Word to PDF Converter for Mobile (Android & iOS)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Seamlessly convert DOCX files on iPhone, iPad, or Android smartphones. Directly import documents from WhatsApp downloads, Google Drive, or local storage without installing heavy office apps.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Monitor size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">No Microsoft Word or Office 365 Required</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Convert Word files on Windows 11/10, macOS, and Linux without needing an active Microsoft Office license or desktop software. Everything processes online in your browser.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: COMPARISON MATRIX (CRITICAL FOR GEO & AI SEARCH CITATIONS) */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
                <span>{cms?.comparison_badge || 'Direct Feature Comparison'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {cms?.comparison_title || 'Axom AI vs. Traditional Word to PDF Converters'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                {cms?.comparison_subheading || 'See why users choose Axom AI over paywalled and ad-heavy alternatives.'}
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-semibold">Feature / Capability</th>
                    <th className="p-4 sm:p-5 font-bold text-purple-300 bg-purple-500/10 border-x border-purple-500/20">
                      Axom AI Converter
                    </th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Other Free Converters</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Paid Commercial Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                      <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5">
                        <Check size={16} className="text-emerald-400 shrink-0" />
                        <span>{row.axom}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-slate-400">
                        {row.other_check === false ? (
                          <span className="text-rose-400 flex items-center gap-1.5">
                            <XIcon size={16} className="text-rose-400 shrink-0" />
                            <span>{row.other}</span>
                          </span>
                        ) : (
                          row.other
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.paid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: TECHNICAL SPECIFICATIONS (FOR AEO / GEO LLM SUMMARIES) */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={22} className="text-purple-400" />
              <span>{cms?.tech_spec_title || 'Technical Specifications & Supported Standards'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs sm:text-sm">
              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Supported Inputs
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_inputs || '.docx, .doc, .rtf, .txt, .odt'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Output Standard
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_output || 'PDF 1.7 / ISO 32000-1 (Vector)'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Maximum File Size
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_max_size || '25 Megabytes (MB)'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Security Protocol
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_security || 'TLS 1.3 / SSL 256-bit'}
                </div>
              </div>
            </div>
          </section>

          {/* INDIA & REGIONAL AUTHORITY SECTION */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-purple-950/20 border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Globe2 size={28} />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <span>🇮🇳 India's Sovereign AI & Document Platform</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Fast, Secure & Regional Unicode Ready Document Conversion in India
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Engineered with Indian privacy standards, Axom AI provides high-speed domestic routing, full compliance with data protection principles, and native support for regional Unicode scripts (including <strong>Assamese</strong>, <strong>Hindi / Devanagari</strong>, and <strong>Bengali</strong>) alongside Indian English document conventions.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: INTERACTIVE FAQS (MATCHES FAQPAGE SCHEMA) */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.faq_section_title || 'Frequently Asked Questions (FAQ)'}
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                {cms?.faq_section_subheading || 'Got questions about Word to PDF conversion? Find verified answers below.'}
              </p>
            </div>

            <WordToPdfFaq faqs={activeFaqs} />
          </section>

          {/* SECTION 6: BOTTOM CALL TO ACTION */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {cms?.cta_title || 'Convert Your Word Documents in Seconds'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
              {cms?.cta_desc ||
                'Experience fast, private, and watermark-free conversions trusted by users across Assam and India.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={cms?.cta_btn_primary_url || '#converter'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition"
              >
                {cms?.cta_btn_primary_text || 'Upload Word File Now'}
              </a>
              <Link
                href={cms?.cta_btn_secondary_url || '/tools'}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <span>{cms?.cta_btn_secondary_text || 'Explore All AI & Document Tools'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer />
    </>
  );
}
