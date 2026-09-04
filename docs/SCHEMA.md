# Structured data — the price moat

## Why this exists

Every competitor in this SERP publishes ranges: *"crowns $250-450"*. WhatClinic,
Dental Departures, MedicalTourismCo, PlacidWay all do it, because they are
selling fly-in dental vacations to somebody in Chicago comparing Cancún and Los
Algodones, and a range is enough for that reader.

We hold **312 per-provider line items** — down to five distinct Ivermectin packs
at one pharmacy, each with its own price. Nobody else in this market has that
granularity.

Until this shipped, Google saw all 312 of them as plain text in an HTML table.
The only JSON-LD on the entire site was a bare `LocalBusiness` with a name, an
address and a phone number, on one page template. No prices, no breadcrumbs, no
specialized type, nothing on the category pages, nothing on the blog.

⚠️ **What this is and is not.** `hasOfferCatalog` on a `LocalBusiness` is valid
schema.org, but it is **not** a documented Google rich result the way `Product`
pricing is. The honest case for it is entity understanding and answer engines —
AI Overviews, and the assistants people increasingly ask *"how much is a crown in
Nuevo Progreso"*. Do not promise a price snippet in the blue links.

## The one rule

**This markup may only describe what the page actually renders.**

That is not a style preference. This site has already shipped the violation: an
`aggregateRating` of `4.2` / `27 reviews` sat in the JSON-LD of every provider
page whose review panel read *"No reviews yet."* Google requires review markup to
reflect reviews visible on the page, and on a YMYL health site that is
manual-action territory.

The prices are the same surface, **312 times over, and far easier to get wrong**,
because a wrong number in the markup is invisible to anyone reading the page.

## How the rule is enforced structurally

### One definition of what a price is

`getDiscountedPrice()` and `isProcedureDiscounted()` used to be module-private
functions inside `components/providers/PriceTable.tsx`, a `'use client'`
component. A server component cannot import from it, so building markup meant
writing a **second copy of the arithmetic**.

Two copies of "what does this cost" is how a page renders $960 while its JSON-LD
says $1,200 — and the schema is the copy nobody looks at.

Both now call **`lib/pricing.ts` → `effectivePrice()`**. The table and the markup
cannot disagree, by construction rather than by discipline.

`effectivePrice()` returns exactly three things, matching the three states the
table renders:

| `price_usd` | the table renders | the markup emits |
|---|---|---|
| a number | the figure (or struck-through + discounted) | an `Offer` at the figure the reader acts on |
| `0` | the word **Free** | an `Offer` at `0` |
| `null` | a **Request a quote** link | **nothing** |

⛔ `null` is not zero and not unknown-so-guess. Inventing an Offer there would
put a price on a procedure this provider has never quoted us.

⛔ `0` is a real, deliberate value (free consultations). Do not "fix" it by
treating zero as missing.

### Everything else is omitted rather than defaulted

- **No `image`.** The gallery photos are AI-generated and **recycled between
  competing clinics** — `fernando-rodriguez.jpg` appears on two rival dental
  pages. Displaying one is already a problem; asserting it in structured data as
  *this* business's image is a stronger claim, and free to not make.
- **No `openingHours`** yet. The Places verification wrote an `hours` column, but
  the page does not render them. Render first, then mark up.
- **No `areaServed`.** A Nuevo Progreso dentist serves *people from* McAllen; its
  service area is Nuevo Progreso. Claiming the Valley cities would be a stretch
  dressed as a local-relevance signal.
- **No `geo` without real coordinates.** Never defaulted to the centre of town —
  a wrong pin sends somebody to the wrong door.
- **No invented `priceValidUntil`.** It appears only on a discounted Offer, from
  the real `expires_at` on the discount row.

## The label map, which was empty

`app/[category]/[provider]/page.tsx` declared
`const CATEGORY_LABELS: Record<string, string> = {};` — an **empty object**. Every
lookup fell through to its fallback, so all 104 provider titles read

> Alpha Dental Implant Center — **dentists** in Nuevo Progreso Mexico

using the raw plural URL slug, while the category page beside it correctly read
*"Dentists in Nuevo Progreso Mexico"*. The control is what makes that a defect
rather than a convention.

Labels now live in `lib/schema.ts`, and the **BreadcrumbList reads the same map
as the visible breadcrumb**, so the trail on screen and the trail in the markup
cannot name different things.

⛔ The plural labels were measured against the live category pages before being
written, so nothing visible shifted. Two of my first guesses were wrong —
`vets` renders **Vets**, not "Veterinarians", and `liquor` renders **Liquor**,
not "Liquor Stores". The map mirrors the site; it does not improve on it.

## The guard

`npm run verify` → **`node test/schema.mjs`**, *after* `next build`.
**1811 checks.** Mutation harness: `python test/_mutate_schema.py`
(add a substring to run a subset -- each mutation costs a full build).

⛔ **It reads the built HTML, not the function.** A unit test of `providerGraph()`
can only prove the builder is internally consistent — and the violation this site
shipped was perfectly well-formed markup that contradicted the page. The guard
opens each prerendered file and compares the JSON-LD against the **visible price
table in that same file**. That is the only comparison that can catch drift.

⛔ **It fails loudly with no build, and never self-skips.** A guard that waves
itself through prints a pass.

What it asserts, per page:

1. a real, **specialized** schema.org type matching the category directory
2. every `Offer` price appears as a figure rendered under that procedure name
3. an `Offer` never states a **struck-through** price — the figure the reader is
   told they do *not* pay
