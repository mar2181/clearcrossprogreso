/**
 * The matcher, kept separate from the runner so it can be tested with no
 * network and no database.
 *
 * ⛔ WHY THIS IS NOT "query Places, got a result, mark verified".
 *
 * Measured 2026-09-01 against the live API: the query
 *   "Zzqx Nonexistent Clinic Nuevo Progreso Tamaulipas"
 * returns "Dr X" and "MZ Dental Clinic" -- real, operational businesses that
 * have nothing to do with the query. Text Search frequently falls back to
 * whatever is near the implied locality rather than returning nothing. (It CAN
 * return empty -- "Dra. Katya Corona - Aesthetic Clinic" does -- so the failure
 * is unreliable in both directions, which is worse than a consistent one.)
 * A result is therefore a CANDIDATE, never a confirmation, and the naive
 * implementation would have marked all 104 providers verified -- including the
 * invented ones -- under a badge naming Google. Strictly worse than the seeded
 * boolean it replaces.
 *
 * Two independent gates, both mandatory:
 *
 *   1. LOCALITY. The candidate's formatted address must actually be in Nuevo
 *      Progreso. This is what rejects "America's Best Contacts & Eyeglasses",
 *      which our database lists as a Nuevo Progreso optometrist and which
 *      Google resolves to a store in WESLACO, TEXAS. That candidate scores
 *      perfectly on name -- it is the same chain -- so a name-only matcher
 *      confirms a US big-box store as a Mexican clinic.
 *
 *   2. NAME. Token-set overlap after accent/punctuation normalisation, and at
 *      least one DISTINCTIVE token must survive. "Centro Medico" matches half
 *      the clinics on the strip; matching on generic words alone is how one
 *      clinic gets verified against a different clinic's record.
 */

const GENERIC = new Set([
  // Spanish/English words that appear across most listings on the strip and
  // therefore carry no identifying power on their own.
  'centro', 'medico', 'medica', 'clinica', 'clinic', 'consultorio', 'dental',
  'dentista', 'dentist', 'farmacia', 'pharmacy', 'optica', 'opticas', 'optical',
  'spa', 'salon', 'veterinaria', 'vet', 'de', 'del', 'la', 'el', 'los', 'las',
  'y', 'and', 'the', 'dr', 'dra', 'doctor', 'doctora', 'md', 'dds',
  'nuevo', 'progreso', 'tamaulipas', 'mexico', 'sa', 'cv', 'srl',
]);

export function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining accents: Ópticas -> Opticas
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokens(s) {
  return normalize(s).split(' ').filter(Boolean);
}

export function distinctive(s) {
  return tokens(s).filter((t) => t.length > 1 && !GENERIC.has(t));
}

/**
 * Is this candidate actually in Nuevo Progreso, Mexico?
 *
 * Deliberately strict about the country as well as the town: there is a Nuevo
 * Progreso in Guatemala and one in Hidalgo state, and "Progreso" alone is also
 * a town in Yucatán and a city in Texas. Getting this wrong points a patient at
 * the wrong border.
 */
export const NP_POSTCODE = '88810';

export function inNuevoProgreso(formattedAddress) {
  const a = normalize(formattedAddress);

  // Either the locality names the town, or the postcode does.
  //
  // ⛔ The postcode arm is NOT a loosening for convenience -- it fixes a
  // measured false negative. Nuevo Progreso sits inside the MUNICIPALITY of Río
  // Bravo, and Places renders the locality inconsistently: our own
  // "Calle Coahuila 192, 88810 Nuevo Progreso" comes back from Google as
  // "Coahuila 192, Centro, 88810 Cdad. Río Bravo, Tamps." -- same street, same
  // number, same postcode, different locality string. Two real doctors were
  // being rejected on that alone.
  //
  // 88810 is safe to trust because it is specific to the town, measured against
  // controls rather than assumed: every confirmed Nuevo Progreso business
  // returns 88810, while Río Bravo city proper is 88959 and Reynosa is 88630.
  // So this accepts the town written two ways and still rejects its neighbours.
  const named = a.includes('nuevo progreso');
  const postcoded = new RegExp('\\b' + NP_POSTCODE + '\\b').test(a);
  if (!named && !postcoded) return false;

  // Places abbreviates Tamaulipas to "Tamps." -- accept either, but require one.
  if (!/\btamps\b|\btamaulipas\b/.test(a)) return false;
  if (/\busa\b|\btx\b|\btexas\b/.test(a)) return false;
  return true;
}

