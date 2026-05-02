import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // For now, allow access to all routes during development
  // The actual authentication will be handled client-side with localStorage
  if (process.env.NODE_ENV === 'development') {
    // Only redirect from login to dashboard if there's a token in localStorage (handled client-side)
    return NextResponse.next()
  }

  // In production, you might want to implement proper cookie-based auth
  const token = request.cookies.get('admin_token')?.value
  
  // If user is not logged in and trying to access admin pages, redirect to login
  if (!token && (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/users') ||
      request.nextUrl.pathname.startsWith('/boutiques') ||
      request.nextUrl.pathname.startsWith('/categories') ||
      request.nextUrl.pathname.startsWith('/products') ||
      request.nextUrl.pathname.startsWith('/documents') ||
      request.nextUrl.pathname.startsWith('/statistics'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If user is logged in and trying to access login page, redirect to dashboard
  if (token && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
