# Verifying providers against Google Places

## The problem this solves

56% of the inventory was hidden. `/spas` showed **0 providers**, `/doctors` **0**,
`/optometrists` **1** — three empty pages sitting in the top nav of a directory
whose whole proposition is that it lists who is over there.

Category pages filter on `clearcross_providers.verified`, and that column was a
seeded boolean of unknown provenance: nothing recorded who checked, when, or
against what. So the 46 rows that *were* visible had no more evidence behind
them than the 58 that were not.

## ⛔ Why this is not "query Places, got a result, set verified = true"

Measured against the live API on 2026-09-01:

```
"Zzqx Nonexistent Clinic Nuevo Progreso Tamaulipas"
  -> Dr X            | Av. Benito Juárez 127-A, 88810 Nuevo Progreso
  -> MZ Dental Clinic| Calle Coahuila 201, 88810 Nuevo Progreso
```

**Text Search answers a nonsense query with real, operational businesses.** It
falls back to whatever is near the implied locality. The naive implementation
would therefore have marked **all 104 providers verified — including the
invented ones — under a badge naming Google.** That is strictly worse than the
seeded boolean it replaces, because it launders a guess into a citation.

It is unreliable in both directions, which is worse than a consistent failure:
`Dra. Katya Corona - Aesthetic Clinic` returns *nothing at all*.

The fallback is not rare. In the real run:

* six different pharmacies all resolved to **Linda Pharmacy**
* four spas all resolved to **ALMITAS SPA** or **Spa Las Flores**
* our own `America's Best Contacts & Eyeglasses` resolved to a store in
  **Weslaco, Texas** — a US chain we have listed as a Nuevo Progreso optometrist

## The three gates

A Places result is a **candidate**. It becomes a match only by clearing all
three, and `chooseMatch()` never hands back a candidate that failed one, so a
caller cannot reach past the verdict and use it anyway.

### 1. Locality — the right town

`inNuevoProgreso(formattedAddress)`. Requires the town (by name **or** by
postcode), requires Tamaulipas, rejects the USA.

⛔ **The postcode arm is not a convenience.** Nuevo Progreso sits inside the
*municipality* of Río Bravo, and Places renders the locality inconsistently: our
own `Calle Coahuila 192, 88810 Nuevo Progreso` comes back as
`Coahuila 192, Centro, 88810 Cdad. Río Bravo, Tamps.` — same street, same
number, same postcode, different locality string. Two real doctors were being
rejected on that alone.

`88810` is safe to accept because it is specific, measured against controls:

| | postcode |
|---|---|
| every confirmed Nuevo Progreso business | **88810** |
| Río Bravo city proper | 88959 |
| Reynosa | 88630 |

⛔ The state check alone is **not** enough, and this is the likeliest real false
positive: Tamaulipas also contains Reynosa, Matamoros and Nuevo Laredo. A
pharmacy an hour away at a different international bridge is useless to somebody
driving to Progreso for a 9am appointment. That case fired **three times** in the
real data.

### 2. Geography — the right place

`withinNuevoProgreso(location)`, a box measured off the API rather than read off
a map. Confirmed businesses cluster inside 26.0586‥26.0600 / −97.9518‥−97.9505.

| | coordinates | |
|---|---|---|
| Río Bravo city hall | 25.9809, −98.0903 | 11 km SW |
| Reynosa | 26.0846, −98.2858 | 33 km W |
| Weslaco, TX | 26.1720, −98.0096 | other country |

⛔ **This exists specifically to make the postcode arm safe.** That arm accepts
an address on the strength of five digits, which would also accept a corrupt
string that merely contains them. Google's *geocode* stays correct even when its
address string does not: `Jessica's med center` returns
`Bandar Tasik Selatan, 88810 Mexicali, Tamps.` — a Malaysian district and a Baja
California city in one Tamaulipas address — while its coordinates,
26.0600/−97.9515, are exactly right. So the loosening is paired with a check that
cannot be fooled by a mangled string.

