-- ClearCross Progreso - Initial Database Schema
-- Medical/Dental Price-Transparency Marketplace
-- Migration: 001_initial_schema.sql

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================

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

-- ============================================================================
-- 2. PROVIDERS TABLE
-- ============================================================================

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

-- ============================================================================
-- 3. PROCEDURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  description text,
  sort_order integer DEFAULT 0
);

-- ============================================================================
-- 4. PROVIDER_PRICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  price_usd numeric(10,2),
  price_notes text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, procedure_id)
);

-- ============================================================================
-- 5. USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  role text DEFAULT 'patient' CHECK (role IN ('patient', 'provider', 'admin')),
  provider_id uuid REFERENCES providers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. QUOTE_REQUESTS TABLE
-- ============================================================================

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

-- ============================================================================
-- 7. REVIEWS TABLE
-- ============================================================================

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

-- ============================================================================
-- 8. INDEXES
-- ============================================================================

CREATE INDEX idx_providers_category_id ON providers(category_id);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_procedures_category_id ON procedures(category_id);
CREATE INDEX idx_provider_prices_provider_id ON provider_prices(provider_id);
CREATE INDEX idx_quote_requests_provider_id ON quote_requests(provider_id);
CREATE INDEX idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);

-- ============================================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. RLS POLICIES
-- ============================================================================

-- CATEGORIES: Public read access
CREATE POLICY "Categories are readable by everyone"
  ON categories FOR SELECT
  USING (true);

-- PROVIDERS: Public read, providers can update own row
CREATE POLICY "Providers are readable by everyone"
  ON providers FOR SELECT
  USING (true);

CREATE POLICY "Providers can update their own row"
  ON providers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = providers.id
      AND users.role IN ('provider', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = providers.id
      AND users.role IN ('provider', 'admin')
    )
  );

-- PROCEDURES: Public read access
CREATE POLICY "Procedures are readable by everyone"
  ON procedures FOR SELECT
  USING (true);

-- PROVIDER_PRICES: Public read, providers can update own prices
CREATE POLICY "Provider prices are readable by everyone"
  ON provider_prices FOR SELECT
  USING (true);

CREATE POLICY "Providers can update their own prices"
  ON provider_prices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = provider_prices.provider_id
      AND users.role IN ('provider', 'admin')
    )
  );

CREATE POLICY "Providers can update their own prices (update)"
  ON provider_prices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = provider_prices.provider_id
      AND users.role IN ('provider', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = provider_prices.provider_id
      AND users.role IN ('provider', 'admin')
    )
  );

-- USERS: Users can read/update own row
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- QUOTE_REQUESTS: Patients can read/create own, providers can read/update quotes for their provider
CREATE POLICY "Patients can read their own quote requests"
  ON quote_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Providers can read quotes for their provider"
  ON quote_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = quote_requests.provider_id
      AND users.role IN ('provider', 'admin')
    )
  );

CREATE POLICY "Patients can create quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can update quotes for their provider"
  ON quote_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = quote_requests.provider_id
      AND users.role IN ('provider', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.provider_id = quote_requests.provider_id
      AND users.role IN ('provider', 'admin')
    )
  );

-- REVIEWS: Public read, patients can create if they have a completed quote
CREATE POLICY "Reviews are readable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Patients can create reviews from completed quotes"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM quote_requests
      WHERE quote_requests.id = reviews.quote_id
      AND quote_requests.user_id = auth.uid()
      AND quote_requests.status = 'completed'
    )
  );

-- ============================================================================
-- 11. SEED DATA - CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
  ('Dentists', 'dentists', 'tooth', 'Dental care and oral health services', 1),
  ('Pharmacies', 'pharmacies', 'pill', 'Prescription medications and pharmacy services', 2),
  ('Spas & Massage', 'spas', 'spa', 'Relaxation and wellness services', 3),
  ('Optometrists', 'optometrists', 'eye', 'Eye care and vision services', 4),
  ('Cosmetic Surgery', 'cosmetic-surgery', 'sparkles', 'Cosmetic and reconstructive surgery', 5),
  ('Liquor Stores', 'liquor', 'wine', 'Alcoholic beverages and spirits', 6),
  ('Veterinarians', 'vets', 'paw', 'Animal healthcare and veterinary services', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 12. SEED DATA - PROCEDURES (DENTAL)
-- ============================================================================

INSERT INTO procedures (category_id, name, slug, description, sort_order)
SELECT id, 'Dental Cleaning', 'dental-cleaning', 'Professional cleaning and plaque removal', 1 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Dental Filling', 'dental-filling', 'Cavity treatment with composite or amalgam', 2 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Tooth Extraction', 'tooth-extraction', 'Surgical removal of tooth', 3 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Root Canal', 'root-canal', 'Endodontic treatment for infected tooth', 4 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Porcelain Crown', 'porcelain-crown', 'Ceramic crown restoration', 5 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Zirconia Crown', 'zirconia-crown', 'Zirconia ceramic crown restoration', 6 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Dental Implant (Single)', 'dental-implant-single', 'Single tooth implant with abutment', 7 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Full Arch Implants', 'full-arch-implants', 'Complete mouth implant restoration', 8 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Porcelain Veneer', 'porcelain-veneer', 'Single porcelain veneer restoration', 9 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Hollywood Smile', 'hollywood-smile', '20 porcelain veneers for complete smile makeover', 10 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Teeth Whitening', 'teeth-whitening', 'Professional tooth whitening treatment', 11 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Dentures (Per Plate)', 'dentures-per-plate', 'Complete or partial dentures', 12 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, '3-Unit Bridge', 'three-unit-bridge', 'Fixed bridge for missing teeth', 13 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Wisdom Tooth Removal', 'wisdom-tooth-removal', 'Surgical extraction of wisdom tooth', 14 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Deep Cleaning', 'deep-cleaning', 'Periodontal scaling and root planing', 15 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Orthodontics / Braces', 'orthodontics-braces', 'Traditional metal or ceramic braces', 16 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Invisalign', 'invisalign', 'Clear aligner orthodontic treatment', 17 FROM categories WHERE slug = 'dentists'
UNION ALL
SELECT id, 'Child Dental Exam', 'child-dental-exam', 'Pediatric dental examination and cleaning', 18 FROM categories WHERE slug = 'dentists'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 13. SEED DATA - SAMPLE PROVIDERS & PRICES
-- ============================================================================

-- Insert Provider 1: Texas Dental Clinic
INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured, avg_rating, review_count)
SELECT id, 'Texas Dental Clinic', 'texas-dental-clinic', '123 Main St, Progreso', '+1-956-555-0100', '+1-956-555-0100', 'https://texasdentalclinic.com', 'High-quality dental services at competitive prices', true, true, 4.5, 12
FROM categories WHERE slug = 'dentists'
ON CONFLICT (slug) DO NOTHING;

