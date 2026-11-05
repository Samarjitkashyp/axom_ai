'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Scale,
  Stethoscope,
  Palette,
  Code2,
  Car,
  Fuel,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Cpu,
  Layers,
  Bot,
  Languages,
  FileDown,

  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface SectorItem {
  id: string;
  category: string;
  badge: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  researchModel: {
    name: string;
    spec: string;
    url: string;
  };
  tools: Array<{
    name: string;
    url: string;
    badge: string;
  }>;
  capabilities: string[];
  impactMetric: string;
  ctaText: string;
  ctaUrl: string;
  accent: {
    badgeBg: string;
    badgeText: string;
    cardBorder: string;
    btnGrad: string;
  };
}

export const USE_CASE_SECTORS: SectorItem[] = [
  {
    id: 'students',
    category: 'Education',
    badge: 'Academic Excellence',
    icon: GraduationCap,
    title: 'Students, Schools & Higher Education',
    tagline: 'Bilingual STEM Tutoring, Syllabus Revision & Instant Word Notes',
    description:
      'Overcoming language and textbook barriers for school and college students across Assam. Axom AI breaks down complex STEM theories in clear Assamese and English, explains step-by-step math and physics formulas, summarizes syllabus chapters, and generates complete study notes with Microsoft Word (.docx) export aligned with SEBA, AHSEC, and university curricula.',
    researchModel: {
      name: 'Axom AI Brain — Progya (প্ৰজ্ঞা)',
      spec: '2B Sovereign Assamese LLM • 68,096 Native Tokenizer',
      url: 'https://aiaxom.co.in/research/axomai-brain-progya/',
    },
    tools: [
      { name: 'AI Notes Generator', url: '/tools/ai-notes-generator', badge: 'Word .docx Export' },
      { name: 'Chat with PDF', url: '/tools/chat-with-pdf', badge: 'Bilingual Q&A' },
      { name: 'Voice Notes Transcriber', url: '/tools/voice-notes-generator', badge: 'Lecture Audio' },
    ],
    capabilities: [
      'Bilingual STEM concept explainer (Physics, Chemistry, Math, Biology)',
      'Instant textbook and syllabus chapter summarization into bullet notes',
      'One-click Microsoft Word (.docx) export with formulas and definitions',
      'Grammar-checked Assamese and English essay and assignment formulation',
      'Interactive mock quiz generator with detailed answers and hints',
    ],
    impactMetric: '40% Reduction in Daily Exam & Syllabus Preparation Time',
    ctaText: 'Launch AI Notes Generator',
    ctaUrl: '/tools/ai-notes-generator',
    accent: {
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
      badgeText: 'text-emerald-700 dark:text-emerald-400',
      cardBorder: 'border-emerald-900/15 dark:border-emerald-500/20',
      btnGrad: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600',
    },
  },
  {
    id: 'aspirants',
    category: 'Competitive Exams',
    badge: 'APSC & Civil Services',
    icon: BookOpen,
    title: 'APSC CCE, ADRE & Assam Police Aspirants',
    tagline: 'Deep Assam General Knowledge, History & Evaluated Mains Answer Writing',
    description:
      'Engineered specifically for candidates preparing for the APSC Combined Competitive Examination (CCE), Assam Police, ADRE, and national civil services. Axom AI delivers authoritative historical context (Ahom kingdom, Sukapha, Lachit Borphukan, freedom struggle), regional geography, Assam budget analysis, and real-time current affairs synthesis.',
    researchModel: {
      name: 'Axom AI Master — XUWOR & Progya',
      spec: 'Trained on 6.19M Assamese Cultural & Historical Records',
      url: 'https://aiaxom.co.in/research/axomai-multimodal-xuwor/',
    },
    tools: [
      { name: 'AI Notes Generator', url: '/tools/ai-notes-generator', badge: 'High-Yield Points' },
      { name: 'Chat with PDF', url: '/tools/chat-with-pdf', badge: 'State Gazettes' },
      { name: 'Assam Current Affairs', url: 'https://chat.aiaxom.co.in/', badge: 'Editorial AI' },
    ],
    capabilities: [
      'Comprehensive Assam History, Culture & Heritage deep-dive synthesis',
      'Mains Answer Writing practice with instant grammatical & factual evaluation',
      'Daily Assam Current Affairs summaries from trusted regional news sources',
      'Assam land laws, tribal policies, and state administrative governance analysis',
      'Bilingual drafting practice in authentic Assamese and English',
    ],
    impactMetric: '3x Faster Revision for Assam General Studies',
    ctaText: 'Practice APSC Prep on Axom AI',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    accent: {
      badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
      badgeText: 'text-amber-700 dark:text-amber-400',
      cardBorder: 'border-amber-900/15 dark:border-amber-500/20',
      btnGrad: 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600',
    },
  },
  {
    id: 'automotive',
    category: 'Automotive',
    badge: 'Nationwide Compliance',
    icon: Car,
    title: 'Automotive, Vehicle Owners & Drivers',
    tagline: 'Certified Ethanol Fuel Compatibility (E10, E20, E85, E100)',
    description:
      'Navigating India’s nationwide 20% ethanol (E20) petrol rollout with verified automotive science. Axom FuelCheck dynamically evaluates vehicle compatibility across 16+ brands and all models from 2010 to 2026, providing official owner manual citations, BS6 Phase-2 verification, and mechanical component durability assessments.',
    researchModel: {
      name: 'Axom FuelCheck™ Intelligence Engine',
      spec: 'MoRTH Notifications, SIAM Circulars & Official OEM Citations',
      url: '/tools/fuel-checker',
    },
    tools: [
      { name: 'Axom FuelCheck (E5–E100)', url: '/tools/fuel-checker', badge: '16+ Brands' },
      { name: 'Automotive Engineer AI', url: '/tools/fuel-checker', badge: 'Corrosion & Mileage' },
      { name: 'Vehicle Document OCR', url: '/tools/chat-with-pdf', badge: 'RC & Insurance' },
    ],
    capabilities: [
      'Instant BS6 Phase-2 (OBD-2 / E20 Ready) vs BS6 Phase-1 vs BS-IV classification',
      'Evaluation of Viton rubber fuel lines, fuel tank coating, and injector wear',
      'Expected mileage reduction percentage calculations (~2-4% on E20)',
      'Direct verbatim citations from manufacturer service manuals and bulletins',
      'Actionable maintenance advice regarding ethanol phase separation and fuel stabilizers',
    ],
    impactMetric: '100% Zero-Hallucination OEM Compatibility Verification',
    ctaText: 'Check Your Vehicle Compatibility',
    ctaUrl: '/tools/fuel-checker',
    accent: {
      badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25',
      badgeText: 'text-cyan-700 dark:text-cyan-400',
      cardBorder: 'border-cyan-900/15 dark:border-cyan-500/20',
      btnGrad: 'from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600',
    },
  },
  {
    id: 'businesses',
    category: 'Enterprise',
    badge: 'Commerce & MSMEs',
    icon: Briefcase,
    title: 'Local Businesses, MSMEs & Startups',
    tagline: 'Automate Regional Customer Support, Invoicing & Digital Marketing',
    description:
      'Empowering tea garden producers, handloom artisans, regional distributors, and Guwahati startups to scale. Axom AI enables businesses to communicate fluently with 15M+ Assamese speakers, create bilingual digital marketing campaigns, convert spreadsheets to protected invoices, and process documents effortlessly.',
    researchModel: {
      name: 'Axom AI Master — XUWOR (সুঁৱৰ)',
      spec: 'Full-Duplex Conversational Intelligence • Sub-0.8s Cloud Latency',
      url: 'https://aiaxom.co.in/research/axomai-multimodal-xuwor/',
    },
    tools: [
      { name: 'Excel to PDF Invoicing', url: '/tools/excel-to-pdf', badge: 'Secure Invoices' },
      { name: 'Protect & Sign PDF', url: '/tools/protect-pdf', badge: '256-Bit Encryption' },
      { name: 'Vernacular Marketing Copy', url: 'https://chat.aiaxom.co.in/', badge: 'WhatsApp Copy' },
    ],
    capabilities: [
      'Automated 24/7 customer query responses in native Assamese and English',
      'Bilingual social media marketing copy for WhatsApp, Facebook, and Instagram',
      'Automated spreadsheet data conversion into protected, watermarked PDF invoices',
      'E-commerce product descriptions tailored for regional and national buyers',
      'Professional commercial correspondence, vendor agreements, and proposal drafting',
    ],
    impactMetric: '65% Reduction in Customer Support Response Latency',
    ctaText: 'Empower Your Business with AI',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    accent: {
      badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
      badgeText: 'text-blue-700 dark:text-blue-400',
      cardBorder: 'border-blue-900/15 dark:border-blue-500/20',
      btnGrad: 'from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600',
    },
  },
  {
    id: 'legal',
    category: 'Legal & Administration',
    badge: 'Law & Governance',
    icon: Scale,
    title: 'Legal Practitioners, Land Records & Administration',
    tagline: 'Complex Revenue Document Parsing, Jamabandi OCR & Bilingual Drafting',
    description:
      'Assam’s legal and administrative framework involves unique vernacular terminology and bilingual records. Axom AI assists advocates, legal clerks, revenue officials, and citizens in understanding complex land records (Chitha, Jamabandi, Pattas), analyzing government circulars, and drafting bilingual legal notices with high precision.',
    researchModel: {
      name: 'Axom AI Bridge — Xetu (সেতু)',
      spec: '38.6 BLEU Translation • 99.4% Assamese Script Purity',
      url: 'https://aiaxom.co.in/research/axomai-trans-xetu/',
    },
    tools: [
      { name: 'Chat with Land Records', url: '/tools/chat-with-pdf', badge: 'Jamabandi OCR' },
      { name: 'PDF to Word Converter', url: '/tools/pdf-to-word', badge: 'Editable Petitions' },
      { name: 'Watermark & Protect PDF', url: '/tools/watermark-pdf', badge: 'Confidentiality' },
    ],
    capabilities: [
      'Deciphering Assamese land revenue terminology (Chitha, Jamabandi, Dag numbers)',
      'Executive summaries of lengthy High Court judgments and statutory orders',
      'Bilingual legal notice, affidavit, and petition draft formulation',
      'Parsing Assam Secretariat notifications, gazettes, and public tenders',
      'Strict ephemeral memory processing with zero client data retention',
    ],
    impactMetric: '100% Data Sovereignty & Indian Legal Compliance',
    ctaText: 'Analyze Legal Documents',
    ctaUrl: '/tools/chat-with-pdf',
    accent: {
      badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
      badgeText: 'text-indigo-700 dark:text-indigo-400',
      cardBorder: 'border-indigo-900/15 dark:border-indigo-500/20',
      btnGrad: 'from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600',
    },
  },
  {
    id: 'healthcare',
    category: 'Public Health',
    badge: 'Medical & Healthcare',
    icon: Stethoscope,
    title: 'Healthcare Professionals & Medical Outreach',
    tagline: 'Democratizing Vital Clinical Communication Across Linguistic Lines',
    description:
      'Bridging communication barriers between doctors, healthcare staff, and rural patients. Axom AI translates complex clinical instructions, prescriptions, and public health guidelines into simple, empathetic colloquial Assamese that patients and families can easily follow.',
    researchModel: {
      name: 'Axom AI Voice — Puhor & Xetu',
      spec: '24kHz Flow-Matching DiT Voice • Script-Pure Medical Vocabulary',
      url: 'https://aiaxom.co.in/research/axomai-voice-puhor/',
    },
    tools: [
      { name: 'Voice Notes Generator', url: '/tools/voice-notes-generator', badge: 'Clinical Voice' },
      { name: 'Chat with Medical PDFs', url: '/tools/chat-with-pdf', badge: 'Research Briefs' },
      { name: 'AI Diagram Generator', url: '/tools/ai-diagram-generator', badge: 'Visual Charts' },
    ],
    capabilities: [
      'Translating complex clinical diagnoses into clear Assamese patient care guides',
      'Generating regional health awareness material for community medical camps',
      'Summarizing international medical literature into rapid clinical briefs',
      'Bilingual patient intake forms and consultation note structuring',
      'Spoken voice guidance for rural patients in native Assamese accents',
    ],
    impactMetric: 'Zero Translation Misunderstandings for Patients',
    ctaText: 'Explore Healthcare AI Tools',
    ctaUrl: 'https://chat.aiaxom.co.in/',
    accent: {
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
      badgeText: 'text-rose-700 dark:text-rose-400',
      cardBorder: 'border-rose-900/15 dark:border-rose-500/20',
      btnGrad: 'from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600',
    },
  },
  {
    id: 'creators',
    category: 'Creative Arts',
    badge: 'Media & Storytelling',
    icon: Palette,
    title: 'Journalists, Writers & Content Creators',
    tagline: 'High-Speed Assamese Journalism, Scriptwriting & Cultural FLUX Art',
    description:
      'Empowering the creative voice of Northeast India. Journalists, digital media channels, YouTubers, authors, and poets utilize Axom AI to write breaking news copy, brainstorm narrative arcs, refine Assamese poetic meter, and generate culturally authentic AI imagery featuring Assamese motifs, traditional attire, and landscapes.',
    researchModel: {
      name: 'Axom AI Voice — Puhor & FLUX Studio',
      spec: '24kHz Studio Audio Synthesis • Indigenous Cultural Prompting',
      url: 'https://aiaxom.co.in/research/axomai-voice-puhor/',
    },
    tools: [
      { name: 'AI Image Generator', url: '/tools/ai-image-generator', badge: 'FLUX 4K Art' },
      { name: 'Background Remover', url: '/tools/background-remover', badge: 'Thumbnails' },
      { name: 'YouTube Video Downloader', url: '/tools/youtube-video-downloader', badge: 'Video Assets' },
    ],
    capabilities: [
      'Rapid breaking news copy drafting and editorial headline ideation in Assamese',
      'Engaging scriptwriting for YouTube videos, podcasts, and social media reels',
      'Bilingual book, story, and article translation preserving literary tone and meter',
      'Photorealistic cultural AI image generation with FLUX diffusion models',
      'Festive and cultural marketing copy for Bihu, Ambubachi, and local events',
    ],
    impactMetric: '5x Increase in Publishing Cadence for Regional Creators',
    ctaText: 'Generate Assamese Content',
    ctaUrl: '/tools/ai-image-generator',
    accent: {
      badgeBg: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/25',
      badgeText: 'text-fuchsia-700 dark:text-fuchsia-400',
      cardBorder: 'border-fuchsia-900/15 dark:border-fuchsia-500/20',
      btnGrad: 'from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600',
    },
  },
  {
    id: 'developers',
    category: 'Engineering',
    badge: 'Technology & Code',
    icon: Code2,
    title: 'Software Developers, Engineers & Startups',
    tagline: 'Full-Stack Code Generation, Indic NLP & Domestic Cloud APIs',
    description:
      'Accelerating software innovation in Guwahati and across Northeast India. Software engineers and startups leverage Axom AI’s coding suite for generating Python, JavaScript, TypeScript, Go, and SQL code, debugging complex stack traces, building regional NLP pipelines, and integrating document automation APIs.',
    researchModel: {
      name: 'Multi-Tiered Model Cascade (GPT-4o → Gemini → Groq)',
      spec: 'Sub-0.8s Edge TTFB • Fail-Safe Auto-Rotation Architecture',
      url: '/docs/developer',
    },
    tools: [
      { name: 'Screenshot to Code', url: '/tools/screenshot-to-code', badge: 'React & Tailwind' },
      { name: 'SVG Vector Editor', url: '/tools/svg-editor', badge: 'Browser Vectors' },
      { name: 'Developer REST API', url: '/docs/developer', badge: 'Python & Node SDK' },
    ],
    capabilities: [
      'Full-stack code generation, unit testing, and automated bug fixing',
      'Fine-tuned Assamese tokenization and Indic text processing scripts',
      'OCR text extraction pipelines from scanned Assamese and bilingual PDFs',
      'Architecture reviews and system design guidance for cloud applications',
      'Sub-second Indian edge API latency for production integrations',
    ],
    impactMetric: '<0.8s Domestic Cloud Edge Execution Latency',
    ctaText: 'Launch Code Assistant',
    ctaUrl: '/docs/developer',
    accent: {
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
      badgeText: 'text-emerald-700 dark:text-emerald-400',
      cardBorder: 'border-emerald-900/15 dark:border-emerald-500/20',
      btnGrad: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600',
    },
  },
];

