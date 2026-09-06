/**
 * Finding businesses on the strip that we do NOT already list.
 *
 * This is the mirror image of places-match.mjs and the difference matters.
 * That file answers "is this Google place the provider we already have a row
 * for?" and its gates exist to stop a WRONG match. This file answers "is this
 * Google place a business we should add?", so the same name-similarity machinery
 * is pointed the other way: a strong match against something we already list is
 * a REASON TO REFUSE, not a reason to accept.
 *
 * ⛔ EVERY GATE HERE IS A REFUSAL. There is no "accept anyway" path, because the
 * output of this tool is rows on a live directory carrying the real names,
 * addresses and phone numbers of real businesses, in a category where a wrong
 * entry sends somebody across an international border.
 *
 * The gates, all mandatory:
 *
 *   1. OPERATIONAL. A permanently or temporarily closed business is never
 *      imported. This is the single worst failure available to a directory
 *      whose entire job is telling somebody where to drive.
 *
 *   2. LOCALITY. Reused verbatim from places-match.mjs -- the address must name
 *      Nuevo Progreso (or its 88810 postcode) in Tamaulipas, AND the coordinate
 *      must fall inside the measured box. Text Search happily returns Reynosa,
 *      Rio Bravo and Weslaco, Texas for a Nuevo Progreso query.
 *
 *   3. CATEGORY. The place's own Google type must map to one of OUR categories
 *      through an explicit list. An unmappable type is refused and reported --
 *      never guessed, never defaulted. This is what keeps a taqueria, a motel
 *      or a currency exchange out of a medical directory.
 *
 *   4. NAME QUALITY. At least one distinctive token, or the row can never be
 *      deduplicated, matched or meaningfully told apart from its neighbours.
 *
 *   5. NOT ALREADY OURS. See duplicateOf.
 */
import {
  inNuevoProgreso, withinNuevoProgreso, distinctive, nameScore, normalize,
  distinctiveSimilarity, NAME_THRESHOLD,
} from './places-match.mjs';

/**
 * Google type -> our category slug, IN PRIORITY ORDER.
 *
 * ⛔ AN ORDERED LIST, NOT AN OBJECT, AND THE ORDER IS LOAD-BEARING. Places
 * returns a types ARRAY and the order within it is not a promise. Measured
 * 2026-09-05 on the live API, "Progreso Smile Dental Center" comes back as
 *   types: dental_clinic, medical_clinic, health, point_of_interest
 * and "Mustre Dental Clinic" as
 *   types: dental_clinic, dentist, medical_clinic, health
 * Both carry `medical_clinic`. Resolving against an unordered map, or against
 * whichever type happens to sit first in their array, files dental clinics under
 * Doctors -- silently, on a page that looks completely normal.
 *
 * So the specific types are checked before the general ones, and `primaryType`
 * is consulted before the array at all.
 */
export const TYPE_ORDER = [
  // Specific first.
  ['dentist', 'dentists'],
  ['dental_clinic', 'dentists'],
  ['optometrist', 'optometrists'],
  ['pharmacy', 'pharmacies'],
  ['drugstore', 'pharmacies'],
  ['veterinary_care', 'vets'],
  ['plastic_surgeon', 'cosmetic-surgery'],
  ['liquor_store', 'liquor'],
  ['spa', 'spas'],
  ['massage', 'spas'],
  ['skin_care_clinic', 'spas'],
  ['beauty_salon', 'spas'],
  ['wellness_center', 'spas'],
  // General last -- anything more specific has already claimed the place.
  ['doctor', 'doctors'],
  ['medical_clinic', 'doctors'],
  ['hospital', 'doctors'],
  ['physiotherapist', 'doctors'],
];

/**
 * Which of our categories, or null.
 *
 * ⛔ NULL IS A REAL ANSWER AND MUST STAY ONE. The tempting default is "put it in
 * doctors and let somebody sort it out later"; that is how a directory ends up
 * listing a hotel as a clinic. Unmappable places are refused and printed, so the
 * decision to add a type to TYPE_ORDER is one a person makes on purpose.
 */
