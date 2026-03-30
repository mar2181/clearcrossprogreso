export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/providers — list providers with optional filters
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'rating';
  const featured = searchParams.get('featured');

  let query = supabase
    .from('providers')
    .select(`
      *,
      category:categories(*),
      prices:provider_prices(*, procedure:procedures(*))
    `);

  if (category) {
    query = query.eq('category.slug', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (featured === 'true') {
    query = query.eq('featured', true);
  }

  switch (sort) {
    case 'price-low':
      query = query.order('avg_rating', { ascending: true });
      break;
    case 'price-high':
      query = query.order('avg_rating', { ascending: false });
      break;
    case 'reviews':
      query = query.order('review_count', { ascending: false });
      break;
    case 'rating':
    default:
      query = query.order('avg_rating', { ascending: false });
      break;
  }

  const { data: providers, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ providers });
}

// PUT /api/providers — update provider prices (authenticated provider only)
export async function PUT(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's provider_id
  const { data: userData } = await supabase
    .from('users')
    .select('provider_id, role')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'provider' || !userData.provider_id) {
    return NextResponse.json({ error: 'Not a provider' }, { status: 403 });
  }

  const body = await request.json();
  const { procedure_id, price_usd, price_notes } = body;

  if (!procedure_id || price_usd === undefined) {
    return NextResponse.json({ error: 'procedure_id and price_usd are required' }, { status: 400 });
  }

  // Upsert the price
  const { error } = await supabase
    .from('provider_prices')
    .upsert(
      {
        provider_id: userData.provider_id,
        procedure_id,
        price_usd,
        price_notes: price_notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'provider_id,procedure_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
