import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    'OAI-SearchBot',
    'ChatGPT-User',
    'GPTBot',
    'PerplexityBot',
    'ClaudeBot',
    'Claude-SearchBot',
    'Google-Extended',
    'Applebot',
    'Applebot-Extended',
    'Meta-ExternalAgent',
    'cohere-ai',
    '*',
  ];

  const rules = aiBots.map((bot) => ({
    userAgent: bot,
    allow: '/',
    disallow: [
      '/admin-panel/',
      '/api/',
      '/accounts/',
      '/auth/',
      '/axomai-admin/',
      '/axomai-content/',
      '/axomai-user/',
    ],
  }));

  return {
    rules,
    sitemap: 'https://aiaxom.co.in/sitemap.xml',
    host: 'https://aiaxom.co.in',
  };
}

