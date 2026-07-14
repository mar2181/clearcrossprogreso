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
    .from('clearcross_providers')
    .select(`
      *,
      category:clearcross_categories(*),
      prices:clearcross_provider_prices(*, procedure:clearcross_procedures(*))
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
    case 'price-high':
      // no flat price column — sorted in JS after fetch using min listed price
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

  let result = providers || [];
  if (sort === 'price-low' || sort === 'price-high') {
    const minPrice = (p: any) => {
      const listed = (p.prices || [])
        .map((x: any) => x.price_usd)
        .filter((v: any) => typeof v === 'number' && v > 0);
      return listed.length ? Math.min(...listed) : Number.POSITIVE_INFINITY;
    };
    result = [...result].sort((a: any, b: any) =>
      sort === 'price-low' ? minPrice(a) - minPrice(b) : minPrice(b) - minPrice(a)
    );
  }

  return NextResponse.json({ providers: result });
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
    .from('clearcross_users')
    .select('provider_id, role')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'provider' || !userData.provider_id) {
    return NextResponse.json({ error: 'Not a provider' }, { status: 403 });
  }

  const body = await request.json();
  const { id, procedure_id, price_usd, price_notes } = body;

  if (!procedure_id || price_usd === undefined) {
    return NextResponse.json({ error: 'procedure_id and price_usd are required' }, { status: 400 });
  }

  // A provider may list SEVERAL priced items under one procedure (e.g. 9 GLP-1
  // pens under "weight loss"), so (provider_id, procedure_id) is not unique and
  // we cannot blind-upsert on it. Target an explicit row when the caller names
  // one; otherwise update the single existing row, or insert the first.
  const { data: existing, error: lookupError } = await supabase
    .from('clearcross_provider_prices')
    .select('id')
    .eq('provider_id', userData.provider_id)
    .eq('procedure_id', procedure_id)
    .order('id', { ascending: true });

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  const rows = existing || [];
  if (!id && rows.length > 1) {
    return NextResponse.json(
      { error: 'Multiple prices exist for this procedure — pass the price `id` to say which one to update.' },
      { status: 400 }
    );
  }

  const targetId = id || (rows.length === 1 ? rows[0].id : null);

  // An `id` from the client is only honored if it is one of THIS provider's rows.
  if (id && !rows.some((r) => r.id === id)) {
    return NextResponse.json({ error: 'Price not found' }, { status: 404 });
  }

  const { error } = targetId
    ? await supabase
        .from('clearcross_provider_prices')
        .update({
          price_usd,
          price_notes: price_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetId)
        .eq('provider_id', userData.provider_id)
    : await supabase.from('clearcross_provider_prices').insert({
        provider_id: userData.provider_id,
        procedure_id,
        price_usd,
        price_notes: price_notes || null,
        updated_at: new Date().toISOString(),
      });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
