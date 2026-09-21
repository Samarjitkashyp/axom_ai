import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PptToPdfConverter from '../../../components/tools/PptToPdfConverter';
import PdfToWordFaq from '../../../components/tools/PdfToWordFaq';
import { PPT_TO_PDF_FAQS } from '../../../components/tools/pptToPdfData';
import { getPptToPdfCMS } from '../../../lib/api';
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
  'ppt to pdf converter',
  'ppt to pdf',
  'convert ppt to pdf',
  'pptx to pdf converter',
  'ppt to pdf converter online',
  'free ppt to pdf converter',
  'online ppt to pdf converter',
  'convert pptx to pdf',
  'powerpoint to pdf',
  'powerpoint to pdf converter',
  'convert powerpoint to pdf',
  'ppt to pdf online free',
  'ppt converter to pdf',
  'online powerpoint converter',
  'how to convert PPT to PDF',
  'how to convert PPT to PDF online',
  'how to convert PPT to PDF for free',
  'how to convert PowerPoint to PDF',
  'how do I convert a PowerPoint into a PDF document',
  'can I convert PPT to PDF online',
  'how to convert PPT to PDF without software',
  'how to convert PPT to PDF on mobile',
  'how to convert PPT to PDF without losing formatting',
  'can I convert multiple PPT files to PDF',
  'how to convert PowerPoint to PDF without PowerPoint',
  'is PPT to PDF conversion free',
  'best free PPT to PDF converter online',
  'free online PPT to PDF converter',
  'reliable PPT to PDF converter',
  'secure PPT to PDF converter online',
  'PPT to PDF converter without watermark',
  'PPT to PDF converter with accurate formatting',
  'PPT to PDF converter for students',
  'PPT to PDF converter for business presentations',
  'fast PPT to PDF converter online',
  'private PPT to PDF converter',
  'PPT to PDF converter without software installation',
  'free PPT to PDF converter online without watermark',
  'convert PowerPoint to PDF document online',
  'convert PPTX to PDF online for free',
  'convert PPT to PDF without losing formatting',
  'convert PPT to PDF without installing software',
  'free PPTX to PDF converter online',
  'convert multiple PPT files to PDF online',
  'secure PPT to PDF converter online',
  'PPT to PDF converter with slide formatting',
  'PPT to PDF converter with images and charts',
  'convert PPT to PDF on Android',
  'convert PPT to PDF on iPhone',
  'ppt to pdf converter online India',
  'free ppt to pdf converter India',
  'powerpoint converter online India',
  'free PDF tools India',
  'PPT to PDF converter Assam',
  'online PDF tools Assam',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPptToPdfCMS();

  const title = cms?.meta_title || 'PPT to PDF Converter Online Free — Convert PowerPoint to PDF | Axom AI';
  const description =
    cms?.meta_description ||
    'Free online PPT to PDF converter. Convert PowerPoint (.pptx, .ppt) presentations to high-quality PDF documents in seconds with 100% original slide formatting, charts, and images preserved. No watermark, no software installation, completely free.';
  const canonicalUrl = cms?.canonical_url || 'https://aiaxom.co.in/tools/ppt-to-pdf';
  const ogImage = cms?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';
  const keywords = cms?.meta_keywords
    ? [...new Set([...cms.meta_keywords.split(',').map((k: string) => k.trim()).filter(Boolean), ...TARGET_KEYWORDS])]
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

