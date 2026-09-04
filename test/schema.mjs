/**
 * The structured data must describe the page a human sees.
 *
 * ⛔ WHY THIS GUARD READS THE BUILT HTML AND NOT THE FUNCTION.
 *
 * A unit test of `providerGraph()` can only prove the builder is internally
 * consistent. The failure this site has actually shipped is the OTHER kind: an
 * `aggregateRating` of 4.2/27 that was perfectly well-formed and sat above a
 * panel reading "No reviews yet". Internally consistent, and a Google
 * structured-data policy violation.
 *
 * The prices are the same surface, 312 times over and far easier to get wrong:
 * a flash discount strikes $1,200 through and renders $960, and markup built
 * from `price_usd` would tell Google $1,200. Nobody reading the page would ever
 * see it.
 *
 * So this opens each prerendered file and compares the JSON-LD against the
 * VISIBLE price table in that same file. That is the only comparison that can
 * catch drift between the two.
 *
 * Runs after `next build` in `npm run verify`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { withinNuevoProgreso } from '../tools/verify/places-match.mjs';

const APP = '.next/server/app';

// ENGLISH TREE ONLY, and that is a decision rather than an oversight.
// `app/es/[category]/[provider]/page.tsx` re-exports the English component
// wholesale, so every Spanish page emits byte-identical JSON-LD pointing at the
// English canonical -- which is defensible entity consolidation, and consistent
// with what those pages actually render (English). Asserting the current state
// there would PIN the duplicate-content bug instead of catching it. /es comes
// into scope with the /es rewrite.
const CATEGORIES = [
  'dentists',
  'doctors',
  'cosmetic-surgery',
  'pharmacies',
  'optometrists',
  'vets',
  'spas',
  'liquor',
];

// Every value here is a real schema.org type. A misspelling is silently ignored
// by consumers, which looks identical to shipping no markup at all -- so the
// set is pinned rather than trusted.
const ALLOWED_TYPE = {
  dentists: 'Dentist',
  doctors: 'Physician',
  'cosmetic-surgery': 'MedicalClinic',
  pharmacies: 'Pharmacy',
  optometrists: 'Optician',
  vets: 'VeterinaryCare',
  spas: 'DaySpa',
  liquor: 'LiquorStore',
};

// Measured on the build that introduced this guard. A drop means providers or
// prices silently stopped reaching the markup -- which reads as "fine" on every
// individual page.
const MIN_TOTAL_OFFERS = 300;
const MIN_PAGES = 100;
// The zero path renders the word Free. Measured: 11 rows on the build that
// introduced this guard.
//
// ⛔ THIS FLOOR EXISTS BECAUSE CONSISTENCY CANNOT SEE A SHARED-SOURCE BUG.
// The table and the markup both call effectivePrice(), so breaking that one
// function moves BOTH and they still agree -- the mutation harness proved it,
// scoring MISSED on a change that priced every Free row at $99. A count is the
// only thing that notices the whole category quietly disappearing.
const MIN_FREE_ROWS = 11;

let pass = 0;
const failures = [];

function check(ok, label) {
  if (ok) pass++;
  else failures.push(label);
}

function readGraph(html) {
  const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return 'INVALID';
  }
}

/**
 * The price table as the visitor reads it: procedure name -> EVERY rendered cell
 * under that name.
 *
 * ⛔ A LIST, not a single cell. The first draft of this guard keyed a Map by
 * procedure name and kept the last row, then reported 8 false drift failures --
 * because one procedure legitimately has several rows at different prices.
 * Farmacias Benavides renders five Anti-Parasitic (Ivermectin) lines from $6 to
 * $59; Pancho renders three Weight Loss lines at $300, $250 and $41. Collapsing
 * them makes every price but the last look invented.
 *
 * The cell text is kept RAW rather than parsed into a number, because the three
 * states that matter are distinguishable only as text -- a figure, the word
 * "Free", and a "Request a quote" link.
 */
