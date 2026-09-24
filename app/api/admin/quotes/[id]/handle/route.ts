export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Mario relays a quote request to a clinic by phone/text today, and nothing
// records that it happened — the row sits at status:'pending',
// responded_at:null forever, which is exactly what left LaTonya Glaze's
// 2026-08-30 lead reading as "still open" 25 days later.
//
// This route does NOT fabricate a clinic response: it never sets `status` or
// `quoted_price`. No clinic has actually quoted anything. It only records
// that a HUMAN (Mario) closed the loop, when, and how — stamping
// `responded_at` (which is the exact signal Operator's Desk's lead_clock.py
// already reads: `answered = status not in ("pending","") or
// bool(responded_at)`), and appending a timestamped note to
// `provider_notes` so the "what did we actually do" record survives.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;
    const body = await request.json().catch(() => ({}));
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!note) {
      return NextResponse.json(
        { error: 'A short note on what was done is required (e.g. "Called the clinic, connected the patient").' },
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

    // ── Authorization: caller must be an admin. Checked against the
    //    caller's OWN row via the session client (RLS-scoped to id =
    //    auth.uid()), so a non-admin cannot spoof this by passing a role
    //    field — there is no field in the request body that decides this.
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

    const { data: quote, error: fetchError } = await writer
      .from('clearcross_quote_requests')
      .select('id, provider_notes, responded_at')
      .eq('id', quoteId)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const stamp = new Date().toISOString();
    const entry = `[Handled manually by ${authUser.email ?? 'admin'} on ${stamp}] ${note}`;
    const combinedNotes = quote.provider_notes ? `${quote.provider_notes}\n${entry}` : entry;

    const { data: updated, error: updateError } = await writer
      .from('clearcross_quote_requests')
      .update({
        // Only set responded_at if this is the first time it's been closed
        // out — re-marking an already-handled row should not erase the
        // original close-out timestamp.
        responded_at: quote.responded_at ?? stamp,
        provider_notes: combinedNotes,
      })
      .eq('id', quoteId)
      .select('id, status, responded_at, provider_notes')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, quote: updated }, { status: 200 });
  } catch (error) {
    console.error('[admin/quotes/handle] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
