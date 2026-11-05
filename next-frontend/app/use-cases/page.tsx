import React from 'react';
import type { Metadata } from 'next';
import { pageTitle } from '../../lib/seoTitle';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UseCasesFaq from '../../components/UseCasesFaq';
import UseCasesInteractiveHub from '../../components/UseCasesInteractiveHub';
import { USE_CASES_FAQS, UseCaseFaqItem } from '../../components/useCasesData';
import { getLandingCMS, getUseCasesCMS } from '../../lib/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
  Compass,
  Cpu,
  Layers,
  Award,
  BookOpen,
  Car,
  Scale,
  Briefcase,
  Stethoscope,
  Code2,
  Palette,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_TARGET_KEYWORDS = [
  'AI in Assam',
  'Artificial Intelligence in Assam',
  'Assam AI',
  'Large Language Models Assam',
  'Assam AI Model',
  'Assamese AI Models',
  'Assamese Large Language Models',
  'Assam Sovereign AI',
  'AI Company in Assam',
  'AI Startup Guwahati Assam',
  'Guwahati Artificial Intelligence',
  'Northeast India AI',
  'Assamese LLM',
  'Axom AI',
  'Progya Assamese LLM',
  'Axom-Llama-3.1-8B',
  'XUWOR multimodal AI',
  'Puhor voice AI Assam',
  'Xuna speech to text Assamese',
  'Xetu neural translation engine',
  'Axom AI use cases',
  'Assam AI use cases',
  'Assamese AI applications',
  'APSC exam AI preparation',
  'AI for students Assam',
  'AI for Assam government jobs',
  'AI for businesses in Assam',
  'Assam Jamabandi OCR AI',
  'Assam land records AI',
  'Axom FuelCheck ethanol AI',
  'E10 E20 fuel check India',
  'Assamese document translator AI',
  'Assamese legal AI',
  'AI in healthcare Assam',
  'AI for content creators Assamese',
  'AI for civil services Assam',
  'Assamese speech to text AI',
  'Assamese language artificial intelligence',
  'indigenous generative AI India',
  'Northeast India AI solutions',
  'sovereign AI India use cases',
  'how can students use Axom AI for exams',
  'how to prepare for APSC with AI',
  'can Axom AI translate Assamese documents',
  'how can local businesses in Assam use AI',
  'what are the real world use cases of Axom AI',
  'is Axom AI helpful for legal and land documents in Assam',
  'how to use AI for Assamese content writing',
  'how can doctors and healthcare workers in Assam use AI',
  'is Axom AI safe and compliant for confidential business data',
  'best AI platform for Assam students and professionals',
  'top indigenous AI tools for Northeast India',
  'Axom AI practical applications and real world impact',
  'how Axom AI helps regional language speakers',
  'sovereign Assamese LLM use cases',
  'Axom AI for enterprise and education',
  'Guwahati AI startup applications',
  'AI tools for Assam schools and colleges',
  'Assam Secretariat and government exam AI',
  'DPDP Act 2023 compliant AI India',
  'private Indian AI for businesses',
  'Axom FuelCheck ethanol compatibility check',
  'Assam Jamabandi OCR translation',
  '68096 token Assamese vocabulary',
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getUseCasesCMS().catch(() => null);

  const title =
    cms?.meta_title ||
    'Axom AI Use Cases — Sovereign Artificial Intelligence in Assam | Assamese LLMs, Foundation Models & 33+ Tools';
  const description =
    cms?.meta_description ||
    'Official catalog of real-world use cases for Axom AI, Assam\'s premier sovereign artificial intelligence entity and foundation model research lab in Guwahati. Discover Assamese Large Language Models (LLMs), APSC exam prep, Axom FuelCheck (E5–E100), Jamabandi OCR, and 33+ tools for students, businesses, and government in Northeast India.';
  const canonicalUrl = 'https://aiaxom.co.in/use-cases/';
  const ogImage = cms?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';
  const keywords = cms?.meta_keywords
    ? cms.meta_keywords.split(',').map((k) => k.trim())
    : DEFAULT_TARGET_KEYWORDS;

  return {
    title: pageTitle(title),
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
          alt: 'Axom AI Sovereign Artificial Intelligence in Assam — Real-World Use Cases & LLM Applications',
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

export default async function UseCasesPage() {
  const [landingData, cmsData] = await Promise.all([
    getLandingCMS().catch(() => null),
    getUseCasesCMS().catch(() => null),
  ]);

  const faqsList: UseCaseFaqItem[] =
    cmsData?.faqs && cmsData.faqs.length > 0
      ? cmsData.faqs.map((f) => ({ q: f.q, a: f.a }))
      : USE_CASES_FAQS;

  // Multi-tier Structured Data Graph for SEO, AEO, and GEO (Google, Bing, ChatGPT, Claude, Gemini, Groq)
  const unifiedGraphSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        alternateName: ['Assam AI', 'AI Axom', 'অসম এআই', 'Axom Artificial Intelligence', 'Axom AI Research Lab'],
        legalName: 'Axom AI Technology Platform',
        url: 'https://aiaxom.co.in',
        logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        image: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        description:
          'Axom AI is Assam\'s first sovereign artificial intelligence entity and foundational model research laboratory headquartered in Guwahati, Assam, India. Creator of sovereign Assamese foundation models (Progya, XUWOR, Puhor, Xuna, Xetu, Axom-Llama-3.1-8B) and 33+ production AI tools for education, civil services, automotive compliance, and business.',
        foundingLocation: {
          '@type': 'Place',
          name: 'Guwahati, Assam, India',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Guwahati',
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
        founder: {
          '@type': 'Person',
          name: 'Samarjit Kashyap',
          jobTitle: 'Lead Developer & AI Architect',
          url: 'https://aiaxom.co.in/about',
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Assam' },
          { '@type': 'AdministrativeArea', name: 'Northeast India' },
          { '@type': 'Country', name: 'India' },
        ],
        knowsAbout: [
          'Artificial Intelligence in Assam',
          'Assam AI',
          'Assamese Large Language Models',
          'Assam AI Models',
          'Indic Natural Language Processing',
          'Machine Learning in Assam',
          'APSC Civil Services AI Preparation',
          'Assam Land Records Jamabandi OCR',
          'Vehicle Ethanol Fuel Compatibility (Axom FuelCheck)',
          'Sovereign AI Infrastructure',
          'DPDP Act 2023 Compliance',
        ],
        sameAs: [
          'https://twitter.com/axom_ai',
          'https://github.com/Samarjitkashyp/axom_ai',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://aiaxom.co.in/#website',
        name: 'Axom AI — Assam\'s Sovereign Artificial Intelligence Platform',
        url: 'https://aiaxom.co.in',
        publisher: { '@id': 'https://aiaxom.co.in/#organization' },
        inLanguage: ['en-IN', 'as-IN'],
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://aiaxom.co.in/use-cases/#webpage',
        url: 'https://aiaxom.co.in/use-cases/',
        name: 'Axom AI Use Cases — Sovereign Artificial Intelligence in Assam | Assamese LLMs & 33+ Production AI Tools',
        description:
          cmsData?.meta_description ||
          'Comprehensive official catalog of real-world use cases for Axom AI across Assam and India. Empowering students, APSC aspirants, vehicle owners, MSMEs, healthcare providers, and legal practitioners with sovereign foundation models and 33+ production tools.',
        isPartOf: { '@id': 'https://aiaxom.co.in/#website' },
        breadcrumb: { '@id': 'https://aiaxom.co.in/use-cases/#breadcrumb' },
        about: [
          { '@type': 'Thing', name: 'Artificial Intelligence in Assam' },
          { '@type': 'Thing', name: 'Assamese Large Language Models' },
          { '@type': 'Thing', name: 'Assam AI Models & Research' },
          { '@type': 'Thing', name: 'APSC & UPSC Examination AI Preparation' },
          { '@type': 'Thing', name: 'Vehicle Ethanol Fuel Compatibility (Axom FuelCheck)' },
          { '@type': 'Thing', name: 'Assam Land Records & Jamabandi OCR Translation' },
          { '@type': 'Thing', name: 'Enterprise Document Intelligence for Northeast India' },
        ],
        mainEntity: { '@id': 'https://aiaxom.co.in/use-cases/#catalog' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://aiaxom.co.in/use-cases/#breadcrumb',
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
            name: 'Use Cases',
            item: 'https://aiaxom.co.in/use-cases/',
          },
        ],
      },
      {
        '@type': 'DefinedTermSet',
        '@id': 'https://aiaxom.co.in/use-cases/#terms',
        name: 'Assam Sovereign Artificial Intelligence Knowledge Definitions',
        hasDefinedTerm: [
          {
            '@type': 'DefinedTerm',
            name: 'Assam AI (Axom AI)',
            description: 'The indigenous sovereign artificial intelligence ecosystem and foundation models engineered in Guwahati, Assam, for native Assamese and Indic languages.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Assamese Large Language Model (Assamese LLM)',
            description: 'A generative neural network model pre-trained and fine-tuned specifically on verified Assamese grammar, vocabulary, literature, and regional context with 99.4% script purity.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Progya Foundation Model (প্ৰজ্ঞা)',
            description: 'Axom AI\'s flagship 2B-parameter regional language reasoning model with a 68,096-token specialized vocabulary.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Axom FuelCheck',
            description: 'An AI-powered verified vehicle ethanol compatibility diagnostic engine covering MoRTH/SIAM E10, E20, and E100 standards for 16+ automakers in India.',
          },
          {
            '@type': 'DefinedTerm',
            name: 'Assam Jamabandi Land Records OCR',
            description: 'Specialized computer vision and document intelligence tool for processing historical Assam revenue records, Jamabandi, and Chitha registers.',
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': 'https://aiaxom.co.in/use-cases/#catalog',
        name: 'Axom AI Specialized Use Case Solutions',
        description: 'Catalog of practical AI use cases engineered for Assam and India.',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Academic Excellence for Students',
            description: 'Bilingual STEM tutoring, syllabus revision, and instant Microsoft Word (.docx) study notes.',
            url: 'https://aiaxom.co.in/tools/ai-notes-generator',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'APSC & Assam Civil Services Preparation',
            description: 'Assam history, geography, and evaluated Mains answer writing powered by Progya.',
            url: 'https://chat.aiaxom.co.in/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Automotive Ethanol Compatibility (Axom FuelCheck)',
            description: 'MoRTH and SIAM certified E10, E20, and E100 compatibility checks covering 16+ brands.',
            url: 'https://aiaxom.co.in/tools/fuel-checker',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Enterprise MSMEs & Regional Commerce',
            description: '24/7 bilingual customer support, automated invoicing, and Assamese marketing copy.',
            url: 'https://aiaxom.co.in/tools',
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: 'Legal Administration & Land Records OCR',
            description: 'Jamabandi, Chitha, and deed parsing with 99.4% script purity and zero data retention.',
            url: 'https://aiaxom.co.in/tools/chat-with-pdf',
          },
          {
            '@type': 'ListItem',
            position: 6,
            name: 'Healthcare & Public Health Communication',
            description: 'Colloquial clinical translations and community awareness materials in native Assamese.',
            url: 'https://chat.aiaxom.co.in/',
          },
          {
            '@type': 'ListItem',
            position: 7,
            name: 'Journalism & Cultural Media Creation',
            description: 'Assamese news drafting, scriptwriting, and 4K cultural FLUX image generation.',
            url: 'https://aiaxom.co.in/tools/ai-image-generator',
          },
          {
            '@type': 'ListItem',
            position: 8,
            name: 'Developer APIs & Indic NLP Engineering',
            description: '68,096-token Assamese vocabulary and multi-tiered fallback cascade APIs with <0.8s latency.',
            url: 'https://aiaxom.co.in/docs/developer',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/use-cases/#faq',
        mainEntity: faqsList.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* Inject Unified Knowledge Graph Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedGraphSchema) }}
      />

      {/* Global Shared Header / Navbar */}
      <Navbar header={landingData?.header} />

      <main className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 relative overflow-hidden pt-24 sm:pt-28 pb-14 sm:pb-20">
        
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          {/* ==================== HERO SECTION ==================== */}
          <section className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 md:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5 shadow-sm">
              <span>{cmsData?.hero_badge_text || 'Real People • Real Impact • Sovereign Assamese AI'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.2] sm:leading-tight mb-4 sm:mb-5 break-words">
              {cmsData?.hero_heading_prefix || 'Built for'}{' '}
              <span className="gradient-text">
                {cmsData?.hero_heading_highlight || 'Real People, Real Impact'}
              </span>
              {cmsData?.hero_heading_suffix ? ` ${cmsData.hero_heading_suffix}` : ' Across Assam & India'}
            </h1>

            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 px-1">
              {cmsData?.hero_subtitle ||
                'From school classrooms in Dibrugarh to administrative offices in Dispur and tech startups in Guwahati — discover how Axom AI bridges indigenous foundation research with 33+ production tools to solve real linguistic, academic, and industrial challenges.'}
            </p>

            {/* Quick Navigation Jump Anchors */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <a
                href="#students"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Students &amp; Schools
              </a>
              <a
                href="#aspirants"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                APSC &amp; Civil Services
              </a>
              <a
                href="#automotive"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Automotive &amp; FuelCheck
              </a>
              <a
                href="#businesses"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                MSMEs &amp; Commerce
              </a>
              <a
                href="#legal"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Law &amp; Land Records
              </a>
              <a
                href="#developers"
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Developers &amp; APIs
              </a>
            </div>
          </section>

          {/* ==================== AEO DIRECT ANSWER & KNOWLEDGE GRAPH BOX ==================== */}
          <section id="aeo-overview" className="mb-12 sm:mb-16 max-w-5xl mx-auto">
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-5 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5 sm:mt-1 shadow-inner">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="space-y-3 sm:space-y-4 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                      <span>{cmsData?.aeo_badge || "Assam's Sovereign AI Entity Profile • Official Knowledge Graph"}</span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Guwahati, Assam • Verified Regional AI Developer</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-emerald-950 dark:text-white tracking-tight leading-snug">
                    {cmsData?.aeo_title || 'What is Axom AI? Sovereign Artificial Intelligence in Assam & Northeast India'}
                  </h2>

                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                    {cmsData?.aeo_description ||
                      'Axom AI (also known as Assam AI, AI Axom, or অসম এআই) is Assam\'s first sovereign artificial intelligence company and foundational model research laboratory headquartered in Guwahati, Assam (PIN 781001). Engineered specifically for Northeast India\'s linguistic and operational needs, Axom AI develops proprietary foundational large language models (LLMs) with a 68,096-token native Assamese vocabulary, alongside 33+ production tools for education (SEBA & AHSEC), civil service preparation (APSC CCE & ADRE), nationwide automotive fuel compliance (Axom FuelCheck E5–E100), and historical land records OCR (Jamabandi & Chitha).'}
                  </p>

                  {/* 4-Column Verified Knowledge Specification Panel for AEO & GEO Parsers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Entity &amp; Location
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                        Sovereign AI Entity
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        Guwahati, Assam (781001)
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Foundation LLMs
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                        Progya (2B) &amp; Llama 8B
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        XUWOR, Puhor, Xuna, Xetu
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Script &amp; Vocabulary
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                        99.4% Script Purity
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        68,096-Token Vocabulary
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Data Sovereignty
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-white leading-tight">
                        100% Hosted in India
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        DPDP Act 2023 • &lt;0.8s
                      </div>
                    </div>
                  </div>

                  {/* Grounded Capabilities Checklist */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" /> {cmsData?.aeo_point1 || '15M+ Regional Speakers Served'}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" /> {cmsData?.aeo_point2 || 'SEBA, AHSEC & APSC Aligned'}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" /> {cmsData?.aeo_point3 || 'DPDP Act 2023 Compliant'}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" /> MoRTH &amp; SIAM E10–E100 Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* ==================== FOUNDATION RESEARCH MODELS BRIDGE ==================== */}
          <section className="mb-14 sm:mb-20">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm">
                <span>Core Foundation Models • Axom AI Research Lab</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-2 sm:mb-3">
                Assamese Large Language Models (LLMs) &amp; Foundational AI Engineered in Assam
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Unlike generic foreign chatbots, Axom AI engineers dedicated vernacular LLMs, speech conformers, and diffusion voice models trained specifically on regional cultural, linguistic, and acoustic datasets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {/* Model 1: Progya */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-2.5 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Assamese Foundation LLM
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug">
                  Axom AI Brain — Progya (প্ৰজ্ঞা)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  2B parameter sovereign Assamese model with a custom 68,096-token vocabulary trained on 6.19M cultural records, eliminating token fragmentation and Bengali character substitution.
                </p>
                <div className="pt-1 sm:pt-2">
                  <a
                    href="https://aiaxom.co.in/research/axomai-brain-progya/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Read Progya Architecture Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Model 2: XUWOR */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-2.5 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Multimodal Conversational Agent
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug">
                  Axom AI Master — XUWOR (সুঁৱৰ)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Full-duplex multimodal reasoning agent delivering natural bilingual conversations with context awareness across text, speech, and document vision.
                </p>
                <div className="pt-1 sm:pt-2">
                  <a
                    href="https://aiaxom.co.in/research/axomai-multimodal-xuwor/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
                  >
                    <span>Read XUWOR Multimodal Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Model 3: Puhor */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-2.5 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  24kHz Flow-Matching Voice
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug">
                  Axom AI Voice — Puhor (পোহৰ)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Studio-grade 24,000 Hz Flow-Matching Diffusion Transformer (DiT) voice synthesis with zero audio hallucination and native Assamese emotional cadence.
                </p>
                <div className="pt-1 sm:pt-2">
                  <a
                    href="https://aiaxom.co.in/research/axomai-voice-puhor/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <span>Read Puhor Synthesis Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Model 4: Xuna */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-2.5 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  High-Noise Vernacular ASR
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug">
                  Axom AI Speech — Xuna (শুনা)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Conformer speech-to-text achieving 0.261x Real-Time Factor (3.8x faster than live speech) on low-cost CPU instances, providing robust transcription across regional accents.
                </p>
                <div className="pt-1 sm:pt-2">
                  <a
                    href="https://aiaxom.co.in/research/axomai-speech-xuna/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    <span>Read Xuna Conformer Benchmarks</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Model 5: Xetu */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-2.5 sm:space-y-3">
                <div className="text-[11px] sm:text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                  38.6 BLEU Neural Translation
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 dark:text-white leading-snug">
                  Axom AI Bridge — Xetu (সেতু)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High-fidelity translation engine achieving 38.6 BLEU on English-Assamese benchmarks while strictly preserving grammatical vibhakti, case markers, and classical orthography.
                </p>
                <div className="pt-1 sm:pt-2">
                  <a
                    href="https://aiaxom.co.in/research/axomai-trans-xetu/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
                  >
                    <span>Read Xetu Translation Evaluation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Research Hub Link */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white flex flex-col justify-between shadow-md space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Guwahati AI Research Lab
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug">
                    Explore All AI Research Publications
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access open evaluation metrics, tokenizer benchmarks, acoustic flow-matching loss curves, and model weights.
                  </p>
                </div>
                <div>
                  <a
                    href="https://aiaxom.co.in/research/"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                  >
                    <span>Visit Research Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== INTERACTIVE USE CASES HUB ==================== */}
          <section className="mb-14 sm:mb-20 md:mb-24">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm">
                <span>Specialized Industry &amp; Persona Solutions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-3 sm:mb-4">
                Explore How Axom AI Powers Every Sector
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Filter by your industry or role to see concrete workflows, verified real-world metrics, and applied production tools.
              </p>
            </div>

            <UseCasesInteractiveHub />
          </section>

          {/* ==================== SOVEREIGN ADVANTAGE COMPARISON BENTO GRID ==================== */}
          <section className="mb-14 sm:mb-20 md:mb-24 max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm">
                <span>The Sovereign Advantage</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-950 dark:text-white mb-2 sm:mb-3 tracking-tight">
                Why Axom AI Outperforms Overseas Chatbots for Assam
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Direct capability comparison showing why generic foreign AI models fail at regional linguistic nuance, exam preparation, and data residency.
              </p>
            </div>

            {/* Comparison Cards: Full Width, 1 Row me 1 Card */}
            <div className="space-y-4 sm:space-y-6">

              {/* Bento Card 1: Linguistic Precision (Full Width, 1 Row 1 Card) */}
              <div className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                      Linguistic Precision
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      99.4% Script Purity
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 dark:text-white mb-2 leading-snug break-words">
                    Assamese Script &amp; Grammatical Purity
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                    Eliminates Bengali script overlap (correcting Bengali &lsquo;র&rsquo; contamination into authentic Assamese &lsquo;ৰ&rsquo; and &lsquo;ৱ&rsquo;). Preserves authentic grammatical cases (vibhakti) and classical literary syntax across 6.19 million cultural training tokens.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Axom AI Advantage */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Axom AI Platform</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        99.4% pure script precision powered by axomai-trans-xetu with a custom 68,096-token Assamese vocabulary. Zero Bengali substitution, correct conjuncts (যুক্তাক্ষৰ), and flawless sentence flow.
                      </p>
                    </div>

                    {/* Overseas Chatbots Limitation */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Generic Overseas AI (ChatGPT / Gemini / Claude)</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Frequent Bengali script substitution (confusing র and ৰ), word-splitting due to fragmented sub-word tokenizers, and garbled literary phrasing.
                      </p>
                    </div>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Slow manual dictionary lookups and inconsistent unverified web transliteration widgets.</span>
                  </div>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Research Model:</span>
                  <a
                    href="https://aiaxom.co.in/research/axomai-trans-xetu/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Read Xetu Translation Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Bento Card 2: Edge Cloud Latency (Full Width, 1 Row 1 Card) */}
              <div className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25">
                      Edge Performance
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      &lt;0.8s Latency
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 dark:text-white mb-2 leading-snug break-words">
                    Domestic Edge Cloud Latency
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                    Multi-tiered inference routed across domestic Indian edge points with automatic failover to prevent downtime or transatlantic latency spikes.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Axom AI Advantage */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Axom AI Platform</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        Sub-second response delivery (&lt;0.8s) via local nodes. Multi-tier cascade (Tier 1 flagship, Tier 2 fast fallback, Tier 3 safety net) delivers 99.9% uptime.
                      </p>
                    </div>

                    {/* Overseas Chatbots Limitation */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Generic Overseas AI</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        2.5s to 4.5s latency roundtrips to US/EU datacenters; frequent peak-hour throttling and overseas outages.
                      </p>
                    </div>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Variable speeds, ad blockers interference, and frequent server timeouts.</span>
                  </div>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Architecture:</span>
                  <a
                    href="https://aiaxom.co.in/research/axomai-speech-xuna/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Read Latency Benchmarks</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Bento Card 3: Assam GK & Civil Services (Full Width, 1 Row 1 Card) */}
              <div className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                      Exam &amp; Syllabus
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      APSC / SEBA
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 dark:text-white mb-2 leading-snug break-words">
                    Assam GK &amp; APSC Alignment
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                    Pre-trained on Assam civil services, Ahom history, regional geography, state acts, and budgetary data with zero hallucination.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Axom AI Advantage */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Axom AI Platform</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        Deep state curriculum context (Ahom dynasty, Sukapha, Lachit Borphukan, regional geography, state budget, and APSC exam points).
                      </p>
                    </div>

                    {/* Overseas Chatbots Limitation */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Generic Overseas AI</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Superficial, generic summaries; routinely hallucinates state facts, dates, and historical figures.
                      </p>
                    </div>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Outdated static paper guidebooks with no dynamic notes or interactive doubt solving.</span>
                  </div>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Applied Tool:</span>
                  <Link
                    href="/tools/ai-notes-generator"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>AI Notes Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bento Card 4: 33+ Integrated Production Tools (Full Width, 1 Row 1 Card) */}
              <div className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/25">
                      Tool Ecosystem
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      33+ Built-in Tools
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 dark:text-white mb-2 leading-snug break-words">
                    Integrated Production Tools
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                    A unified sovereign software suite combining verified vehicular compliance, academic generators, and document processing.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Axom AI Advantage */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Axom AI Platform</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        33+ purpose-built tools: Axom FuelCheck (E5–E100), AI Notes Generator with .docx export, Scanned Jamabandi OCR, and full PDF/Word suite.
                      </p>
                    </div>

                    {/* Overseas Chatbots Limitation */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Generic Overseas AI</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Single text-only chat prompt window with zero native Word (.docx) export and no automotive or land-record engines.
                      </p>
                    </div>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Ad-heavy separate online tools with file caps and multiple paid accounts required.</span>
                  </div>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Ecosystem:</span>
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Browse All 33+ Tools</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bento Card 5: Data Sovereignty & DPDP Act 2023 (Full Width, 1 Row 1 Card) */}
              <div className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/25">
                      Data Residency &amp; Privacy
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      DPDP Act 2023
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-emerald-950 dark:text-white mb-2 leading-snug break-words">
                    100% Indian Data Sovereignty
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                    Zero overseas data transit. Prompts, documents, and student records are processed in isolated transient memory within India.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Axom AI Advantage */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Axom AI Platform</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        100% Indian cloud residency complying strictly with the Digital Personal Data Protection Act (DPDP Act 2023). Zero user prompt mining.
                      </p>
                    </div>

                    {/* Overseas Chatbots Limitation */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Generic Overseas AI</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Stored and processed on overseas US/EU server farms subject to foreign surveillance and cloud data requests.
                      </p>
                    </div>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Unknown third-party server privacy, silent document retention, and unencrypted uploads.</span>
                  </div>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">Compliance:</span>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Indian DPDP Act Verified</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ==================== FAQS ==================== */}
          <section className="mb-12 sm:mb-16 md:mb-20">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm">
                <span>{cmsData?.faq_badge || 'Questions & Answers'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 dark:text-white mb-2">
                {cmsData?.faq_title || 'Frequently Asked Questions about Axom AI'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                {cmsData?.faq_subtitle ||
                  'Clear, verified answers about how Axom AI fits your specific daily workflow, academic goals, and organization.'}
              </p>
            </div>

            <UseCasesFaq faqs={faqsList} />
          </section>


        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </>
  );
}