function visiblePrices(html) {
  const rows = html.split('<tr class="border-b border-neutral-100');
  const out = new Map();
  for (const row of rows.slice(1)) {
    const name = row.match(/<td class="py-3 px-4 text-neutral-dark"><span>([^<]*)<\/span>/);
    if (!name) continue;
    const cell = row.match(/<td class="py-3 px-4 text-right">(.*?)<\/td>/s);
    if (!cell) continue;
    const key = decode(name[1]);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(cell[1]);
  }
  return out;
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Money as rendered ("$1,200.00") -> 1200. */
function moneyIn(cellHtml) {
  const nums = [...cellHtml.matchAll(/\$([\d,]+(?:\.\d\d)?)/g)].map((m) =>
    parseFloat(m[1].replace(/,/g, '')),
  );
  return nums;
}

// ── 0. The artifact must exist. A guard that skips itself is worse than no
//       guard: it prints a pass. ────────────────────────────────────────────
if (!fs.existsSync(APP)) {
  console.error(
    'FAIL  no build found at ' + APP + ' -- run `next build` first. ' +
      'This guard reads the prerendered HTML on purpose and must never self-skip.',
  );
  process.exit(1);
}

let pages = 0;
let totalOffers = 0;
let freeRows = 0;
let zeroOffers = 0;
const typeSeen = {};

for (const cat of CATEGORIES) {
  const dir = path.join(APP, cat);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.html')) continue;
    const slug = file.replace(/\.html$/, '');
    const where = cat + '/' + slug;
    const html = fs.readFileSync(path.join(dir, file), 'utf8');

    const graph = readGraph(html);
    if (graph === null) {
      failures.push(where + ' :: no JSON-LD at all');
      continue;
    }
    if (graph === 'INVALID') {
      failures.push(where + ' :: JSON-LD is not parseable JSON');
      continue;
    }
    pages++;

    const nodes = graph['@graph'] || [];
    const business = nodes.find((n) => n['@type'] !== 'BreadcrumbList');
    const crumb = nodes.find((n) => n['@type'] === 'BreadcrumbList');
    if (!business || !crumb) {
      failures.push(where + ' :: graph is missing the business or the breadcrumb');
      continue;
    }

    // ── 1. A real, specialized schema.org type ──────────────────────────────
    typeSeen[business['@type']] = (typeSeen[business['@type']] || 0) + 1;
    check(
      business['@type'] === ALLOWED_TYPE[cat],
      where + ' :: type is ' + business['@type'] + ', expected ' + ALLOWED_TYPE[cat],
    );

    // ── 2. THE DRIFT CHECK. Every Offer must state the figure the table shows.
    const table = visiblePrices(html);
    const offers = business.hasOfferCatalog?.itemListElement || [];
    totalOffers += offers.length;

    for (const offer of offers) {
      const name = offer.itemOffered?.name;
      const cells = table.get(name);
      if (cells === undefined) {
        failures.push(
          where + ' :: Offer for "' + name + '" but that procedure is not in the visible table',
        );
        continue;
      }
      const schemaPrice = parseFloat(offer.price);
      if (schemaPrice === 0) {
        zeroOffers++;
        // The page renders the word Free for a zero. An Offer at 0 is honest
        // only if that is what the reader is told.
        check(
          cells.some((c) => /Free/.test(c)),
          where + ' :: Offer says 0 for "' + name + '" but no row says Free',
        );
        continue;
      }

      // Every figure rendered under this name, and the subset that only ever
      // appears struck through (the pre-discount price in a two-figure cell).
      const shown = [];
      const struck = new Set();
      const kept = new Set();
      let anyDiscounted = false;
      let allDiscounted = cells.length > 0;
      for (const c of cells) {
        const nums = moneyIn(c);
        shown.push(...nums);
        if (nums.length > 1) {
          anyDiscounted = true;
          struck.add(Math.max(...nums));
          kept.add(Math.min(...nums));
        } else {
          allDiscounted = false;
          nums.forEach((n) => kept.add(n));
        }
      }

      check(
        shown.includes(schemaPrice),
        where +
          ' :: Offer says ' + schemaPrice + ' for "' + name +
          '" but the table renders ' + (shown.length ? shown.join('/') : '(no figure)'),
      );

      // ⛔ A struck-through figure is the price the reader is being told
      // they do NOT pay. An Offer stating it contradicts the page directly.
      if (struck.has(schemaPrice) && !kept.has(schemaPrice)) {
        failures.push(
          where + ' :: Offer states ' + schemaPrice + ' for "' + name +
            '", which the table renders struck through',
        );
      }

      if (allDiscounted) {
        check(
          typeof offer.priceValidUntil === 'string',
          where + ' :: discounted "' + name + '" has no priceValidUntil',
        );
      } else if (!anyDiscounted) {
        // ⛔ An undiscounted Offer must NOT carry an expiry. Inventing one
        // tells Google this price lapses on a date nobody set.
        check(
          offer.priceValidUntil === undefined,
          where + ' :: "' + name + '" is not discounted but carries a priceValidUntil',
        );
      }
      check(
        offer.priceCurrency === 'USD',
        where + ' :: "' + name + '" is not priced in USD',
      );
    }

    for (const cells of table.values()) {
      for (const cell of cells) {
        if (/Free/.test(cell)) freeRows++;
        const nums = moneyIn(cell);
        // ⛔ A cell rendering the SAME figure twice is a discount that did
        // not discount -- struck-through $1,200 beside $1,200. It reads as a
        // rendering glitch and it means the discount arithmetic is broken for
        // the table AND the markup at once, so no comparison between them can
        // notice it.
        if (nums.length > 1) {
          check(
            Math.min(...nums) < Math.max(...nums),
            where + ' :: a discounted cell renders the same figure twice (' + nums.join('/') + ')',
          );
        }
      }
    }

    // ── 3. THE INVENTION CHECK. A row the page renders as "Request a quote"
    //       has no price -- so it must have no Offer. ─────────────────────────
    const offered = new Set(offers.map((o) => o.itemOffered?.name));
    for (const [name, cells] of table) {
      // Only when EVERY row for this procedure is a quote link: a procedure with
      // three priced rows and one unpriced row should still carry three Offers.
      if (cells.every((c) => /\/quote\?provider=/.test(c))) {
        check(
          !offered.has(name),
          where + ' :: "' + name + '" renders only quote links but an Offer states a price',
        );
      }
    }

    // ── 4. The rating rule that was already violated once. ──────────────────
    // The FULL sentence, because the fragment is not unique to the review panel.
    // Scanning for "No reviews yet" alone flagged three correct pages: the
    // related-provider cards at the bottom render that fragment for a DIFFERENT
    // clinic, so a page with two real reviews of its own looked like a policy
    // violation. Only ReviewList emits the sentence below.
    const saysNoReviews = html.includes(
      'No reviews yet. Be the first to share your experience.',
    );
    if (business.aggregateRating) {
      check(
        !saysNoReviews,
        where + ' :: aggregateRating on a page that reads "No reviews yet"',
      );
      check(
        Number(business.aggregateRating.reviewCount) > 0,
        where + ' :: aggregateRating with a reviewCount of 0',
      );
    }

    // ── 5. The breadcrumb must name the trail on screen. ────────────────────
    // ⛔ DECODED, and scoped to the breadcrumb list itself. The first draft
    // compared the JSON-LD name against raw HTML and reported 9 false failures:
    // the page encodes apostrophes and ampersands, so Jessica&#x27;s Med Center
    // is what the markup holds. A guard that cannot read the page it is
    // checking accuses correct code.
    const olStart = html.indexOf('<ol class="flex items-center gap-1.5 text-sm text-neutral-400">');
    const trail = olStart === -1 ? '' : decode(html.slice(olStart, html.indexOf('</ol>', olStart)));
    check(olStart !== -1, where + ' :: the visible breadcrumb list was not found');
    for (const item of crumb.itemListElement) {
      check(
        trail.includes(item.name),
        where + ' :: breadcrumb names "' + item.name + '" which is not in the visible trail',
      );
    }
    check(
      crumb.itemListElement.length === 3,
      where + ' :: breadcrumb has ' + crumb.itemListElement.length + ' levels, expected 3',
    );

    // ── 6. A coordinate, if present, must be in Nuevo Progreso. The box is the
    //       one measured for the Places verification -- imported, not copied. ─
    if (business.geo) {
      check(
        withinNuevoProgreso({
          latitude: business.geo.latitude,
          longitude: business.geo.longitude,
        }),
        where + ' :: geo is outside Nuevo Progreso: ' +
          business.geo.latitude + ',' + business.geo.longitude,
      );
    }

    // ── 7. The title must use a label, not the raw URL slug. ────────────────
    const title = html.match(/<title>([^<]*)<\/title>/);
    if (title) {
      check(
        !title[1].includes('— ' + cat + ' in Nuevo Progreso'),
        where + ' :: title falls back to the raw slug "' + cat + '"',
      );
    }
  }
}

// ── 8. Coverage. Individually-correct pages can still mean the whole thing
//       quietly stopped emitting. ───────────────────────────────────────────
check(pages >= MIN_PAGES, 'only ' + pages + ' provider pages carry JSON-LD (expected >= ' + MIN_PAGES + ')');
check(
  totalOffers >= MIN_TOTAL_OFFERS,
  'only ' + totalOffers + ' Offers emitted across the site (expected >= ' + MIN_TOTAL_OFFERS + ')',
);
check(
  freeRows >= MIN_FREE_ROWS,
  'only ' + freeRows + ' rows render Free (expected >= ' + MIN_FREE_ROWS + ') -- the zero path has changed',
);
check(
  zeroOffers === freeRows,
  zeroOffers + ' Offers priced at 0 but ' + freeRows + ' rows render Free -- these must match exactly',
);

console.log('schema: ' + pages + ' pages, ' + totalOffers + ' Offers, ' + freeRows + ' Free rows, types ' + JSON.stringify(typeSeen));
for (const f of failures) console.error('FAIL  ' + f);
console.log(pass + ' passed, ' + failures.length + ' failed');
process.exit(failures.length ? 1 : 0);
