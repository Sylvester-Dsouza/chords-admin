import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login'

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has('isAuthenticated')

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // If user is on a public path but is authenticated, redirect to dashboard
    // Redirect to dashboard without the route group in the URL
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicPath && !isAuthenticated) {
    // If user is on a protected path but is not authenticated, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (images, etc.)
    // - Favicon
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
