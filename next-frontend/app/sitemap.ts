import { MetadataRoute } from 'next';
import { getArticlesCMS } from '../lib/api';
import fs from 'fs';
import path from 'path';

function discoverToolSlugs(): string[] {
  try {
    const toolsDir = path.join(process.cwd(), 'app', 'tools');
    return fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && fs.existsSync(path.join(toolsDir, d.name, 'page.tsx')))
      .map(d => d.name);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aiaxom.co.in';
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about/`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/use-cases/`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/pricing/`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/blog/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/faq/`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/contact/`, lastModified: now, changeFrequency: 'weekly', priority: 0.90 },
    { url: `${baseUrl}/privacy/`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/terms/`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
  ];

  const toolSlugs = discoverToolSlugs();
  for (const slug of toolSlugs) {
    routes.push({
      url: `${baseUrl}/tools/${slug}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.90,
    });
  }

  try {
    const { articles } = await getArticlesCMS();
    articles.forEach((article) => {
      routes.push({
        url: `${baseUrl}/blog/${article.slug}/`,
        lastModified: new Date(article.published_at || now),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
  }

  return routes;
}
