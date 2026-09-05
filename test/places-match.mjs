/**
 * Guards the matcher that decides which providers the public can see.
 *
 * ⛔ WHY THIS GUARD IS NOT OPTIONAL. The obvious implementation of "verify
 * against Google" is: query Places, and if a result comes back, set
 * verified = true. Measured against the live API on 2026-09-01, that would have
 * marked ALL 104 providers verified, including invented ones -- because Text
 * Search falls back to whatever is near the implied locality rather than
 * returning nothing. Six different real pharmacies on this strip all resolve to
 * "Linda Pharmacy"; four spas all resolve to "ALMITAS SPA"; and our own
 * "America's Best Contacts & Eyeglasses" resolves to a store in WESLACO, TEXAS.
 *
 * Every pair below is real output from that run, not a hypothetical.
 *
 * The two gates are independent on purpose and each is tested alone: locality
 * rejects the right business in the wrong country, name rejects the wrong
 * business in the right town. Either one alone confirms nonsense.
 */
import assert from 'node:assert';
import {
  normalize, distinctive, inNuevoProgreso, withinNuevoProgreso, nameScore,
  distinctiveSimilarity, chooseMatch, NAME_THRESHOLD,
  CONTACT_THRESHOLD, contactConfident, contactWritable,
} from '../tools/verify/places-match.mjs';

let pass = 0, fail = 0;
const check = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + e.message); }
};

const score = (a, b) => Math.max(nameScore(a, b), distinctiveSimilarity(a, b));
const place = (name, addr, extra = {}) => ({
  id: 'places/x', displayName: { text: name }, formattedAddress: addr,
  businessStatus: 'OPERATIONAL', ...extra,
});
const NP = 'Calle Coahuila 201, 88810 Nuevo Progreso, Tamps., Mexico';

// ---------------------------------------------------------------- 1. locality
check('the Weslaco TX store is not in Nuevo Progreso', () => {
  assert.equal(inNuevoProgreso('1919 US, E Expressway 83 Ste 200, Weslaco, TX 78596, USA'), false);
});
check('a real Nuevo Progreso address is accepted', () => {
  assert.equal(inNuevoProgreso(NP), true);
  assert.equal(inNuevoProgreso('Av. Benito Juarez 110, 88810 Nuevo Progreso, Tamaulipas, Mexico'), true);
});
check('"Progreso, TX" is rejected -- it is a different town on our side', () => {
  assert.equal(inNuevoProgreso('Progreso, TX 78579, USA'), false);
});
check('a Nuevo Progreso in another state or country is rejected', () => {
  // There is a Nuevo Progreso in Guatemala and one in Hidalgo. Sending a
  // patient to the wrong one is worse than showing them nothing.
  assert.equal(inNuevoProgreso('Nuevo Progreso, Guatemala'), false);
  assert.equal(inNuevoProgreso('Nuevo Progreso, Hidalgo, Mexico'), false);
});
check('the town written as its municipality is still the town', () => {
  // Measured: Places returns our own Calle Coahuila 192 clinic as "Cdad. Río
  // Bravo" because Nuevo Progreso is inside that municipality. Same street,
  // same number, same postcode. Rejecting it loses real businesses.
  assert.equal(inNuevoProgreso('Coahuila 192, Centro, 88810 Cdad. Río Bravo, Tamps., México'), true);
  assert.equal(inNuevoProgreso('La Paz, 88810 Cdad. Río Bravo, Tamps., México'), true);
});
check('the postcode arm does not let the neighbouring towns in', () => {
  // The whole safety of accepting 88810 rests on it being specific. Río Bravo
  // city proper is 88959 and Reynosa is 88630 -- both measured, not assumed.
  assert.equal(inNuevoProgreso('Av Las Americas 202, Río Bravo, 88959 Cdad. Río Bravo, Tamps., Mexico'), false);
  assert.equal(inNuevoProgreso('Heron Ramírez 300, Rodríguez, 88630 Reynosa, Tamps., Mexico'), false);
});
check('another town in Tamaulipas is rejected -- the state is not the town', () => {
  // The likeliest real false positive, and the one the state check alone cannot
  // catch: Places answering a "... Nuevo Progreso Tamaulipas" query with a
  // business in Reynosa or Matamoros. Same state, a different international
  // bridge, an hour away. Someone driving to Progreso for a 9am appointment
  // must never be pointed at one of these.
  assert.equal(inNuevoProgreso('Blvd. Hidalgo 1500, Reynosa, Tamps., Mexico'), false);
  assert.equal(inNuevoProgreso('Calle Sexta 200, Matamoros, Tamaulipas, Mexico'), false);
  assert.equal(inNuevoProgreso('Av. Guerrero 1200, Nuevo Laredo, Tamps., Mexico'), false);
});
check('locality gate runs BEFORE name -- a perfect name in Texas still fails', () => {
  const r = chooseMatch(
    { name: "America's Best Contacts & Eyeglasses" },
    [place("America's Best Contacts & Eyeglasses", '1919 US, E Expressway 83, Weslaco, TX 78596, USA')],
  );
  assert.equal(r.matched, false, 'a US chain store was confirmed as a Mexican clinic');
  assert.equal(r.reason, 'not-in-nuevo-progreso');
});

