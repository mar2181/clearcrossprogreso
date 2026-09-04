/**
 * Re-verify every ClearCross provider against Google Places.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write. Nothing about a provider changes
 * unless a match clears both gates in places-match.mjs.
 *
 *   node tools/verify/run-places-verification.mjs            # report only
 *   node tools/verify/run-places-verification.mjs --apply    # write results
 *
 * ⛔ The Places key in the vault is UNRESTRICTED. It is read from the
 * environment here and must never reach a NEXT_PUBLIC_ var or the browser.
 */
import { chooseMatch, NAME_THRESHOLD } from './places-match.mjs';

const PAT = process.env.SUPABASE_PAT;
const PLACES_KEY = process.env.GOOGLE_PLACES_KEY;
const REF = 'svgsbaahxiaeljmfykzp';
const APPLY = process.argv.includes('--apply');
const LIMIT = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1] || 0);

if (!PAT || !PLACES_KEY) {
  console.error('Need SUPABASE_PAT and GOOGLE_PLACES_KEY in the environment.');
  process.exit(1);
}

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(`Management API ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function searchPlaces(textQuery) {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': [
        'places.id', 'places.displayName', 'places.formattedAddress',
        'places.location', 'places.rating', 'places.userRatingCount',
        'places.businessStatus', 'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.regularOpeningHours.weekdayDescriptions',
      ].join(','),
    },
    body: JSON.stringify({ textQuery, maxResultCount: 5, languageCode: 'es' }),
  });
  if (!r.ok) throw new Error(`Places ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return j.places || [];
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * The phone number to store, or null.
 *
 * ⛔ INTERNATIONAL FORMAT IS PREFERRED, and it is not a style choice. The
 * audience is people in the Rio Grande Valley dialing ACROSS A BORDER. Places
 * returns `nationalPhoneNumber` in the number's OWN country format, so a Mexican
 * clinic comes back as "899 934 1234" -- which is not dialable from a US phone,
 * and fails in the worst way: it looks like a phone number and quietly does
 * nothing. `internationalPhoneNumber` carries the country code, so it is
 * dialable from either side for both the Mexican clinics and the several
 * providers on this strip that publish US (+1 956) numbers.
 */
const placePhone = (pl) =>
  (pl.internationalPhoneNumber || pl.nationalPhoneNumber || '').trim() || null;

const rows = await sql(`
  select p.id, p.name, p.slug, p.address, p.verified, p.phone, c.slug as category
  from clearcross_providers p
  join clearcross_categories c on c.id = p.category_id
  order by c.slug, p.name
  ${LIMIT ? `limit ${LIMIT}` : ''}
`);

console.log(`${rows.length} providers | threshold ${NAME_THRESHOLD} | ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

const results = [];
for (const p of rows) {
  let candidates = [];
  let err = null;
  try {
    candidates = await searchPlaces(`${p.name} Nuevo Progreso Tamaulipas Mexico`);
  } catch (e) {
    err = e.message;
  }
  const verdict = err
    ? { matched: false, reason: 'api-error', detail: err }
    : chooseMatch(p, candidates);
  results.push({ p, verdict });
  const mark = verdict.matched ? 'MATCH' : 'no   ';
  const extra = verdict.matched
    ? `${verdict.score.toFixed(2)} ${verdict.place.displayName.text}`
    : `${verdict.reason}${verdict.score !== undefined ? ` ${verdict.score.toFixed(2)}` : ''}${verdict.detail ? ` :: ${String(verdict.detail).slice(0, 60)}` : ''}`;
  console.log(`${mark} [${p.category}] ${p.name}  ->  ${extra}`);
  await new Promise((r) => setTimeout(r, 120)); // be polite to the API
}

const matched = results.filter((r) => r.verdict.matched);
const byReason = {};
for (const r of results) if (!r.verdict.matched) byReason[r.verdict.reason] = (byReason[r.verdict.reason] || 0) + 1;

console.log(`\n--- ${matched.length}/${results.length} matched ---`);
for (const [k, v] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log(`  ${v}  ${k}`);

// What actually changes on the site: currently-hidden rows that earned a match.
const toReveal = matched.filter((r) => !r.p.verified);
const toHide = results.filter((r) => !r.verdict.matched && r.p.verified);
console.log(`\nwould reveal: ${toReveal.length} (currently hidden, matched)`);
console.log(`would hide:   ${toHide.length} (currently visible, NO match)`);

// Phone coverage. We already pay for `nationalPhoneNumber` on every call and
// have been discarding it, while two thirds of provider pages render no working
// contact affordance at all.
const hasPhone = (p) => Boolean(p.phone && String(p.phone).trim());
const phoneFills = matched.filter(({ p, verdict }) => !hasPhone(p) && placePhone(verdict.place));
const phoneKept = matched.filter(({ p, verdict }) => hasPhone(p) && placePhone(verdict.place));
console.log(`\nwould fill phone: ${phoneFills.length} (matched, we hold no number)`);
console.log(`would NOT touch:  ${phoneKept.length} (matched, we already hold a number -- ours wins)`);
for (const { p, verdict } of phoneFills) {
  console.log(`  + [${p.category}] ${p.name}  ->  ${placePhone(verdict.place)}`);
}

if (!APPLY) {
  console.log('\nDRY RUN -- nothing written. Re-run with --apply.');
  process.exit(0);
}

// The write path below sets `phone_source`, added by migration
// 005_provider_phone_source.sql. Check it exists BEFORE writing anything rather
// than discovering it 63 statements in, having already spent the API calls.
const hasPhoneSource = await sql(`
  select count(*)::int as n from information_schema.columns
  where table_name = 'clearcross_providers' and column_name = 'phone_source'
`);
if (!hasPhoneSource[0]?.n) {
  console.error(
    '\nclearcross_providers.phone_source does not exist.\n' +
    'Apply supabase/migrations/005_provider_phone_source.sql first, then re-run.\n' +
    'Nothing has been written.'
  );
  process.exit(1);
}

let written = 0;
for (const { p, verdict } of results) {
  if (!verdict.matched) {
    // Record the failed check so a re-run does not silently retry it, but do
    // NOT touch `verified` -- demoting live rows is a separate, louder decision.
    await sql(`update clearcross_providers set verified_at = now(),
               verification_source = 'google-places' where id = ${q(p.id)}`);
    written++;
    continue;
  }
  const pl = verdict.place;
  const hours = pl.regularOpeningHours?.weekdayDescriptions
    ? q(JSON.stringify(pl.regularOpeningHours.weekdayDescriptions)) : 'null';
  const phone = placePhone(pl) ? q(placePhone(pl)) : 'null';
  await sql(`
    update clearcross_providers set
      verified = true,
      -- ⛔ FILL A BLANK, NEVER OVERWRITE. Our numbers came from the clinics'
      -- own websites and WhatClinic (see lib/mock-data.ts); Places is a
      -- SUPPLEMENT, not an authority, and it is measurably wrong about this
      -- strip -- six real pharmacies all resolve to Linda Pharmacy. Writing
      -- Google's number over a curated one would silently point a patient at
      -- a different business.
      --
      -- The rule is a COALESCE rather than a JS conditional, so it is
      -- structural (and note: no backticks in this comment -- it lives inside a
      -- JS template literal, where one would terminate the string early). The
      -- right-hand side reads the OLD row, so this statement CANNOT overwrite a
      -- number that is already there even if the caller asks it to. A guard in
      -- JS alone is one edit away from being bypassed.
      phone = coalesce(nullif(phone, ''), ${phone}),
      phone_source = case
        when nullif(phone, '') is null and ${phone} is not null then 'google-places'
        else phone_source end,
      google_place_id = ${q(pl.id)},
      verified_at = now(),
      verification_source = 'google-places',
      business_status = ${q(pl.businessStatus || 'UNKNOWN')},
      hours = ${hours}::jsonb,
      lat = ${pl.location?.latitude ?? 'lat'},
      lng = ${pl.location?.longitude ?? 'lng'},
      -- ⛔ Google's rating goes in Google's columns. Writing it to
      -- avg_rating/review_count would render as an unattributed star row on a
      -- page that says "No reviews yet" ten lines below. See migration 003.
      google_rating = ${pl.rating ?? 'null'},
      google_review_count = ${pl.userRatingCount ?? 'null'}
    where id = ${q(p.id)}
  `);
  written++;
}
console.log(`\nwrote ${written} rows.`);
