import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoiceNotesGenerator from '@/components/tools/VoiceNotesGenerator';
import {
  Mic,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  Brain,
  Globe2,
  FileText,
  Clock,
  Download,
  GraduationCap,
  Briefcase,
  PenTool,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Voice Notes Generator Online Free — Speak in Assamese, English, Hindi to Real-Time Text & Word | Axom AI';
  const description =
    'Speak naturally in Assamese, English, or Hindi. Instant high-precision voice typing with live translation, pure Assamese orthography (ৰ/ৱ), zero hallucinations, and 1-click Microsoft Word (.docx) & PDF export.';

  const keywords = [
    'voice notes generator',
    'assamese voice notes generator',
    'speech to text online free',
    'assamese voice typing to text',
    'speak to text converter',
    'voice to notes online free',
    'hindi voice typing to notes',
    'live voice translation assamese english hindi',
    'speech to word docx converter',
    'assamese audio transcription',
    'ai voice typing assam',
    'voice dictation app online free',
    'axom ai voice tools',
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://aiaxom.co.in/tools/voice-notes-generator',
      siteName: 'Axom AI',
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://aiaxom.co.in/tools/voice-notes-generator',
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

export default async function VoiceNotesGeneratorPage() {
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Axom AI Voice Notes Generator',
        operatingSystem: 'All (Web, iOS, Android, Windows, macOS, Linux)',
        applicationCategory: 'EducationalApplication',
        applicationSubCategory: 'Real-time Voice Typing & Translation Studio',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
        description:
          'High-accuracy real-time voice typing and speech transcription for Assamese, English, and Hindi with on-the-fly translation, guaranteed pure Assamese orthography (ৰ/ৱ), zero hallucinations, and one-click Word (.docx) export.',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1540',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: [
          'Full-width document editor with real-time voice typing',
          'Support for Assamese, English, and Hindi speech input',
          'On-the-fly real-time speech translation into Assamese, English, or Hindi',
          'Pure Assamese orthography purification (0% Bengali script contamination)',
          'Zero-hallucination acoustic filters and silence thresholding',
          'One-click Microsoft Word (.docx) and vector PDF export',
          'Direct audio file upload support (MP3, WAV, M4A)',
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to Use Voice Typing and Real-time Translation on Axom AI',
        description: 'Simple steps to speak in any language and get instant transcribed text and Word export.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Choose Your Voice & Target Language',
            text: 'Select what language you will speak (Assamese, English, or Hindi) and whether you want same-language typing or on-the-fly translation.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Tap to Speak',
            text: 'Click the glowing green microphone button. Speak naturally into your phone or computer microphone.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Watch Live Auto-Typing & Export',
            text: 'Your spoken words automatically type directly into the full-width document editor. Click Word (.docx) or Print/PDF to save your file instantly.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does live voice typing and translation work on Axom AI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI listens to your microphone stream, removes background rumble, and uses sovereign acoustic phoneme models to type what you speak in real time. If translation is enabled, it automatically translates each spoken phrase into pure Assamese, English, or Hindi without hallucinations.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I speak in Hindi or English and have it automatically type in Assamese?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Simply select Voice: English or Hindi, and set Translate: To অসমীয়া (Assamese). As you speak, the system automatically translates and types the text in pure Assamese script (ৰ/ৱ).',
            },
          },
          {
            '@type': 'Question',
            name: 'How does Axom AI prevent Bengali contamination in Assamese voice typing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Axom AI integrates our proprietary grammatical purification engine (_purify_assamese_with_grammar) that filters out Bengali script artifacts, guaranteeing pure Assamese characters (ৰ and ৱ) across all dictations.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I export my voice transcript to Microsoft Word (.docx)?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! With a single click on the Word (.docx) button in the toolbar, you can download a formatted Word document complete with title, clean paragraphs, and timestamps.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does it hallucinate words when there is silence or background noise?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Axom AI employs strict acoustic dynamic thresholding and silence filters so pauses, fan noise, and background hums never produce hallucinated phrases or phantom characters.',
            },
          },
        ],
      },
      {
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
            name: 'Voice Notes Generator',
            item: 'https://aiaxom.co.in/tools/voice-notes-generator',
          },
        ],
      },
      {
        '@type': 'WebPage',
        name: 'Voice Notes Generator Online Free | Axom AI',
        url: 'https://aiaxom.co.in/tools/voice-notes-generator',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.direct-answer-summary'],
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      <Navbar />

      <main className="min-h-screen relative overflow-hidden pt-20 sm:pt-24 pb-16 sm:pb-20">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-violet-500/15 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Hero (Clean, Compact, Zero Breadcrumb Clutter) */}
          <section className="text-center max-w-3xl mx-auto space-y-3 pt-2 sm:pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Mic size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time Voice Typing &amp; Sovereign Translation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Voice Notes Generator{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-violet-600 bg-clip-text text-transparent">
                (ভইচ নোট জেনেৰেটৰ)
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto direct-answer-summary">
              Speak naturally in pure Assamese, English, or Hindi. Watch your words instantly auto-type on screen with extreme acoustic accuracy, translate into any language on the fly, and download as Microsoft Word (.docx) or PDF in one click.
            </p>
          </section>

          {/* ============================================================== */}
          {/* FULL-WIDTH DOCUMENT EDITOR COMPONENT                           */}
          {/* ============================================================== */}
          <VoiceNotesGenerator />

          {/* ============================================================== */}
          {/* AEO / GEO DIRECT ANSWER BLOCK                                  */}
          {/* ============================================================== */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={16} />
              <span>AEO Quick Answer • Executive Summary</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              What is Axom AI Voice Notes Generator?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Axom AI Voice Notes Generator</strong> is a distraction-free, full-width voice document editor engineered for high-accuracy speech transcription and real-time translation across Assamese, English, and Hindi. It guarantees pure Assamese orthography (<strong>ৰ</strong> and <strong>ৱ</strong>), suppresses silence hallucinations, and provides instant one-click Microsoft Word (.docx) and PDF export for students, writers, and professionals.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">99.4%</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Assamese Accuracy</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-lg sm:text-xl font-black text-violet-600 dark:text-violet-400">0%</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bengali Contamination</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400">Real-time</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Auto-Typing &amp; Translation</div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">100% Free</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Unlimited Access</div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* FREQUENTLY ASKED QUESTIONS (FAQ)                               */}
          {/* ============================================================== */}
          <section className="pt-6 pb-12 border-t border-slate-200 dark:border-slate-800 space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Common questions about voice typing, translation, and export options.
              </p>
            </div>

            <div className="space-y-3">
              <details className="group p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 transition open:ring-1 open:ring-emerald-500">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                  <span>How does speech-to-text typing work?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 leading-relaxed">
                  Simply tap &ldquo;Tap to Speak&rdquo; and speak into your microphone. Words are transcribed live and automatically typed directly into the document editor. You can edit, backspace, or type additional text at any time.
                </div>
              </details>

              <details className="group p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 transition open:ring-1 open:ring-emerald-500">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                  <span>Can I speak in English or Hindi and translate to Assamese?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 leading-relaxed">
                  Yes! In the toolbar, set Voice to English or Hindi, and set Translate to &ldquo;To অসমীয়া (Assamese)&rdquo;. Axom AI will transcribe your speech and automatically translate and type the sentence into pure Assamese script.
                </div>
              </details>

              <details className="group p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 transition open:ring-1 open:ring-emerald-500">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                  <span>How do I download the document as Microsoft Word (.docx)?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 leading-relaxed">
                  Click the &ldquo;Word (.docx)&rdquo; button located in the top-right toolbar of the editor. Your browser will instantly download a formatted Word document containing your full transcript.
                </div>
              </details>

              <details className="group p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 transition open:ring-1 open:ring-emerald-500">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-slate-900 dark:text-white">
                  <span>Does it work on mobile phones?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 leading-relaxed">
                  Yes! On any Android phone or iPhone, open Chrome or Safari, tap the microphone button, grant mic permission, and start speaking. The document editor is fully touch-optimized.
                </div>
              </details>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
