#!/usr/bin/env node
/**
 * Guard: a quote request always reaches a human, and never lies about it.
 *
 * ⛔ WHY THIS EXISTS. The provider alert was wrapped in `if (providerUser?.email)`
 * with no else. No clinic has an account here — provider registration sat behind
 * a broken navbar link until 2026-08-29 — so the branch never ran. No email, no
 * log, no error. Meanwhile the patient was emailed "your request has been sent to
 * <clinic>, they typically respond within 24 hours." A false statement to a
 * customer, on every quote this site has ever taken, and nothing anywhere said so.
 *
 * ⛔ THE SECOND FAILURE IS QUIETER STILL. Setting RESEND_API_KEY does not make
 * this work: the FROM address must be on a domain verified in Resend, and
 * clearcrossprogreso.com is not (measured 2026-08-29 — the only verified sending
 * domain on the available account is petbuddyconcierge.com). Every send would be
 * rejected inside a catch that only console.errors. See docs/QUOTE_DELIVERY.md.
 */
import { readFileSync } from 'node:fs'
import { stripComments } from './_strip-comments.mjs'
import { esc, emailConfigured } from '../lib/email.ts'

let failures = 0
const fail = (m) => { console.error('FAIL  ' + m); failures++ }
const pass = (m) => console.log('ok    ' + m)
const check = (cond, m) => (cond ? pass(m) : fail(m))

// The fix's own comments quote `=== 'your_resend_api_key'` and the old wording,
// to explain why they were removed. A raw scan accuses its own explanation --
// which it did, on this guard's first run.
const email = stripComments(readFileSync('lib/email.ts', 'utf8'))
const route = stripComments(readFileSync('app/api/quotes/route.ts', 'utf8'))

/** Slice between two markers, refusing an empty or unbounded result. */
function between(src, start, end, label) {
  const a = src.indexOf(start)
  const b = a < 0 ? -1 : src.indexOf(end, a + start.length)
  if (a < 0 || b < 0) {
    fail(`control: could not slice ${label} — every check on it would be vacuous`)
    return ''
  }
  return src.slice(a, b)
}

// ---------------------------------------------------------------- section 0
// Controls, executed. A guard that reads nothing reports the same all-green as
// one reading a healthy tree.
check(typeof esc === 'function' && typeof emailConfigured === 'function',
  'control: lib/email.ts is importable and executable')
check(email.length > 2000 && route.length > 2000, 'control: both sources actually read')
// ⛔ A control against OVER-stripping. Breaking the shared stripper's string
// awareness makes it MORE aggressive, not less: a `//` inside a URL in a
// template literal becomes a line comment and eats the rest of the line. That
// direction leaves the forbidden strings absent, so every check below passes on
// a mangled file. This is the check that makes that mutation observable.
// ⛔ The needle MUST contain the `//` — that is the whole point. An earlier
// draft used bare 'clearcrossprogreso.com', which also appears in
// 'noreply@clearcrossprogreso.com' with no slashes in front of it, so it
// survived the mangling and the control proved nothing. Measured both ways
// before trusting it: healthy=true / broken=false only for the full URL.
check(email.includes('https://clearcrossprogreso.com'),
  'control: stripping did not eat a URL inside a string (the // is the point)')

// ---------------------------------------------------------------- section 1
// Escaping, driven rather than scanned. `esc` is the only thing standing between
// a stranger's free text and an HTML email carrying this business's name.
const payload = `<a href="https://evil.example">Respond here</a> & "quoted" 'single'`
const escaped = esc(payload)
check(!/<a /.test(escaped), 'a link in the patient description cannot survive escaping')
check(!escaped.includes('"') && !escaped.includes("'"), 'quotes are escaped (cannot break out of an attribute)')
check(escaped.includes('&amp;'), 'ampersands are escaped')
check(esc(null) === '' && esc(undefined) === '', 'null/undefined escape to empty, not to "null"')

