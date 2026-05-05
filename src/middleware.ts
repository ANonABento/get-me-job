import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders } from '@/lib/security/headers';

// Define which routes are public (don't require auth)
const isPublicRoute = createRouteMatcher([
  '/',                    // Marketing landing page
  '/sign-in(.*)',         // Sign in page
  '/sign-up(.*)',         // Sign up page
  '/api/webhooks(.*)',    // Webhooks (if needed)
]);

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

const middleware = hasClerkKeys
  ? clerkMiddleware(async (auth, request) => {
      // If the route is not public, require authentication
      if (!isPublicRoute(request)) {
        await auth.protect();
      }
      return applySecurityHeaders(NextResponse.next(), request);
    })
  : (request: NextRequest) => applySecurityHeaders(NextResponse.next(), request);

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
