-- 006_call_tracking.sql
--
-- ONE tracked phone number for every clinic.
--
-- Each clinic that has a phone gets a permanent 3-digit `call_code`. The Call
-- button dials our single Twilio number and the phone sends the code on its own
-- (`tel:+1XXXXXXXXXX,,104`). Twilio reads the code, dials that clinic, plays the
-- whisper "Paciente de ClearCross Progreso" to the clinic, and connects. Every
-- call is written to `clearcross_calls`.
--
-- Additive and idempotent. Nothing existing is altered or renumbered.
--
-- ============================================================================
-- ⛔ A CODE IS NEVER REUSED AND NEVER RENUMBERED
-- ============================================================================
--
-- A code lives in a patient's call history. If they call back next month from
-- their recents list, the digits their phone sends are the ones it sent last
-- time. Hand those digits to a different clinic and a patient who meant to reach
-- their dentist is connected to a stranger, with our whisper vouching for it.
--
-- So the codes come from a SEQUENCE with NO CYCLE: removing a clinic, or its
-- phone, never frees its number, and the 900th code is the last one rather than
-- a silent wrap back to 100. The assignment below only ever touches rows whose
-- `call_code IS NULL`, so re-applying this file cannot move an existing code.

CREATE SEQUENCE IF NOT EXISTS public.clearcross_call_code_seq
  AS smallint
  MINVALUE 100
  MAXVALUE 999
  START 100
  NO CYCLE;

ALTER TABLE public.clearcross_providers
  ADD COLUMN IF NOT EXISTS call_code smallint;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clearcross_providers_call_code_key') THEN
    ALTER TABLE public.clearcross_providers
      ADD CONSTRAINT clearcross_providers_call_code_key UNIQUE (call_code);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clearcross_providers_call_code_range_chk') THEN
    ALTER TABLE public.clearcross_providers
      ADD CONSTRAINT clearcross_providers_call_code_range_chk
      CHECK (call_code IS NULL OR call_code BETWEEN 100 AND 999);
  END IF;
END $$;

-- ⛔ The sequence must never sit BELOW a code already in the table, or its next
-- value collides with a live clinic. It is only ever moved FORWARD here.
DO $$
DECLARE
  top smallint;
  last bigint;
  called boolean;
BEGIN
  SELECT max(call_code) INTO top FROM public.clearcross_providers;
  SELECT last_value, is_called INTO last, called FROM public.clearcross_call_code_seq;
  IF top IS NOT NULL AND (NOT called OR top > last) AND top >= last THEN
    PERFORM setval('public.clearcross_call_code_seq', top, true);
  END IF;
END $$;

-- Assign codes to the clinics that have a phone, oldest first. Every seeded row
-- shares one created_at, so the slug breaks the tie and the order is stable.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id FROM public.clearcross_providers
     WHERE call_code IS NULL
       AND nullif(btrim(phone), '') IS NOT NULL
     ORDER BY created_at, slug
  LOOP
    UPDATE public.clearcross_providers
       SET call_code = nextval('public.clearcross_call_code_seq')
     WHERE id = r.id AND call_code IS NULL;
  END LOOP;
END $$;

-- A clinic added later (tools/verify/run-places-discover.mjs inserts them) gets a
-- code the moment it has a phone. Without this, every new clinic would silently
-- fall back to a direct, untracked Call button and nothing would say so.
CREATE OR REPLACE FUNCTION public.clearcross_assign_call_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.call_code IS NULL AND nullif(btrim(NEW.phone), '') IS NOT NULL THEN
    NEW.call_code := nextval('public.clearcross_call_code_seq');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS clearcross_providers_call_code_trg ON public.clearcross_providers;
CREATE TRIGGER clearcross_providers_call_code_trg
  BEFORE INSERT OR UPDATE OF phone ON public.clearcross_providers
  FOR EACH ROW EXECUTE FUNCTION public.clearcross_assign_call_code();

-- ============================================================================
-- The call log
-- ============================================================================
--
-- ⛔ `caller` IS A PATIENT'S PHONE NUMBER. RLS is on with ZERO policies, and the
-- anon and authenticated roles are revoked outright, so only the service role
-- (the Twilio webhooks) can read or write it. This table is the proof we sell a
-- clinic, and it is also personal data about somebody seeking medical care.
--
-- ⛔ There is no recording column because there is no recording.

CREATE TABLE IF NOT EXISTS public.clearcross_calls (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid     text NOT NULL UNIQUE,
  provider_id  uuid REFERENCES public.clearcross_providers(id) ON DELETE SET NULL,
  caller       text,
  code_entered text,
  code_source  text CHECK (code_source IS NULL OR code_source IN ('auto', 'typed', 'none')),
  dial_status  text,
  duration_sec integer CHECK (duration_sec IS NULL OR duration_sec >= 0),
  started_at   timestamptz NOT NULL DEFAULT now(),
  ended_at     timestamptz
);

CREATE INDEX IF NOT EXISTS clearcross_calls_provider_idx ON public.clearcross_calls (provider_id, started_at DESC);

ALTER TABLE public.clearcross_calls ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.clearcross_calls FROM anon, authenticated;
