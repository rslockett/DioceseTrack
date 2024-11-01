import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define route permissions
const ROUTE_PERMISSIONS = {
  '/dashboard': ['admin', 'staff'],
  '/clergy': ['admin', 'staff', 'user'],
  '/parishes': ['admin', 'staff'],
  '/deaneries': ['admin', 'staff'],
  '/calendar': ['admin', 'staff'],
  '/documents': ['admin', 'staff'],
  '/reports': ['admin', 'staff'],
  '/settings': ['admin'],
}

export function middleware(request: NextRequest) {
  // Skip middleware for login and other public routes
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Get user from cookie/session
  const user = request.cookies.get('currentUser')?.value
  const userData = user ? JSON.parse(user) : null

  // If no user, redirect to login
  if (!userData) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check route permissions
  const path = '/' + request.nextUrl.pathname.split('/')[1] // Get base path
  const allowedRoles = ROUTE_PERMISSIONS[path]

  // Check if user has permission for this route
  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    // Redirect to appropriate landing page based on role
    const landingPage = userData.role === 'user' 
      ? '/clergy'
      : '/dashboard'
    return NextResponse.redirect(new URL(landingPage, request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 