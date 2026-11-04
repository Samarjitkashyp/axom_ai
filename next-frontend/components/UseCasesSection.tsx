'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Building,
  Palette,
  Car,
  Code,
  ArrowRight,
  BookOpen,
  FileText,
  Languages,
  Fuel,
  FileDown,
  Bot,
  Image as ImageIcon,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface UseCaseCardData {
  title: string;
  badge?: string;
  desc: string;
  icon: React.ElementType;
  action_url: string;
  action_text: string;
  accent: string;
}

interface PersonaTab {
  id: string;
  title: string;
  headline: string;
  subheading: string;
  icon: React.ElementType;
  cards: UseCaseCardData[];
}

const DEFAULT_PERSONAS: PersonaTab[] = [
  {
    id: 'students',
    title: 'Students & Aspirants',
    headline: 'Empowering Academic Excellence & State Competitive Exams',
    subheading: 'Engineered specifically for APSC CCE, Assam Police, AHSEC, SEBA, and university degree programs.',
    icon: GraduationCap,
    cards: [
      {
        title: 'AI Notes Generator',
        badge: 'APSC & Word Export',
        desc: 'Transform textbooks, syllabi, and reference chapters into structured study notes with executive summaries, formulas, high-yield exam tips, and instant Microsoft Word (.docx) export.',
        icon: BookOpen,
        action_url: '/tools/ai-notes-generator',
        action_text: 'Launch Notes Generator',
        accent: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      },
      {
        title: 'Chat with PDF & Study Books',
        badge: 'Bilingual Q&A',
        desc: 'Upload 100+ page syllabus PDFs, reference books, and past question papers for bilingual Assamese-English doubt clearing, citations, and instant flashcard extraction.',
        icon: FileText,
        action_url: '/tools/chat-with-pdf',
        action_text: 'Upload & Study PDF',
        accent: 'from-blue-500/20 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      },
      {
        title: 'Voice Notes & Lecture Transcriber',
        badge: 'Vernacular ASR',
        desc: 'Record classroom lectures, seminars, or Assamese group discussions and convert spoken audio into organized revision bullet points with speaker clarity.',
        icon: Languages,
        action_url: '/tools/voice-notes-generator',
        action_text: 'Transcribe Lectures',
        accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      },
    ],
  },
  {
    id: 'professionals',
    title: 'Working Professionals',
    headline: 'Accelerating Document Productivity & Regional Compliance',
    subheading: 'Tailored for advocates, corporate administrators, chartered accountants, and public sector consultants.',
    icon: Briefcase,
    cards: [
      {
        title: 'Lossless Document Suite',
        badge: 'High-Fidelity OCR',
        desc: 'Lossless PDF-to-Word, Word-to-PDF, Excel-to-PDF, and PPT conversion preserving fonts, margins, formulas, and complex data tables without document corruption.',
        icon: FileDown,
        action_url: '/tools/pdf-to-word',
        action_text: 'Open Converter Suite',
        accent: 'from-purple-500/20 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      },
      {
        title: 'Scanned Jamabandi & Record OCR',
        badge: 'Land Revenue Vision',
        desc: 'Extract, transcribe, and summarize historical Assam land records, Jamabandi, Chitha registers, and court summons with bilingual English and Assamese query search.',
        icon: FileText,
        action_url: '/tools/chat-with-pdf',
        action_text: 'Digitize Records',
        accent: 'from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
      },
      {
        title: 'Bilingual Executive Memos',
        badge: '99.4% Script Purity',
        desc: 'Draft executive briefings, commercial tenders, and official administrative correspondence in authentic Assamese and English with zero script distortion.',
        icon: Bot,
        action_url: 'https://chat.aiaxom.co.in/',
        action_text: 'Draft Formal Memos',
        accent: 'from-fuchsia-500/20 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
      },
    ],
  },
  {
    id: 'automotive',
    title: 'Automotive & Drivers',
    headline: 'Certified Ethanol Fuel Compatibility for Indian Vehicles',
    subheading: 'Real-time MoRTH and SIAM compliance evaluation for Bikes, Scooters, and Cars nationwide.',
    icon: Car,
    cards: [
      {
        title: 'Axom FuelCheck™',
        badge: 'E10 / E20 / E100',
        desc: 'Check if your vehicle (2010–2026) is officially certified for E10, E20, or high-octane XP95 petrol. Instant evaluation across 15+ OEMs with official owner manual citations.',
        icon: Fuel,
        action_url: '/tools/fuel-checker',
        action_text: 'Check Your Vehicle',
        accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      },
      {
        title: 'Automotive Engineer AI',
        badge: 'Interactive Doubts',
        desc: 'Get immediate clarity on ethanol phase separation, fuel injector corrosion risks, carburetor vs EFI safety, and mileage changes directly with an automotive AI.',
        icon: Bot,
        action_url: '/tools/fuel-checker',
        action_text: 'Ask Automotive AI',
        accent: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      },
      {
        title: 'Vehicle Document OCR',
        badge: 'RC & Insurance Vision',
        desc: 'Upload vehicle registration smart cards, insurance policy PDFs, and manufacturer manuals to extract key dates, warranty clauses, and engine displacement data.',
        icon: FileText,
        action_url: '/tools/chat-with-pdf',
        action_text: 'Inspect Vehicle Docs',
        accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      },
    ],
  },
  {
    id: 'businesses',
    title: 'Businesses & MSMEs',
    headline: 'Scaling Regional Customer Engagement & Operations',
    subheading: 'Connect naturally with over 35 million Assamese and English speaking consumers across Northeast India.',
    icon: Building,
    cards: [
      {
        title: '24/7 Regional Customer Care',
        badge: 'Autonomous AI',
        desc: 'Deploy conversational AI support bots that understand colloquial Assamese phrases and English inquiries 24/7 without embarrassing linguistic confusion.',
        icon: Bot,
        action_url: 'https://chat.aiaxom.co.in/',
        action_text: 'Deploy Support Bot',
        accent: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      },
      {
        title: 'Invoicing & Catalog Suite',
        badge: 'Document Security',
        desc: 'Batch convert inventory spreadsheets, product price lists, and payment receipts to password-protected and watermarked PDF formats.',
        icon: FileDown,
        action_url: '/tools/excel-to-pdf',
        action_text: 'Secure Invoices',
        accent: 'from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
      },
      {
        title: 'Vernacular Marketing Copy',
        badge: 'Cultural Copywriting',
        desc: 'Create high-converting Assamese social media advertisements, festival promotional banners, and WhatsApp marketing campaigns tailored to local sentiments.',
        icon: Sparkles,
        action_url: 'https://chat.aiaxom.co.in/',
        action_text: 'Generate Marketing Copy',
        accent: 'from-fuchsia-500/20 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
      },
    ],
  },
  {
    id: 'creators',
    title: 'Creators & Designers',
    headline: 'Powering Digital Storytelling, Visuals & Regional Media',
    subheading: 'Built for digital artists, YouTubers, journalists, and cultural content creators.',
    icon: Palette,
    cards: [
      {
        title: 'AI Creative Studio & FLUX Art',
        badge: 'Diffusion Visuals',
        desc: 'Synthesize 4K digital artwork, festival creatives, and cultural illustrations from Assamese and English prompts with FLUX diffusion models.',
        icon: ImageIcon,
        action_url: '/tools/ai-image-generator',
        action_text: 'Launch Image Studio',
        accent: 'from-pink-500/20 to-rose-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
      },
      {
        title: 'Creator Asset Suite',
        badge: 'One-Click Utilities',
        desc: 'One-click Background Remover, Image Compressor, SVG Vector Editor, and Color Palette Generator for rapid YouTube thumbnail and poster production.',
        icon: Sparkles,
        action_url: '/tools/background-remover',
        action_text: 'Remove Backgrounds',
        accent: 'from-purple-500/20 to-fuchsia-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      },
      {
        title: 'YouTube & Media Tools',
        badge: 'Media Utilities',
        desc: 'Download, compress, and reformat reference video clips, extract audio tracks, and optimize video dimensions for rapid cross-platform social publishing.',
        icon: FileDown,
        action_url: '/tools/youtube-video-downloader',
        action_text: 'Explore Media Tools',
        accent: 'from-rose-500/20 to-orange-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      },
    ],
  },
  {
    id: 'developers',
    title: 'Developers & Engineers',
    headline: 'Production-Grade APIs, Vernacular Models & Dev Utilities',
    subheading: 'Build regional intelligence into web, mobile, and enterprise architectures with modern REST SDKs.',
    icon: Code,
    cards: [
      {
        title: 'Model Router & Fallback API',
        badge: 'Sub-Second Edge',
        desc: 'Integrate Tier-1 OpenAI (GPT-4o), Tier-2 Gemini, and Tier-3 Groq failover cascades with high-throughput streaming and zero timeout errors.',
        icon: Cpu,
        action_url: '/docs/developer',
        action_text: 'Explore Developer Docs',
        accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      },
      {
        title: 'Screenshot to Clean Code',
        badge: 'UI AI Generator',
        desc: 'Upload design screenshots or wireframes to instantly generate clean, responsive React and Tailwind CSS markup ready for production deployment.',
        icon: Code,
        action_url: '/tools/screenshot-to-code',
        action_text: 'Generate UI Code',
        accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      },
      {
        title: 'Vernacular Tokenizer & SDK',
        badge: '68K Token Vocab',
        desc: 'Access the 68,096-token Assamese vocabulary and lightweight Progya / XUWOR endpoints directly via Python SDK and standard HTTP client libraries.',
        icon: Bot,
        action_url: 'https://chat.aiaxom.co.in/',
        action_text: 'Get API Credentials',
        accent: 'from-indigo-500/20 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      },
    ],
  },
];

interface UseCasesSectionProps {
  header?: {
    badge?: string;
    title_prefix?: string;
    title_highlight?: string;
    subheading?: string;
    active?: boolean;
    tabs?: any[];
  };
}

export default function UseCasesSection({ header }: UseCasesSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  const current = DEFAULT_PERSONAS[activeTab] || DEFAULT_PERSONAS[0];

  return (
    <section id="usecases" className="py-20 md:py-28 relative border-t border-emerald-900/10 dark:border-white/5 bg-[#f0fdf4] dark:bg-[#0b1220]">
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span>{header?.badge || 'Use Cases'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight mb-4">
            {header?.title_prefix || 'Built for'}{' '}
            <span className="gradient-text">{header?.title_highlight || 'Real People, Real Impact'}</span>
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            {header?.subheading || 'From competitive exam aspirants in Dibrugarh to legal firms in Guwahati and vehicle owners nationwide — Axom AI delivers specialized production tools.'}
          </p>
        </div>

        {/* 6 Audience Persona Tab Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10 sm:mb-12">
          {DEFAULT_PERSONAS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === i;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 scale-[1.02]'
                    : 'bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>



        {/* 3 High-Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {current.cards.map((card, idx) => {
            const Icon = card.icon;
            const isExternal = card.action_url.startsWith('http');
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.accent} border grid place-items-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {card.badge && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                    {card.desc}
                  </p>
                </div>

                {isExternal ? (
                  <a
                    href={card.action_url}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:gap-2.5 transition-all pt-4 border-t border-slate-200 dark:border-white/5"
                  >
                    <span>{card.action_text}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
                  </a>
                ) : (
                  <Link
                    href={card.action_url}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:gap-2.5 transition-all pt-4 border-t border-slate-200 dark:border-white/5"
                  >
                    <span>{card.action_text}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* In-depth Dedicated Page Link */}
        <div className="mt-12 text-center">
          <Link
            href="/use-cases"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-500 text-slate-900 dark:text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
          >
            <span>Explore All Dedicated Use Cases &amp; Industry Solutions</span>
            <ArrowRight className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
          </Link>
        </div>

      </div>
    </section>
  );
}
