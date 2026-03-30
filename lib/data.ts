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

export interface SearchResult {
  provider: {
    id: string;
    name: string;
    slug: string;
    address: string;
    verified: boolean;
    featured: boolean;
    avg_rating: number | null;
    review_count: number;
    description: string | null;
    photo_url: string | null;
    graduation_year: number | null;
  };
  category: {
    name: string;
    slug: string;
  };
  matchedProcedures: {
    id: string;
    name: string;
    price_usd: number | null;
    price_notes: string | null;
  }[];
  matchType: 'provider' | 'procedure' | 'both';
}

function shouldUseMock(): boolean {
  // Use mock data when:
  // 1. Explicit env flag USE_MOCK_DATA=mock
  // 2. Supabase not configured (no URL or key)
  if (process.env.USE_MOCK_DATA === 'mock') return true;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return true;
  return false;
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

// Global search across providers, procedures, and prices
export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  if (shouldUseMock()) {
    return searchMockData(q);
  }

  // Supabase full search (when connected)
  const { createServerSupabaseClient } = await import('./supabase/server');
  const supabase = createServerSupabaseClient();

  // Search providers by name
  const { data: providerResults } = await supabase
    .from('providers')
    .select(`
      id, name, slug, address, verified, featured, avg_rating, review_count, description, photo_url, graduation_year,
      categories(name, slug),
      provider_prices(
        price_usd, price_notes,
        procedure:procedure_id(id, name)
      )
    `)
    .ilike('name', `%${q}%`)
    .eq('verified', true)
    .limit(20);

  // Search procedures by name, then find providers with those procedures
  const { data: procedureMatches } = await supabase
    .from('procedures')
    .select('id, name, category_id')
    .ilike('name', `%${q}%`);

  const procedureIds = procedureMatches?.map((p: any) => p.id) || [];

  let procedureProviderResults: any[] = [];
  if (procedureIds.length > 0) {
    const { data } = await supabase
      .from('provider_prices')
      .select(`
        price_usd, price_notes,
        procedure:procedure_id(id, name),
        provider:provider_id(
          id, name, slug, address, verified, featured, avg_rating, review_count, description, photo_url, graduation_year,
          categories(name, slug)
        )
      `)
      .in('procedure_id', procedureIds);
    procedureProviderResults = data || [];
  }

  // Merge results
  const resultsMap = new Map<string, SearchResult>();

  // Add provider name matches
  for (const p of providerResults || []) {
    const cat = (p as any).categories;
    resultsMap.set(p.id, {
      provider: {
        id: p.id, name: p.name, slug: p.slug, address: p.address,
        verified: p.verified, featured: p.featured,
        avg_rating: p.avg_rating, review_count: p.review_count,
        description: p.description,
        photo_url: (p as any).photo_url || null, graduation_year: (p as any).graduation_year || null,
      },
      category: { name: cat?.name || '', slug: cat?.slug || '' },
      matchedProcedures: ((p as any).provider_prices || []).map((pp: any) => ({
        id: pp.procedure?.id || '', name: pp.procedure?.name || '',
        price_usd: pp.price_usd, price_notes: pp.price_notes,
      })),
      matchType: 'provider',
    });
  }

  // Add procedure-matched providers
  for (const pp of procedureProviderResults) {
    const prov = pp.provider;
    if (!prov?.verified) continue;
    const existing = resultsMap.get(prov.id);
    if (existing) {
      existing.matchType = 'both';
      const alreadyHas = existing.matchedProcedures.some((mp: any) => mp.id === pp.procedure?.id);
      if (!alreadyHas) {
        existing.matchedProcedures.push({
          id: pp.procedure?.id || '', name: pp.procedure?.name || '',
          price_usd: pp.price_usd, price_notes: pp.price_notes,
        });
      }
    } else {
      const cat = prov.categories;
      resultsMap.set(prov.id, {
        provider: {
          id: prov.id, name: prov.name, slug: prov.slug, address: prov.address,
          verified: prov.verified, featured: prov.featured,
          avg_rating: prov.avg_rating, review_count: prov.review_count,
          description: prov.description,
          photo_url: prov.photo_url || null, graduation_year: prov.graduation_year || null,
        },
        category: { name: cat?.name || '', slug: cat?.slug || '' },
        matchedProcedures: [{
          id: pp.procedure?.id || '', name: pp.procedure?.name || '',
          price_usd: pp.price_usd, price_notes: pp.price_notes,
        }],
        matchType: 'procedure',
      });
    }
  }

  return Array.from(resultsMap.values()).sort((a, b) => {
    if (a.provider.featured && !b.provider.featured) return -1;
    if (!a.provider.featured && b.provider.featured) return 1;
    return (b.provider.avg_rating || 0) - (a.provider.avg_rating || 0);
  });
}

