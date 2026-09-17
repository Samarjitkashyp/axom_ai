import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ImageToPdfConverter from '../../../components/tools/ImageToPdfConverter';
import ImageToPdfFaq from '../../../components/tools/ImageToPdfFaq';
import { IMAGE_TO_PDF_FAQS } from '../../../components/tools/imageToPdfData';
import { getImageToPdfCMS } from '../../../lib/api';
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
  Images,
  Globe2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'image to pdf converter',
  // Secondary SEO Keywords
  'image to pdf',
  'convert image to pdf',
  'image to pdf converter online',
  'free image to pdf converter',
  'online image to pdf converter',
  'jpg to pdf converter',
  'png to pdf converter',
  'jpeg to pdf converter',
  'webp to pdf converter',
  'photo to pdf converter',
  'picture to pdf converter',
  'images to pdf converter',
  'convert jpg to pdf',
  'convert png to pdf',
  'image to pdf online free',
  'photo to pdf online',
  'multiple images to pdf',
  'merge images into pdf',
  // AEO Keywords (Question-Based)
  'how to convert image to PDF',
  'how to convert images to PDF online',
  'how to convert JPG to PDF',
  'how to convert PNG to PDF',
  'how to convert images to PDF for free',
  'how do I convert a photo to PDF',
  'how to convert multiple images into one PDF',
  'how to merge images into one PDF',
  'can I convert images to PDF online',
  'can I convert JPG images to PDF on mobile',
  'how to convert images to PDF without software',
  'how to convert photos to PDF on iPhone',
  'how to convert photos to PDF on Android',
  'does converting images to PDF reduce quality',
  'how to convert WebP to PDF',
  'is an online image to PDF converter safe',
  // GEO Keywords (AI Search / Generative Engine Optimization)
  'best free image to PDF converter online',
  'best JPG to PDF converter online',
  'free image to PDF converter without watermark',
  'secure image to PDF converter online',
  'image to PDF converter with no signup',
  'image to PDF converter without software',
  'fast image to PDF converter',
  'high quality image to PDF converter',
  'image to PDF converter that preserves quality',
  'online photo to PDF converter',
  'image to PDF converter for mobile',
  'image to PDF converter for students',
  'image to PDF converter for business',
  'multiple images to PDF converter online',
  'merge JPG images into one PDF',
  'merge PNG images into one PDF',
  'private image to PDF converter',
  // Long-Tail Keywords
  'free image to PDF converter online without watermark',
  'convert multiple images to one PDF online',
  'convert JPG to PDF online for free',
  'convert PNG to PDF online for free',
  'convert photos to PDF without installing software',
  'convert images to PDF without losing quality',
  'merge multiple JPG images into one PDF',
  'merge multiple PNG images into one PDF',
  'convert WebP images to PDF online',
  'convert images to PDF on Android',
  'convert images to PDF on iPhone',
  'create PDF from multiple images online',
  'make a PDF from photos online',
  'convert pictures to PDF for free',
  'image to PDF converter with original image quality',
  // Mobile-focused Keywords
  'image to pdf converter on mobile',
  'jpg to pdf converter Android',
  'jpg to pdf converter iPhone',
  'photo to pdf converter Android',
  'photo to pdf converter iPhone',
  'convert images to pdf on phone',
  'convert photos to pdf online mobile',
  'image to pdf online mobile',
  // India / Assam GEO
  'image to pdf converter online India',
  'free image to pdf converter India',
  'jpg to pdf converter India',
  'pdf tools India',
  'online PDF converter India',
  'image to pdf converter Assam',
  'online PDF tools Assam',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getImageToPdfCMS();

  const title = cms?.meta_title || 'Image to PDF Converter Online Free — Convert JPG, PNG to PDF | Axom AI';
  const description =
    cms?.meta_description ||
    'Free online image to PDF converter. Convert and merge JPG, PNG, and WebP photos into high-quality PDF in seconds with original resolution, no watermark, and zero signup.';
  const canonicalUrl = cms?.canonical_url || 'https://chat.aiaxom.co.in/tools/image-to-pdf';
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

