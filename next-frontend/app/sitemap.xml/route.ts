import { NextResponse } from 'next/server';
import { getArticlesCMS } from '../../lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const baseUrl = 'https://aiaxom.co.in';

  // Static High-Level Pages (Next.js canonical without trailing slash)
  const staticPages = [
    { url: `${baseUrl}`, lastmod: '2026-10-08', changefreq: 'daily', priority: '1.0' },
    { url: `${baseUrl}/about`, lastmod: '2026-10-08', changefreq: 'weekly', priority: '0.9' },
    { url: `${baseUrl}/use-cases`, lastmod: '2026-10-08', changefreq: 'weekly', priority: '0.9' },
    { url: `${baseUrl}/pricing`, lastmod: '2026-10-08', changefreq: 'weekly', priority: '0.9' },
    { url: `${baseUrl}/blog`, lastmod: '2026-10-08', changefreq: 'daily', priority: '0.9' },
    { url: `${baseUrl}/faq`, lastmod: '2026-10-08', changefreq: 'weekly', priority: '0.8' },
    { url: `${baseUrl}/contact`, lastmod: '2026-10-08', changefreq: 'weekly', priority: '0.8' },
    { url: `${baseUrl}/privacy`, lastmod: '2026-10-08', changefreq: 'monthly', priority: '0.7' },
    { url: `${baseUrl}/terms`, lastmod: '2026-10-08', changefreq: 'monthly', priority: '0.7' },
    { url: `${baseUrl}/tools`, lastmod: '2026-10-08', changefreq: 'daily', priority: '0.9' },
  ];

  // All 37 Axom AI Tools
  const toolSlugs = [
    'ai-notes-generator',
    'word-to-pdf',
    'pdf-to-word',
    'image-to-pdf',
    'pdf-to-jpg',
    'pdf-to-png',
    'image-format-converter',
    'ppt-to-pdf',
    'excel-to-pdf',
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'edit-pdf',
    'protect-pdf',
    'sign-pdf',
    'watermark-pdf',
    'ai-image-generator',
    'ai-image-finder',
    'ai-video-finder',
    'ai-diagram-generator',
    'chat-with-pdf',
    'color-palette-generator',
    'qr-code-generator',
    'svg-editor',
    'meme-generator',
    'background-remover',
    'video-compressor',
    'video-downloader',
    'youtube-video-downloader',
    'screenshot-to-code',
  ];

  const toolPages = toolSlugs.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastmod: '2026-10-08',
    changefreq: 'daily',
    priority: '0.9',
  }));

  // Dynamic Blog Articles (canonical without trailing slash)
  let blogPages: Array<{ url: string; lastmod: string; changefreq: string; priority: string }> = [];
  try {
    const { articles } = await getArticlesCMS();
    if (articles && Array.isArray(articles)) {
      blogPages = articles.map((art) => {
        let dateStr = '2026-10-08';
        if (art.updated_at) {
          dateStr = new Date(art.updated_at).toISOString().split('T')[0];
        } else if (art.published_at) {
          dateStr = new Date(art.published_at).toISOString().split('T')[0];
        }
        return {
          url: `${baseUrl}/blog/${art.slug}`,
          lastmod: dateStr,
          changefreq: 'weekly',
          priority: '0.8',
        };
      });
    }
  } catch (e) {
    console.error('Error fetching articles for sitemap route:', e);
  }

  const allEntries = [...staticPages, ...toolPages, ...blogPages];

  const xmlEntries = allEntries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
