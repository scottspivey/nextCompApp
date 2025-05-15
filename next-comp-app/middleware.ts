// root/middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/auth'; // Import your Auth.js v5 config
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig); // Initialize auth with your config

// Define public paths that don't require authentication
const publicPaths = [
  '/', // Example: Homepage
  '/login',
  '/signup',
  '/api/auth/register', // Your registration API endpoint
  '/privacy',
  '/about',
  '/pricing',
  '/helpful-resources',
  // Add other public static paths or marketing pages
];

// Define paths that authenticated users should not access (e.g., redirect to dashboard)
const authRoutes = ['/login', '/signup'];

export default auth(async (req: NextRequest) => {
  const { nextUrl } = req;
  const session = (req as any).auth; // Type assertion as req.auth is added by the middleware
  const isLoggedIn = !!session?.user;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth/');
  const isNextStaticFile = nextUrl.pathname.startsWith('/_next/');
  
  // Check if the current path is one of the defined public paths
  const isCurrentPathPublic = publicPaths.some(path => {
    if (path.endsWith('/')) { // Handle base paths like '/'
        return nextUrl.pathname.startsWith(path);
    }
    return nextUrl.pathname === path;
  });

  if (isApiAuthRoute || isNextStaticFile || isCurrentPathPublic) {
    // If user is logged in and tries to access login/signup, redirect to dashboard
    if (isLoggedIn && authRoutes.includes(nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }
    return NextResponse.next(); // Allow access
  }

  // If not logged in and trying to access a protected route
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl.origin));
  }
  
  // Example: Role-based access for a specific path (using role from session)
  // const isProtectedAdminRoute = nextUrl.pathname.startsWith('/admin');
  // if (isProtectedAdminRoute && session?.user?.role !== 'admin') {
  //   return NextResponse.redirect(new URL('/unauthorized', nextUrl.origin)); 
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};