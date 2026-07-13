-- ============================================================
-- ClearCross Progreso — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- OPTION A: Use existing Supabase project (tables will be prefixed)
-- OPTION B: Create a new Supabase project for ClearCross only
-- 
-- If using existing project, these tables will coexist with your other tables.
-- If using a new project, create it at supabase.com and update env vars.

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  description text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Seed categories
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
  ('Dentists', 'dentists', 'tooth', 'Compare prices for dental work in Nuevo Progreso, Mexico', 1),
  ('Pharmacies', 'pharmacies', 'pill', 'Find prescription prices from pharmacies in Nuevo Progreso', 2),
  ('Spas & Massage', 'spas', 'spa', 'Relax and rejuvenate at spas in Nuevo Progreso', 3),
  ('Optometrists', 'optometrists', 'eye', 'Compare prices for eye exams, glasses, and contacts', 4),
  ('Cosmetic Surgery', 'cosmetic-surgery', 'sparkles', 'Find board-certified cosmetic surgeons at fraction of US prices', 5),
  ('Doctors', 'doctors', 'stethoscope', 'Find general medicine doctors and family practice physicians', 6),
  ('Liquor Stores', 'liquor', 'wine', 'Compare prices for spirits, wine, and beer', 7),
  ('Veterinarians', 'vets', 'paw', 'Find affordable veterinary care for your pets', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. PROVIDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
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

-- ============================================================
-- 3. PROCEDURES
-- ============================================================
CREATE TABLE IF NOT EXISTS procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  sort_order integer DEFAULT 0
);

-- Seed dental procedures
INSERT INTO procedures (category_id, name, slug, description, sort_order)
SELECT id, 'Consultation / Exam', 'consultation-exam', 'Initial dental exam or consultation', 1 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Dental Cleaning', 'dental-cleaning', 'Routine prophylaxis cleaning', 2 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Deep Cleaning', 'deep-cleaning', 'Scaling and root planing per quadrant', 3 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Periapical X-Ray', 'periapical-xray', 'Single tooth X-ray', 4 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Composite Filling', 'composite-filling', 'White composite dental filling', 5 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Tooth Extraction', 'tooth-extraction', 'Non-wisdom tooth extraction', 6 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Wisdom Tooth Extraction', 'wisdom-tooth-extraction', 'Wisdom tooth removal', 7 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Root Canal', 'root-canal', 'Root canal therapy', 8 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Metal Porcelain Crown', 'metal-porcelain-crown', 'Porcelain fused to metal crown', 9 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Zirconia Crown', 'zirconia-crown', 'Full zirconia dental crown', 10 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'E-Max Crown', 'emax-crown', 'Lithium disilicate crown', 11 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Composite Veneer', 'composite-veneer', 'Composite resin veneer per tooth', 12 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Porcelain Veneer', 'porcelain-veneer', 'Porcelain veneer per tooth', 13 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Lumineer', 'lumineer', 'Ultra-thin porcelain veneer', 14 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening', 15 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Dental Implant', 'dental-implant', 'Single titanium implant', 16 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Crown Over Implant', 'crown-over-implant', 'Zirconia crown on implant abutment', 17 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Dentures', 'dentures', 'Complete denture per arch', 18 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'All-on-4 Implants', 'all-on-4', 'Full arch on 4 implants', 19 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'All-on-6 Implants', 'all-on-6', 'Full arch on 6 implants', 20 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Braces', 'braces', 'Traditional orthodontic braces', 21 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, '3-Unit Bridge', '3-unit-bridge', 'Three-unit fixed dental bridge', 22 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Bone Graft', 'bone-graft', 'Bone grafting for implant preparation', 23 FROM categories WHERE slug = 'dentists'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. PROVIDER PRICES
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  price_usd numeric(10,2),
  price_notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, procedure_id)
);

-- ============================================================
-- 5. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  role text DEFAULT 'patient' CHECK (role IN ('patient', 'provider', 'admin')),
  provider_id uuid REFERENCES providers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. QUOTE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  description text,
  photo_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'completed')),
  quoted_price numeric(10,2),
  price_locked boolean DEFAULT false,
  provider_notes text,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

-- ============================================================
-- 7. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quote_requests(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 8. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON providers(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_procedures_category_id ON procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_prices_provider_id ON provider_prices(provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_provider_id ON quote_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);

-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$ BEGIN
  CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read providers" ON providers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read procedures" ON procedures FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read provider_prices" ON provider_prices FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 10. SEED PROVIDERS (sample — full data via seed script)
-- ============================================================
-- Run the seed script below AFTER this migration to populate all 64 providers
-- The seed script is at: clearcross_supabase_seed.sql
