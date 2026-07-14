#!/usr/bin/env bash
# ClearCross — apply prefixed schema + seed to the SHARED Supabase project (stopgap
# until the dedicated project is paid for). All tables are clearcross_* so nothing
# can collide with CaseVault / industrial-parks / hs-quizzes tables.
#
# Run from the repo root:
#   SUPABASE_PAT=sbp_xxx bash scripts/apply-clearcross-shared.sh
set -euo pipefail

REF="${CLEARCROSS_PROJECT_REF:-svgsbaahxiaeljmfykzp}"
PAT="${SUPABASE_PAT:?Set SUPABASE_PAT (sbp_...) — it is in api_keys_vault.md}"
API="https://api.supabase.com/v1/projects/$REF/database/query"

run_sql_file() {
  local file="$1" label="$2"
  echo "→ Applying $label ($file)..."
  node -e "
    const fs = require('fs');
    const sql = fs.readFileSync(process.argv[1], 'utf8');
    fetch('$API', {
      method: 'POST',
      headers: { Authorization: 'Bearer $PAT', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql }),
    }).then(async (r) => {
      const body = await r.text();
      if (!r.ok) { console.error('FAILED', r.status, body.slice(0, 500)); process.exit(1); }
      console.log('  OK', r.status);
    });
  " "$file"
}

run_sql_file supabase/migrations/001_clearcross_schema.sql "schema (9 tables + RLS + private bucket)"
run_sql_file supabase/migrations/002_seed.sql "seed (8 categories / 83 procedures / 104 providers / 312 prices)"

echo "→ Verifying row counts..."
node -e "
  fetch('$API', {
    method: 'POST',
    headers: { Authorization: 'Bearer $PAT', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: \`
      SELECT 'categories' t, count(*) n FROM public.clearcross_categories
      UNION ALL SELECT 'procedures', count(*) FROM public.clearcross_procedures
      UNION ALL SELECT 'providers', count(*) FROM public.clearcross_providers
      UNION ALL SELECT 'prices', count(*) FROM public.clearcross_provider_prices
      UNION ALL SELECT 'bucket', count(*) FROM storage.buckets WHERE id = 'clearcross_quote_photos'
    \` }),
  }).then(async (r) => console.log(await r.text()));
"
echo "Done. Expected: categories 8, procedures 83, providers 104, prices 312, bucket 1."
