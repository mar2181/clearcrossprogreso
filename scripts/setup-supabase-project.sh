#!/usr/bin/env bash
# ============================================================
# ClearCross Progreso — one-shot dedicated Supabase project setup
# Creates project "clearcross-progreso" in Mario's org (Pro plan,
# ~$10/mo compute), applies schema + seed, prints the env vars.
#
# Run:  SUPABASE_PAT=sbp_xxx bash scripts/setup-supabase-project.sh
# (PAT lives in the api_keys_vault. Safe to re-run: skips creation
#  if the project already exists; migrations are idempotent.)
# ============================================================
set -euo pipefail

ORG_ID="iupedkehqgyiicwdpvko"
NAME="clearcross-progreso"
REGION="us-east-1"
API="https://api.supabase.com/v1"
HDR=(-H "Authorization: Bearer ${SUPABASE_PAT}" -H "Content-Type: application/json" -H "User-Agent: clearcross-setup/1.0")

command -v jq >/dev/null || { echo "jq required"; exit 1; }

# 1) Find or create the project
REF=$(curl -s "${HDR[@]}" "$API/projects" | jq -r ".[] | select(.name==\"$NAME\") | .id")
if [ -z "$REF" ]; then
  DBPASS=$(python -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits) for _ in range(28)))")
  echo "Creating project $NAME (db password printed at the end — save it to the vault)"
  REF=$(curl -s "${HDR[@]}" -X POST "$API/projects" \
    -d "{\"organization_id\":\"$ORG_ID\",\"name\":\"$NAME\",\"region\":\"$REGION\",\"db_pass\":\"$DBPASS\"}" | jq -r '.id')
  [ "$REF" != "null" ] && [ -n "$REF" ] || { echo "creation failed"; exit 1; }
  echo "Created: $REF  — waiting for it to come up..."
else
  echo "Project already exists: $REF"
  DBPASS="(unchanged — already in vault)"
fi

# 2) Wait until healthy
for i in $(seq 1 60); do
  STATUS=$(curl -s "${HDR[@]}" "$API/projects/$REF" | jq -r '.status')
  [ "$STATUS" = "ACTIVE_HEALTHY" ] && break
  echo "  status=$STATUS (waiting...)"; sleep 10
done
[ "$STATUS" = "ACTIVE_HEALTHY" ] || { echo "project never became healthy"; exit 1; }

# 3) Apply migrations via the Management API SQL endpoint
for f in supabase/migrations/001_clearcross_schema.sql supabase/migrations/002_seed.sql; do
  echo "Applying $f ..."
  jq -Rs '{query: .}' < "$f" | curl -s "${HDR[@]}" -X POST "$API/projects/$REF/database/query" -d @- \
    | head -c 300; echo
done

# 4) Verify seed counts
echo "Verifying row counts:"
jq -Rs '{query: .}' <<< "select 'categories' t, count(*) from categories union all select 'providers', count(*) from providers union all select 'procedures', count(*) from procedures union all select 'provider_prices', count(*) from provider_prices union all select 'buckets', count(*) from storage.buckets where id='quote_photos';" \
  | curl -s "${HDR[@]}" -X POST "$API/projects/$REF/database/query" -d @-; echo

# 5) Fetch API keys
echo
echo "=============== ENV VARS (set on Vercel project clearcrossprogreso.com + .env.local) ==============="
echo "NEXT_PUBLIC_SUPABASE_URL=https://$REF.supabase.co"
curl -s "${HDR[@]}" "$API/projects/$REF/api-keys" | jq -r '.[] | select(.name=="anon") | "NEXT_PUBLIC_SUPABASE_ANON_KEY=" + .api_key'
curl -s "${HDR[@]}" "$API/projects/$REF/api-keys" | jq -r '.[] | select(.name=="service_role") | "SUPABASE_SERVICE_ROLE_KEY=" + .api_key'
echo "DB password: $DBPASS"
echo "Also set: CRON_SECRET (any random string), AUTH_COOKIE_SECRET, RESEND_API_KEY, USE_MOCK_DATA=real"
