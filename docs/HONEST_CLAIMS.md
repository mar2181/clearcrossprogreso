# Claims we can stand behind

## What was live

Four classes of claim were rendering in production until 2026-08-30. None was
caught by a guard, because no guard asked whether a sentence was *true*.

### A. We said we had inspected clinics

Every provider carrying `verified: true` rendered a badge whose tooltip read:

> Cedula Profesional verified. Credentials current as of 2026. **Clinic
> conditions and sterilization protocols checked by ClearCross.**

Nobody from ClearCross has been to any of these clinics. That is a safety
representation on a medical site, on behalf of 46 businesses, and it is the
sentence a lawyer reads out if a patient is harmed. It appeared in three
components and four dictionary strings, in both languages.

### B. We guaranteed prices on providers' behalf

> Prices listed here are final and guaranteed. **Providers agree** that quoted
> prices will not change upon arrival.

No provider has agreed to anything. There is no signed provider anywhere in the
database, and provider registration only became reachable on 2026-08-29.

### C. Four invented customers

"Robert M., San Antonio, TX — *I was quoted $5,500 for an implant... found a
verified dentist on ClearCross for $1,050*", plus three more with names, Texas
cities, procedures and dollar savings, on the homepage in both languages.

The site has zero completed transactions and `clearcross_reviews` holds zero
rows. The block carried its own disclaimer — *"Names and identifying details
have been changed to protect privacy"* — which is not a mitigation: there was
nobody to protect, so the disclaimer was a second false statement holding up the
first.

### D. Invented counters

An animated homepage bar read **"10,000+ Americans served"** and **"4.5 Avg
provider rating"**. Both hardcoded, both zero in reality.

## What it says now

| was | is | where the number comes from |
|---|---|---|
| 10,000+ Americans served | *(gone)* | — |
| 60 Verified providers | **46** Providers listed | `getCategoryCounts()`, summed |
| 4.5 Avg provider rating | **299** Prices published | `getPublishedPriceCount()` |
| 400–2,400% US markup | unchanged, relabelled *"vs published US averages"* | `lib/us-benchmarks.ts`, which cites its sources |

The badge is now **"Listed on ClearCross"** / *"Listing details checked. Clinic
and licences not inspected."*, and the tooltip turns the admission into advice
the patient can use: *"...ask to see the Cedula Profesional at your
appointment."*

The price note reads *"These are the prices the provider gave ClearCross. Ask
for a written quote before any work begins, and take it with you."*

## Two rules that shaped the fix

**A claim about us goes; the same words as advice to the reader stay.** Telling
a patient that Mexican dentists must hold a Cedula Profesional and to ask to see
it is true and useful. It reads almost identically to the claim that we checked
it. So every deny rule in the guard targets a **first-person** construction, and
section 5 of the guard asserts the four honest strings survived — if a rule is
ever widened too far, section 5 goes red instead of the page quietly losing its
useful half.

**A testimonial is not fixable by rewording.** A vaguer invented customer is the
same claim with less detail. `Testimonials.tsx` now holds an empty
`REAL_STORIES` array and renders `null`; the shape carries a mandatory `source`
field (a review id, or a note recording written permission), because a quote
nobody can trace is how the last four got there.

## The guard

`npm run verify:claims` — in `npm run verify`. Mutation harness:
`python test/_mutate_honest_claims.py` — **16 mutations, 16 caught**.

⛔ **Four of those mutations attack the guard's own control**, deleting the
honest advice while leaving every claim removed. A deny-list that is too broad
would go green on all four. They are the reason section 5 exists.

## Traps recorded

⛔ **"A string that exists somewhere is not a check" — twice, in my own guard,
in the file written to prevent it.** The harness scored 14/16 on its first run:

* *the bar takes its numbers from data* was
  `/providerCount|priceCount|SocialProofBarProps/.test(source)` — and
  `providerCount` appears four times, so renaming the props interface was
  MISSED. Now pins the function **signature**, of which there is exactly one.
* *the badge still renders* was `/providerData\.verified/.test(source)` — and
  the provider page gates on it in **two** places, so disabling one was MISSED.
  Now counts occurrences (2 and 1) and forbids a `false &&` disable.

⛔ **One mutation was replaced rather than left as a miss.** Renaming
`SocialProofBarProps` is a TypeScript error (both call sites pass props), so the
type system already defends that direction and a source guard adding a second
opinion proves nothing. It now mutates the realistic regression that *compiles*:
hardcoding one counter back while leaving the props in place.

⛔ **The counters were server-rendering as `0`.** `AnimatedNumber` seeded its
state at `'0'` and only reached the real value after hydration plus an
`IntersectionObserver` fire — so a crawler and a no-JS visitor read
*"0 Providers listed"*. Harmless while the numbers were invented; not harmless
now that they are the only substantiated figures on the page. It seeds with the
real value and winds back to zero **at the moment the animation starts**, not on
mount — doing it on mount leaves the bar at 0 for anyone who never scrolls to it.

⛔ **Two of my own probes returned confident wrong answers.** A node probe read
`C:\tmp\pg.html` while `curl` had written Git-Bash `/tmp` — so a report that
every lie was gone was made against a file that did not exist. And a rebuild
appeared to change nothing because `pkill -f "next start"` does not reap a
Windows node process; the old server was still serving the old bundle. Both were
caught by adding a control whose answer was already known, and the check now
**aborts** if that control fails.

## Not fixed, recorded

⚠️ The provider photographs are still AI-generated and still shared between
competing clinics (`lib/provider-gallery.ts` says so in its own header), and
`fernando-rodriguez.jpg` still appears on two rival clinics' pages. Removing the
false *credentials* claim above them narrows the harm but does not close it.
That is Phase 2 step 11 and it needs the Google Places pass first.

⚠️ `verified` remains a seeded boolean of unknown provenance. The new copy is
worded to claim only that the **listing** was checked, which is the most that
can honestly be said until the Places re-verification runs and can cite a
source. Do not upgrade the wording to name Google before that pass has run.
