import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/register', '/api', '/_next', '/favicon.ico', '/features', '/pricing', '/about', '/contact', '/blog', '/docs', '/security', '/careers'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow root path (landing page)
  if (pathname === '/') {
    return NextResponse.next();
  }

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get('signalstack_token');
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