// ------------------------------------------------------------ 1b. geography
check('the coordinate box holds the strip and excludes its neighbours', () => {
  // Every figure measured off the live API, not read off a map.
  const inside = [[26.0586, -97.9518], [26.0596, -97.9505], [26.0600, -97.9515]];
  const outside = [
    [25.9809, -98.0903],  // Rio Bravo city hall
    [26.0846, -98.2858],  // Reynosa
    [26.1720, -98.0096],  // Weslaco, TX
    [25.9797, -98.0686],  // a doctor who really is 11km away
  ];
  for (const [la, ln] of inside) {
    assert.ok(withinNuevoProgreso({ latitude: la, longitude: ln }), la + ',' + ln + ' should be inside');
  }
  for (const [la, ln] of outside) {
    assert.ok(!withinNuevoProgreso({ latitude: la, longitude: ln }), la + ',' + ln + ' should be outside');
  }
});
check('a missing coordinate is not treated as being somewhere else', () => {
  // Absence of evidence. The address gates still have to pass on their own.
  assert.equal(withinNuevoProgreso(undefined), true);
  assert.equal(withinNuevoProgreso({}), true);
});
check('geography overrides a corrupt address string that carries the postcode', () => {
  // The reason the coordinate check exists: 88810 alone would accept this.
  const corrupt = 'Reynosa 13A, Bandar Tasik Selatan, 88810 Mexicali, Tamps., Mexico';
  assert.equal(inNuevoProgreso(corrupt), true, 'the address gate accepts it on the postcode');
  const r = chooseMatch({ name: 'Jessica Med Center' }, [{
    id: 'places/x', displayName: { text: 'Jessica med center' },
    formattedAddress: corrupt, businessStatus: 'OPERATIONAL',
    location: { latitude: 25.9809, longitude: -98.0903 },   // but actually in Rio Bravo
  }]);
  assert.equal(r.matched, false, 'a postcode in a corrupt string outvoted the real coordinates');
  assert.equal(r.reason, 'not-in-nuevo-progreso');
});

