import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to admin routes
  if (pathname.startsWith('/admin')) {
    // Check if user is authenticated (cookies or localStorage - middleware only has access to cookies)
    const adminUser = request.cookies.get('scanunion_admin')?.value;
    
    if (!adminUser) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = JSON.parse(adminUser);
      
      // If user is on first login and trying to access admin pages (not login)
      if (user.isFirstLogin && pathname !== '/login') {
        // Redirect back to login to force password change
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // Invalid user data, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
