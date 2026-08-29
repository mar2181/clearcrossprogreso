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

const BACKSLASH = String.fromCharCode(92)

let failures = 0
const fail = (m) => { console.error('FAIL  ' + m); failures++ }
const pass = (m) => console.log('ok    ' + m)
const check = (cond, m) => (cond ? pass(m) : fail(m))

/**
 * Strip comments, string-aware.
 *
 * ⛔ NOT a naive line-comment regex. This source contains
 * `https://www.googletagmanager.com` inside a template literal, and a naive strip
 * truncates the file at that double slash — the guard would then read a file that
 * ends mid-expression and report confident nonsense.
 *
 * ⛔ And comments MUST be stripped at all: the code below deliberately names the
 * banned API in a comment explaining why it is banned. A scan that reads comments
 * accuses its own explanation, and the tempting fix is to delete the explanation.
 */
function stripComments(src) {
  let out = ''
  let i = 0
  const n = src.length
  let quote = null // ' " ` or null
  while (i < n) {
    const c = src[i]
    const d = src[i + 1]
    if (quote) {
      if (c === BACKSLASH) { out += c + (d ?? ''); i += 2; continue }
      if (c === quote) quote = null
      out += c; i++; continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue }
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue }
    if (c === '/' && d === '*') {
      i += 2
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n'
        i++
      }
      i += 2; continue
    }
    out += c; i++
  }
  return out
}

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
for (const tag of ['<Analytics />', '<SpeedInsights />', '<GoogleAnalytics />']) {
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

console.log(failures === 0
  ? '\nPASS — the site can be measured, and cannot silently stop being measurable.'
  : `\nFAILED — ${failures} check(s).`)
process.exit(failures === 0 ? 0 : 1)
