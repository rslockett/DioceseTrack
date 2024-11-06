import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for these paths
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth in headers
  const userAuth = request.headers.get('x-user-auth');
  
  // If no auth header, check localStorage on client side
  if (!userAuth) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('x-middleware-rewrite', 'true');
    return response;
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 