/**
 * The discovery gate, driven with no network and no database.
 *
 * ⛔ EVERY CHECK HERE IS A REFUSAL EXCEPT ONE, AND THE ONE MATTERS MOST. A gate
 * that refuses everything passes every "must be refused" check perfectly, so
 * section 0 drives a legitimate new business all the way through and requires it
 * to be ACCEPTED. Without that control the rest of this file proves nothing.
 */
import {
  categoryFor, categoryFromName, duplicateOf, discoverable, slugFor, TYPE_ORDER, SEARCHES,
} from '../tools/verify/places-discover.mjs';

let pass = 0;
const fail = [];
const ok = (cond, label) => (cond ? pass++ : fail.push(label));

/** A real Nuevo Progreso place, shaped exactly as the live API returns one. */
const place = (over = {}) => ({
  id: 'ChIJnew00000000000000000',
  displayName: { text: 'Clinica Dental Santa Fe' },
  formattedAddress: 'Calle Benito Juarez 105, Zona Centro, 88810 Nuevo Progreso, Tamps., Mexico',
  location: { latitude: 26.0592, longitude: -97.9511 },
  businessStatus: 'OPERATIONAL',
  primaryType: 'dental_clinic',
  types: ['dental_clinic', 'medical_clinic', 'health'],
  ...over,
});

/** What we already list. Deliberately small and explicit. */
const EXISTING = [
  { id: 'u1', name: 'Dental Artistry', slug: 'dental-artistry', google_place_id: 'ChIJexisting111', category: 'dentists' },
  { id: 'u2', name: "Angel's Pharmacy", slug: 'angels-pharmacy', google_place_id: null, category: 'pharmacies' },
  { id: 'u3', name: 'Bocanegra Opticas', slug: 'bocanegra-opticas', google_place_id: null, category: 'optometrists' },
];

// ── 0. THE CONTROL ──────────────────────────────────────────────────────────
{
  const v = discoverable(place(), EXISTING);
  ok(v.ok === true, 'CONTROL: a legitimate unlisted Nuevo Progreso clinic is ACCEPTED (got: ' + v.reason + ')');
  ok(v.category === 'dentists', 'CONTROL: and it lands in the right category');
}

// ── 1. Category resolution is ordered ───────────────────────────────────────
{
  ok(categoryFor({ primaryType: 'dental_clinic', types: ['dental_clinic', 'medical_clinic'] }) === 'dentists',
    'a dental clinic is a dentist, not a doctor');
  // The measured live shape: medical_clinic sits FIRST in the array on a real
  // dental clinic. Order in the types array is not a promise, so the specific
  // type must win wherever it sits.
  ok(categoryFor({ types: ['medical_clinic', 'health', 'dental_clinic'] }) === 'dentists',
    'dental_clinic beats medical_clinic wherever it sits in the array');
  ok(categoryFor({ primaryType: 'pharmacy' }) === 'pharmacies', 'pharmacy -> pharmacies');
  ok(categoryFor({ primaryType: 'veterinary_care' }) === 'vets', 'veterinary_care -> vets');
  ok(categoryFor({ primaryType: 'optometrist' }) === 'optometrists', 'optometrist -> optometrists');
  ok(categoryFor({ primaryType: 'plastic_surgeon' }) === 'cosmetic-surgery', 'plastic_surgeon -> cosmetic-surgery');
  ok(categoryFor({ primaryType: 'doctor' }) === 'doctors', 'doctor -> doctors');

  // The refusals that keep a medical directory medical.
  for (const t of ['restaurant', 'lodging', 'bar', 'clothing_store', 'currency_exchange', 'gift_shop', 'tourist_attraction']) {
    ok(categoryFor({ primaryType: t, types: [t] }) === null, `${t} maps to NOTHING`);
  }
  ok(categoryFor({}) === null, 'a place with no type at all maps to nothing');

  // Every mapping must name a category the site actually has.
  const CATS = new Set(['dentists', 'pharmacies', 'optometrists', 'doctors', 'cosmetic-surgery', 'spas', 'vets', 'liquor']);
  ok(TYPE_ORDER.every(([, c]) => CATS.has(c)), 'every TYPE_ORDER entry names a real category');
}

// ── 2. Closed businesses are never imported ─────────────────────────────────
{
  for (const s of ['CLOSED_PERMANENTLY', 'CLOSED_TEMPORARILY']) {
    const v = discoverable(place({ businessStatus: s }), EXISTING);
    ok(v.ok === false && v.reason === 'not-operational', `${s} is refused`);
  }
}

