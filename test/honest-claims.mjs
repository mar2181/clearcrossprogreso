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
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
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

/* ═══════════════════════════════════════════════════════════════════════════
 * THE CONCIERGE — the surface this guard could not see
 *
 * ⛔ THE 2026-08-30 SWEEP STRIPPED "WE CHECKED THE LICENCE" FROM EVERY PAGE AND
 * LEFT IT STANDING IN `concierge/kb.md`, because every SOURCES array above is a
 * list of PAGES. Dr. Leo is a voice agent on a healthcare directory: what his
 * knowledge base says, he says out loud, in the client's own voice, to somebody
 * deciding whether to cross a border for surgery. It is the loudest surface on
 * the site and it was the only one outside the guard's reach.
 *
 * ⛔ SCAN THE GENERATOR AS WELL AS WHAT IT GENERATED. `concierge/*.md` is an
 * artifact of `tools/build-concierge-kb.mjs`; the sentence lives in the
 * builder. Scanning only the artifact lets the claim be re-introduced at the
 * source and stay green until somebody re-runs the build — and scanning only
 * the builder misses a hand-edit. Scanning both also makes the two disagreeing
 * a failure, which is the drift this pair is prone to.
 *
 * ⛔ MARKDOWN DOES NOT GO THROUGH stripComments. That helper is a JS/TS parser;
 * run it over prose and a bare `https://` truncates the line while a stray
 * apostrophe opens a string that never closes. Markdown has no JS comments to
 * strip — it has HTML ones, which is what `readProse` removes. The .mjs builder
 * still goes through stripComments, so its own comments (which quote the
 * removed claim in order to explain it) cannot accuse themselves.
 * ═══════════════════════════════════════════════════════════════════════════ */

const KB = 'concierge/kb.md'
const PERSONA = 'concierge/persona-leo.md'
const NAV = 'concierge/nav-hint.txt'
const KB_BUILDER = 'tools/build-concierge-kb.mjs'

const readProse = (p) => readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '')

const CONCIERGE_SOURCES = [KB, PERSONA, NAV, KB_BUILDER]
const csrc = Object.fromEntries(
  CONCIERGE_SOURCES.map((p) => [p, p.endsWith('.mjs') ? read(p) : readProse(p)]),
)

/*
 * ⛔ FLATTEN BEFORE MATCHING. The claim that was live wrapped across two lines
 * AND carried markdown emphasis:
 *
 *     Providers are verified against a valid **Cedula
 *     Profesional**, the Mexican professional licence.
 *
 * A plain literal misses that on both counts, and a guard that misses the exact
 * sentence it was written for is worse than no guard. Accents are folded for
 * the same reason the rules in section 1 spell it `C[^ ]*dula`.
 */
