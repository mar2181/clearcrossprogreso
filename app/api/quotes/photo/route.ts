export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { QUOTE_PHOTO_BUCKET } from '@/lib/quote-photo';

/**
 * GET /api/quotes/photo?path=<storage path>
 * Redirects to a short-lived signed URL for a PRIVATE quote photo.
 * Authorized only for the patient who owns the quote or the provider it was
 * sent to. Medical imagery must never be publicly reachable.
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  // The photo belongs to exactly one quote — caller must be its patient or its provider
  const { data: quote } = await admin
    .from('quote_requests')
    .select('user_id, provider_id')
    .eq('photo_url', path)
    .single();

  if (!quote) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: caller } = await admin
    .from('users')
    .select('id, role, provider_id')
    .eq('id', user.id)
    .single();

  const isPatientOwner = quote.user_id === user.id;
  const isProviderOwner =
    caller?.role === 'provider' && caller?.provider_id === quote.provider_id;
  const isAdmin = caller?.role === 'admin';

  if (!isPatientOwner && !isProviderOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await admin.storage
    .from(QUOTE_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
