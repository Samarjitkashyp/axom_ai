import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BlogSearchFilter from '../../components/BlogSearchFilter';
import { getArticlesCMS, getLandingCMS } from '../../lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Axom AI Blog & Insights — AI Guides, Updates & Research in Assam',
  description: 'Explore comprehensive guides, tutorials, model updates, and research on artificial intelligence, Assamese NLP, and regional digital innovation on the official Axom AI Blog.',
  keywords: ['Axom AI Blog', 'AI in Assam', 'Assamese AI', 'AI tools Assam', 'AI guides', 'AI research Assam', 'Axom AI updates', 'Northeast India AI'],
  alternates: {
    canonical: 'https://aiaxom.co.in/blog/',
  },
  openGraph: {
    title: 'Axom AI Blog & Insights — AI in Assam & Beyond',
    description: 'Discover guides, tutorials, and regional AI insights from the Axom AI team and community.',
    url: 'https://aiaxom.co.in/blog/',
    siteName: 'Axom AI',
    type: 'website',
    images: [
      {
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
        width: 1200,
        height: 630,
        alt: 'Axom AI Blog & Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axom AI Blog & Insights',
    description: 'Explore artificial intelligence guides, research, and updates built in Assam.',
    images: ['https://aiaxom.co.in/static/dist/hero/assam.avif'],
  },
};

export default async function BlogPage() {
  const [{ articles, categories, total_count }, landingData] = await Promise.all([
    getArticlesCMS(),
    getLandingCMS()
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#06060b] text-[#e5e7eb]">
      <Navbar header={landingData?.header} />

      <main className="flex-1 pt-20">
        <BlogSearchFilter initialArticles={articles} categories={categories} totalCount={total_count} />
      </main>

      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