// Search across mock data
function searchMockData(q: string): SearchResult[] {
  const resultsMap = new Map<string, SearchResult>();

  // 1. Find procedures matching the query
  const matchedProcedures = mockProcedures.filter(
    (proc) =>
      proc.name.toLowerCase().includes(q) ||
      (proc.description && proc.description.toLowerCase().includes(q))
  );

  // 2. Find providers matching the query by name or description
  const matchedProviders = mockProviders.filter(
    (p) =>
      p.verified &&
      (p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)))
  );

  // 3. Add provider name matches with all their prices
  for (const prov of matchedProviders) {
    const cat = mockCategories.find((c) => c.id === prov.category_id);
    const prices = mockPrices
      .filter((pp) => pp.provider_id === prov.id)
      .map((pp) => {
        const proc = mockProcedures.find((p) => p.id === pp.procedure_id);
        return {
          id: proc?.id || '',
          name: proc?.name || '',
          price_usd: pp.price_usd,
          price_notes: pp.price_notes,
        };
      });

    resultsMap.set(prov.id, {
      provider: {
        id: prov.id, name: prov.name, slug: prov.slug, address: prov.address,
        verified: prov.verified, featured: prov.featured,
        avg_rating: prov.avg_rating, review_count: prov.review_count,
        description: prov.description,
        photo_url: prov.photo_url || null, graduation_year: prov.graduation_year || null,
      },
      category: { name: cat?.name || '', slug: cat?.slug || '' },
      matchedProcedures: prices,
      matchType: 'provider',
    });
  }

  // 4. For each matched procedure, find providers that offer it
  for (const proc of matchedProcedures) {
    const pricesForProc = mockPrices.filter((pp) => pp.procedure_id === proc.id);

    for (const price of pricesForProc) {
      const prov = mockProviders.find((p) => p.id === price.provider_id);
      if (!prov || !prov.verified) continue;

      const existing = resultsMap.get(prov.id);
      if (existing) {
        existing.matchType = 'both';
        const alreadyHas = existing.matchedProcedures.some((mp) => mp.id === proc.id);
        if (!alreadyHas) {
          existing.matchedProcedures.push({
            id: proc.id,
            name: proc.name,
            price_usd: price.price_usd,
            price_notes: price.price_notes,
          });
        }
      } else {
        const cat = mockCategories.find((c) => c.id === prov.category_id);
        resultsMap.set(prov.id, {
          provider: {
            id: prov.id, name: prov.name, slug: prov.slug, address: prov.address,
            verified: prov.verified, featured: prov.featured,
            avg_rating: prov.avg_rating, review_count: prov.review_count,
            description: prov.description,
            photo_url: prov.photo_url || null, graduation_year: prov.graduation_year || null,
          },
          category: { name: cat?.name || '', slug: cat?.slug || '' },
          matchedProcedures: [{
            id: proc.id,
            name: proc.name,
            price_usd: price.price_usd,
            price_notes: price.price_notes,
          }],
          matchType: 'procedure',
        });
      }
    }
  }

  // Sort: featured first, then procedure matches (most relevant), then by rating
  return Array.from(resultsMap.values()).sort((a, b) => {
    // Featured providers always come first
    if (a.provider.featured && !b.provider.featured) return -1;
    if (!a.provider.featured && b.provider.featured) return 1;
    // Procedure matches are more relevant
    if (a.matchType === 'procedure' && b.matchType === 'provider') return -1;
    if (a.matchType === 'provider' && b.matchType === 'procedure') return 1;
    // Then by rating
    return (b.provider.avg_rating || 0) - (a.provider.avg_rating || 0);
  });
}
