export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendQuoteStatusUpdate } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ── Auth check: verify the caller is logged in ──────────────────
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ── Verify quote exists and fetch full details for email ────────
    const { data: quote, error: quoteError } = await supabase
      .from('clearcross_quote_requests')
      .select(`
        id, status, quoted_price, provider_id,
        provider:clearcross_providers(id, name),
        procedure:clearcross_procedures(name),
        user:clearcross_users(email, full_name)
      `)
      .eq('id', paramId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // ── Authorization: verify caller is the patient who owns this quote
    const { data: callerData } = await supabase
      .from('clearcross_users')
      .select('id, role, provider_id')
      .eq('id', authUser.id)
      .single();

    if (!callerData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Patients can accept/decline their own quotes
    const isQuoteOwner = callerData.role === 'patient' && callerData.id === (quote.user as any)?.id;
    // Admins can act on any quote
    const isAdmin = callerData.role === 'admin';

    if (!isQuoteOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to respond to this quote' },
        { status: 403 }
      );
    }

    if (quote.status !== 'quoted') {
      return NextResponse.json(
        { error: `Cannot ${action} a quote with status: ${quote.status}` },
        { status: 400 }
      );
    }

    // ── Update quote status ─────────────────────────────────────────
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const updateData: Record<string, unknown> = {
      status: newStatus,
      responded_at: new Date().toISOString(),
    };

    if (action === 'accept') {
      updateData.price_locked = true;
    }

    // Route-level authz above verified the caller owns this quote; patients
    // have no RLS UPDATE policy, so the write goes through the service role.
    const writer = createAdminClient() ?? supabase;
    const { error: updateError } = await writer
      .from('clearcross_quote_requests')
      .update(updateData)
      .eq('id', paramId);

    if (updateError) {
      console.error('Error updating quote:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      );
    }

    // ── Send email notification (non-blocking) ──────────────────────
    const patient = quote.user as any;
    const provider = quote.provider as any;
    const procedure = quote.procedure as any;

    if (patient?.email) {
      sendQuoteStatusUpdate({
        patientEmail: patient.email,
        patientName: patient.full_name || 'Patient',
        providerName: provider?.name || 'Provider',
        procedureName: procedure?.name || 'Procedure',
        status: newStatus as 'accepted' | 'rejected',
        quotedPrice: quote.quoted_price,
        quoteId: paramId,
      }).catch((err) => console.error('[Email] Status update failed:', err));
    }

    return NextResponse.json(
      {
        id: paramId,
        status: newStatus,
        message: `Quote ${action === 'accept' ? 'accepted' : 'declined'} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
