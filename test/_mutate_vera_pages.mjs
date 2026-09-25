#!/usr/bin/env node
/**
 * Mutation harness for test/vera-pages.mjs (+ the two sweeps that guard the
 * webmaster pages from outside it). Each mutation breaks one rule, runs the
 * guard that owns it, and must see it go RED. Every file is restored from its
 * original bytes and the guards re-run GREEN. An anchor that does not match
 * exactly once is REFUSED, never scored.
 *
 * The .next/ mutations need a build with at least one page in
 * content/vera-pages/. With none published they are skipped and said so — a
 * skip is not a pass. The harness PLANTS a clean fixture spec for the
 * honest-claims mutation and removes it afterwards.
 *
 * Run:  node test/_mutate_vera_pages.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (args) => spawnSync(process.execPath, args, { cwd: ROOT }).status === 0;
const GUARD = () => run(['--import', './test/_ts-alias-hook-register.mjs', 'test/vera-pages.mjs']);
const CLAIMS = () => run(['test/honest-claims.mjs']);
const BILINGUAL = () => run(['test/bilingual.mjs']);

const dir = join(ROOT, 'content/vera-pages');
const pages = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.json')) : [];
const first = pages[0] ? pages[0].slice(0, -5) : null;
const built = first && existsSync(join(ROOT, '.next/server/app/services', `${first}.html`));

const R = 'app/services/[slug]/page.tsx';
const L = 'lib/vera-pages.ts';
const M = [
  [R, 'export const dynamicParams = false;', 'export const dynamicParams = true;', 'unknown slugs render at runtime instead of 404', GUARD],
  [R, 'if (!spec) notFound();', 'if (!spec) return null;', 'an unknown slug renders a blank page', GUARD],
  [R, 'alternates: { canonical: enUrl(servicePath(spec.slug)) },', "alternates: { canonical: enUrl('/services') },", 'every guide canonicalises to one URL', GUARD],
  [R, 'alternates: { canonical: enUrl(servicePath(spec.slug)) },', "alternates: { canonical: enUrl(servicePath(spec.slug)), languages: { es: '/es' } },", 'a Spanish twin is claimed', GUARD],
  [R, '<p className="text-neutral-mid leading-relaxed">{f.description}</p>', '<p className="text-neutral-mid leading-relaxed" dangerouslySetInnerHTML={{ __html: f.description }} />', 'feature text rendered as raw HTML', GUARD],
  [R, "import { enUrl } from '@/lib/hreflang';", "import { enUrl } from '@/lib/hreflang';\nimport { formatUSD } from '@/lib/utils';", 'the page starts formatting prices of its own', GUARD],
  [L, 'if (typeof spec.slug !== \'string\' || spec.slug !== name || !SLUG.test(name)) return null;', 'if (typeof spec.slug !== \'string\' || !SLUG.test(name)) return null;', 'a spec whose slug disagrees with its file is served', GUARD],
  [L, "  if (!HERO.test(h)) return null;\n", '', 'any hero URL is accepted, external included', GUARD],
  [L, "return existsSync(join(process.cwd(), 'public', h)) ? h : null;", 'return h;', 'a hero the site does not ship is accepted', GUARD],
  ['app/sitemap.ts', "entries.push(...englishOnly(`/services/${spec.slug}`, { changeFrequency: 'monthly', priority: 0.7 }));", "entries.push(...pair(`/services/${spec.slug}`, { changeFrequency: 'monthly', priority: 0.7 }));", 'the sitemap advertises a Spanish twin that 404s', BILINGUAL],
  ['test/honest-claims.mjs', "    else if (entry.endsWith('.json') && p.split('\\\\').join('/').includes('content/vera-pages/')) out.push(p.split('\\\\').join('/'))\n", '', 'the claims sweep stops reading the webmaster specs', 'CLAIMS_BLIND'],
];
if (built) {
  const html = `.next/server/app/services/${first}.html`;
  const h = readFileSync(join(ROOT, html), 'utf8');
  const t = (h.match(/<title>[^<]*<\/title>/) || [])[0];
  M.push([html, t, '<title>Best Dentists | ClearCross</title>', 'a guide ships the default title', GUARD]);
  M.push([html, `<link rel="canonical" href="https://clearcrossprogreso.com/services/${first}"/>`, '', 'a guide has no canonical', GUARD]);
  M.push(['.next/server/app/sitemap.xml.body', `<loc>https://clearcrossprogreso.com/services/${first}</loc>`, '<loc>https://clearcrossprogreso.com/</loc>', 'a guide is missing from the sitemap', GUARD]);
  M.push(['.next/prerender-manifest.json', '"/services/[slug]": {', '"/services/[slug]": {"fallback": null, "x": {', 'the built route is not fallback:false', GUARD]);
}

// A planted DISHONEST spec, used only by the CLAIMS_BLIND mutation: with the
// sweep intact it must fail, with the sweep blinded it must pass -> caught.
const PLANT = join(dir, 'zz-mutation-plant.json');
const plant = JSON.stringify({ slug: 'zz-mutation-plant', title: 'Plant', features: [], process: [],
  description: 'Every dentist we list has been vetted and verified by ClearCross.' });

const orig = {};
for (const [f] of M) orig[f] = orig[f] ?? readFileSync(join(ROOT, f));
if (!GUARD() || !CLAIMS() || !BILINGUAL()) {
  console.log('BASELINE IS NOT GREEN -- refusing to score');
  process.exit(2);
}
let caught = 0, missed = 0, refused = 0;
try {
  for (const [f, a, b, name, guard] of M) {
    const text = orig[f].toString('utf8');
    const nl = text.includes('\r\n') ? '\r\n' : '\n';
    const A = a.replace(/\n/g, nl);
    const n = A ? text.split(A).length - 1 : 0;
    if (n !== 1) { refused++; console.log(`  [REFUSED] ${name} -- anchor matched ${n} times`); continue; }
    writeFileSync(join(ROOT, f), text.replace(A, b.replace(/\n/g, nl)));
    let red;
    if (guard === 'CLAIMS_BLIND') {
      mkdirSync(dir, { recursive: true });
      writeFileSync(PLANT, plant);
      red = CLAIMS(); // blinded sweep PASSES over the lie -> the mutation shows the rule mattered
      writeFileSync(join(ROOT, f), orig[f]);
      const sees = !CLAIMS(); // restored sweep must FAIL on the planted lie
      unlinkSync(PLANT);
      red = red && sees;
    } else {
      red = !guard();
      writeFileSync(join(ROOT, f), orig[f]);
    }
    if (red) { caught++; console.log(`  [CAUGHT]  ${name}`); } else { missed++; console.log(`  [MISS]    ${name}`); }
  }
} finally {
  for (const [f, b] of Object.entries(orig)) writeFileSync(join(ROOT, f), b);
  if (existsSync(PLANT)) unlinkSync(PLANT);
}
const green = GUARD() && CLAIMS() && BILINGUAL();
console.log(`\n${caught} caught / ${missed} missed / ${refused} refused; tree restored, guards ${green ? 'GREEN' : 'RED'} after`);
if (!built) console.log('NOTE: no built webmaster page, so the 4 .next mutations were not run');
process.exit(missed === 0 && refused === 0 && green ? 0 : 1);
