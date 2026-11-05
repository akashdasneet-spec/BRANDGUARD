import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require any session
  const publicPaths = ['/', '/sign-in', '/sign-up', '/api/auth', '/api/health', '/api/demo'];
  const isPublicPath = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check demo session
  const demoToken = request.cookies.get('demo_session')?.value;
  if (demoToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.DEMO_JWT_SECRET ?? 'demo-secret-change-in-production-32chars'
      );
      await jwtVerify(demoToken, secret);
      return NextResponse.next();
    } catch {
      // Invalid demo token - clear it
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('demo_session');
      return response;
    }
  }

  // Check Better Auth session
  const authCookie = request.cookies.get('better-auth.session_token')?.value
    ?? request.cookies.get('__Secure-better-auth.session_token')?.value;

  if (authCookie) {
    return NextResponse.next();
  }

  // No valid session - redirect to home
  if (pathname.startsWith('/demo')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export default proxy;

