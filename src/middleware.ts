import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for these paths
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth in headers and localStorage
  const userAuth = request.headers.get('x-user-auth');
  
  if (!userAuth) {
    // Get base URL from request
    const baseUrl = request.nextUrl.origin || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}/login`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 