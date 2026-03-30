import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify quote exists
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('id, status')
      .eq('id', params.id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quote.status !== 'quoted') {
      return NextResponse.json(
        { error: `Cannot ${action} a quote with status: ${quote.status}` },
        { status: 400 }
      );
    }

    // Update quote status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const updateData: Record<string, any> = { status: newStatus };

    if (action === 'accept') {
      updateData.price_locked = true;
    }

    const { error: updateError } = await supabase
      .from('quote_requests')
      .update(updateData)
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating quote:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      );
    }

    // TODO: Send notification email to user and provider

    return NextResponse.json(
      {
        id: params.id,
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