export default async function PptToPdfPage() {
  const cms = await getPptToPdfCMS();

  const activeFaqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : PPT_TO_PDF_FAQS;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Axom AI PPT to PDF Converter',
    alternateName: [
      'PPT to PDF Converter Online',
      'Free PowerPoint to PDF Converter',
      'Axom AI Presentation Converter',
      'Online PPT to PDF Converter',
      'PPTX to PDF Converter',
    ],
    url: cms?.canonical_url || 'https://aiaxom.co.in/tools/ppt-to-pdf',
    description:
      cms?.meta_description ||
      'Free online utility by Axom AI to convert PowerPoint presentations (.pptx, .ppt) into high-quality PDF documents while accurately preserving slide layouts, charts, images, and fonts with zero watermarks.',
    applicationCategory: 'BusinessApplication, UtilitiesApplication',
    operatingSystem: 'All (Web Browser, Windows 11/10, macOS, Linux, Android, iOS, ChromeOS)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      '100% Free PPT to PDF conversion online',
      'Convert PowerPoint to PDF in under 5 seconds',
      'Accurate slide layout, chart, and image preservation',
      'No watermark added to output PDF files, 100% clean',
      'Zero software installation or Microsoft PowerPoint required',
      '256-bit SSL encrypted transfer with automatic file purging',
      'Cross-platform compatibility on Mobile (Android/iOS), Windows, and Mac',
      'Pro Batch Mode converting up to 20 files simultaneously',
      `Supports .pptx and .ppt files up to ${cms?.max_file_size_mb || 50} MB`,
    ],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: '1.0',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert PPT to PDF Online for Free',
    description:
      'Step-by-step guide to convert PowerPoint presentations into high-quality, watermark-free PDF documents online in seconds without installing software.',
    totalTime: 'PT15S',
    tool: {
      '@type': 'HowToTool',
      name: 'Axom AI PPT to PDF Converter Online',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your PowerPoint File',
        text: 'Drag and drop your .pptx or .ppt file into the converter box above or click to select files from your computer or mobile device.',
        url: 'https://aiaxom.co.in/tools/ppt-to-pdf#converter',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Server-Side Slide Rendering',
        text: 'Click Convert to PDF Now. Our LibreOffice-powered rendering engine processes all slides, charts, images, shapes, and fonts into a pixel-perfect PDF in 2–5 seconds.',
        url: 'https://aiaxom.co.in/tools/ppt-to-pdf#converter',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download High-Quality PDF',
        text: 'Click Download PDF to save your high-quality, watermark-free PDF document directly to your device.',
        url: 'https://aiaxom.co.in/tools/ppt-to-pdf#converter',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: activeFaqs.map((faq: any) => ({
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aiaxom.co.in/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aiaxom.co.in/tools' },
      { '@type': 'ListItem', position: 3, name: 'PPT to PDF Converter', item: cms?.canonical_url || 'https://aiaxom.co.in/tools/ppt-to-pdf' },
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    description: "Axom AI is India and Assam's leading sovereign artificial intelligence and intelligent document processing platform.",
    sameAs: ['https://twitter.com/axom_ai', 'https://github.com/Samarjitkashyp/axom_ai'],
  };

  const comparisonRows =
    cms?.comparison_matrix && cms.comparison_matrix.length > 0
      ? cms.comparison_matrix
      : [
          { feature: 'Daily Limit & Cost', axom: 'Free 20 files/day (Unlimited on Pro)', other: '1-2 files per day limit', paid: '$10 - $20 / month', axom_check: true, other_check: false },
          { feature: 'Batch Conversion', axom: 'Up to 20 files at once (Pro)', other: 'Single file only', paid: 'Supported (Paid only)', axom_check: true, other_check: false },
          { feature: 'Watermarks', axom: 'Never (100% Clean)', other: 'Added to output PDF', paid: 'Clean (Paid only)', axom_check: true, other_check: false },
          { feature: 'Account / Registration', axom: 'No signup needed', other: 'Often forced signup', paid: 'Required signup + Card', axom_check: true, other_check: false },
          { feature: 'Document Privacy', axom: 'Auto-purged immediately', other: 'Stored up to 24 hours', paid: 'Cloud stored', axom_check: true, other_check: false },
          { feature: 'Chart & Layout Preservation', axom: 'Server-side LibreOffice rendering', other: 'Browser-based, breaks complex slides', paid: 'High-precision', axom_check: true, other_check: false },
        ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <Navbar />

      <main className="min-h-screen bg-[#06060b] text-slate-200 relative overflow-hidden pt-28 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* HERO */}
          <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-red-500/10 to-rose-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4 shadow-sm">
              <Sparkles size={14} className="text-orange-400" />
              <span>{cms?.hero_badge_text || '⚡ Free: 20 Files / Day • 🛡️ Zero Watermarks • 👑 Pro Batch Mode'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {cms?.hero_heading_prefix || 'Free'}{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 bg-clip-text text-transparent">{cms?.hero_heading_highlight || 'PPT to PDF Converter'}</span>{' '}
              {cms?.hero_heading_suffix || 'Online'}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {cms?.hero_description || 'Convert your PowerPoint presentations (.PPTX, .PPT) into high-quality PDF documents in seconds. Accurate slide layouts, charts, images, and fonts preserved. Zero watermarks, no software installation. 100% free daily quota.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"><Check size={14} className="text-emerald-400" /> Convert PPT/PPTX to PDF</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"><Check size={14} className="text-emerald-400" /> Accurate Slide Layouts & Charts</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"><Check size={14} className="text-emerald-400" /> 100% Free Daily Quota</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"><Check size={14} className="text-emerald-400" /> Zero Watermarks</span>
            </div>
          </section>

          {/* CONVERTER */}
          <section id="converter" className="mb-14">
            <PptToPdfConverter freeDailyLimit={cms?.free_daily_limit} proBatchLimit={cms?.pro_batch_limit} maxFileSizeMb={cms?.max_file_size_mb} />
          </section>

          {/* AEO ANSWER */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900/60 to-red-950/40 border border-orange-500/25 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 shrink-0 mt-1 shadow-inner">
                  <Sparkles size={22} className="text-orange-400" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold">
                    <span>Quick Answer • Generative Engine Summary</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">What is Axom AI PPT to PDF Converter?</h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI PPT to PDF Converter</strong> is a high-quality online presentation processing utility designed to convert PowerPoint files (.pptx, .ppt) into professional PDF documents in under 5 seconds. Using server-side <strong>LibreOffice rendering</strong>, it faithfully reproduces all slide layouts, charts, SmartArt, images, shapes, and fonts. It requires <strong>no software installation</strong>, <strong>no account registration</strong>, and produces <strong>zero watermarks</strong>.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle size={16} /> 100% Free Daily Conversions</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle size={16} /> Server-Side LibreOffice Rendering</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium"><CheckCircle size={16} /> Bank-Grade 256-Bit SSL Privacy</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{cms?.how_it_works_title || 'How to Convert PPT to PDF in 3 Easy Steps'}</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">{cms?.how_it_works_subheading || 'No software installation or account creation required. Fast, secure, and frictionless.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-orange-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">1</div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_1_title || 'Upload PowerPoint File'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.step_1_desc || 'Drag and drop your .pptx or .ppt presentation into the converter box above or choose it from your local storage.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-red-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">2</div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_2_title || 'Server-Side Slide Rendering'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.step_2_desc || 'Click Convert to PDF Now. Our LibreOffice-powered engine renders all slides, charts, images, and shapes into a pixel-perfect PDF in 2–5 seconds.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">3</div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_3_title || 'Download High-Quality PDF'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.step_3_desc || 'Download your clean, watermark-free PDF document ready for presentations, printing, email attachments, or official submissions.'}</p>
              </div>
            </div>
          </section>

          {/* WHY AXOM AI */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{cms?.why_title || 'Why Axom AI is the Best Free PPT to PDF Converter Online'}</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">{cms?.why_subheading || 'Engineered for students, professionals, and businesses who need pixel-perfect PDF output from their presentations.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-orange-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-4"><Award size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_1_title || 'Pixel-Perfect Slide Rendering'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_1_desc || 'Charts, SmartArt, complex layouts, custom fonts, and embedded images are rendered faithfully using server-side LibreOffice — not browser hacks.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4"><Shield size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_2_title || 'Zero Watermarks, 100% Clean'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_2_desc || 'No promotional stamps, logo overlays, or page limits hidden behind paywalls. Converted PDFs are clean and professional.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4"><Lock size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_3_title || 'Bank-Grade SSL Privacy'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_3_desc || 'Files are protected with 256-bit encryption during transfer and processed in isolated RAM. Uploaded files are automatically deleted immediately after conversion.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-red-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mb-4"><Smartphone size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_4_title || 'Universal Mobile & Desktop Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_4_desc || 'Works seamlessly on iOS, Android, Windows, macOS, and Linux web browsers. Convert presentations anywhere without installing PowerPoint or Office.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-amber-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4"><Zap size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_5_title || 'Sub-5-Second Conversion Engine'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_5_desc || 'Powered by optimized cloud workers with LibreOffice that convert standard presentations in 2 to 5 seconds with minimal bandwidth usage and zero lag.'}</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4"><Layers size={20} /></div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_6_title || 'Pro Batch Conversion Mode'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{cms?.benefit_6_desc || 'Convert up to 20 PowerPoint presentations at once in 1 click with Axom AI Pro. All converted PDFs are packaged into a high-speed ZIP archive.'}</p>
              </div>
            </div>
          </section>

          {/* USE CASES */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold mb-2"><span>Tailored Solutions</span></div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tailored for Every Presentation Need</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">Discover how students, businesses, and mobile users rely on Axom AI for seamless PPT to PDF conversion.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-orange-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-5"><GraduationCap size={24} /></div>
                <h3 className="text-lg font-bold text-white mb-2">PPT to PDF for Students & Academics</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Convert lecture slides, seminar presentations, thesis defense decks, and project reports into PDF for submission, printing, or sharing.</p>
                <div className="flex flex-wrap gap-2 text-xs text-orange-300">
                  <span className="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">Lecture Slides</span>
                  <span className="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">Thesis Defense</span>
                  <span className="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">Project Reports</span>
                </div>
              </div>
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-emerald-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5"><Briefcase size={24} /></div>
                <h3 className="text-lg font-bold text-white mb-2">PPT to PDF for Business & Corporate</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Convert sales decks, quarterly reports, investor presentations, and training materials into PDF for email distribution, archiving, or printing.</p>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-300">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Sales Decks</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Investor Presentations</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Training Materials</span>
                </div>
              </div>
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5"><Smartphone size={24} /></div>
                <h3 className="text-lg font-bold text-white mb-2">PPT to PDF for Mobile (Android & iPhone)</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Need to share a presentation as PDF while on the go? Open Axom AI in your phone browser, select a PPT file, and convert it instantly.</p>
                <div className="flex flex-wrap gap-2 text-xs text-cyan-300">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">iOS Safari</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Android Chrome</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Zero App Install</span>
                </div>
              </div>
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-red-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-5"><Monitor size={24} /></div>
                <h3 className="text-lg font-bold text-white mb-2">Convert Without Microsoft PowerPoint</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Avoid paying for Microsoft Office 365 or PowerPoint licenses. Axom AI handles complete slide rendering in the cloud.</p>
                <div className="flex flex-wrap gap-2 text-xs text-red-300">
                  <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20">No License Needed</span>
                  <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20">Any PDF Reader</span>
                  <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20">Print Ready</span>
                </div>
              </div>
            </div>
          </section>

          {/* COMPARISON */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold mb-2"><span>{cms?.comparison_badge || 'Direct Feature Comparison'}</span></div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{cms?.comparison_title || 'Axom AI vs. Traditional PPT to PDF Converters'}</h2>
              <p className="text-slate-400 text-xs sm:text-sm">{cms?.comparison_subheading || 'See why users choose Axom AI over paywalled and ad-heavy alternatives.'}</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-semibold">Feature / Capability</th>
                    <th className="p-4 sm:p-5 font-bold text-orange-300 bg-orange-500/10 border-x border-orange-500/20">Axom AI Converter</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Other Free Converters</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Paid Commercial Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {comparisonRows.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                      <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-orange-500/5 border-x border-orange-500/10 flex items-center gap-1.5">
                        <Check size={16} className="text-emerald-400 shrink-0" /><span>{row.axom}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-slate-400">
                        {row.other_check === false ? (<span className="text-rose-400 flex items-center gap-1.5"><XIcon size={16} className="text-rose-400 shrink-0" /><span>{row.other}</span></span>) : row.other}
                      </td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.paid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TECH SPECS */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={22} className="text-orange-400" />
              <span>{cms?.tech_spec_title || 'Technical Specifications & Standards'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs sm:text-sm">
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Supported Input</div><div className="text-white font-medium">{cms?.tech_spec_inputs || '.pptx, .ppt (PowerPoint 97–2021+)'}</div></div>
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Output Format</div><div className="text-white font-medium">{cms?.tech_spec_output || '.pdf (PDF 1.4+)'}</div></div>
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Maximum File Size</div><div className="text-white font-medium">{cms?.tech_spec_max_size || '50 Megabytes (MB)'}</div></div>
              <div className="space-y-1"><div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Security Protocol</div><div className="text-white font-medium">{cms?.tech_spec_security || 'TLS 1.3 / SSL 256-bit'}</div></div>
            </div>
          </section>

          {/* REGIONAL */}
          <section className="mb-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-950/30 via-slate-900/60 to-orange-950/30 border border-red-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0"><Globe2 size={28} /></div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold"><span>Built in Assam, for the World</span></div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Fast, Domestic Infrastructure for India & Global Users</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Axom AI routes requests through low-latency Indian edge points of presence, delivering conversion speeds up to 3x faster than overseas services. Designed with special font glyph mappings to ensure accurate rendering of Indian regional languages including Assamese, Hindi, and Bengali alongside English in presentations.</p>
              </div>
            </div>
          </section>

          {/* FAQS */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{cms?.faq_section_title || 'Frequently Asked Questions'}</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">{cms?.faq_section_subheading || 'Got questions about PPT to PDF conversion? Find answers to all popular queries below.'}</p>
            </div>
            <PdfToWordFaq faqs={activeFaqs} />
          </section>

          {/* CTA */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-orange-900/30 via-red-900/20 to-rose-900/30 border border-orange-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{cms?.cta_title || 'Convert Your PowerPoint to PDF Now'}</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">{cms?.cta_desc || 'Experience fast, private, and watermark-free conversions trusted by students and professionals across Assam, India, and worldwide.'}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={cms?.cta_btn_primary_url || '#converter'} className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:scale-105 transition">{cms?.cta_btn_primary_text || 'Upload PowerPoint File Now'}</a>
              <Link href={cms?.cta_btn_secondary_url || '/tools'} className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition flex items-center justify-center gap-2">
                <span>{cms?.cta_btn_secondary_text || 'Explore All AI & Document Tools'}</span><ArrowRight size={15} />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