// -------------------------------------------------------------- 2. the gate
check('a Places fallback to an unrelated business is rejected', () => {
  // The single most important case: this is what Places actually returns.
  const fallbacks = ['American Pharmacy', 'Almost Free Pharmacy', "Angie's Pharmacy",
    'El Ezaby Pharmacy', 'Good Prices Pharmacy', 'LM Pharmacy'];
  for (const ours of fallbacks) {
    const s = score(ours, 'Linda Pharmacy');
    assert.ok(s < NAME_THRESHOLD,
      ours + ' was confirmed against Linda Pharmacy (' + s.toFixed(2) + ')');
  }
});
check('spa fallbacks are rejected', () => {
  const pairs = [
    ['Alpha Male Spa', 'ALMITAS SPA'],
    ['Sapphire Spa', 'Spa Las Flores Nuevo Progreso'],
    ['Sundara Spa', 'Spa Las Flores Nuevo Progreso'],
    ['325 Massage Studio', "Yomi's Spa"],
  ];
  for (const [ours, theirs] of pairs) {
    assert.ok(score(ours, theirs) < NAME_THRESHOLD, ours + ' matched ' + theirs);
  }
});
check('a shared generic word cannot carry a match on its own', () => {
  assert.equal(score('Centro Medico', 'MZ Dental Clinic'), 0);
  // "pharmacy" is common to both; only "american" vs "linda" should count.
  assert.ok(score('American Pharmacy', 'Linda Pharmacy') < 0.2);
});
check('a name with nothing distinctive can never match', () => {
  // All-generic name -> no identifying power -> must not be confirmable.
  assert.equal(distinctive('Clinica Dental').length, 0);
  assert.equal(nameScore('Clinica Dental', 'Clinica Dental Progreso'), 0);
});

// ---------------------------------------------------- 3. real same-businesses
check('possessives, fusion and abbreviation still match', () => {
  const same = [
    ["Tommy's Pharmacy", 'Tommys Pharmacy'],
    ['Bridge Point Dental Clinic', 'Bridgepoint Dental Clinic'],
    ["Mariel's Salon Spa", 'mariels salon spa'],
    ['Nuevo Progreso Veterinary Specialists', 'Nuevo Progreso VetSpecialists'],
    ['Bocanegra Opticas', 'Bocanegra Opticas'],
    ['Centro Medico Emanuel', 'Centro medico Emanuel'],
  ];
  for (const [a, b] of same) {
    assert.ok(score(a, b) >= NAME_THRESHOLD, a + ' vs ' + b + ' scored ' + score(a, b).toFixed(2));
  }
});
check('accents and case are not a difference', () => {
  assert.equal(normalize('CLINICA NOVO CORPO'), 'clinica novo corpo');
  assert.equal(score('Bocanegra Ópticas', 'Bocanegra Opticas'), 1);
});

// ------------------------------------------------------- 4. threshold margin
check('the threshold sits in a real gap, not against either population', () => {
  // Measured over every pair this run produced. If a future change narrows this
  // gap the threshold has stopped being justified and becomes a guess.
  const mustMatch = [
    ["Tommy's Pharmacy", 'Tommys Pharmacy'],
    ['Bridge Point Dental Clinic', 'Bridgepoint Dental Clinic'],
    ["Mariel's Salon Spa", 'mariels salon spa'],
    ['Nuevo Progreso Veterinary Specialists', 'Nuevo Progreso VetSpecialists'],
  ].map(([a, b]) => score(a, b));
  const mustReject = [
    ['American Pharmacy', 'Linda Pharmacy'],
    ['Alpha Male Spa', 'ALMITAS SPA'],
    ['Accualaser Medical Spa', 'Accualaser Plastic Surgery Associates'],
    ['Skin Perfections Medical Spa', 'International Clinic of Cosmetics'],
  ].map(([a, b]) => score(a, b));
  const lowAccept = Math.min(...mustMatch);
  const highReject = Math.max(...mustReject);
  assert.ok(highReject < NAME_THRESHOLD,
    'a rejected pair scores ' + highReject.toFixed(2) + ', at/above the threshold');
  assert.ok(lowAccept >= NAME_THRESHOLD,
    'an accepted pair scores ' + lowAccept.toFixed(2) + ', below the threshold');
  assert.ok(lowAccept - highReject >= 0.1,
    'gap is only ' + (lowAccept - highReject).toFixed(2) + ' -- the threshold is hugging a population');
});

