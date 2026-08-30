#!/usr/bin/env node
/**
 * Guard: the two language trees point at each other, and cannot drift apart.
 *
 * ⛔ WHY THIS EXISTS. Measured on production 2026-08-29: `/es` emitted two
 * `<link rel="alternate" hrefLang=...>` tags and `/` emitted ZERO. Google's rule
 * is that hreflang must be reciprocal — if page A names B and B does not name A
 * back, the ENTIRE annotation is discarded. So the Spanish tree's hreflang had
 * been doing nothing at all, and nothing anywhere went red, because each side was
 * individually well-formed. A one-sided annotation is the failure mode this file
 * is written against.
 *
 * ⛔ A SOURCE SCAN CANNOT PROVE THIS. "the file contains the word languages" is
 * satisfied by an annotation pointing at the wrong URL. So section 1 EXECUTES the
 * real helper and compares what it actually returns.
 *
 * ⛔ IF YOU EVER GREP THE RAW HTTP RESPONSE FOR THIS, MATCH CASE-INSENSITIVELY.
 * Next.js writes `hrefLang` in camelCase on the wire, so `curl … | grep -c
 * hreflang` returns 0 on a page that visibly carries the tags. That produced a
 * confident false negative during this very investigation. HTML attribute names
 * are case-insensitive, so browsers and Google are unaffected — and note the two
 * instruments genuinely disagree: the browser DOM normalises the name to
 * lowercase, so `outerHTML` finds it either way while curl does not.
 *
 * KNOWN GAP, measured on production 2026-08-30 and deliberately NOT asserted
 * here: every page in the Spanish tree ships `<html lang="en">`. `/es`,
 * `/es/blog`, all of it. The cause is structural, not a typo -- `app/layout.tsx`
 * hardcodes lang="en" on the only <html> element in the app, and `app/es/layout.tsx`
 * is a pass-through fragment. A nested layout cannot set <html>.
 *
 * The fix is route groups -- `app/(en)/layout.tsx` and `app/(es)/layout.tsx`, each
 * a root layout emitting its own <html lang> -- which means moving 258 routes and
 * needs its own guard and its own regression pass. It is NOT asserted in this file
 * on purpose: a check that is permanently red is a check people learn to step over,
 * and this repo already has that lesson written down twice.
 *
 * Do NOT "fix" it by calling headers() in the root layout to read the pathname.
 * That opts the ENTIRE app out of static rendering -- measured: 258 prerendered
 * routes would become dynamic -- which is a far worse trade than the attribute is
 * worth.
 */
import { readFileSync } from 'node:fs'
import { stripComments } from './_strip-comments.mjs'
import { bilingualAlternates, enUrl, esUrl } from '../lib/hreflang.ts'

let failures = 0
const fail = (m) => { console.error('FAIL  ' + m); failures++ }
const pass = (m) => console.log('ok    ' + m)
const check = (cond, m) => (cond ? pass(m) : fail(m))

const BASE = 'https://clearcrossprogreso.com'

// Representative of every shape of route on the site.
const PATHS = ['/', '/dentists', '/dentists/alpha-dental-implant-center', '/blog', '/blog/some-post', '/about']

// ---------------------------------------------------------------- section 0
// Controls. A guard that reads nothing reports the same all-green as a guard
// that reads a healthy tree.

check(typeof bilingualAlternates === 'function', 'control: the helper is importable and executable')
check(enUrl('/') === BASE, `control: the home URL is exactly "${BASE}" (matches the live canonical, measured — no trailing slash)`)
check(esUrl('/dentists') === BASE + '/es/dentists', 'control: the Spanish URL is the English one under /es')

// ---------------------------------------------------------------- section 1
// The annotation itself, executed rather than scanned.

for (const p of PATHS) {
  const en = bilingualAlternates(p, 'en')
  const es = bilingualAlternates(p, 'es')

  // Reciprocity, which is the whole point. Both sides must advertise the SAME
  // set of alternates — that is what makes each one a return link for the other.
  const enKeys = JSON.stringify(en.languages, Object.keys(en.languages).sort())
  const esKeys = JSON.stringify(es.languages, Object.keys(es.languages).sort())
  check(enKeys === esKeys, `${p} :: both trees advertise an identical alternate set (reciprocal)`)

  // Google requires a self-reference, and it must match the canonical exactly.
  check(en.languages.en === en.canonical, `${p} :: the English page's canonical is in its own alternate set`)
  check(es.languages.es === es.canonical, `${p} :: the Spanish page's canonical is in its own alternate set`)

  // The two must actually be different pages.
  check(en.canonical !== es.canonical, `${p} :: the two canonicals differ`)

  // x-default is what Google serves a visitor matching NEITHER language.
  check(en.languages['x-default'] === en.languages.en, `${p} :: x-default resolves to English`)
}

