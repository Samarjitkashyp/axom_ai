import React from 'react';
import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getLandingCMS, getAboutCMS } from '../../lib/api';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Building,
  User,
  GraduationCap,
  Briefcase,
  PenTool,
  Code2,
  MapPin,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Languages,
  FileText,
  Layers,
  IndianRupee,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  // Flagship Category Keywords
  'AI companies',
  'Large Language Model',
  'LLM',
  'AI startups',
  'AI company in Assam',
  'AI startup in Assam',
  'Samarjit Kashyap',
  'Samarjit Kashyap Axom AI',
  // Primary SEO Keyword
  'Axom AI',
  // Secondary SEO Keywords
  'Assam AI',
  'Assamese AI',
  'AI platform in Assam',
  'AI platform for Assam',
  'Assamese AI platform',
  'AI assistant for Assamese',
  'Assamese language AI',
  'AI chatbot in Assamese',
  'Assamese AI chatbot',
  'AI tools in Assam',
  'artificial intelligence in Assam',
  'regional AI platform',
  'indigenous AI platform',
  'AI for Northeast India',
  'AI tools for Northeast India',
  // Brand / Entity Keywords
  'What is Axom AI',
  'Axom AI Assam',
  'Axom AI Guwahati',
  'Axom AI platform',
  'Axom AI founder',
  'Axom AI Assamese',
  'AI Axom',
  'Assam AI platform',
  'অসম এআই',
  'অসমীয়া AI',
  'অসমীয়া কৃত্ৰিম বুদ্ধিমত্তা',
  'Axom AI official',
  'Axom AI tools',
  'Axom AI chatbot',
  // AEO Question Keywords (English)
  'What is Axom AI?',
  'What is Axom AI used for?',
  'Who created Axom AI?',
  'Who is the founder of Axom AI?',
  'Where is Axom AI based?',
  'Is Axom AI from Assam?',
  'What makes Axom AI different?',
  'Does Axom AI support Assamese?',
  'Can Axom AI understand Assamese?',
  'Is Axom AI available in English?',
  'What AI tools does Axom AI offer?',
  'Does Axom AI support Assamese language?',
  'Is Axom AI an AI chatbot?',
  'Is Axom AI free?',
  'Who can use Axom AI?',
  'What is Assam AI?',
  'What is Assamese AI?',
  'What is a regional AI platform?',
  'Why was Axom AI created?',
  'How does Axom AI support Assamese users?',
  // Assamese AEO Queries
  'Axom AI কি?',
  'Axom AI কোনে বনাইছে?',
  'Axom AI ক\'ত ভিত্তিক?',
  'Axom AI-য়ে অসমীয়া ভাষা বুজিব পাৰেনে?',
  'Axom AI কি অসমীয়াত উত্তৰ দিব পাৰে?',
  'Axom AI কি বিনামূলীয়া?',
  'Axom AI-ত কি কি AI tools আছে?',
  'অসমীয়া AI chatbot কি?',
  'অসমৰ AI platform কোনটো?',
  'অসমীয়া ভাষাৰ বাবে AI কি আছে?',
  // GEO Keywords (AI Answer Engines)
  'best AI platform for Assamese language',
  'AI platform built for Assam',
  'AI assistant for Assamese users',
  'Assamese language AI assistant',
  'AI chatbot that understands Assamese',
  'AI tools for people in Assam',
  'AI platform for Northeast India',
  'regional language AI platform India',
  'Indian AI platform for regional languages',
  'Assamese generative AI platform',
  'AI platform for Assamese students',
  'AI platform for Assamese businesses',
  'AI tools for Assamese creators',
  'AI assistant for Northeast India',
  'indigenous AI platform in India',
  'AI platform based in Assam',
  // Long-Tail Keywords
  'Assamese AI platform for students',
  'Assamese AI chatbot online',
  'free Assamese AI chatbot',
  'AI assistant for Assamese language',
  'Assamese AI writing assistant',
  'Assamese AI tools online',
  'AI tools for students in Assam',
  'AI tools for businesses in Assam',
  'AI platform for Assamese creators',
  'regional language AI assistant India',
  'AI chatbot for Assamese questions',
  'Assamese artificial intelligence platform',
  'AI platform built in Assam',
  'AI technology company in Assam',
  'indigenous AI platform in Northeast India',
  // Business / Company SEO
  'Axom AI company',
  'Axom AI startup',
  'Axom AI technology company',
  'Axom AI artificial intelligence company',
  'Axom AI Assam startup',
  'AI startup Guwahati',
  'AI company Guwahati',
  'artificial intelligence company Assam',
  'AI technology Assam',
  'AI innovation Assam',
  'AI startups in Assam',
  'AI in Northeast India',
  'regional AI India',
];

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutCMS().catch(() => null);
  const title =
    about?.meta_title ||
    "About Axom AI — Assam's Premier Indigenous AI Platform & LLM Ecosystem | Assam AI";
  const description =
    about?.meta_description ||
    "Discover Axom AI (AI Axom / অসম এআই) — Assam's flagship indigenous Artificial Intelligence platform headquartered in Guwahati. Native Assamese LLMs, OCR tools, founder Samarjit Kashyap, and sovereign AI infrastructure.";
  const canonicalUrl = 'https://aiaxom.co.in/about/';
  const ogImage = about?.og_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';

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
          alt: 'Axom AI — The Power of AI Rooted in Assam',
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
    other: {
      'geo.region': 'IN-AS',
      'geo.placename': 'Guwahati, Assam, India',
      'geo.position': '26.1445;91.7362',
      ICBM: '26.1445, 91.7362',
    },
  };
}

