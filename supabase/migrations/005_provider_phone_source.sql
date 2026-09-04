-- 005_provider_phone_source.sql
--
-- Records WHERE a provider's phone number came from.
--
-- Two thirds of provider pages render no working contact affordance: 37 of 104
-- rows carry a phone number. Meanwhile tools/verify/run-places-verification.mjs
-- has been requesting `places.nationalPhoneNumber` on every Places call and
-- throwing the answer away. This column is what makes it safe to stop throwing
-- it away.
--
-- Additive and idempotent. No existing column is altered; the one UPDATE below
-- only labels numbers that already exist and cannot change a rendered value.
--
-- ============================================================================
-- ⛔ WHY THE NUMBER GOES IN `phone` AND NOT A NEW `google_phone`
-- ============================================================================
--
-- Migration 003 put Google's rating in `google_rating` rather than `avg_rating`,
-- and that separation is not a naming convention to be copied mechanically -- it
-- exists because a RATING IS GOOGLE'S OPINION. Rendered unattributed next to a
-- review section reading "No reviews yet", it becomes a claim the site appears
-- to be making as its own.
--
-- A phone number is not an opinion. It is the clinic's own contact fact, and
-- there is no attribution to misstate: nobody reads a tel: link as an
-- endorsement. Following the google_* pattern here would mean fetching a number,
-- storing it, and STILL rendering nothing -- the same "harvest and discard"
-- problem this change exists to fix, moved one column to the left.
--
-- What the google_* pattern is really protecting is provenance, and that is
-- what this column supplies. 003's own words: a value with no provenance beside
-- it reads as authoritative and cannot be audited. So the number lands where it
-- is useful, and the label lands beside it so a wrong one can be traced.

ALTER TABLE public.clearcross_providers
  ADD COLUMN IF NOT EXISTS phone_source text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clearcross_providers_phone_source_chk'
  ) THEN
    ALTER TABLE public.clearcross_providers
      ADD CONSTRAINT clearcross_providers_phone_source_chk
      CHECK (phone_source IS NULL OR phone_source IN (
        'curated',       -- clinic website / WhatClinic, via lib/mock-data.ts
        'google-places', -- filled from a Places record that cleared all 3 gates
        'provider'       -- the provider told us directly
      ));
  END IF;
END $$;

-- A source without a number is a label attached to nothing.
--
-- Note the rule is deliberately one-directional: a number MAY exist with no
-- source (that is every row seeded before this migration ran, and it is honest
-- -- "we do not know" is a real answer). What is forbidden is the reverse, a
-- provenance claim about a value that is not there.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clearcross_providers_phone_source_pairing_chk'
  ) THEN
    ALTER TABLE public.clearcross_providers
      ADD CONSTRAINT clearcross_providers_phone_source_pairing_chk
      CHECK (phone_source IS NULL OR nullif(btrim(phone), '') IS NOT NULL);
  END IF;
END $$;

-- Label the numbers we already hold.
--
-- Every phone number in the table today arrived from lib/mock-data.ts, whose
-- header names its sources: official clinic websites, WhatClinic, DentalMexico,
-- PlacidWay, ClinicBooking, Dental Departures. That is 'curated'.
--
-- ⛔ This runs BEFORE the verification runner ever writes a 'google-places'
-- number, and it is guarded by `phone_source IS NULL`, so re-applying it can
-- never relabel a harvested number as curated. Applying this file twice is a
-- no-op the second time.
UPDATE public.clearcross_providers
   SET phone_source = 'curated'
 WHERE phone_source IS NULL
   AND nullif(btrim(phone), '') IS NOT NULL;
