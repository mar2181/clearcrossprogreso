-- ============================================================
-- ClearCross Progreso — Consolidated schema (v2, 2026-07-13)
-- For the DEDICATED ClearCross Supabase project (clean slate).
-- Replaces the old 001/002/002/002/003/003 duplicate set.
-- Idempotent: safe to re-run.
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  address text,
  phone text,
  whatsapp text,
  website text,
  description text,
  logo_url text,
  photo_url text,               -- used by featured cards / search results
  graduation_year integer,      -- used for "years of experience" display
  gallery_urls text[],
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'featured', 'premium')),
  avg_rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  lat numeric(10,7),
  lng numeric(10,7),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.provider_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  price_usd numeric(10,2),
  price_notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, procedure_id)
);

-- NOTE: no FK to auth.users — anonymous quote requesters get a row here too
-- (created only by the service role). Registered users insert their own row
-- with id = auth.uid().
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text,
  phone text,
  role text DEFAULT 'patient' CHECK (role IN ('patient', 'provider', 'admin')),
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  description text,
  photo_url text,               -- storage PATH in the private quote_photos bucket
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'completed')),
  quoted_price numeric(10,2),
  price_locked boolean DEFAULT false,
  provider_notes text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flash_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  procedure_ids uuid[] DEFAULT '{}',
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  message text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id),
  procedure_ids uuid[] DEFAULT '{}',
  search_query text,
  searched_at timestamptz DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_providers_category ON public.providers(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON public.providers(slug);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON public.procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_prices_provider ON public.provider_prices(provider_id);
CREATE INDEX IF NOT EXISTS idx_prices_procedure ON public.provider_prices(procedure_id);
CREATE INDEX IF NOT EXISTS idx_quotes_provider ON public.quote_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user ON public.quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_photo_path ON public.quote_requests(photo_url);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_flash_active ON public.flash_discounts (is_active, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_flash_provider ON public.flash_discounts (provider_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_user ON public.user_searches (user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_searches_procedures ON public.user_searches USING GIN (procedure_ids);

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

-- Public catalog: read-only for everyone
DO $$ BEGIN CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read providers" ON public.providers FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read procedures" ON public.procedures FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read provider_prices" ON public.provider_prices FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users: self-service on own row (registration inserts id = auth.uid())
DO $$ BEGIN CREATE POLICY "Users read own row" ON public.users FOR SELECT USING (id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own row" ON public.users FOR INSERT WITH CHECK (id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users update own row" ON public.users FOR UPDATE USING (id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Providers: an authenticated provider can update their own provider row
DO $$ BEGIN CREATE POLICY "Providers update own provider" ON public.providers FOR UPDATE USING (
  id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Provider registration: an authenticated user may create a provider row
-- (register flow inserts the provider then links users.provider_id)
DO $$ BEGIN CREATE POLICY "Authenticated create provider" ON public.providers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Prices: providers manage their own price list
DO $$ BEGIN CREATE POLICY "Providers insert own prices" ON public.provider_prices FOR INSERT WITH CHECK (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Providers update own prices" ON public.provider_prices FOR UPDATE USING (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Providers delete own prices" ON public.provider_prices FOR DELETE USING (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Quotes: patient reads own; provider reads/updates quotes addressed to them.
-- Creation happens ONLY via the service role (anonymous quote funnel).
DO $$ BEGIN CREATE POLICY "Patients read own quotes" ON public.quote_requests FOR SELECT USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Providers read own quotes" ON public.quote_requests FOR SELECT USING (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Providers update own quotes" ON public.quote_requests FOR UPDATE USING (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Reviews: only a patient with a COMPLETED quote at that provider may insert
DO $$ BEGIN CREATE POLICY "Patients review completed quotes" ON public.reviews FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.quote_requests q
    WHERE q.id = quote_id AND q.user_id = auth.uid()
      AND q.provider_id = reviews.provider_id AND q.status = 'completed'
  )
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Flash discounts: public read of live ones; providers manage their own
DO $$ BEGIN CREATE POLICY "Active flash discounts are public" ON public.flash_discounts FOR SELECT USING (is_active = true AND expires_at > now()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Providers manage own flash discounts" ON public.flash_discounts FOR ALL USING (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
) WITH CHECK (
  provider_id IN (SELECT provider_id FROM public.users WHERE id = auth.uid() AND role = 'provider')
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- User searches: owner-only
DO $$ BEGIN CREATE POLICY "Users manage own searches" ON public.user_searches FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Storage: PRIVATE bucket for quote photos (medical imagery) ──

INSERT INTO storage.buckets (id, name, public)
VALUES ('quote_photos', 'quote_photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;
