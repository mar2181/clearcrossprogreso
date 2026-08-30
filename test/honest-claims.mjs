/**
 * Every claim on this site must be one we can substantiate.
 *
 * Found live on 2026-08-30, all four rendering in production:
 *
 *   A. A tooltip on every verified provider read "Cedula Profesional verified.
 *      Credentials current as of 2026. Clinic conditions and sterilization
 *      protocols checked by ClearCross." Nobody from ClearCross has been to any
 *      of these clinics. That is a SAFETY representation on a medical site.
 *   B. "Prices listed here are final and guaranteed. Providers agree that quoted
 *      prices will not change upon arrival." No provider has agreed to anything;
 *      there is no signed provider anywhere in the database.
 *   C. Four testimonials with invented names, cities and dollar figures
 *      ("Robert M., San Antonio, TX") on a site with zero completed transactions
 *      and zero rows in clearcross_reviews.
 *   D. An animated homepage counter reading "10,000+ Americans served" and
 *      "4.5 Avg provider rating", both hardcoded, both zero in reality.
 *
 * The site may say what it actually knows: a listing was matched against Google
 * Maps, a provider quoted a price, a category holds N providers. It may not say
 * we inspected a clinic, that a price is guaranteed, or that a customer exists.
 *
 * WARNING: THE HARD PART IS THE KEEP-LIST, NOT THE DENY-LIST. Telling a patient
 * to ask to see a Cedula Profesional at their appointment is true, useful, and
 * reads almost identically to the claim that we checked it ourselves. A pattern
 * broad enough to catch the claim eats the advice. So every deny rule targets a
 * FIRST-PERSON claim, and section 5 asserts the advice survived -- if a rule is
 * too broad, section 5 goes red rather than the suite going quietly green.
 */
import { readFileSync } from 'node:fs'
import { stripComments } from './_strip-comments.mjs'

let fails = 0
const ok = (m) => console.log('  ok   ' + m)
const bad = (m) => { console.log('  FAIL ' + m); fails++ }
const chk = (cond, m) => (cond ? ok(m) : bad(m))

const read = (p) => stripComments(readFileSync(p, 'utf8'))

const EN = 'lib/i18n/dictionaries/en.ts'
const ES = 'lib/i18n/dictionaries/es.ts'
const PROVIDER_PAGE = 'app/[category]/[provider]/page.tsx'
const FEATURED = 'components/home/FeaturedProviders.tsx'
const PRICE_TABLE = 'components/providers/PriceTable.tsx'
const SOCIAL = 'components/home/SocialProofBar.tsx'

const SOURCES = [EN, ES, PROVIDER_PAGE, FEATURED, PRICE_TABLE, SOCIAL]
const src = Object.fromEntries(SOURCES.map((p) => [p, read(p)]))
const ALL = SOURCES.map((p) => src[p]).join('\n')

// -- 1. Nobody at ClearCross has inspected a clinic --------------------------
console.log('\n1. we do not claim to have inspected anything')

const INSPECTION_CLAIMS = [
  [/checked by ClearCross/i, 'the literal "checked by ClearCross"'],
  [/Cedula Profesional verified/i, '"Cedula Profesional verified"'],
  [/\bwe (?:verify|check|inspect)\b[^.!?]{0,90}(?:cedula|clinic condition|sterilization|licen[sc]e)/i,
    'a first-person "we verify/check ... licence/clinic/sterilization"'],
  [/\b(?:verificamos|revisamos|inspeccionamos)\b[^.!?]{0,90}(?:dula|esteriliz|condiciones del consultorio|licencia)/i,
    'a first-person Spanish "verificamos/revisamos ... cedula/esterilizacion"'],
  [/verified with a valid Cedula Profesional/i, 'English "verified with a valid Cedula Profesional"'],
  [/verificado con una C[^ ]*dula Profesional/i, 'Spanish "verificado con una Cedula Profesional"'],
]
for (const [re, label] of INSPECTION_CLAIMS) {
  const hits = SOURCES.filter((p) => re.test(src[p]))
  chk(hits.length === 0, 'no ' + label + (hits.length ? ' -- found in ' + hits.join(', ') : ''))
}

// -- 2. We do not guarantee a price on a provider's behalf ------------------
console.log('\n2. no price is promised on a provider behalf')

const GUARANTEE_CLAIMS = [
  [/final and guaranteed/i, '"final and guaranteed"'],
  [/will not change upon arrival/i, '"will not change upon arrival"'],
  [/Providers agree that/i, '"Providers agree that ..." (none has agreed to anything)'],
  [/guaranteed and cannot change/i, '"guaranteed and cannot change"'],
  [/garantizado y no puede cambiar/i, 'Spanish "garantizado y no puede cambiar"'],
  [/guaranteed and binding/i, '"guaranteed and binding"'],
  [/garantizadas y vinculantes/i, 'Spanish "garantizadas y vinculantes"'],
  [/the price you see is the price you pay/i, '"the price you see is the price you pay"'],
]
for (const [re, label] of GUARANTEE_CLAIMS) {
  const hits = SOURCES.filter((p) => re.test(src[p]))
  chk(hits.length === 0, 'no ' + label + (hits.length ? ' -- found in ' + hits.join(', ') : ''))
}

