import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const supabase = createServerSupabaseClient();

  try {
    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Auth error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      );
    }

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Fetch user role to determine redirect
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Decode redirectTo to prevent open redirect
    let finalRedirect = '/dashboard';
    if (redirectTo && ['/dashboard', '/provider'].includes(decodeURIComponent(redirectTo))) {
      finalRedirect = decodeURIComponent(redirectTo);
    } else if (userData?.role === 'provider') {
      finalRedirect = '/provider';
    }

    return NextResponse.redirect(new URL(finalRedirect, request.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
  }
}
