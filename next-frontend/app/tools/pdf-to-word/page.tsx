import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PdfToWordConverter from '../../../components/tools/PdfToWordConverter';
import PdfToWordFaq from '../../../components/tools/PdfToWordFaq';
import { PDF_TO_WORD_FAQS } from '../../../components/tools/pdfToWordData';
import { getPdfToWordCMS } from '../../../lib/api';
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
  'pdf to word converter',
  // Secondary SEO Keywords
  'pdf to word',
  'convert pdf to word',
  'pdf to docx converter',
  'pdf to word converter online',
  'free pdf to word converter',
  'online pdf to word converter',
  'convert pdf to docx',
  'pdf to editable word',
  'pdf document to word converter',
  'pdf to microsoft word converter',
  'convert pdf file to word',
  'free pdf to docx converter',
  'pdf to word online free',
  'pdf converter to word',
  'online pdf converter',
  // AEO Keywords (Question-Based)
  'how to convert PDF to Word',
  'how to convert PDF to Word online',
  'how to convert PDF to Word for free',
  'how can I convert PDF to DOCX',
  'how do I convert a PDF into an editable Word document',
  'can I convert PDF to Word online',
  'how to convert PDF to Word without software',
  'how to convert PDF to Word on mobile',
  'how to convert PDF to Word without losing formatting',
  'can I convert multiple PDF files to Word',
  'how to convert PDF to editable Word',
  'is PDF to Word conversion free',
  'how to convert PDF to DOCX without Microsoft Word',
  // GEO Keywords (Generative Engine Optimization)
  'best free PDF to Word converter online',
  'free online PDF to Word converter',
  'reliable PDF to Word converter',
  'secure PDF to Word converter online',
  'PDF to Word converter without watermark',
  'PDF to Word converter with accurate formatting',
  'PDF to Word converter for students',
  'PDF to Word converter for business documents',
  'PDF to Word converter for legal documents',
  'PDF to Word converter for scanned documents',
  'fast PDF to Word converter online',
  'private PDF to Word converter',
  'PDF to Word converter without software installation',
  'PDF to editable DOCX converter online',
  // Long-Tail Keywords
  'free PDF to Word converter online without watermark',
  'convert PDF to editable Word document online',
  'convert PDF to DOCX online for free',
  'convert PDF to Word without losing formatting',
  'convert PDF to Word without installing software',
  'convert PDF to editable Word online',
  'free PDF to DOCX converter online',
  'convert multiple PDF files to Word online',
  'secure PDF to Word converter online',
  'PDF to Word converter with table formatting',
  'PDF to Word converter with images and layout',
  'convert PDF to Word on Android',
  'convert PDF to Word on iPhone',
  // India / Local GEO
  'pdf to word converter online India',
  'free pdf to word converter India',
  'pdf converter online India',
  'free PDF tools India',
  'PDF to Word converter Assam',
  'online PDF tools Assam',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPdfToWordCMS();

  const title = cms?.meta_title || 'PDF to Word Converter Online Free — Convert PDF to DOCX | Axom AI';
  const description =
    cms?.meta_description ||
    'Free online PDF to Word converter. Convert PDF to editable Word (.docx) documents in seconds with 100% original formatting, tables, and fonts preserved. No watermark, no software installation, completely free.';
  const canonicalUrl = cms?.canonical_url || 'https://chat.aiaxom.co.in/tools/pdf-to-word';
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