// -- 3. No invented customers ----------------------------------------------
// A testimonial is not fixable by rewording. A vaguer invented customer is the
// same lie with less detail, so the check is for the SHAPE -- a named person
// with a place and a quote -- not for any particular wording.
console.log('\n3. no invented customers')

const KEY_SHAPE = /\bt\d+(?:Name|Text|Location|Procedure|Savings)\s*:/g
const enKeys = src[EN].match(KEY_SHAPE) || []
const esKeys = src[ES].match(KEY_SHAPE) || []
chk(enKeys.length === 0, 'en dictionary carries no t<N>Name/Text/Location keys (found ' + enKeys.length + ')')
chk(esKeys.length === 0, 'es dictionary carries no t<N>Name/Text/Location keys (found ' + esKeys.length + ')')

// A person-shaped byline: "Robert M." / "Linda & Dave K." near a Texas city.
const PERSON_CITY = /'[A-Z][a-z]+(?:\s*&\s*[A-Z][a-z]+)?\s+[A-Z]\.'\s*,[\s\S]{0,160}?(?:TX|Texas)/
chk(!PERSON_CITY.test(src[EN]), 'no "<Name> <Initial>." + Texas city byline in en')
chk(!PERSON_CITY.test(src[ES]), 'no "<Name> <Initial>." + Texas city byline in es')

// -- 4. The homepage counters come from data, not from a literal ------------
console.log('\n4. the homepage counters are not invented')

const social = src[SOCIAL]
chk(!/['"]10,000['"]/.test(social), 'no hardcoded 10,000 "Americans served"')
chk(!/americansServed/.test(ALL), 'the "Americans served" stat is gone entirely')
chk(!/avgRating/.test(ALL), 'no average provider rating claimed (there are zero reviews)')
// Anything the bar still shows must arrive from outside the component, not be
// typed into it. A literal is exactly how 10,000 got there.
//
// COUNT, DO NOT SEARCH. The first version of this check was
//   /providerCount|priceCount|SocialProofBarProps/.test(social)
// and the mutation harness walked straight through it: renaming the props
// interface left `providerCount` and `priceCount` in the file four times over,
// so the alternation was satisfied by an unrelated occurrence. Pin the
// SIGNATURE instead -- there is exactly one of those.
chk(/export default function SocialProofBar\(\s*\{[^}]*\}\s*:\s*SocialProofBarProps\s*\)/.test(social),
  'SocialProofBar destructures a typed props object (not a literal typed into the file)')
const statValues = social.match(/value:\s*'[^']*'/g) || []
const invented = statValues.filter((v) => /\d/.test(v) && !/–|-/.test(v))
chk(invented.length === 0,
  'no stat value is a bare number typed into the component' +
  (invented.length ? ' -- found ' + invented.join(', ') : ''))

// -- 5. THE CONTROL: honest advice must survive -----------------------------
// Every rule above is a deny-list, and a deny-list that is too broad removes the
// useful half. These four strings use the SAME vocabulary in the honest
// direction -- advice to the patient rather than a claim about us -- and must
// still be here afterwards.
console.log('\n5. control: the advice using the same words is still here')

const MUST_SURVIVE = [
  [EN, /must hold a valid Cedula Profesional/i, 'en: "Mexican dentists must hold a valid Cedula Profesional" (advice)'],
  [EN, /asking about sterilization/i, 'en: "do not skip asking about sterilization" (advice)'],
  [ES, /deben tener una C[^ ]*dula Profesional/i, 'es: "deben tener una Cedula Profesional" (advice)'],
  [ES, /protocolos de esterilizaci/i, 'es: "protocolos de esterilizacion" (advice)'],
]
for (const [file, re, label] of MUST_SURVIVE) chk(re.test(src[file]), label)

// The badge must still render SOMETHING for a confirmed listing. Silently
// deleting it would pass every rule above and lose the signal entirely.
//
// COUNT, DO NOT SEARCH -- same trap as above, and the harness caught this one
// too. The provider page gates on `providerData.verified` in TWO places (the
// chip beside the name and the panel in the sidebar). A .test() for the
// identifier is satisfied by either, so disabling one was MISSED.
const BADGE_SITES = [[PROVIDER_PAGE, /providerData\.verified/g, 2], [FEATURED, /provider\.verified/g, 1]]
for (const [f, re, expected] of BADGE_SITES) {
  const n = (src[f].match(re) || []).length
  chk(n === expected,
    f + ' still gates ' + expected + ' place(s) on a confirmed listing (found ' + n + ')')
  chk(!/false\s*&&/.test(src[f]), f + ' has no branch disabled with `false &&`')
}

console.log(fails === 0
  ? '\nPASS - every claim on the page is one we can substantiate\n'
  : '\n' + fails + ' FAILED\n')
process.exit(fails === 0 ? 0 : 1)
