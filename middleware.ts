import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'wws_session';

export function middleware(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  // If user is logged in and trying to access auth routes, redirect to App Launcher (/)
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!isAuthRoute && !session) {
    // Also protect the root route (/) and anything under /dashboard
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
