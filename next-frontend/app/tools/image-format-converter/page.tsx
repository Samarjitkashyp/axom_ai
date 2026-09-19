import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ImageFormatConverter from '../../../components/tools/ImageFormatConverter';
import ImageFormatFaq from '../../../components/tools/ImageFormatFaq';
import { IMAGE_FORMAT_FAQS } from '../../../components/tools/imageFormatData';
import { getImageFormatCMS } from '../../../lib/api';
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
  Image as ImageIcon,
  GraduationCap,
  Briefcase,
  Globe2,
  Download,
  Palette,
  Layers3,
  Code2,
  ShoppingBag,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'image format converter',
  // Secondary SEO Keywords
  'image converter',
  'image format converter online',
  'free image format converter',
  'online image converter',
  'convert image format',
  'image file converter',
  'photo format converter',
  'picture format converter',
  'convert images online',
  'image conversion tool',
  'free online image converter',
  'image file format converter',
  'convert image to different format',
  'image format conversion online',
  'batch image converter',
  'bulk image converter',
  // Format-Specific Keywords
  'JPG to PNG converter',
  'PNG to JPG converter',
  'JPG to WebP converter',
  'PNG to WebP converter',
  'WebP to JPG converter',
  'WebP to PNG converter',
  'JPEG to PNG converter',
  'JPEG to WebP converter',
  'GIF to JPG converter',
  'GIF to PNG converter',
  'BMP to JPG converter',
  'TIFF to JPG converter',
  'image to WebP converter',
  'convert JPG to WebP online',
  'convert PNG to WebP online',
  'HEIC to JPG converter',
  'HEIC to PNG converter',
  'SVG to PNG converter',
  'JFIF to PNG converter',
  'AVIF to WebP converter',
  // AEO Keywords (Question-Based)
  'how to convert image format',
  'how to convert an image to another format',
  'how to change image format online',
  'how to convert JPG to PNG',
  'how to convert PNG to JPG',
  'how to convert JPG to WebP',
  'how to convert PNG to WebP',
  'how can I convert images online',
  'can I convert image formats for free',
  'how to convert images without software',
  'how to convert images on mobile',
  'how to convert multiple images at once',
  'how to convert image format without losing quality',
  'what image format should I use for websites',
  'how to convert WebP to JPG',
  'how to convert WebP to PNG',
  'how to convert JPEG to PNG online',
  // GEO Keywords (AI Search / Generative Engine Optimization)
  'best free image format converter online',
  'free online image converter',
  'best image format conversion tool',
  'secure image format converter online',
  'image converter without watermark',
  'image converter without software',
  'fast image format converter',
  'image converter for multiple formats',
  'image converter for web images',
  'image converter for website optimization',
  'image converter for developers',
  'image converter for designers',
  'image converter for social media',
  'image format converter for mobile',
  'image converter with multiple format support',
  'free JPG PNG WebP converter online',
  // Long-Tail Keywords
  'free image format converter online',
  'convert image to any format online',
  'convert JPG to PNG online for free',
  'convert PNG to JPG online for free',
  'convert JPG to WebP online',
  'convert PNG to WebP online',
  'convert WebP to JPG online',
  'convert WebP to PNG online',
  'convert multiple images to another format',
  'bulk image format converter online',
  'image format converter without installing software',
  'image converter without losing quality',
  'free image converter for website',
  'online image converter for web optimization',
  'convert image formats on mobile',
  'image format converter with no watermark',
  // Web Optimization Keywords
  'image converter for web',
  'convert images to WebP',
  'WebP image converter',
  'optimize images for website',
  'convert JPG to WebP for website',
  'convert PNG to WebP for website',
  'image format conversion for SEO',
  'image converter for website performance',
  'convert images for faster websites',
  'web image format converter',
  'modern image format converter',
  // Mobile Keywords
  'image format converter mobile',
  'image converter for Android',
  'image converter for iPhone',
  'convert image format on phone',
  'JPG to PNG converter Android',
  'PNG to JPG converter Android',
  'JPG to WebP converter mobile',
  'online image converter mobile',
  // Privacy / Security Keywords
  'secure image converter online',
  'private image converter',
  'secure image format converter',
  'image converter for confidential files',
  'online image converter with file deletion',
  'private image conversion tool',
  'secure JPG PNG WebP converter',
  // India / Assam Supporting GEO
  'image converter online India',
  'free image converter India',
  'image format converter India',
  'online image tools India',
  'image converter Assam',
  'online image tools Assam',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getImageFormatCMS();

  const title =
    cms?.meta_title || 'Image Format Converter Online Free — Convert JPG, PNG, WebP | Axom AI';
  const description =
    cms?.meta_description ||
    'Free online image format converter. Convert JPG, PNG, WebP, HEIC, GIF, SVG, BMP & TIFF in seconds. Zero watermarks, batch conversion, lossless quality & 100% free.';
  const canonicalUrl = cms?.canonical_url || 'https://aiaxom.co.in/tools/image-format-converter';
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