// ------------------------------------------------------------ 5. safety rails
check('a permanently closed business is never published', () => {
  const r = chooseMatch({ name: 'Centro Medico Emanuel' },
    [place('Centro Medico Emanuel', NP, { businessStatus: 'CLOSED_PERMANENTLY' })]);
  assert.equal(r.matched, false, 'a closed clinic would be shown to somebody driving across a border');
  assert.equal(r.reason, 'closed-permanently');
});
check('no candidates is a clean no, not a crash', () => {
  assert.equal(chooseMatch({ name: 'Whatever' }, []).matched, false);
  assert.equal(chooseMatch({ name: 'Whatever' }, undefined).matched, false);
});
check('chooseMatch never hands back a candidate that failed a gate', () => {
  // The caller must not be able to reach past the verdict and use it anyway.
  const bad = chooseMatch({ name: 'X Clinic' }, [place('Totally Different', NP)]);
  assert.equal(bad.matched, false);
  assert.equal(bad.place, undefined, 'a rejected candidate was handed back as .place');
});


// ------------------------------------------------- 6. the contact-write gate
/**
 * ⛔ WHY THIS SECTION EXISTS. Clearing the name gate means "this business is the
 * one we listed". Writing its phone number means "dial this to reach them" --
 * a stronger claim, because it sends a patient somewhere. Every pair below is
 * real output from the 104-provider run of 2026-09-05, and the two REFUSED ones
 * are matches that would have published a competitor's number under our
 * provider's name, on a health directory, looking entirely normal on the page.
 */
const cgPlace = (name, id) => ({ id: id || 'ChIJ' + name.replace(/\W/g, ''), displayName: { text: name } });
const cgMatch = (ourName, theirName, score, id) => ({
  p: { id: 'p-' + ourName.replace(/\W/g, ''), name: ourName, category: 'dentists' },
  verdict: { score, place: cgPlace(theirName, id) },
});

check('a different dentist sharing a surname cannot supply a phone number', () => {
  // Fernando Rodriguez is not Bernardo Rodriguez. Both are real, both are on
  // this strip, and they scored 0.60 on "rodriguez" + "dds".
  assert.ok(!contactConfident('Fernando Rodriguez DDS', 'BRACES Dr. Bernardo Rodriguez DDS-MS', 0.60));
});

check('a different pharmacy one letter apart cannot supply a phone number', () => {
  assert.ok(!contactConfident("Angie's Pharmacy", 'Angel’s Pharmacy', 0.60));
});

check('a shorter name contained in ours is the same business and may supply one', () => {
  // ⛔ This is the reason the gate is not simply a higher threshold: this pair
  // also scored 0.60, and it is genuinely the same clinic.
  assert.ok(contactConfident(
    'SMILE MAKEOVERS / Stetic Implant & Dental Centers',
    'Stetic Implant and Dental Centers', 0.60));
});

check('a strong-but-not-subset match may still supply one', () => {
  // ⛔ TRUE scores, not the runner's two-decimal report. Writing 0.67 here
  // instead of 2/3 is exactly the mistake that put the threshold above the
  // band it was meant to admit, and the fixture would have agreed with it.
  const TWO_THIRDS = 2 / 3;
  assert.ok(contactConfident('Salazar Dental Implant Center', 'Salazar Dental Center', TWO_THIRDS));
  assert.ok(contactConfident('Nuevo Progreso Veterinary Specialists', 'Nuevo Progreso VetSpecialists', TWO_THIRDS),
    'a real vet clinic was refused its own phone number');
  assert.ok(contactConfident('Tommy’s Pharmacy', 'Tommys Pharmacy', 5 / 6));
  assert.ok(contactConfident('ALMITAS SPA', 'ALMITAS SPA', 1.00));
});