export function categoryFor(place) {
  const primary = place?.primaryType;
  const types = new Set(place?.types || []);
  /**
   * ⛔ ONE `hit`, RESOLVED IN PRIORITY ORDER, RATHER THAN AN EARLY RETURN.
   *
   * The first version returned straight out of the primaryType branch, which
   * made the general-type rule below UNREACHABLE for exactly the places it was
   * written for -- every one of them carries primaryType `doctor`. The guard
   * caught it; nothing about the output looked wrong.
   */
  const hit = (primary && TYPE_ORDER.find(([t]) => t === primary))
    || TYPE_ORDER.find(([t]) => types.has(t))
    || null;
  if (!hit && onlyGenericTypes(place)) return categoryFromName(place?.displayName?.text || '');
  /**
   * ⛔ A GENERAL MEDICAL TYPE YIELDS TO A SPECIFIC NAME, AND ONLY THAT ONE DOES.
   *
   * Every TYPE_ORDER entry that resolves to 'doctors' is a general one --
   * doctor, medical_clinic, hospital, physiotherapist -- so landing there means
   * Google told us "some kind of medical" and nothing more. Measured on the live
   * run: "Clinica de Especialidades Odontológicas" and "Consultorio Fundacion
   * Best Doctor y Consultorio Dentista" both come back as primaryType `doctor`
   * while naming themselves dental, and both were being filed under Doctors.
   *
   * ⛔ It is scoped to 'doctors' deliberately. A SPECIFIC type is never
   * overridden by a name: Google types JULIO LÓPEZ CHIROPRACTOR as `spa` and
   * PARIS NAILS SALON as `beauty_salon`, and those are Google's classification
   * of its own listing, not something a word on a sign should overturn.
   */
  if (hit && hit[1] === 'doctors') {
    const byName = categoryFromName(place?.displayName?.text || '');
    if (byName && byName !== 'doctors') return byName;
  }
  return hit ? hit[1] : null;
}

/**
 * Types that carry no decision at all.
 *
 * ⛔ MEASURED, NOT GUESSED. On the 2026-09-05 discovery run Google typed real
 * opticians as plain `store` (Ramirez Optical, OPTICA INNOVATION, Bocanegra
 * Ópticas) and real clinics as plain `health` (Oftalmólogo, Optical Jesslife,
 * New Age Clínica Dental, Gonzalez Medical & Dental Clinic). Those words cover a
 * clothing shop and a gym respectively, so they can never map to a category on
 * their own -- but refusing on them alone threw away a dozen genuine eye-care
 * and dental businesses.
 */
const GENERIC_TYPES = new Set([
  'health', 'store', 'point_of_interest', 'establishment', 'finance',
  // ⛔ `service` WAS MISSING AND IT BLOCKED THE WHOLE FALLBACK. The set was
  // first written from the runner's PRINTED summary, which shows primaryType
  // and a truncated types list. Read in full, the live rows are
  //   Ramirez Optical  ->  store, health, point_of_interest, service, establishment
  //   OPTICA INNOVATION ->  health, service, store, point_of_interest, establishment
  // so one unlisted generic word made onlyGenericTypes false and four real
  // opticians plus a dental clinic stayed refused. Same family as never setting
  // a threshold from a rounded report: read the whole value, not the summary.
  'service',
]);

/**
 * ⛔ THE NAME FALLBACK ONLY FIRES WHEN GOOGLE HAS SAID NOTHING USEFUL.
 *
 * If ANY of the place's types is a real one -- `bar`, `restaurant`,
 * `convenience_store`, `shopping_mall` -- that type is the answer and the name
 * is never consulted. Otherwise a bar called "Farmacia" would be filed as a
 * pharmacy on the strength of its sign.
 */
function onlyGenericTypes(place) {
  const all = [place?.primaryType, ...(place?.types || [])].filter(Boolean);
  return all.length === 0 || all.every((t) => GENERIC_TYPES.has(t));
}

/**
 * The business's own name as a category signal, specific words first.
 *
 * ⛔ SPECIFICITY IS ENFORCED TWICE, AND NEITHER LAYER ALONE IS THE MECHANISM:
 * this list is ordered specific-first AND categoryFromName prefers a specific hit
 * over the general one. Measured -- breaking either alone changes nothing, which
 * is why the harness mutates the pair. "Gonzalez Medical & Dental
 * Clinic" carries both a specific word and a general one; the specific one is
 * the answer. A business naming TWO specific categories is genuinely ambiguous
 * -- "Dental Farmacia Texas" and "Farmacia Texas - Consultorio Dental" are both
 * real listings on this strip -- so those are refused rather than guessed.
 */
