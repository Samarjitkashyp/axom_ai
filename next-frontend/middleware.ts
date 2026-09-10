import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const subdomainHeader = (request.headers.get('x-subdomain') || '').toLowerCase();
  const isChatSubdomain = host.startsWith('chat.') || subdomainHeader === 'chat';

  const pathname = request.nextUrl.pathname;

  // Never rewrite static assets, next internal files, api endpoints, or media
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If request is on chat.aiaxom.co.in
  if (isChatSubdomain) {
    // Rewrite all chat paths (/, /tools, /upgrade, /settings, /admin-panel) to the /chat catch-all
    const url = request.nextUrl.clone();
    url.pathname = `/chat${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // On main domain (aiaxom.co.in):
  // Let standard routes (/, /about, /blog, /faq, /chat) render naturally.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
