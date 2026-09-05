/**
 * Mutation harness for test/honest-claims.mjs sections 9 + 10.
 *
 * Every mutation is a plausible edit somebody would actually make, and each
 * names the check that MUST go red. A mutation whose anchor does not match
 * exactly once is REFUSED and scored as UNPROVEN -- a skipped mutation proves
 * nothing, and counting it as a catch is how a harness credits itself with work
 * it never did.
 *
 * ⛔ THE RESTORE CHECK COMPARES BYTES, NOT STRINGS. Its first draft searched the
 * restored files for "licensed professionals" and reported all three as NOT
 * RESTORED -- because the fix ships comments that QUOTE the removed claim in
 * order to explain it. A restore check that cries wolf is worse than none: the
 * next person learns to ignore it, on the run where it is real.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const MUTATIONS = [
  {
    name: 'the licence claim comes back in PriceTable',
    // ⛔ These strings moved into the dictionary when the components were
    // translated. The harness REFUSED to score them rather than mutate
    // whatever happened to be at the old anchor -- re-pointed, not deleted.
    file: 'lib/i18n/dictionaries/en.ts',
    find: "savingsProvenance: 'Worked out from",
    repl: "savingsProvenance: 'All procedures are performed by licensed professionals. Worked out from",
    expect: 'licensed or certified',
  },
  {
    name: 'the licence claim comes back in SavingsBanner (a different file)',
    file: 'lib/i18n/dictionaries/en.ts',
    find: "savingsBannerNote: 'Compared to average US self-pay prices.",
    repl: "savingsBannerNote: 'All procedures by licensed professionals. Compared to average US self-pay prices.",
    expect: 'licensed or certified',
  },
  {
    name: '"verified by ClearCross" comes back in a file that was never in SOURCES',
    file: 'lib/i18n/dictionaries/en.ts',
    find: "pricesAsListed: 'Prices as listed by each provider',",
    repl: "pricesAsListed: 'Prices verified by ClearCross',",
    expect: 'ClearCross verified/checked',
  },
  {
    name: 'the materials equivalence comes back',
    file: 'lib/i18n/dictionaries/en.ts',
    find: 'Ask for the final price in writing before any work begins.',
    repl: 'They use the same quality materials. Ask for the final price in writing before any work begins.',
    expect: 'same materials/standards',
  },
  {
    name: 'the attribution is deleted instead of corrected (deny-list satisfied, reader told nothing)',
    file: 'lib/i18n/dictionaries/en.ts',
    find: " Figures come from the providers",
    repl: " Figures are",
    expect: 'savings banner still attributes',
  },
  {
    // THE POINT OF THE WHOLE SECTION: a file nobody added to any list.
    // ⛔ A string literal, not a comment -- stripComments removes comments by
    // design, so a comment-shaped mutation would prove the opposite of what it
    // looks like it proves.
    name: 'a file nobody listed makes the claim (the reason the sweep discovers the tree)',
    file: 'components/ui/StarRating.tsx',
    find: 'const sizeMap: Record<StarSize, number> = {',
    repl: "const note = 'All treatments are carried out by licensed professionals.';\n\nconst sizeMap: Record<StarSize, number> = {",
    expect: 'licensed or certified',
  },
  // ── the claims found on 2026-09-05, in files the old SOURCES list never saw ──
  {
    name: 'the homepage says our team verified credentials on-site',
    file: 'lib/i18n/dictionaries/en.ts',
    find: "credentialsDesc: 'Ask to see the C",
    repl: "credentialsDesc: 'By our team, on-site', xDesc: 'Ask to see the C",
    expect: 'credentials were verified by us',
  },
  {
    name: 'the SPANISH homepage says it (the English rule must have a Spanish twin)',
    file: 'lib/i18n/dictionaries/es.ts',
    find: "credentialsDesc: 'Pida ver la C",
    repl: "credentialsDesc: 'Por nuestro equipo, en el lugar', xDesc: 'Pida ver la C",
    expect: 'credentials were verified by us',
  },
  {
    name: 'a price guarantee comes back on the quote detail page',
    file: 'app/quote/[id]/QuoteActions.tsx',
    find: 'Quoted Price',
    repl: 'Guaranteed Quote Price',
    expect: 'GUARANTEE made on a provider behalf',
  },
  {
    name: '"no surprise fees" comes back (a guarantee that USES a negative word)',
    file: 'lib/i18n/dictionaries/en.ts',
    find: "writtenQuotesDesc: 'Ask for one before you go',",
    repl: "writtenQuotesDesc: 'No surprise fees - ever',",
    expect: 'GUARANTEE made on a provider behalf',
  },
  {
    name: 'an invented response time comes back in the patient EMAIL',
    file: 'lib/email.ts',
    find: 'They reply to you directly with their own price.',
    repl: 'They typically respond within 24 hours.',
    expect: 'invented provider response time',
  },
  {
    name: 'an average response time comes back on the homepage',
    file: 'lib/i18n/dictionaries/en.ts',
    find: "quotesDesc: 'Free, no account needed',",
    repl: "quotesDesc: 'Average response: <2hrs',",
    expect: 'invented provider response time',
  },
  {
    name: 'the credentials pillar stops stating the limit (deny-list satisfied, reader misled)',
    file: 'lib/i18n/dictionaries/en.ts',
    find: "We have not checked anybody's - ask",
    repl: "Ask",
    expect: 'states plainly that we checked nobody licence',
  },
  {
    name: 'the prices pillar stops attributing its prices',
    file: 'lib/i18n/dictionaries/es.ts',
    find: 'nos lo dio el proveedor que lo cobra',
    repl: 'es competitivo',
    expect: 'attributes every price to the provider',
  },
]

const GUARD = ['test/honest-claims.mjs']
const TARGETS = [...new Set(MUTATIONS.map((m) => m.file))]

// Byte snapshot BEFORE anything is touched -- the only honest restore oracle.
const snapshot = Object.fromEntries(TARGETS.map((f) => [f, readFileSync(f)]))

// The baseline must be green, or every mutation scores "caught" for free.
try {
  execFileSync('node', GUARD, { encoding: 'utf8' })
  console.log('baseline: GREEN\n')
} catch {
  console.error('ABORT: the guard is already RED before any mutation. Every result would be a false catch.')
  process.exit(1)
}

let caught = 0, missed = 0, skipped = 0

for (const m of MUTATIONS) {
  const original = readFileSync(m.file, 'utf8')
  const n = original.split(m.find).length - 1
  if (n !== 1) {
    console.log(`SKIP   ${m.name}\n       anchor matched ${n} times, mutation NOT applied -- proves nothing`)
    skipped++
    continue
  }
  writeFileSync(m.file, original.replace(m.find, m.repl), 'utf8')
  let out = '', failed = false
  try {
    out = execFileSync('node', GUARD, { encoding: 'utf8' })
  } catch (e) {
    failed = true
    out = (e.stdout || '') + (e.stderr || '')
  }
  writeFileSync(m.file, original, 'utf8')

  const named = out.split('\n').some((l) => l.startsWith('  FAIL') && l.includes(m.expect))
  if (failed && named) {
    console.log(`CAUGHT ${m.name}`)
    caught++
  } else {
    console.log(`MISSED ${m.name}\n       guard ${failed ? 'failed but never named "' + m.expect + '"' : 'stayed GREEN'}`)
    missed++
  }
}

console.log('\n--- restore check (bytes) ---')
let dirty = 0
for (const f of TARGETS) {
  if (!readFileSync(f).equals(snapshot[f])) {
    console.log('  NOT RESTORED: ' + f)
    dirty++
  }
}
if (!dirty) console.log(`  ok  all ${TARGETS.length} mutated files are byte-identical to the snapshot`)

// And the guard must be green again on the restored tree.
let restoredGreen = true
try { execFileSync('node', GUARD, { encoding: 'utf8' }) } catch { restoredGreen = false }
console.log(restoredGreen ? '  ok  guard is GREEN again on the restored tree' : '  ⛔ guard is RED on the restored tree')

console.log(`\n${caught} caught / ${missed} missed / ${skipped} skipped`)
process.exit(missed || skipped || dirty || !restoredGreen ? 1 : 0)
