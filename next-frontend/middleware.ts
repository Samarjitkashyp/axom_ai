import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const subdomainHeader = (request.headers.get('x-subdomain') || '').toLowerCase();
  const isChatSubdomain = host.startsWith('chat.') || subdomainHeader === 'chat';
  const isAdminSubdomain = host.startsWith('admin.');

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

  // admin.aiaxom.co.in/admin-panel → rewrite to /chat/admin-panel (Next.js catch-all)
  if (isAdminSubdomain && (pathname === '/admin-panel' || pathname.startsWith('/admin-panel/'))) {
    const url = request.nextUrl.clone();
    url.pathname = `/chat${pathname}`;
    return NextResponse.rewrite(url);
  }

  // chat.aiaxom.co.in/admin-panel → redirect to admin.aiaxom.co.in/admin-panel
  if (isChatSubdomain && (pathname === '/admin-panel' || pathname.startsWith('/admin-panel/'))) {
    const dest = new URL(`https://admin.aiaxom.co.in${pathname}`);
    return NextResponse.redirect(dest, 308);
  }

  // If request is on chat.aiaxom.co.in
  if (isChatSubdomain) {
    // Rewrite all chat paths (/, /tools, /upgrade, /settings) to the /chat catch-all
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
