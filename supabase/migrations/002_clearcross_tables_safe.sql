-- ============================================================
-- ClearCross Progreso — IDEMPOTENT Migration
-- Safe for fresh DB or existing 001 tables
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Create tables (IF NOT EXISTS handles both fresh and existing)
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

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
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
  photo_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'completed')),
  quoted_price numeric(10,2),
  price_locked boolean DEFAULT false,
  provider_notes text,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
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

-- Step 2: Backward compat — add slug to old procedures table if missing
ALTER TABLE IF EXISTS public.procedures ADD COLUMN IF NOT EXISTS slug text;

-- Step 3: Indexes
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON public.providers(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON public.providers(slug);
CREATE INDEX IF NOT EXISTS idx_procedures_category_id ON public.procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_prices_provider_id ON public.provider_prices(provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_provider_id ON public.quote_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON public.quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON public.reviews(provider_id);

-- Step 4: Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies
DO $$ BEGIN CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read providers" ON public.providers FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read procedures" ON public.procedures FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read provider_prices" ON public.provider_prices FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 6: Seed categories
INSERT INTO public.categories (name, slug, icon, description, sort_order) VALUES
  ('Dentists', 'dentists', 'tooth', 'Compare prices for dental work in Nuevo Progreso, Mexico', 1),
  ('Pharmacies', 'pharmacies', 'pill', 'Find prescription prices from pharmacies in Nuevo Progreso', 2),
  ('Spas & Massage', 'spas', 'spa', 'Relax and rejuvenate at spas in Nuevo Progreso', 3),
  ('Optometrists', 'optometrists', 'eye', 'Compare prices for eye exams, glasses, and contacts', 4),
  ('Cosmetic Surgery', 'cosmetic-surgery', 'sparkles', 'Find board-certified cosmetic surgeons at fraction of US prices', 5),
  ('Doctors', 'doctors', 'stethoscope', 'Find general medicine doctors and family practice physicians', 6),
  ('Liquor Stores', 'liquor', 'wine', 'Compare prices for spirits, wine, and beer', 7),
  ('Veterinarians', 'vets', 'paw', 'Find affordable veterinary care for your pets', 8)
ON CONFLICT (slug) DO NOTHING;

-- Step 7: Seed dental procedures
INSERT INTO public.procedures (category_id, name, slug, description, sort_order)
SELECT id, 'Consultation / Exam', 'consultation-exam', 'Initial dental exam or consultation', 1 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Dental Cleaning', 'dental-cleaning', 'Routine prophylaxis cleaning', 2 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Deep Cleaning', 'deep-cleaning', 'Scaling and root planing per quadrant', 3 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Periapical X-Ray', 'periapical-xray', 'Single tooth X-ray', 4 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Composite Filling', 'composite-filling', 'White composite dental filling', 5 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Tooth Extraction', 'tooth-extraction', 'Non-wisdom tooth extraction', 6 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Wisdom Tooth Extraction', 'wisdom-tooth-extraction', 'Wisdom tooth removal', 7 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Root Canal', 'root-canal', 'Root canal therapy', 8 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Metal Porcelain Crown', 'metal-porcelain-crown', 'Porcelain fused to metal crown', 9 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Zirconia Crown', 'zirconia-crown', 'Full zirconia dental crown', 10 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'E-Max Crown', 'emax-crown', 'Lithium disilicate crown', 11 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Composite Veneer', 'composite-veneer', 'Composite resin veneer per tooth', 12 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Porcelain Veneer', 'porcelain-veneer', 'Porcelain veneer per tooth', 13 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Lumineer', 'lumineer', 'Ultra-thin porcelain veneer', 14 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening', 15 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Dental Implant', 'dental-implant', 'Single titanium implant', 16 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Crown Over Implant', 'crown-over-implant', 'Zirconia crown on implant abutment', 17 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Dentures', 'dentures', 'Complete denture per arch', 18 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'All-on-4 Implants', 'all-on-4', 'Full arch on 4 implants', 19 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'All-on-6 Implants', 'all-on-6', 'Full arch on 6 implants', 20 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Braces', 'braces', 'Traditional orthodontic braces', 21 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, '3-Unit Bridge', '3-unit-bridge', 'Three-unit fixed dental bridge', 22 FROM public.categories WHERE slug = 'dentists'
UNION ALL SELECT id, 'Bone Graft', 'bone-graft', 'Bone grafting for implant preparation', 23 FROM public.categories WHERE slug = 'dentists'
ON CONFLICT DO NOTHING;

-- DONE. Run 003_seed_providers.sql next.
