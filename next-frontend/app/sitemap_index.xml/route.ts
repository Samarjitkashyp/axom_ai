import { GET as sitemapGet } from '../sitemap.xml/route';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  return sitemapGet();
}
