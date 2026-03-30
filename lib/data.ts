// Data access layer — tries Supabase, falls back to mock data
// Once ClearCross tables exist in Supabase, this will use live data automatically.

import {
  categories as mockCategories,
  providers as mockProviders,
  procedures as mockProcedures,
  providerPrices as mockPrices,
  reviews as mockReviews,
  getProviderPricesWithProcedures,
  getProvidersByCategory,
  getProceduresByCategory,
  getReviewsByProvider,
} from './mock-data';

function shouldUseMock(): boolean {
  // Explicit env flag: set USE_MOCK_DATA=mock in .env.local to use local data
  // Remove it (or set to empty) once ClearCross tables exist in Supabase
  return process.env.USE_MOCK_DATA === 'mock';
}

export async function getCategory(slug: string) {
  if (shouldUseMock()) {
    return mockCategories.find((c) => c.slug === slug && c.active) || null;
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  return data;
}

export async function getCategoryBySlug(slug: string) {
  if (shouldUseMock()) {
    return mockCategories.find((c) => c.slug === slug) || null;
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getProvidersForCategory(categoryId: string, categorySlug: string) {
  if (shouldUseMock()) {
    return getProvidersByCategory(categorySlug);
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('providers')
    .select(
      `
      *,
      provider_prices:provider_prices(
        id,
        provider_id,
        price_usd,
        price_notes,
        procedure:procedure_id(id, name, sort_order)
      )
      `
    )
    .eq('category_id', categoryId)
    .eq('verified', true)
    .order('featured', { ascending: false })
    .order('avg_rating', { ascending: false });

  return data || [];
}

export async function getProceduresForCategory(categoryId: string, categorySlug: string) {
  if (shouldUseMock()) {
    return getProceduresByCategory(categorySlug);
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('procedures')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true });

  return data || [];
}

export async function getProviderBySlug(slug: string) {
  if (shouldUseMock()) {
    const provider = mockProviders.find((p) => p.slug === slug);
    if (!provider) return null;

    const category = mockCategories.find((c) => c.id === provider.category_id);
    const prices = getProviderPricesWithProcedures(provider.id);

    return {
      ...provider,
      provider_prices: prices,
      categories: category || null,
    };
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('providers')
    .select(
      `
      *,
      provider_prices:provider_prices(
        id,
        provider_id,
        price_usd,
        price_notes,
        procedure:procedure_id(id, name, sort_order)
      ),
      categories(id, name, slug)
      `
    )
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getProviderReviews(providerId: string) {
  if (shouldUseMock()) {
    return getReviewsByProvider(providerId);
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .eq('verified', true)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getRelatedProviders(categoryId: string, excludeProviderId: string) {
  if (shouldUseMock()) {
    return mockProviders
      .filter((p) => p.category_id === categoryId && p.id !== excludeProviderId && p.verified)
      .slice(0, 3)
      .map((p) => ({
        ...p,
        provider_prices: getProviderPricesWithProcedures(p.id),
      }));
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('providers')
    .select(
      `
      *,
      provider_prices:provider_prices(
        id,
        price_usd,
        procedure:procedure_id(id, name)
      )
      `
    )
    .eq('category_id', categoryId)
    .neq('id', excludeProviderId)
    .eq('verified', true)
    .limit(3);

  return data || [];
}

// For generateStaticParams — return all provider slugs
export async function getAllProviderSlugs() {
  if (shouldUseMock()) {
    return mockProviders.map((p) => {
      const category = mockCategories.find((c) => c.id === p.category_id);
      return {
        category: category?.slug || 'dentists',
        provider: p.slug,
      };
    });
  }

  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('providers')
    .select('slug, category_id, categories(slug)');

  if (!data) return [];

  return data.map((provider: any) => ({
    category: provider.categories?.slug || 'dentists',
    provider: provider.slug,
  }));
}
