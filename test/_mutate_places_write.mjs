/**
 * Mutation harness for the Places WRITE path.
 *
 * Each mutation is a plausible edit -- a tidy-up, a "simplification", a revert
 * -- that would put wrong data on a live health directory. Every one must turn
 * a named guard RED.
 *
 * ⛔ THE HARNESS REFUSES TO SCORE A MUTATION IT COULD NOT APPLY. An anchor that
 * matches zero times, or more than once, proves nothing -- and reporting it as
 * "caught" is how a harness comes to certify coverage it does not have.
 *
 *   node test/_mutate_places_write.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const MUTATIONS = [
  // ---------------------------------------------------------- the fill rules
  {
    file: 'tools/verify/places-write.mjs',
    label: 'hours reverts to a bare assignment (the live defect)',
    guard: 'test/places-write.mjs',
    find: 'hours = coalesce(hours, ${hours}::jsonb),',
    replace: 'hours = ${hours}::jsonb,',
  },
  {
    file: 'tools/verify/places-write.mjs',
    label: 'phone stops reading the old row',
    guard: 'test/places-write.mjs',
    find: "phone = coalesce(nullif(phone, ''), ${phone}),",
    replace: 'phone = ${phone},',
  },
  {
    file: 'tools/verify/places-write.mjs',
    label: 'website stops reading the old row',
    guard: 'test/places-write.mjs',
    find: "website = coalesce(nullif(website, ''), ${website}),",
    replace: 'website = ${website},',
  },
  {
    file: 'tools/verify/places-write.mjs',
    label: "Google's rating is written to the column the page renders",
    guard: 'test/places-write.mjs',
    find: 'google_rating = ${pl.rating ?? \'null\'},',
    replace: 'avg_rating = ${pl.rating ?? \'null\'},\n      google_rating = ${pl.rating ?? \'null\'},',
  },
  {
    file: 'tools/verify/places-write.mjs',
    label: 'a value stops being quote-escaped',
    guard: 'test/places-write.mjs',
    find: "export const q = (s) => `'${String(s).replace(/'/g, \"''\")}'`;",
    replace: "export const q = (s) => `'${String(s)}'`;",
  },
  // ------------------------------------------------------ the aggregator rule
  {
    file: 'tools/verify/places-write.mjs',
    label: "a competitor's directory URL is stored as the clinic's own site",
    guard: 'test/places-write.mjs',
    find: '  if (NOT_THEIR_SITE.some((h) => host === h || host.endsWith(\'.\' + h))) return null;',
    replace: '  // removed',
  },
  {
    file: 'tools/verify/places-write.mjs',
    label: 'a malformed URL throws instead of being dropped',
    guard: 'test/places-write.mjs',
    find: "  catch { return null; }",
    replace: "  catch (e) { throw e; }",
  },
  // -------------------------------------------------------- the contact gate
  {
    file: 'tools/verify/places-match.mjs',
    label: 'the contact bar is lowered to the visibility bar',
    guard: 'test/places-match.mjs',
    find: 'export const CONTACT_THRESHOLD = 0.63;',
    replace: 'export const CONTACT_THRESHOLD = 0.6;',
  },
  {
    file: 'tools/verify/places-match.mjs',
    label: 'the contact bar is raised above the good band (the mistake made on 2026-09-05)',
    guard: 'test/places-match.mjs',
    find: 'export const CONTACT_THRESHOLD = 0.63;',
    replace: 'export const CONTACT_THRESHOLD = 0.67;',
  },
  {
    file: 'tools/verify/places-match.mjs',
    label: 'the containment arm is dropped (a real clinic loses its number)',
    guard: 'test/places-match.mjs',
    find: '  return subset(a, b) || subset(b, a);',
    replace: '  return false;',
  },
  {
    file: 'tools/verify/places-match.mjs',
    label: 'containment no longer requires distinctive tokens on both sides',
    guard: 'test/places-match.mjs',
    find: '  if (!a.size || !b.size) return false;',
    replace: '  // removed',
  },
  {
    file: 'tools/verify/places-match.mjs',
    label: 'a collision no longer refuses the weaker claim',
    guard: 'test/places-match.mjs',
    find: '      const loser = contested && (i > 0 || tied);',
    replace: '      const loser = false;',
  },
  {
    file: 'tools/verify/places-match.mjs',
    label: 'a tie hands the number to whichever sorted first',
    guard: 'test/places-match.mjs',
    find: '      const loser = contested && (i > 0 || tied);',
    replace: '      const loser = contested && i > 0;',
  },
  {
    file: 'tools/verify/places-match.mjs',
    label: 'a weak uncontested match is written anyway',
    guard: 'test/places-match.mjs',
    find: '      if (!contactConfident(m.p.name, m.verdict.place.displayName.text, m.verdict.score)) {',
    replace: '      if (false) {',
  },
  // --------------------------------------------- the gate reaches the write
  {
    file: 'tools/verify/places-write.mjs',
    label: 'the builder ignores the contact gate and writes anyway',
    guard: 'test/places-write.mjs',
    find: '  const contact = opts.contact !== false;',
    replace: '  const contact = true;',
  },
];

let caught = 0, missed = 0, skipped = 0;
const originals = new Map();

function green(guard) {
  try {
    execFileSync(process.execPath, [guard], { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

// ⛔ Prove the baseline first. A guard that is already red for an unrelated
// reason scores every mutation as "caught" for free.
for (const guard of new Set(MUTATIONS.map((m) => m.guard))) {
  if (!green(guard)) {
    console.error('REFUSING: ' + guard + ' is RED before any mutation. Fix that first.');
    process.exit(1);
  }
}
console.log('baseline green for ' + new Set(MUTATIONS.map((m) => m.guard)).size + ' guard(s)\n');

try {
  for (const mut of MUTATIONS) {
    if (!originals.has(mut.file)) originals.set(mut.file, readFileSync(mut.file, 'utf8'));
    const src = originals.get(mut.file);
    const n = src.split(mut.find).length - 1;
    if (n !== 1) {
      console.log('SKIP    ' + mut.label + '\n        anchor matched ' + n + ' times -- NOT applied, proves nothing');
      skipped++;
      continue;
    }
    writeFileSync(mut.file, src.split(mut.find).join(mut.replace));
    const stillGreen = green(mut.guard);
    writeFileSync(mut.file, src);
    if (stillGreen) {
      console.log('MISSED  ' + mut.label + '\n        ' + mut.guard + ' stayed green');
      missed++;
    } else {
      console.log('caught  ' + mut.label);
      caught++;
    }
  }
} finally {
  for (const [f, src] of originals) writeFileSync(f, src);
}

// ⛔ Verify the restore by content, not by having run the finally block. A kill
// between the write and the restore leaves a mutated tree that reads green.
let dirty = 0;
for (const [f, src] of originals) {
  if (readFileSync(f, 'utf8') !== src) { console.error('*** NOT RESTORED: ' + f); dirty++; }
}
for (const guard of new Set(MUTATIONS.map((m) => m.guard))) {
  if (!green(guard)) { console.error('*** ' + guard + ' is RED on the restored tree'); dirty++; }
}

console.log('\n' + caught + ' caught, ' + missed + ' missed, ' + skipped + ' skipped'
  + (dirty ? ', TREE NOT CLEAN' : ', tree restored and verified'));
process.exit(missed || skipped || dirty ? 1 : 0);
