import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PrivacyInteractiveContent from '../../components/PrivacyInteractiveContent';
import { PRIVACY_POLICY_METADATA, PRIVACY_FAQS } from '../../components/privacyData';
import { getLandingCMS } from '../../lib/api';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Building,
  Scale,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'Axom AI Privacy Policy',
  // Secondary SEO Keywords
  'Axom AI privacy',
  'Axom AI data privacy',
  'Axom AI privacy policy',
  'Axom AI data protection',
  'Axom AI security',
  'Axom AI user privacy',
  'Axom AI data security',
  'Axom AI information security',
  'Axom AI personal data',
  'Axom AI user data',
  'Axom AI data protection policy',
  'Axom AI privacy practices',
  'AI platform privacy policy',
  'AI chatbot privacy policy',
  'AI tool privacy policy',
  // AEO Question Keywords
  'Is Axom AI safe to use',
  'How does Axom AI protect my data',
  'What data does Axom AI collect',
  'Does Axom AI collect personal information',
  'Does Axom AI store my conversations',
  'Does Axom AI store uploaded files',
  'How long does Axom AI keep my data',
  'Does Axom AI use my data to train AI models',
  'How does Axom AI use personal information',
  'Can I delete my Axom AI data',
  'How can I request deletion of my data',
  'Does Axom AI share my data with third parties',
  'Does Axom AI use cookies',
  'How does Axom AI protect uploaded documents',
  'Is my information encrypted on Axom AI',
  'How can I contact Axom AI about privacy',
  'What are my privacy rights when using Axom AI',
  // GEO Keywords
  'Axom AI privacy and security',
  'Axom AI data protection',
  'Axom AI privacy practices',
  'how Axom AI protects user data',
  'Axom AI data retention policy',
  'Axom AI AI data privacy',
  'Axom AI chatbot data privacy',
  'Axom AI document privacy',
  'Axom AI file security',
  'Axom AI conversation privacy',
  'privacy policy for Axom AI',
  'secure AI platform in Assam',
  'Assamese AI privacy',
  'Assamese AI data security',
  // Data Privacy Cluster & Cookies
  'user data privacy',
  'personal data protection',
  'data collection policy',
  'data retention policy',
  'data deletion policy',
  'AI conversation privacy',
  'uploaded file privacy',
  'Axom AI cookies policy',
  'Axom AI cookie policy',
  // Security & India Legal
  'Axom AI encryption',
  'secure AI platform',
  'Axom AI India privacy policy',
  'AI privacy policy India',
  'data privacy India',
  'personal data protection India',
  'Indian AI platform privacy policy'
];

