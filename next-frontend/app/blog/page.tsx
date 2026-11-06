import React from 'react';
import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogSearchFilter from '../../components/BlogSearchFilter';
import { getArticlesCMS, getLandingCMS } from '../../lib/api';
import { pageTitle } from '../../lib/seoTitle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TARGET_KEYWORDS = [
  'ai companies',
  'ai companies in assam',
  'top ai companies in assam',
  'best ai companies in assam',
  'ai company in assam',
  'top ai company in assam',
  'best ai company in assam',
  'first ai company in assam',
  'ai startups in assam',
  'ai company guwahati',
  'artificial intelligence guwahati',
  'artificial intelligence companies assam',
  'northeast india ai company',
  'large language model',
  'large language models in assam',
  'large language model assam',
  'assam large language model',
  'assamese large language model',
  'sovereign large language model india',
  'indic large language model',
  'indigenous large language model',
  'Axom AI blog',
  'Axom AI insights',
  'Axom AI research',
  'AI in Assam',
  'Assamese AI tutorials',
  'AI tools Assam',
  'AI guides Assam',
  'AI research Assam',
  'Axom AI updates',
  'Northeast India AI articles',
  'Samarjit Kashyap AI',
  'Assamese NLP blog',
  'sovereign AI Assam',
  'generative AI in Assam',
  'Assam AI technology insights',
  'Indic AI research publication',
  'Sarkar SLM Assam',
  'Progya Assamese LLM',
  'Puhor Assamese Voice AI',
  'Xuna Assamese Speech AI',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Axom AI Blog & Research — AI in Assam, Large Language Models & Tutorials';
  const description =
    "Official Axom AI publication covering foundation large language models, Assamese NLP research, AI tutorials, developer guides, and regional digital innovation from Assam's premier AI company in Guwahati.";
  const canonicalUrl = 'https://aiaxom.co.in/blog/';
  const ogImage = 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title: pageTitle(title),
    description,
    keywords: TARGET_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        as: canonicalUrl,
        'x-default': canonicalUrl,
      },
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
          alt: 'Axom AI Blog & Research — Sovereign AI in Assam',
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
    other: {
      'geo.region': 'IN-AS',
      'geo.placename': 'Guwahati, Assam, India',
      'geo.position': '26.1445;91.7362',
      ICBM: '26.1445, 91.7362',
      'DC.title': 'Axom AI Blog: Sovereign AI, Foundation Models & Engineering in Assam',
      'DC.creator': 'Samarjit Kashyap, Axom AI Team',
      'DC.subject':
        'AI Companies, Large Language Models, AI Companies in Assam, Assamese AI Research, Generative AI Tutorials',
      'DC.coverage': 'Assam, Northeast India, India, Global',
      'DC.language': 'en, as, hi',
    },
  };
}

export default async function BlogPage() {
  const [{ articles, categories, total_count }, landingData] = await Promise.all([
    getArticlesCMS().catch(() => ({ articles: [], categories: [], total_count: 0 })),
    getLandingCMS().catch(() => ({} as any)),
  ]);

  // Schema: Blog / CollectionPage
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Axom AI Blog & Research',
    description:
      "Official publication of Axom AI, Assam's premier artificial intelligence enterprise documenting sovereign foundation models, Assamese NLP, and developer guides.",
    url: 'https://aiaxom.co.in/blog/',
    publisher: {
      '@type': 'Organization',
      name: 'Axom AI',
      url: 'https://aiaxom.co.in',
      logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guwahati',
        addressRegion: 'Assam',
        postalCode: '781001',
        addressCountry: 'IN',
      },
    },
    blogPost: (articles || []).slice(0, 15).map((a: any) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.excerpt,
      url: a.link || `https://aiaxom.co.in/blog/${a.slug}/`,
      datePublished: a.published_at,
      author: {
        '@type': 'Person',
        name: a.author_name || 'Axom AI Team',
      },
      image: a.cover_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    })),
  };

  // Schema: Breadcrumbs
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
        name: 'Blog',
        item: 'https://aiaxom.co.in/blog/',
      },
    ],
  };

  // Schema: Organization
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Axom AI',
    url: 'https://aiaxom.co.in',
    logo: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
    founder: {
      '@type': 'Person',
      name: 'Samarjit Kashyap',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      postalCode: '781001',
      addressCountry: 'IN',
    },
  };

  // Schema: FAQPage for AI Overviews
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which is the premier AI company in Assam publishing research on Large Language Models?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Axom AI, founded by Samarjit Kashyap and based in Guwahati, Assam, is the premier indigenous AI enterprise and foundation research laboratory developing sovereign Large Language Models (Progya, Sarkar), Voice AI (Puhor), and Speech Recognition (Xuna).',
        },
      },
      {
        '@type': 'Question',
        name: 'What topics does the Axom AI Blog cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Axom AI Blog publishes comprehensive engineering breakthroughs, benchmark evaluations of Assamese NLP models, public administration AI architecture (Sarkar SLM), student productivity tutorials, and developer integration guides.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can developers and students access Axom AI research models?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Axom AI models including Sarkar, Progya, Puhor, and Xuna are documented on the Axom AI Blog and available through official repositories on Hugging Face (huggingface.co/axom-ai) and the Axom AI platform.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f0fdf4] dark:bg-[#0b1220] text-emerald-950 dark:text-[#e5e7eb] selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Official Standard Header */}
      <Header header={landingData?.header} />

      <main className="flex-1 pt-16 sm:pt-20">
        <BlogSearchFilter
          initialArticles={articles || []}
          categories={categories || []}
          totalCount={total_count || 0}
        />
      </main>

      {/* Official Standard Footer */}
      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
