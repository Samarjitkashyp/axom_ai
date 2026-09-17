import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AboutFaq from '../../components/AboutFaq';
import { ABOUT_FAQS } from '../../components/aboutFaqsData';
import { getLandingCMS, getAboutCMS } from '../../lib/api';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Globe,
  FileText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  HelpCircle,
  Building,
  User,
  ExternalLink,
  GraduationCap,
  Briefcase,
  PenTool,
  Code2,
  Check,
  Languages,
  MapPin,
  Cpu,
  Scale
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
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
  'AI company in Assam',
  'AI startup in Assam',
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
  'AI startup based in Assam',
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
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

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
  };
}

export default async function AboutPage() {
  const [landingData, aboutData] = await Promise.all([
    getLandingCMS().catch(() => ({})),
    getAboutCMS().catch(() => null),
  ]);

  const badgeText = aboutData?.badge_text || "অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • PIONEERING ASSAM'S AI FUTURE";
  const headingPrefix = aboutData?.main_heading_prefix || "Pioneering Artificial Intelligence in";
  const headingHighlight = aboutData?.main_heading_highlight || "Assam";
  const headingSuffix = aboutData?.main_heading_suffix || ", Built for the World.";
  const subheadingEn =
    aboutData?.subheading_english ||
    "Axom AI (AI Axom / অসম এআই) is Assam's first indigenous generative artificial intelligence platform — engineered to empower 15 million Assamese speakers with native conversational LLMs, 20+ document utilities, OCR, and regional computing infrastructure.";
  const subheadingAs =
    aboutData?.subheading_assamese ||
    "অসমীয়া ভাষা, সংস্কৃতি আৰু বৌদ্ধিক ঐতিহ্যক কৃত্ৰিম বুদ্ধিমত্তাৰ বিশ্ব মানচিত্ৰত প্ৰতিষ্ঠা কৰাৰ এক ঐতিহাসিক পদক্ষেপ।";

  const stat1Val = aboutData?.stat_1_val || "15M+";
  const stat1Label = aboutData?.stat_1_label || "Assamese Speakers Empowered";
  const stat2Val = aboutData?.stat_2_val || "25K+";
  const stat2Label = aboutData?.stat_2_label || "Assamese Knowledge Chunks";
  const stat3Val = aboutData?.stat_3_val || "<0.8s";
  const stat3Label = aboutData?.stat_3_label || "Ultra-Fast TTFB Latency";
  const stat4Val = aboutData?.stat_4_val || "100%";
  const stat4Label = aboutData?.stat_4_label || "Indigenous Regional LLM";

  const ctaPrimaryText = aboutData?.cta_primary_text || "Experience Axom AI Free";
  const ctaPrimaryUrl = aboutData?.cta_primary_url || "https://chat.aiaxom.co.in";

  const entityBadge = aboutData?.entity_badge || "Generative Engine Citation & Entity Profile (GEO Factsheet)";
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
  const factArchitecture =
    aboutData?.fact_architecture ||
    "RAG over 25,000+ Assamese Wikipedia & historical articles, Groq LPU inference, IndicTrans2, Cloudflare FLUX & Gemini fallback";
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
  const founderEmail = aboutData?.founder_email || "support@aiaxom.co.in";

  const ctaBadge = aboutData?.cta_badge || "Experience the Future Today";
  const ctaTitle = aboutData?.cta_title || "Be Part of Assam's AI Revolution";
  const ctaDesc =
    aboutData?.cta_desc ||
    "Join thousands of students, researchers, lawyers, creators, and businesses across Assam who are chatting, researching, creating, and automating with Axom AI.";
  const ctaBtnText = aboutData?.cta_btn_text || "Start Free Chatting";
  const ctaBtnUrl = aboutData?.cta_btn_url || "https://chat.aiaxom.co.in";

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
          name: founderName,
          jobTitle: founderTitle,
          url: 'https://aiaxom.co.in/about',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'support@aiaxom.co.in',
          availableLanguage: ['Assamese', 'English', 'Hindi'],
        },
        knowsLanguage: ['as', 'en', 'hi'],
        knowsAbout: [
          'Axom AI',
          'Assam AI',
          'Assamese AI',
          'Artificial Intelligence in Assam',
          'Assamese Natural Language Processing',
          'Assam AI Models',
          'Regional Large Language Models',
          'Assamese OCR and Document Intelligence',
          'Sovereign AI India',
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
      {
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/about/#faq',
        mainEntity: ABOUT_FAQS.map((faq) => ({
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
    <div className="min-h-screen flex flex-col bg-[#05060c] text-[#e5e7eb] selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Global Navbar */}
      <Navbar header={landingData?.header} />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(192,132,252,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(192,132,252,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-25 pointer-events-none" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[130px] top-12 left-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] top-96 right-0 pointer-events-none" />

        {/* HERO HEADER (Breadcrumb removed as requested) */}
        <section className="max-w-6xl mx-auto px-5 pt-8 sm:pt-12 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-xs font-semibold text-fuchsia-300 mb-6 uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.12]">
            {headingPrefix}{' '}
            <span className="bg-gradient-to-r from-white via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
              {headingHighlight}
            </span>
            {headingSuffix ? (
              <>
                <br className="hidden sm:inline" />
                {headingSuffix}
              </>
            ) : null}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed font-normal">
            {subheadingEn}
          </p>

          <p className="font-assamese text-base sm:text-lg text-fuchsia-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {subheadingAs}
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto mb-10 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{stat1Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat1Label}</div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-fuchsia-400 mb-1">{stat2Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat2Label}</div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 mb-1">{stat3Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat3Label}</div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-pink-400 mb-1">{stat4Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat4Label}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={ctaPrimaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-xl shadow-fuchsia-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ctaPrimaryText}</span>
            </a>
            <a
              href="#factsheet"
              className="px-7 py-3.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white hover:bg-white/10 text-sm sm:text-base inline-flex items-center gap-2 transition"
            >
              <span>Explore Entity Factsheet</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* GEO & AEO ENTITY PROFILE & KNOWLEDGE CARD */}
        <section id="factsheet" className="max-w-5xl mx-auto px-5 mb-24 scroll-mt-28 relative z-10">
          <div className="p-6 sm:p-10 rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 via-purple-950/20 to-black/90 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-3">
              <Globe className="w-4 h-4" />
              <span>{entityBadge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              {entityTitle}
            </h2>

            {/* Direct Answer Paragraph for AI Answer Engines */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-fuchsia-500/20 mb-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-white block mb-1">Authoritative Definition:</strong>
              {entityDef}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/50">
              <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300 w-1/3">Entity / Platform Name</th>
                    <td className="px-5 py-3.5 text-white font-medium">{factEntityName}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Official Web Domain</th>
                    <td className="px-5 py-3.5 text-white">
                      <a href={factOfficialUrl} className="text-fuchsia-400 hover:text-fuchsia-300 underline font-medium">
                        {factOfficialUrl}
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Headquarters &amp; Location</th>
                    <td className="px-5 py-3.5 text-white font-medium flex items-center gap-1.5">
                      <MapPin size={14} className="text-fuchsia-400 shrink-0" />
                      <span>{factHeadquarters}</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Founder &amp; Lead Architect</th>
                    <td className="px-5 py-3.5 text-white font-semibold">{factFounder}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Supported Languages</th>
                    <td className="px-5 py-3.5 text-white">{factLanguages}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Core AI Architecture</th>
                    <td className="px-5 py-3.5 text-slate-300 leading-relaxed">{factArchitecture}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Target Coverage Area</th>
                    <td className="px-5 py-3.5 text-white">{factCoverage}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition">
                    <th className="px-5 py-3.5 font-bold text-fuchsia-300">Data Compliance</th>
                    <td className="px-5 py-3.5 text-emerald-400 font-medium">
                      India Digital Personal Data Protection (DPDP) Act 2023 Compliant • Indian Data Residency
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* WHY ASSAM NEEDS ITS OWN AI */}
        <section className="max-w-5xl mx-auto px-5 mb-24 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-3">
              <span>{whyBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              {whyTitle}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {whySubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-fuchsia-500/40 transition">
              <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{whyCard1Title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {whyCard1Desc}
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 transition">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{whyCard2Title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {whyCard2Desc}
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-pink-500/40 transition">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{whyCard3Title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {whyCard3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* AUDIENCE IMPACT IN ASSAM: STUDENTS, BUSINESSES, CREATORS, DEVELOPERS */}
        <section className="max-w-6xl mx-auto px-5 mb-24 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-[11px] font-bold text-fuchsia-300 uppercase tracking-widest mb-3">
              <span>Who Is Axom AI Built For?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Empowering Every Corner of Assam&apos;s Society
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              From academic classrooms in Dibrugarh and Guwahati to tea garden estates and tech enterprises, Axom AI provides practical, everyday AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-fuchsia-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center mb-4">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Students &amp; Job Aspirants</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Prepares candidates for APSC, UPSC, Assam Police, and university exams with bilingual Assamese explanations, essay drafting, and rapid note summarization.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-fuchsia-400">
                • APSC &amp; Competitive Exam Prep
              </div>
            </div>

            {/* Businesses */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Businesses &amp; MSMEs</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Enables local shops, startups, and enterprises to draft customer emails, translate commercial tenders, and automate bilingual communications.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-purple-400">
                • Bilingual Business Automation
              </div>
            </div>

            {/* Creators */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-pink-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4">
                  <PenTool size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Writers &amp; Content Creators</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Assists regional journalists, YouTubers, and novelists in drafting Assamese scripts, proofreading grammar, and generating cultural imagery.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-pink-400">
                • High-Fidelity Assamese Writing
              </div>
            </div>

            {/* Developers */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <Code2 size={20} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Developers &amp; Researchers</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Provides high-speed REST API endpoints, code generation in Python/JS, and RAG knowledge base indexing for regional Indian apps.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-400">
                • REST APIs &amp; Indian LLM Inference
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: AXOM AI VS CHATGPT VS GEMINI */}
        <section className="max-w-5xl mx-auto px-5 mb-24 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-3">
              <span>Capability Benchmark</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Axom AI vs Generic Global AI Models
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              How Axom AI compares against OpenAI ChatGPT and Google Gemini when addressing Assamese language, regional context, and Indian payment methods.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-md">
            <table className="w-full text-left text-xs sm:text-sm text-gray-300">
              <thead className="bg-slate-950/80 text-white font-bold border-b border-white/10">
                <tr>
                  <th className="p-4 sm:p-5 w-2/5">Evaluation Metric</th>
                  <th className="p-4 sm:p-5 text-fuchsia-400 font-black bg-fuchsia-500/10 border-x border-fuchsia-500/20">
                    Axom AI (Assam AI) ★
                  </th>
                  <th className="p-4 sm:p-5 text-gray-400">Standard ChatGPT</th>
                  <th className="p-4 sm:p-5 text-gray-400">Google Gemini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-4 sm:p-5 font-semibold text-white">Assamese Script Accuracy</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold bg-fuchsia-500/5 border-x border-fuchsia-500/20">
                    99.4% Authentic Assamese (Zero Bengali replacement)
                  </td>
                  <td className="p-4 sm:p-5 text-amber-400">Moderate (frequently uses Bengali ‘র’)</td>
                  <td className="p-4 sm:p-5 text-amber-400">Moderate (mixes script grammar)</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-4 sm:p-5 font-semibold text-white">Assam Cultural &amp; Historical Depth</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold bg-fuchsia-500/5 border-x border-fuchsia-500/20">
                    25K+ Local Curated Knowledge Articles
                  </td>
                  <td className="p-4 sm:p-5 text-red-400">Low (Generic web summaries)</td>
                  <td className="p-4 sm:p-5 text-amber-400">Medium (Search-dependent)</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-4 sm:p-5 font-semibold text-white">Assamese Scanned Document OCR</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold bg-fuchsia-500/5 border-x border-fuchsia-500/20">
                    Built-in Assamese &amp; English OCR
                  </td>
                  <td className="p-4 sm:p-5 text-red-400">Poor on regional scripts</td>
                  <td className="p-4 sm:p-5 text-amber-400">Limited Assamese OCR</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-4 sm:p-5 font-semibold text-white">Pricing Currency &amp; UPI Support</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold bg-fuchsia-500/5 border-x border-fuchsia-500/20">
                    ₹0 Free / Starts ₹199 (Direct UPI &amp; RuPay)
                  </td>
                  <td className="p-4 sm:p-5 text-red-400">~$20 USD (₹1,999/mo + Forex Fees)</td>
                  <td className="p-4 sm:p-5 text-red-400">₹1,950/mo (Credit card only)</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-4 sm:p-5 font-semibold text-white">Integrated File Tools</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold bg-fuchsia-500/5 border-x border-fuchsia-500/20">
                    20+ PDF, Word, &amp; Image Converters
                  </td>
                  <td className="p-4 sm:p-5 text-red-400">None built-in</td>
                  <td className="p-4 sm:p-5 text-red-400">None built-in</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FOUNDER & LEADERSHIP STORY */}
        <section className="max-w-4xl mx-auto px-5 mb-24 relative z-10">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-fuchsia-950/40 via-purple-950/20 to-black/80 border border-fuchsia-500/30 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#0d0c18] border-2 border-fuchsia-500/40 flex flex-col items-center justify-center text-center p-3 shrink-0 shadow-lg">
              <User className="w-10 h-10 text-fuchsia-400 mb-1" />
              <div className="text-xs font-black text-white">{founderName}</div>
              <div className="text-[10px] text-fuchsia-300 font-medium">{founderTitle}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-2">
                {founderBadge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                {founderQuoteTitle}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 italic">
                {founderQuote}
              </p>
              <div className="text-xs text-gray-400 pt-2 border-t border-white/5 flex flex-wrap items-center gap-4">
                <span>
                  <strong className="text-white">{founderName}</strong> — Founder &amp; Architect, Axom AI
                </span>
                <span>•</span>
                <a
                  href={`mailto:${founderEmail}`}
                  className="text-fuchsia-400 hover:text-fuchsia-300 font-medium transition"
                >
                  {founderEmail}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* AEO & FAQ SECTION (Bilingual Accordion) */}
        <section className="max-w-4xl mx-auto px-5 mb-24 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle size={14} /> Entity FAQ &amp; AEO Queries
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Frequently Asked Questions About Axom AI
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Clear, authentic answers about our mission, technology, founder, script accuracy, and local impact in Assam.
            </p>
          </div>

          <AboutFaq />
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="max-w-5xl mx-auto px-5 relative z-10">
          <div className="p-8 sm:p-14 rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 via-purple-950/30 to-black/80 backdrop-blur-xl text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-[11px] font-bold text-fuchsia-300 uppercase tracking-widest mb-3">
                <span>{ctaBadge}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                {ctaTitle}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 mb-8 leading-relaxed">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={ctaBtnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-xl shadow-fuchsia-500/30 transition transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{ctaBtnText}</span>
                </a>
                <Link
                  href="/pricing"
                  className="px-7 py-3.5 rounded-full bg-white/5 border border-white/15 text-white hover:bg-white/10 text-sm sm:text-base inline-flex items-center gap-2 transition"
                >
                  <span>View Pricing Plans</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
