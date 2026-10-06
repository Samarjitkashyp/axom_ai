import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import AiNotesGenerator from '../../../components/tools/AiNotesGenerator';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Shield,
  Zap,
  CheckCircle,
  Award,
  Layers,
  Check,
  X as XIcon,
  HelpCircle,
  Brain,
  Globe2,
  FileText,
  Clock,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const TARGET_KEYWORDS = [
  'ai notes generator',
  'ai notes generator from pdf',
  'generate notes from pdf',
  'pdf to notes ai',
  'study notes generator',
  'ai study notes',
  'chapter to notes ai',
  'exam notes generator',
  'ai revision notes',
  'free ai notes maker',
  'notes maker online',
  'ai summary to notes',
  'pdf study material to notes',
  'ai flashcards and quiz generator',
  'ai notes generator assamese',
  'ai notes generator india',
  'how to turn pdf into notes with ai',
  'best ai tool for student notes',
  'ai teacher lesson plan generator',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'AI Notes Generator Online Free — Turn PDFs & Chapters into Study Notes | Axom AI';
  const description =
    'Turn your PDFs, textbook chapters, or study materials into structured revision notes with AI. Supports Quick Notes, Exam Points, Definitions, Flashcards, and Quizzes in English, Assamese, and Hindi.';
  const canonicalUrl = 'https://aiaxom.co.in/tools/ai-notes-generator';
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
          alt: title,
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

export default function AiNotesGeneratorPage() {
  const faqs = [
    {
      q: 'How does Axom AI Notes Generator turn PDFs into structured notes?',
      a: 'Axom AI uses high-precision document extraction to read PDF, DOCX, and TXT files page by page. It identifies chapter headings, key concepts, formulas, definitions, and exam-relevant sections. Then, our pedagogical AI synthesizes them into organized study notes with Table of Contents, bullet points, and high-yield scoring tips.',
    },
    {
      q: 'Does it support regional Indian languages like Assamese and Hindi?',
      a: 'Yes! Axom AI natively supports Assamese (অসমীয়া), Hindi (मानक हिन्दी), Hinglish, Bengali, and English. You can also toggle the option to keep technical, scientific, and mathematical terms in English while explaining concepts in your chosen regional language.',
    },
    {
      q: 'Can I generate flashcards and quizzes from the notes?',
      a: 'Absolutely. With one click, your generated notes can be converted into interactive flashcards for active recall, chapter mastery quizzes with instant explanations, and model exam practice questions with answer schemes.',
    },
    {
      q: 'Can I download the notes as a Word (.docx) or PDF document?',
      a: 'Yes. You can export your notes directly as a professionally formatted Microsoft Word (.docx) document or a clean, watermark-free PDF ready for printing or offline study.',
    },
    {
      q: 'What is the difference between Student Mode and Teacher Mode?',
      a: 'Student Mode focuses on clear conceptual understanding, memory mnemonics, formulas, and high-yield board exam scoring points. Teacher Mode produces structured pedagogical lesson plans, classroom discussion prompts, teaching examples, homework assignments, and assessment question banks.',
    },
  ];

  // Structured JSON-LD Schemas
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Axom AI Notes Generator',
    url: 'https://aiaxom.co.in/tools/ai-notes-generator',
    description:
      'Online educational AI utility to transform textbook chapters, PDFs, and study materials into clean, structured study notes, flashcards, quizzes, and mind maps.',
    applicationCategory: 'EducationalApplication, UtilitiesApplication',
    operatingSystem: 'All (Web Browser, Windows, macOS, Linux, Android, iOS)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      'Turn PDFs, DOCX, and text into structured study notes',
      'Choose Quick Notes, Detailed Notes, Exam Notes, or Simple Notes',
      'Tailored education levels from Class 5 through University & Professional',
      'Supports English, Assamese, Hindi, Hinglish, and Bengali',
      'One-click interactive flashcards and chapter quizzes',
      'Ask doubts from notes with AI Context Q&A',
      'Export to styled DOCX Word document and PDF',
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate AI Study Notes from PDF Online',
    description:
      'Step-by-step guide to upload your study material and generate structured notes with Axom AI.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload Study Material',
        text: 'Upload your PDF, DOCX file or paste the chapter text into the input box.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Notes Preferences',
        text: 'Choose your desired note type (Quick, Detailed, Exam, or Simple), class level, language, and length.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Generate & Study',
        text: 'Click Generate Notes. Review your notes, create flashcards or quizzes, and export to PDF or DOCX.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
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
        name: 'Tools',
        item: 'https://aiaxom.co.in/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'AI Notes Generator',
        item: 'https://aiaxom.co.in/tools/ai-notes-generator',
      },
    ],
  };

  return (
    <>
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="min-h-screen bg-[#0b1220] text-slate-200 relative overflow-hidden pt-28 pb-20">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HERO SECTION */}
          <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold mb-4 shadow-sm">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span>🎓 Axom AI Sovereign Study Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
              AI <span className="gradient-text">Notes Generator</span> Online
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
              Turn your PDF, textbook chapter, or study material into clear, structured notes with AI.
              Equipped with active recall flashcards, practice quizzes, and multi-format exports.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> PDF, DOCX & Text
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Assamese, English & Hindi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Flashcards & Quizzes
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                <Check size={14} className="text-emerald-400" /> Export PDF & Word
              </span>
            </div>
          </section>

          {/* MAIN INTERACTIVE TOOL WIDGET */}
          <section id="generator" className="mb-16">
            <AiNotesGenerator />
          </section>

          {/* GENERATIVE ENGINE SUMMARY / AEO DIRECT ANSWER */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/25 shadow-2xl relative overflow-hidden">
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <Sparkles size={22} className="text-fuchsia-400" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    <span>Quick Answer • Sovereign Educational AI</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    What is Axom AI Notes Generator?
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    <strong>Axom AI Notes Generator</strong> is an advanced pedagogical tool tailored for Indian students and educators. It automatically extracts, cleans, and organizes complex textbook chapters and lecture PDFs into <strong>Quick Notes</strong>, <strong>Detailed Explanations</strong>, and <strong>Exam Scoring Outlines</strong>. Unlike generic summarizers, it maps source page numbers, extracts formulas, generates interactive flashcards and quizzes, and fully preserves technical terms in English while offering explanations in <strong>Assamese</strong>, <strong>Hindi</strong>, <strong>Hinglish</strong>, or <strong>English</strong>.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> 100% Free Daily Quota
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Zero Watermarks on Export
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle size={16} /> Student & Teacher Modes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                How to Generate Study Notes in 3 Simple Steps
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                No complicated setup or account lockouts. Turn any study material into mastery notes in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg mx-auto mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">Upload Document</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Drop your textbook chapter, research PDF, DOCX, or paste syllabus text.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center text-fuchsia-400 font-bold text-lg mx-auto mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">Select Preferences</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Choose Class level (Class 5–12, College), note style (Quick/Exam), and preferred language.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">Study, Practice & Export</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Read organized notes, flip flashcards, test yourself with quizzes, and export to Word or PDF.
                </p>
              </div>
            </div>
          </section>

          {/* COMPARISON TABLE */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Axom AI Notes vs. Generic Summarizers
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Built specifically for syllabus mastery, exams, and pedagogical clarity.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-semibold">Feature</th>
                    <th className="p-4 sm:p-5 font-bold text-purple-300 bg-purple-500/10 border-x border-purple-500/20">
                      Axom AI Notes Generator
                    </th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Generic ChatGPT</th>
                    <th className="p-4 sm:p-5 font-medium text-slate-400">Manual Note Taking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Structure & TOC</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5">
                      <Check size={16} className="shrink-0" />
                      Automatic Table of Contents
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Unstructured walls of text</td>
                    <td className="p-4 sm:p-5 text-slate-400">Takes hours to organize</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Regional Languages</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5">
                      <Check size={16} className="shrink-0" />
                      Assamese, Hindi & English
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Prone to script distortion</td>
                    <td className="p-4 sm:p-5 text-slate-400">Manual writing</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Flashcards & Quizzes</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5">
                      <Check size={16} className="shrink-0" />
                      Built-in with 1 click
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Requires separate prompts</td>
                    <td className="p-4 sm:p-5 text-slate-400">Extra effort needed</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Word & PDF Export</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-purple-500/5 border-x border-purple-500/10 flex items-center gap-1.5">
                      <Check size={16} className="shrink-0" />
                      Direct formatted .docx & .pdf
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Copy-paste plain text only</td>
                    <td className="p-4 sm:p-5 text-slate-400">Paper notebooks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQS SECTION */}
          <section className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Got questions about the AI Notes Generator? Find answers below.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/30 transition space-y-2"
                >
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle size={18} className="text-purple-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* BOTTOM CTA */}
          <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-fuchsia-900/30 via-purple-900/20 to-indigo-900/30 border border-purple-500/30 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Master Your Study Material?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
              Upload your chapter PDF or lecture material now and generate professional, high-scoring study notes in seconds.
            </p>
            <a
              href="#generator"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/30 hover:scale-105 transition"
            >
              <Sparkles size={16} />
              <span>Generate Notes Now — Free</span>
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
