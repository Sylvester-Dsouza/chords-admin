import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  const url = request.url
  const referer = request.headers.get('referer') || 'No referer'

  console.log(`Middleware processing path: ${path}`);
  console.log(`Full URL: ${url}`);
  console.log(`Referer: ${referer}`);
  console.log(`Cookies: ${request.cookies.toString()}`);

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login'

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has('isAuthenticated')

  console.log(`isPublicPath: ${isPublicPath}, isAuthenticated: ${isAuthenticated}`);

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // If user is on a public path but is authenticated, redirect to dashboard
    console.log(`Redirecting from ${path} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicPath && !isAuthenticated) {
    // If user is on a protected path but is not authenticated, redirect to login
    console.log(`Redirecting from ${path} to /login`);
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, allow navigation to any page
  console.log(`Allowing request to proceed to ${path}`);
  const response = NextResponse.next();
  
  // Add a custom header to track middleware processing
  response.headers.set('x-middleware-cache', 'no-store');
  
  return response;
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
