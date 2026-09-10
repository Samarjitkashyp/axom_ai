import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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
  ChevronDown
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutCMS();
  const title = about?.meta_title || "About Axom AI — Assam's Premier Indigenous AI Platform & LLM Ecosystem | Assam AI";
  const description = about?.meta_description || "Discover Axom AI (https://aiaxom.co.in) — Assam's flagship indigenous Artificial Intelligence platform. Empowering Assam with native Assamese LLMs, ChatGPT-grade reasoning, image generation, document intelligence, and regional digital innovation.";
  const keywords = about?.meta_keywords
    ? about.meta_keywords.split(',').map((k) => k.trim())
    : [
        'Assam AI',
        'AI in Assam',
        'Axom AI',
        'AI Assam',
        'Artificial Intelligence in Assam',
        'Assamese AI',
        'Assamese ChatGPT',
        'Assamese LLM',
        'Guwahati AI',
        'Northeast India AI',
        'Axom AI about',
        'Assam AI platform',
        'Indic AI Assam',
        'Indigenous AI Assam',
        'Assam AI startup',
        'Assamese NLP'
      ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: 'https://aiaxom.co.in/about/',
    },
    openGraph: {
      title,
      description,
      url: 'https://aiaxom.co.in/about/',
      siteName: 'Axom AI',
      type: 'website',
      images: [
        {
          url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
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
      images: ['https://aiaxom.co.in/static/dist/hero/assam.avif'],
    },
  };
}