// ⛔ Bare `es`, not `es-MX`. `es-MX` targets Spanish speakers IN MEXICO, so it
// excluded the actual audience — a Spanish-speaking resident of McAllen with a US
// locale. Bare `es` is a superset of both `es-US` and `es-MX` and cannot mis-target.
const home = bilingualAlternates('/', 'en')
check(Object.keys(home.languages).sort().join(',') === 'en,es,x-default',
  'the language keys are exactly en / es / x-default (region-free, so nobody is excluded)')

// ---------------------------------------------------------------- section 2
// Every bilingual route goes through the helper. A page that hand-writes its own
// URLs is a page that can silently stop matching its counterpart — which is
// exactly how the English tree ended up with none.

const BILINGUAL_PAGES = [
  'app/page.tsx',
  'app/[category]/page.tsx',
  'app/[category]/[provider]/page.tsx',
  'app/blog/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/es/page.tsx',
  'app/es/[category]/page.tsx',
  'app/es/[category]/[provider]/page.tsx',
  'app/es/blog/page.tsx',
  'app/es/blog/[slug]/page.tsx',
]

for (const f of BILINGUAL_PAGES) {
  const src = readFileSync(f, 'utf8')
  check(/alternates:\s*bilingualAlternates\(/.test(src), `${f} :: sets alternates via the shared helper`)
  check(/from '@\/lib\/hreflang'/.test(src), `${f} :: imports the helper`)
}

// ---------------------------------------------------------------- section 3
// Nothing anywhere may hand-write an hreflang URL or reintroduce the region code
// that excluded our own readers.

const SCAN = [...BILINGUAL_PAGES, 'app/layout.tsx', 'app/es/layout.tsx', 'app/sitemap.ts', 'lib/hreflang.ts']
for (const f of SCAN) {
  const src = readFileSync(f, 'utf8')
  // The string appears in lib/hreflang.ts only inside the comment explaining why
  // it was removed — so comments are stripped before this runs, or the guard
  // accuses its own explanation and the tempting fix is to delete the reason.
  const code = stripComments(src)
  // ⛔ A control against OVER-stripping, on the one file that carries the base
  // URL. Breaking the shared stripper's string awareness makes it MORE
  // aggressive: `//` inside a URL becomes a line comment and eats the rest. That
  // direction removes es-MX too, so the check below would pass on a mangled
  // file. Proven by mutation — without this line, that mutation reads green.
  if (f === 'lib/hreflang.ts') {
    check(code.includes('clearcrossprogreso.com'),
      'control: stripping did not eat the URL inside a string literal')
  }
  check(!/es-MX/.test(code), `${f} :: no es-MX (it excludes Spanish speakers with a US locale)`)
}

// Only the helper may build the language map. Any other file doing it is a second
// source of truth, and the two will disagree.
for (const f of BILINGUAL_PAGES) {
  const src = readFileSync(f, 'utf8')
  check(!/languages:\s*\{/.test(src), `${f} :: does not hand-roll a languages map`)
}

// ---------------------------------------------------------------- section 4
// The sitemap emits both trees. It listed 114 English URLs and zero Spanish ones.

const sm = readFileSync('app/sitemap.ts', 'utf8')
const pushes = sm.match(/entries\.push\(/g) || []
const paired = sm.match(/entries\.push\(\s*\.\.\.pair\(/g) || []
check(pushes.length > 0, 'control: the sitemap actually pushes entries')
check(pushes.length === paired.length,
  `every sitemap entry is emitted as a language PAIR (${paired.length}/${pushes.length})`)
// ⛔ Pins the CONSTRUCT, not the word. An earlier draft was `/alternates/.test(sm)`
// and the mutation harness caught it out: replacing the value with
// `const alternates = undefined` left the identifier in place and read green. A
// check satisfied by the word existing somewhere in the file is not a check.
check(/const alternates = \{\s*languages:\s*bilingualAlternates\(path, 'en'\)\.languages\s*\}/.test(sm),
  'sitemap hreflang is DERIVED from the shared helper (covers the static pages, which have no metadata export)')
check((sm.match(/,\s*alternates\s*\}/g) || []).length === 2,
  'both halves of every sitemap pair actually carry that hreflang')
check(/from '@\/lib\/hreflang'/.test(sm), 'the sitemap derives its URLs from the shared helper')

console.log(failures === 0
  ? '\nPASS — the two language trees name each other, from one source.'
  : `\nFAILED — ${failures} check(s).`)
process.exit(failures === 0 ? 0 : 1)
