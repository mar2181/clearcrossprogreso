export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Provider {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  photo_url: string | null;
  gallery_urls: string[];
  verified: boolean;
  featured: boolean;
  plan: 'free' | 'featured' | 'premium';
  avg_rating: number | null;
  review_count: number;
  graduation_year: number | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Procedure {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface ProviderPrice {
  id: string;
  provider_id: string;
  procedure_id: string;
  price_usd: number | null;
  price_notes: string | null;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'patient' | 'provider' | 'admin';
  provider_id: string | null;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  provider_id: string;
  user_id: string;
  procedure_id: string | null;
  description: string;
  photo_url: string | null;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'completed';
  quoted_price: number | null;
  price_locked: boolean;
  provider_notes: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface Review {
  id: string;
  provider_id: string;
  user_id: string;
  quote_id: string | null;
  rating: number;
  comment: string | null;
  verified: boolean;
  created_at: string;
}

export interface ProviderWithPrices extends Provider {
  prices: (ProviderPrice & { procedure: Procedure })[];
  category: Category;
}

export interface QuoteRequestWithDetails extends QuoteRequest {
  provider: Provider;
  procedure: Procedure | null;
  user: User;
}
