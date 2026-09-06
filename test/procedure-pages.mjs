/**
 * The price comparison pages — /prices/<procedure>.
 *
 * ⛔ WHAT THIS IS PROTECTING, AND WHY IT IS WORTH A GUARD OF ITS OWN.
 *
 * These pages exist because the site published 354 URLs and not one of them
 * targeted the query people actually type. Every page-one result for "dental
 * implants nuevo progreso cost" is a procedure x location page — whatclinic,
 * placidway, medicaltourismco, mexicodental — and not one is a clinic profile.
 * They all publish a RANGE. We publish per-clinic figures. The comparison IS
 * the differentiator, so the page whose whole job is to show it is the page
 * that decides whether this directory earns traffic.
 *
 * That makes it also the page where a mistake is most expensive: it prints
 * named businesses next to specific dollar figures, sorted, with the cheapest
 * highlighted. Three of the failures below would be invisible on screen —
 * an unverified clinic slipping in, a null price rendering as free, one clinic
 * appearing twice and inflating the count the page advertises.
 *
 * ⛔ The rules are asserted by DRIVING the real builder, never by scanning it.
 * A source scan cannot tell a working `verified` gate from one that returns
 * everything, and "the word appears in the file" is not a check — that exact
 * shape let a false promise ship in the quote funnel with two green lines
 * printed over it.
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { buildComparison, MIN_CLINICS_FOR_PRICE_PAGE, procedurePath } from '../lib/procedure-pages.ts';
import { US_BENCHMARKS } from '../lib/us-benchmarks.ts';

let pass = 0, fail = 0;
const check = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + e.message); }
};

const read = (p) => fs.readFileSync(p, 'utf8');
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

// ─────────────────────────────────────────────────────────────────────────────
// 1. The rules, driven against fixtures.
// ─────────────────────────────────────────────────────────────────────────────
const clinic = (n, price, over = {}) => ({
  price_usd: price,
  price_notes: null,
  provider: {
    id: 'p' + n, slug: 'clinic-' + n, name: 'Clinic ' + n,
    verified: true, phone: '+52 899 000 000' + n, whatsapp: null,
    avg_rating: 4.5, review_count: 10,
    ...over,
  },
});

const PROC = { id: 'proc1', slug: 'dental-implant', name: 'Dental Implant', category_id: 'c1' };
const CAT = { slug: 'dentists', name: 'Dentists' };
const build = (rows) => buildComparison({ procedure: PROC, category: CAT, rows });

check('the threshold is enforced: two clinics is not a comparison', () => {
  assert.strictEqual(build([clinic(1, 900), clinic(2, 950)]), null);
});

check('three clinics builds a page', () => {
  const c = build([clinic(1, 900), clinic(2, 950), clinic(3, 1100)]);
  assert.ok(c, 'expected a comparison');
  assert.strictEqual(c.entries.length, 3);
});

check('the threshold constant is what the pages are actually built on', () => {
  const rows = Array.from({ length: MIN_CLINICS_FOR_PRICE_PAGE }, (_, i) => clinic(i + 1, 100 + i));
  assert.ok(build(rows), 'exactly MIN_CLINICS should build');
  assert.strictEqual(build(rows.slice(1)), null, 'one fewer must not');
});

check('an UNVERIFIED clinic never reaches the table', () => {
  const c = build([clinic(1, 900), clinic(2, 950), clinic(3, 1100, { verified: false })]);
  assert.strictEqual(c, null, 'two verified clinics is below the bar');
  const d = build([clinic(1, 900), clinic(2, 950), clinic(3, 1100, { verified: false }), clinic(4, 1200)]);
  assert.ok(d);
  assert.ok(!d.entries.some((e) => e.providerSlug === 'clinic-3'), 'unverified clinic rendered');
});

check('a NULL price is dropped, never counted and never shown as free', () => {
  const c = build([clinic(1, 900), clinic(2, 950), clinic(3, null)]);
  assert.strictEqual(c, null, 'a null price must not make up the count');
  const d = build([clinic(1, 900), clinic(2, 950), clinic(3, null), clinic(4, 1200)]);
  assert.ok(d);
  assert.strictEqual(d.entries.length, 3);
  assert.ok(!d.entries.some((e) => e.priceUsd === 0), 'a null price became a zero');
});

check('a ZERO price is REAL and is kept', () => {
  // Free consultations and eye exams are deliberate zeros in this data, and
  // lib/pricing.ts already renders them as "Free". Dropping them would delete
  // a true fact — and "7 clinics offer this free" is a page worth having.
  const c = build([clinic(1, 0), clinic(2, 0), clinic(3, 0)]);
  assert.ok(c, 'an all-free procedure still builds');
  assert.strictEqual(c.lowUsd, 0);
  assert.strictEqual(c.highUsd, 0);
});

check('one clinic cannot appear twice and inflate the count', () => {
  const dup = clinic(1, 800);
  const c = build([clinic(1, 900), dup, clinic(2, 950), clinic(3, 1100)]);
  assert.ok(c);
  assert.strictEqual(c.entries.length, 3, 'duplicate provider counted twice');
  assert.strictEqual(new Set(c.entries.map((e) => e.providerSlug)).size, 3);
});

check('a multi-product provider keeps its CHEAPEST row, not an arbitrary one', () => {
  // ⛔ MEASURED ON PRODUCTION, not hypothetical: one pharmacy publishes nine
  // pain-relief rows, five weight-loss rows and six ivermectin packs under
  // one heading. PostgREST guarantees no order, so keeping whichever arrived
  // first means the figure shown for that pharmacy — and the position it
  // sorts into — is arbitrary.
  const a = { ...clinic(1, 393), price_notes: 'the dear pack' };
  const b = { ...clinic(1, 41), price_notes: 'the cheap pack' };
  for (const rows of [[a, b], [b, a]]) {
    const c = build([...rows, clinic(2, 200), clinic(3, 250)]);
    assert.ok(c);
    assert.strictEqual(c.entries.length, 3, 'the pharmacy was counted twice');
    const kept = c.entries.find((e) => e.providerSlug === 'clinic-1');
    assert.strictEqual(kept.priceUsd, 41, 'kept the dearer row');
    // ⛔ The NOTE must travel with the price it belongs to, or the page shows
    // one pack's price under another pack's description.
    assert.strictEqual(kept.priceNotes, 'the cheap pack');
  }
});
check('a negative price is refused', () => {
  const c = build([clinic(1, -50), clinic(2, 950), clinic(3, 1100), clinic(4, 1200)]);
  assert.ok(c);
  assert.ok(c.entries.every((e) => e.priceUsd >= 0));
});

check('cheapest first, and ties break deterministically on name', () => {
  const c = build([
    { ...clinic(1, 900), provider: { ...clinic(1, 900).provider, name: 'Zeta Dental' } },
    { ...clinic(2, 900), provider: { ...clinic(2, 900).provider, name: 'Alpha Dental' } },
    clinic(3, 500),
  ]);
  assert.ok(c);
  assert.deepStrictEqual(c.entries.map((e) => e.priceUsd), [500, 900, 900]);
  // ⛔ PostgREST returns rows in no guaranteed order, so an unsorted tie would
  // reshuffle the table between builds and read to a crawler as a page that
  // keeps changing for no reason.
  assert.deepStrictEqual(c.entries.slice(1).map((e) => e.providerName), ['Alpha Dental', 'Zeta Dental']);
});

check('low and high describe the published prices, not the benchmark', () => {
  const c = build([clinic(1, 900), clinic(2, 950), clinic(3, 1650)]);
  assert.strictEqual(c.lowUsd, 900);
  assert.strictEqual(c.highUsd, 1650);
});

check('the saving is computed against the CHEAPEST price', () => {
  const us = US_BENCHMARKS['dental-implant'];
  assert.ok(us > 0, 'control: the benchmark exists for this fixture');
  const c = build([clinic(1, 900), clinic(2, 950), clinic(3, 1650)]);
  assert.strictEqual(c.usBenchmarkUsd, us);
  assert.strictEqual(c.bestSavingPercent, Math.round(((us - 900) / us) * 100));
});

check('no benchmark means SILENCE, never a 0% badge', () => {
  const slug = 'a-procedure-with-no-benchmark';
  assert.strictEqual(US_BENCHMARKS[slug], undefined, 'control: this slug really has no benchmark');
  const c = buildComparison({
    procedure: { ...PROC, slug }, category: CAT,
    rows: [clinic(1, 900), clinic(2, 950), clinic(3, 1100)],
  });
  assert.ok(c);
  // ⛔ null and 0 are different claims. A "Save 0%" badge asserts we ran the
  // comparison and found nothing; null says we hold no US figure at all.
  assert.strictEqual(c.usBenchmarkUsd, null);
  assert.strictEqual(c.bestSavingPercent, null);
});

check('a price ABOVE the US benchmark claims no saving', () => {
  const us = US_BENCHMARKS['dental-cleaning'];
  assert.ok(us > 0, 'control: benchmark exists');
  const c = buildComparison({
    procedure: { ...PROC, slug: 'dental-cleaning' }, category: CAT,
    rows: [clinic(1, us + 10), clinic(2, us + 20), clinic(3, us + 30)],
  });
  assert.ok(c);
  assert.strictEqual(c.bestSavingPercent, null, 'a negative saving must not render as a saving');
});

check('a row with no provider at all is dropped rather than throwing', () => {
  const c = build([{ price_usd: 900, provider: null }, clinic(1, 950), clinic(2, 1100), clinic(3, 1200)]);
  assert.ok(c);
  assert.strictEqual(c.entries.length, 3);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The URL, built in one place.
// ─────────────────────────────────────────────────────────────────────────────
check('procedurePath is the one builder of a procedure URL', () => {
  assert.strictEqual(procedurePath('dental-implant'), '/prices/dental-implant');
});

check('nothing hand-writes a /prices/<x> link', () => {
  // ⛔ A second place that spells the path is a link that a rename strands at a
  // 404, and the only symptom is a page that quietly stops being reachable.
  const files = ['app/prices/[procedure]/page.tsx', 'app/es/prices/[procedure]/page.tsx', 'app/[category]/page.tsx', 'app/sitemap.ts'];
  for (const f of files) {
    const src = stripComments(read(f));
    const hand = src.match(/['"`]\/prices\/(?!\$\{)/g) || [];
    assert.strictEqual(hand.length, 0, `${f} hand-writes a /prices/ link ${JSON.stringify(hand)}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. The route cannot collide, and cannot be orphaned.
// ─────────────────────────────────────────────────────────────────────────────
check('no category uses the slug "prices"', () => {
  // ⛔ `app/prices/` is a STATIC segment and beats `app/[category]`, so a
  // category with that slug would become permanently unreachable — and the
  // symptom is a category page that 404s while the database says it exists.
  const mock = read('lib/mock-data.ts');
  assert.ok(!/slug:\s*['"]prices['"]/.test(mock), 'a category or provider claims the slug "prices"');
});

check('generateStaticParams and the sitemap read from the SAME source', () => {
  // ⛔ A sitemap that advertises a URL the router does not build is a 404 handed
  // to Google; a router that builds a page the sitemap never names is a page
  // nobody finds. One reader makes both impossible.
  const page = stripComments(read('app/prices/[procedure]/page.tsx'));
  const sitemap = stripComments(read('app/sitemap.ts'));
  assert.ok(/getPricedProcedures\(\)/.test(page), 'the page does not use getPricedProcedures');
  assert.ok(/getPricedProcedures\(\)/.test(sitemap), 'the sitemap does not use getPricedProcedures');
});

check('the category page links to its procedure pages', () => {
  // ⛔ Without this strip the pages are reachable from the sitemap and from each
  // other and from nowhere a reader walks — orphans that render perfectly and
  // collect nothing.
  const src = stripComments(read('app/[category]/page.tsx'));
  assert.ok(/procedurePath\(/.test(src), 'the category page does not link to any procedure page');
  assert.ok(/pricedProcedures/.test(src), 'the category page does not fetch them');
});

check('a procedure page links back to its category and to its siblings', () => {
  const src = stripComments(read('app/prices/[procedure]/page.tsx'));
  assert.ok(/procedurePath\(s\.slug\)/.test(src), 'no sibling links');
  assert.ok(/localizedPath\(`\/\$\{c\.categorySlug\}`/.test(src), 'no link back to the category');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Honesty: the disclosure, and what the page must not claim.
// ─────────────────────────────────────────────────────────────────────────────
check('the page carries the SHIPPED price disclosure, not a second one', () => {
  // ⛔ An unknown share of these figures came from public listings rather than
  // from the clinic and none was confirmed by it. Writing a gentler sentence
  // here is how the site ends up making two different claims about one number.
  const src = stripComments(read('app/prices/[procedure]/page.tsx'));
  assert.ok(/t\.priceSourceNote/.test(src), 'the shipped disclosure is not rendered');
});

check('the page makes no claim about a clinic replying, or about licences', () => {
  const src = stripComments(read('app/prices/[procedure]/page.tsx'));
  for (const bad of [/repl(y|ies) to you directly/i, /licensed/i, /verified by ClearCross/i, /guarantee/i]) {
    assert.ok(!bad.test(src), `the page carries a claim it cannot support: ${bad}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Both languages, and the Spanish tree behaving like the English one.
// ─────────────────────────────────────────────────────────────────────────────
const KEYS = [
  'procHeading', 'procIntro', 'procRange', 'procAllSame', 'procUsAvgLabel',
  'procSaveUpTo', 'procTableClinic', 'procTablePrice', 'procFree', 'procCall',
  'procViewClinic', 'procCtaTitle', 'procCtaBody', 'procCtaButton',
  'procBackToCategory', 'procAlsoCompared', 'procCompareHeading',
  'procCompareSub', 'procClinicCount',
];

check('every new string exists in BOTH dictionaries and is genuinely translated', () => {
  const enSrc = read('lib/i18n/dictionaries/en.ts');
  const esSrc = read('lib/i18n/dictionaries/es.ts');
  const grab = (src, key) => (src.match(new RegExp(key + ":\\s*'([^']*)'")) || [])[1];
  for (const k of KEYS) {
    const a = grab(enSrc, k), b = grab(esSrc, k);
    assert.ok(a, `en is missing ${k}`);
    assert.ok(b, `es is missing ${k}`);
    // ⛔ A copy-pasted English string in the Spanish dictionary passes a
    // key-set comparison perfectly. This site shipped 129 Spanish pages that
    // were the English page with a translated <title>.
    assert.notStrictEqual(a, b, `${k} is identical in both languages`);
  }
});

check('the Spanish route passes a locale instead of bare re-exporting the page', () => {
  const src = stripComments(read('app/es/prices/[procedure]/page.tsx'));
  assert.ok(/locale: 'es'/.test(src), 'the Spanish page does not pass locale es');
});

check('every Spanish route DECLARES revalidate, matching its English twin', () => {
  // ⛔ `export { revalidate } from '...'` makes Next warn on every build that it
  // cannot recognise the field. Declared, the value is statically analysable
  // and the build stops crying wolf — a build with four warnings nobody can act
  // on is a build whose real warnings get skimmed.
  const pairs = [
    ['app/es/[category]/page.tsx', 'app/[category]/page.tsx'],
    ['app/es/[category]/[provider]/page.tsx', 'app/[category]/[provider]/page.tsx'],
    ['app/es/prices/[procedure]/page.tsx', 'app/prices/[procedure]/page.tsx'],
  ];
  const value = (f) => (read(f).match(/export const revalidate = (\d+);/) || [])[1];
  for (const [esFile, enFile] of pairs) {
    // ⛔ COMMENTS STRIPPED FIRST. The first run of this check FAILED on a
    // correct file: the only `export { revalidate }` left in it is inside
    // the comment explaining why the re-export was removed. A guard that
    // accuses its own explanation gets 'fixed' by deleting the explanation.
    const esSrc = stripComments(read(esFile));
    assert.ok(!/export \{ revalidate \}/.test(esSrc), `${esFile} still re-exports revalidate`);
    assert.ok(value(esFile), `${esFile} does not declare revalidate`);
    assert.strictEqual(value(esFile), value(enFile), `${esFile} and ${enFile} disagree on revalidate`);
  }
});

check('the Spanish procedure names are real procedure slugs', () => {
  // ⛔ A typo here is silent: procedureLabel falls back to the English database
  // name, so a mis-keyed entry looks exactly like a term we chose not to
  // translate. Checked against the procedure slugs the mock data declares.
  const labels = read('lib/i18n/procedure-label.ts');
  const mock = read('lib/mock-data.ts');
  const slugs = new Set([...mock.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]));
  assert.ok(slugs.size > 50, `control: expected the mock data to declare plenty of slugs, saw ${slugs.size}`);
  const listed = [...labels.matchAll(/^\s+'?([a-z0-9-]+)'?:\s*'/gm)].map((m) => m[1]);
  assert.ok(listed.length >= 25, `expected the label map to be populated, saw ${listed.length}`);
  const unknown = listed.filter((s) => !slugs.has(s));
  assert.deepStrictEqual(unknown, [], `label map names slugs that do not exist: ${unknown}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. The built HTML. Runs after `next build`, like test/schema.mjs.
// ─────────────────────────────────────────────────────────────────────────────
const APP = '.next/server/app';
const builtDir = path.join(APP, 'prices');

check('the build actually produced procedure pages', () => {
  assert.ok(fs.existsSync(builtDir), `${builtDir} does not exist — did next build run?`);
  const files = fs.readdirSync(builtDir).filter((f) => f.endsWith('.html'));
  assert.ok(files.length > 0, 'no procedure pages were prerendered');
});

if (fs.existsSync(builtDir)) {
  const files = fs.readdirSync(builtDir).filter((f) => f.endsWith('.html'));

  check('every built page names more than one clinic and shows a price', () => {
    for (const f of files) {
      const html = read(path.join(builtDir, f));
      const prices = html.match(/\$[\d,]+/g) || [];
      assert.ok(prices.length >= MIN_CLINICS_FOR_PRICE_PAGE,
        `${f} renders only ${prices.length} price-shaped strings`);
      assert.ok(/clearcross|Nuevo Progreso/i.test(html), `${f} does not mention Nuevo Progreso`);
    }
  });

  check('every built page carries the price disclosure', () => {
    for (const f of files) {
      const html = read(path.join(builtDir, f));
      assert.ok(/not supplied or confirmed by the clinic/.test(html),
        `${f} renders no price-source disclosure`);
    }
  });

  check('the Spanish build is Spanish', () => {
    const esDir = path.join(APP, 'es', 'prices');
    assert.ok(fs.existsSync(esDir), 'no Spanish procedure pages were built');
    const esFiles = fs.readdirSync(esDir).filter((f) => f.endsWith('.html'));
    assert.ok(esFiles.length > 0, 'no Spanish procedure pages were prerendered');
    for (const f of esFiles) {
      const html = read(path.join(esDir, f));
      assert.ok(/No fueron proporcionados ni confirmados/.test(html),
        `${f} carries the English disclosure`);
      // ⛔ Control: the English string must be ABSENT, or "it contains Spanish"
      // is satisfied by a page that contains both.
      assert.ok(!/not supplied or confirmed by the clinic/.test(html),
        `${f} carries the English disclosure as well`);
    }
  });

  check('the sitemap advertises exactly the pages that were built', () => {
    const built = new Set(files.map((f) => f.replace(/\.html$/, '')));
    const sm = read(path.join(APP, 'sitemap.xml.body')) || '';
    // The body file is not guaranteed to exist across Next versions; skip loudly
    // rather than passing on nothing.
    if (!sm) {
      console.log('SKIP  sitemap body not emitted by this Next version — checked at the source level instead');
      return;
    }
    for (const slug of built) {
      assert.ok(sm.includes(`/prices/${slug}`), `built ${slug} is missing from the sitemap`);
    }
  });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
