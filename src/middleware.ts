import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for these paths
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for user session
  const userAuth = request.cookies.get('currentUser')?.value || 
                  request.headers.get('x-user-auth') || 
                  null;

  console.log('Checking auth:', {
    path: request.nextUrl.pathname,
    hasAuth: !!userAuth,
    headers: Object.fromEntries(request.headers.entries())
  });
  if (!userAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 