const NAME_RULES = [
  [/\boptic|\boptica|\bopticas|\boptometr|\boftalmolog|\bvision\b/i, 'optometrists'],
  [/\bdental\b|\bdentist|\bodontolog|\bortodonc|\borthodont/i, 'dentists'],
  [/\bfarmacia|\bpharmacy\b|\bdrugstore\b/i, 'pharmacies'],
  [/\bveterinar/i, 'vets'],
  [/\bcirug|\bplastic surgery\b|\bcosmetic surgery\b/i, 'cosmetic-surgery'],
  [/\bspa\b|\bbeauty\b|\bestetica\b|\bmasaje\b|\bmassage\b|\bsalon\b/i, 'spas'],
  [/\blicor|\bliquor\b|\bwine\b|\bvinos\b/i, 'liquor'],
  // General last.
  [/\bmedical\b|\bmedico\b|\bmedica\b|\bclinic|\bdoctor\b|\bdermatolog/i, 'doctors'],
];

export function categoryFromName(name) {
  // ⛔ NORMALISED FIRST -- ACCENTS ARE THE REAL DATA, NOT AN EDGE CASE.
  // The first version tested the raw name and my fixture was accent-free, so it
  // passed while the live run kept filing "Clinica de Especialidades
  // Odontológicas" under Doctors: /\bodontolog/ cannot match "Odontológ".
  // Google returns Óptica, Estética and Médico exactly as the businesses spell
  // them, so an unnormalised rule set silently misses most of the strip.
  const text = normalize(name || '');
  const hits = [];
  for (const [re, cat] of NAME_RULES) if (re.test(text)) hits.push(cat);
  if (hits.length === 0) return null;
  // One specific signal wins outright. Two DIFFERENT specific signals is a
  // business that is genuinely both, and we do not get to pick for it.
  const specific = hits.filter((c) => c !== 'doctors');
  if (specific.length > 1) return null;
  return specific[0] || hits[0];
}

/**
 * Does this candidate duplicate something we already list?
 *
 * Two arms, and only the first is certain.
 *
 * 1. THE SAME GOOGLE PLACE ID. Not a judgement call -- it is literally the same
 *    business record, so it is the same business.
 *
 * 2. A NAME THAT SCORES AT OR ABOVE NAME_THRESHOLD against one of ours. This is
 *    deliberately the SAME bar places-match.mjs uses to confirm a match, applied
 *    in the opposite direction, and it is deliberately CONSERVATIVE.
 *
 *    ⛔ It will sometimes refuse a genuinely new business. Angie's Pharmacy and
 *    Angel's Pharmacy score exactly 0.60 against each other and are two
 *    different pharmacies on the same strip; if we listed one, this refuses the
 *    other. That is the right way round: a refused candidate is PRINTED and
 *    costs a listing somebody can add by hand, while a false accept puts two
 *    rows on the site that a patient cannot tell apart, on a unique slug.
 *    Nothing is lost silently -- every refusal names the row it collided with.
 *
 *    ⛔ Compared across ALL categories, not just the candidate's own. Our
 *    categorisation and Google's disagree often enough (a "medical_clinic" that
 *    we filed under cosmetic surgery) that a same-category-only check would
 *    re-import a business we already carry under a different heading.
 */
export function duplicateOf(place, existing) {
  const pid = place?.id;
  if (pid) {
    const byId = existing.find((e) => e.google_place_id && e.google_place_id === pid);
    if (byId) return { row: byId, why: 'same google place id', score: 1 };
  }
  const their = place?.displayName?.text || '';
  let best = null;
  for (const e of existing) {
    /**
     * ⛔ SCORED IN BOTH DIRECTIONS, AND THE REVERSE ONE IS WHY THIS EXISTS.
     *
     * nameScore is directional BY DESIGN -- places-match.mjs asks "does
     * everything identifying about OUR record show up in THEIRS", because when
     * verifying an existing row Google usually carries the longer official
     * name. Discovery reverses that: OUR record is the one with the compound
     * name, because a human wrote it from the clinic's own material.
     *
     * Measured 2026-09-05, and this was live in the first dry run:
     *   ours   "Dental Artistry / World Dental Center"  distinctive: artistry, world, center
     *   theirs "Dental Artistry"                        distinctive: artistry
     *   forward 0.333 | reverse 1.000 | similarity 0.421
     * At NAME_THRESHOLD 0.6 the forward score alone MISSES it, so the run
     * proposed adding a second row for the provider that holds this site's only
     * real lead -- splitting its identity and showing an empty price table on
     * one of the two.
     *
     * ⛔ THE COST IS REAL AND IS ACCEPTED ON PURPOSE. A short Google name whose
     * one distinctive token is a surname now collides with any longer name
     * sharing it: "Farmacia Rodriguez" scores 1.000 against our dentist
     * "Fernando Rodriguez DDS" and is refused, though they are two different
     * businesses. That is the right way round -- the refusal is PRINTED and
     * costs a listing somebody can add by hand, while the false accept
     * duplicates a live provider on a unique slug.
     */
    const score = Math.max(
      nameScore(e.name, their),
      nameScore(their, e.name),
      distinctiveSimilarity(e.name, their),
    );
    if (!best || score > best.score) best = { row: e, why: 'name', score };
  }
  return best && best.score >= NAME_THRESHOLD ? best : null;
}

