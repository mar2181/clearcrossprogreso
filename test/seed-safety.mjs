/**
 * Guards the seed against silently undoing the Google Places verification.
 *
 * ⛔ WHAT THIS IS DEFENDING, AND WHY NOTHING WOULD HAVE ERRORED.
 *
 * supabase/migrations/002_seed.sql is GENERATED from lib/mock-data.ts, a March
 * 2026 research snapshot, and every provider row ends in
 * `ON CONFLICT (id) DO UPDATE SET ...`. Four of those columns are no longer
 * owned by that snapshot -- `verified`, `lat`, `lng` and (since migration 005)
 * `phone` are written by tools/verify/run-places-verification.mjs against the
 * live database.
 *
 * So `node scripts/generate-seed.mjs` followed by applying the seed would have
 * reverted the verification and taken the live site from 78 visible providers
 * back to 46, re-emptying /spas, /doctors and /optometrists -- the three empty
 * pages in the top nav that the verification pass existed to fill. The seed is
 * idempotent by design and would have reported success.
 *
 * ⛔ THE CHECK IS ON THE EMITTED SQL, NOT ONLY THE GENERATOR. Reading the
 * generator alone proves what the next regeneration would emit and says nothing
 * about the file that is actually on disk and actually gets applied. Somebody
 * pasting a column back into 002_seed.sql by hand is the same outage.
 *
 * ⛔ AND IT ASSERTS THE UPDATE LIST IS STILL DOING ITS JOB. A check that only
 * looks for forbidden columns passes hardest when the list is EMPTY -- which
 * would break every legitimate re-seed of a corrected name or description while
 * reporting green. The positive half is not decoration.
 */
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { stripComments } from './_strip-comments.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

let pass = 0, fail = 0
const check = (name, fn) => {
  try { fn(); pass++ }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + e.message) }
}

// Columns the live verification pass owns. A seed may INSERT them (a brand new
// database has no verification results and must start somewhere); it may never
// UPDATE them over a row that already exists.
const VERIFICATION_OWNED = ['verified', 'lat', 'lng', 'phone']

// At least one column the snapshot legitimately still owns, so "the list is
// empty" cannot masquerade as "the list is clean".
const SEED_OWNED_SENTINEL = 'name'

/**
 * Strip SQL `--` comments, string-aware.
 *
 * ⛔ NOT a `/--.*$/` regex. The generated seed carries 104 free-text provider
 * descriptions, and `stripComments` from _strip-comments.mjs is a JS parser --
 * it does not know `--` starts a SQL comment, and a naive regex does not know
 * that a `--` inside a quoted description is not one. Postgres escapes a quote
 * by doubling it, which this handles.
 */
function stripSqlComments(src) {
  let out = ''
  let i = 0
  let inString = false
  while (i < src.length) {
    const c = src[i]
    if (inString) {
      if (c === "'" && src[i + 1] === "'") { out += c + src[i + 1]; i += 2; continue }
      if (c === "'") inString = false
      out += c; i++; continue
    }
    if (c === "'") { inString = true; out += c; i++; continue }
    if (c === '-' && src[i + 1] === '-') {
      while (i < src.length && src[i] !== '\n') i++
      continue
    }
    out += c; i++
  }
  return out
}

/** The assignment targets of every provider `DO UPDATE SET` clause in the seed. */
function providerUpdateClauses(sql) {
  const clauses = []
  const stmts = sql.split(/INSERT\s+INTO\s+public\.clearcross_providers\b/i).slice(1)
  for (const stmt of stmts) {
    const m = stmt.match(/ON\s+CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET\s+([^;]*);/i)
    if (!m) continue
    const targets = m[1]
      .split(',')
      .map((a) => (a.split('=')[0] || '').trim().toLowerCase())
      .filter(Boolean)
    clauses.push({ raw: m[1], targets, count: stmts.length })
  }
  return { clauses, statements: stmts.length }
}

// ------------------------------------------------------- 1. the emitted seed
const seedRaw = readFileSync(join(root, 'supabase', 'migrations', '002_seed.sql'), 'utf-8')
const seed = stripSqlComments(seedRaw)
const { clauses, statements } = providerUpdateClauses(seed)

check('the guard actually found the provider upserts it claims to check', () => {
  // A renamed table or a reshaped statement must fail LOUDLY. Finding nothing
  // and reporting "no forbidden columns" is the failure mode this whole file
  // exists to prevent, one level up.
  assert.ok(statements >= 100,
    `only ${statements} provider INSERT statements found in 002_seed.sql -- the guard is scanning the wrong thing`)
  assert.equal(clauses.length, statements,
    `${statements} provider INSERTs but ${clauses.length} parsed DO UPDATE clauses -- the parser missed some`)
})

for (const col of VERIFICATION_OWNED) {
  check(`002_seed.sql never UPDATEs ${col} on an existing provider`, () => {
    const bad = clauses.filter((c) => c.targets.includes(col))
    assert.equal(bad.length, 0,
      `${bad.length} of ${clauses.length} provider upserts would overwrite ${col}. ` +
      `Re-applying this seed would revert the Google Places verification. ` +
      `Example clause: ${(bad[0] || {}).raw || ''}`)
  })
}