export default async function AboutPage() {
  const [landingData, aboutData] = await Promise.all([
    getLandingCMS().catch(() => ({})),
    getAboutCMS().catch(() => null),
  ]);

  const badgeText = aboutData?.badge_text || "PIONEERING ASSAM'S AI FUTURE";
  const headingPrefix = "Artificial Intelligence in";
  const headingHighlight = aboutData?.main_heading_highlight || "Assam";
  const headingSuffix =
    aboutData?.main_heading_suffix && !aboutData.main_heading_suffix.includes('Pioneering')
      ? aboutData.main_heading_suffix.replace(/^,\s*/, '')
      : "Built for the World";
  const subheadingEn =
    aboutData?.subheading_english ||
    "Axom AI (AI Axom / অসম এআই) is Assam's first indigenous generative artificial intelligence platform — engineered to empower 15 million Assamese speakers with native conversational LLMs, 20+ document utilities, OCR, and regional computing infrastructure.";
  const subheadingAs =
    aboutData?.subheading_assamese ||
    "অসমীয়া ভাষা, সংস্কৃতি আৰু বৌদ্ধিক ঐতিহ্যক কৃত্ৰিম বুদ্ধিমত্তাৰ বিশ্ব মানচিত্ৰত প্ৰতিষ্ঠা কৰাৰ এক ঐতিহাসিক পদক্ষেপ।";

  const ctaPrimaryText = aboutData?.cta_primary_text || "Experience Axom AI Free";
  const ctaPrimaryUrl = aboutData?.cta_primary_url || "https://chat.aiaxom.co.in";

  const entityTitle = aboutData?.entity_title || "What is Axom AI? (Assam AI Definition & Overview)";
  const entityDef =
    aboutData?.entity_definition ||
    "Axom AI (stylized as AI Axom, Assamese: অসম এআই) is Assam's flagship indigenous artificial intelligence platform headquartered in Guwahati, Assam, India. Founded and architected by researcher Samarjit Kashyap, the platform delivers native Assamese Large Language Model (LLM) computing, document OCR, generative image synthesis, and real-time Assamese search synthesis for individuals, students, creators, and enterprises across Northeast India.";

  const factEntityName = aboutData?.fact_entity_name || "Axom AI (AI Axom / Assam AI / অসম এআই)";
  const factOfficialUrl = aboutData?.fact_official_url || "https://aiaxom.co.in";
  const factHeadquarters =
    aboutData?.fact_headquarters ||
    "Guwahati, Assam, India (PIN: 781001, Geo: 26.1445° N, 91.7362° E)";
  const factFounder = aboutData?.fact_founder || "Samarjit Kashyap (Lead Architect & Founder)";
  const factLanguages = aboutData?.fact_languages || "Assamese (অসমীয়া), English, Indic Transliterations, Hindi";
  const factCoverage =
    aboutData?.fact_coverage ||
    "Assam (all 35 districts), Northeast India, Pan-India, Global Assamese Diaspora";

  const whyBadge = aboutData?.why_badge || "The Linguistic Divide";
  const whyTitle = aboutData?.why_title || "Why Does Assam Need an Independent AI Platform?";
  const whySubheading =
    aboutData?.why_subheading ||
    "Generic global AI models treated Assamese as an afterthought, mixing Bengali characters, missing cultural nuances, and locking regional users behind expensive foreign dollar billing.";

  const whyCard1Title = aboutData?.why_card_1_title || "Eliminating Script Errors (99.4% Accuracy)";
  const whyCard1Desc =
    aboutData?.why_card_1_desc ||
    "Global LLMs frequently confuse Bengali and Assamese alphabets (replacing authentic ‘ৰ’ and ‘ৱ’ with Bengali letters). Axom AI guarantees grammatically authentic Assamese script.";
  const whyCard2Title = aboutData?.why_card_2_title || "Deep Cultural & Historical Context";
  const whyCard2Desc =
    aboutData?.why_card_2_desc ||
    "From the Ahom dynasty and Lachit Borphukan to Srimanta Sankardev, Rongali Bihu, and modern Assam governance, Axom AI understands regional context without hallucinations.";
  const whyCard3Title = aboutData?.why_card_3_title || "Accessible in INR with Instant UPI";
  const whyCard3Desc =
    aboutData?.why_card_3_desc ||
    "Free tier available for all with 5,000 words/mo, and power tiers starting at ₹199 with native UPI (Google Pay, PhonePe, Paytm, BHIM) checkout via Razorpay.";

  const founderBadge = aboutData?.founder_badge || "Leadership & Vision";
  const founderName = aboutData?.founder_name || "Samarjit Kashyap";
  const founderTitle = aboutData?.founder_title || "Founder & Lead AI Architect";
  const founderQuoteTitle = aboutData?.founder_quote_title || "Building Assam as Northeast India's AI Capital";
  const founderQuote =
    aboutData?.founder_quote ||
    '"For decades, regional languages of Northeast India were left behind in the digital technology wave. Axom AI was founded with a singular conviction: our language, literature, and youth deserve world-class artificial intelligence tools that understand them natively. We are creating an ecosystem where anyone in Assam can converse with state-of-the-art intelligence in their mother tongue."';
  const founderEmail =
    aboutData?.founder_email && !aboutData.founder_email.includes('gmail.com')
      ? aboutData.founder_email
      : "samarjitkashyp@aiaxom.co.in";

  // Benchmarks list for modern grid layout
  const BENCHMARKS = [
    {
      id: 'script',
      title: 'Assamese Script Accuracy',
      category: 'Linguistic Precision',
      icon: Languages,
      axom: '99.4% Authentic Assamese (Zero Bengali replacement; authentic ‘ৰ’ and ‘ৱ’ characters guaranteed)',
      chatgpt: 'Moderate (frequently substitutes Bengali ‘র’)',
      gemini: 'Moderate (mixes Bengali & Assamese orthography)',
    },
    {
      id: 'culture',
      title: 'Assam Cultural & Historical Depth',
      category: 'Regional Grounding',
      icon: Building,
      axom: 'Deep Cultural Heritage & Grounding (Ahom dynasty, Lachit Borphukan, Sankardev & Bihu traditions)',
      chatgpt: 'Low (generic web summaries, prone to hallucination)',
      gemini: 'Medium (search-dependent, lacks local nuances)',
    },
    {
      id: 'ocr',
      title: 'Assamese Scanned Document OCR',
      category: 'Vision & Document AI',
      icon: FileText,
      axom: 'Built-in Assamese & English OCR (extracts printed and scanned text from regional PDFs and images)',
      chatgpt: 'Poor (unsupported on regional Assamese text)',
      gemini: 'Limited (struggles with complex Assamese conjuncts)',
    },
    {
      id: 'pricing',
      title: 'Pricing Currency & Instant UPI',
      category: 'Affordability & Access',
      icon: IndianRupee,
      axom: '₹0 Free / Starts ₹199 (Native UPI: GPay, PhonePe, Paytm, RuPay; zero forex charges)',
      chatgpt: '~$20 USD/mo (₹1,999+ with mandatory credit card & 3.5% forex)',
      gemini: '₹1,950/mo (Credit card only, no grassroots UPI tier)',
    },
    {
      id: 'tools',
      title: 'Integrated 20+ AI & File Utilities',
      category: 'Productivity Ecosystem',
      icon: Layers,
      axom: '20+ Native Document Utilities (AI Notes, PDF to Word, image studio, transcribers, study packs)',
      chatgpt: 'None built-in (requires 3rd-party tools/plugins)',
      gemini: 'None built-in (requires Google Workspace integration)',
    },
    {
      id: 'sovereignty',
      title: 'Data Sovereignty & Privacy',
      category: 'Data Protection & DPDP',
      icon: ShieldCheck,
      axom: '100% Indian Data Residency (Compliant with India DPDP Act 2023; user data never sold or exported)',
      chatgpt: 'US-hosted servers (subject to foreign jurisdiction)',
      gemini: 'Global cloud clusters (data distributed internationally)',
    },
  ];

  // Multi-entity JSON-LD for Search Engines & Generative AI Models (GEO/AEO)
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aiaxom.co.in/#organization',
        name: 'Axom AI',
        legalName: 'Axom AI Technologies',
        alternateName: ['AI Axom', 'Assam AI', 'অসম এআই', 'AxomAI'],
        url: 'https://aiaxom.co.in',
        logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        image: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        description: entityDef,
        foundingDate: '2024',
        foundingLocation: {
          '@type': 'Place',
          name: factHeadquarters,
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
          '@id': 'https://aiaxom.co.in/about/#founder',
          name: founderName,
          jobTitle: founderTitle,
          email: 'mailto:samarjitkashyp@aiaxom.co.in',
          url: 'https://aiaxom.co.in/about/',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'samarjitkashyp@aiaxom.co.in',
          availableLanguage: ['Assamese', 'English', 'Hindi'],
        },
        knowsLanguage: ['as', 'en', 'hi'],
        knowsAbout: [
          'Axom AI',
          'Assam AI',
          'Assamese AI',
          'Artificial Intelligence in Assam',
          'AI companies',
          'Large Language Model',
          'LLM in Assam',
          'Assamese Natural Language Processing',
          'Assam AI Models',
          'Regional Large Language Models',
          'Assamese OCR and Document Intelligence',
          'Sovereign AI India',
          'Samarjit Kashyap',
        ],
      },
      {
        '@type': 'Person',
        '@id': 'https://aiaxom.co.in/about/#founder',
        name: founderName,
        jobTitle: founderTitle,
        email: 'mailto:samarjitkashyp@aiaxom.co.in',
        worksFor: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
        url: 'https://aiaxom.co.in/about/',
        description:
          'Founder & Lead AI Architect of Axom AI, architecting Assam\'s premier indigenous Artificial Intelligence and regional language computing ecosystem.',
        sameAs: [
          'https://aiaxom.co.in',
          'https://aiaxom.co.in/about',
          'https://github.com/Samarjitkashyp',
        ],
      },
      {
        '@type': 'AboutPage',
        '@id': 'https://aiaxom.co.in/about/#webpage',
        url: 'https://aiaxom.co.in/about/',
        name: "About Axom AI — Assam's Premier Indigenous AI Platform & LLM Ecosystem",
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://aiaxom.co.in/#website',
          name: 'Axom AI',
          url: 'https://aiaxom.co.in',
        },
        mainEntity: {
          '@id': 'https://aiaxom.co.in/#organization',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://aiaxom.co.in/about/#breadcrumb',
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
            name: 'About',
            item: 'https://aiaxom.co.in/about/',
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] dark:bg-[#070d18] text-emerald-950 dark:text-[#e5e7eb] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Global Header */}
      <Header header={landingData?.header} />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Ambient Subtle Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-25 pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[130px] top-12 left-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px] top-96 right-0 pointer-events-none" />

        {/* HERO HEADER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-6 uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-emerald-950 dark:text-white mb-6 leading-[1.12]">
            {headingPrefix}{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
              {headingHighlight}
            </span>
            {headingSuffix ? (
              <>
                <br className="hidden sm:inline" />
                {' '}{headingSuffix}
              </>
            ) : null}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed font-normal">
            {subheadingEn}
          </p>

          <p className="font-assamese text-base sm:text-lg text-emerald-800/90 dark:text-emerald-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {subheadingAs}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={ctaPrimaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-xl shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ctaPrimaryText}</span>
            </a>
            <a
              href="#factsheet"
              className="px-7 py-3.5 rounded-full bg-white/80 dark:bg-white/5 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/30 text-slate-700 dark:text-gray-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10 text-sm sm:text-base inline-flex items-center gap-2 transition"
            >
              <span>Explore Entity Factsheet</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* GEO & AEO ENTITY PROFILE & KNOWLEDGE CARD */}
        <section id="factsheet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-28 relative z-10">
          <div className="p-6 sm:p-10 rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-50/70 dark:from-emerald-950/20 via-teal-50/40 dark:via-teal-950/15 to-white/90 dark:to-slate-900/80 backdrop-blur-xl shadow-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">
              {entityTitle}
            </h2>

            {/* Direct Answer Paragraph for AI Answer Engines */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/5 dark:bg-black/40 border border-emerald-500/20 mb-6 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <strong className="text-emerald-950 dark:text-white block mb-1">
                Authoritative Definition:
              </strong>
              {entityDef}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-emerald-900/15 dark:border-white/10 bg-white/80 dark:bg-black/50">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-gray-300">
                <tbody className="divide-y divide-emerald-900/10 dark:divide-white/5">
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300 w-1/3 sm:w-1/4">
                      Entity / Platform Name
                    </th>
                    <td className="px-5 py-3.5 text-emerald-950 dark:text-white font-medium">
                      {factEntityName}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Official Web Domain
                    </th>
                    <td className="px-5 py-3.5 text-emerald-950 dark:text-white">
                      <a
                        href={factOfficialUrl}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline font-medium"
                      >
                        {factOfficialUrl}
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Headquarters &amp; Location
                    </th>
                    <td className="px-5 py-3.5 text-emerald-950 dark:text-white font-medium flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>{factHeadquarters}</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Founder &amp; Lead Architect
                    </th>
                    <td className="px-5 py-3.5 text-emerald-950 dark:text-white font-semibold">
                      {factFounder}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Supported Languages
                    </th>
                    <td className="px-5 py-3.5 text-emerald-950 dark:text-white">
                      {factLanguages}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Target Coverage Area
                    </th>
                    <td className="px-5 py-3.5 text-emerald-950 dark:text-white">
                      {factCoverage}
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-emerald-800 dark:text-emerald-300">
                      Data Compliance
                    </th>
                    <td className="px-5 py-3.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      India Digital Personal Data Protection (DPDP) Act 2023 Compliant • Indian Data Residency
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* WHY ASSAM NEEDS ITS OWN AI */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-widest mb-3">
              <span>{whyBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">
              {whyTitle}
            </h2>
            <p className="text-slate-700 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {whySubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                {whyCard1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                {whyCard1Desc}
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-teal-500/40 transition shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-5">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                {whyCard2Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                {whyCard2Desc}
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-emerald-900/15 dark:border-white/10 hover:border-cyan-500/40 transition shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-2">
                {whyCard3Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                {whyCard3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* AUDIENCE IMPACT IN ASSAM: 2 CARDS PER ROW ON DESKTOP */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest mb-3">
              <span>Who Is Axom AI Built For?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">
              Empowering Every Corner of Assam&apos;s Society
            </h2>
            <p className="text-slate-700 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              From academic classrooms in Dibrugarh and Guwahati to tea garden estates and tech enterprises, Axom AI provides practical, everyday AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* 1. Students & Job Aspirants */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
                    APSC &amp; Competitive Prep
                  </span>
                </div>
                <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2">
                  Students &amp; Job Aspirants
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-6">
                  Prepares candidates for APSC, UPSC, Assam Police, and university exams with bilingual Assamese explanations, essay drafting, and rapid note summarization.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>APSC, UPSC &amp; Assam State Board syllabus-aligned answers</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant study notes, flashcards &amp; chapter quizzes in Assamese</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Scanned PDF textbook question-answering with regional OCR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Businesses & MSMEs */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-teal-500/5 group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Briefcase size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 border border-teal-500/25 text-teal-800 dark:text-teal-300">
                    Commercial Automation
                  </span>
                </div>
                <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2">
                  Businesses &amp; MSMEs
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-6">
                  Enables local shops, startups, and enterprises to draft customer emails, translate commercial tenders, and automate bilingual communications.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>Bilingual customer correspondence, RFPs &amp; tender proposals</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>Commercial tender &amp; legal agreement translation (Assamese ↔ English)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>Automated customer WhatsApp &amp; multilingual support responses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Writers & Content Creators */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <PenTool size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-800 dark:text-cyan-300">
                    High-Fidelity Content
                  </span>
                </div>
                <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2">
                  Writers &amp; Content Creators
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-6">
                  Assists regional journalists, YouTubers, and novelists in drafting Assamese scripts, proofreading grammar, and generating cultural imagery.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>Pure Assamese script grammar without Bengali character confusion</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>YouTube video scripts, journalism research &amp; narrative writing</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>Cultural concept imagery, thumbnails &amp; AI illustration generation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Developers & Researchers */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Code2 size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
                    REST APIs &amp; Endpoints
                  </span>
                </div>
                <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2">
                  Developers &amp; Researchers
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-6">
                  Provides high-speed REST API endpoints, code generation in Python/JS, and enterprise document intelligence for regional Indian applications.
                </p>
                <div className="space-y-2.5 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Ultra-low latency regional LLM endpoints &amp; JSON completion</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Python, JavaScript, Node.js &amp; cURL client integrations</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Enterprise document intelligence &amp; semantic search pipelines</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITY BENCHMARK: MODERN RESPONSIVE GRID FORMAT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest mb-3">
              <span>Capability Benchmark</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">
              Axom AI vs Generic Global AI Models
            </h2>
            <p className="text-slate-700 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              How Axom AI compares against OpenAI ChatGPT and Google Gemini when addressing Assamese language, regional context, and Indian payment methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENCHMARKS.map((b) => {
              const IconComp = b.icon;
              return (
                <div
                  key={b.id}
                  className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-emerald-900/15 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconComp size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-emerald-950 dark:text-white leading-tight">
                          {b.title}
                        </h3>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          {b.category}
                        </span>
                      </div>
                    </div>

                    {/* Axom AI Result (Winner Card) */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 mb-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Axom AI (Assam AI)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                          Winner ★
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-100 leading-snug">
                        {b.axom}
                      </p>
                    </div>

                    {/* Competitor Comparisons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-900/10 dark:border-white/5 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 flex flex-col justify-between">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1">
                          ChatGPT
                        </div>
                        <div className="text-slate-700 dark:text-gray-300 leading-snug">
                          {b.chatgpt}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 flex flex-col justify-between">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-gray-400 mb-1">
                          Google Gemini
                        </div>
                        <div className="text-slate-700 dark:text-gray-300 leading-snug">
                          {b.gemini}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FOUNDER & LEADERSHIP STORY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50/70 dark:from-emerald-950/25 via-teal-50/40 dark:via-teal-950/15 to-white/90 dark:to-slate-900/80 border border-emerald-500/25 flex flex-col md:flex-row items-center gap-8 shadow-xl backdrop-blur-sm">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#f0fdf4] dark:bg-[#0b1220] border-2 border-emerald-500/30 flex flex-col items-center justify-center text-center p-3 shrink-0 shadow-md">
              <User className="w-10 h-10 text-emerald-700 dark:text-emerald-400 mb-1" />
              <div className="text-xs font-black text-emerald-950 dark:text-white">
                {founderName}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                {founderTitle}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
                {founderBadge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-white tracking-tight mb-3">
                {founderQuoteTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed mb-4 italic">
                {founderQuote}
              </p>
              <div className="text-xs text-slate-600 dark:text-gray-400 pt-2 border-t border-emerald-900/10 dark:border-white/5 flex flex-wrap items-center gap-4">
                <span>
                  <strong className="text-emerald-950 dark:text-white">{founderName}</strong> — Founder &amp; Architect, Axom AI
                </span>
                <span>•</span>
                <a
                  href={`mailto:${founderEmail}`}
                  className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition"
                >
                  {founderEmail}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
