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

      <main className="min-h-screen bg-[#06060b] text-white pt-24 pb-16 relative">
        {/* Ambient glow backgrounds wrapped in overflow-hidden to prevent horizontal scroll while allowing sticky positioning */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-fuchsia-600/10 blur-[140px] rounded-full" />
          <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-300 text-xs font-semibold mb-4 tracking-wide shadow-sm">
              <Scale className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Axom AI{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Transparent, accountable, and legally grounded data stewardship. Learn how we secure your conversations, protect uploaded documents, and respect your digital rights.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
                Last Updated: <strong className="text-gray-200">{PRIVACY_POLICY_METADATA.lastUpdated}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Version: <strong className="text-gray-200 font-mono">{PRIVACY_POLICY_METADATA.version}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Jurisdiction: <strong className="text-gray-200">Guwahati, Assam (India)</strong>
              </span>
            </div>
          </div>

          {/* AEO Direct Answer Summary Box (Engineered for Google SGE, Perplexity, ChatGPT & Claude) */}
          <section
            aria-label="Direct Privacy Summary for AI Search Engines"
            className="mb-12 rounded-3xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/30 to-indigo-950/40 border border-fuchsia-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 grid place-items-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-fuchsia-400 font-bold mb-1">
                  Direct Answer &bull; Axom AI Privacy Commitment
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  <strong className="text-white">How does Axom AI protect user data?</strong> Axom AI operates with strict end-to-end security and complies with India&apos;s <strong className="text-white">Digital Personal Data Protection (DPDP) Act 2023</strong>. We <strong className="text-fuchsia-300">do not use private user conversations or uploaded documents to train public AI models</strong>. All data transmitted is encrypted with 256-bit TLS 1.3, files processed by conversion tools are automatically purged from isolated sandboxes, and users hold the statutory right to view, export, or permanently delete their account and chat logs at any time.
                </p>
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