export default async function AboutPage() {
  const [landingData, aboutData] = await Promise.all([
    getLandingCMS(),
    getAboutCMS(),
  ]);

  const badgeText = aboutData?.badge_text || "অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • PIONEERING ASSAM'S AI FUTURE";
  const headingPrefix = aboutData?.main_heading_prefix || "Pioneering Artificial Intelligence in";
  const headingHighlight = aboutData?.main_heading_highlight || "Assam";
  const headingSuffix = aboutData?.main_heading_suffix || ", Built for the World.";
  const subheadingEn = aboutData?.subheading_english || "Axom AI is Assam's first indigenous generative artificial intelligence platform — engineered to bridge the linguistic divide for 15 million Assamese speakers with native conversational models, multimodal creative suites, and regional computing infrastructure.";
  const subheadingAs = aboutData?.subheading_assamese || "অসমীয়া ভাষা, সংস্কৃতি আৰু বৌদ্ধিক ঐতিহ্যক কৃত্ৰিম বুদ্ধিমত্তাৰ বিশ্ব মানচিত্ৰত প্ৰতিষ্ঠা কৰাৰ এক ঐতিহাসিক পদক্ষেপ।";

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
  const entityTitle = aboutData?.entity_title || "What is Axom AI? (Assam AI Definition)";
  const entityDef = aboutData?.entity_definition || "Axom AI (stylized as AI Axom, Assamese: অসম এআই) is Assam's flagship indigenous artificial intelligence platform headquartered in Guwahati, Assam, India. Founded by researcher and architect Samarjit Kashyap, the platform delivers native Assamese Large Language Model (LLM) computing, document OCR, generative image synthesis, and real-time Assamese search synthesis for individuals, students, creators, and enterprises across Northeast India.";

  const factEntityName = aboutData?.fact_entity_name || "Axom AI (AI Axom / Assam AI / অসম এআই)";
  const factOfficialUrl = aboutData?.fact_official_url || "https://aiaxom.co.in";
  const factHeadquarters = aboutData?.fact_headquarters || "Guwahati, Assam, India (PIN: 781001, Geo: 26.1445° N, 91.7362° E)";
  const factFounder = aboutData?.fact_founder || "Samarjit Kashyap (Lead Architect)";
  const factLanguages = aboutData?.fact_languages || "Assamese (অসমীয়া), English, Indic Transliterations";
  const factArchitecture = aboutData?.fact_architecture || "RAG over 25,000+ Assamese Wikipedia articles (~112K chunks), Groq LPU inference, IndicTrans2, Cloudflare FLUX & Gemini fallback";
  const factCoverage = aboutData?.fact_coverage || "Assam (all 35 districts), Northeast India, Pan-India, Global Assamese Diaspora";

  const whyBadge = aboutData?.why_badge || "The Linguistic Divide";
  const whyTitle = aboutData?.why_title || "Why Does Assam Need an Independent AI Platform?";
  const whySubheading = aboutData?.why_subheading || "Mainstream global AI models treated Assamese as a low-resource afterthought, mixing Bengali characters, missing cultural nuances, and locking regional users behind expensive dollar billing.";

  const whyCard1Title = aboutData?.why_card_1_title || "Eliminating Script Errors";
  const whyCard1Desc = aboutData?.why_card_1_desc || "Global LLMs mix Bengali and Assamese characters (replacing ‘ৰ’ with ‘র’). Axom AI guarantees grammatically authentic Assamese script.";
  const whyCard2Title = aboutData?.why_card_2_title || "Deep Cultural Context";
  const whyCard2Desc = aboutData?.why_card_2_desc || "From the Ahom dynasty to Srimanta Sankardev, Bihu, and modern Assam governance, Axom AI understands regional context without hallucinations.";
  const whyCard3Title = aboutData?.why_card_3_title || "Affordable with UPI";
  const whyCard3Desc = aboutData?.why_card_3_desc || "Free tier available for all, and plans starting at ₹99 with native UPI (Google Pay, PhonePe, Paytm) checkout via Razorpay.";

  const founderBadge = aboutData?.founder_badge || "Leadership & Vision";
  const founderName = aboutData?.founder_name || "Samarjit Kashyap";
  const founderTitle = aboutData?.founder_title || "Lead AI Architect";
  const founderQuoteTitle = aboutData?.founder_quote_title || "Building Assam as Northeast India's AI Capital";
  const founderQuote = aboutData?.founder_quote || '"For decades, regional languages of Northeast India were left behind in the digital technology wave. Axom AI was founded with a singular conviction: our language, literature, and youth deserve world-class artificial intelligence tools that understand them natively. We are creating an ecosystem where anyone in Assam can converse with state-of-the-art intelligence in their mother tongue."';
  const founderEmail = aboutData?.founder_email || "samarjitkashyp@gmail.com";

  const ctaBadge = aboutData?.cta_badge || "Experience the Future Today";
  const ctaTitle = aboutData?.cta_title || "Be Part of Assam's AI Revolution";
  const ctaDesc = aboutData?.cta_desc || "Join thousands of students, professionals, and creators across Assam who are chatting, researching, creating, and automating with Axom AI.";
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
        logo: 'https://aiaxom.co.in/static/dist/favicon.svg',
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
        },
        knowsLanguage: ['as', 'en', 'hi'],
        knowsAbout: [
          'Artificial Intelligence in Assam',
          'Assamese Natural Language Processing',
          'Assam AI Models',
          'Regional Large Language Models',
          'Assamese OCR and Document Intelligence',
        ],
      },
      {
        '@type': 'AboutPage',
        '@id': 'https://aiaxom.co.in/about/#webpage',
        url: 'https://aiaxom.co.in/about/',
        name: aboutData?.meta_title || "About Axom AI — Assam's Premier Indigenous AI Platform & LLM Ecosystem",
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
        '@type': 'FAQPage',
        '@id': 'https://aiaxom.co.in/about/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is Axom AI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: entityDef,
            },
          },
          {
            '@type': 'Question',
            name: 'Why is Axom AI called the first native AI of Assam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI was built from the ground up with 25,000+ Assamese knowledge chunks and custom fine-tuning to provide authentic, culturally accurate Assamese responses without mixing Bengali script.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06060b] text-[#e5e7eb] selection:bg-fuchsia-500 selection:text-white">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <Navbar header={landingData?.header} />

      <main className="flex-1 pt-28 pb-20 relative overflow-hidden">
        {/* Ambient Grid & Glow Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(192,132,252,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(192,132,252,0.04)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-fuchsia-600/10 blur-[100px] top-16 left-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[90px] top-96 right-0 pointer-events-none" />

        {/* Breadcrumb Trail */}
        <div className="max-w-6xl mx-auto px-5 mb-4 text-xs text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-fuchsia-400 transition">Home</Link>
          <span>/</span>
          <span className="text-fuchsia-400 font-medium">About Axom AI</span>
        </div>

        {/* HERO HEADER */}
        <section className="max-w-6xl mx-auto px-5 pt-6 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-xs font-semibold text-fuchsia-300 mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            {headingPrefix} <span className="bg-gradient-to-r from-white via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">{headingHighlight}</span>
            {headingSuffix ? <><br className="hidden sm:inline" />{headingSuffix}</> : null}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed">
            {subheadingEn}
          </p>

          <p className="font-assamese text-base sm:text-lg text-fuchsia-300/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            {subheadingAs}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat1Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat1Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-fuchsia-400 mb-1">{stat2Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat2Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-1">{stat3Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat3Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-pink-400 mb-1">{stat4Val}</div>
              <div className="text-xs text-gray-400 font-medium">{stat4Label}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={ctaPrimaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg shadow-fuchsia-500/25 hover:scale-105 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ctaPrimaryText}</span>
            </a>
            <a
              href="#factsheet"
              className="px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-sm sm:text-base inline-flex items-center gap-2 transition"
            >
              <span>Read Entity Profile</span>
            </a>
          </div>
        </section>

        {/* GEO ENTITY DEFINITION BOX */}
        <section id="factsheet" className="max-w-5xl mx-auto px-5 mb-20 scroll-mt-28">
          <div className="p-6 sm:p-8 rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/30 via-purple-950/20 to-black/80 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-3">
              <Globe className="w-4 h-4" />
              <span>{entityBadge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {entityTitle}
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              {entityDef}
            </p>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300 w-1/3">Entity / Platform Name</th>
                    <td className="px-4 py-3 text-white">{factEntityName}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300">Official URL</th>
                    <td className="px-4 py-3 text-white"><a href={factOfficialUrl} className="text-fuchsia-400 underline">{factOfficialUrl}</a></td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300">Headquarters</th>
                    <td className="px-4 py-3 text-white">{factHeadquarters}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300">Primary Founder</th>
                    <td className="px-4 py-3 text-white">{factFounder}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300">Primary Languages</th>
                    <td className="px-4 py-3 text-white">{factLanguages}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300">Core Architecture</th>
                    <td className="px-4 py-3 text-white">{factArchitecture}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <th className="px-4 py-3 font-semibold text-fuchsia-300">Service Coverage</th>
                    <td className="px-4 py-3 text-white">{factCoverage}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* WHY ASSAM NEEDS ITS OWN AI */}
        <section className="max-w-5xl mx-auto px-5 mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-3">
              <span>{whyBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {whyTitle}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {whySubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 grid place-items-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{whyCard1Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {whyCard1Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 grid place-items-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{whyCard2Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {whyCard2Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 grid place-items-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{whyCard3Title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {whyCard3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="max-w-5xl mx-auto px-5 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Axom AI vs Generic Global AI Models
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              How Axom AI compares against ChatGPT and Google Gemini when answering Assamese queries.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.01]">
            <table className="w-full text-left text-xs sm:text-sm text-gray-300">
              <thead className="bg-white/5 text-white font-bold border-b border-white/10">
                <tr>
                  <th className="p-4 sm:p-5">Feature</th>
                  <th className="p-4 sm:p-5 text-fuchsia-400 font-bold">Axom AI (Assam AI)</th>
                  <th className="p-4 sm:p-5 text-gray-400">Standard ChatGPT</th>
                  <th className="p-4 sm:p-5 text-gray-400">Google Gemini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-4 sm:p-5 font-semibold text-white">Assamese Script Accuracy</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">99.4% Native Assamese</td>
                  <td className="p-4 sm:p-5 text-amber-400">Moderate (Mixes Bengali)</td>
                  <td className="p-4 sm:p-5 text-amber-400">Moderate</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-4 sm:p-5 font-semibold text-white">Local Assam Knowledge</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">25K+ Local Articles RAG</td>
                  <td className="p-4 sm:p-5 text-red-400">Low (Generic web summaries)</td>
                  <td className="p-4 sm:p-5 text-amber-400">Medium (Search dependent)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-4 sm:p-5 font-semibold text-white">Pricing & UPI Payment</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-bold">Free / Starts ₹99 (UPI)</td>
                  <td className="p-4 sm:p-5 text-red-400">₹1,700+/mo (Credit Card)</td>
                  <td className="p-4 sm:p-5 text-red-400">₹1,950/mo (Credit Card)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FOUNDER CARD */}
        <section className="max-w-4xl mx-auto px-5 mb-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-fuchsia-950/30 via-purple-950/20 to-black/60 border border-fuchsia-500/20 flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#0e0d1a] border border-fuchsia-500/30 grid place-items-center text-center p-3 shrink-0">
              <User className="w-10 h-10 text-fuchsia-400 mb-1" />
              <div className="text-xs font-bold text-white">{founderName}</div>
              <div className="text-[10px] text-fuchsia-300">{founderTitle}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-2">{founderBadge}</div>
              <h2 className="text-2xl font-bold text-white mb-3">{founderQuoteTitle}</h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                {founderQuote}
              </p>
              <div className="text-xs text-gray-400">
                <strong className="text-white">{founderName}</strong> — Founder, Axom AI • <a href={`mailto:${founderEmail}`} className="text-fuchsia-400 hover:underline">{founderEmail}</a>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="max-w-5xl mx-auto px-5">
          <div className="p-8 sm:p-14 rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 via-purple-950/30 to-black/80 backdrop-blur-xl text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-[11px] font-bold text-fuchsia-300 uppercase tracking-widest mb-3">
                <span>{ctaBadge}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
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
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-xl shadow-fuchsia-500/30 hover:scale-105 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{ctaBtnText}</span>
                </a>
                <Link
                  href="/#tools"
                  className="px-7 py-3.5 rounded-full bg-white/5 border border-white/15 text-white hover:bg-white/10 text-sm sm:text-base inline-flex items-center gap-2 transition"
                >
                  <span>Explore Tools</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
