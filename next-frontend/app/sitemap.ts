import { MetadataRoute } from 'next';
import { getArticlesCMS } from '../lib/api';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aiaxom.co.in';

  // Primary High-Level Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/use-cases/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/`,
      lastModified: new Date('2026-10-08T00:00:00Z'),
      changeFrequency: 'daily',
      priority: 0.95,
    },
  ];

  // All 35+ Axom AI Tools
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
    'unlock-pdf',
    'sign-pdf',
    'ocr-pdf',
    'extract-pdf-pages',
    'remove-watermark',
    'watermark-pdf',
    'translate-pdf',
    'summarize',
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
    'office-to-pdf',
  ];

  const toolRoutes: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date('2026-10-08T00:00:00Z'),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const routes = [...staticRoutes, ...toolRoutes];

  // Dynamic Blog & Insights Articles
  try {
    const { articles } = await getArticlesCMS();
    if (articles && Array.isArray(articles)) {
      articles.forEach((article) => {
        if (article.slug) {
          const modDate = article.updated_at || article.published_at;
          routes.push({
            url: `${baseUrl}/blog/${article.slug}/`,
            lastModified: modDate ? new Date(modDate) : new Date('2026-10-08T00:00:00Z'),
            changeFrequency: 'weekly',
            priority: 0.85,
          });
        }
      });
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap from CMS:', err);
  }

  return routes;
}
