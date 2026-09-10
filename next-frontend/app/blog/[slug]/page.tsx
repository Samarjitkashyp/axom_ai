import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getArticleDetailCMS, getArticlesCMS, getLandingCMS } from '../../../lib/api';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60; // ISR

// Generate static params for all published articles
export async function generateStaticParams() {
  const { articles } = await getArticlesCMS();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Dynamic metadata for SEO & Social Cards
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const data = await getArticleDetailCMS(params.slug);
  if (!data || !data.article) {
    return {
      title: 'Article Not Found | Axom AI',
      description: 'The requested article could not be found.',
    };
  }

  const { article } = data;
  const canonicalUrl = `https://aiaxom.co.in/blog/${article.slug}/`;
  const ogImage = article.cover_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  return {
    title: `${article.title} | Axom AI`,
    description: article.excerpt || article.title,
    alternates: {
      canonical: canonicalUrl,
    },
    authors: [{ name: article.author_name || 'Axom AI Team' }],
    keywords: [
      article.category_label,
      'Axom AI',
      'Assam AI',
      'Artificial Intelligence Assam',
      article.title,
    ],
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      url: canonicalUrl,
      siteName: 'Axom AI',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author_name || 'Axom AI'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
      images: [ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const [data, landingData] = await Promise.all([
    getArticleDetailCMS(params.slug),
    getLandingCMS()
  ]);

  if (!data || !data.article) {
    notFound();
  }

  const { article, related_articles } = data;
  const canonicalUrl = `https://aiaxom.co.in/blog/${article.slug}/`;
  const coverImage = article.cover_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif';

  // Article Schema JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: [coverImage],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.author_name || 'Axom AI Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Axom AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aiaxom.co.in/static/dist/hero/assam.avif',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  // Breadcrumbs Schema JSON-LD
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
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar header={landingData?.header} />

      <main className="pt-28 pb-20 flex-grow relative overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-pink-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

        {/* FULL WIDTH WRAPPER */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-8 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog &amp; Insights
            </Link>
            <span>/</span>
            <span className="text-purple-400 line-clamp-1 max-w-xs sm:max-w-md">{article.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                {article.category_label || article.category}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <i className="fa-regular fa-clock text-fuchsia-400" /> {article.read_time || '5 min read'}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <i className="fa-regular fa-calendar text-gray-400" /> {article.published_at}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.2] mb-6">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-base sm:text-xl text-gray-300 leading-relaxed font-light mb-6 border-l-2 border-purple-500 pl-4 bg-purple-950/20 py-2.5 rounded-r-lg">
                {article.excerpt}
              </p>
            )}
          </header>

          {/* FEATURED COVER IMAGE FULL WIDTH (ABOVE AUTHOR BAR) */}
          <div className="mb-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group bg-slate-900/80">
            <img
              src={coverImage}
              alt={article.title}
              className="w-full max-h-[500px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Author Info & Actions Bar */}
          <div className="flex items-center justify-between border-y border-white/10 py-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-sm shadow-md text-white">
                {(article.author_name || 'A')[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {article.author_name || 'Axom AI Team'}
                </div>
                <div className="text-xs text-gray-400">AI &amp; Tech Research Desk</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/blog"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left" /> Back to Articles
              </Link>
            </div>
          </div>

          {/* Main Article Content */}
          <article className="blog-rich-content relative w-full">
            <div
              className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-img:rounded-2xl leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>

          {/* Share & Navigation Bar */}
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all font-medium text-sm"
            >
              <i className="fa-solid fa-arrow-left" /> View All Insights &amp; Articles
            </Link>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(canonicalUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                title="Share on X"
              >
                <i className="fa-brands fa-x-twitter" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                title="Share on LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} - ${canonicalUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                title="Share on WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>
            </div>
          </div>

          {/* Related Articles Section */}
          {related_articles && related_articles.length > 0 && (
            <section className="mt-16 pt-12 border-t border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-fire text-purple-400 text-base" /> Related Articles &amp; Reads
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related_articles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}/`}
                    className="group flex flex-col justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                          {item.category_label || item.category}
                        </span>
                        <span>{item.read_time}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                      Read article <i className="fa-solid fa-arrow-right ml-1.5 text-[10px]" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer footer={landingData?.footer} seo={landingData?.seo} />
    </div>
  );
}
