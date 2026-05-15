export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quote_id, rating, comment } = body;

    // Validation
    if (!quote_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment && comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must not exceed 500 characters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ── Auth check ──────────────────────────────────────────────────
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify quote exists and is completed
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .select('id, user_id, provider_id, status')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quote.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed quotes' },
        { status: 400 }
      );
    }

    // Verify the caller is the patient who owns this quote
    if (quote.user_id !== authUser.id) {
      return NextResponse.json(
        { error: 'You can only review your own completed visits' },
        { status: 403 }
      );
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('quote_id', quote_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this visit' },
        { status: 400 }
      );
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        provider_id: quote.provider_id,
        user_id: quote.user_id,
        quote_id,
        rating,
        comment: comment || null,
        verified: true,
      })
      .select('id')
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Recalculate provider's average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', quote.provider_id)
      .eq('verified', true);

    if (allReviews && allReviews.length > 0) {
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await supabase
        .from('providers')
        .update({
          avg_rating: Math.round(avgRating * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', quote.provider_id);
    }

    return NextResponse.json({ id: review.id }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