4. a discounted Offer carries a `priceValidUntil`; an undiscounted one does not
5. an `Offer` at `0` only where the table says **Free**
6. no `Offer` for a procedure whose every row is a quote link
7. `aggregateRating` only where the review panel is not empty
8. every breadcrumb name appears in the visible trail
9. `geo`, when present, is inside the Nuevo Progreso box — **imported from
   `tools/verify/places-match.mjs`, not copied**, so there is one measured box
10. the title does not fall back to the raw URL slug
11. coverage floors: ≥100 pages, ≥300 Offers
12. a discounted cell never renders the **same figure twice** -- a discount that
    computed to nothing
13. coverage floor on **Free rows**, and the count of zero-priced Offers must
    equal it exactly

### ⛔ Three false failures the guard produced before it was trusted

Every one accused correct code, and all three are the same family — *a string
that exists somewhere is not the thing you are checking.*

- **61 failures, and 8 were a lossy Map.** `visiblePrices` keyed by procedure
  name and kept the last row. But one procedure legitimately has several rows at
  different prices: Farmacias Benavides renders **five** Anti-Parasitic
  (Ivermectin) lines from $6 to $59, Pancho's renders three Weight Loss lines at
  $300, $250 and $41. Collapsing them made every price but the last look invented.
  It maps to a **list** now.
- **9 breadcrumb failures were HTML entities.** The markup holds
  `Jessica&#x27;s Med Center`; the JSON-LD holds the apostrophe. The guard now
  decodes, and reads the breadcrumb `<ol>` specifically rather than raw page HTML.
- **3 rating failures were a different clinic's card.** Scanning for
  *"No reviews yet"* page-wide hit the **related-provider cards at the bottom**,
  which render that fragment for other businesses. Three pages with two real
  reviews each looked like policy violations. The check now matches the full
  sentence `ReviewList` emits, which nothing else does.

### ⛔ THE HARNESS'S MOST USEFUL RESULT: three mutations that SHOULD miss

**Final: 8 caught, 0 missed, 0 skipped, tree restored and green.** Getting there
took three runs, and the first two are the interesting part.

The first full run scored **4 caught, 4 missed** — and three of the four misses
were the design working, not a hole.

`effectivePrice()` is deliberately shared by the price table and the markup. So a
mutation that changes *that function* moves **both sides at once**: the table
renders the list price, the markup states the list price, and they agree
perfectly. The guard stays green and is right to.

⛔ **One source of truth makes drift impossible AND makes drift-tests
vacuous.** The same held for the breadcrumb, where the visible trail and the
BreadcrumbList read the same label map.

Two consequences, both now in the code:

1. **Mutate the LINK, not the shared function.** The realistic regression is
   somebody "simplifying" the schema builder — reading the raw column, or
   forgetting to pass the live discount through. Those break the link and are
   caught immediately.
2. **Add coverage floors for what consistency cannot see.** A shared-source bug
   is invisible to a comparison, so the guard counts instead:
   - **`MIN_FREE_ROWS`** — pricing every Free row at $99 changes both sides
     identically. Nothing disagrees; the entire category simply vanishes.
   - **a discounted cell may not render the same figure twice** — a discount that
     computes to the list price shows struck-through $30 beside $30, in the table
     *and* in the markup. Caught on `fernando-rodriguez-dds` at `30/30`.

⛔ **A mutation that does not COMPILE is scored SKIP, never CAUGHT.** The
first attempt at the link-break used an object literal missing the optional
fields, so it failed typecheck — a red build is not a guard result. It was
rewritten until it compiled.

### ⛔ Two mutations are recorded as unprovable, not dressed up as a pass


**The seeded rating no longer exists.** Taking `aggregateRating` from the
`avg_rating` column produced no violation at all, because measured on the built
artifact **zero of 104 pages render a star row** — the column is null on every
provider. That retires a standing "60 providers carry a seeded avg_rating" item
that was still on the books. The gate stays, with a tripwire that fires the day
one is backfilled.

**Inventing an Offer for a `null` price** changes nothing observable today: measured
on this build, **312 of 312 rendered rows carry a price and zero render a quote
link**, so there is no null for the mutation to invent. The `null` branch stays
because it is real in the schema and one unpriced row makes it load-bearing
again — and the harness **fails if it ever becomes provable**, because that means
this note has gone stale.

## Coverage today

| | |
|---|---|
| provider pages with JSON-LD | **104** |
| `Offer` nodes emitted | **312** |
| pages with real coordinates | **104** |
| pages with a description | **104** |
| pages with `aggregateRating` | **28** (of 104 — the rest have no reviews) |
| discounted cells | 5, across 3 pages |
| `Free` rows | 11 |

Types: `Dentist` 32 · `Pharmacy` 17 · `DaySpa` 16 · `Optician` 15 ·
`MedicalClinic` 12 · `Physician` 10 · `VeterinaryCare` 2.

## Known gaps, recorded not fixed

- ⚠️ **`liquor` has zero providers.** It is in the nav and the sitemap and has
  no listings, so `LiquorStore` never renders. One of the empty pages.
- ⚠️ **63 of 104 providers have no prices at all** — 61%. That is the moat's
  real limit, and it is a data problem, not a markup one. Firecrawl (4,722
  credits) against each clinic's own site is the documented route.
- ⚠️ **Duplicate procedure rows carry no distinguishing note.** Benavides shows
  five identical *"Anti-Parasitic (Ivermectin)"* lines at $6/$10/$12/$17/$59 with
  an empty `price_notes` on every one. The markup is correct — five Offers, five
  real prices — but a reader cannot tell which is which. Needs pack sizes in
  `price_notes`.
- ⚠️ **Nothing on category pages, the homepage or the blog.** `ItemList` on the
  eight category pages and `Article` on the ten blog posts are the obvious next
  step; the blog is the only thing on this site already ranking page one.
