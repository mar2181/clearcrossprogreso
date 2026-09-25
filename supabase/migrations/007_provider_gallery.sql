-- ============================================================
-- ClearCross Progreso — Provider photo gallery (real, DB-backed)
-- Providers can upload real photos of their clinic. New uploads land in
-- gallery_pending until an admin approves them — the same "ambiguous ->
-- admin reviews" gate already used by the claim flow, because this
-- directory has already been burned by stale/misattributed photos and
-- misgeolocated listings once.
-- Idempotent: safe to re-run.
-- ============================================================

ALTER TABLE public.clearcross_providers
  ADD COLUMN IF NOT EXISTS gallery_pending text[] DEFAULT '{}';

-- ── Storage: PUBLIC bucket for provider gallery photos ──
-- Unlike clearcross_quote_photos (medical imagery: private + signed URLs
-- with a 10-minute expiry), these are meant to render directly on the
-- public provider page, so the bucket itself is public.
--
-- No storage.objects RLS policy is added: every write goes through the
-- service-role client in app/api/providers/[id]/photos/route.ts and
-- app/api/admin/photos/[providerId]/route.ts, which bypasses storage RLS
-- and re-checks ownership/admin role in app code first — the same pattern
-- already used by the existing provider PATCH route. No client ever
-- uploads to this bucket directly.
INSERT INTO storage.buckets (id, name, public)
VALUES ('clearcross_provider_photos', 'clearcross_provider_photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
