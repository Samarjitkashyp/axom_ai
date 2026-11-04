import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
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
  CheckCircle2,
  Cpu,
  BookOpen,
  Fuel,
  Car,
  FileDown,
  Award,
  Check,
  X
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
  'fa-solid fa-gas-pump': Fuel,
  'fa-solid fa-book-open': BookOpen,
};

const TARGET_KEYWORDS = [
  // Primary SEO Keyword Targets (User-Specified Exact Matches)
  'assam ai',
  'artificial intelligence in assam',
  'axom ai',
  'ai in assam',
  'ai companies in assam',
  'ai companies in guwahati',
  'best ai companies in assam',
  'best ai company in guwahati',
  'only ai company in assam',
  'first ai company in assam',
  'assam artificial intelligence company',
  'ai startup guwahati',
  'ai startup assam',
  'ai startup in northeast india',
  'regional ai company assam',
  'indigenous ai company assam',
  'assam ai tools',
  'ai tools in assam',
  'assamese ai llm',
  'assamese ai chatbot',
  'axom ai fuel checker',
  'axom ai notes generator',
  'axom fuelcheck',
  'assam ai research lab',
  'guwahati ai companies',
  'assam tech startups',
  // Assamese Native Orthography
  'অসম এআই',
  'অসমৰ প্ৰথমটো এআই কোম্পানী',
  'অসমৰ একমাত্ৰ এআই কোম্পানী',
  'অসমীয়া কৃত্ৰিম বুদ্ধিমত্তা',
  'অসমীয়া এআই',
  'অসমৰ এআই প্লেটফৰ্ম',
  // High-Intent AEO & GEO Questions for SearchGPT, Perplexity, Claude, Gemini, Groq
  'Which is the only AI company in Assam',
  'What is the best AI company in Guwahati',
  'Is there an AI company in Assam',
  'Who founded Axom AI',
  'What AI products are made in Assam',
  'What is Axom FuelCheck',
  'What is Axom AI Notes Generator',
  'Which AI tool gives pure Assamese script',
  'AI platform for APSC exam preparation in Assam',
  'Top artificial intelligence startups in Northeast India',
  'Assam sovereign artificial intelligence platform',
  'AI chatbot that understands Assamese without Bengali errors',
  'E20 fuel compatibility checker India',
  'AI notes generator with docx export India'
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getLandingCMS().catch(() => null);
  const seo = cms?.seo;

  const title =
    seo?.meta_title && !seo.meta_title.includes("The Power of AI for Everyone")
      ? seo.meta_title
      : "Axom AI – An Indigenous Artificial Intelligence Company | Generative AI | Assamese LLM and language AI";

  const description =
    seo?.meta_description && seo.meta_description.length > 100
      ? seo.meta_description
      : "Axom AI is an Assam-based indigenous AI company developing Assamese language AI models, generative image technology, and 20+ verified AI tools. Building sovereign AI for Assam, India and beyond.";

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
      siteName: "Axom AI – Indigenous Artificial Intelligence Company",
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Axom AI – An Indigenous Artificial Intelligence Company from Assam, India",
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
  const entity = cms?.entity_profile;
  const explore = cms?.explore;
  const testimonialsHeader = cms?.testimonials_header;
  const testimonials = testimonialsHeader?.items || [];
  const insightsHeader = cms?.insights_header;
  const articles = insightsHeader?.articles || [];

  // ==========================================
  // UNIFIED JSON-LD MULTI-SCHEMA GRAPH
  // Optimized for Google, Bing, SearchGPT, Perplexity AI, Claude & Gemini
  // ==========================================
  const unifiedSchemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Organization Schema (Definitive Positioning as Assam's Only Dedicated AI Company)
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        legalName: 'Axom AI Technologies',
        alternateName: [
          'AI Axom',
          'Assam AI',
          'অসম এআই',
          'AxomAI',
          'Axom AI Guwahati',
          'Assam AI Company',
          'Axom AI 2.0'
        ],
        slogan: "An Indigenous Artificial Intelligence Company from Assam, India",
        description:
          "Axom AI is an Assam-based indigenous Artificial Intelligence company and research lab headquartered in Guwahati, Assam, India. Developed to create sovereign regional LLMs, Assamese Natural Language Processing models, generative image technology, pedagogical AI Notes Generators, Fuel Compatibility Engines, and regional AI software infrastructure for Northeast India.",
        url: 'https://aiaxom.co.in',
        logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        image: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        foundingDate: '2024',
        foundingLocation: {
          '@type': 'Place',
          name: 'Guwahati, Assam, India',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'G.S. Road, Guwahati',
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
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Guwahati AI Research Center, G.S. Road',
          addressLocality: 'Guwahati',
          addressRegion: 'Assam',
          postalCode: '781001',
          addressCountry: 'IN',
        },
        founder: {
          '@type': 'Person',
          name: 'Samarjit Kashyap',
          jobTitle: 'Founder & Lead AI Architect',
          url: 'https://aiaxom.co.in/about',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Assam' },
          { '@type': 'City', name: 'Guwahati' },
          { '@type': 'AdministrativeArea', name: 'Northeast India' },
          { '@type': 'Country', name: 'India' },
        ],
        knowsLanguage: ['as', 'en', 'hi'],
        knowsAbout: [
          'Artificial Intelligence in Assam',
          'Assam AI',
          'AI in Assam',
          'AI Companies in Assam',
          'AI Companies in Guwahati',
          'Best AI Companies in Assam',
          'Indigenous AI Company Assam',
          'Assamese Large Language Model (LLM)',
          'Assamese Natural Language Processing (NLP)',
          'Generative AI Model Development',
          'Axom Fuel Compatibility Checker (Axom FuelCheck E5 to E100)',
          'AI Notes Generator with Docx Export',
          'Scanned Assamese Document OCR',
          'axomai-trans-xetu Translation Engine',
          'Regional AI Solutions for Northeast India',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Axom AI Regional Intelligence Suite',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Axom AI Conversational Chat',
                description: 'Sovereign conversational AI with 99.4% Assamese script accuracy eliminating Bengali character confusion.',
                url: 'https://chat.aiaxom.co.in/',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Axom Fuel Compatibility Checker (Axom FuelCheck)',
                description: 'India’s premier verified automotive ethanol fuel compatibility checker for 60+ vehicle models covering E5 to E100 blends.',
                url: 'https://aiaxom.co.in/tools/fuel-checker',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Axom AI Notes Generator',
                description: 'Pedagogical study notes generator for APSC and university students with Word .docx export and Mermaid mind maps.',
                url: 'https://aiaxom.co.in/tools/ai-notes-generator',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'SoftwareApplication',
                name: 'Scanned Assamese OCR & Document Summarizer',
                description: 'Specialized optical character recognition for scanned Assamese paperwork and Jamabandi land records.',
                url: 'https://aiaxom.co.in/tools',
              },
            },
          ],
        },
        sameAs: [
          'https://huggingface.co/axom-ai',
          'https://github.com/Samarjitkashyp',
          'https://x.com',
          'https://linkedin.com',
        ],
      },

      // 2. WebSite Schema
      {
        '@type': 'WebSite',
        '@id': 'https://aiaxom.co.in/#website',
        url: 'https://aiaxom.co.in/',
        name: 'Axom AI',
        alternateName: ['AI Axom', 'Assam AI', 'অসম এআই', 'AxomAI', 'AI in Assam', 'Axom AI Guwahati'],
        description:
          "Assam's first and only dedicated indigenous Artificial Intelligence company and sovereign AI platform.",
        inLanguage: ['as', 'en', 'hi'],
        publisher: { '@id': 'https://aiaxom.co.in/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://chat.aiaxom.co.in/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },

      // 3. SoftwareApplication Suite Schema
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://aiaxom.co.in/#software',
        name: 'Axom AI Suite',
        operatingSystem: 'Web, Android, iOS, Windows, macOS, Linux',
        applicationCategory: 'BusinessApplication, Productivity, ArtificialIntelligence, EducationalApplication',
        description:
          "Assam's premier sovereign AI platform offering native Assamese conversational chat, Axom FuelCheck ethanol tool, AI Notes Generator with Docx export, OCR, and 20+ creative tools.",
        url: 'https://aiaxom.co.in',
        author: { '@id': 'https://aiaxom.co.in/#organization' },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },

      // 4. FAQPage Schema for Search Engines, SearchGPT & Perplexity
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/#faq',
        mainEntity: HOME_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },

      // 5. BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://aiaxom.co.in/#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://aiaxom.co.in/',
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* Multi-Schema JSON-LD Graph Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedSchemaGraph) }}
      />

      <Navbar header={cms?.header} />

      <main className="flex-1 pt-20">
        
        {/* ==================== HERO SECTION ==================== */}
        {/* Dark container keeps the scenic Assam tea & river hero backdrop crisp in both modes */}
        <div className="dark">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://aiaxom.co.in/static/dist/hero/assam.avif')` }}
          />
          <div className="hero-overlay absolute inset-0" />

          <div className="relative max-w-5xl mx-auto px-5 text-center z-10">
            {/* Authority Badge: Explicit Positioning as Assam's Indigenous AI Company */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-black/70 border border-fuchsia-500/50 text-fuchsia-800 dark:text-fuchsia-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-8 shadow-2xl backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {hero?.badge_text || "An Indigenous AI Company from Assam • অসমৰ থলুৱা এআই কোম্পানী"}
            </div>

            {/* Keyword-Rich H1 Headline targeting "Assam AI", "Indigenous AI Company", "Assamese LLM" */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.08] mb-6">
              {hero?.main_heading_prefix || 'Axom AI —'} <br className="hidden sm:inline" />
              <span className="gradient-text">
                {hero?.main_heading_highlight || "An Indigenous Artificial Intelligence Company"}
              </span>
            </h1>

            {/* Subheadings with Local Script and Regional Identity */}
            <p className="font-assamese text-base sm:text-xl text-fuchsia-900 dark:text-fuchsia-200 font-semibold mb-3 max-w-3xl mx-auto leading-relaxed">
              {hero?.subheading_assamese || 'অসমৰ থলুৱা কৃত্ৰিম বুদ্ধিমত্তা কোম্পানী — গুৱাহাটীৰ পৰা অসমীয়া ভাষাৰ AI মডেল আৰু আধুনিক জেনেৰেটিভ প্ৰযুক্তিৰ বিকাশ।'}
            </p>
            <p className="text-xs sm:text-base text-slate-800 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
              {hero?.subheading_english || 'Headquartered in Guwahati, Axom AI is an indigenous Artificial Intelligence company developing Assamese language AI models, generative image technologies, and 20+ verified tools. Building sovereign AI for Assam, India and beyond.'}
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
              <Link
                href="/tools"
                className="btn-ghost text-sm sm:text-base px-8 py-4 rounded-full inline-flex items-center gap-2 transition"
              >
                <span>{hero?.cta_secondary_text || 'Explore 20+ AI Tools'}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 dark:text-gray-400 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{hero?.trust_badge_1 || '100% Free Tier • No Card Required'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{hero?.trust_badge_2 || 'Sub-second Indian Edge compute'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                <span>Guwahati AI Research Lab (781001)</span>
              </div>
            </div>
          </div>
        </section>
        </div>

        {/* ==================== LOGO STRIP ==================== */}
        {logos.length > 0 && (
          <section className="border-y border-emerald-900/10 dark:border-white/5 py-8 bg-emerald-900/5 dark:bg-black/40 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 mb-4 text-center">
              <span className="text-[11px] uppercase tracking-widest text-slate-600 dark:text-gray-500 font-bold">
                {hero?.logo_strip_headline || 'Built with world-class AI models & sovereign infrastructure'}
              </span>
            </div>
            <div className="marquee">
              <div className="marquee-inner">
                {logos.concat(logos).map((logo, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-6 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-emerald-900/10 dark:border-white/5 text-slate-700 dark:text-gray-300 font-semibold text-xs sm:text-sm whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-700 dark:text-fuchsia-400" />
                    <span>{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== AEO DIRECT ANSWER & ENTITY PROFILE BOX ==================== */}
        {entity?.active !== false && (
          <section className="py-14 relative bg-[#f0fdf4] dark:bg-[#04060d] border-b border-emerald-900/10 dark:border-white/5">
            <div className="max-w-5xl mx-auto px-5">
              <div className="p-6 sm:p-9 rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-100/40 dark:from-fuchsia-950/40 via-white/90 dark:via-slate-900/90 to-emerald-50 dark:to-black shadow-2xl backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-[11px] font-black uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    {entity?.badge_text || "Assam's Sovereign AI Entity Profile"}
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> {entity?.verified_text || "Official Verified Entity • Assam's Only Dedicated AI Company"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                  {entity?.heading || "What is Axom AI? (An Indigenous Artificial Intelligence Company from Assam, India)"}
                </h2>

                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-6 space-y-3">
                  <p>
                    <strong>Axom AI</strong> (stylized as <em>AI Axom</em>, <em>Assam AI</em>, or <em>অসম এআই</em>) is an <strong>indigenous Artificial Intelligence company and technology platform headquartered in Guwahati, Assam, India</strong>. Founded and architected by AI researcher <strong>Samarjit Kashyap</strong>, Axom AI conducts specialized in-house R&amp;D focused on <strong>Assamese Large Language Models (LLMs)</strong>, generative image technology, and regional voice AI.
                  </p>
                  <p>
                    The platform bridges the regional linguistic divide with <strong>99.4% script purity</strong> via the <code>axomai-trans-xetu</code> engine (eliminating Bengali alphabet confusion), while delivering an integrated ecosystem of <strong>20+ verified production tools</strong> — including the nationwide <strong>Axom FuelCheck (E5–E100)</strong> and the academic <strong>AI Notes Generator</strong> with Microsoft Word (.docx) export.
                  </p>
                </div>

                {/* Entity Attribute Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-4 border-t border-emerald-900/15 dark:border-white/10">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                    <div className="text-slate-600 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-1">Company Status</div>
                    <div className="text-emerald-950 dark:text-white font-bold flex items-center gap-1">
                      <Award size={13} className="text-fuchsia-700 dark:text-fuchsia-400 shrink-0" />
                      <span>Indigenous AI Company</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                    <div className="text-slate-600 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-1">Headquarters</div>
                    <div className="text-emerald-950 dark:text-white font-bold flex items-center gap-1">
                      <MapPin size={13} className="text-fuchsia-700 dark:text-fuchsia-400 shrink-0" />
                      <span>Guwahati, Assam (781001)</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                    <div className="text-slate-600 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-1">Core AI Innovations</div>
                    <div className="text-emerald-950 dark:text-white font-bold">FuelCheck, Notes Gen, Pure LLM</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-emerald-900/10 dark:border-white/5">
                    <div className="text-slate-600 dark:text-gray-400 text-[10px] uppercase font-black tracking-wider mb-1">Assamese Script Purity</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">99.4% (Pure ‘ৰ’ &amp; ‘ৱ’ Engine)</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== 2026 AXOM AI FLAGSHIP ECOSYSTEM SHOWCASE ==================== */}
        <section className="py-20 md:py-28 relative bg-[#f0fdf4] dark:bg-[#070b14] border-b border-emerald-900/10 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                The 2026 Axom AI Ecosystem • Built in Assam
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                Pioneering AI Innovations for{' '}
                <span className="gradient-text">Assam, India &amp; Beyond</span>
              </h2>
              <p className="text-slate-700 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Discover the ground-breaking tools developed exclusively by Axom AI's research lab in Guwahati, solving real regional and national challenges with sovereign artificial intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Product 1: Axom FuelCheck */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 shadow-xl group hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Fuel size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] uppercase font-black tracking-wider text-emerald-800 dark:text-emerald-300">
                      Automotive AI
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Axom FuelCheck
                  </h3>
                  <div className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold mb-3">
                    Ethanol (E5–E100) Compatibility Checker
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 leading-relaxed mb-6">
                    India’s verified automotive tool. Select your Bike, Scooter, or Car across 15+ OEMs (60+ models) to verify E5, E10, E20, and E100 compatibility, official manual quotes, and instant AI doubt clearing.
                  </p>
                </div>
                <Link
                  href="/tools/fuel-checker"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:gap-2.5 transition-all pt-4 border-t border-emerald-900/10 dark:border-white/5"
                >
                  <span>Launch Fuel Checker</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Product 2: AI Notes Generator */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-fuchsia-500/50 transition-all duration-300 shadow-xl group hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 flex items-center justify-center">
                      <BookOpen size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-[10px] uppercase font-black tracking-wider text-fuchsia-800 dark:text-fuchsia-300">
                      Study &amp; Exams
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                    AI Notes Generator
                  </h3>
                  <div className="text-xs text-fuchsia-800 dark:text-fuchsia-400 font-semibold mb-3">
                    Pedagogical Notes with Word .docx Export
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 leading-relaxed mb-6">
                    Empowering students for APSC CCE, AHSEC, SEBA, and university exams. Generates structured study notes with executive summaries, formulas, exam tips (⭐), mind maps, and instant .docx download.
                  </p>
                </div>
                <Link
                  href="/tools/ai-notes-generator"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-400 group-hover:gap-2.5 transition-all pt-4 border-t border-emerald-900/10 dark:border-white/5"
                >
                  <span>Generate AI Notes</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Product 3: Pure Assamese Conversational LLM */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 shadow-xl group hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                      <Languages size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] uppercase font-black tracking-wider text-purple-800 dark:text-purple-300">
                      Sovereign LLM
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Pure Assamese AI Chat
                  </h3>
                  <div className="text-xs text-purple-800 dark:text-purple-400 font-semibold mb-3">
                    99.4% Script Precision (axomai-trans-xetu)
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 leading-relaxed mb-6">
                    Assam’s sovereign conversational intelligence. Eliminates Bengali script contamination (using authentic ‘ৰ’ and ‘ৱ’), grounded in Assam history, administration, culture, and literature.
                  </p>
                </div>
                <a
                  href={CHAT_URL}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400 group-hover:gap-2.5 transition-all pt-4 border-t border-emerald-900/10 dark:border-white/5"
                >
                  <span>Start Assamese Chat</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Product 4: Scanned Assamese Document OCR */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 shadow-xl group hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] uppercase font-black tracking-wider text-amber-800 dark:text-amber-300">
                      Document OCR
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Scanned Assamese OCR
                  </h3>
                  <div className="text-xs text-amber-800 dark:text-amber-400 font-semibold mb-3">
                    Land Records &amp; Gazette Digitization
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 leading-relaxed mb-6">
                    Read and transcribe scanned Assamese documents, Jamabandi and Chitha land records, historical archives, and old periodicals. Chat directly with uploaded PDFs in bilingual Assamese and English.
                  </p>
                </div>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:gap-2.5 transition-all pt-4 border-t border-emerald-900/10 dark:border-white/5"
                >
                  <span>Explore OCR Tools</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== AUTHORITY COMPARISON: WHY AXOM AI IS ASSAM'S ONLY AI LEADER ==================== */}
        <section className="py-20 md:py-28 relative bg-[#f0fdf4] dark:bg-[#0b1220] border-b border-emerald-900/10 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-800 dark:text-fuchsia-300 text-[11px] font-black uppercase tracking-wider mb-4">
                <Award className="w-3.5 h-3.5" /> Direct Entity Comparison
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                Why Axom AI is Assam’s{' '}
                <span className="gradient-text">Only Sovereign AI Company</span>
              </h2>
              <p className="text-slate-700 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                See how Axom AI differs fundamentally from foreign cloud chatbots and generic IT outsourcing agencies.
              </p>
            </div>

            {/* Responsive Comparison Table */}
            <div className="overflow-x-auto rounded-3xl border border-emerald-900/15 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-white/[0.02]">
                    <th className="py-4 px-5 font-black text-emerald-950 dark:text-white">Feature / Metric</th>
                    <th className="py-4 px-5 font-black text-fuchsia-800 dark:text-fuchsia-400 bg-fuchsia-500/10">
                      Axom AI (Guwahati, Assam)
                    </th>
                    <th className="py-4 px-5 font-bold text-slate-700 dark:text-gray-400">
                      Generic Global AI (ChatGPT / Gemini)
                    </th>
                    <th className="py-4 px-5 font-bold text-slate-700 dark:text-gray-400">
                      Traditional IT Agencies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/10 dark:divide-white/5">
                  <tr>
                    <td className="py-4 px-5 font-bold text-emerald-950 dark:text-white">
                      Dedicated AI Research Lab
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-fuchsia-500/5 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>100% Dedicated Indigenous AI Pioneer</span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      Generic US Foundation Models
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      Basic Web/App Dev Services Only
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-5 font-bold text-emerald-950 dark:text-white">
                      Assamese Script Accuracy
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-fuchsia-500/5">
                      99.4% Pure Script (Zero Bengali 'র' error)
                    </td>
                    <td className="py-4 px-5 text-amber-700 dark:text-amber-400">
                      Frequent Bengali Character Overlap
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-gray-500">
                      No NLP Capabilities
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-5 font-bold text-emerald-950 dark:text-white">
                      Specialized Public Utility Tools
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-fuchsia-500/5">
                      Axom FuelCheck (E20) &amp; AI Notes (.docx)
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      Generic Text Prompting Only
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-gray-500">
                      None Available
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-5 font-bold text-emerald-950 dark:text-white">
                      Local Indian Pricing &amp; UPI
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-fuchsia-500/5">
                      ₹0 Free Tier • UPI via Razorpay from ₹199
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      ~$20/Month via USD Credit Cards
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      Expensive Custom Invoices
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-5 font-bold text-emerald-950 dark:text-white">
                      Headquarters &amp; Data Residency
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-700 dark:text-emerald-400 bg-fuchsia-500/5">
                      Guwahati, Assam (DPDP Act 2023 Compliant)
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      USA Servers (Foreign Data Jurisdiction)
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-gray-400">
                      Third-Party Hosting
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ==================== AI IN ASSAM: REGIONAL IMPACT ==================== */}
        <section className="py-20 md:py-28 relative bg-[#f0fdf4] dark:bg-[#070b14] border-b border-emerald-900/10 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-800 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider mb-4">
                <Cpu className="w-3.5 h-3.5" /> AI in Assam • Sovereign Regional Solutions
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                Powering Artificial Intelligence in{' '}
                <span className="gradient-text">Assam &amp; Northeast India</span>
              </h2>
              <p className="text-slate-700 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                Tailored specifically for local linguistic nuances, state competitive exams, and regional business workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Students & APSC */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-fuchsia-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 flex items-center justify-center mb-5">
                    <GraduationCap size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">Assam AI for Students</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                    Assists candidates preparing for APSC CCE, Assam Police, and university exams with bilingual Assamese explanations, essay drafting, and rapid note summarization.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-fuchsia-700 dark:text-fuchsia-400 flex items-center gap-1">
                  <span>APSC &amp; Exam Preparation</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Card 2: Businesses in Assam */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-5">
                    <Briefcase size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">AI for Assam Businesses</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                    Automates bilingual customer support, commercial tender translations, and local marketing copy for MSMEs across Guwahati, Dibrugarh, and Silchar.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                  <span>Bilingual Business Automation</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Card 3: Scanned OCR & Land Docs */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-teal-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-5">
                    <FileText size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">Assamese Document OCR</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                    Extracts, reads, and translates text from scanned Assamese paperwork, Jamabandi land records, government gazettes, and historical manuscripts.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                  <span>Scanned Assamese OCR</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Card 4: Authentic Assamese Script */}
              <div className="glass-card rounded-2xl p-7 flex flex-col justify-between hover:border-pink-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-pink-500/15 text-pink-700 dark:text-pink-400 flex items-center justify-center mb-5">
                    <Languages size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">99.4% Script Accuracy</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                    Completely eliminates Bengali letter confusion (such as replacing authentic ‘ৰ’ and ‘ৱ’ with Bengali characters) seen in generic global AI chatbots.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-pink-700 dark:text-pink-400 flex items-center gap-1">
                  <span>Authentic Assamese LLM</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== EXPLORE AI TOOLS ==================== */}
        {explore?.active && (
          <section id="tools" className="py-20 md:py-28 relative bg-[#f0fdf4] dark:bg-[#0b1220]">
            <div className="max-w-7xl mx-auto px-5">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> {explore.badge || 'Explore AI Tools'}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                  {explore.title_prefix || 'A Complete AI Toolkit'}{' '}
                  <span className="gradient-text">{explore.title_highlight || 'for Modern Needs'}</span>
                </h2>
                <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
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
                            <Icon className="w-6 h-6 text-fuchsia-700 dark:text-fuchsia-400" />
                          </div>
                          {f.badge && (
                            <span className="px-2.5 py-1 rounded-full bg-white/70 dark:bg-white/5 border border-emerald-900/15 dark:border-white/10 text-[10px] uppercase font-bold tracking-wider text-fuchsia-700 dark:text-fuchsia-300">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-300 transition-colors">
                          {f.title}
                        </h3>
                        <div className="text-xs text-fuchsia-700/90 dark:text-fuchsia-400/90 font-medium mb-3">{f.tagline}</div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6">{f.description}</p>
                      </div>

                      <a
                        href={f.action_url || CHAT_URL}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-400 group-hover:translate-x-1 transition-transform"
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
          <section className="py-20 md:py-28 relative border-t border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#05070e]">
            <div className="max-w-7xl mx-auto px-5 mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> {testimonialsHeader.badge || 'Testimonials'}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                {testimonialsHeader.title_prefix || 'Loved by Users'}{' '}
                <span className="gradient-text">{testimonialsHeader.title_highlight || 'Across Assam'}</span>
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
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
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 text-xs mb-4">
                        {[...Array(t.rating || 5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="font-assamese text-sm text-slate-800 dark:text-gray-200 leading-relaxed mb-4 italic">
                        &ldquo;{t.quote_assamese}&rdquo;
                      </p>
                      {t.quote_english && (
                        <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-4">&ldquo;{t.quote_english}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 grid place-items-center text-white font-bold text-xs shadow-md">
                        {t.avatar_initials || 'AK'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950 dark:text-white">{t.name}</div>
                        <div className="text-[10px] text-slate-600 dark:text-gray-400">{t.role_designation}</div>
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
          <section id="insights" className="py-20 md:py-28 relative border-t border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
            <div className="max-w-7xl mx-auto px-5">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" /> {insightsHeader.badge || 'Insights'}
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-3">
                    {insightsHeader.title_prefix || 'Learn, Explore &'}{' '}
                    <span className="gradient-text">{insightsHeader.title_highlight || 'Stay Updated'}</span>
                  </h2>
                  <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
                    {insightsHeader.subheading || 'Guides, tips and stories from the Axom AI team and community.'}
                  </p>
                </div>

                <Link
                  href="/blog"
                  className="text-fuchsia-700 dark:text-fuchsia-400 font-bold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                >
                  <span>{insightsHeader.view_all_text || 'View all articles'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map((art, i) => {
                  const fallbackGradients = [
                    'from-fuchsia-600 via-purple-600 to-indigo-100 dark:to-indigo-800',
                    'from-pink-600 via-rose-600 to-purple-100 dark:to-purple-800',
                    'from-amber-500 via-orange-600 to-red-700',
                    'from-cyan-500 via-blue-600 to-indigo-100 dark:to-indigo-800',
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
                            <div className="w-11 h-11 rounded-2xl bg-emerald-900/5 dark:bg-white/10 backdrop-blur-md border border-emerald-900/25 dark:border-white/20 grid place-items-center text-emerald-950 dark:text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <Sparkles className="w-5 h-5 text-emerald-950 dark:text-white" />
                            </div>
                          </div>
                        )}
                        {/* Category Badge on Image */}
                        <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-emerald-950 dark:text-white font-bold bg-white/80 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-900/20 dark:border-white/15 z-10 shadow-md">
                          {art.category_label || art.category}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="text-[11px] text-slate-600 dark:text-gray-400 font-medium mb-2 flex items-center justify-between">
                            <span>{art.published_at || 'Recent'}</span>
                            <span className="flex items-center gap-1 text-fuchsia-700 dark:text-fuchsia-300">
                              <Clock className="w-3 h-3" /> {art.read_time}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-emerald-950 dark:text-white mb-2 group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-300 transition-colors leading-snug line-clamp-2">
                            {art.title}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                            {art.excerpt}
                          </p>
                        </div>

                        {/* Bottom Read Button */}
                        <div className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all pt-3 border-t border-emerald-900/10 dark:border-white/5 mt-auto">
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
        <div className="dark">
        <section className="assam-bg py-24 md:py-32 relative border-t border-emerald-900/15 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-fuchsia-500/40 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Start Today
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-6">
              Ready to Experience the Future of AI in Assam?
            </h2>
            <p className="text-base sm:text-lg text-slate-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
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
        </div>

      </main>

      <Footer footer={cms?.footer} seo={cms?.seo} />
    </>
  );
}
