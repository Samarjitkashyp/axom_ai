import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FAQPageContent from '../../components/FAQPageContent';
import { FULL_FAQS_LIST } from '../../components/faqFullData';
import { getLandingCMS } from '../../lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  // Primary SEO Keyword
  'Axom AI FAQ',
  // Secondary SEO Keywords
  'Axom AI frequently asked questions',
  'Axom AI questions',
  'Axom AI help',
  'Axom AI help center',
  'Axom AI support',
  'Axom AI guide',
  'Assamese AI FAQ',
  'Assamese AI questions',
  'Axom AI information',
  'Axom AI features',
  'Axom AI tools',
  'Axom AI pricing',
  'Axom AI subscription',
  'Axom AI privacy',
  'Axom AI security',
  // AEO Question Keywords
  'What is Axom AI',
  'How does Axom AI work',
  'How does Axom AI understand Assamese',
  'Does Axom AI support Assamese',
  'Can Axom AI reply in Assamese',
  'Is Axom AI free',
  'How do I use Axom AI',
  'How do I start using Axom AI',
  'What AI models does Axom AI use',
  'What can Axom AI do',
  'What AI tools does Axom AI offer',
  'Is Axom AI safe',
  'Is Axom AI secure',
  'Is my data safe with Axom AI',
  'Does Axom AI store uploaded files',
  'Can I delete my Axom AI data',
  'Can Axom AI analyze PDFs',
  'Can Axom AI summarize documents',
  'Can Axom AI search the web',
  'Can Axom AI generate images',
  'Can Axom AI write code',
  'Can Axom AI translate Assamese',
  'Can Axom AI translate English to Assamese',
  'How accurate is Axom AI in Assamese',
  'How does Axom AI pricing work',
  'What is the Axom AI free plan',
  'What payment methods does Axom AI accept',
  'Can I cancel my Axom AI subscription',
  'How can I contact Axom AI support',
  // Assamese AEO Queries
  'Axom AI কি',
  'Axom AI কেনেকৈ কাম কৰে',
  'Axom AI-য়ে অসমীয়া বুজিব পাৰেনে',
  'Axom AI-য়ে অসমীয়াত উত্তৰ দিব পাৰেনে',
  'Axom AI কি বিনামূলীয়া',
  'Axom AI কেনেকৈ ব্যৱহাৰ কৰিব',
  'Axom AI-ত কি কি AI tools আছে',
  'Axom AI-ত কোনবোৰ AI model ব্যৱহাৰ কৰা হয়',
  'Axom AI-ত মোৰ data সুৰক্ষিত নেকি',
  'Axom AI-ত PDF analyze কৰিব পাৰিনে',
  'Axom AI-য়ে web search কৰিব পাৰেনে',
  'Axom AI-য়ে image generate কৰিব পাৰেনে',
  // GEO Queries
  'what is Axom AI and how does it work',
  'AI platform that understands Assamese',
  'AI chatbot that can reply in Assamese',
  'Assamese language AI assistant',
  'AI assistant for Assamese users',
  'AI platform for Assam',
  'AI tools that support Assamese language',
  'AI platform built in Assam',
  'AI assistant for Northeast India',
  'Assamese AI platform online',
  'AI platform with Assamese language support',
  'AI tools for Assamese students',
  'AI assistant for Assamese businesses',
  'AI platform with Assamese translation',
  'AI tool for Assamese document analysis',
  // Models & Tools
  'Axom AI models',
  'what model does Axom AI use',
  'Axom AI Gemini',
  'Axom AI Claude',
  'Axom AI FLUX',
  'Axom AI IndicTrans2',
  'Axom AI document analyzer',
  'Axom AI image generator',
  'Axom AI code assistant',
  'Axom AI OCR',
];

export async function generateMetadata(): Promise<Metadata> {
  const landingData = await getLandingCMS().catch(() => null);
  const faqPage = landingData?.faq_page;

  const title =
    'Axom AI FAQ — Frequently Asked Questions & Help Center | Assamese AI Support';
  const description =
    'Get instant answers to all questions about Axom AI (Assam AI): Assamese language accuracy, AI models (Gemini, Claude, FLUX), pricing plans, UPI payments, PDF OCR, security & DPDP compliance.';
  const canonicalUrl = 'https://aiaxom.co.in/faq/';
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
          alt: 'Axom AI FAQ & Knowledgebase',
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

export default async function FAQPage() {
  const landingData = await getLandingCMS().catch(() => null);

  // Schema.org FAQPage Structured Data for Google Rich Snippets (all 30 Q&As mapped)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FULL_FAQS_LIST.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    alternateName: ['AI Axom', 'Assam AI', 'অসম এআই', 'AxomAI'],
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      addressCountry: 'IN',
      postalCode: '781001',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@aiaxom.co.in',
      availableLanguage: ['Assamese', 'English', 'Hindi'],
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <Navbar header={landingData?.header} />

      <main className="flex-1 pt-20">
        <FAQPageContent
          serverFaqs={FULL_FAQS_LIST}
          faqConfig={landingData?.faq_page}
        />
      </main>

      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