// ── 3. Locality ─────────────────────────────────────────────────────────────
{
  const away = [
    ['Weslaco, TX', '1 W Expressway 83, Weslaco, TX 78596, USA', { latitude: 26.172, longitude: -98.0096 }],
    ['Reynosa', 'Blvd Morelos 100, 88630 Reynosa, Tamps., Mexico', { latitude: 26.0846, longitude: -98.2858 }],
    ['Rio Bravo city', 'Calle Hidalgo 5, 88959 Cdad. Rio Bravo, Tamps., Mexico', { latitude: 25.9809, longitude: -98.0903 }],
  ];
  for (const [label, addr, loc] of away) {
    const v = discoverable(place({ formattedAddress: addr, location: loc }), EXISTING);
    ok(v.ok === false && v.reason === 'not-in-nuevo-progreso', `${label} is refused`);
  }
  // The Rio Bravo RENDERING of a genuine Nuevo Progreso address -- same street,
  // same postcode, different locality string. Must still be accepted.
  // The coordinate gate is NOT redundant with the address gate. The address arm
  // accepts on the strength of "88810" alone -- correct for the Rio Bravo
  // rendering below, but it also accepts a MANGLED address string that merely
  // contains those digits. Measured on the live API, one real candidate came
  // back as "Bandar Tasik Selatan, 88810 Mexicali" -- a Malaysian district and a
  // Baja California city inside one Tamaulipas address. Only the coordinate can
  // refuse that class, and until this case existed nothing here exercised it:
  // all three rows above are already refused on their address.
  const mangled = discoverable(place({
    formattedAddress: "Bandar Tasik Selatan, 88810 Mexicali, Tamps., Mexico",
    location: { latitude: 32.6245, longitude: -115.4523 },
  }), EXISTING);
  ok(mangled.ok === false && mangled.reason === "not-in-nuevo-progreso",
    "an address passing on 88810 alone is still refused on its coordinate");

  const rb = discoverable(place({
    formattedAddress: 'Coahuila 192, Centro, 88810 Cdad. Rio Bravo, Tamps., Mexico',
  }), EXISTING);
  ok(rb.ok === true, 'the 88810 Rio Bravo rendering of a real NP address is ACCEPTED');
}

// ── 4. Dedupe ───────────────────────────────────────────────────────────────
{
  const byId = discoverable(place({ id: 'ChIJexisting111', displayName: { text: 'Totally Different Name' } }), EXISTING);
  ok(byId.ok === false && byId.reason === 'already-listed', 'the same google place id is refused however it is named');

  const byName = discoverable(place({ displayName: { text: 'Dental Artistry' } }), EXISTING);
  ok(byName.ok === false && byName.reason === 'already-listed', 'a name we already carry is refused');

  // Across categories: we file it under optometrists, Google calls it a spa.
  const cross = discoverable(place({
    displayName: { text: 'Bocanegra Opticas' }, primaryType: 'spa', types: ['spa'],
  }), EXISTING);
  ok(cross.ok === false && cross.reason === 'already-listed',
    'a business we already carry under a DIFFERENT category is still refused');

  const d = duplicateOf({ id: 'x', displayName: { text: 'Dental Artistry' } }, EXISTING);
  ok(d && d.row.name === 'Dental Artistry', 'duplicateOf names the row it collided with');
  ok(duplicateOf({ id: 'x', displayName: { text: 'Farmacia Zaragoza' } }, EXISTING) === null,
    'an unrelated name is not a duplicate');
}

// ── 4b. The compound-name duplicate the first live run actually proposed ────
{
  /**
   * ⛔ THIS IS THE BUG THE FIRST DRY RUN SHIPPED. nameScore is directional --
   * places-match asks whether OUR name shows up in THEIRS, because when
   * verifying a row Google carries the longer official name. Discovery reverses
   * it: our record is the compound one, written by a human from the clinic's
   * own material. Forward-only, this scores 0.333 and the run proposed adding a
   * SECOND row for the provider holding this site's only real lead.
   */
  const compound = [{ id: 'u9', name: 'Dental Artistry / World Dental Center', slug: 'dental-artistry', google_place_id: null, category: 'dentists' }];
  const v = discoverable(place({ id: 'ChIJsomethingelse', displayName: { text: 'Dental Artistry' } }), compound);
  ok(v.ok === false && v.reason === 'already-listed',
    "Google's SHORT name is refused against our COMPOUND name (the live 0.333 miss)");
}