check('002_seed.sql still updates the columns the snapshot DOES own', () => {
  const withSentinel = clauses.filter((c) => c.targets.includes(SEED_OWNED_SENTINEL))
  assert.equal(withSentinel.length, clauses.length,
    `only ${withSentinel.length}/${clauses.length} provider upserts still update ${SEED_OWNED_SENTINEL} -- ` +
    `an empty DO UPDATE list passes the forbidden-column checks above while breaking every legitimate re-seed`)
})

check('002_seed.sql still INSERTs the verification columns for a fresh database', () => {
  // Removing them from the INSERT too would leave a brand new database with no
  // coordinates and nothing visible at all -- the opposite failure.
  const cols = (seed.match(/INSERT\s+INTO\s+public\.clearcross_providers\s*\(([^)]*)\)/i) || [])[1] || ''
  const list = cols.split(',').map((c) => c.trim().toLowerCase())
  for (const col of VERIFICATION_OWNED) {
    assert.ok(list.includes(col), `${col} is missing from the provider INSERT column list`)
  }
})

// --------------------------------------------------------- 2. the generator
// Scanned so the NEXT regeneration is safe too, not just the file on disk.
const genRaw = readFileSync(join(root, 'scripts', 'generate-seed.mjs'), 'utf-8')

const gen = stripComments(genRaw)

check('the generator is scanned with comments stripped, proven both ways', () => {
  // The fix's own comment quotes `verified=EXCLUDED.verified` in order to
  // explain why it was removed. A scan that reads comments accuses its own
  // explanation, and the tempting repair is to delete the explanation.
  //
  // Both halves are needed. The first proves the trap is still armed -- that
  // there IS a quoted instance for the stripper to have to handle. The second
  // proves the stripper handled it. Either alone can pass while the guard is
  // reading the wrong text.
  assert.ok(genRaw.includes('verified=EXCLUDED.verified'),
    'the generator no longer EXPLAINS the removed columns in a comment; ' +
    'this guard has lost its own test case and the checks below are unproven')
  assert.ok(!gen.includes('verified=EXCLUDED.verified'),
    'the forbidden string survived comment stripping -- either the stripper is ' +
    'broken or the generator really would emit it')
})

/**
 * ⛔ THE GENERATOR IS CHECKED ON ITS DATA, NOT ON A LITERAL, AND THE MUTATION
 * HARNESS IS WHY.
 *
 * The first version of these checks scanned the stripped generator for the
 * string `verified=EXCLUDED.verified`. It was VACUOUS: the generator builds that
 * clause from the PROVIDER_SEED_OWNED array, so the literal does not appear in
 * the source at all, and a mutation putting 'verified' straight back into the
 * array sailed through a green run. A string that exists somewhere is not a
 * check -- and a string that CANNOT exist is not a check either.
 *
 * So the array is parsed and read, and a second check pins the template to it,
 * because an array nothing consumes proves nothing about what gets emitted.
 */
function seedOwnedColumns(src) {
  const m = src.match(/PROVIDER_SEED_OWNED\s*=\s*\[([\s\S]*?)\]/)
  assert.ok(m, 'PROVIDER_SEED_OWNED not found in generate-seed.mjs -- the guard is reading the wrong shape')
  return [...m[1].matchAll(/['"]([a-z_]+)['"]/gi)].map((x) => x[1].toLowerCase())
}

check('the generator names the columns it will UPDATE, and the guard can read them', () => {
  const owned = seedOwnedColumns(gen)
  assert.ok(owned.length >= 5, `PROVIDER_SEED_OWNED parsed as only ${owned.length} columns -- parser is wrong`)
  assert.ok(owned.includes(SEED_OWNED_SENTINEL),
    `PROVIDER_SEED_OWNED does not include ${SEED_OWNED_SENTINEL}; an empty list emits a seed that updates nothing`)
})

for (const col of VERIFICATION_OWNED) {
  check(`generate-seed.mjs will not emit an UPDATE of ${col}`, () => {
    assert.ok(!seedOwnedColumns(gen).includes(col),
      `${col} is back in PROVIDER_SEED_OWNED; the next regeneration reopens the hole`)
    // Secondary net, for a revert to a hand-written clause rather than the array.
    const re = new RegExp(col + String.fromCharCode(92) + 's*=' + String.fromCharCode(92) + 's*EXCLUDED', 'i')
    assert.ok(!re.test(gen), `generate-seed.mjs hard-codes ${col}=EXCLUDED.${col}`)
  })
}

check('the provider clause is built FROM that list, not written out beside it', () => {
  // Without this, the list above can be spotless while the emitted template
  // ignores it entirely -- which is exactly the state this file replaced.
  // Scoped to the PROVIDER template. The generator emits four of these
  // (categories, procedures, providers, prices) and a bare `.match` returns the
  // categories one, which legitimately writes its columns out by hand -- so the
  // unscoped version failed on a clean tree.
  const after = gen.split('INSERT INTO public.clearcross_providers')[1] || ''
  const tmpl = (after.match(/ON CONFLICT \(id\) DO UPDATE SET ([^;]*);/) || [])[1] || ''
  assert.ok(tmpl.includes('providerConflictSet'),
    `the provider ON CONFLICT template does not use providerConflictSet (found: "${tmpl}") -- ` +
    `PROVIDER_SEED_OWNED is then a variable nothing consumes and the checks above are decoration`)
})

console.log('\n' + pass + ' passed, ' + fail + ' failed')
process.exit(fail ? 1 : 0)