/**
 * The whole gate. Returns why it was refused, never a bare boolean -- a refusal
 * with no reason is one nobody can act on, and the report is the deliverable
 * here as much as the import is.
 */
export function discoverable(place, existing) {
  const name = place?.displayName?.text || '';
  if (!name.trim()) return { ok: false, reason: 'no-name' };

  const status = place?.businessStatus;
  if (status && status !== 'OPERATIONAL') {
    return { ok: false, reason: 'not-operational', detail: status };
  }

  if (!inNuevoProgreso(place?.formattedAddress) || !withinNuevoProgreso(place?.location)) {
    return { ok: false, reason: 'not-in-nuevo-progreso', detail: place?.formattedAddress };
  }

  if (distinctive(name).length === 0) {
    return { ok: false, reason: 'no-distinctive-name', detail: name };
  }

  const category = categoryFor(place);
  if (!category) {
    return {
      ok: false,
      reason: 'unmapped-category',
      detail: place?.primaryType || (place?.types || []).join(','),
    };
  }

  const dup = duplicateOf(place, existing);
  if (dup) {
    return {
      ok: false,
      reason: 'already-listed',
      detail: `${dup.row.name} (${dup.why} ${dup.score.toFixed(3)})`,
    };
  }

  return { ok: true, category };
}

/**
 * A URL-safe slug that does not collide with anything already taken.
 *
 * ⛔ `slug` is UNIQUE on the table, so a collision is an insert that fails
 * halfway through a batch. `taken` must include slugs generated earlier in the
 * SAME run, not just the ones already in the database -- two candidates called
 * "Farmacia Guadalajara" would otherwise both resolve to the same slug and only
 * the second would fail, after the first had already been written.
 */
export function slugFor(name, taken) {
  const base = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '') || 'provider';
  if (!taken.has(base)) return base;
  for (let i = 2; i < 500; i++) {
    const s = `${base}-${i}`;
    if (!taken.has(s)) return s;
  }
  throw new Error(`cannot find a free slug for ${name}`);
}

/**
 * What to ask Google.
 *
 * Several phrasings per category, in Spanish and English, because the strip's
 * businesses name themselves in both and Text Search matches the query language
 * more literally than it looks. Every result still runs the full gate above, so
 * a query that drags in something irrelevant costs an API call and nothing else.
 */
export const SEARCHES = [
  'dentista Nuevo Progreso Tamaulipas Mexico',
  'dental clinic Nuevo Progreso Tamaulipas Mexico',
  'ortodoncia Nuevo Progreso Tamaulipas Mexico',
  'implantes dentales Nuevo Progreso Tamaulipas Mexico',
  'farmacia Nuevo Progreso Tamaulipas Mexico',
  'pharmacy Nuevo Progreso Tamaulipas Mexico',
  'optica Nuevo Progreso Tamaulipas Mexico',
  'optometrista Nuevo Progreso Tamaulipas Mexico',
  'doctor Nuevo Progreso Tamaulipas Mexico',
  'clinica medica Nuevo Progreso Tamaulipas Mexico',
  'consultorio medico Nuevo Progreso Tamaulipas Mexico',
  'cirugia plastica Nuevo Progreso Tamaulipas Mexico',
  'cirujano plastico Nuevo Progreso Tamaulipas Mexico',
  'spa Nuevo Progreso Tamaulipas Mexico',
  'masaje Nuevo Progreso Tamaulipas Mexico',
  'salon de belleza Nuevo Progreso Tamaulipas Mexico',
  'veterinaria Nuevo Progreso Tamaulipas Mexico',
  'licores Nuevo Progreso Tamaulipas Mexico',
  'liquor store Nuevo Progreso Tamaulipas Mexico',
  'dermatologia Nuevo Progreso Tamaulipas Mexico',
];