// ── 4c. The name fallback, for places Google types as store/health ──────────
{
  const generic = (text, types) => place({
    displayName: { text }, primaryType: types[0], types,
    id: 'ChIJfallback' + text.length,
  });
  ok(categoryFor(generic('Ramirez Optical', ['store', 'point_of_interest'])) === 'optometrists',
    'an optician Google types as "store" is recovered from its own name');
  ok(categoryFor(generic('New Age Clinica Dental', ['health', 'point_of_interest'])) === 'dentists',
    'a dental clinic Google types as "health" is recovered from its own name');
  ok(categoryFor(generic('Gonzalez Medical & Dental Clinic', ['health'])) === 'dentists',
    'a specific name signal beats a general one');
  ok(categoryFor(generic('Farmacia Rodriguez', ['health'])) === 'pharmacies',
    'a pharmacy Google types as "health" is recovered');

  // ⛔ Ambiguous: two specific signals. Both of these are real listings on the
  // strip and we do not get to pick which category they belong in.
  ok(categoryFor(generic('Dental Farmacia Texas Nuevo Progreso', ['health'])) === null,
    'a name naming TWO specific categories is refused, not guessed');

  // ⛔ THE CONTROL THAT KEEPS THE FALLBACK SAFE: a real type always wins, so a
  // bar cannot be reclassified by the word on its sign.
  ok(categoryFor({ primaryType: 'bar', types: ['bar', 'point_of_interest'], displayName: { text: 'Farmacia Bar' } }) === null,
    'a place Google types as a BAR is never rescued by its name');
  ok(categoryFor({ primaryType: 'restaurant', types: ['restaurant'], displayName: { text: 'Clinica Grill' } }) === null,
    'a restaurant is never rescued by its name');
  ok(categoryFromName('Taqueria Victor') === null, 'a name with no category word maps to nothing');

  /**
   * ⛔ ACCENTED NAMES ARE THE REAL DATA, NOT AN EDGE CASE, AND THIS SECTION
   * EXISTS BECAUSE MY OWN FIXTURES WERE WRONG. The first version of these
   * checks spelled the fixtures without accents, so they passed while the live
   * run kept filing "Clinica de Especialidades Odontológicas" under Doctors --
   * /\bodontolog/ cannot match "Odontológ". Google returns Óptica, Estética and
   * Médico exactly as the businesses spell them.
   */
  ok(categoryFromName('Clinica de Especialidades Odontológicas') === 'dentists', 'Odontológicas (accented) -> dentists');
  ok(categoryFromName('Farmacia Mi Médico') === 'pharmacies', 'Médico (accented) -> pharmacies');
  ok(categoryFromName('Estética MUSSA BEAUTY SALÓN') === 'spas', 'Estética/SALÓN (accented) -> spas');
  ok(categoryFromName('Óptica Bocanegra') === 'optometrists', 'Óptica (accented) -> optometrists');
  ok(categoryFromName('Veterinaria y Taxidermia Valenzo') === 'vets', 'Veterinaria -> vets');

  /**
   * ⛔ THE FULL types ARRAY EXACTLY AS THE LIVE API RETURNS IT. The fixtures
   * above were written from the runner's PRINTED summary, which shows
   * primaryType and a truncated list -- so `service` was missing from
   * GENERIC_TYPES, onlyGenericTypes returned false, and four real opticians plus
   * a dental clinic stayed refused while every check here passed.
   */
  const REAL = [
    ['Ramirez Optical', 'store', ['store', 'health', 'point_of_interest', 'service', 'establishment'], 'optometrists'],
    ['OPTICA INNOVATION', 'store', ['health', 'service', 'store', 'point_of_interest', 'establishment'], 'optometrists'],
    ['Gonzalez Medical & Dental Clinic', 'health', ['health', 'service', 'point_of_interest', 'establishment'], 'dentists'],
  ];
  for (const [text, primaryType, types, want] of REAL) {
    ok(categoryFor({ primaryType, types, displayName: { text } }) === want,
      `live shape: ${text} -> ${want}`);
  }
  // CONTROL: `service` also appears on a taqueria, and it must stay refused --
  // widening the generic set must not make every service business mappable.
  ok(categoryFor({
    primaryType: 'taco_restaurant',
    types: ['taco_restaurant', 'food', 'service', 'establishment'],
    displayName: { text: 'Taqueria Victor' },
  }) === null, 'CONTROL: a taqueria carrying `service` is still refused');
}

