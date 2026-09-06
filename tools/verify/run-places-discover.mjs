/**
 * Find businesses on the strip we do not list yet, and (with --apply) add them.
 *
 * DRY RUN BY DEFAULT.
 *
 *   node tools/verify/run-places-discover.mjs            # report only
 *   node tools/verify/run-places-discover.mjs --apply    # insert the accepted rows
 *
 * ⛔ The Places key in the vault is UNRESTRICTED. Read from the environment
 * here; it must never reach a NEXT_PUBLIC_ var or the browser.
 */
import { discoverable, slugFor, SEARCHES } from './places-discover.mjs';
import { placePhone, placeWebsite, q } from './places-write.mjs';

const PAT = process.env.SUPABASE_PAT;
const PLACES_KEY = process.env.GOOGLE_PLACES_KEY;
const REF = 'svgsbaahxiaeljmfykzp';
const APPLY = process.argv.includes('--apply');

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
        'places.businessStatus', 'places.types', 'places.primaryType',
        'places.nationalPhoneNumber', 'places.internationalPhoneNumber',
        'places.regularOpeningHours.weekdayDescriptions',
        'places.websiteUri',
      ].join(','),
    },
    body: JSON.stringify({ textQuery, maxResultCount: 20, languageCode: 'es' }),
  });
  if (!r.ok) throw new Error(`Places ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).places || [];
}

const existing = await sql(`
  select p.id, p.name, p.slug, p.google_place_id, c.slug as category
  from clearcross_providers p
  join clearcross_categories c on c.id = p.category_id
`);
const categories = await sql('select id, slug from clearcross_categories');
const catId = new Map(categories.map((c) => [c.slug, c.id]));

console.log(`${existing.length} providers already listed | ${SEARCHES.length} searches | ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

// Harvest first, gate second. The same business comes back from several queries
// (a dental clinic answers to "dentista", "dental clinic" and "implantes"), so
// de-duplicating by place id here is what stops one business being reported --
// or inserted -- three times.
const seen = new Map();
for (const query of SEARCHES) {
  let places = [];
  try {
    places = await searchPlaces(query);
  } catch (e) {
    console.log(`  !  ${query} -> ${e.message}`);
    continue;
  }
  let fresh = 0;
  for (const p of places) {
    if (!p.id || seen.has(p.id)) continue;
    seen.set(p.id, p);
    fresh++;
  }
  console.log(`  ${String(places.length).padStart(2)} results, ${String(fresh).padStart(2)} new  ::  ${query}`);
  await new Promise((r) => setTimeout(r, 120));
}

console.log(`\n${seen.size} distinct places harvested.\n`);

const accepted = [];
const refused = [];
// ⛔ Slugs taken must include the ones generated EARLIER IN THIS RUN, not only
// those in the database. `slug` is unique, so two candidates resolving to the
// same slug is a batch that fails halfway with rows already written.
const taken = new Set(existing.map((e) => e.slug));
// ⛔ And the growing accepted list is passed as `existing` too, so a second
// branch of the same chain is caught by the name gate rather than becoming a
// second indistinguishable row.
for (const place of seen.values()) {
  const verdict = discoverable(place, [...existing, ...accepted.map((a) => a.row)]);
  if (!verdict.ok) {
    refused.push([place, verdict]);
    continue;
  }
  const name = place.displayName.text;
  const slug = slugFor(name, taken);
  taken.add(slug);
  accepted.push({ place, category: verdict.category, slug, row: { name, slug, google_place_id: place.id } });
}

const byReason = {};
for (const [, v] of refused) byReason[v.reason] = (byReason[v.reason] || 0) + 1;
console.log('refused:');
for (const [k, v] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);

// The two refusal reasons a person needs to SEE rather than count: something we
// might actually want, held back by a rule.
for (const kind of ['unmapped-category', 'not-operational']) {
  const list = refused.filter(([, v]) => v.reason === kind);
  if (!list.length) continue;
  console.log(`\n${kind} (${list.length}) -- review these, nothing was added:`);
  for (const [p, v] of list.slice(0, 40)) {
    console.log(`  x ${p.displayName.text}  ::  ${v.detail}`);
  }
}

const nameClash = refused.filter(([, v]) => v.reason === 'already-listed' && !String(v.detail).includes('same google place id'));
if (nameClash.length) {
  console.log(`\nrefused as already-listed BY NAME (${nameClash.length}) -- a conservative`);
  console.log('gate; some of these may be genuinely different businesses:');
  for (const [p, v] of nameClash.slice(0, 40)) {
    console.log(`  x ${p.displayName.text}  ~  ${v.detail}`);
  }
}

console.log(`\n=== ${accepted.length} NEW businesses would be added ===`);
const byCat = {};
for (const a of accepted) (byCat[a.category] ||= []).push(a);
for (const [cat, list] of Object.entries(byCat).sort()) {
  console.log(`\n[${cat}] ${list.length}`);
  for (const a of list) {
    const bits = [];
    if (placePhone(a.place)) bits.push('phone');
    if (placeWebsite(a.place)) bits.push('site');
    if (a.place.regularOpeningHours?.weekdayDescriptions?.length) bits.push('hours');
    console.log(`  + ${a.place.displayName.text}  (${bits.join(', ') || 'name+address only'})`);
  }
}

if (!APPLY) {
  console.log('\nDRY RUN -- nothing written. Re-run with --apply.');
  process.exit(0);
}

for (const a of accepted) {
  const p = a.place;
  const id = catId.get(a.category);
  if (!id) throw new Error(`no category row for ${a.category}`);
  const hours = p.regularOpeningHours?.weekdayDescriptions?.length
    ? q(JSON.stringify({ weekdayDescriptions: p.regularOpeningHours.weekdayDescriptions })) + '::jsonb'
    : 'null';
  const phone = placePhone(p);
  const site = placeWebsite(p);
  const loc = p.location;

  /**
   * ⛔ GOOGLE'S RATING GOES IN google_rating, NEVER IN avg_rating.
   *
   * `avg_rating` is what the page renders as a star row, and this site has zero
   * reviews -- measured, 0 of 104 pages render one. Copying a Google score into
   * that column would make a provider page show stars under a heading that says
   * "No reviews yet", presenting somebody else's ratings as ours.
   *
   * ⛔ AND NO DESCRIPTION. Every existing description was written from the
   * clinic's own material. Google supplies none, and inventing a sentence about
   * a real medical business is exactly the class of thing this repo's
   * honest-claims guard exists to stop. A null description renders nothing.
   */
  await sql(`
    insert into clearcross_providers
      (category_id, name, slug, address, phone, website, verified, lat, lng,
       google_place_id, verified_at, verification_source, hours, business_status,
       google_rating, google_review_count, phone_source)
    values (
      ${q(id)}, ${q(p.displayName.text)}, ${q(a.slug)}, ${q(p.formattedAddress || '')},
      ${phone ? q(phone) : 'null'}, ${site ? q(site) : 'null'},
      true,
      ${typeof loc?.latitude === 'number' ? loc.latitude : 'null'},
      ${typeof loc?.longitude === 'number' ? loc.longitude : 'null'},
      ${q(p.id)}, now(), 'google-places', ${hours},
      ${p.businessStatus ? q(p.businessStatus) : 'null'},
      ${typeof p.rating === 'number' ? p.rating : 'null'},
      ${typeof p.userRatingCount === 'number' ? p.userRatingCount : 'null'},
      ${phone ? "'google-places'" : 'null'}
    )
  `);
}
console.log(`\ninserted ${accepted.length} providers.`);