check('the bar sits inside the measured gap, touching neither population', () => {
  // ⛔ The gap is only 0.0667 wide, so this cannot demand the 0.1 separation
  // NAME_THRESHOLD is held to. What it CAN demand is that the bar is strictly
  // inside it -- a value at either end silently admits or refuses a whole band.
  const WORST_WRONG = 0.6;
  const BEST_RIGHT = 2 / 3;
  assert.ok(CONTACT_THRESHOLD > WORST_WRONG,
    'the bar admits the wrong matches at ' + WORST_WRONG);
  assert.ok(CONTACT_THRESHOLD <= BEST_RIGHT,
    'the bar refuses the right matches at ' + BEST_RIGHT.toFixed(6));
});

check('a match that failed the name gate can never supply a contact detail', () => {
  assert.ok(!contactConfident('LM Pharmacy', 'Linda Pharmacy', 0.20));
  assert.ok(!contactConfident('Sundara Spa', 'Spa Las Flores Nuevo Progreso', 0.0));
});

check('a name with no distinctive tokens cannot ride the containment arm', () => {
  // Two empty sets are trivially subsets of each other. If containment did not
  // require both sides to carry something distinctive, every pair of purely
  // generic names would qualify at the 0.60 floor.
  assert.ok(!contactConfident('Dental Clinic', 'Dental Center', 0.60));
});

check('one Google place claimed by two providers refuses the weaker one', () => {
  // The real collision: Angel's Pharmacy was the best match for our Angel's
  // Pharmacy at 1.00 AND for our Angie's Pharmacy at 0.60.
  const shared = 'ChIJangels';
  const strong = cgMatch("Angel's Pharmacy", 'Angel’s Pharmacy', 1.00, shared);
  const weak = cgMatch("Angie's Pharmacy", 'Angel’s Pharmacy', 0.60, shared);
  const { ok, refused } = contactWritable([strong, weak]);
  assert.ok(ok.has(strong), 'the exact-name provider should keep its contact write');
  assert.ok(!ok.has(weak), 'the weaker claim on the same place must be refused');
  assert.strictEqual(refused.length, 1);
  assert.match(refused[0][1], /collision/);
});

check('a tie on the same place refuses BOTH, because neither can be told apart', () => {
  const shared = 'ChIJtie';
  const a = cgMatch('Clinica Uno', 'Clinica Dos', 0.70, shared);
  const b = cgMatch('Clinica Tres', 'Clinica Dos', 0.70, shared);
  const { ok, refused } = contactWritable([a, b]);
  assert.strictEqual(ok.size, 0, 'a tie must not hand the number to whichever sorted first');
  assert.strictEqual(refused.length, 2);
});

check('uncontested strong matches are all writable', () => {
  const list = [
    cgMatch('ALMITAS SPA', 'ALMITAS SPA', 1.00, 'a'),
    cgMatch('Bucardo Dental Clinic', 'Bucardo Dental Clinic', 1.00, 'b'),
    cgMatch('Salazar Dental Implant Center', 'Salazar Dental Center', 0.67, 'c'),
  ];
  const { ok, refused } = contactWritable(list);
  assert.strictEqual(ok.size, 3, 'a clean run should refuse nothing');
  assert.strictEqual(refused.length, 0);
});

check('an uncontested WEAK match is still refused, and says why', () => {
  const only = cgMatch('Fernando Rodriguez DDS', 'BRACES Dr. Bernardo Rodriguez DDS-MS', 0.60, 'z');
  const { ok, refused } = contactWritable([only]);
  assert.strictEqual(ok.size, 0);
  assert.match(refused[0][1], /weak name/);
});

check('the contact bar is strictly higher than the visibility bar', () => {
  // ⛔ If these ever converge, the gate is decoration. The whole design is that
  // a listing may show on a weaker match than a phone number may be written on.
  assert.ok(CONTACT_THRESHOLD > NAME_THRESHOLD,
    'CONTACT_THRESHOLD ' + CONTACT_THRESHOLD + ' must exceed NAME_THRESHOLD ' + NAME_THRESHOLD);
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
