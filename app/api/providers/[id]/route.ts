export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const supabase = createServerSupabaseClient();

    // ── Auth check ──────────────────────────────────────────────────
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the caller owns this provider
    const { data: callerData } = await supabase
      .from('clearcross_users')
      .select('id, role, provider_id')
      .eq('id', authUser.id)
      .single();

    const isOwner = callerData?.role === 'provider' && callerData?.provider_id === paramId;
    const isAdmin = callerData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to edit this provider' },
        { status: 403 }
      );
    }

    // ── Parse and validate update fields ────────────────────────────
    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      'name', 'address', 'phone', 'whatsapp', 'website', 'description',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Basic validation
    if (updateData.name && (typeof updateData.name !== 'string' || (updateData.name as string).length < 2)) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    // ── Update ──────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from('clearcross_providers')
      .update(updateData)
      .eq('id', paramId)
      .select()
      .single();

    if (error) {
      console.error('Error updating provider:', error);
      return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
