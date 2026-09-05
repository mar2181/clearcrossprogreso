/**
 * Builds the UPDATE that Places verification writes, as a pure function.
 *
 * ⛔ WHY THIS IS A MODULE AND NOT AN INLINE TEMPLATE. Every field here is
 * SUPPLEMENTARY data from a third party landing on rows that were curated by
 * hand from the clinics' own websites. The rule that keeps that safe -- fill a
 * blank, never overwrite -- is a property of the generated SQL, and while it
 * lived inline in a for-loop there was no way to drive it, so nothing checked
 * it. test/places-write.mjs drives this.
 *
 * ⛔ AND THE RULE HAS TO BE EXPRESSED IN SQL, NOT IN JAVASCRIPT. The right-hand
 * side of each coalesce reads the OLD row, so the statement CANNOT overwrite a
 * value that is already there even if a future caller asks it to. A JS
 * conditional guarding the same thing is one edit away from being bypassed.
 */

export const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

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
export const placePhone = (pl) =>
  (pl.internationalPhoneNumber || pl.nationalPhoneNumber || '').trim() || null;

/**
 * The clinic's own website, or null.
 *
 * ⛔ THIS IS THE FIELD THAT LEADS TO PRICES. Google publishes no medical
 * prices and never will; what it publishes is the address of the page where
 * the clinic publishes its own. 52 of the 78 visible providers hold no website
 * at all, which is why two thirds of the directory has no price list.
 *
 * ⛔ A Places result can carry a directory or aggregator URL rather than the
 * business's own site. Storing one would point a visitor at a competitor, so
 * anything on a known aggregator host is dropped rather than saved.
 */
const NOT_THEIR_SITE = [
  // Social and generic pages: not a price list, and not a site the clinic controls.
  'facebook.com', 'instagram.com', 'business.site', 'sites.google.com',
  'linktr.ee', 'wa.me', 'yelp.com', 'tripadvisor.com',
  // ⛔ DIRECT COMPETITORS. These are the medical-tourism aggregators that own the
  // head terms this site is trying to take (see the positioning note in STATE.md).
  // Storing one sends our own visitor to a rival directory, from a page carrying
  // our provider's name. Found in the live data: 3 providers already hold a
  // dentaldepartures.com link and 2 hold whatclinic.com, curated long before this
  // filter existed -- coalesce correctly leaves those alone, so they are a DATA
  // decision, not something this rule can undo.
  'whatclinic.com', 'dentaldepartures.com', 'medicaltourismco.com',
  'placidway.com', 'doctoralia.com', 'bookimed.com', 'medigence.com',
  // And us.
  'clearcrossprogreso.com',
];
// ⛔ fresha.com is deliberately NOT here. It is a booking platform the business
// itself runs its own diary on -- not a directory of its rivals. Four providers
// use it. It is not a price list either, which is a separate problem.
export const placeWebsite = (pl) => {
  const raw = (pl.websiteUri || '').trim();
  if (!raw) return null;
  let host;
  try { host = new URL(raw).hostname.toLowerCase().replace(/^www\./, ''); }
  catch { return null; }
  if (NOT_THEIR_SITE.some((h) => host === h || host.endsWith('.' + h))) return null;
  return raw;
};

/**
 * The UPDATE for one matched provider.
 *
 * `id` is the provider row. `pl` is the Places result that cleared both gates.
 *
 * `opts.contact` is the CONTACT gate (see contactWritable in the runner). When
 * it is false the provider still verifies and still gets its hours and
 * coordinates -- it simply does not receive a phone number or a website from a
 * match we are not confident enough to dial.
 */
export function buildProviderUpdate(pl, id, opts = {}) {
  const contact = opts.contact !== false;
  const hours = pl.regularOpeningHours?.weekdayDescriptions
    ? q(JSON.stringify(pl.regularOpeningHours.weekdayDescriptions))
    : 'null';
  const phone = contact && placePhone(pl) ? q(placePhone(pl)) : 'null';
  const website = contact && placeWebsite(pl) ? q(placeWebsite(pl)) : 'null';

  return `
    update clearcross_providers set
      verified = true,
      -- ⛔ FILL A BLANK, NEVER OVERWRITE. Our numbers came from the clinics'
      -- own websites and WhatClinic (see lib/mock-data.ts); Places is a
      -- SUPPLEMENT, not an authority, and it is measurably wrong about this
      -- strip -- six real pharmacies all resolve to Linda Pharmacy. Writing
      -- Google's number over a curated one would silently point a patient at
      -- a different business.
      phone = coalesce(nullif(phone, ''), ${phone}),
      phone_source = case
        when nullif(phone, '') is null and ${phone} is not null then 'google-places'
        else phone_source end,
      -- Same rule, same reason. A curated website was read off the clinic's
      -- own material; Google's is a guess we did not make.
      website = coalesce(nullif(website, ''), ${website}),
      google_place_id = ${q(pl.id)},
      verified_at = now(),
      verification_source = 'google-places',
      business_status = ${q(pl.businessStatus || 'UNKNOWN')},
      -- ⛔ COALESCE, NOT A BARE ASSIGNMENT, AND THIS WAS A LIVE DEFECT. This
      -- read: hours = VALUE::jsonb, where VALUE is the literal null
      -- whenever Places returns no opening hours for a matched business. So a
      -- re-run ERASED curated hours on every provider Google happens to be
      -- quiet about -- silently, on a directory whose entire job is telling
      -- somebody when a clinic is open. 53 of 78 visible providers hold hours.
      hours = coalesce(hours, ${hours}::jsonb),
      lat = ${pl.location?.latitude ?? 'lat'},
      lng = ${pl.location?.longitude ?? 'lng'},
      -- ⛔ Google's rating goes in Google's columns. Writing it to
      -- avg_rating/review_count would render as an unattributed star row on a
      -- page that says "No reviews yet" ten lines below. See migration 003.
      google_rating = ${pl.rating ?? 'null'},
      google_review_count = ${pl.userRatingCount ?? 'null'}
    where id = ${q(id)}
  `;
}
