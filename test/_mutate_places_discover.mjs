/**
 * Mutation harness for the DISCOVERY gate.
 *
 * Every mutation below is a plausible edit -- a simplification, a "sensible
 * default", a reordering -- whose effect is a wrong row on a live health
 * directory: a closed clinic, a Texas store listed as Mexican, a restaurant
 * filed under Doctors, or the same business twice.
 *
 * ⛔ The guard passed 44/44 the first time it ran. That is exactly the shape
 * that hides a check which cannot fail, so this file is the real proof.
 *
 *   node test/_mutate_places_discover.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const F = 'tools/verify/places-discover.mjs';
const G = 'test/places-discover.mjs';

const MUTATIONS = [
  {
    file: F, guard: G,
    label: 'a permanently closed business becomes importable',
    find: "  if (status && status !== 'OPERATIONAL') {",
    replace: '  if (false) {',
  },
  {
    file: F, guard: G,
    label: 'the locality gate is dropped (a Weslaco, TX store becomes a Mexican clinic)',
    find: '  if (!inNuevoProgreso(place?.formattedAddress) || !withinNuevoProgreso(place?.location)) {',
    replace: '  if (false) {',
  },
  {
    file: F, guard: G,
    label: 'only the address is checked, not the coordinate',
    find: '  if (!inNuevoProgreso(place?.formattedAddress) || !withinNuevoProgreso(place?.location)) {',
    replace: '  if (!inNuevoProgreso(place?.formattedAddress)) {',
  },
  {
    file: F, guard: G,
    label: 'an unmappable type defaults to doctors instead of being refused',
    find: '  return hit ? hit[1] : null;',
    replace: "  return hit ? hit[1] : 'doctors';",
  },
  {
    file: F, guard: G,
    label: 'the types array is consulted before primaryType',
    find: '  const primary = place?.primaryType;',
    replace: '  const primary = (place?.types || [])[0];',
  },
  {
    file: F, guard: G,
    // ⛔ THE FIRST VERSION OF THIS MUTANT WAS VACUOUS AND SCORED MISSED. It
    // swapped ['doctor'] with ['medical_clinic'] -- two entries that BOTH map to
    // 'doctors' -- so it changed nothing observable, and a mutation that alters
    // no behaviour is indistinguishable from a guard that cannot see it. This
    // one lifts a GENERAL type above the specific ones, which is the regression
    // the ordering exists to prevent.
    label: 'TYPE_ORDER puts a general type first (dental clinics become doctors)',
    find: "export const TYPE_ORDER = [\n  // Specific first.\n  ['dentist', 'dentists'],",
    replace: "export const TYPE_ORDER = [\n  ['medical_clinic', 'doctors'],\n  ['dentist', 'dentists'],",
  },
  {
    file: F, guard: G,
    label: 'the place-id dedupe is dropped (a renamed listing is re-imported)',
    find: '    const byId = existing.find((e) => e.google_place_id && e.google_place_id === pid);',
    replace: '    const byId = null;',
  },
  {
    file: F, guard: G,
    label: 'the name dedupe is dropped (a business we already list is added again)',
    find: '  return best && best.score >= NAME_THRESHOLD ? best : null;',
    replace: '  return null;',
  },
  {
    file: F, guard: G,
    label: 'the name dedupe only compares within the same category',
    find: '  for (const e of existing) {',
    replace: '  for (const e of existing.filter((x) => x.category === categoryFor(place))) {',
  },
  {
    file: F, guard: G,
    // The defect the first live dry run actually proposed: a second row for the
    // provider holding this site's only real lead.
    label: 'the dedupe scores in one direction only (a compound-name duplicate returns)',
    find: '      nameScore(their, e.name),',
    replace: '      0,',
  },
  {
    file: F, guard: G,
    label: 'the name fallback fires even when Google gave a real type (a bar becomes a pharmacy)',
    find: '  if (!hit && onlyGenericTypes(place)) return categoryFromName(place?.displayName?.text || \'\');',
    replace: "  if (!hit) return categoryFromName(place?.displayName?.text || '');",
  },
  {
    file: F, guard: G,
    label: 'a general medical type stops yielding to a specific name (dental clinics file as doctors)',
    find: "  if (hit && hit[1] === 'doctors') {",
    replace: '  if (false) {',
  },
  {
    file: F, guard: G,
    label: 'the name override widens to ANY type (Google\'s own spa/beauty classification is overturned)',
    find: "  if (hit && hit[1] === 'doctors') {",
    replace: '  if (hit) {',
  },
  {
    file: F, guard: G,
    // The live defect: every accented business name stops matching its own rule.
    label: 'the name rules stop normalising (Óptica, Estética and Odontológicas all miss)',
    find: "  const text = normalize(name || '');",
    replace: "  const text = name || '';",
  },
  {
    file: F, guard: G,
    // The live defect: one unlisted generic word blocked the whole fallback.
    label: '`service` drops out of GENERIC_TYPES (four real opticians stay refused)',
    find: "  'service',",
    replace: '  // removed',
  },
  {
    file: F, guard: G,
    label: 'a name naming two specific categories is guessed instead of refused',
    find: '  if (specific.length > 1) return null;',
    replace: '  // removed',
  },
  {
    file: F, guard: G,
    // ⛔ BOTH LAYERS AT ONCE, AND THE FIRST VERSION OF THIS MUTANT SCORED MISSED
    // BECAUSE IT ONLY MOVED ONE. Ordering NAME_RULES specific-first and
    // preferring the specific hit in categoryFromName are redundant: with either
    // still standing, "Gonzalez Medical & Dental Clinic" resolves to dentists.
    // Only removing both lets the general signal win.
    label: 'category specificity is dropped (a dental clinic becomes a doctor)',
    edits: [
      [
        "const NAME_RULES = [\n  [/\\boptic|\\boptica|\\bopticas|\\boptometr|\\boftalmolog|\\bvision\\b/i, 'optometrists'],",
        "const NAME_RULES = [\n  [/\\bmedical\\b|\\bmedico\\b|\\bmedica\\b|\\bclinic|\\bdoctor\\b|\\bdermatolog/i, 'doctors'],\n  [/\\boptic|\\boptica|\\bopticas|\\boptometr|\\boftalmolog|\\bvision\\b/i, 'optometrists'],",
      ],
      ["  return specific[0] || hits[0];", '  return hits[0];'],
    ],
  },
  {
    file: F, guard: G,
    label: 'a name with nothing distinctive in it is accepted',
    find: '  if (distinctive(name).length === 0) {',
    replace: '  if (false) {',
  },
  {
    file: F, guard: G,
    label: 'an empty name is accepted',
    find: "  if (!name.trim()) return { ok: false, reason: 'no-name' };",
    replace: '  // removed',
  },
  {
    file: F, guard: G,
    label: 'slugFor stops avoiding collisions (a unique-slug insert fails mid-batch)',
    find: '  if (!taken.has(base)) return base;',
    replace: '  return base;',
  },
  {
    file: F, guard: G,
    label: 'slugFor stops stripping accents',
    find: "    .replace(/[\\u0300-\\u036f]/g, '')",
    replace: '    ',
  },
  {
    file: F, guard: G,
    label: 'a search stops naming the town (the query returns the whole country)',
    find: "  'veterinaria Nuevo Progreso Tamaulipas Mexico',",
    replace: "  'veterinaria Mexico',",
  },
];

let caught = 0, missed = 0, skipped = 0;
const originals = new Map();

function green(guard) {
  try { execFileSync(process.execPath, [guard], { stdio: 'pipe' }); return true; }
  catch { return false; }
}

// ⛔ Baseline first. A guard already red for an unrelated reason scores every
// mutation as "caught" for free.
for (const guard of new Set(MUTATIONS.map((m) => m.guard))) {
  if (!green(guard)) {
    console.error('REFUSING: ' + guard + ' is RED before any mutation. Fix that first.');
    process.exit(1);
  }
}
console.log('baseline green\n');

try {
  for (const mut of MUTATIONS) {
    if (!originals.has(mut.file)) originals.set(mut.file, readFileSync(mut.file, 'utf8'));
    const src = originals.get(mut.file);
    /**
     * ⛔ SOME MUTATIONS MUST EDIT MORE THAN ONE PLACE, AND THAT IS NOT A
     * CONVENIENCE. Where two layers each independently enforce a property --
     * defence in depth -- breaking either one alone changes nothing observable,
     * so a single-edit mutant correctly scores MISSED and reads like a missing
     * guard. Measured here on category specificity: NAME_RULES being ordered
     * specific-first and categoryFromName preferring the specific hit are
     * redundant, and only removing BOTH lets a general signal win. Mutating the
     * pair is also the realistic mistake -- the tidy-up that deletes "the
     * redundant check" twice.
     */
    const edits = mut.edits || [[mut.find, mut.replace]];
    let bad = 0;
    for (const [find] of edits) {
      const n = src.split(find).length - 1;
      if (n !== 1) { console.log('SKIP    ' + mut.label + '\n        anchor matched ' + n + ' times -- NOT applied, proves nothing'); bad++; break; }
    }
    if (bad) { skipped++; continue; }
    let mutated = src;
    for (const [find, replace] of edits) mutated = mutated.split(find).join(replace);
    writeFileSync(mut.file, mutated);
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

// ⛔ Verify the restore by CONTENT. A kill between the write and the restore
// leaves a mutated tree that every later check reads as green.
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