// ── 4d. A GENERAL medical type yields to a specific name; a specific one never does
{
  const typed = (text, primaryType) => ({ primaryType, types: [primaryType, 'health'], displayName: { text } });
  // Both measured on the live run, both were landing under Doctors.
  ok(categoryFor(typed('Clinica de Especialidades Odontologicas', 'doctor')) === 'dentists',
    'a "doctor" that names itself odontologica is a dentist');
  ok(categoryFor(typed('Consultorio Fundacion Best Doctor y Consultorio Dentista', 'doctor')) === 'dentists',
    'a "doctor" that names itself dentista is a dentist');
  ok(categoryFor(typed('Farmacia Mi Medico', 'medical_clinic')) === 'pharmacies',
    'a "medical_clinic" that names itself farmacia is a pharmacy');

  // Stays put: the name carries only a general signal, or none at all.
  ok(categoryFor(typed('Dermatology Clinic', 'doctor')) === 'doctors', 'a general name leaves a doctor alone');
  ok(categoryFor(typed('Dr. Raul Meza Duran', 'doctor')) === 'doctors', 'a name with no signal leaves a doctor alone');

  // ⛔ THE CONTROL: a SPECIFIC type is Google's classification of its own
  // listing and is never overturned by a word on a sign. Both of these are real
  // live listings -- Google types the chiropractor `spa` and the nail salon
  // `beauty_salon`, and that is the answer.
  /**
   * ⛔ THIS IS THE ONE THAT ACTUALLY DISCRIMINATES, AND THE HARNESS IS WHY IT
   * EXISTS. The three real-world rows below document the live cases but none of
   * them can fail: "Farmacia Dental Grande" names TWO specific categories so the
   * name resolves to null, "CHIROPRACTOR" matches no rule at all, and "PARIS
   * NAILS SALON" resolves to spas either way. Widening the override to every
   * type left all three green. The property needs a specific type and a single
   * unambiguous name signal that DISAGREE.
   */
  ok(categoryFor(typed('Optica Bella', 'spa')) === 'spas',
    'a specific type beats a clear, contradicting name signal');
  ok(categoryFor(typed('Farmacia Dental Grande', 'dentist')) === 'dentists',
    'a specific type is NOT overridden by the name');
  ok(categoryFor(typed('JULIO LOPEZ CHIROPRACTOR', 'spa')) === 'spas',
    "Google's own `spa` type stands");
  ok(categoryFor(typed('PARIS NAILS SALON', 'beauty_salon')) === 'spas',
    "Google's own `beauty_salon` type stands");
}

// ── 5. A name with nothing distinctive in it ────────────────────────────────
{
  for (const n of ['Clinica Dental', 'Farmacia', 'Centro Medico', 'Dr.']) {
    const v = discoverable(place({ displayName: { text: n } }), EXISTING);
    ok(v.ok === false && (v.reason === 'no-distinctive-name' || v.reason === 'already-listed'),
      `"${n}" carries nothing distinctive and is refused`);
  }
  const empty = discoverable(place({ displayName: { text: '   ' } }), EXISTING);
  ok(empty.ok === false && empty.reason === 'no-name', 'a blank name is refused');
}

// ── 6. Slugs ────────────────────────────────────────────────────────────────
{
  ok(slugFor('Óptica Bocanegra', new Set()) === 'optica-bocanegra', 'accents are stripped');
  ok(slugFor('Farmacia Guadalajara', new Set(['farmacia-guadalajara'])) === 'farmacia-guadalajara-2',
    'a taken slug gets a suffix');
  ok(slugFor('!!!', new Set()) === 'provider', 'a name with no usable characters still yields a slug');
  ok(/^[a-z0-9-]+$/.test(slugFor("Dr. Ramírez & Asociados, S.A. de C.V.", new Set())),
    'a slug is url-safe');
  ok(!slugFor('Trailing Dash -', new Set()).endsWith('-'), 'no trailing dash');
  // The in-run collision: two candidates, same name, second must not reuse the slug.
  const taken = new Set();
  const a = slugFor('Farmacias Benavides', taken); taken.add(a);
  const b = slugFor('Farmacias Benavides', taken);
  ok(a !== b, 'two candidates with the same name get different slugs');
}

// ── 7. The searches ─────────────────────────────────────────────────────────
{
  ok(SEARCHES.length >= 10, 'there are enough searches to cover the categories');
  // ⛔ A query that does not name the town returns the whole country. Every one
  // of these strings is sent to a paid API and its results reach a gate that
  // trusts the address; a query naming no locality wastes the call at best.
  ok(SEARCHES.every((s) => /nuevo progreso/i.test(s)), 'every search names Nuevo Progreso');
  ok(SEARCHES.every((s) => /tamaulipas|mexico/i.test(s)), 'every search names the state or country');
  ok(new Set(SEARCHES).size === SEARCHES.length, 'no search is repeated');
}

console.log(`\nplaces-discover: ${pass} passed, ${fail.length} failed`);
for (const f of fail) console.log('  FAIL  ' + f);
process.exit(fail.length ? 1 : 0);
