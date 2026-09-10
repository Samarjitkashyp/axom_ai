import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FAQPageContent from '../../components/FAQPageContent';
import { getLandingCMS } from '../../lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Axom AI — Assam\'s First AI Platform',
  description: 'Find answers to common questions about Axom AI tools, Assamese language support, Gemini & FLUX models, pricing plans, security, and document analysis.',
  keywords: [
    'Axom AI FAQ',
    'Assamese AI Questions',
    'How to use Axom AI',
    'Axom AI Pricing',
    'Assam AI Platform Support',
    'Axom AI Models',
  ],
  alternates: {
    canonical: 'https://aiaxom.co.in/faq/',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Axom AI',
    description: 'Find answers to common questions about Axom AI tools, language accuracy, billing, and models.',
    url: 'https://aiaxom.co.in/faq/',
    siteName: 'Axom AI',
    type: 'website',
    images: [
      {
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        width: 1200,
        height: 630,
        alt: 'Axom AI FAQ Help Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions (FAQ) | Axom AI',
    description: 'Find answers to common questions about Axom AI tools, language accuracy, billing, and models.',
    images: ['https://aiaxom.co.in/static/dist/hero/assam.avif'],
  },
};

export default async function FAQPage() {
  const landingData = await getLandingCMS();
  const serverFaqs = (landingData?.all_faqs && landingData.all_faqs.length > 0) ? landingData.all_faqs : (landingData?.faqs || []);

  // Schema.org FAQPage Structured Data for Google Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Axom AI and who is it built for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Axom AI is Assam\'s premier artificial intelligence platform designed specifically for students, educators, writers, freelancers, businesses, and developers in Northeast India.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which AI models power Axom AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Axom AI leverages world-class state-of-the-art models including Gemini 2.5 Pro / Flash for reasoning, FLUX and Pollinations for HD image generation, Claude 3.5 Sonnet for code, and fine-tuned IndicTrans2 for Assamese.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate is Axom AI in Assamese (অসমীয়া)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Axom AI uses dedicated regional fine-tuning and Indic language benchmarks to deliver natural, grammatically sound Assamese text with cultural and local context.',
        },
      },
      {
        '@type': 'Question',
        name: 'What payment methods do you accept?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept all major Indian payment methods via Razorpay: UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), and Netbanking.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my personal data and document content kept confidential?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all communication is encrypted via 256-bit SSL/TLS in transit and encrypted at rest. We do not sell your personal data or use private documents to train public third-party models.',
        },
      },
    ],
  };

  // Breadcrumbs Schema
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
        name: 'FAQ',
        item: 'https://aiaxom.co.in/faq/',
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#06060b] text-[#e5e7eb]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar header={landingData?.header} />

      <main className="flex-1 pt-20">
        <FAQPageContent serverFaqs={serverFaqs} faqConfig={landingData?.faq_page} />
      </main>

      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
