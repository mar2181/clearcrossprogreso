#!/usr/bin/env node
/**
 * Guard: pages the AI webmaster publishes at /services/<slug>.
 *
 * The brain's page worker commits ONE file, content/vera-pages/<slug>.json, and
 * nothing else. For that to become a real, indexable, HONEST page, these must
 * already be true — and each fails silently if it is not:
 *   [1] the route prerenders from those files only (dynamicParams = false, so an
 *       unknown slug is a real 404), canonicalises to its own URL, claims no
 *       Spanish twin, renders no raw HTML, and adds NOTHING to the spec's text:
 *       no price, no rating, no provider list, no "verified" badge. On a health
 *       directory every sentence on the page must be one the honest-claims sweep
 *       reads, and that sweep reads the SPEC (test/honest-claims.mjs section 9).
 *   [2] lib/vera-pages.ts refuses a spec it cannot serve — EXECUTED, not scanned:
 *       a file whose slug disagrees with its name, a bad slug, no title, and a
 *       hero that is not a photograph this site ships.
 *   [3] `/services` cannot collide with a category, and the sitemap and the route
 *       read the SAME function, so the sitemap cannot list a guide never built.
 *   [4] every published file got its own prerendered page, <title>, canonical and
 *       sitemap entry, and the route is fallback:false in the build manifest.
 *
 * Run after `next build`:
 *   node --import ./test/_ts-alias-hook-register.mjs test/vera-pages.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripComments } from './_strip-comments.mjs';
import { parseSpec, heroOf, servicePath } from '../lib/vera-pages.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://clearcrossprogreso.com';
const fails = [];
const ok = (cond, name, detail = '') => {
  if (cond) console.log(`  ok   ${name}`);
  else { fails.push(name); console.log(`  FAIL ${name}${detail ? ` -- ${detail}` : ''}`); }
};
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

console.log('\n[1] the route');
const ROUTE = 'app/services/[slug]/page.tsx';
const route = stripComments(read(ROUTE));
ok(/export const dynamicParams = false;/.test(route), 'dynamicParams = false: a slug with no file is a real 404');
ok(/generateStaticParams\(\)\s*\{\s*return allVeraPages\(\)\.map/.test(route), 'the static params come from allVeraPages()');
ok(/if \(!spec\) notFound\(\);/.test(route), 'an unknown slug calls notFound()');
ok(/alternates: \{ canonical: enUrl\(servicePath\(spec\.slug\)\) \}/.test(route), 'the canonical is the page\'s own URL, and nothing else in alternates');
ok(!/languages|bilingualAlternates|esUrl/.test(route), 'no hreflang pair: there is no Spanish twin to point at');
ok(!/dangerouslySetInnerHTML|innerHTML/.test(route), 'no raw HTML: every word here is model-written');
// ⛔ Case-SENSITIVE on purpose: with /i, `price[A-Z_]` matches the navigation label
// "Compare prices" and accuses the page of carrying a price.
ok(!/formatUSD|price[A-Z_]|Usd\b|[Rr]ating|[Rr]eview|[Tt]estimonial|[Vv]erified|getProvider|getProcedure|callLink/.test(route),
  'the page adds no price, rating, review, verified badge or provider data of its own');
ok(!/'[A-Z][a-z]+ [a-z]+[^']{25,}'/.test(route.replace(/className="[^"]*"/g, '')) ,
  'no hard-coded sentence of copy (only short navigation labels)');

console.log('\n[2] the spec reader, executed');
const good = JSON.stringify({ slug: 'a-guide', title: 'A guide', features: [], process: [] });
ok(parseSpec('a-guide', good)?.slug === 'a-guide', 'control: a sound spec is served');
ok(parseSpec('other-name', good) === null, 'a spec whose slug disagrees with its file name is refused');
ok(parseSpec('Bad_Slug', JSON.stringify({ slug: 'Bad_Slug', title: 'x' })) === null, 'a slug that is not lowercase-hyphenated is refused');
ok(parseSpec('a-guide', JSON.stringify({ slug: 'a-guide', title: '  ' })) === null, 'a spec with no title is refused');
ok(parseSpec('a-guide', '{not json') === null, 'malformed JSON is refused, never thrown');
ok(heroOf({ heroImage: 'https://evil.example.com/x.jpg' }) === null, 'an external hero URL is dropped');
ok(heroOf({ heroImage: '/images/heroes/no-such-file.jpg' }) === null, 'a hero this site does not ship is dropped');
ok(heroOf({ heroImage: '/og-image.jpg' }) === null, 'a real public file outside the photo folders is dropped (the social card is not a hero)');
ok(heroOf({ heroImage: '/images/heroes/dentists-hero.jpg' }) === '/images/heroes/dentists-hero.jpg', 'control: a shipped hero is kept');
ok(servicePath('x') === '/services/x', 'servicePath is /services/<slug>');

console.log('\n[3] no collision, one source');
const mockSlugs = [...read('lib/mock-data.ts').matchAll(/^\s*slug: '([a-z-]+)',$/gm)].map((m) => m[1]);
ok(mockSlugs.length >= 5, `control: the category slugs were read (${mockSlugs.length})`);
ok(!mockSlugs.includes('services'), 'no category uses the slug "services"');
const sm = stripComments(read('app/sitemap.ts'));
ok(/allVeraPages\(\)\.forEach/.test(sm), 'the sitemap reads allVeraPages(), the same function the route builds from');

console.log('\n[4] every published page');
const dir = join(ROOT, 'content/vera-pages');
const files = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.json')).sort() : [];
if (!files.length) console.log('  NOTE 0 webmaster pages published -- this half has nothing to check yet');
const NEXT = join(ROOT, '.next');
const manifestPath = join(NEXT, 'prerender-manifest.json');
if (files.length) {
  ok(existsSync(manifestPath), '.next exists (run next build first)');
  const m = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  ok(m.dynamicRoutes?.['/services/[slug]']?.fallback === false, 'the built route is fallback:false (unknown slug = 404)');
}
const smPath = join(NEXT, 'server/app/sitemap.xml.body');
const sitemap = existsSync(smPath) ? readFileSync(smPath, 'utf8') : '';
for (const f of files) {
  const name = f.slice(0, -5);
  const spec = parseSpec(name, readFileSync(join(dir, f), 'utf8'));
  ok(spec !== null, `${f}: servable (valid JSON, slug equals file name, has a title)`);
  if (!spec) continue;
  const html = join(NEXT, 'server/app/services', `${name}.html`);
  ok(existsSync(html), `${f}: prerendered`);
  if (!existsSync(html)) continue;
  const h = readFileSync(html, 'utf8');
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  ok(decode(title) === (spec.seo?.title || spec.title), `${f}: its own <title>`, title);
  ok(h.includes(`<link rel="canonical" href="${SITE}/services/${name}"/>`), `${f}: its own canonical`);
  ok(!/hreflang=/i.test(h), `${f}: no hreflang (no Spanish twin claimed)`);
  const entry = (sitemap.match(new RegExp(`<url>(?:(?!</url>)[\\s\\S])*/services/${name}</loc>(?:(?!</url>)[\\s\\S])*</url>`)) || [])[0];
  ok(!!entry, `${f}: in the sitemap`);
  ok(entry && !/hreflang/i.test(entry), `${f}: its sitemap entry carries no hreflang pair`);
}

console.log();
if (fails.length) {
  console.log(`FAILURES (${fails.length}): ${fails.join('; ')}`);
  process.exit(1);
}
console.log(`PASS (${files.length} webmaster page${files.length === 1 ? '' : 's'})`);
