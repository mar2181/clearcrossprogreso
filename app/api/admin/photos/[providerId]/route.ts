export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PROVIDER_PHOTO_BUCKET } from '@/lib/provider-photo';

/**
 * POST /api/admin/photos/[providerId] — approve or reject a photo waiting
 * in gallery_pending. This is the review gate photo upload goes through
 * before anything renders on the public page (see
 * app/api/providers/[id]/photos and STATE.md / the plan for why).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  try {
    const { providerId } = await params;
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '';
    const action: 'approve' | 'reject' | null =
      body.action === 'approve' ? 'approve' : body.action === 'reject' ? 'reject' : null;

    if (!path || !action) {
      return NextResponse.json(
        { error: 'A photo path and action (approve/reject) are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ── Authorization: caller must be an admin, checked against their OWN
    //    row via the session client (RLS-scoped to id = auth.uid()), so a
    //    non-admin cannot spoof this — same pattern as
    //    app/api/admin/quotes/[id]/handle.
    const { data: callerData } = await supabase
      .from('clearcross_users')
      .select('id, role')
      .eq('id', authUser.id)
      .single();

    if (!callerData || callerData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const writer = createAdminClient();
    if (!writer) {
      return NextResponse.json({ error: 'Server not configured for this write' }, { status: 500 });
    }

    const { data: provider, error: fetchError } = await writer
      .from('clearcross_providers')
      .select('gallery_urls, gallery_pending')
      .eq('id', providerId)
      .single();

    if (fetchError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const pending: string[] = provider.gallery_pending ?? [];
    if (!pending.includes(path)) {
      return NextResponse.json({ error: 'That photo is not waiting for review' }, { status: 404 });
    }

    const nextPending = pending.filter((p) => p !== path);
    const nextUrls =
      action === 'approve' ? [...(provider.gallery_urls ?? []), path] : provider.gallery_urls ?? [];

    const { error: updateError } = await writer
      .from('clearcross_providers')
      .update({ gallery_pending: nextPending, gallery_urls: nextUrls })
      .eq('id', providerId);

    if (updateError) {
      console.error('Error reviewing provider photo:', updateError);
      return NextResponse.json({ error: 'Failed to save decision' }, { status: 500 });
    }

    if (action === 'reject') {
      // Best-effort — a rejected photo should not sit in the bucket
      // forever, but a failed delete must not fail the review itself.
      try {
        await writer.storage.from(PROVIDER_PHOTO_BUCKET).remove([path]);
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
