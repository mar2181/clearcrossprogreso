import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const protectedPaths = ['/dashboard', '/provider', '/quote'];
const publicPaths = ['/', '/auth', '/blog'];
const passwordExemptPaths = ['/auth/password', '/api/auth/password', '/_next', '/favicon.ico'];

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
    if (!authCookie) {
      return NextResponse.redirect(new URL('/auth/password', request.url));
    }
  }

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if route needs protection
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Skip auth check if Supabase not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
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
    }
  );

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
      .from('users')
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
      .from('users')
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