export const metadata: Metadata = {
  title: 'Axom AI Privacy Policy — Data Protection, Security & DPDP Compliance',
  description:
    'Axom AI Privacy Policy: Learn how we protect your data, conversations, and uploaded documents. Fully compliant with India’s DPDP Act 2023 with 256-bit encryption and zero training on private data.',
  keywords: TARGET_KEYWORDS,
  alternates: {
    canonical: 'https://aiaxom.co.in/privacy/',
  },
  openGraph: {
    title: 'Axom AI Privacy Policy — Data Protection, Security & DPDP Compliance',
    description:
      'Official privacy practices and data protection policy of Axom AI. Learn about 256-bit encryption, stateless AI inference, file purging, and your statutory rights under the DPDP Act 2023.',
    url: 'https://aiaxom.co.in/privacy/',
    siteName: 'Axom AI',
    locale: 'en_IN',
    images: [
      {
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        width: 1200,
        height: 630,
        alt: 'Axom AI Privacy Policy and Data Security Protocol',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axom AI Privacy Policy — Data Protection, Security & DPDP Compliance',
    description:
      'Official privacy practices and data protection policy of Axom AI. Compliant with India’s DPDP Act 2023 with zero training on private customer data.',
    images: ['https://aiaxom.co.in/static/dist/hero/assam.avif'],
  },
};

export default async function PrivacyPage() {
  const landingData = await getLandingCMS().catch(() => null);

  // Schema 1: WebPage / Privacy Policy
  const privacyPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Axom AI Privacy Policy — Data Protection, Security & DPDP Compliance',
    url: 'https://aiaxom.co.in/privacy/',
    description:
      'Official data protection and privacy policy for Axom AI, establishing statutory compliance under India’s Digital Personal Data Protection (DPDP) Act 2023.',
    datePublished: '2025-01-01',
    dateModified: '2026-09-17',
    inLanguage: ['en-IN', 'as-IN'],
    about: {
      '@type': 'Thing',
      name: 'Data Privacy and Information Security',
      description:
        'Policies governing personal data collection, stateless AI inference, file sandbox purging, and user data rights on Axom AI.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Axom AI',
      alternateName: ['AI Axom', 'অসম এআই'],
      url: 'https://aiaxom.co.in',
      logo: 'https://aiaxom.co.in/axom-brand-logo.png',
      email: 'support@aiaxom.co.in',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guwahati',
        addressRegion: 'Assam',
        postalCode: '781001',
        addressCountry: 'IN',
      },
    },
  };

  // Schema 2: Organization Entity with Data Protection Officer Contact
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    alternateName: ['AI Axom', 'অসম এআই', 'Assam AI'],
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/axom-brand-logo.png',
    email: 'support@aiaxom.co.in',
    founder: {
      '@type': 'Person',
      name: 'Samarjit Kashyap',
      jobTitle: 'Founder & Lead Engineer',
      email: 'samarjitkashyp@gmail.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      postalCode: '781001',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'data protection and privacy grievances',
      email: 'support@aiaxom.co.in',
      availableLanguage: ['English', 'Assamese', 'Hindi'],
    },
  };

  // Schema 3: FAQPage Schema for Privacy Q&As
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRIVACY_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Schema 4: BreadcrumbList
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
        name: 'Privacy Policy',
        item: 'https://aiaxom.co.in/privacy/',
      },
    ],
  };

  return (
    <>
      {/* Schema.org Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar header={landingData?.header} />

      <main className="min-h-screen bg-[#06060b] text-slate-200 relative overflow-hidden pt-28 pb-20">
        {/* Ambient Gradient Glows (Matching use-cases) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
          <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-fuchsia-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-purple-600/15 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-indigo-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold mb-5 shadow-sm">
              <Scale className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Axom AI{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6">
              Transparent, accountable, and legally grounded data stewardship. Learn how we secure your conversations, protect uploaded documents, and respect your digital rights.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
                Last Updated: <strong className="text-slate-200">{PRIVACY_POLICY_METADATA.lastUpdated}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Version: <strong className="text-slate-200 font-mono">{PRIVACY_POLICY_METADATA.version}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Jurisdiction: <strong className="text-slate-200">Guwahati, Assam (India)</strong>
              </span>
            </div>
          </div>

          {/* AEO Direct Answer Summary Box (Engineered for Google SGE, Perplexity, ChatGPT & Claude) */}
          <section
            aria-label="Direct Privacy Summary for AI Search Engines"
            className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/25 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 sm:gap-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  <span>AEO Direct Summary &bull; Axom AI Privacy Commitment</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  How does Axom AI protect user data?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  <strong>Axom AI</strong> operates with strict end-to-end security and complies with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>. We <strong>do not use private user conversations or uploaded documents to train public AI models</strong>. All data transmitted is encrypted with 256-bit TLS 1.3, files processed by conversion tools are automatically purged from isolated memory sandboxes, and users hold the statutory right to view, export, or permanently delete their account and chat logs at any time.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 size={16} /> Zero Foundation Model Training
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 size={16} /> 256-Bit TLS 1.3 Encryption
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 size={16} /> DPDP Act 2023 Compliant
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Policy Content */}
          <PrivacyInteractiveContent />
        </div>
      </main>

      <Footer footer={landingData?.footer} />
    </>
  );
}