/**
 * Nuevo Progreso, as a box on the map.
 *
 * Measured, not drawn from a map by eye. Confirmed businesses on the strip
 * cluster inside 26.0586..26.0600 / -97.9518..-97.9505; the box below is roughly
 * ±3km around that, which comfortably contains the town and still excludes
 * every neighbour that actually came back in this data set:
 *
 *   Rio Bravo city hall   25.9809, -98.0903   (11 km SW)
 *   Reynosa pharmacy      26.0846, -98.2858   (33 km W)
 *   Weslaco, TX store     26.1720, -98.0096   (14 km N, other country)
 *
 * ⛔ This exists specifically to make the postcode arm of inNuevoProgreso safe.
 * That arm accepts an address on the strength of "88810" alone, which is right
 * for the Rio Bravo rendering problem but would also accept a corrupt address
 * string that merely happens to contain those digits. Google's GEOCODE stays
 * correct even when its address string does not -- "Jessica's med center" comes
 * back as "Bandar Tasik Selatan, 88810 Mexicali" (a Malaysian district and a
 * Baja California city, in one Tamaulipas address) while its coordinates,
 * 26.0600/-97.9515, are exactly right. So the loosening is paired with a check
 * that cannot be fooled by a mangled string.
 *
 * A candidate with NO location is judged on the address gates alone rather than
 * rejected: absence of a coordinate is not evidence of being somewhere else.
 */
export const NP_BOUNDS = { minLat: 26.03, maxLat: 26.09, minLng: -97.99, maxLng: -97.92 };

export function withinNuevoProgreso(location) {
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return true;
  }
  const { latitude: la, longitude: ln } = location;
  return la >= NP_BOUNDS.minLat && la <= NP_BOUNDS.maxLat
      && ln >= NP_BOUNDS.minLng && ln <= NP_BOUNDS.maxLng;
}

/**
 * Fraction of OUR distinctive tokens present in THEIR name.
 *
 * Directional on purpose. Google often carries a longer official name
 * ("Bocanegra Ópticas Sucursal Centro"); the question that matters is whether
 * everything identifying about our record shows up in theirs, not the reverse.
 */
export function nameScore(ourName, theirName) {
  const ours = distinctive(ourName);
  const theirs = new Set(tokens(theirName));
  if (ours.length === 0) return 0;   // nothing distinctive -> cannot be matched
  const hit = ours.filter((t) => theirs.has(t)).length;
  return hit / ours.length;
}

/**
 * Levenshtein, iterative, on short strings only (business names).
 */
function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Similarity over the DISTINCTIVE part of each name, spaces removed.
 *
 * ⛔ Deliberately NOT computed over the whole name. Measured: "American
 * Pharmacy" vs "Linda Pharmacy" scores 0.63 on the full string -- above
 * threshold -- purely because both end in "pharmacy". Six real pharmacies on
 * this strip all fall back to Linda Pharmacy's Places record, so a whole-string
 * similarity would have confirmed every one of them against the wrong business.
 * Stripping the generic words first drops that pair to 0.00, where it belongs.
 *
 * This exists because exact token matching is brittle in three ways the real
 * data actually hits: possessives ("Tommy's" -> tokens [tommy, s], vs their
 * "Tommys"), fusion ("Bridge Point" vs "Bridgepoint"), and abbreviation
 * ("Veterinary Specialists" vs "VetSpecialists").
 */
export function distinctiveSimilarity(ourName, theirName) {
  const a = distinctive(ourName).join('');
  const b = distinctive(theirName).join('');
  if (!a || !b) return 0;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length);
}

export const NAME_THRESHOLD = 0.6;

