import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Bot,
  PenTool,
  Image as ImageIcon,
  FileText,
  Code,
  Globe,
  FileCode,
  BarChart3,
  Languages,
  Star,
  Layers,
  Clock,
  MapPin,
  GraduationCap,
  Briefcase,
  Scale,
  Building,
  Check,
  CheckCircle2,
  Cpu,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UseCasesSection from '@/components/UseCasesSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import { HOME_FAQS } from '@/components/homeFaqsData';
import { getLandingCMS } from '@/lib/api';

const CHAT_URL = 'https://chat.aiaxom.co.in/';

const TOOL_ICONS: Record<string, React.ElementType> = {
  'fa-solid fa-brain': Bot,
  'fa-solid fa-pen-nib': PenTool,
  'fa-solid fa-wand-magic-sparkles': ImageIcon,
  'fa-solid fa-file-pdf': FileText,
  'fa-solid fa-code': Code,
  'fa-solid fa-globe': Globe,
  'fa-solid fa-file-contract': FileCode,
  'fa-solid fa-chart-pie': BarChart3,
  'fa-solid fa-language': Languages,
};

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'Axom AI',
  // Secondary SEO Keywords
  'AI platform',
  'AI platform in Assam',
  'AI tools',
  'AI tools in Assam',
  'Assamese AI',
  'Assam AI',
  'Assamese AI platform',
  'AI assistant',
  'Assamese AI assistant',
  'AI chatbot',
  'Assamese AI chatbot',
  'AI chatbot in Assamese',
  'AI for Assam',
  'AI in Assam',
  'artificial intelligence in Assam',
  'AI technology in Assam',
  'AI for Northeast India',
  'regional AI platform',
  'regional language AI',
  'AI tools online',
  'all-in-one AI platform',
  // Brand + Entity Keywords
  'Axom AI platform',
  'Axom AI Assam',
  'Axom AI Guwahati',
  'Axom AI chatbot',
  'Axom AI tools',
  'Axom AI assistant',
  'Axom AI Assamese',
  'Axom AI 2.0',
  'AI Axom',
  'Assam AI platform',
  'Assamese artificial intelligence',
  'Assamese language AI',
  'অসম এআই',
  'অসমীয়া AI',
  'অসমীয়া কৃত্ৰিম বুদ্ধিমত্তা',
  // AEO Keywords
  'What is Axom AI',
  'What is Axom AI used for',
  'Is Axom AI an AI chatbot',
  'Is Axom AI free',
  'Does Axom AI support Assamese',
  'Can Axom AI understand Assamese',
  'Can Axom AI reply in Assamese',
  'What AI tools does Axom AI provide',
  'What AI models does Axom AI use',
  'What is the AI platform for Assam',
  'Which AI chatbot supports Assamese',
  'Is there an AI assistant for Assamese language',
  'What are the best AI tools for Assamese users',
  'Which AI platform understands Assamese culture',
  // GEO Keywords
  'AI platform built in Assam',
  'AI platform for Assamese language',
  'AI assistant for Assamese users',
  'AI chatbot that understands Assamese',
  'AI tools for people in Assam',
  'AI platform for Northeast India',
  'regional language AI platform India',
  'Indian AI platform for regional languages',
  'Assamese generative AI',
  'AI tools for Assamese students',
  'AI tools for Assamese businesses',
  'AI tools for Assamese creators',
  // Audience & Tools
  'AI tools for students in Assam',
  'AI tools for businesses in Assam',
  'Assamese AI writer',
  'Assamese AI translator',
  'AI PDF analyzer online',
  'AI image generator with Assamese prompts',
  'AI coding assistant Assam',
  'AI startup Guwahati',
  'AI company Guwahati',
  'AI in Northeast India',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getLandingCMS().catch(() => null);
  const seo = cms?.seo;

  const title =
    seo?.meta_title && !seo.meta_title.includes("The Power of AI for Everyone")
      ? seo.meta_title
      : "Axom AI — Assam's Premier Indigenous AI Platform & Assamese AI Assistant | AI in Assam";

  const description =
    seo?.meta_description && seo.meta_description.length > 100
      ? seo.meta_description
      : "Axom AI (AI Axom / অসম এআই) is Assam's first indigenous Artificial Intelligence platform headquartered in Guwahati. Native Assamese chat, scanned OCR, 20+ document tools, and sovereign LLMs for students, businesses, and creators across Northeast India.";

  const canonicalUrl = 'https://aiaxom.co.in/';
  const ogImage = seo?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';

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
          alt: "Axom AI — Assam's Indigenous Artificial Intelligence Platform",
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const cms = await getLandingCMS().catch(() => null);

  const hero = cms?.hero;
  const logos = cms?.logos || [];
  const explore = cms?.explore;
  const testimonialsHeader = cms?.testimonials_header;
  const testimonials = testimonialsHeader?.items || [];
  const insightsHeader = cms?.insights_header;
  const articles = insightsHeader?.articles || [];

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://aiaxom.co.in/#website',
    url: 'https://aiaxom.co.in/',
    name: 'Axom AI',
    alternateName: ['AI Axom', 'Assam AI', 'অসম এআই', 'AxomAI', 'Axom AI 2.0'],
    description:
      "Assam's first indigenous Artificial Intelligence platform and Assamese AI assistant.",
    inLanguage: ['as', 'en', 'hi'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://chat.aiaxom.co.in/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://aiaxom.co.in/#organization',
    name: 'Axom AI',
    legalName: 'Axom AI Technologies',
    alternateName: ['AI Axom', 'Assam AI', 'অসম এআই', 'AxomAI', 'Axom AI Guwahati'],
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    image: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    description:
      "Axom AI is Assam's flagship indigenous artificial intelligence platform headquartered in Guwahati, Assam, India. Developed to empower over 15 million Assamese speakers with native conversational LLMs, document OCR, and regional AI tools.",
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Guwahati, Assam, India',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guwahati',
        addressRegion: 'Assam',
        postalCode: '781001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 26.1445,
        longitude: 91.7362,
      },
    },
    founder: {
      '@type': 'Person',
      name: 'Samarjit Kashyap',
      jobTitle: 'Lead AI Architect & Founder',
      url: 'https://aiaxom.co.in/about',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Assam' },
      { '@type': 'AdministrativeArea', name: 'Northeast India' },
      { '@type': 'Country', name: 'India' },
    ],
    knowsLanguage: ['as', 'en', 'hi'],
    knowsAbout: [
      'AI in Assam',
      'Artificial Intelligence in Assam',
      'Assam AI',
      'Assamese AI',
      'Assamese AI Chatbot',
      'Assamese LLM',
      'Assamese OCR',
      'AI Tools in Assam',
      'Indigenous AI India',
      'Sovereign AI Northeast India',
    ],
    sameAs: [
      'https://x.com',
      'https://linkedin.com',
      'https://youtube.com',
      'https://instagram.com',
    ],
  };

  // SoftwareApplication Schema
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Axom AI Platform',
    operatingSystem: 'Web, Android, iOS, Windows, macOS, Linux',
    applicationCategory: 'BusinessApplication, Productivity, ArtificialIntelligence, Chatbot',
    description:
      "Axom AI is Assam's premier indigenous Artificial Intelligence platform offering conversational chat in Assamese, OCR, 20+ file converters, image generation, and live web search.",
    url: 'https://aiaxom.co.in',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  // FAQPage Schema for Search Engines & AEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar header={cms?.header} />

      <main className="flex-1 pt-20">
        
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://aiaxom.co.in/static/dist/hero/assam.avif')` }}
          />
          <div className="hero-overlay absolute inset-0" />

          <div className="relative max-w-5xl mx-auto px-5 text-center z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              {hero?.badge_text || 'অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Assam’s #1 Indigenous AI • Axom AI 2.0'}
            </div>

            {/* Keyword-Rich H1 Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
              Axom AI — <br className="hidden sm:inline" />
              <span className="gradient-text">
                {hero?.main_heading_highlight || "Assam's Indigenous AI Platform"}
              </span>
            </h1>

            {/* Subheadings */}
            <p className="font-assamese text-base sm:text-xl text-fuchsia-200/90 font-medium mb-3 max-w-3xl mx-auto leading-relaxed">
              {hero?.subheading_assamese || 'অসমৰ প্ৰথমটো থলুৱা কৃত্ৰিম বুদ্ধিমত্তা সহায়ক — যিয়ে অসমীয়া ভাষা আৰু সংস্কৃতি সঠিকভাৱে বুজি পায়।'}
            </p>
            <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              {hero?.subheading_english || 'From fluent Assamese chat to instant image generation, scanned document OCR, and 20+ file tools — built for the next generation of Assam.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a
                href={hero?.cta_primary_url || CHAT_URL}
                className="btn-primary text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-2xl transition transform hover:-translate-y-0.5"
              >
                <span>{hero?.cta_primary_text || 'Start Chatting Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={hero?.cta_secondary_url || '#tools'}
                className="btn-ghost text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 transition"
              >
                <span>{hero?.cta_secondary_text || 'Explore AI Tools'}</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                <span>{hero?.trust_badge_1 || 'No credit card required'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-fuchsia-400" />
                <span>{hero?.trust_badge_2 || 'Sub-second Indian Edge compute'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-fuchsia-400" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== LOGO STRIP ==================== */}
        {logos.length > 0 && (
          <section className="border-y border-white/5 py-8 bg-black/40 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 mb-4 text-center">
              <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                {hero?.logo_strip_headline || 'Built with world-class AI models & infrastructure'}
              </span>
            </div>
            <div className="marquee">
              <div className="marquee-inner">
                {logos.concat(logos).map((logo, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-6 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 font-semibold text-xs sm:text-sm whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== AEO DIRECT ANSWER & ENTITY PROFILE BOX ==================== */}
        <section className="py-14 relative bg-[#04060d] border-b border-white/5">
          <div className="max-w-5xl mx-auto px-5">
            <div className="p-6 sm:p-9 rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/30 via-slate-900/80 to-black shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" /> Assam&apos;s Sovereign AI Entity Profile
                </div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Official Verified Platform
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                What is Axom AI? (Assam AI Definition &amp; Architecture)
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6">
                <strong>Axom AI</strong> (stylized as <strong>AI Axom</strong>, Assamese:{' '}
                <strong className="font-assamese">অসম এআই</strong>, also commonly referred to as{' '}
                <strong>Assam AI</strong>) is Assam&apos;s flagship indigenous artificial intelligence
                platform headquartered in Guwahati, Assam, India. Founded by AI researcher{' '}
                <strong>Samarjit Kashyap</strong>, the platform delivers authentic Assamese Large Language
                Model (LLM) reasoning, scanned document OCR, 20+ file utilities, generative image
                synthesis, and live web search for students, researchers, businesses, and creators
                across Northeast India.
              </p>

              {/* Entity Attribute Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-4 border-t border-white/10">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Headquarters</div>
                  <div className="text-white font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-fuchsia-400 shrink-0" />
                    <span>Guwahati, Assam (781001)</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Languages Supported</div>
                  <div className="text-white font-semibold">Assamese, English, Hindi</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Core Architecture</div>
                  <div className="text-white font-semibold">Assamese RAG &amp; IndicTrans2</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Pricing in India</div>
                  <div className="text-emerald-400 font-semibold">₹0 Free Tier • UPI via Razorpay</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== AI IN ASSAM: REGIONAL IMPACT ==================== */}
        <section className="py-20 md:py-28 relative bg-[#06060b] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Cpu className="w-3.5 h-3.5" /> AI in Assam • Real-World Solutions
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Powering Artificial Intelligence in{' '}
                <span className="gradient-text">Assam &amp; Northeast India</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Tailored specifically for local linguistic nuances, state competitive exams, and regional business workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Students & APSC */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-fuchsia-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-5">
                    <GraduationCap size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Assam AI for Students</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                    Assists candidates preparing for APSC CCE, Assam Police, and university exams with bilingual Assamese explanations, essay drafting, and rapid note summarization.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-fuchsia-400 flex items-center gap-1">
                  <span>APSC &amp; Exam Preparation</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Card 2: Businesses in Assam */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-5">
                    <Briefcase size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">AI for Assam Businesses</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                    Automates bilingual customer support, commercial tender translations, and local marketing copy for MSMEs across Guwahati, Dibrugarh, and Silchar.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                  <span>Bilingual Business Automation</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Card 3: Scanned OCR & Land Docs */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-teal-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-5">
                    <FileText size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Assamese Document OCR</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                    Extracts, reads, and translates text from scanned Assamese paperwork, Jamabandi land records, government gazettes, and historical manuscripts.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-teal-400 flex items-center gap-1">
                  <span>Scanned Assamese OCR</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Card 4: Authentic Assamese Script */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-pink-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-5">
                    <Languages size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">99.4% Script Accuracy</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                    Completely eliminates Bengali letter confusion (such as replacing authentic ‘ৰ’ and ‘ৱ’ with Bengali characters) seen in generic global AI chatbots.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-pink-400 flex items-center gap-1">
                  <span>Authentic Assamese LLM</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== EXPLORE AI TOOLS ==================== */}
        {explore?.active && (
          <section id="tools" className="py-20 md:py-28 relative bg-[#06060b]">
            <div className="max-w-7xl mx-auto px-5">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> {explore.badge || 'Explore AI Tools'}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                  {explore.title_prefix || 'A Complete AI Toolkit'}{' '}
                  <span className="gradient-text">{explore.title_highlight || 'for Modern Needs'}</span>
                </h2>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {explore.subheading || 'Everything you need to be more productive, creative and informed — in one powerful platform.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(explore.features || []).map((f, i) => {
                  const Icon = TOOL_ICONS[f.icon_class] || Bot;
                  return (
                    <div
                      key={f.id || i}
                      className="glass-card rounded-2xl p-7 flex flex-col justify-between group hover:border-fuchsia-500/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-600/10 border border-fuchsia-500/30 grid place-items-center">
                            <Icon className="w-6 h-6 text-fuchsia-400" />
                          </div>
                          {f.badge && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-wider text-fuchsia-300">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">
                          {f.title}
                        </h3>
                        <div className="text-xs text-fuchsia-400/90 font-medium mb-3">{f.tagline}</div>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">{f.description}</p>
                      </div>

                      <a
                        href={f.action_url || CHAT_URL}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-400 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Try tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== USE CASES ==================== */}
        {cms?.usecases_header && <UseCasesSection header={cms.usecases_header} />}

        {/* ==================== TESTIMONIALS ==================== */}
        {testimonialsHeader?.active && testimonials.length > 0 && (
          <section className="py-20 md:py-28 relative border-t border-white/5 bg-[#05070e]">
            <div className="max-w-7xl mx-auto px-5 mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> {testimonialsHeader.badge || 'Testimonials'}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {testimonialsHeader.title_prefix || 'Loved by Users'}{' '}
                <span className="gradient-text">{testimonialsHeader.title_highlight || 'Across Assam'}</span>
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                {testimonialsHeader.subheading || 'Real stories from students, creators and founders using Axom AI daily.'}
              </p>
            </div>

            <div className="testimonials-marquee">
              <div className="testimonials-inner">
                {testimonials.concat(testimonials).map((t, i) => (
                  <div
                    key={i}
                    className="w-[320px] sm:w-[380px] glass-card rounded-2xl p-6 flex flex-col justify-between shrink-0"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mb-4">
                        {[...Array(t.rating || 5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="font-assamese text-sm text-gray-200 leading-relaxed mb-4 italic">
                        &ldquo;{t.quote_assamese}&rdquo;
                      </p>
                      {t.quote_english && (
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">&ldquo;{t.quote_english}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 grid place-items-center text-white font-bold text-xs shadow-md">
                        {t.avatar_initials || 'AK'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-gray-400">{t.role_designation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== PRICING PLANS ==================== */}
        {cms?.pricing_header && <PricingSection header={cms.pricing_header} />}

        {/* ==================== INSIGHTS / BLOG PREVIEW ==================== */}
        {insightsHeader?.active && articles.length > 0 && (
          <section id="insights" className="py-20 md:py-28 relative border-t border-white/5 bg-[#06060b]">
            <div className="max-w-7xl mx-auto px-5">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" /> {insightsHeader.badge || 'Insights'}
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                    {insightsHeader.title_prefix || 'Learn, Explore &'}{' '}
                    <span className="gradient-text">{insightsHeader.title_highlight || 'Stay Updated'}</span>
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
                    {insightsHeader.subheading || 'Guides, tips and stories from the Axom AI team and community.'}
                  </p>
                </div>

                <Link
                  href="/blog"
                  className="text-fuchsia-400 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                >
                  <span>{insightsHeader.view_all_text || 'View all articles'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((art, i) => {
                  const fallbackGradients = [
                    'from-fuchsia-600 via-purple-600 to-indigo-800',
                    'from-pink-600 via-rose-600 to-purple-800',
                    'from-amber-500 via-orange-600 to-red-700',
                    'from-cyan-500 via-blue-600 to-indigo-800',
                  ];
                  const grad = fallbackGradients[i % fallbackGradients.length];

                  return (
                    <Link
                      key={art.id}
                      href={art.link || `/blog/${art.slug}/`}
                      className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg shadow-black/40 hover:shadow-fuchsia-500/10"
                    >
                      {/* Top Image Banner */}
                      <div className={`h-40 relative overflow-hidden shrink-0 bg-gradient-to-br ${grad}`}>
                        {art.cover_image_url ? (
                          <img
                            src={art.cover_image_url}
                            alt={art.title}
                            className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 grid-bg opacity-30" />
                            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                        {/* Category Badge on Image */}
                        <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-white font-bold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 z-10 shadow-md">
                          {art.category_label || art.category}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="text-[11px] text-gray-400 font-medium mb-2 flex items-center justify-between">
                            <span>{art.published_at || 'Recent'}</span>
                            <span className="flex items-center gap-1 text-fuchsia-300">
                              <Clock className="w-3 h-3" /> {art.read_time}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors leading-snug line-clamp-2">
                            {art.title}
                          </h3>

                          <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                            {art.excerpt}
                          </p>
                        </div>

                        {/* Bottom Read Button */}
                        <div className="text-xs font-semibold text-fuchsia-400 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all pt-3 border-t border-white/5 mt-auto">
                          <span>Read article</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== FAQ ==================== */}
        <FAQSection faqs={HOME_FAQS} />

        {/* ==================== FINAL CTA ==================== */}
        <section className="assam-bg py-24 md:py-32 relative border-t border-white/10">
          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Start Today
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Ready to Experience the Future of AI in Assam?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Join thousands of students, creators, developers, and businesses unlocking new possibilities every day with Axom AI.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={CHAT_URL}
                className="btn-primary text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-2xl transition transform hover:-translate-y-0.5"
              >
                <span>Start Chatting Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/pricing"
                className="btn-ghost text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 transition"
              >
                <span>View Transparent Pricing</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer footer={cms?.footer} seo={cms?.seo} />
    </>
  );
}
