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

          {/* ==================== SOVEREIGN ADVANTAGE COMPARISON BENTO GRID ==================== */}
          <section className="mb-24 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <span>The Sovereign Advantage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white mb-3 tracking-tight">
                Why Axom AI Outperforms Overseas Chatbots for Assam
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Direct capability comparison showing why generic foreign AI models fail at regional linguistic nuance, exam preparation, and data residency.
              </p>
            </div>

            {/* Strategic Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

              {/* Bento Card 1: Linguistic Precision (Col Span 7 on desktop) */}
              <div className="md:col-span-2 lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                      Linguistic Precision
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      99.4% Script Purity
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white mb-2">
                    Assamese Script &amp; Grammatical Purity
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Eliminates Bengali script overlap (correcting Bengali &lsquo;র&rsquo; contamination into authentic Assamese &lsquo;ৰ&rsquo; and &lsquo;ৱ&rsquo;). Preserves authentic grammatical cases (vibhakti) and classical literary syntax across 6.19 million cultural training tokens.
                  </p>

                  {/* Axom AI Advantage */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 mb-3.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Axom AI Platform</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      99.4% pure script precision powered by axomai-trans-xetu with a custom 68,096-token Assamese vocabulary. Zero Bengali substitution, correct conjuncts (যুক্তাক্ষৰ), and flawless sentence flow.
                    </p>
                  </div>

                  {/* Overseas Chatbots Limitation */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Generic Overseas AI (ChatGPT / Gemini / Claude)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Frequent Bengali script substitution (confusing র and ৰ), word-splitting due to fragmented sub-word tokenizers, and garbled literary phrasing.
                    </p>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Slow manual dictionary lookups and inconsistent unverified web transliteration widgets.</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
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

              {/* Bento Card 2: Edge Cloud Latency (Col Span 5 on desktop) */}
              <div className="md:col-span-2 lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25">
                      Edge Performance
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      &lt;0.8s Latency
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white mb-2">
                    Domestic Edge Cloud Latency
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Multi-tiered inference routed across domestic Indian edge points with automatic failover to prevent downtime or transatlantic latency spikes.
                  </p>

                  {/* Axom AI Advantage */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 mb-3.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Axom AI Platform</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      Sub-second response delivery (&lt;0.8s) via local nodes. Multi-tier cascade (Tier 1 flagship, Tier 2 fast fallback, Tier 3 safety net) delivers 99.9% uptime.
                    </p>
                  </div>

                  {/* Overseas Chatbots Limitation */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Generic Overseas AI</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      2.5s to 4.5s latency roundtrips to US/EU datacenters; frequent peak-hour throttling and overseas outages.
                    </p>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Variable speeds, ad blockers interference, and frequent server timeouts.</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
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

              {/* Bento Card 3: Assam GK & Civil Services (Col Span 4 on desktop) */}
              <div className="md:col-span-1 lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                      Exam &amp; Syllabus
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      APSC / SEBA
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white mb-2">
                    Assam GK &amp; APSC Alignment
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Pre-trained on Assam civil services, Ahom history, regional geography, state acts, and budgetary data with zero hallucination.
                  </p>

                  {/* Axom AI Advantage */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 mb-3.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Axom AI Platform</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      Deep state curriculum context (Ahom dynasty, Sukapha, Lachit Borphukan, regional geography, state budget, and APSC exam points).
                    </p>
                  </div>

                  {/* Overseas Chatbots Limitation */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Generic Overseas AI</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Superficial, generic summaries; routinely hallucinates state facts, dates, and historical figures.
                    </p>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Outdated static paper guidebooks with no dynamic notes or interactive doubt solving.</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
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

              {/* Bento Card 4: 33+ Integrated Production Tools (Col Span 4 on desktop) */}
              <div className="md:col-span-1 lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/25">
                      Tool Ecosystem
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      33+ Built-in Tools
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white mb-2">
                    Integrated Production Tools
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    A unified sovereign software suite combining verified vehicular compliance, academic generators, and document processing.
                  </p>

                  {/* Axom AI Advantage */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 mb-3.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Axom AI Platform</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      33+ purpose-built tools: Axom FuelCheck (E5–E100), AI Notes Generator with .docx export, Scanned Jamabandi OCR, and full PDF/Word suite.
                    </p>
                  </div>

                  {/* Overseas Chatbots Limitation */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Generic Overseas AI</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Single text-only chat prompt window with zero native Word (.docx) export and no automotive or land-record engines.
                    </p>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Ad-heavy separate online tools with file caps and multiple paid accounts required.</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
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

              {/* Bento Card 5: Data Sovereignty & DPDP Act 2023 (Col Span 4 on desktop, Col Span 2 on md) */}
              <div className="md:col-span-2 lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 border border-emerald-900/15 dark:border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/25">
                      Data Residency &amp; Privacy
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      DPDP Act 2023
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white mb-2">
                    100% Indian Data Sovereignty
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Zero overseas data transit. Prompts, documents, and student records are processed in isolated transient memory within India.
                  </p>

                  {/* Axom AI Advantage */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 mb-3.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Axom AI Platform</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      100% Indian cloud residency complying strictly with the Digital Personal Data Protection Act (DPDP Act 2023). Zero user prompt mining.
                    </p>
                  </div>

                  {/* Overseas Chatbots Limitation */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Generic Overseas AI</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Stored and processed on overseas US/EU server farms subject to foreign surveillance and cloud data requests.
                    </p>
                  </div>

                  {/* Legacy Alternative */}
                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Fragmented Manual Tools:</span>
                    <span>Unknown third-party server privacy, silent document retention, and unencrypted uploads.</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
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


        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </>
  );
}