export default async function ImageToPdfPage() {
  const cms = await getImageToPdfCMS();

  const activeFaqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : IMAGE_TO_PDF_FAQS;

  // Structured JSON-LD Schemas for AEO & GEO
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Axom AI Image to PDF Converter',
    alternateName: [
      'Image to PDF Converter Online',
      'Free JPG to PDF Converter',
      'PNG to PDF Converter',
      'Axom AI Document Converter',
      'Merge Images to PDF Online',
      'Photo to PDF Converter',
    ],
    url: cms?.canonical_url || 'https://chat.aiaxom.co.in/tools/image-to-pdf',
    description:
      cms?.meta_description ||
      'Free online image to PDF converter utility by Axom AI to convert and merge JPG, PNG, JPEG, and WebP pictures into publication-quality PDF documents with original resolution and zero watermarks.',
    applicationCategory: 'BusinessApplication, UtilitiesApplication',
    operatingSystem: 'All (Web Browser, Windows 11/10, macOS, Linux, Android, iOS, ChromeOS)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      '100% Free Image to PDF conversion online',
      'Convert JPG to PDF, PNG to PDF, and WebP to PDF in under 3 seconds',
      'Merge multiple images into a single clean PDF document',
      'Full image resolution and aspect ratio preservation',
      'No watermark added to output files, 100% clean',
      'Zero software installation or app required',
      '256-bit SSL encrypted transfer with automatic file purging',
      'Mobile-optimized for iOS Safari and Android Chrome',
      'Pro Batch Mode converting up to 20 files simultaneously',
      `Supports JPG, PNG, JPEG, and WebP images up to ${cms?.max_file_size_mb || 25} MB`,
    ],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: '2.5',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '4120',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Images to PDF Online for Free',
    description:
      'Step-by-step guide to convert single or multiple images (JPG, PNG, WebP) into a high-quality, watermark-free PDF online in seconds without installing software.',
    totalTime: 'PT10S',
    tool: {
      '@type': 'HowToTool',
      name: 'Axom AI Image to PDF Converter Online',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your Images (JPG, PNG, WebP)',
        text: 'Drag and drop your images into the converter box above or click to browse files from your computer, phone gallery, or camera roll.',
        url: 'https://chat.aiaxom.co.in/tools/image-to-pdf#converter',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Arrange & Convert to PDF',
        text: 'Reorder images if creating a multi-page PDF, then click Convert to PDF Now. Our high-resolution engine embeds images into vector PDF pages in 2–3 seconds without downscaling.',
        url: 'https://chat.aiaxom.co.in/tools/image-to-pdf#converter',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download High-Quality PDF',
        text: 'Click Download PDF to save your clean, watermark-free PDF document directly to your device storage.',
        url: 'https://chat.aiaxom.co.in/tools/image-to-pdf#converter',
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
        name: 'Image to PDF Converter',
        item: cms?.canonical_url || 'https://chat.aiaxom.co.in/tools/image-to-pdf',
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
            axom: 'Free 20 images/day (Unlimited on Pro)',
            other: '1-2 files per day limit',
            paid: '$10 - $20 / month',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Multi-Image Merge',
            axom: 'Merge multiple images into 1 PDF',
            other: 'Single image only',
            paid: 'Supported (Paid only)',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Watermarks',
            axom: 'Never (100% Clean)',
            other: 'Stamps logo on PDF',
            paid: 'Clean (Paid only)',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Image Resolution & DPI',
            axom: '100% native resolution preserved',
            other: 'Compressed & downscaled',
            paid: 'High quality',
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
              <span>{cms?.hero_badge_text || '⚡ Free: 20 Images / Day • 🛡️ Zero Watermarks • 👑 Multi-Image Merge'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {cms?.hero_heading_prefix || 'Free'}{' '}
              <span className="gradient-text">{cms?.hero_heading_highlight || 'Image to PDF Converter'}</span>{' '}
              {cms?.hero_heading_suffix || 'Online'}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {cms?.hero_description ||
                'Convert your JPG, PNG, JPEG, and WebP images into high-quality PDF documents in seconds. Merge multiple photos into one single PDF file with original resolution preserved. Zero watermarks, no registration, and 100% free daily quota.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Convert JPG, PNG, & WebP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Merge Multiple Photos into 1 PDF
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> 100% Free Daily Quota
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Original Resolution Preserved
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Zero Watermarks
              </span>
            </div>
          </section>

          {/* CONVERTER WIDGET (IN-PAGE, NO POPUPS!) */}
          <section id="converter" className="mb-14">
            <ImageToPdfConverter
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
                    What is Axom AI Image to PDF Converter?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI Image to PDF Converter</strong> is an online utility engineered to convert and merge pictures (<strong>JPG, PNG, JPEG, and WebP</strong>) into professional, print-ready PDF files in under 3 seconds. Operating entirely inside modern web browsers, it requires <strong>no software installation</strong>, <strong>no account signup</strong>, and adds <strong>zero watermarks</strong>. It embeds images at full source DPI without downscaling or compression loss, and allows merging multiple photos into a single organized multi-page PDF.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> 100% Free Daily Conversions
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Merge Multiple Images to 1 PDF
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Zero Watermarks & 256-Bit SSL
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
                {cms?.how_it_works_title || 'How to Convert Images to PDF in 3 Easy Steps'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.how_it_works_subheading ||
                  'No complex software installation or account creation required. Fast and frictionless.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_1_title || 'Upload Images (JPG, PNG, WebP)'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_1_desc ||
                    'Drag and drop your JPG, PNG, or WebP images into the converter box above or choose them from your phone or PC.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_2_title || 'Instant Lossless Processing'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_2_desc ||
                    'Click Convert. Our engine embeds your images at full resolution and generates a clean, multi-page PDF in 2–3 seconds.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_3_title || 'Download Merged PDF'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_3_desc ||
                    'Download your crisp, watermark-free PDF document directly to your device storage ready to print or share.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHY AXOM AI */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.why_title || 'Why Axom AI is the Best Free Image to PDF Converter Online'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.why_subheading ||
                  'Engineered for students, photographers, businesses, and mobile users who need maximum quality and privacy.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_1_title || 'Original Resolution Preserved'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_1_desc ||
                    'Your photos and scans are embedded at full resolution without downscaling, compression artifacts, or loss of clarity.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_2_title || 'Zero Watermarks, 100% Clean'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_2_desc ||
                    'No promotional watermarks, stamps, or logos. Output PDF files are 100% clean and ready for official submissions.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_3_title || 'Automatic File Purging'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_3_desc ||
                    'Files are protected with 256-bit TLS encryption in transit and purged automatically from server memory right after conversion.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_4_title || 'Mobile-Optimized Experience'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_4_desc ||
                    'Convert pictures directly from your iPhone Camera Roll or Android Gallery without installing heavy scanner applications.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_5_title || 'Sub-3-Second Conversion Engine'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_5_desc ||
                    'High-speed optimized processing converts standard images in 2 to 3 seconds with minimal bandwidth usage and zero lag.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_6_title || 'Multi-Image Merge into 1 PDF'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_6_desc ||
                    'Upload multiple JPG, PNG, and WebP pictures at once and merge them into a single, organized multi-page PDF in 1 click.'}
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
                Tailored for Every Photo to PDF Workflow
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Discover how students, businesses, photographers, and mobile users rely on Axom AI for seamless image conversion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                  <GraduationCap size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Image to PDF for Students & Academics</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Snap photos of whiteboard lectures, handwritten classroom notes, textbook diagrams, and paper assignments, and merge them into a single organized PDF document for homework submission and revision.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-purple-300">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">Handwritten Notes</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">Whiteboard Photos</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">Assignment Submissions</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Image to PDF for Business & Expense Invoices</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Digitize paper receipts, travel bills, delivery slips, tax forms, and signed paper contracts into a single compliant PDF file ready for corporate accounting audits and tax filings.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-300">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Expense Receipts</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Signed Invoices</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">KYC & Identity Cards</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Photo to PDF on Mobile (iPhone & Android)</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Convert pictures directly from your mobile browser. Choose photos from Apple Photos, Android Gallery, or WhatsApp images without installing untrusted third-party scanner apps that drain your battery.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-cyan-300">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">iOS Camera Roll</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Android Gallery</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Zero App Download</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-5">
                  <Images size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Merge JPG, PNG, & WebP Images into 1 PDF</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Have multiple images that belong to one portfolio or report? Upload them simultaneously and merge them into a unified PDF document. Reorder pages intuitively before generating your final document.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-fuchsia-300">
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">Multi-Page Merging</span>
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">Visual Page Order</span>
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">Lossless Quality</span>
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
                {cms?.comparison_title || 'Axom AI vs. Traditional Image to PDF Converters'}
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
                  Supported Inputs
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_inputs || '.png, .jpg, .jpeg, .webp'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Output Format
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_output || 'PDF 1.7 (ISO 32000-1)'}
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
                  Axom AI routes requests through low-latency Indian edge points of presence, delivering conversion speeds up to 3x faster than overseas services. Designed for seamless digitizing of Indian paperwork, Aadhaar/PAN cards, electricity bills, and regional documents.
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
                {cms?.faq_section_subheading || 'Got questions about image to PDF conversion? Find answers to all popular queries below.'}
              </p>
            </div>

            <ImageToPdfFaq faqs={activeFaqs} />
          </section>

          {/* SECTION 8: BOTTOM CTA */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {cms?.cta_title || 'Convert Your Images to PDF in Seconds'}
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
                {cms?.cta_btn_primary_text || 'Upload Images Now'}
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