export default function UseCasesInteractiveHub() {
  return (
    <div className="space-y-10">
      {USE_CASE_SECTORS.map((sector) => {
        const IconComponent = sector.icon;

          return (
            <article
              key={sector.id}
              id={sector.id}
              className={`scroll-mt-28 p-6 sm:p-8 md:p-10 rounded-3xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border ${sector.accent.cardBorder} hover:shadow-2xl transition-all relative overflow-hidden`}
            >
              {/* Subtle Ambient Background Gradient */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (7 cols): Main Content, Capabilities & Applied Tools */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Badge & Title Row */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${sector.accent.badgeBg}`}>
                        {sector.badge}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Sector: {sector.category}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                        <IconComponent className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white tracking-tight">
                          {sector.title}
                        </h3>
                        <p className={`text-xs sm:text-sm font-bold ${sector.accent.badgeText} mt-0.5`}>
                          {sector.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sector Description */}
                  <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {sector.description}
                  </p>

                  {/* Applied Production Tools Strip */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Integrated Production Tools</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {sector.tools.map((tool, tIdx) => (
                        <Link
                          key={tIdx}
                          href={tool.url}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-sm"
                        >
                          <span>{tool.name}</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">
                            {tool.badge}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Key Capabilities Checklist */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                      Key Capabilities &amp; Verified Features
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {sector.capabilities.map((cap, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column (5 cols): Research Model Card, Impact & CTA */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full bg-slate-50/60 dark:bg-slate-950/60 p-6 sm:p-7 rounded-2xl border border-emerald-900/10 dark:border-white/5 space-y-6">
                  
                  {/* Underlying Research Foundation Model */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Proprietary Research Engine</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                      <div className="text-emerald-950 dark:text-white font-bold text-sm">
                        {sector.researchModel.name}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                        {sector.researchModel.spec}
                      </div>
                      <div className="pt-1">
                        <Link
                          href={sector.researchModel.url}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          <span>Explore Research Paper</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Verified Real-World Impact */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Verified Impact Metric</span>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="text-emerald-950 dark:text-white font-bold text-sm sm:text-base leading-snug">
                        {sector.impactMetric}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                        Grounded benchmarks across active regional users
                      </div>
                    </div>
                  </div>

                  {/* Primary Sector Action CTA */}
                  <div className="pt-2">
                    <a
                      href={sector.ctaUrl}
                      className={`w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r ${sector.accent.btnGrad} text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01]`}
                    >
                      <span>{sector.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                </div>

              </div>
            </article>
          );
        })}
      </div>
  );
}

