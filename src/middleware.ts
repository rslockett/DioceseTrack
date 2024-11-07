import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  try {
    const authResponse = await fetch(new URL('/api/auth/status', request.url))
    const { authenticated } = await authResponse.json()
    
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 