const flatten = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Cedula === Cédula
    .replace(/[*_`]/g, '') // markdown emphasis
    .replace(/\s+/g, ' ') // line wraps

const flat = Object.fromEntries(CONCIERGE_SOURCES.map((p) => [p, flatten(csrc[p])]))

// -- 6. The concierge does not claim we checked anyone's licence ------------
console.log('\n6. the concierge claims no more than the pages do')

const CONCIERGE_CLAIMS = [
  ['verified against a valid Cedula', 'the KB claim "providers are verified against a valid Cedula Profesional"'],
  ['come from that verification research', '"ratings and review counts come from that verification research"'],
  ['Cedula Profesional verified', '"Cedula Profesional verified"'],
  ['credentials verified', '"credentials verified"'],
  ['licence verified', '"licence verified"'],
  ['license verified', '"license verified"'],
]
for (const [needle, label] of CONCIERGE_CLAIMS) {
  const n = flatten(needle).toLowerCase()
  const hits = CONCIERGE_SOURCES.filter((p) => flat[p].toLowerCase().includes(n))
  chk(hits.length === 0, 'no ' + label + (hits.length ? ' -- found in ' + hits.join(', ') : ''))
}

/*
 * A first-person claim, judged one sentence at a time. Three ingredients have
 * to land in the SAME sentence — a subject that is us, a verification verb, and
 * a credential — and the sentence must not be a denial.
 *
 * ⛔ THE DENIAL TEST IS THE WHOLE DIFFICULTY AND IT IS NOT PADDING. The honest
 * replacement for the claim reads
 *
 *     ClearCross has not visited any of these clinics ... and has not checked
 *     anybody's professional licence.
 *
 * which carries all three ingredients. A rule without the denial test deletes
 * the disclaimer and keeps nothing — section 5's failure, one surface over.
 */
const US = /\b(?:we|our|us|clearcross|providers? (?:are|is|were|was)|listings? (?:are|is|were|was)|verificamos|revisamos|inspeccionamos)\b/i
const VERIFY = /\b(?:verif\w*|check\w*|inspect\w*|vett?ed|confirm\w*|validat\w*)\b/i
const CREDENTIAL = /\b(?:cedula|licen[sc]es?|licencias?|credentials?|board[- ]certified|accredit\w*)\b/i
const DENIAL = /\b(?:not|never|no|nor|neither|cannot|without|nunca|ningun\w*|sin)\b/i

const sentences = (t) => t.split(/(?<=[.!?:])\s+|\s+-\s+|\s\|\s/).filter((s) => s.trim())
const licenceClaims = (t) =>
  sentences(t).filter((s) => US.test(s) && VERIFY.test(s) && CREDENTIAL.test(s) && !DENIAL.test(s))

/*
 * ⛔ THE RULE IS TESTED AGAINST KNOWN ANSWERS BEFORE IT IS ALLOWED TO ACCUSE A
 * FILE, and the scan is SKIPPED if it misclassifies. A deny-rule that has
 * quietly stopped firing reports a clean knowledge base; one that has grown too
 * broad sends the next person to delete the honest advice to make it green.
 * Both halves are fixtures, so neither failure can be silent.
 */
const SELFTEST_FIRES = [
  'Providers are verified against a valid Cedula Profesional, the Mexican professional licence.',
  "We check every provider's licence before we list them.",
  'ClearCross has verified the credentials of every clinic on this page.',
  'Verificamos la cedula profesional de cada proveedor.',
]
const SELFTEST_QUIET = [
  'ClearCross has not visited any of these clinics, has not inspected them, and has not checked anybody’s professional licence.',
  'Every dentist and doctor practising in Mexico must hold a Cedula Profesional, the professional licence.',
  'Ask to see it at your appointment, where it should be displayed in the office.',
  'ClearCross does not inspect clinics or verify licences.',
  'Listings shown to the public are limited to providers whose listing details we have checked.',
]

let ruleSound = true
for (const s of SELFTEST_FIRES) {
  if (licenceClaims(flatten(s)).length === 0) {
    ruleSound = false
    bad('SELFTEST: the rule did NOT fire on a real claim -- ' + s)
  }
}
for (const s of SELFTEST_QUIET) {
  if (licenceClaims(flatten(s)).length !== 0) {
    ruleSound = false
    bad('SELFTEST: the rule wrongly fired on honest copy -- ' + s)
  }
}

if (!ruleSound) {
  bad('the concierge scan was NOT run. Fix the RULE, not the knowledge base.')
} else {
  ok('rule self-test: ' + SELFTEST_FIRES.length + ' claims caught, ' +
    SELFTEST_QUIET.length + ' honest sentences left alone')
  for (const p of CONCIERGE_SOURCES) {
    const claims = licenceClaims(flat[p])
    chk(claims.length === 0,
      p + ' makes no first-person licence-verification claim' +
      (claims.length ? ' -- ' + claims[0].trim().slice(0, 130) : ''))
  }
}

// -- 7. THE CONTROL: the concierge keeps the advice and keeps the admission --
/*
 * Section 6 is a deny-list, so it is satisfied perfectly by a knowledge base
 * that says nothing about verification at all — and silence is its own lie
 * here, because the visitor is left to assume the badge means more than it
 * does. Both halves are required: the advice a patient can act on, and the
 * limit stated plainly. Asserted on the artifact AND its generator, so a fix
 * applied to one and not the other cannot pass.
 */
console.log('\n7. control: the concierge keeps the advice and states the limit')

const CONCIERGE_MUST_SAY = [
  [/must hold a Cedula Profesional/i, 'says every Mexican dentist and doctor must hold a Cedula Profesional (true, and useful)'],
  [/ask to see it/i, 'tells the visitor to ask to see it at their appointment (advice)'],
  [/has not (?:visited|inspected)/i, 'states plainly that ClearCross has not inspected the clinics'],
  [/not checked [^.]{0,40}licen/i, 'states plainly that no professional licence has been checked'],
]
for (const [re, label] of CONCIERGE_MUST_SAY) {
  for (const p of [KB, KB_BUILDER]) chk(re.test(flat[p]), p + ' ' + label)
}

// -- 8. The concierge's own counts agree with themselves --------------------
/*
 * The builder reads these from the live database, so they are right the day it
 * runs and quietly wrong afterwards — the KB shipped "46 providers" for the
 * three days after the Places pass took the site to 78. Nothing offline can
 * check them against the database, but a hand-edit almost always updates the
 * headline and misses a line (or the reverse), and that IS checkable.
 */
console.log('\n8. the concierge counts agree with themselves')

const catLineRe = /^- \*\*(.+?)\*\*[^\d]+(\d[\d,]*) listed, at `\/([a-z-]+)`/gm
const catLines = [...csrc[KB].matchAll(catLineRe)]
const totalRe = /Total listed publicly: \*\*(\d[\d,]*) providers\*\*, across (\d+) categories/
const totals = totalRe.exec(csrc[KB])

chk(catLines.length > 0, 'kb.md lists at least one category (found ' + catLines.length + ')')
chk(!!totals, 'kb.md carries a "Total listed publicly: N providers, across M categories" line')

if (catLines.length && totals) {
  const num = (s) => Number(s.replace(/,/g, ''))
  const sum = catLines.reduce((a, m) => a + num(m[2]), 0)
  chk(sum === num(totals[1]),
    'the per-category counts sum to the headline total (' + sum + ' vs ' + num(totals[1]) + ')')
  chk(catLines.length === num(totals[2]),
    'the number of category lines matches "across N categories" (' +
    catLines.length + ' vs ' + num(totals[2]) + ')')
}

/*
 * ⛔ AND THE ONE HAND-KEPT COPY MUST AGREE WITH THE GENERATED ONE. `nav-hint.txt`
 * is built from the live database; `LIVE_CATEGORIES` in SiteConcierge.tsx is
 * typed by a person, and it is the list `navigate_to` actually resolves against.
 * They disagreed for three days after the Places pass — the component omitted
 * `/spas` and `/doctors`, carrying a comment asserting both rendered zero — so
 * Dr. Leo denied that two whole categories of the directory existed. Nothing
 * went red, because nothing compared them.
 */
const CONCIERGE_COMPONENT = 'components/SiteConcierge.tsx'
const STATIC_TARGETS = new Set(
  ['/', '/quote', '/search', '/how-it-works', '/safety', '/blog', '/about', '/auth/register'],
)
const navTargets = [...csrc[NAV].matchAll(/->\s*(\/[a-z0-9/-]*)\s*$/gm)].map((m) => m[1])
const navCats = [...new Set(navTargets)].filter((t) => !STATIC_TARGETS.has(t)).sort()
const componentCats = [...read(CONCIERGE_COMPONENT).matchAll(/\{\s*slug:\s*'([a-z-]+)'/g)]
  .map((m) => '/' + m[1])
  .sort()

chk(navCats.length > 0, 'nav-hint.txt offers at least one category page (found ' + navCats.length + ')')
chk(
  navCats.join(',') === componentCats.join(','),
  'SiteConcierge LIVE_CATEGORIES matches the generated nav-hint' +
    (navCats.join(',') === componentCats.join(',')
      ? ''
      : ' -- nav-hint has [' + navCats.join(' ') + '], component has [' + componentCats.join(' ') + ']'),
)

/* ═══════════════════════════════════════════════════════════════════════════
 * SECTION 9 — THE WHOLE TREE, NOT A LIST OF SIX FILES
 *
 * ⛔ WHY THIS EXISTS, AND IT IS THE SAME LESSON AS THE CONCIERGE BLOCK ABOVE.
 * On 2026-09-05, three claims were live in production that this file was
 * already long enough to have caught:
 *
 *   A. components/providers/PriceTable.tsx, on every priced provider page and
 *      in BOTH language trees:
 *        "All procedures at <provider> are performed by licensed professionals
 *         using the same quality materials."
 *      Rendered inches below the page's own disclaimer, which says we have NOT
 *      checked professional licences. The site contradicted itself about a
 *      medical credential.
 *   B. components/category/SavingsBanner.tsx, on every category page:
 *        "All procedures by licensed professionals."
 *   C. components/search/SearchResultsClient.tsx, on every search:
 *        "Prices verified by ClearCross."
 *      Nobody verified a price. A provider gave us a number.
 *
 * PriceTable was ALREADY in the SOURCES array and the sections above still
 * missed it, because those are literal deny-rules for the four claims that were
 * live in August. SavingsBanner and SearchResultsClient were not in SOURCES at
 * all — and that is the structural half: A GUARD SCOPED TO A HAND-WRITTEN LIST
 * OF FILES CANNOT SEE THE NEXT FILE SOMEBODY WRITES, and it reports full
 * coverage the whole time it is happening.
 *
 * So this section DISCOVERS its own corpus by walking components/, app/ and
 * lib/. A new page that makes one of these claims is caught the day it lands
 * rather than the day somebody thinks to add it to a list.
 *
 * ⛔ THE COST IS PAID IN THE SELF-TEST, NOT IN THE SCOPE. A rule loose enough to
 * be wrong across 120 files sends the next person to delete honest copy to make
 * the build green. So each rule below carries fixtures in BOTH directions and
 * the scan is SKIPPED — loudly — if either half misclassifies. Measured when
 * written: the three rules fire on exactly the three sentences above and on
 * nothing else in the tree.
 * ═══════════════════════════════════════════════════════════════════════════ */

console.log('\n9. no page anywhere claims more than we know')

const walkTree = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walkTree(p, out)
    else if (/\.(tsx?|mdx)$/.test(entry) && !entry.endsWith('.d.ts')) out.push(p.split('\\').join('/'))
  }
  return out
}

const PAGE_TREE = ['components', 'app', 'lib'].flatMap((d) => walkTree(d))

// CONTROL. A walk that returns nothing reports the same all-green as a walk over
// a clean tree, and it is the single most likely way this section dies quietly.
chk(PAGE_TREE.length > 50, 'control: the sweep discovered the tree (' + PAGE_TREE.length + ' files)')
chk(PAGE_TREE.includes(PRICE_TABLE), 'control: the sweep reaches ' + PRICE_TABLE)
chk(PAGE_TREE.includes('components/search/SearchResultsClient.tsx'),
  'control: the sweep reaches components/search/SearchResultsClient.tsx (it was outside SOURCES)')

/*
 * ⛔ ADVICE IS NOT A CLAIM, and telling them apart is the whole difficulty — the
 * same trap section 5 records. "Mexican dentists MUST hold a Cedula Profesional"
 * is law, useful, and true; "our dentists ARE licensed professionals" is a claim
 * we cannot substantiate. They share almost every word.
 */
const ADVICE = /\b(?:must|should|deben|debe|ask|pregunt\w*|look for|busque)\b/i

const CLAIM_RULES = [
  {
    id: 'licensed',
    // An assertion that the people doing the work hold a credential.
    re: /\b(?:licen[sc]ed|board[- ]certified|fully certified|certified)\s+(?:and\s+\w+\s+)?(?:profession\w*|dentists?|doctors?|surgeons?|staff|practitioners?|clinics?)\b|\bprofesionales\s+(?:con\s+licencia|certificados|titulados)\b/i,
    advice: true,
    label: 'an unsubstantiated claim that providers are licensed or certified',
  },
  {
    id: 'by-us',
    // An assertion that WE checked something. We match listings against Google
    // Maps; we do not verify prices, credentials or clinics.
    re: /\b(?:verified|checked|vetted|confirmed|validated|inspected)\s+by\s+ClearCross\b|\bClearCross\s+(?:has\s+)?(?:verified|checked|vetted|confirmed|validated|inspected)\b|\bverificad[oa]s?\s+por\s+ClearCross\b/i,
    advice: false,
    label: 'a claim that ClearCross verified/checked something',
  },
  {
    id: 'materials',
    // An equivalence claim about what a clinic uses. Nobody has looked in a
    // cupboard in Nuevo Progreso.
    re: /\bsame\s+(?:quality\s+)?(?:materials?|brands?|standards?)\b|\bmismos\s+materiales\b/i,
    advice: false,
    label: 'an unsubstantiated "same materials/standards as the US" equivalence',
  },
]

/*
 * ⛔ FIXTURES IN BOTH DIRECTIONS, AND THE SCAN IS SKIPPED IF EITHER HALF IS
 * WRONG. A rule that has quietly stopped firing reports a clean tree; a rule
 * that has grown too broad accuses honest copy. Neither failure may be silent.
 * The three FIRES entries are the sentences that were actually live.
 */
const CLAIM_FIRES = [
  ['licensed', 'All procedures at Dental Artistry are performed by licensed professionals using the same quality materials.'],
  ['licensed', 'Compared to average US self-pay prices. All procedures by licensed professionals.'],
  ['licensed', 'Todos los procedimientos son realizados por profesionales con licencia.'],
  ['by-us', 'Prices verified by ClearCross'],
  ['by-us', 'Precios verificados por ClearCross'],
  ['materials', 'using the same quality materials'],
]
const CLAIM_QUIET = [
  'We have not inspected the clinic or checked professional licences - ask to see the Cedula Profesional at your appointment.',
  'Every dentist and doctor practising in Mexico must hold a Cedula Profesional, the professional licence.',
  'Ask to see it at your appointment, where it should be displayed in the office.',
  'These are the prices the provider gave ClearCross.',
  'Precios segun los proveedores. ClearCross no verifica precios.',
  'ClearCross has not checked anybody licence.',
]

let claimRulesSound = true
for (const [id, sentence] of CLAIM_FIRES) {
  const rule = CLAIM_RULES.find((r) => r.id === id)
  const flat9 = flatten(sentence)
  const fired = rule.re.test(flat9) && !DENIAL.test(flat9) && !(rule.advice && ADVICE.test(flat9))
  if (!fired) {
    claimRulesSound = false
    bad('SELFTEST: rule "' + id + '" did NOT fire on a claim that was live -- ' + sentence)
  }
}
for (const sentence of CLAIM_QUIET) {
  const flat9 = flatten(sentence)
  for (const rule of CLAIM_RULES) {
    const fired = rule.re.test(flat9) && !DENIAL.test(flat9) && !(rule.advice && ADVICE.test(flat9))
    if (fired) {
      claimRulesSound = false
      bad('SELFTEST: rule "' + rule.id + '" wrongly fired on honest copy -- ' + sentence)
    }
  }
}

if (!claimRulesSound) {
  bad('the tree-wide claim sweep was NOT run. Fix the RULE, not the copy.')
} else {
  ok('rule self-test: ' + CLAIM_FIRES.length + ' live claims caught, ' +
    CLAIM_QUIET.length + ' honest sentences left alone')

  for (const rule of CLAIM_RULES) {
    const found = []
    for (const f of PAGE_TREE) {
      // stripComments, so a file explaining WHY the claim was removed cannot
      // accuse its own explanation -- the tempting fix for which is to delete
      // the reason.
      for (const s of sentences(flatten(read(f)))) {
        if (!rule.re.test(s)) continue
        if (DENIAL.test(s)) continue
        if (rule.advice && ADVICE.test(s)) continue
        found.push(f + ' :: ' + s.trim().slice(0, 110))
      }
    }
    chk(found.length === 0,
      'nowhere in ' + PAGE_TREE.length + ' files makes ' + rule.label +
      (found.length ? ' -- ' + found[0] : ''))
  }
}

// -- 10. CONTROL: the honest replacements are actually there ----------------
/*
 * Section 9 is a deny-list, and deleting a sentence satisfies a deny-list
 * perfectly. Silence is its own problem here: the savings figure and the price
 * table are the most persuasive things on the site, and a reader who is told
 * nothing about where the numbers came from will assume we stand behind them.
 * So the replacement must SAY where they came from.
 */
console.log('\n10. control: each surface still says where its numbers came from')

const PROVENANCE = [
  [PRICE_TABLE, /prices? the provider gave ClearCross/i,
    'the price table still says the provider supplied the prices'],
  // Tightened after the fix: /provider/i already matched this file BEFORE the
  // claim was removed, so it proved nothing. Pin the attribution itself.
  ['components/category/SavingsBanner.tsx', /come from the providers/i,
    'the savings banner still attributes its figures to the providers'],
  ['components/search/SearchResultsClient.tsx', /as (?:quoted|listed) by/i,
    'search results still attribute prices to the provider, not to us'],
]
for (const [f, re, label] of PROVENANCE) chk(re.test(read(f)), label)

console.log(fails === 0
  ? '\nPASS - every claim on the page is one we can substantiate\n'
  : '\n' + fails + ' FAILED\n')
process.exit(fails === 0 ? 0 : 1)
