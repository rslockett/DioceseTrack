import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { storage as replitStorage } from '@/lib/storageService'

export async function middleware(request: NextRequest) {
  // Skip middleware for these paths
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  try {
    // Check for user in Replit storage
    const isReplit = request.headers.get('host')?.includes('replit.dev')
    if (isReplit) {
      const currentUser = await replitStorage.getJSON('currentUser')
      if (!currentUser) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } else {
      // Fallback to localStorage for non-Replit environments
      const userCookie = request.cookies.get('currentUser')
      if (!userCookie?.value) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
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