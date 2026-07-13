-- Flash Discounts: time-limited deals providers activate to fill empty slots
-- User Searches: track search history for targeted notifications

-- =====================================================
-- FLASH DISCOUNTS TABLE
-- =====================================================
CREATE TABLE flash_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  procedure_ids UUID[] DEFAULT '{}',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup for active, non-expired discounts
CREATE INDEX idx_flash_active ON flash_discounts (is_active, expires_at)
  WHERE is_active = true;

-- Provider lookup
CREATE INDEX idx_flash_provider ON flash_discounts (provider_id);

-- RLS
ALTER TABLE flash_discounts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active discounts
CREATE POLICY "Active flash discounts are public"
  ON flash_discounts FOR SELECT
  USING (is_active = true AND expires_at > now());

-- Providers can manage their own discounts
CREATE POLICY "Providers manage own flash discounts"
  ON flash_discounts FOR ALL
  USING (
    provider_id IN (
      SELECT provider_id FROM users WHERE id = auth.uid() AND role = 'provider'
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT provider_id FROM users WHERE id = auth.uid() AND role = 'provider'
    )
  );

-- Service role can expire discounts (for cron)
CREATE POLICY "Service role manages all flash discounts"
  ON flash_discounts FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- USER SEARCHES TABLE (for targeted notifications)
-- =====================================================
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  procedure_ids UUID[] DEFAULT '{}',
  search_query TEXT,
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- Recent searches by user
CREATE INDEX idx_user_searches_user ON user_searches (user_id, searched_at DESC);

-- GIN index for procedure array matching
CREATE INDEX idx_user_searches_procedures ON user_searches USING GIN (procedure_ids);

-- RLS
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own searches
CREATE POLICY "Users manage own searches"
  ON user_searches FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can query all searches (for notification matching)
CREATE POLICY "Service role reads all searches"
  ON user_searches FOR SELECT
  USING (auth.role() = 'service_role');
