import { MetadataRoute } from 'next';
import { getArticlesCMS } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aiaxom.co.in';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/use-cases/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/use-cases',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/pricing/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/pricing',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/tools/word-to-pdf/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools/word-to-pdf',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools/pdf-to-word/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools/pdf-to-word',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools/image-to-pdf/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools/image-to-pdf',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools/pdf-to-jpg/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools/pdf-to-jpg',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools/pdf-to-png/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools/pdf-to-png',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools/image-format-converter/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools/image-format-converter',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://chat.aiaxom.co.in/tools',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const { articles } = await getArticlesCMS();
    articles.forEach((article) => {
      routes.push({
        url: `${baseUrl}/blog/${article.slug}/`,
        lastModified: new Date(article.published_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
  }

  return routes;
}
