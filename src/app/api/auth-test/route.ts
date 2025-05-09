import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the auth cookie
    const cookieStore = cookies();
    const isAuthenticated = cookieStore.get('isAuthenticated');
    
    // Get auth token from session storage (this won't work in a server component)
    // This is just for debugging purposes
    
    return NextResponse.json({
      message: 'Auth test endpoint',
      isAuthenticated: isAuthenticated ? true : false,
      cookieValue: isAuthenticated?.value || 'not set',
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ error: 'Auth test failed' }, { status: 500 });
  }
}
