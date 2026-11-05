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
  Compass,
  Cpu,
  Globe2,
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
  'Axom AI use cases',
  'Assam AI use cases',
  'Assamese AI applications',
  'AI in Assam',
  'AI for students Assam',
  'APSC exam AI preparation',
  'AI for Assam government jobs',
  'AI for businesses in Assam',
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
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getUseCasesCMS().catch(() => null);

  const title =
    cms?.meta_title ||
    'Axom AI Use Cases — Real-World AI Solutions for Assam & India | Students, Government & Business';
  const description =
    cms?.meta_description ||
    'Discover how students, APSC aspirants, vehicle owners, businesses, legal practitioners, and healthcare professionals across Assam & India leverage Axom AI foundation models and 33+ production tools for real-world impact.';
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
          alt: 'Axom AI Real-World Use Cases & Applications',
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

  // Multi-tier Structured Data Schemas for SEO, AEO, and GEO
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Axom AI Use Cases & Sovereign AI Solutions',
    url: 'https://aiaxom.co.in/use-cases/',
    description:
      cmsData?.meta_description ||
      'Comprehensive catalog of real-world use cases for Axom AI across Assam and India. Empowering students, APSC aspirants, vehicle owners, MSMEs, healthcare providers, and legal practitioners with sovereign foundation models and 33+ production tools.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Axom AI',
      url: 'https://aiaxom.co.in',
    },
    about: [
      { '@type': 'Thing', name: 'Artificial Intelligence in Assam' },
      { '@type': 'Thing', name: 'Assamese Language Technology & NLP' },
      { '@type': 'Thing', name: 'APSC & UPSC Examination AI Preparation' },
      { '@type': 'Thing', name: 'Vehicle Ethanol Fuel Compatibility (Axom FuelCheck)' },
      { '@type': 'Thing', name: 'Assam Land Records & Jamabandi OCR Translation' },
      { '@type': 'Thing', name: 'Enterprise Document Intelligence for Northeast India' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqsList.map((faq) => ({
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
        name: 'Use Cases',
        item: 'https://aiaxom.co.in/use-cases/',
      },
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    alternateName: ['Assam AI', 'AI Axom', 'অসম এআই'],
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      postalCode: '781001',
      addressCountry: 'IN',
    },
    founder: {
      '@type': 'Person',
      name: 'Samarjit Kashyap',
      jobTitle: 'Lead Developer',
      url: 'https://aiaxom.co.in/about',
    },
    description:
      'Indigenous Artificial Intelligence company and technology platform headquartered in Guwahati, Assam, India. Developer of sovereign Assamese foundation models and 33+ production tools.',
    sameAs: [
      'https://twitter.com/axom_ai',
      'https://github.com/Samarjitkashyp/axom_ai',
    ],
  };

  const softwareCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
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
  };

  return (
    <>
      {/* Inject Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareCatalogSchema) }}
      />

      {/* Global Shared Header / Navbar */}
      <Navbar header={landingData?.header} />

      <main className="min-h-screen bg-[#f0fdf4] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 relative overflow-hidden pt-28 pb-20">
        
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 dark:bg-emerald-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ==================== HERO SECTION ==================== */}
          <section className="text-center max-w-4xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
              <span>{cmsData?.hero_badge_text || 'Real People • Real Impact • Sovereign Assamese AI'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight sm:leading-tight mb-5">
              {cmsData?.hero_heading_prefix || 'Built for'}{' '}
              <span className="gradient-text">
                {cmsData?.hero_heading_highlight || 'Real People, Real Impact'}
              </span>
              {cmsData?.hero_heading_suffix ? ` ${cmsData.hero_heading_suffix}` : ' Across Assam & India'}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
              {cmsData?.hero_subtitle ||
                'From school classrooms in Dibrugarh to administrative offices in Dispur and tech startups in Guwahati — discover how Axom AI bridges indigenous foundation research with 33+ production tools to solve real linguistic, academic, and industrial challenges.'}
            </p>

            {/* Quick Navigation Jump Anchors */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <a
                href="#students"
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Students &amp; Schools
              </a>
              <a
                href="#aspirants"
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                APSC &amp; Civil Services
              </a>
              <a
                href="#automotive"
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Automotive &amp; FuelCheck
              </a>
              <a
                href="#businesses"
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                MSMEs &amp; Commerce
              </a>
              <a
                href="#legal"
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Law &amp; Land Records
              </a>
              <a
                href="#developers"
                className="px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all font-medium"
              >
                Developers &amp; APIs
              </a>
            </div>
          </section>

          {/* ==================== AEO DIRECT ANSWER & KNOWLEDGE GRAPH BOX ==================== */}
          <section className="mb-16 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 mt-1 shadow-inner">
                  <Compass className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                    <span>{cmsData?.aeo_badge || 'AEO Direct Answer • Platform Overview'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
                    {cmsData?.aeo_title || 'What are the Practical Use Cases of Axom AI?'}
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                    {cmsData?.aeo_description ||
                      'Axom AI is India’s sovereign artificial intelligence platform customized for the linguistic, educational, and professional demands of Assam and Northeast India. Key use cases span bilingual academic tutoring for AHSEC and university students, evaluated Mains answer writing for APSC civil services, nationwide ethanol compatibility verification via Axom FuelCheck (E5–E100), automated customer support and invoicing for MSMEs, historical land records (Jamabandi & Chitha) translation, healthcare clinical guidance, and full-stack software development.'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> {cmsData?.aeo_point1 || '15M+ Regional Speakers Served'}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> {cmsData?.aeo_point2 || 'SEBA, AHSEC & APSC Aligned'}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={16} /> {cmsData?.aeo_point3 || 'DPDP Act 2023 Compliant'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* ==================== FOUNDATION RESEARCH MODELS BRIDGE ==================== */}
          <section className="mb-20">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <span>Core Foundation Models • Axom AI Research Lab</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-3">
                Proprietary AI Models Powering Every Use Case
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Unlike wrappers calling generic foreign APIs, Axom AI engineers dedicated vernacular architectures trained specifically on regional cultural, linguistic, and acoustic data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Model 1: Progya */}
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-3">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Assamese Foundation LLM
                </div>
                <h3 className="text-lg font-black text-emerald-950 dark:text-white">
                  Axom AI Brain — Progya (প্ৰজ্ঞা)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  2B parameter sovereign Assamese model with a custom 68,096-token vocabulary trained on 6.19M cultural records, eliminating token fragmentation and Bengali character substitution.
                </p>
                <div className="pt-2">
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
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-3">
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Multimodal Conversational Agent
                </div>
                <h3 className="text-lg font-black text-emerald-950 dark:text-white">
                  Axom AI Master — XUWOR (সুঁৱৰ)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Full-duplex multimodal reasoning agent delivering natural bilingual conversations with context awareness across text, speech, and document vision.
                </p>
                <div className="pt-2">
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
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-3">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  24kHz Flow-Matching Voice
                </div>
                <h3 className="text-lg font-black text-emerald-950 dark:text-white">
                  Axom AI Voice — Puhor (পোহৰ)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Studio-grade 24,000 Hz Flow-Matching Diffusion Transformer (DiT) voice synthesis with zero audio hallucination and native Assamese emotional cadence.
                </p>
                <div className="pt-2">
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
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-3">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  High-Noise Vernacular ASR
                </div>
                <h3 className="text-lg font-black text-emerald-950 dark:text-white">
                  Axom AI Speech — Xuna (শুনা)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Conformer speech-to-text achieving 0.261x Real-Time Factor (3.8x faster than live speech) on low-cost CPU instances, providing robust transcription across regional accents.
                </p>
                <div className="pt-2">
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
              <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-md space-y-3">
                <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                  38.6 BLEU Neural Translation
                </div>
                <h3 className="text-lg font-black text-emerald-950 dark:text-white">
                  Axom AI Bridge — Xetu (সেতু)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High-fidelity translation engine achieving 38.6 BLEU on English-Assamese benchmarks while strictly preserving grammatical vibhakti, case markers, and classical orthography.
                </p>
                <div className="pt-2">
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
              <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col justify-between shadow-md space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Guwahati AI Research Lab
                  </span>
                  <h3 className="text-xl font-bold">
                    Explore All AI Research Publications
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access open evaluation metrics, tokenizer benchmarks, acoustic flow-matching loss curves, and model weights.
                  </p>
                </div>
                <div>
                  <a
                    href="https://aiaxom.co.in/research/"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                  >
                    <span>Visit Research Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== INTERACTIVE USE CASES HUB ==================== */}
          <section className="mb-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <span>Specialized Industry &amp; Persona Solutions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
                Explore How Axom AI Powers Every Sector
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Filter by your industry or role to see concrete workflows, verified real-world metrics, and applied production tools.
              </p>
            </div>

            <UseCasesInteractiveHub />
          </section>

          {/* ==================== SOVEREIGN ADVANTAGE COMPARISON MATRIX ==================== */}
          <section className="mb-24 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <span>The Sovereign Advantage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white mb-2">
                Why Axom AI Outperforms Overseas Chatbots for Assam
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Direct capability comparison showing why generic foreign AI models fail at regional linguistic nuance, exam preparation, and data residency.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-emerald-900/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/15 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300">
                    <th className="p-4 sm:p-5 font-bold">Capability Dimension</th>
                    <th className="p-4 sm:p-5 font-black text-emerald-900 dark:text-emerald-400 bg-emerald-500/10 border-x border-emerald-500/20">
                      Axom AI Platform
                    </th>
                    <th className="p-4 sm:p-5 font-semibold text-slate-600 dark:text-slate-400">Generic Overseas AI</th>
                    <th className="p-4 sm:p-5 font-semibold text-slate-600 dark:text-slate-400">Fragmented Manual Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/10 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-950 dark:text-white">Assamese Script &amp; Grammar Purity</td>
                    <td className="p-4 sm:p-5 text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/10 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>99.4% purity via axomai-trans-xetu (no Bengali substitution)</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Frequent Bengali contamination (র/ৰ confusion)</td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Slow manual dictionary lookup</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-950 dark:text-white">Assam GK &amp; APSC Exam Alignment</td>
                    <td className="p-4 sm:p-5 text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/10 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Deep curriculum context (Ahom, Sukapha, Lachit, budget)</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Superficial or hallucinated regional facts</td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Outdated physical guidebooks</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-950 dark:text-white">Integrated Production Tools</td>
                    <td className="p-4 sm:p-5 text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/10 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>33+ tools: FuelCheck, AI Notes, PDF/Word conversion, OCR</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Text-only chat prompt requiring multiple apps</td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Ad-heavy separate online tools</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-950 dark:text-white">Data Sovereignty &amp; Privacy</td>
                    <td className="p-4 sm:p-5 text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/10 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Indian data residency (DPDP Act 2023 compliant)</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Stored on overseas servers under foreign laws</td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Unknown third-party server privacy</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-950 dark:text-white">Domestic Edge Cloud Latency</td>
                    <td className="p-4 sm:p-5 text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-500/5 border-x border-emerald-500/10 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>&lt;0.8s via Indian edge nodes with multi-tier failover</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">2.5s to 4.5s roundtrips to US/EU datacenters</td>
                    <td className="p-4 sm:p-5 text-slate-600 dark:text-slate-400">Variable / High latency</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================== ASSAM REGIONAL AUTHORITY ==================== */}
          <section className="mb-24 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shrink-0">
                <Globe2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
                  <span>{cmsData?.authority_badge || 'Sovereign AI for Assam & Northeast India'}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-white">
                  {cmsData?.authority_title || 'Built in Assam, Serving Millions Worldwide'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {cmsData?.authority_description ||
                    'Headquartered in Guwahati, Assam, Axom AI is committed to building sovereign regional artificial intelligence infrastructure. By developing localized linguistic benchmarks, custom tokenizers, and domestic cloud edge routing, we ensure that technological advancement preserves regional cultural heritage while empowering the next generation of students, civil servants, entrepreneurs, and researchers.'}
                </p>
              </div>
            </div>
          </section>

          {/* ==================== FAQS ==================== */}
          <section className="mb-24">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <span>{cmsData?.faq_badge || 'Questions & Answers'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white mb-2">
                {cmsData?.faq_title || 'Frequently Asked Questions about Axom AI'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
                {cmsData?.faq_subtitle ||
                  'Clear, verified answers about how Axom AI fits your specific daily workflow, academic goals, and organization.'}
              </p>
            </div>

            <UseCasesFaq faqs={faqsList} />
          </section>

          {/* ==================== BOTTOM CTA ==================== */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 shadow-xl">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              <span>{cmsData?.cta_badge || 'Start Today • Sovereign Indian AI'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white mb-4">
              {cmsData?.cta_heading || 'Experience the Impact of Sovereign AI Today'}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-8">
              {cmsData?.cta_subheading ||
                'Join thousands of students, civil service aspirants, business owners, and creators leveraging Axom AI every day.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={cmsData?.cta_primary_btn_url || 'https://chat.aiaxom.co.in/'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
              >
                {cmsData?.cta_primary_btn_text || 'Launch AI Chat Workspace'}
              </a>
              <Link
                href={cmsData?.cta_secondary_btn_url || '/tools'}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/70 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white border border-emerald-900/15 dark:border-white/10 text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <span>{cmsData?.cta_secondary_btn_text || 'Explore All 33+ Tools'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </>
  );
}
