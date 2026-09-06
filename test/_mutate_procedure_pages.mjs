/**
 * Mutation harness for test/procedure-pages.mjs.
 *
 * Every mutation is a realistic edit — mostly the tidy-up somebody makes six
 * months from now without reading the comment above the line. Each must turn
 * the guard RED. A mutation the guard does not catch is a check that cannot
 * fail, and this file exists because two of the guards on the quote funnel were
 * exactly that while printing green over a live false promise.
 *
 * ⛔ Byte-restores every file afterwards and re-verifies against the PRE-RUN
 * BYTES, not against the anchors. An anchor a mutation deliberately deletes
 * reads identically to a failed restore, and crying wolf on the one check whose
 * job is "the tree is safe" is worse than not having it.
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

const FILES = [
  'lib/procedure-pages.ts',
  'app/prices/[procedure]/page.tsx',
  'app/es/prices/[procedure]/page.tsx',
  'app/[category]/page.tsx',
  'app/sitemap.ts',
  'lib/i18n/dictionaries/es.ts',
];

const MUTATIONS = [
  {
    label: 'the clinic threshold drops to 1 (a "comparison" with one clinic in it)',
    file: 'lib/procedure-pages.ts',
    old: 'export const MIN_CLINICS_FOR_PRICE_PAGE = 3;',
    new: 'export const MIN_CLINICS_FOR_PRICE_PAGE = 1;',
  },
  {
    label: 'the verified gate is dropped (an unverified clinic reaches the table)',
    file: 'lib/procedure-pages.ts',
    old: '    if (!p || !p.verified) continue;',
    new: '    if (!p) continue;',
  },
  {
    label: 'a null price becomes zero (renders as "Free" on a paid treatment)',
    file: 'lib/procedure-pages.ts',
    old: '    if (row.price_usd === null || row.price_usd === undefined) continue;',
    new: '    if (row.price_usd === null || row.price_usd === undefined) row.price_usd = 0;',
  },
  {
    label: 'a real zero price is dropped (deletes a true "Free" fact)',
    file: 'lib/procedure-pages.ts',
    old: '    if (row.price_usd < 0) continue;',
    new: '    if (row.price_usd <= 0) continue;',
  },
  {
    // ⛔ ANCHOR REPAIRED, NOT DELETED. The de-duplication moved from a `seen`
    // Set to a Map keyed on the provider id, so the old anchor stopped matching
    // and the harness correctly refused to score it rather than crediting a
    // catch it never made. The PROPERTY is unchanged and is the one that
    // matters most on a pharmacy page — one pharmacy publishes nine
    // pain-relief rows — and keying on the price is exactly the edit somebody
    // makes wanting to "show every product a pharmacy lists".
    label: 'the de-duplication key stops being the provider (one clinic counted many times)',
    file: 'lib/procedure-pages.ts',
    old: '    cheapest.set(p.id, {',
    new: "    cheapest.set(p.id + ':' + row.price_usd, {",
  },
  {
    label: 'a multi-product provider keeps an ARBITRARY row instead of its cheapest',
    file: 'lib/procedure-pages.ts',
    old: '    if (held && held.priceUsd <= row.price_usd) continue;',
    new: '    if (held) continue;',
  },
  {
    label: 'ties stop breaking on name (the table reshuffles between builds)',
    file: 'lib/procedure-pages.ts',
    old: `  entries.sort((a, b) =>
    a.priceUsd !== b.priceUsd
      ? a.priceUsd - b.priceUsd
      : a.providerName.localeCompare(b.providerName)
  );`,
    new: '  entries.sort((a, b) => a.priceUsd - b.priceUsd);',
  },
  {
    label: 'the saving is computed against the DEAREST price (flatters the number)',
    file: 'lib/procedure-pages.ts',
    old: '  const saving = getSavings(input.procedure.slug, lowUsd);',
    new: '  const saving = getSavings(input.procedure.slug, highUsd);',
  },
  {
    label: 'a missing benchmark renders as 0% instead of silence',
    file: 'lib/procedure-pages.ts',
    old: '    bestSavingPercent: saving ? saving.percentSaved : null,',
    new: '    bestSavingPercent: saving ? saving.percentSaved : 0,',
  },
  {
    label: 'the page stops rendering the price disclosure',
    file: 'app/prices/[procedure]/page.tsx',
    old: '              {t.priceSourceNote}',
    new: '              {t.savingsBannerNote}',
  },
  {
    label: 'the page claims the clinics are licensed',
    file: 'app/prices/[procedure]/page.tsx',
    old: '            {t.procIntro.replace(\'{n}\', String(c.entries.length))}',
    new: '            All work by licensed professionals.',
  },
  {
    label: 'the sitemap stops reading getPricedProcedures (drifts from the router)',
    file: 'app/sitemap.ts',
    old: '    const priced = await getPricedProcedures();',
    new: "    const priced = [{ slug: 'dental-implant' }];",
  },
  {
    label: 'the category page loses the link strip (the pages become orphans)',
    file: 'app/[category]/page.tsx',
    old: '                  href={localizedPath(procedurePath(p.slug), locale)}',
    new: '                  href={localizedPath(`/${categoryData.slug}`, locale)}',
  },
  {
    label: 'the Spanish route bare re-exports the English page (English copy on /es)',
    file: 'app/es/prices/[procedure]/page.tsx',
    old: "  return ProcedurePricePage({ params, locale: 'es' });",
    new: '  return ProcedurePricePage({ params });',
  },
  {
    label: 'the Spanish route goes back to re-exporting revalidate',
    file: 'app/es/prices/[procedure]/page.tsx',
    old: 'export const revalidate = 3600;',
    new: "export { revalidate } from '@/app/prices/[procedure]/page';",
  },
  {
    label: 'a Spanish string is copy-pasted from English (passes a key-set check)',
    file: 'lib/i18n/dictionaries/es.ts',
    old: "    procTableClinic: 'Clínica',",
    new: "    procTableClinic: 'Clinic',",
  },
  {
    label: 'the sibling links are removed (no path between the price pages)',
    file: 'app/prices/[procedure]/page.tsx',
    old: '                      href={localizedPath(procedurePath(s.slug), locale)}',
    new: '                      href={localizedPath(`/${c.categorySlug}`, locale)}',
  },
];

const orig = {};
for (const f of FILES) orig[f] = fs.readFileSync(`${ROOT}/${f}`);

function guardIsGreen() {
  try {
    execSync('node --import ./test/_ts-alias-hook-register.mjs test/procedure-pages.mjs', {
      cwd: ROOT,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

function restore() {
  for (const f of FILES) fs.writeFileSync(`${ROOT}/${f}`, orig[f]);
}

// ⛔ Baseline first. A guard already red for an unrelated reason makes every
// mutation score "caught" for free.
if (!guardIsGreen()) {
  console.error('ABORT: baseline is RED — every mutation would score a free catch');
  process.exit(1);
}
console.log('baseline: GREEN\n');

let caught = 0, missed = 0, skipped = 0;

for (const m of MUTATIONS) {
  const p = `${ROOT}/${m.file}`;
  const src = orig[m.file].toString('utf8');
  const EOL = src.includes('\r\n') ? '\r\n' : '\n';
  const oldStr = m.old.split('\n').join(EOL);
  const newStr = m.new.split('\n').join(EOL);

  const n = src.split(oldStr).length - 1;
  if (n !== 1) {
    console.log(`SKIP    ${m.label}`);
    console.log(`        anchor matched ${n} times — mutation NOT applied, proves nothing`);
    skipped++;
    continue;
  }

  fs.writeFileSync(p, src.replace(oldStr, newStr), 'utf8');
  const green = guardIsGreen();
  restore();

  if (green) { console.log(`MISSED  ${m.label}`); missed++; }
  else { console.log(`caught  ${m.label}`); caught++; }
}

let dirty = 0;
for (const f of FILES) {
  if (!fs.readFileSync(`${ROOT}/${f}`).equals(orig[f])) { console.error(`NOT RESTORED: ${f}`); dirty++; }
}

console.log(`\ncaught ${caught} / missed ${missed} / skipped ${skipped}`);
console.log(dirty === 0 ? 'tree restored byte-for-byte' : `${dirty} FILE(S) NOT RESTORED`);
console.log('guard on the restored tree: ' + (guardIsGreen() ? 'GREEN' : 'RED'));
process.exit(missed === 0 && skipped === 0 && dirty === 0 ? 0 : 1);