A candidate with **no** location is judged on the address gates alone. Absence
of a coordinate is not evidence of being somewhere else.

### 3. Name — the right business

Token overlap **or** edit similarity, whichever is higher, both computed on
*distinctive* tokens only. Threshold **0.6**.

⛔ Similarity is deliberately **not** computed over the whole name. Measured,
`American Pharmacy` vs `Linda Pharmacy` scores **0.63** on the full string —
above threshold — purely because both end in "pharmacy". Stripping generic words
first drops it to 0.13, where it belongs.

The fuzzy arm exists because exact token matching is brittle in three ways the
real data actually hits: possessives (`Tommy's` vs `Tommys`), fusion
(`Bridge Point` vs `Bridgepoint`) and abbreviation (`Veterinary Specialists` vs
`VetSpecialists`). Adding it recovered **6** real businesses.

⛔ **The threshold sits in a measured gap, not against a population.** Highest
rejection **0.50**, lowest acceptance **0.67**. A guard asserts that gap stays
≥ 0.10 — if a future change narrows it, 0.6 has stopped being justified and has
become a guess.

## What gets recorded

Migration `003_provider_verification.sql`, additive and idempotent:
`google_place_id`, `verified_at`, `verification_source`, `hours`,
`business_status`, `google_rating`, `google_review_count`.

A database CHECK enforces the pairing: a row may not carry a source without a
date, or a date without a source. That combination is precisely how `verified`
became meaningless. It deliberately does **not** require `verified` to be true —
a *failed* check is worth recording, so a re-run does not silently retry a dead
business.

⛔ **Google's ratings go in Google's own columns and must never be written to
`avg_rating` / `review_count`.** Those are rendered by
`app/[category]/[provider]/page.tsx` as an unattributed star row reading
"4.5 … 2 reviews", on a page whose review section says **"No reviews yet."**
Writing Google's number there recreates exactly the contradiction
`docs/HONEST_CLAIMS.md` removed. Until the display names the source, those
columns hold real data that nothing renders — which is the correct state, since
an unattributed rating is worse than no rating.

A permanently closed business is a real match and is still never published.

## Running it

```bash
SUPABASE_PAT=… GOOGLE_PLACES_KEY=… node tools/verify/run-places-verification.mjs          # report only
SUPABASE_PAT=… GOOGLE_PLACES_KEY=… node tools/verify/run-places-verification.mjs --apply  # write
```

**Dry run by default.** ⛔ The Places key in the vault is *unrestricted* — it is
read from the environment and must never reach a `NEXT_PUBLIC_` var or the
browser. ~104 Text Search calls per full pass, roughly $2–3.

The runner never demotes a currently-visible provider. A visible row that fails
gets its failed check recorded and nothing else; taking a live listing down is a
separate, louder decision than putting one up.

## The guard

`npm run verify:places` — 21 checks, in `npm run verify`.
`python test/_mutate_places_match.py` — **14 mutations, 14 caught**.

Every pair in the guard is real output from the run, not a hypothetical.

⛔ **The harness found two genuine holes in the guard, which is what it is for.**
Deleting the town check was MISSED, because every address under test also failed
the state check — the Reynosa/Matamoros case was missing entirely, and it is the
one that fires three times in reality. Widening the postcode to `888` was also
MISSED, because neither neighbouring town is 888xx: that mutation was testing a
hypothetical and was replaced with one provable against real addresses.

⛔ **One layer is recorded as unprovable rather than dressed up as a pass.**
Removing the US rejection changes nothing observable: the Weslaco address
contains neither "nuevo progreso" nor "tamaulipas", so it is already rejected
twice over. For that line to be load-bearing a formatted address would have to
name the Mexican town *and* the Mexican state *and* sit in the United States. It
stays because it costs nothing, but the harness records it as known-safe with
its reason — and **fails if it ever becomes provable**, because that would mean
this reasoning has gone stale.