// ⛔ The patient description was the ONE unescaped user value in the whole file.
// A visitor could put a link into an email a clinic trusts — phishing, under
// ClearCross branding. Every sibling field on the same line already used esc().
check(!/\$\{description\.slice/.test(email),
  'the patient description is never interpolated raw')
check(/\$\{esc\(description\.slice/.test(email),
  'the patient description goes through esc()')
// Truncate first, THEN escape: escaping first can cut an entity in half.
// ⛔ COUNTS BOTH SITES. There are two (the provider alert and the ClearCross
// one), and an earlier draft asked only whether the correct form appeared
// SOMEWHERE — so mutating one of them left the other satisfying the regex and
// the check read green. The mutation harness caught it. Fourth time this shape
// has appeared in this repo; count, do not search.
const escSites = (email.match(/esc\(description\.slice\(0, \d+\)\)/g) || []).length
const rawSites = (email.match(/esc\(description\)\.slice/g) || []).length
check(escSites === 2, `both description sites truncate before escaping (${escSites}/2)`)
check(rawSites === 0, 'no site escapes before truncating (which can cut an entity in half)')

// ---------------------------------------------------------------- section 2
// Somebody is always told.
const settled = between(route, 'Promise.allSettled([', '    ]);', 'the notification block')
check(settled.includes('sendClearCrossQuoteAlert('),
  'the ClearCross alert is inside the notification block')

// ⛔ THE CHECK THIS FILE EXISTS FOR. The provider alert is CONDITIONAL (correct —
// there may be no account). The ClearCross alert must NOT be, or the whole fix is
// undone and the failure is invisible again.
const atCall = settled.indexOf('sendClearCrossQuoteAlert(')
const preceding = atCall < 0 ? '' : settled.slice(Math.max(0, atCall - 120), atCall)
check(atCall >= 0 && !/providerReached\s*[?&]/.test(preceding) && !/\bif\s*\(/.test(preceding),
  'the ClearCross alert is UNCONDITIONAL (not behind providerReached)')
check(/providerReached\s*$|providerReached\s*\n?\s*\?/m.test(settled),
  'the provider alert IS conditional (there may be no account)')

// A missing provider account must be loud. It was silent, which is the whole bug.
check(/console\.error\([\s\S]{0,80}NO PROVIDER ACCOUNT/.test(route),
  'a missing provider account is logged at ERROR level')
check(/REACHED NOBODY AT CLEARCROSS/.test(route),
  'a quote that reached nobody says so, with the reason')

// ---------------------------------------------------------------- section 3
// Configuration cannot be half-done silently.
check(/const FROM_EMAIL =\s*\n?\s*process\.env\.QUOTE_FROM_EMAIL/.test(email),
  'the FROM address is env-driven (the hardcoded domain is not verified in Resend)')
check(/process\.env\.QUOTE_NOTIFY_TO \|\| ''/.test(email),
  'the ClearCross inbox has NO invented default — unset must fail loudly, not silently')
check(/QUOTE_NOTIFY_TO is not configured/.test(email),
  'an unset inbox returns a reason naming the variable')

// ⛔ The three call sites tested `=== 'your_resend_api_key'` while getResend()
// tested startsWith('your_'), so `your_key_here` passed the guard and then made
// the non-null assertion on the next line a lie.
check(!/=== 'your_resend_api_key'/.test(email),
  'the inconsistent per-call-site config checks are gone')
check((email.match(/if \(!emailConfigured\(\)\)/g) || []).length >= 4,
  'every sender routes through the one config check')

// Executed, not scanned: the placeholder shape really is rejected.
const saved = process.env.RESEND_API_KEY
try {
  delete process.env.RESEND_API_KEY
  check(emailConfigured() === false, 'no key -> not configured')
  process.env.RESEND_API_KEY = 'your_key_here'
  check(emailConfigured() === false, 'a "your_..." placeholder -> not configured (the shape that used to slip through)')
  process.env.RESEND_API_KEY = 're_realish'
  check(emailConfigured() === true, 'a real-looking key -> configured')
} finally {
  if (saved === undefined) delete process.env.RESEND_API_KEY
  else process.env.RESEND_API_KEY = saved
}

// ---------------------------------------------------------------- section 4
// The patient is not told something we cannot know.
check(!/has been sent to\s*\n?\s*<strong>\$\{esc\(providerName\)/.test(email),
  'the patient email no longer asserts the clinic was notified')
check(/We have your request for/.test(email),
  'it says what is true in both branches instead')

// ---------------------------------------------------------------- section 5
// A quote survives a provider that has no price list.
//
// ⛔ THE BUG THIS REPLACES, and it was the largest hole in the funnel. The form
// sent `procedure_id: form.procedureId || 'general'` into a column typed
// `uuid NOT NULL REFERENCES clearcross_procedures(id)`. Postgres cannot cast
// the string to a uuid, so the insert threw and the visitor got
// `500 Failed to create quote request`.
//
// It was not an edge case. Where a provider publishes no prices the procedure
// <select> is not rendered at all (it sits behind `hasProcedures &&`), so
// procedureId was permanently '' and EVERY submission on that page failed.
// Measured 2026-09-04: 63 of 104 providers (61%) have no prices. On the other
// 39% it failed whenever the visitor skipped a dropdown labelled "optional" —
// which is most of them.
//
// The API's own procedure lookup hit the same cast error one block earlier and
// discarded it, so nothing in the log ever named the cause.
const form = stripComments(readFileSync('components/quotes/QuoteForm.tsx', 'utf8'))

check(!/['"]general['"]/.test(form),
  "the form never sends the sentinel 'general' into a uuid column")
check(/formData\.append\(\s*['"]procedure_id['"]/.test(form) && !/\|\|\s*['"]general['"]/.test(form),
  'procedure_id is appended only when a real procedure was chosen')

// The required-field gate must not demand a procedure the page never offered.
const required = between(route, 'if (!providerId', 'status: 400', 'the required-field check')
check(required !== '' && !/!procedureId/.test(required),
  'the API does not reject a submission for having no procedure')

// The lookup must be conditional. An unconditional .eq('id', undefined) is the
// same cast error, one block earlier, inside a swallowing destructure.
check(/procedureId\s*\?[^:]*:|if\s*\(\s*procedureId\s*\)/.test(route),
  'the procedure lookup only runs when a procedure was supplied')

// And the insert must write NULL, never a sentinel.
const insert = between(route, "from('clearcross_quote_requests')", '.select(', 'the quote insert')
check(insert !== '' && /procedure_id:\s*procedureId\s*\|\|\s*null/.test(insert),
  'the insert writes procedure_id: procedureId || null')

console.log(failures === 0
  ? '\nPASS — a quote always reaches a human, and the email does not overclaim.'
  : `\nFAILED — ${failures} check(s).`)
process.exit(failures === 0 ? 0 : 1)