/**
 * Is this match strong enough to write a CONTACT DETAIL from -- a phone number
 * or the clinic's own website?
 *
 * ⛔ THIS IS A HIGHER BAR THAN NAME_THRESHOLD ON PURPOSE, and the difference is
 * the whole point. Clearing the name gate says "this business exists and is the
 * one we listed". Writing its phone number says "dial this to reach them". The
 * second claim sends a patient somewhere; the first only shows a listing we
 * already had. They should not share a threshold.
 *
 * ⛔ THE NUMBER BELOW WAS FIRST SET FROM THE RUNNER'S PRINTED OUTPUT AND WAS
 * WRONG. The report rounds to two places, so the scores read 0.60 / 0.67 / 0.83
 * / 0.86 / 1.00 and a bar of 0.67 looked like it sat on top of the second band.
 * The true values are 0.600000, 0.666667, 0.833333, 0.857143 and 1.000000, so
 * 0.67 sat just ABOVE the second band and refused a correct match (Nuevo
 * Progreso Veterinary Specialists <-> Nuevo Progreso VetSpecialists). The
 * refusal message gave it away by printing "weak name 0.67 (< 0.67)".
 * ⇒ never set a threshold from a rounded report.
 *
 * Measured on the full 104-provider run of 2026-09-05, the accepted matches sit
 * at exactly 0.600000, 0.666667, 0.833333, 0.857143 and 1.000000. Both of the
 * two WRONG matches in that run sat at exactly the 0.600000 floor:
 *
 *   Fernando Rodriguez DDS  ->  BRACES Dr. Bernardo Rodriguez DDS-MS   0.60
 *   Angie's Pharmacy        ->  Angel's Pharmacy                       0.60
 *
 * Both are a shared surname or trade word carrying a different first word --
 * a DIFFERENT dentist and a DIFFERENT pharmacy on the same strip. Writing
 * either one's number would have pointed patients at a competitor, and it would
 * have looked completely normal on the page.
 *
 * ⛔ But raising the floor alone would also have dropped a real one at 0.60:
 *
 *   SMILE MAKEOVERS / Stetic Implant & Dental Centers
 *                           ->  Stetic Implant and Dental Centers      0.60
 *
 * That pair differs from the two above in a way that generalises: Google's name
 * is entirely CONTAINED in ours. A shorter name that is a subset of the longer
 * one is the same business written two ways; two names that each carry a word
 * the other lacks are two businesses. So the rule is either/or, and both halves
 * are load-bearing:
 *
 *   score > 0.60   OR   one name's distinctive tokens contain the other's
 *
 * ⛔ The score arm is what keeps Salazar Dental Implant Center <-> Salazar
 * Dental Center and Nuevo Progreso Veterinary Specialists <-> Nuevo Progreso
 * VetSpecialists, neither of which is a subset either way.
 *
 * ⛔ THE GAP IS NARROW AND THAT IS STATED RATHER THAN HIDDEN. test/places-match
 * requires NAME_THRESHOLD to sit in a gap at least 0.1 wide; the gap here is
 * 0.0667 (0.600000 -> 0.666667) and no honest value can be 0.1 from both sides.
 * 0.63 is roughly centred in it: 0.03 above the highest wrong match and 0.037
 * below the lowest right one. Anything in (0.60, 0.6667] behaves identically on
 * the measured data; a value at either end does not.
 */
export const CONTACT_THRESHOLD = 0.63;

