export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES } from '@/lib/quote-photo';
import { PROVIDER_PHOTO_BUCKET, MAX_PROVIDER_PHOTOS } from '@/lib/provider-photo';

/**
 * POST /api/providers/[id]/photos — upload a real photo of the clinic.
 * It does NOT go live on the public page: it lands in gallery_pending
 * until an admin approves it (see app/api/admin/photos/[providerId]).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const supabase = createServerSupabaseClient();

    // ── Auth check — same ownership pattern as app/api/providers/[id] ──
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: callerData } = await supabase
      .from('clearcross_users')
      .select('id, role, provider_id')
      .eq('id', authUser.id)
      .single();

    const isOwner = callerData?.role === 'provider' && callerData?.provider_id === paramId;
    const isAdmin = callerData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to manage photos for this provider' },
        { status: 403 }
      );
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    // ── Parse + validate the file ───────────────────────────────────
    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = ALLOWED_PHOTO_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use JPEG, PNG, WEBP, or HEIC.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'File is too large (max 10 MB).' }, { status: 400 });
    }

    const { data: provider, error: fetchError } = await admin
      .from('clearcross_providers')
      .select('gallery_urls, gallery_pending')
      .eq('id', paramId)
      .single();

    if (fetchError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const liveCount = (provider.gallery_urls ?? []).length;
    const pendingCount = (provider.gallery_pending ?? []).length;
    if (liveCount + pendingCount >= MAX_PROVIDER_PHOTOS) {
      return NextResponse.json(
        {
          error: `You've reached the ${MAX_PROVIDER_PHOTOS}-photo limit. Remove one before adding another.`,
        },
        { status: 400 }
      );
    }

    // ── Upload ───────────────────────────────────────────────────────
    const path = `${paramId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(PROVIDER_PHOTO_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('Error uploading provider photo:', uploadError);
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
    }

    const nextPending = [...(provider.gallery_pending ?? []), path];
    const { error: updateError } = await admin
      .from('clearcross_providers')
      .update({ gallery_pending: nextPending })
      .eq('id', paramId);

    if (updateError) {
      console.error('Error saving pending photo reference:', updateError);
      return NextResponse.json(
        { error: 'Photo uploaded but could not be saved' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, path, pending: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/providers/[id]/photos — remove a photo, whether it's still
 * waiting for review or already live. A provider retracting their own
 * upload, or an admin cleaning up, both go through here.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const supabase = createServerSupabaseClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: callerData } = await supabase
      .from('clearcross_users')
      .select('id, role, provider_id')
      .eq('id', authUser.id)
      .single();

    const isOwner = callerData?.role === 'provider' && callerData?.provider_id === paramId;
    const isAdmin = callerData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to manage photos for this provider' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '';
    if (!path || path.includes('..') || !path.startsWith(`${paramId}/`)) {
      return NextResponse.json({ error: 'Invalid photo reference' }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const { data: provider, error: fetchError } = await admin
      .from('clearcross_providers')
      .select('gallery_urls, gallery_pending')
      .eq('id', paramId)
      .single();

    if (fetchError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const nextUrls = (provider.gallery_urls ?? []).filter((p: string) => p !== path);
    const nextPending = (provider.gallery_pending ?? []).filter((p: string) => p !== path);

    const { error: updateError } = await admin
      .from('clearcross_providers')
      .update({ gallery_urls: nextUrls, gallery_pending: nextPending })
      .eq('id', paramId);

    if (updateError) {
      console.error('Error removing photo reference:', updateError);
      return NextResponse.json({ error: 'Failed to remove photo' }, { status: 500 });
    }

    // Best-effort — the DB row is the source of truth for what renders, so
    // a failed storage delete leaves an orphaned file, not a broken page.
    try {
      await admin.storage.from(PROVIDER_PHOTO_BUCKET).remove([path]);
    } catch {
      // best-effort
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