export default async function PdfToWordPage() {
  const cms = await getPdfToWordCMS();

  const activeFaqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : PDF_TO_WORD_FAQS;

  // Structured JSON-LD Schemas for AEO & GEO
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Axom AI PDF to Word Converter',
    alternateName: [
      'PDF to Word Converter Online',
      'Free PDF to DOCX Converter',
      'Axom AI Document Converter',
      'Online PDF Document to Word Converter',
      'PDF to Editable Word Converter',
    ],
    url: cms?.canonical_url || 'https://chat.aiaxom.co.in/tools/pdf-to-word',
    description:
      cms?.meta_description ||
      'Free online utility by Axom AI to convert PDF documents into fully editable Microsoft Word (.docx) files while accurately reconstructing typography, tables, and layouts with zero watermarks.',
    applicationCategory: 'BusinessApplication, UtilitiesApplication',
    operatingSystem: 'All (Web Browser, Windows 11/10, macOS, Linux, Android, iOS, ChromeOS)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      '100% Free PDF to Word conversion online',
      'Convert PDF to DOCX in under 3 seconds',
      'Accurate text, table, and font layout preservation',
      'No watermark added to output Word files, 100% clean',
      'Zero software installation or Microsoft Word required',
      '256-bit SSL encrypted transfer with automatic file purging',
      'Cross-platform compatibility on Mobile (Android/iOS), Windows, and Mac',
      'Pro Batch Mode converting up to 20 files simultaneously',
      `Supports PDF 1.0 - 2.0 documents up to ${cms?.max_file_size_mb || 25} MB`,
    ],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: '2.5',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '3850',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert PDF to Word Online for Free',
    description:
      'Step-by-step guide to convert PDF documents into fully editable, watermark-free Microsoft Word (.docx) files online in seconds without installing software.',
    totalTime: 'PT10S',
    tool: {
      '@type': 'HowToTool',
      name: 'Axom AI PDF to Word Converter Online',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your PDF File',
        text: 'Drag and drop your PDF file into the converter box above or click to select files from your computer or mobile device.',
        url: 'https://chat.aiaxom.co.in/tools/pdf-to-word#converter',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Instant Document Extraction & Layout Reconstruction',
        text: 'Click Convert to Word Now. Our intelligent extraction engine detects paragraphs, complex tables, images, and fonts, reconstructing them into native Word format in 2–3 seconds.',
        url: 'https://chat.aiaxom.co.in/tools/pdf-to-word#converter',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download Editable Word Document (.docx)',
        text: 'Click Download Word to save your fully editable, watermark-free .docx document directly to your device.',
        url: 'https://chat.aiaxom.co.in/tools/pdf-to-word#converter',
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
        item: 'https://chat.aiaxom.co.in/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'PDF to Word Converter',
        item: cms?.canonical_url || 'https://chat.aiaxom.co.in/tools/pdf-to-word',
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
            other: 'Added to output Word file',
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
            feature: 'Table & Layout Reconstruction',
            axom: 'High-fidelity native Word tables',
            other: 'Broken text boxes & scattered tables',
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
              <span>{cms?.hero_badge_text || '⚡ Free: 20 Files / Day • 🛡️ Zero Watermarks • 👑 Pro Batch Mode'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {cms?.hero_heading_prefix || 'Free'}{' '}
              <span className="gradient-text">{cms?.hero_heading_highlight || 'PDF to Word Converter'}</span>{' '}
              {cms?.hero_heading_suffix || 'Online'}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {cms?.hero_description ||
                'Convert your PDF documents into fully editable Microsoft Word (.DOCX) files in seconds. Accurate formatting, font and table preservation, zero watermarks, and no software installation. 100% free daily quota.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Convert PDF to Editable DOCX
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Accurate Formatting & Tables
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> 100% Free Daily Quota
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Zero Watermarks
              </span>
            </div>
          </section>

          {/* CONVERTER WIDGET (IN-PAGE, NO POPUPS!) */}
          <section id="converter" className="mb-14">
            <PdfToWordConverter
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
                    What is Axom AI PDF to Word Converter?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI PDF to Word Converter</strong> is a high-precision online document processing utility designed to convert PDF files into fully editable Microsoft Word (<strong>.docx</strong>) documents in under 3 seconds. Operating directly in your web browser, it requires <strong>no software installation</strong>, <strong>no account registration</strong>, and produces <strong>zero watermarks</strong>. It reconstructs original document geometry, preserving complex tables, multi-column text, fonts, and graphics with pristine accuracy.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> 100% Free Daily Conversions
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Lossless Table & Layout Retention
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Bank-Grade 256-Bit SSL Privacy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: HOW IT WORKS */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.how_it_works_title || 'How to Convert PDF to Word in 3 Easy Steps'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.how_it_works_subheading ||
                  'No software installation or account creation required. Fast, secure, and frictionless.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_1_title || 'Upload PDF File'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_1_desc ||
                    'Drag and drop your PDF document into the converter box above or choose it from your local storage.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_2_title || 'Instant Layout Reconstruction'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_2_desc ||
                    'Click Convert to Word Now. Our deep extraction engine reconstructs text, tables, images, and styles in 2–3 seconds.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_3_title || 'Download Editable DOCX'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_3_desc ||
                    'Download your clean, watermark-free Microsoft Word document ready to edit in Word, Google Docs, or Pages.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHY AXOM AI */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.why_title || 'Why Axom AI is the Best Free PDF to Word Converter Online'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.why_subheading ||
                  'Engineered for students, legal professionals, accountants, and businesses who need exact formatting and privacy.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_1_title || 'Lossless Table & Font Preservation'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_1_desc ||
                    'Complex financial spreadsheets, multi-column tables, custom typography, headers, and footers are converted into native editable Word tables.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_2_title || 'Zero Watermarks, 100% Clean'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_2_desc ||
                    'No promotional stamps, logo overlays, or page limits hidden behind paywalls. Converted files are clean and professional.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_3_title || 'Bank-Grade SSL Privacy'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_3_desc ||
                    'Files are protected with 256-bit encryption during transfer and processed in isolated RAM. Uploaded files are automatically deleted immediately after conversion.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_4_title || 'Universal Mobile & Desktop Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_4_desc ||
                    'Works seamlessly on iOS, Android, Windows, macOS, and Linux web browsers. Convert documents anywhere without installing Adobe Acrobat or MS Office.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_5_title || 'Sub-3-Second Conversion Engine'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_5_desc ||
                    'Powered by optimized cloud workers that convert standard PDF files in 2 to 3 seconds with minimal bandwidth usage and zero lag.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_6_title || 'Pro Batch Conversion Mode'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_6_desc ||
                    'Convert up to 20 PDF documents at once in 1 click with Axom AI Pro. All converted Word documents are packaged into a high-speed ZIP archive.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: GEO USE CASES & PERSONAS */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
                <span>Tailored Solutions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Tailored for Every Document Need
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Discover how students, businesses, and mobile users rely on Axom AI for seamless PDF to Word conversion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">PDF to Word for Students & Academics</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Convert academic journal papers, lecture slides, syllabus PDFs, and research notes into editable Microsoft Word documents. Easily copy citations, modify sections, insert comments, and complete thesis assignments without re-typing text manually.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-purple-300">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">Research Papers</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">Thesis & Dissertations</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">Lecture Notes</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">PDF to Word for Business & Legal Documents</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Convert vendor contracts, invoices, balance sheets, and non-disclosure agreements into editable DOCX format. Exact table cell structure, numbering, and currency figures remain intact, enabling fast legal review and redlining.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-300">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Contracts & NDAs</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Spreadsheets & Invoices</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Corporate Reports</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">PDF to Word for Mobile Devices (Android & iPhone)</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Need to make quick edits to a PDF while on the go? Open Axom AI in your phone browser, select a PDF from WhatsApp, Google Drive, or iCloud, and convert it instantly into DOCX. Open and edit directly in Word for mobile or Google Docs.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-cyan-300">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">iOS Safari</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Android Chrome</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Zero App Installation</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-5">
                  <Monitor size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Convert Without Microsoft Word or Adobe Acrobat</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Avoid paying $15-$25/month for Adobe Acrobat Pro or Microsoft Office 365. Axom AI handles complete file parsing and layout reconstruction in the cloud, outputting universally compatible DOCX files ready for Google Docs, Apple Pages, and LibreOffice.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-fuchsia-300">
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">No License Needed</span>
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">Google Docs Compatible</span>
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">LibreOffice & Pages</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: COMPARISON MATRIX */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
                <span>{cms?.comparison_badge || 'Direct Feature Comparison'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {cms?.comparison_title || 'Axom AI vs. Traditional PDF to Word Converters'}
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

          {/* SECTION 5: TECHNICAL SPECIFICATIONS */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={22} className="text-purple-400" />
              <span>{cms?.tech_spec_title || 'Technical Specifications & Standards'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs sm:text-sm">
              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Supported Input
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_inputs || '.pdf (PDF 1.0 – 2.0)'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Output Format
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_output || '.docx (Office Open XML)'}
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

          {/* SECTION 6: ASSAM & INDIA REGIONAL AUTHORITY */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <Globe2 size={28} />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <span>Built in Assam, for the World</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Fast, Domestic Infrastructure for India & Global Users
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Axom AI routes requests through low-latency Indian edge points of presence, delivering conversion speeds up to 3x faster than overseas services. Designed with special font glyph mappings to ensure accurate rendering of Indian regional languages including Assamese, Hindi, and Bengali alongside English.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 7: FAQS */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.faq_section_title || 'Frequently Asked Questions'}
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                {cms?.faq_section_subheading || 'Got questions about PDF to Word conversion? Find answers to all popular queries below.'}
              </p>
            </div>

            <PdfToWordFaq faqs={activeFaqs} />
          </section>

          {/* SECTION 8: BOTTOM CTA */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {cms?.cta_title || 'Convert Your PDF to Editable Word Now'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
              {cms?.cta_desc ||
                'Experience fast, private, and watermark-free conversions trusted by students and professionals across Assam, India, and worldwide.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={cms?.cta_btn_primary_url || '#converter'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition"
              >
                {cms?.cta_btn_primary_text || 'Upload PDF File Now'}
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

      <Footer />
    </>
  );
}