/**
 * Which matches may a contact detail be written from.
 *
 * ⛔ TWO INDEPENDENT REASONS TO REFUSE, and neither catches the other's case.
 *
 * 1. A COLLISION. If one Google place is the best match for two of our
 *    providers, at most one of them can be right -- and this is the documented
 *    failure mode of this exact API on this exact strip (places-match.mjs opens
 *    by recording six real pharmacies all resolving to Linda Pharmacy). The
 *    2026-09-05 run had one: Angel's Pharmacy was claimed by our own Angel's
 *    Pharmacy at 1.00 AND by our Angie's Pharmacy at 0.60. The weaker claim
 *    loses its contact write. Note this can only be seen across the WHOLE result
 *    set, which is why it lives here and not inside chooseMatch.
 *
 * 2. A WEAK NAME. See contactConfident.
 *
 * ⛔ It is exported so it can be DRIVEN by test/places-match.mjs. While it
 * lived inside the runner script -- which executes on import -- nothing could
 * call it, so the rule that decides whether a patient gets the right phone
 * number was the one piece of this file with no guard on it at all.
 *
 * Refusing a contact write does NOT refuse the match: the provider still
 * verifies, still shows, still gets its hours and coordinates. All it loses is
 * the one field that would send a patient to the wrong business.
 */
export function contactWritable(matched) {
  const byPlace = new Map();
  for (const m of matched) {
    const k = m.verdict.place.id;
    if (!byPlace.has(k)) byPlace.set(k, []);
    byPlace.get(k).push(m);
  }
  const refused = [];
  const ok = new Set();
  for (const [, group] of byPlace) {
    // Strongest claim first; on a tie nobody wins, because a tie is precisely
    // the case where we cannot tell which of the two businesses it is.
    const sorted = [...group].sort((a, b) => b.verdict.score - a.verdict.score);
    const contested = sorted.length > 1;
    const tied = contested && sorted[0].verdict.score === sorted[1].verdict.score;
    sorted.forEach((m, i) => {
      const loser = contested && (i > 0 || tied);
      if (loser) {
        refused.push([m, 'collision: this Google place is also claimed by ' +
          sorted.filter((x) => x !== m).map((x) => x.p.name).join(', ')]);
        return;
      }
      if (!contactConfident(m.p.name, m.verdict.place.displayName.text, m.verdict.score)) {
        refused.push([m, 'weak name ' + m.verdict.score.toFixed(3) +
          ' (< ' + CONTACT_THRESHOLD + ' and neither name contains the other)']);
        return;
      }
      ok.add(m);
    });
  }
  return { ok, refused };
}

export function contactConfident(ourName, theirName, score) {
  if (!(score >= NAME_THRESHOLD)) return false;
  if (score >= CONTACT_THRESHOLD) return true;
  const a = new Set(distinctive(ourName));
  const b = new Set(distinctive(theirName));
  if (!a.size || !b.size) return false;
  const subset = (x, y) => [...x].every((t) => y.has(t));
  return subset(a, b) || subset(b, a);
}

/**
 * Pick the best legitimate candidate, or explain why there is none.
 * Never returns a candidate that fails a gate -- the caller cannot "use it anyway".
 */
export function chooseMatch(provider, candidates, { threshold = NAME_THRESHOLD } = {}) {
  if (!candidates || candidates.length === 0) {
    return { matched: false, reason: 'no-candidates' };
  }

  const local = candidates.filter(
    (c) => inNuevoProgreso(c.formattedAddress) && withinNuevoProgreso(c.location),
  );
  if (local.length === 0) {
    return {
      matched: false,
      reason: 'not-in-nuevo-progreso',
      detail: candidates[0].formattedAddress,
    };
  }

  const scored = local
    .map((c) => {
      const their = c.displayName?.text || '';
      // Best of the two views. Token overlap catches reordered/extra words;
      // distinctive similarity catches possessives, fusion and abbreviation.
      // Both are computed on distinctive tokens only, so neither can be
      // satisfied by a shared generic word like "pharmacy" or "spa".
      const score = Math.max(
        nameScore(provider.name, their),
        distinctiveSimilarity(provider.name, their),
      );
      return { c, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best.score < threshold) {
    return {
      matched: false,
      reason: 'name-mismatch',
      score: best.score,
      detail: best.c.displayName?.text,
    };
  }

  // A permanently closed business is a real match and must still never be shown
  // to somebody planning to drive across a border. Recorded, not published.
  if (best.c.businessStatus === 'CLOSED_PERMANENTLY') {
    return {
      matched: false, reason: 'closed-permanently',
      score: best.score, place: best.c,
    };
  }

  return { matched: true, score: best.score, place: best.c };
}