export default async function ImageFormatConverterPage() {
  const cms = await getImageFormatCMS();

  const activeFaqs = cms?.faqs && cms.faqs.length > 0 ? cms.faqs : IMAGE_FORMAT_FAQS;

  // Structured JSON-LD Schemas for AEO & GEO
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Axom AI Image Format Converter',
    alternateName: [
      'Image Format Converter Online',
      'Free Image Format Converter',
      'JPG to PNG Converter',
      'PNG to WebP Converter',
      'Batch Image Converter Online',
      'Universal Image Converter',
    ],
    url: cms?.canonical_url || 'https://aiaxom.co.in/tools/image-format-converter',
    description:
      cms?.meta_description ||
      'Free online utility by Axom AI to convert between image formats — JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, AVIF. 100% clean, no watermarks, batch conversion support, and automatic file purging.',
    applicationCategory: 'BusinessApplication, UtilitiesApplication',
    operatingSystem: 'All (Web Browser, Windows 11/10, macOS, Linux, Android, iOS, ChromeOS)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      '100% Free image format conversion online',
      'Convert JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, AVIF',
      'Output to lossless transparent PNG, compressed JPG, or modern WebP',
      'Zero watermark added to output files',
      'Zero software installation or account registration required',
      '256-bit SSL encrypted transfer with automatic file purging',
      'Mobile-optimized for iOS Safari and Android Chrome',
      'Batch conversion up to 20 files simultaneously on Pro',
      `Supports image files up to ${cms?.max_file_size_mb || 25} MB`,
    ],
    browserRequirements: 'Requires modern web browser with HTML5 support',
    softwareVersion: '2.5',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '4680',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Image Formats Online for Free',
    description:
      'Step-by-step guide to convert between image formats online in seconds without installing software or registering an account.',
    totalTime: 'PT10S',
    tool: {
      '@type': 'HowToTool',
      name: 'Axom AI Image Format Converter Online',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Your Image',
        text: 'Drag and drop your image file (JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, AVIF) into the converter box or select it from your device.',
        url: 'https://aiaxom.co.in/tools/image-format-converter#converter',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Your Desired Target Format',
        text: 'Choose your preferred output format — PNG (lossless with alpha transparency), JPG (compact size for sharing), or WebP (modern web optimization for faster load speeds).',
        url: 'https://aiaxom.co.in/tools/image-format-converter#converter',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download Converted Image',
        text: 'Click Convert Now. Your converted image is generated in under 3 seconds with zero watermarks and is immediately ready for download.',
        url: 'https://aiaxom.co.in/tools/image-format-converter#converter',
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
        name: 'Image Format Converter',
        item: cms?.canonical_url || 'https://aiaxom.co.in/tools/image-format-converter',
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
            feature: 'Format Versatility',
            axom: 'JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, AVIF',
            other: 'JPG & PNG only',
            paid: 'Most formats',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Watermarks',
            axom: 'Never (100% Clean)',
            other: 'Added to output',
            paid: 'Clean (Paid only)',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'WebP Web Optimization',
            axom: 'Lossless & Lossy WebP with transparency',
            other: 'Limited or no WebP support',
            paid: 'Supported',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Account / Registration',
            axom: 'No signup or credit card required',
            other: 'Forced account creation',
            paid: 'Requires credit card',
            axom_check: true,
            other_check: false,
          },
          {
            feature: 'Document Privacy',
            axom: 'Auto-purged immediately from memory',
            other: 'Retained up to 24 hours',
            paid: 'Cloud storage retained',
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
              <span>{cms?.hero_badge_text || '⚡ Free: 20 Files / Day • 🛡️ Zero Watermarks • 🚀 JPG, PNG, WebP, HEIC, SVG'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4">
              {cms?.hero_heading_prefix || 'Free'}{' '}
              <span className="gradient-text">{cms?.hero_heading_highlight || 'Image Format Converter'}</span>{' '}
              {cms?.hero_heading_suffix || 'Online'}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              {cms?.hero_description ||
                'Convert between any image format online in seconds — JPG to PNG, PNG to JPG, JPG to WebP, PNG to WebP, HEIC to JPG, SVG to PNG, and more. Modern web optimization, lossless quality preservation, and 100% free daily quota with zero watermarks.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> JPG to PNG & WebP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Alpha Transparency Preserved
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> HEIC & SVG Supported
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Batch Bulk Conversion
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Zero Watermarks
              </span>
            </div>
          </section>

          {/* CONVERTER WIDGET (IN-PAGE, NO POPUPS!) */}
          <section id="converter" className="mb-14">
            <ImageFormatConverter
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
                    What is Axom AI Image Format Converter?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI Image Format Converter</strong> is a free, high-speed online utility engineered to convert digital images between all modern and legacy formats — including <strong>JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, and AVIF</strong> — in under 3 seconds. Operating entirely inside web browsers with <strong>no software installation</strong>, <strong>no account signup</strong>, and <strong>zero watermarks</strong>, it supports lossless transparency retention, next-gen WebP compression for website optimization, and batch conversion of multiple images with 1-click ZIP downloads.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> 100% Free Daily Conversions
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> WebP Website Performance Boost
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Lossless PNG Alpha Transparency
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
                {cms?.how_it_works_title || 'How to Convert Image Formats in 3 Easy Steps'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.how_it_works_subheading ||
                  'No complex software installation or account creation required. Fast, clean, and frictionless.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_1_title || 'Upload Your Image'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_1_desc ||
                    'Drag and drop your image file (JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, AVIF) into the converter or select it from your device.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_2_title || 'Select Target Format'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_2_desc ||
                    'Choose your desired output format — PNG (lossless transparency), JPG (compact file size), or WebP (modern web speed & quality).'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition text-center relative group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.step_3_title || 'Download Converted Image'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.step_3_desc ||
                    'Click Convert. Download your crisp, watermark-free image directly. Batch conversions are compiled into a 1-click ZIP.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHY AXOM AI */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {cms?.why_title || 'Why Axom AI is the Best Free Image Format Converter Online'}
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                {cms?.why_subheading ||
                  'Engineered for web developers, UI designers, photographers, and content creators who demand speed, privacy, and flawless image fidelity.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_1_title || 'Universal Multi-Format Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_1_desc ||
                    'Natively accepts 14+ formats: JPG, PNG, WebP, HEIC, HEIF, SVG, GIF, BMP, TIFF, JFIF, AVIF, and ICO. Convert any source image seamlessly.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_2_title || 'Zero Watermarks, 100% Clean'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_2_desc ||
                    'No promotional stamps, logos, or sneaky paywall limits. Output files are completely clean and ready for professional publishing.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_3_title || 'Strict Privacy & File Purging'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_3_desc ||
                    'Protected by 256-bit TLS encryption in transit. Files are processed in isolated transient memory buffers and deleted immediately after conversion.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_4_title || 'Universal Mobile & Desktop Support'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_4_desc ||
                    'Works effortlessly on iPhone (iOS Safari), Android (Chrome), Mac, Windows, Linux, and tablets. No app installation needed.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_5_title || 'Sub-3-Second Rendering Engine'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_5_desc ||
                    'Optimized image codecs execute re-encoding in under 3 seconds with minimal bandwidth consumption and zero waiting queues.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                  <Layers size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{cms?.benefit_6_title || 'Flexible Output & WebP Optimization'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {cms?.benefit_6_desc ||
                    'Select PNG for lossless transparent graphics, JPG for lightweight photo compression, or WebP for optimal website speed and Core Web Vitals.'}
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
                Tailored for Every Image Conversion Need
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Discover how web developers, UI designers, mobile users, and digital marketers rely on Axom AI for seamless format conversion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                  <Code2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Web Developers & Website Optimization</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Convert legacy JPG and heavy PNG assets into modern, high-performance WebP format. Reduce total page weight by up to 35%, accelerate Largest Contentful Paint (LCP), and improve Google Lighthouse scores.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-purple-300">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">WebP Core Web Vitals</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">35% Bandwidth Reduction</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">PageSpeed Booster</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                  <Palette size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">UI/UX Designers & Digital Artists</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Convert SVG vectors and complex artwork into lossless 24-bit PNGs with complete alpha transparency. Perfect for Figma mockups, Canva templates, client presentations, and digital design workflows.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-300">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Figma & Canva Ready</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">Alpha Transparency</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">SVG Rasterization</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">iPhone & Mobile Users (HEIC to JPG)</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Fix stubborn Apple HEIC/HEIF photo compatibility errors. Upload iPhone photos directly from Safari or your photo library and convert them into universal JPG or PNG files compatible with all platforms.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-cyan-300">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">iPhone HEIC to JPG</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Camera Roll Direct</span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">Universal Compatibility</span>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-5">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">E-Commerce & Bulk Batch Conversion</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Convert product catalogs, banner graphics, and social media assets in bulk. Process multiple images at once and download everything neatly packed in a single ZIP file for Amazon, Shopify, or WhatsApp.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-fuchsia-300">
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">Bulk Image Converter</span>
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">1-Click ZIP Archive</span>
                  <span className="px-2.5 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20">Shopify & Amazon Ready</span>
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
                {cms?.comparison_title || 'Axom AI vs. Traditional Image Converters'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                {cms?.comparison_subheading || 'See why users choose Axom AI over paywalled, slow, and ad-heavy alternatives.'}
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
                  {cms?.tech_spec_inputs || 'JPG, PNG, WebP, HEIC, SVG, GIF, BMP, TIFF, JFIF, AVIF'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  Output Formats
                </div>
                <div className="text-white font-medium">
                  {cms?.tech_spec_output || 'PNG / JPG / WebP'}
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
                  Axom AI routes requests through low-latency Indian edge nodes, delivering image format conversion speeds up to 3x faster than overseas platforms. Engineered for seamless processing of digital photos, official government portal uploads, Aadhaar/PAN scans, and web graphics.
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
                {cms?.faq_section_subheading || 'Got questions about image format conversion? Find answers to all popular queries below.'}
              </p>
            </div>

            <ImageFormatFaq faqs={activeFaqs} />
          </section>

          {/* SECTION 8: BOTTOM CTA */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {cms?.cta_title || 'Convert Any Image Format in Seconds'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
              {cms?.cta_desc ||
                'Experience fast, private, and watermark-free conversions trusted by web developers, designers, and creators across Assam, India, and worldwide.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={cms?.cta_btn_primary_url || '#converter'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition"
              >
                {cms?.cta_btn_primary_text || 'Upload Image Now'}
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