-- Insert Provider 2: Progreso Smile Dental Center
INSERT INTO providers (category_id, name, slug, address, phone, whatsapp, website, description, verified, featured)
SELECT id, 'Progreso Smile Dental Center', 'progreso-smile-dental-center', '456 Riverside Ave, Progreso', '+1-956-555-0200', '+1-956-555-0200', 'https://progresosmile.com', 'Award-winning dental practice with experienced dentists', true, false, 4.7, 25
FROM categories WHERE slug = 'dentists'
ON CONFLICT (slug) DO NOTHING;

-- Insert prices for Texas Dental Clinic
INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'dental-cleaning'),
  35,
  'Standard cleaning'
FROM procedures WHERE slug = 'dental-cleaning' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'tooth-extraction'),
  50,
  'Simple extraction'
FROM procedures WHERE slug = 'tooth-extraction' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'root-canal'),
  240,
  'Complete root canal treatment'
FROM procedures WHERE slug = 'root-canal' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'porcelain-crown'),
  280,
  'High-quality porcelain crown'
FROM procedures WHERE slug = 'porcelain-crown' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'zirconia-crown'),
  430,
  'Zirconia ceramic crown'
FROM procedures WHERE slug = 'zirconia-crown' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'porcelain-veneer'),
  430,
  'Single porcelain veneer'
FROM procedures WHERE slug = 'porcelain-veneer' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'hollywood-smile'),
  8000,
  '20 porcelain veneers complete smile'
FROM procedures WHERE slug = 'hollywood-smile' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'three-unit-bridge'),
  1290,
  '3-unit fixed bridge'
FROM procedures WHERE slug = 'three-unit-bridge' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'dental-implant-single'),
  1000,
  'Single dental implant with abutment'
FROM procedures WHERE slug = 'dental-implant-single' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'full-arch-implants'),
  14000,
  'Complete mouth full arch implant restoration'
FROM procedures WHERE slug = 'full-arch-implants' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'deep-cleaning'),
  100,
  'Scaling and root planing'
FROM procedures WHERE slug = 'deep-cleaning' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'texas-dental-clinic'),
  (SELECT id FROM procedures WHERE slug = 'wisdom-tooth-removal'),
  150,
  'Surgical wisdom tooth extraction'
FROM procedures WHERE slug = 'wisdom-tooth-removal' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

-- Insert prices for Progreso Smile Dental Center
INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'progreso-smile-dental-center'),
  (SELECT id FROM procedures WHERE slug = 'dental-cleaning'),
  30,
  'Professional cleaning'
FROM procedures WHERE slug = 'dental-cleaning' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'progreso-smile-dental-center'),
  (SELECT id FROM procedures WHERE slug = 'dental-filling'),
  30,
  'Composite filling'
FROM procedures WHERE slug = 'dental-filling' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'progreso-smile-dental-center'),
  (SELECT id FROM procedures WHERE slug = 'porcelain-crown'),
  200,
  'Porcelain crown'
FROM procedures WHERE slug = 'porcelain-crown' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'progreso-smile-dental-center'),
  (SELECT id FROM procedures WHERE slug = 'zirconia-crown'),
  350,
  'Zirconia crown'
FROM procedures WHERE slug = 'zirconia-crown' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

INSERT INTO provider_prices (provider_id, procedure_id, price_usd, price_notes)
SELECT
  (SELECT id FROM providers WHERE slug = 'progreso-smile-dental-center'),
  (SELECT id FROM procedures WHERE slug = 'dentures-per-plate'),
  250,
  'Complete dentures per plate'
FROM procedures WHERE slug = 'dentures-per-plate' LIMIT 1
ON CONFLICT (provider_id, procedure_id) DO NOTHING;

-- ============================================================================
-- 14. SUPABASE STORAGE BUCKET CREATION
-- ============================================================================
-- Note: Storage bucket creation must be done via Supabase dashboard or API
-- This is a placeholder comment indicating the bucket should be created with:
-- Bucket name: quote-photos
-- Public: false (RLS policies should be used)
-- File size limit: 10MB recommended
-- Allowed file types: image/*, application/pdf

-- SQL equivalent (if supported by your Supabase version):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('quote-photos', 'quote-photos', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
