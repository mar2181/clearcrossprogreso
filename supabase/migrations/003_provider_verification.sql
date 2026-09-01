-- 003_provider_verification.sql
--
-- Makes a verification RECORDABLE instead of merely assertable.
--
-- Until now `clearcross_providers.verified` was a bare boolean seeded from mock
-- data with no provenance: nothing said who checked, when, or against what. The
-- site rendered a badge on top of it. docs/HONEST_CLAIMS.md removed the claim
-- that we had inspected anything; these columns are what let us make a narrower
-- claim we can actually stand behind ("this listing matched a Google Places
-- record on <date>") without inventing the rest.
--
-- Additive and idempotent. No existing column is altered and no row is touched,
-- so applying this changes nothing a visitor can see.

ALTER TABLE public.clearcross_providers
  -- The Google Places resource id (places/ChIJ...). Stable across runs, so a
  -- re-verification updates a row rather than creating a second opinion, and a
  -- human can paste it into Maps and see what we matched.
  ADD COLUMN IF NOT EXISTS google_place_id text,

  -- When the match was last confirmed. A verification with no date silently
  -- becomes a claim about today, forever.
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,

  -- How it was verified. Deliberately free text with a CHECK rather than a bare
  -- boolean, because "matched Google Places", "someone walked in" and "the
  -- provider signed a listing agreement" are different promises and the page
  -- copy must be able to tell them apart.
  ADD COLUMN IF NOT EXISTS verification_source text,

  -- Opening hours as Google returns them (weekdayDescriptions). Free-form on
  -- purpose: Mexican clinic hours are irregular and a rigid open/close schema
  -- would force us to invent structure the source does not have.
  ADD COLUMN IF NOT EXISTS hours jsonb,

  -- Business status from Places: OPERATIONAL / CLOSED_TEMPORARILY /
  -- CLOSED_PERMANENTLY. A permanently closed clinic must never be shown as an
  -- option to somebody planning to drive across a border for it.
  ADD COLUMN IF NOT EXISTS business_status text,

  -- ⛔ GOOGLE'S RATINGS LIVE IN THEIR OWN COLUMNS AND MUST NOT BE WRITTEN INTO
  -- avg_rating / review_count.
  --
  -- Those two are rendered by app/[category]/[provider]/page.tsx as a star row
  -- reading "4.5 ... 2 reviews", with no attribution, on a page whose review
  -- section says "No reviews yet." Putting Google's number there recreates
  -- exactly the contradiction docs/HONEST_CLAIMS.md removed -- a rating the site
  -- appears to be claiming as its own, contradicted further down the same page.
  --
  -- Kept separate so the display can name the source when it is wired up. Until
  -- it is, these columns hold real data that nothing renders, which is the
  -- correct state: an unattributed rating is worse than no rating.
  ADD COLUMN IF NOT EXISTS google_rating numeric(3,2),
  ADD COLUMN IF NOT EXISTS google_review_count integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clearcross_providers_verification_source_chk'
  ) THEN
    ALTER TABLE public.clearcross_providers
      ADD CONSTRAINT clearcross_providers_verification_source_chk
      CHECK (verification_source IS NULL OR verification_source IN (
        'google-places',      -- name + locality matched a live Places record
        'manual-visit',       -- a human physically confirmed the business
        'provider-agreement'  -- the provider signed something with ClearCross
      ));
  END IF;
END $$;

-- The pairing rule, enforced by the database rather than by remembering.
--
-- A row may not claim a source without a date, or a date without a source. That
-- combination is precisely how `verified` became meaningless: a flag with no
-- provenance beside it reads as authoritative and cannot be audited. Note it
-- does NOT require `verified` itself to be true -- a FAILED check is worth
-- recording too, so a re-run does not silently retry the same dead business.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clearcross_providers_verification_pairing_chk'
  ) THEN
    ALTER TABLE public.clearcross_providers
      ADD CONSTRAINT clearcross_providers_verification_pairing_chk
      CHECK ((verification_source IS NULL) = (verified_at IS NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS clearcross_providers_place_id_idx
  ON public.clearcross_providers (google_place_id)
  WHERE google_place_id IS NOT NULL;
