import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes - all routes except public ones
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/courses(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/api/progress(.*)',
  '/api/courses(.*)',
  '/api/leaderboard(.*)',
  '/api/phases(.*)',
  '/api/weeks(.*)',
  '/api/lessons(.*)'
  // Note: /api/seed is intentionally not protected so it can be called without authentication
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
