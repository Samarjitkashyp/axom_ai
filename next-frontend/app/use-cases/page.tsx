import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UseCasesFaq, { USE_CASES_FAQS } from '../../components/UseCasesFaq';
import { getLandingCMS } from '../../lib/api';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Building,
  Palette,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Check,
  Users,
  Globe2,
  Award,
  Zap,
  Lock,
  BookOpen,
  Code2,
  Stethoscope,
  Scale,
  Newspaper,
  Compass,
  Cpu,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  // Primary SEO Keywords
  'Axom AI use cases',
  'Assam AI use cases',
  'Assamese AI applications',
  'AI in Assam',
  'AI for students Assam',
  'APSC exam AI preparation',
  'AI for Assam government jobs',
  // Secondary SEO Keywords
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
  // AEO Keywords (Questions)
  'how can students use Axom AI for exams',
  'how to prepare for APSC with AI',
  'can Axom AI translate Assamese documents',
  'how can local businesses in Assam use AI',
  'what are the real world use cases of Axom AI',
  'is Axom AI helpful for legal and land documents in Assam',
  'how to use AI for Assamese content writing',
  'how can doctors and healthcare workers in Assam use AI',
  'is Axom AI safe and compliant for confidential business data',
  // GEO Keywords (AI Search)
  'best AI platform for Assam students and professionals',
  'top indigenous AI tools for Northeast India',
  'Axom AI practical applications and real world impact',
  'how Axom AI helps regional language speakers',
  'sovereign Assamese LLM use cases',
  'Axom AI for enterprise and education',
  // Regional & Trust Keywords
  'Guwahati AI startup applications',
  'AI tools for Assam schools and colleges',
  'Assam Secretariat and government exam AI',
  'DPDP Act 2023 compliant AI India',
  'private Indian AI for businesses',
];

