#!/usr/bin/env bash
# ClearCross — apply migration 007 (provider photo gallery: gallery_pending
# column + public clearcross_provider_photos bucket) to the SHARED Supabase
# project. Same mechanism as scripts/apply-clearcross-shared.sh.
#
# Run from the repo root:
#   SUPABASE_PAT=sbp_xxx bash scripts/apply-007-provider-gallery.sh
set -euo pipefail

REF="${CLEARCROSS_PROJECT_REF:-svgsbaahxiaeljmfykzp}"
PAT="${SUPABASE_PAT:?Set SUPABASE_PAT (sbp_...) — it is in api_keys_vault.md}"
API="https://api.supabase.com/v1/projects/$REF/database/query"

echo "→ Applying 007_provider_gallery.sql..."
node -e "
  const fs = require('fs');
  const sql = fs.readFileSync('supabase/migrations/007_provider_gallery.sql', 'utf8');
  fetch('$API', {
    method: 'POST',
    headers: { Authorization: 'Bearer $PAT', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  }).then(async (r) => {
    const body = await r.text();
    if (!r.ok) { console.error('FAILED', r.status, body.slice(0, 500)); process.exit(1); }
    console.log('  OK', r.status);
  });
"

# ── Per reference_supabase_management_api_ddl: the DDL endpoint prints an
#    empty/ambiguous result either way — the only trustworthy check is
#    reading the live schema back, not trusting the apply call's own output.
echo "→ Reading the schema back to confirm..."
node -e "
  fetch('$API', {
    method: 'POST',
    headers: { Authorization: 'Bearer $PAT', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: \`
      SELECT
        (SELECT count(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'clearcross_providers'
            AND column_name = 'gallery_pending') AS column_exists,
        (SELECT count(*) FROM storage.buckets
          WHERE id = 'clearcross_provider_photos' AND public = true) AS bucket_public
    \` }),
  }).then(async (r) => console.log(await r.text()));
"
echo "Expected: column_exists 1, bucket_public 1."
