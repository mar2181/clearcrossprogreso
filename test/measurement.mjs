#!/usr/bin/env node
/**
 * Guard: the site can always be measured.
 *
 * This exists because the site sat public for six weeks with no analytics of any
 * kind and nobody could tell. Measurement is the one thing whose absence is
 * invisible — a page with a dead tag looks identical to a page with a live one —
 * so it gets a guard rather than a good intention.
 */
import { readFileSync } from 'node:fs'
import { stripComments } from './_strip-comments.mjs'


let failures = 0
const fail = (m) => { console.error('FAIL  ' + m); failures++ }
const pass = (m) => console.log('ok    ' + m)
const check = (cond, m) => (cond ? pass(m) : fail(m))

const layoutRaw = readFileSync('app/layout.tsx', 'utf8')
const gaRaw = readFileSync('components/analytics/GoogleAnalytics.tsx', 'utf8')
const layout = stripComments(layoutRaw)
const ga = stripComments(gaRaw)

// The stripper itself must work, or every check below is meaningless.
check(layout.length > 500 && layout.includes('RootLayout'),
  'control: layout survives comment-stripping (not truncated)')
check(ga.includes('googletagmanager.com/gtag/js'),
  'control: the gtag URL inside a template literal survives stripping')
check(!ga.includes('deliberately NOT'),
  'control: comment prose is actually removed')

// 1. Every measurement surface is mounted.
for (const tag of ['<Analytics />', '<SpeedInsights />', '<GoogleAnalytics />', '<OutboundTracker />']) {
  check(layout.includes(tag), `root layout mounts ${tag}`)
}

// 2. GA4 is inert without a measurement id. A tag that fires at `G-undefined`
//    looks instrumented and reports nothing — the exact failure being fixed.
check(/if\s*\(\s*!gaId\s*\)\s*return null/.test(ga),
  'GoogleAnalytics returns null when NEXT_PUBLIC_GA_ID is unset')
check(/const\s+gaId\s*=\s*process\.env\.NEXT_PUBLIC_GA_ID/.test(ga),
  'the measurement id comes from the environment')

// 3. ⛔ THE EXPENSIVE ONE. `useSearchParams` forces the nearest Suspense boundary
//    into client-side rendering, so a crawler receives a loading fallback instead
//    of the page. On a directory whose entire value is server-rendered HTML that
//    Google can read, adding it here to "also capture query params" would quietly
//    cost the ranking this whole project exists to win. Nothing goes red on its own.
check(!/useSearchParams/.test(ga),
  'GoogleAnalytics does NOT use useSearchParams (would CSR-bail the page)')

// 4. No measurement id may be hardcoded — it belongs in the environment, and a
//    stray one in a public repo bills someone else's property.
for (const f of ['app/layout.tsx', 'components/analytics/GoogleAnalytics.tsx']) {
  const s = stripComments(readFileSync(f, 'utf8'))
  check(!/['"`]G-[A-Z0-9]{6,}['"`]/.test(s), `no hardcoded GA measurement id in ${f}`)
}

// 5. Search Console ownership is env-gated, not asserted.
// ⛔ Pins the GATE, not the string. An earlier draft matched
//    `GOOGLE_SITE_VERIFICATION` anywhere in the file and the mutation harness
//    caught it out: replacing the condition with `true` left the name sitting in
//    the value below, so a broken gate read green.
check(/\.\.\.\(\s*process\.env\.GOOGLE_SITE_VERIFICATION\s*&&\s*\{/.test(layout),
  'Search Console verification is CONDITIONAL on the env var, not asserted')
check((layout.match(/verification:/g) || []).length === 1,
  'exactly one verification block (no unconditional second one)')

// ---------------------------------------------------------------- outbound
// The contact classifier, EXECUTED.
//
// ⛔ Scanning the tracker's source cannot distinguish a working classifier from
// one that returns null for everything -- and "null for everything" produces
// exactly the same data as "nobody clicked", which is the failure this whole
// component was built to end. So it is imported and run against real hrefs.
const { classify } = await import('../lib/outbound.ts')
const HOST = 'clearcrossprogreso.com'

const cases = [
  // [href, expected, why]
  ['tel:956-567-0231', 'contact_phone', 'a phone link'],
  ['TEL:9565670231', 'contact_phone', 'uppercase scheme still counts'],
  ['https://wa.me/529564671535', 'contact_whatsapp', 'a WhatsApp link'],
  ['https://api.whatsapp.com/send?phone=52', 'contact_whatsapp', 'the other WhatsApp host'],
  ['https://dentalartistry.mx/precios', 'contact_website', "a clinic's own site"],
  ['https://www.example-clinic.com', 'contact_website', 'a clinic site with www'],
  // Everything below must NOT be counted as reaching a clinic.
  ['/dentists/alpha-dental-implant-center', null, 'an internal link is not a contact'],
  ['/es/dentistas', null, 'an internal Spanish link is not a contact'],
  ['https://clearcrossprogreso.com/quote', null, 'our own absolute URL is not a contact'],
  ['https://www.clearcrossprogreso.com/quote', null, 'our own URL with www is not a contact'],
  ['mailto:info@clearcrossprogreso.com', null, 'mailto is not a clinic contact'],
  ['#quote-form', null, 'an in-page anchor is not a contact'],
  ['javascript:void(0)', null, 'a javascript: href is not a contact'],
  ['', null, 'an empty href is not a contact'],
]

for (const [href, expected, why] of cases) {
  const got = classify(href, HOST)
  check(got === expected, `${why}: classify(${JSON.stringify(href)}) -> ${expected === null ? 'null' : expected}`)
}

// A control: the classifier must actually discriminate. If it ever returns the
// same answer for everything, the loop above could still pass a lopsided list.
const distinct = new Set(cases.map(([h]) => classify(h, HOST)))
check(distinct.size >= 4, `the classifier discriminates (${distinct.size} distinct outcomes, not one)`)

console.log(failures === 0
  ? '\nPASS — the site can be measured, and cannot silently stop being measurable.'
  : `\nFAILED — ${failures} check(s).`)
process.exit(failures === 0 ? 0 : 1)
