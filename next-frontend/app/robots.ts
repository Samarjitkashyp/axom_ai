import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin-panel/', '/api/', '/accounts/', '/auth/'],
      },
    ],
    sitemap: 'https://aiaxom.co.in/sitemap.xml',
    host: 'https://aiaxom.co.in',
  };
}