export async function generateMetadata(): Promise<Metadata> {
  const title =
    'Axom AI Use Cases — Real-World AI Solutions for Assam & India | Students, Business & Creators';
  const description =
    'Discover how students, APSC aspirants, businesses, legal experts, healthcare pros, and creators use Axom AI across Assam & Northeast India. Native Assamese AI with real impact.';
  const canonicalUrl = 'https://aiaxom.co.in/use-cases/';
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
  const landingData = await getLandingCMS();

  // Structured Data Schemas for SEO, AEO, and GEO
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Axom AI Use Cases & Solutions',
    url: 'https://aiaxom.co.in/use-cases/',
    description:
      'Comprehensive guide to real-world applications of Axom AI — empowering students, civil service aspirants, local enterprises, healthcare, legal administration, and digital creators across Assam and Northeast India.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Axom AI',
      url: 'https://aiaxom.co.in',
    },
    about: [
      { '@type': 'Thing', name: 'Artificial Intelligence in Assam' },
      { '@type': 'Thing', name: 'Assamese Language Technology' },
      { '@type': 'Thing', name: 'APSC & UPSC Examination AI Preparation' },
      { '@type': 'Thing', name: 'Enterprise Document Intelligence for Northeast India' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: USE_CASES_FAQS.map((faq) => ({
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
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    description:
      "Axom AI is India and Assam's leading sovereign artificial intelligence and intelligent document processing platform.",
    sameAs: [
      'https://twitter.com/axom_ai',
      'https://github.com/Samarjitkashyp/axom_ai',
    ],
  };

  const SECTORS = [
    {
      id: 'students',
      badge: 'Academic Excellence',
      icon: GraduationCap,
      color: 'from-fuchsia-500 to-purple-600',
      textColor: 'text-fuchsia-400',
      borderColor: 'border-fuchsia-500/30',
      title: 'Students, Schools & Higher Education',
      tagline: 'Personalized 24/7 bilingual tutoring in Assamese and English',
      description:
        'Overcoming textbook and language barriers for school and university students across Assam. Axom AI transforms education by explaining complex STEM and humanities concepts in natural Assamese or English, breaking down step-by-step problem solutions, and generating practice quizzes aligned with SEBA, AHSEC, and CBSE curricula.',
      capabilities: [
        'Bilingual STEM concept explainer (Physics, Chemistry, Math, Biology)',
        'Instant textbook and PDF research paper summarization',
        'Grammar-checked Assamese and English essay and application drafting',
        'Interactive mock quiz generator with detailed explanations',
        'Translation of English lecture notes into natural Assamese',
      ],
      impactMetric: '40% Time Saved in Study Preparation',
      ctaText: 'Start Studying with AI Tutor',
      ctaUrl: 'https://chat.aiaxom.co.in/',
    },
    {
      id: 'aspirants',
      badge: 'Competitive Exams',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      title: 'APSC, UPSC & Assam Govt Job Aspirants',
      tagline: 'Deep Assam General Knowledge, History, and Mains answer writing',
      description:
        'Engineered for aspirants preparing for APSC Combined Competitive Examination (CCE), Assam Police, ADRE, and national civil services. Axom AI delivers authoritative historical context (Ahom kingdom, Sukapha, Lachit Borphukan, modern Assam), regional geography, Assam budget analysis, and real-time current affairs synthesis from local publications.',
      capabilities: [
        'Assam History, Culture & Heritage deep-dive synthesis',
        'Mains Answer Writing practice with instant grammatical & factual feedback',
        'Daily Assam Current Affairs summaries from trusted regional news sources',
        'Assam land laws, tribal policies, and state governance analysis',
        'Bilingual drafting practice in Assamese and English',
      ],
      impactMetric: '3x Faster General Studies Revision',
      ctaText: 'Practice APSC Prep on Axom AI',
      ctaUrl: 'https://chat.aiaxom.co.in/',
    },
    {
      id: 'businesses',
      badge: 'Enterprise & Commerce',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      title: 'Local Businesses, MSMEs & Startups',
      tagline: 'Automate regional customer support, marketing, and operations',
      description:
        'Empowering tea garden producers, handloom artisans, local retail chains, and Guwahati startups to scale. Axom AI enables businesses to communicate fluently with 15M+ Assamese speakers, create bilingual digital marketing campaigns, draft customer proposals, and process documents effortlessly.',
      capabilities: [
        'Automated 24/7 customer query responses in native Assamese & English',
        'Bilingual social media marketing copy for WhatsApp, Facebook & Instagram',
        'Automated invoice data extraction and spreadsheet insight generation',
        'E-commerce product descriptions tailored for regional and national buyers',
        'Professional formal correspondence, email, and contract drafting',
      ],
      impactMetric: '65% Reduction in Customer Support Response Latency',
      ctaText: 'Empower Your Business with AI',
      ctaUrl: 'https://chat.aiaxom.co.in/',
    },
    {
      id: 'legal',
      badge: 'Law & Governance',
      icon: Scale,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      title: 'Legal Practitioners, Land Records & Administration',
      tagline: 'Complex revenue document parsing and bilingual legal drafting',
      description:
        'Assam’s legal and administrative framework involves unique terminology and bilingual records. Axom AI assists advocates, legal clerks, revenue officials, and citizens in understanding complex land records (Chitha, Jamabandi, Pattas), analyzing government circulars, and drafting legal notices with precision.',
      capabilities: [
        'Deciphering Assamese land revenue terminology and deed clauses',
        'Executive summaries of lengthy judicial orders and case laws',
        'Bilingual legal notice and affidavit draft generation',
        'Parsing Assam Secretariat notifications, gazettes, and public tenders',
        'Strict ephemeral memory processing with zero client data retention',
      ],
      impactMetric: '100% Confidentiality & Data Sovereignty',
      ctaText: 'Analyze Legal Documents',
      ctaUrl: 'https://chat.aiaxom.co.in/tools',
    },
    {
      id: 'healthcare',
      badge: 'Public Health & Medicine',
      icon: Stethoscope,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      title: 'Healthcare Professionals & Medical Outreach',
      tagline: 'Democratizing vital health information across linguistic lines',
      description:
        'Bridging communication barriers between doctors, healthcare staff, and rural patients. Axom AI translates technical clinical instructions, prescriptions, and public health guidelines into simple, empathetic colloquial Assamese that patients and families can easily follow.',
      capabilities: [
        'Translating complex medical diagnoses into clear Assamese patient guides',
        'Generating regional health awareness material for community camps',
        'Summarizing international medical research into quick clinical briefs',
        'Bilingual health intake forms and consultation note structuring',
        'Voice transcription assistance for clinical consultations',
      ],
      impactMetric: 'Zero Translation Misunderstandings',
      ctaText: 'Explore Healthcare AI Tools',
      ctaUrl: 'https://chat.aiaxom.co.in/',
    },
    {
      id: 'creators',
      badge: 'Media & Creative Arts',
      icon: Palette,
      color: 'from-violet-500 to-fuchsia-600',
      textColor: 'text-violet-400',
      borderColor: 'border-violet-500/30',
      title: 'Journalists, Writers & Content Creators',
      tagline: 'High-speed Assamese journalism, scriptwriting, and cultural art',
      description:
        'Empowering the creative voice of Northeast India. Journalists, digital media channels, YouTubers, authors, and poets utilize Axom AI to write breaking news copy, brainstorm narrative arcs, refine Assamese poetic meter, and generate culturally authentic AI imagery featuring Assamese motifs, traditional attire, and landscapes.',
      capabilities: [
        'Fast breaking news article drafting and editorial headline ideation',
        'Engaging scriptwriting for YouTube videos, podcasts, and social media reels',
        'Bilingual book, story, and article translation preserving literary tone',
        'Photorealistic cultural AI image generation with FLUX & Gemini Imagen',
        'Festive and cultural marketing copy for Bihu, Ambubachi, and local events',
      ],
      impactMetric: '5x Increase in Publishing Cadence',
      ctaText: 'Generate Assamese Content',
      ctaUrl: 'https://chat.aiaxom.co.in/',
    },
    {
      id: 'developers',
      badge: 'Engineering & Technology',
      icon: Code2,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      title: 'Software Developers, Engineers & Tech Startups',
      tagline: 'Full-stack code generation, Indic NLP, and edge computing',
      description:
        'Accelerating software innovation in Guwahati and across Northeast India. Software engineers and startups leverage Axom AI’s coding suite for generating Python, JavaScript, TypeScript, Go, and SQL code, debugging complex stack traces, building regional NLP pipelines, and integrating document automation APIs.',
      capabilities: [
        'Full-stack code generation, unit testing, and automated bug fixing',
        'Fine-tuned Assamese tokenization and Indic text processing scripts',
        'OCR text extraction pipelines from scanned Assamese and bilingual PDFs',
        'Architecture reviews and system design guidance for cloud applications',
        'Sub-second Indian edge API latency for production integrations',
      ],
      impactMetric: '<0.8s Cloud Execution Latency',
      ctaText: 'Launch Code Assistant',
      ctaUrl: 'https://chat.aiaxom.co.in/tools',
    },
  ];

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

      {/* Global Shared Header / Navbar */}
      <Navbar header={landingData?.header} />

      <main className="min-h-screen bg-[#06060b] text-slate-200 relative overflow-hidden pt-28 pb-20">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-fuchsia-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-purple-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ==================== HERO SECTION ==================== */}
          <section className="text-center max-w-4xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold mb-5 shadow-sm">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span>⚡ Real People • Real Impact • Sovereign Assamese AI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight mb-5">
              Built for{' '}
              <span className="gradient-text">Real People, Real Impact</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
              From school classrooms in Dibrugarh to administrative offices in Dispur and tech startups in Guwahati — discover how <strong>Axom AI</strong> is driving everyday productivity, academic success, and regional empowerment across Assam and Northeast India.
            </p>

            {/* Quick Sector Filter Jump Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              {SECTORS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-fuchsia-500/40 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <sec.icon size={15} className={sec.textColor} />
                  <span>{sec.title.split(',')[0]}</span>
                </a>
              ))}
            </div>
          </section>

          {/* ==================== AEO DIRECT ANSWER BOX ==================== */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/25 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1 shadow-inner">
                  <Compass size={24} className="text-fuchsia-400" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    <span>AEO Direct Summary • Generative Engine Overview</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    What are the Practical Use Cases of Axom AI?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI</strong> is designed as a sovereign, multi-purpose artificial intelligence ecosystem specifically customized for the linguistic, cultural, and professional requirements of Assam and Northeast India. Key use cases include <strong>bilingual academic tutoring</strong> for students, <strong>APSC civil services preparation</strong> with authentic regional General Knowledge, <strong>business communication automation</strong> for regional MSMEs, <strong>bilingual land and legal record analysis</strong>, <strong>healthcare outreach translation</strong>, and <strong>full-stack code development</strong> — all delivered over low-latency Indian cloud infrastructure with 100% data sovereignty.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 size={16} /> 15M+ Assamese Speakers Served
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 size={16} /> SEBA, AHSEC & APSC Aligned
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 size={16} /> DPDP Act 2023 Compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== IMPACT METRICS BAR ==================== */}
          <section className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">15M+</div>
              <div className="text-xs sm:text-sm text-slate-400">Assamese Speakers Empowered</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-fuchsia-400 mb-1">30+</div>
              <div className="text-xs sm:text-sm text-slate-400">Integrated AI & Document Tools</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">99.2%</div>
              <div className="text-xs sm:text-sm text-slate-400">Assamese Grammatical Accuracy</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mb-1">&lt;0.8s</div>
              <div className="text-xs sm:text-sm text-slate-400">Domestic Indian Cloud Latency</div>
            </div>
          </section>

          {/* ==================== DEEP DIVE SECTORS ==================== */}
          <section className="space-y-12 sm:space-y-16 mb-24">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
                <span>In-Depth Industry Solutions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                Explore How Axom AI Powers Every Sector
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Detailed breakdowns of practical workflows, problem-solving capabilities, and proven results.
              </p>
            </div>

            {SECTORS.map((sector, idx) => (
              <div
                key={sector.id}
                id={sector.id}
                className="scroll-mt-28 p-6 sm:p-10 rounded-3xl bg-slate-900/40 border border-white/10 hover:border-fuchsia-500/30 transition-all shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Overview & Tagline */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sector.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                        <sector.icon size={22} />
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium mb-1">
                          {sector.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          {sector.title}
                        </h3>
                      </div>
                    </div>

                    <p className={`text-sm sm:text-base font-semibold ${sector.textColor}`}>
                      {sector.tagline}
                    </p>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {sector.description}
                    </p>

                    {/* Capabilities Checklist */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Key Capabilities & Features</h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                        {sector.capabilities.map((cap, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${sector.textColor}`} />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Card with Impact & CTA */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full bg-slate-950/60 p-6 sm:p-7 rounded-2xl border border-white/5 space-y-6">
                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Verified Real-World Impact
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <Award size={24} className="text-amber-400 shrink-0" />
                        <div>
                          <div className="text-white font-bold text-sm sm:text-base">
                            {sector.impactMetric}
                          </div>
                          <div className="text-slate-400 text-xs">
                            Measured across active regional users
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                        <p>
                          Tailored for immediate deployment with no technical setup or coding knowledge required.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={sector.ctaUrl}
                        className={`w-full py-3 px-5 rounded-xl bg-gradient-to-r ${sector.color} text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/30 hover:scale-[1.02] transition-transform`}
                      >
                        <span>{sector.ctaText}</span>
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </section>

          {/* ==================== COMPARISON TABLE ==================== */}
          <section className="mb-24 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
                <span>The Sovereign Advantage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Why Axom AI is Unmatched for Assam & Regional Workflows
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Comparing Axom AI against generic international chatbots and fragmented software.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-semibold">Capability / Dimension</th>
                    <th className="p-4 sm:p-5 font-bold text-fuchsia-300 bg-fuchsia-500/10 border-x border-fuchsia-500/20">
                      Axom AI Platform
                    </th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Generic Overseas AI</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Legacy Manual Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Assamese Linguistic Nuance & Grammar</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-fuchsia-500/5 border-x border-fuchsia-500/10 flex items-center gap-1.5">
                      <Check size={16} /> High accuracy, idiomatic Assamese
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Robotic, literal transliterations</td>
                    <td className="p-4 sm:p-5 text-slate-400">Slow manual translation</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Assam GK & APSC Exam Alignment</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-fuchsia-500/5 border-x border-fuchsia-500/10 flex items-center gap-1.5">
                      <Check size={16} /> Deep historical & state curriculum context
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Extremely generic or halluncinated</td>
                    <td className="p-4 sm:p-5 text-slate-400">Limited to static books</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Document Processing & Conversion</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-fuchsia-500/5 border-x border-fuchsia-500/10 flex items-center gap-1.5">
                      <Check size={16} /> 30+ integrated PDF, Word, Image tools
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Chat text only, no format tools</td>
                    <td className="p-4 sm:p-5 text-slate-400">Ad-heavy separate utilities</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Data Hosting & Privacy Law</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-fuchsia-500/5 border-x border-fuchsia-500/10 flex items-center gap-1.5">
                      <Check size={16} /> Indian data residency (DPDP Act 2023)
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Stored on overseas servers</td>
                    <td className="p-4 sm:p-5 text-slate-400">Varies</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Network Response Latency</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-fuchsia-500/5 border-x border-fuchsia-500/10 flex items-center gap-1.5">
                      <Check size={16} /> &lt;0.8s via Indian edge nodes
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">2.5s - 4.0s overseas roundtrip</td>
                    <td className="p-4 sm:p-5 text-slate-400">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================== ASSAM REGIONAL AUTHORITY ==================== */}
          <section className="mb-24 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 border border-indigo-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <Globe2 size={28} />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <span>Sovereign AI for Assam & Northeast India</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Built in Assam, Serving Millions Worldwide
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Headquartered in Guwahati, Assam, Axom AI is committed to building sovereign regional artificial intelligence infrastructure. By developing localized linguistic benchmarks and integrating domestic cloud processing, we ensure that technological advancement preserves our heritage while empowering the next generation of researchers, leaders, and entrepreneurs.
                </p>
              </div>
            </div>
          </section>

          {/* ==================== FAQS ==================== */}
          <section className="mb-24">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-xs font-semibold mb-2">
                <span>Answers to Common Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Frequently Asked Questions about Axom AI Use Cases
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Got questions about how Axom AI fits your specific daily workflow or organization? Find verified answers below.
              </p>
            </div>

            <UseCasesFaq />
          </section>

          {/* ==================== BOTTOM CTA ==================== */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-fuchsia-500/30 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold mb-4">
              <Sparkles size={14} />
              <span>Get Started in 10 Seconds — No Credit Card Required</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
              Experience the Impact of Sovereign AI Today
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-8">
              Join thousands of students, civil servants, business owners, and creators leveraging Axom AI every single day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://chat.aiaxom.co.in/"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition"
              >
                Launch AI Chat Workspace
              </a>
              <Link
                href="/tools"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <span>Explore All AI & Document Tools</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </>
  );
}
