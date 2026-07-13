import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createHmac } from 'crypto';

// Only these route prefixes require a logged-in Supabase user (+ role check).
// Everything else on the site is public browsing.
const protectedPaths = ['/dashboard', '/provider'];
const passwordExemptPaths = [
  '/auth/password',
  '/api/auth/password',
  '/api/cron', // Vercel cron sends a Bearer header, not the gate cookie; route enforces CRON_SECRET itself
  '/_next',
  '/favicon.ico',
];

/** Derives the expected cookie value from the env secret.
 *  Must stay in sync with app/api/auth/password/route.ts.
 */
function getExpectedCookieValue(): string {
  const secret = process.env.AUTH_COOKIE_SECRET || process.env.PROTECTION_PASSWORD || '';
  return createHmac('sha256', secret).update('clearCross_auth_v1').digest('hex');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and password page
  if (passwordExemptPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if site-wide password protection is enabled
  const hasPassword = process.env.PROTECTION_PASSWORD;
  if (hasPassword) {
    const authCookie = request.cookies.get('clearCross_auth');
    // Validate cookie *value*, not just presence, to prevent cookie forgery
    const expectedValue = getExpectedCookieValue();
    if (!authCookie || authCookie.value !== expectedValue) {
      return NextResponse.redirect(new URL('/auth/password', request.url));
    }
  }

  // Skip static assets and API routes (API routes enforce their own auth)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Only /dashboard and /provider need a session + role; all other pages are public
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase configured (mock mode) there are no accounts — send to login page,
  // which explains the situation, rather than crashing the edge function.
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based access for provider routes
  if (pathname.startsWith('/provider') && pathname !== '/provider') {
    const { data: userData } = await supabase
      .from('clearcross_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'provider') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Check role-based access for dashboard (patients only)
  if (pathname.startsWith('/dashboard')) {
    const { data: userData } = await supabase
      .from('clearcross_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'patient') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)',
  ],
};
