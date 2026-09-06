# ClearCross Progreso — Project STATE (single source of truth)

> Authoritative current state. This OVERRIDES older scattered notes.
> Bump "Last verified" when things change. Keep it tight (~150 lines).

## 🔎 2026-09-06 (later) — 354 URLS AND NOT ONE TARGETED THE QUERY PEOPLE ACTUALLY TYPE

Mario: *"forget about latonya, that is gone, lets concentrate on whats next to make sure this
directory has the best odds of success for us."*

### 🔴 THE GAP, MEASURED AGAINST THE LIVE SITEMAP AND AGAINST PAGE ONE

The site published **354 URLs** in three shapes and **no procedure layer at all**:

| shape | count | what it targets |
|---|---|---|
| provider page | 126 ×2 langs | a **brand** — *"Dental Artistry Nuevo Progreso"*, which nobody searches unless they already know the clinic |
| category page | 8 | one broad head term |
| blog post | 10 | editorial |
| **procedure × location** | **0** | ⬅ the high-intent middle: *"dental implants nuevo progreso cost"* |

⛔ **THAT IS NOT A GUESS ABOUT HOW THIS MARKET RANKS.** Every page-one result for the money
query is a procedure × location page and **not one is a clinic profile**:
`whatclinic.com/dentists/mexico/nuevo-progreso/all-on-4-dental-implants` ·
`placidway.com/search-medical-pricings/dental-implants+dentistry/nuevo-progreso+mexico` ·
`medicaltourismco.com/all-on-4-dental-implants-in-nuevo-progreso/` ·
`mexicodental.co/nuevo-progreso-dentist-prices/`.

⭐ **And every one of them publishes a RANGE** — *"$800 to $1,200"*, *"around $7,160"*. We hold
**316 per-clinic figures**. The comparison IS the moat, and the page whose whole job is to show
it did not exist. ⚠️ PlacidWay already ranks a page for **Dental Artistry's** own All-on-6
package — a clinic in our directory. The aggregators are monetising our clinics while we sit
out the query.

### `/prices/<procedure>` — 31 procedures, both languages

`lib/procedure-pages.ts` (pure) · `lib/data.ts` (mock + Supabase, one builder) ·
`app/prices/[procedure]` + `app/es/prices/[procedure]` · `lib/i18n/procedure-label.ts`.

Measured on the live DB: **31 procedures clear 3 clinics** (17 · 17 · 16 · 16 · 15 · 15 at the
top), so **62 new URLs**. Local build **273 → 323 pages** on mock.

- ⛔ **`MIN_CLINICS_FOR_PRICE_PAGE = 3`, DERIVED NOT PICKED.** One clinic is not a comparison,
  it is a provider page with a worse title, and shipping dozens buries the ones with depth.
  2 adds only thin pages; 5 would discard eye-exam, e-max crown and lumineer. **Do not lower
  it to make the page count bigger — the count is not the product.**
- ⛔ **`/prices/` IS A STATIC SEGMENT ON PURPOSE.** `app/[category]/[provider]` owns every
  two-segment path, so a procedure there would be indistinguishable from a clinic slug. ⛔ No
  category may ever use the slug `prices` — guarded.
- ⛔ **THE SPANISH PATH IS `/es/prices/`, NOT `/es/precios/`.** Every route on this site mirrors
  its English path and `lib/hreflang.ts` DERIVES the Spanish URL from the English one. A
  translated segment would be the one route the pair cannot derive, and a non-reciprocal
  hreflang annotation is discarded wholesale.
- ⛔ **A null price is dropped; a zero is kept.** Null in a price table reads as free; zero is a
  real deliberate value (free consultations) that `lib/pricing.ts` already renders as "Free".
- ⛔ **No benchmark means SILENCE, never a 0% badge** — "Save 0%" asserts we ran the comparison
  and found nothing, which is a different claim from having no US figure.
- ⛔ **Ties break on NAME.** PostgREST guarantees no order, so an unsorted tie reshuffles the
  table between builds and reads to a crawler as a page that keeps changing.
- ⛔ **The disclosure is `priceSourceNote`, REUSED VERBATIM.** A gentler second sentence is how
  the site ends up making two different claims about one number.
- ⛔ **The category page carries the only internal path to these pages.** Sitemap gets a URL
  discovered; an internal link is what makes it worth ranking. Without the strip they are
  orphans that render perfectly and collect nothing.
- ⚠️ **NO JSON-LD, deliberately.** `test/schema.mjs` walks the eight category directories only,
  so markup here would be the one structured-data surface nobody guards — and this repo has
  already shipped a policy violation of exactly that shape. Ship it with its own guard.

### 🔴 A build warning that had been crying wolf on four routes

`export { revalidate } from '...'` made Next warn on **every build**: *"can't recognize the
exported `revalidate` field … The default config will be used instead."*

⛔ **AND I WROTE THE OBVIOUS DIAGNOSIS INTO THREE SOURCE FILES BEFORE MEASURING IT.** I claimed
the Spanish tree had been build-time-only. **False** — the route table printed `1h` for those
routes *before* the change as well as after. The comments were corrected in place; what the
declared form actually buys is a build that stops emitting four warnings nobody can act on.

### Verified

`REAL_VERIFY_EXIT=0`, 0 FAIL · schema **1811/0** · new `verify:procedures` **31 checks** ·
`procedures:mutate` **16 caught / 0 missed / 0 skipped**, tree restored byte-for-byte ·
`tsc --noEmit` clean · 0 control bytes · EOL preserved on every file.

**Driven in a real browser**, EN and ES: `/prices/dental-implant` renders **17 clinics cheapest
first**, $790 against a $3,500 US average, **Save up to 77%**, 17 clinic links, 10 tel: links,
the disclosure, 9 sibling links. `/es/...` is **fully Spanish** — H1 *"Precios de implantes
dentales en Nuevo Progreso"*, "Llamar", "Ver esta clínica", Spanish disclosure. At **390px:
0 overflow, 0 spilling elements**, all 17 rows.
**Controls**: `tummy-tuck` (1 clinic) **404s**, nonsense **404s**, `/dentists` still 200, and
the sitemap's 50 procedure URLs match the built pages **exactly, both directions**.

⛔ **MY OWN PROBE REPORTED THE HREFLANG MISSING ON A CORRECT PAGE.** Next emits `hrefLang`
(camelCase); a lowercase regex found nothing. **The control settled it in one call** — the
existing `/dentists` page reads identically. ⛔ And my first guard run FAILED on a correct file
because the only `export { revalidate }` left in it is inside the comment explaining why the
re-export was removed — *a guard that accuses its own explanation gets "fixed" by deleting the
explanation.* Comments are stripped now.

⚠️ **Recorded, not invented:** `price_notes` is a database column and stays English on the
Spanish page (*"From $800"*), same class as provider names. `procedureLabel` covers the 31
procedures that have pages and **falls back to the English database name** — a typo there is
silent, so it is checked against the real slugs.

⏭️ **Next, in order:** JSON-LD with its own guard · the 72 phone-but-no-price clinics (the call
sheet) — every price collected turns a thin page into a comparison · **Vets is a dead category**
(4 listings, **0 procedures defined**, so its pages can never carry a price) · 18 of 83
procedures have zero priced clinics.

## 📈 2026-09-06 (later) — MEASUREMENT IS ON, AND THE OBVIOUS VERIFICATION METHOD WOULD HAVE FAILED

The two items this file has listed as "blocked on Mario" for days are done. Both values were
captured by a browser agent under **marioelizondo81@gmail.com** — the only correct account.

| what | value |
|---|---|
| GA4 account | **Antigravity Digital** — `407054990` (new; no client account touched) |
| GA4 property | **ClearCross Progreso** — `552956750` |
| GA4 measurement ID | `G-XHFPHCHFJK` → `NEXT_PUBLIC_GA_ID`, **production only** |
| Search Console token | `p2ipu20Ael70qOXt26AwE7A-VVCfp3Yet2JhcBWKRTc` → `GOOGLE_SITE_VERIFICATION`, **production only** |

⛛ **THE BRIEF NAMED THE WRONG GOOGLE ACCOUNT AND THE AGENT CAUGHT IT.** It said
`hssolutions2181@gmail.com` — the session/app-login identity (Mission Control, Cloudflare,
Resend). **Every Google property this business owns lives under `marioelizondo81@gmail.com`**,
`google_oauth_tokens` holds exactly one row (`mario_personal` = that account) with **no
fallback**, and `gsc_pull.py` auths as the siteOwner of all properties. A property created
under the other identity would be **invisible to every automated pull we have**.

⛛ **DO NOT VERIFY SEARCH CONSOLE VIA GOOGLE ANALYTICS — measured, not assumed.** It is the
tempting route (the GA tag is already live, so it verifies with zero deploys). But
`components/analytics/GoogleAnalytics.tsx` uses `next/script` with `strategy="afterInteractive"`,
and the served HTML carries only a **`<link rel="preload" as="script">`** for
`googletagmanager.com/gtag/js` — the real `<script>` and the whole `ga4-init` inline block are
**absent from server HTML** (`ga4-init` index = **-1**) and injected client-side after
hydration. Google's verifier reads raw HTML. ⇒ it would look for a tag that is not there.

⛛ **The HTML FILE method is also refused, for a different reason**: it needs
`google166d6ee3b3902bd6.html` (53 bytes) committed into `public/` — a code change, a push, a
production deploy, and a permanently odd file in the repo, to buy nothing.

✅ **HTML TAG is the route.** `app/layout.tsx:54-56` already gates `metadata.verification.google`
on `GOOGLE_SITE_VERIFICATION`, and the Next Metadata API guarantees it lands in `<head>`. One
env var + a redeploy of the same commit — no code change, nothing to commit.

⛛ **Both env vars are production-only on purpose.** On preview, our own testing would land in
the live GA4 property and pollute the numbers the go-to-market decision is made on.
⛛ **The redeploy is not optional** — Vercel snapshots env at build time.

🟢 **PROVEN END TO END, each reading with a control** (bogus env id → 404; fake measurement
ID `G-ZZZZZZZZZZ` → 0 hits; nonsense host → 0 requests):
- Tag renders on `/` **and** `/es`; `gtag` is a **function**; script loaded with the right ID
- **A real `/g/collect` hit reached Google** — present, not merely queued
- **A simulated phone tap fired `contact_phone` and transmitted it** (2 collect hits total).
  ⭐ That is the number `docs/GO_TO_MARKET.md` says the entire revenue plan rests on.

⛛ **TWO OF MY OWN INSTRUMENTS REPORTED NOTHING ON A WORKING SITE.** Chrome's network reader
captured **4 requests, all extension chunks** — not even the page's own HTML — so its "no GA
hits" was the instrument, not the product. Had I trusted it I would have reported Analytics
dead while it worked perfectly. `performance.getEntriesByType('resource')` saw **31** and told
the truth. ⚠️ It also **blocks any return value containing a query string**, so read counts,
never URLs.

⚠️ **One synthetic `contact_phone` was fired into the live property on day zero.** It was me,
not a customer.

⚠️ **Flagged, not touched:** `SUPABASE_SERVICE_ROLE_KEY` is on **preview and development** as
well as production — a second door into the live database that nothing watches.

⏭️ **The numeric property ID `552956750` is the thing that unblocks Mission Control's GA4
pull** (`ga4_audits` has 1 row ever). It is recorded here so nobody has to log in and find it.

## ⭐ 2026-09-06 — THE FABRICATED RATINGS ARE GONE, AND THE STRATEGY IS SETTLED: PHONE-FIRST DIRECTORY

Mario: *"push and deploy everything and remove any fake ratings"* + *"should we leave it
open so people can start using it and we can get users on it, and then as soon as we hit a
certain milestone we turn on the profit?"* Both answered. **The strategic answer is YES, and
the evidence is stronger than the instinct** — see `docs/GO_TO_MARKET.md`.

### 🔴 53 LIVE PAGES SHOWED A STAR RATING BUILT FROM ZERO REVIEWS

`clearcross_reviews` held **0 rows** while **60 providers carried an `avg_rating`** and 54 a
`review_count` — seeded placeholder data rendering as ours on real, named Mexican clinics, on
a health directory. Dental Artistry read **"4.6 out of 5 · 98 reviews"** at the top of its page
and **"No reviews yet"** further down: the page contradicted itself. Same class as the RGV Reef
fabricated donor testimonials.
- ✅ **All 152 rows nulled** (`avg_rating: null`, `review_count: 0`), **proven by re-reading**
  — 0 with a rating, 0 with a count, control confirms all 152 providers still exist.
  Backup: `~/clearcross-ratings-backup-2026-09-06.json` (152 rows), so it is reversible.
- ⛔ **The JSON-LD was already clean** — 0 `aggregateRating`, 0 `ratingValue` on the live page,
  because the 09-01 fix gated schema on RENDERED reviews rather than the seeded column. Only
  the visible UI was lying. **Do not "fix" schema again; it was right.**
- ⛔ **Every render site is guarded by `{avg_rating && …}`**, so nulling degrades cleanly — but
  the sort dropdown did NOT degrade: "Highest Rating" was the **default** and "Most Reviewed"
  its neighbour, so nulling the data alone would have shipped two dead controls and an
  arbitrary default order. Both options removed, default → **`price-low`**.
  ⭐ That is the better default anyway: `price-low` sinks unpriced providers to the bottom, so
  the **42 priced providers — the actual moat — surface first**, and being unpriced becomes a
  reason for a clinic to give us prices.
  ⛔ The switch cases are deliberately KEPT: restore the two options the day real reviews exist.

### 🔴 I REPORTED THE ONE REAL LEAD AS DELETED. IT IS NOT. THE ANON KEY LIED.

I read the database with a key grepped out of the vault, got **`quote_requests: 0`**, and told
Mario the site's only real lead had been deleted since 09-04. **Wrong.** The key decoded to
`role: anon`, and `clearcross_quote_requests` is admin-only — so RLS returned an empty array
with **HTTP 200**, identical to a genuinely empty table.
⛔ **MY CONTROLS DID NOT DISCRIMINATE FOR THAT TABLE.** A bogus table errored and
`clearcross_providers` returned rows — but providers has a **public read policy** and quotes
does not, so the control proved only that the key worked on the tables that need no privilege.
⇒ **a control must exercise the same permission class as the thing it is vouching for.**
⛔ The same key made every WRITE return `[]` with 200 — a blocked update and a matched-nothing
update are indistinguishable. Decode the JWT (`role` claim) before trusting a read OR a write.
✅ Re-read with `role: service_role`: **1 quote request, `status: pending`, `responded_at: null`.**
**LaTonya Glaze · glazegyrl@gmail.com · 281-772-1926 · "Extraction of broken teeth and all on
6 full mouth" · Dental Artistry (956-742-8735) · submitted 2026-08-30.** Seven days unanswered.

### ⛔ THE STRATEGY: PHONE-FIRST DIRECTORY, AND THE QUOTE FORM IS THE THING THAT IS BROKEN

The quote form promises a price **from the clinic**. **No clinic has signed anything**, so a
submission today enters a queue nobody reads — which is exactly what happened to LaTonya. That
is worse than no form: it is a promise we cannot keep, on a health decision.
Meanwhile **110 of 152 providers carry a phone number** and that path converts today with zero
dependencies. ⇒ lead with the phone, keep the form as a **concierge** WE answer by hand.
⛔ **The flat listing / featured fee needs no attorney; the per-patient commission does**
(Texas Patient Solicitation Act). So the sequencing is traffic → flat fee → *maybe* commission
with counsel — not "wait for a lawyer before getting users".
⭐ **The tracked tel: click IS the inventory we sell.** Without it we have nothing to show a
clinic. That makes analytics a revenue dependency, not housekeeping.

### ⛔ CALL IS THE PRIMARY CTA NOW — AND THE MOBILE BAR IT LIVES IN WAS INVISIBLE

Mario: *"yes please"* to flipping the hierarchy. The provider page said **"Get a Quote" 8
times and "Call" once**, and the phone was not a button at all — just a text link in the
metadata row. Now: **Call solid primary**, WhatsApp green, Website + Get a Quote outlined.
`ProviderCard` flipped too (View Profile → primary, Get Quote → outline) because the card is
the highest-traffic surface and its PRIMARY action was the broken promise.

🔴 **AND THE STICKY MOBILE BAR HAD NO CALL BUTTON AT ALL** — on the one surface where a
phone visitor converts, for a directory whose only working path is the telephone. It also
hardcoded **"Chat" and "Get Quote" in English**, so they rendered untranslated on `/es`.
New `ui.pCall` / `ui.pChat`; the bar reads `Llamar | Chatear | Pedir cotización` in Spanish.

🔴 **THE BAR WAS 78% COVERED BY THE SITE'S OWN MOBILE DOCK, AND HAD BEEN ALL ALONG.**
`MobileBottomNav` is `md:hidden fixed bottom-4 z-[80]` and 121px tall; the CTA bar is
`z-40 bottom-0` and 73px. Measured at 390px: **57 of 73px covered — every button in it,
including the one I had just added, sat behind the dock.** Pre-existing, invisible to every
guard. Fixed with `bottom-[145px] md:bottom-0` (dock top 708, bar 626-699 ⇒ **0px overlap**),
and the name is hidden below `sm` because three buttons left ~80px, truncating a provider to
**"Alph…"**. ⚠️ 145 is tied to the dock's CONTENT height — the proper fix is a shared
`--dock-h`, which the house mobile-shell template has and this project does not.

⛔ **I ALMOST SHIPPED 101px OF HORIZONTAL OVERFLOW, and only a control caught it.** The action
stack is `flex-row` until `lg`, so four buttons on a phone ran off the document. The control
is what made it actionable rather than alarming: **as shipped 114px · remove Call 13px · hide
stack −15px** ⇒ I added 101, and **13px was already broken with three buttons**. `flex-wrap`
fixes both, measured −15px at 360 and 390, desktop column untouched.

⛔ **`lib/mock-data.ts` still carried all 60 fabricated ratings** — so a deploy that ever lost
its Supabase env would fall back to mock and put the fake stars straight back. Nulled there
too (60 ratings, 104 counts), verified on a real local render.

⭐ **The bilingual guard earned its keep**: it failed the build on `pChat: 'Chat'` being
identical in both dictionaries — *"every ui string is actually translated"*. Fixed the
translation (`Chatear`) rather than adding an exception.

### Verified

`npm run verify` **REAL_VERIFY_EXIT=0** on every iteration, 1811 schema checks, both mutation
harnesses green, `next build` clean. Measured in a real browser via a same-origin iframe (the
documented workaround — `resize_window` reports success without resizing) at **360 / 390 /
768 / 1024 / 1440, EN and ES**: 0 document overflow, 0 bar-vs-dock overlap, Call primary in
both stacks, and at 768 the bar correctly returns to `bottom-0` because the dock is hidden.
CRLF preserved on every CRLF file, LF on the LF one, 0 control bytes.

## 🏥 2026-09-05 (later still ×2) — 48 MORE BUSINESSES, AND THE PRICE ROUTE WAS RE-MEASURED AND THE OLD ANSWER WAS WRONG

Mario: *"please perform both, add the extra businesses and gett the pricing for the ones
that we find."* Both done. **104 → 152 providers, 78 → 126 visible.** 4 real prices added.
`REAL_VERIFY_EXIT=0`; new `test/places-discover.mjs` **72 checks**; harness
`test/_mutate_places_discover.mjs` **22 caught / 0 missed / 0 skipped**, tree restored.

| | before | after |
|---|---|---|
| providers | 104 (78 visible) | **152 (126 visible)** |
| dentists · spas · doctors | 30 · 8 · 4 | **50 · 19 · 12** |
| pharmacies · optometrists · vets | 16 · 8 · 2 | **22 · 9 · 4** |
| price rows / providers priced | 312 / 41 | **316 / 42** |

### ⛔ THE DISCOVERY GATE IS places-match POINTED THE OTHER WAY

`tools/verify/places-discover.mjs` + `run-places-discover.mjs`. Every gate is a REFUSAL —
operational · locality (address AND coordinate, reused verbatim) · category · name quality ·
not already ours. A strong name match against something we list is a **reason to refuse**.
⛔ 20 searches, 154 distinct places harvested, **106 refused**: every bar, taquería, OXXO,
shopping mall and lounge on the strip, correctly.

### 🔴 FOUR REAL BUGS, EVERY ONE FOUND BY RUNNING IT

1. **The first dry run proposed adding `Dental Artistry` — a live provider, and the one
   holding this site's ONLY real lead.** `nameScore` is directional BY DESIGN (places-match
   asks whether OUR name appears in THEIRS, because when *verifying* a row Google carries the
   longer name). **Discovery reverses which side is longer**: ours is the compound
   `Dental Artistry / World Dental Center`, theirs is `Dental Artistry`. Measured — forward
   **0.333**, reverse **1.000**, similarity 0.421. At 0.6 the forward score alone MISSES it.
   Now scored both ways. ⛔ The cost is accepted and printed: `Farmacia Rodriguez` scores
   1.000 against our dentist `Fernando Rodriguez DDS` and is refused though they are
   different businesses. A refusal is recoverable; duplicating a live provider on a unique
   slug is not.
2. **Google types real opticians `store` and real clinics `health`.** A name fallback fires
   ONLY when every type is generic; a real type (`bar`, `restaurant`) is never overturned by
   a word on a sign. ⛔ Two specific signals = refused, not guessed — `Dental Farmacia Texas`
   and `Farmacia Texas - Consultorio Dental` are both real listings here.
3. **`service` was missing from the generic set and blocked the whole fallback**, keeping
   four opticians and a dental clinic refused. I built that set from the runner's PRINTED
   summary, which truncates the types array. **Read the whole value, not the summary** —
   same family as never setting a threshold from a rounded report.
4. **The name rules ran on the RAW name while Google returns `Odontológicas`, `Óptica`,
   `Médico`, `Estética`.** `/\bodontolog/` cannot match `Odontológ`. My fixtures were
   accent-free, so they passed while the live run kept filing a dental clinic under Doctors.
   Now normalised. ⛔ **Accents are the real data, not an edge case.**

⛔ **AND THE GUARD CAUGHT MY OWN FIX BEING UNREACHABLE.** The general-type-yields-to-name
rule sat after an early `return` in the primaryType branch — and every place it was written
for carries `primaryType: doctor`. Nothing about the output looked wrong.

⛔ **THE HARNESS FOUND FOUR VACUOUS CHECKS AND TWO VACUOUS MUTANTS**, which is its whole
value. Two mutants changed nothing observable (swapping two TYPE_ORDER entries that both map
to `doctors`; reordering NAME_RULES when a `filter` does the work). Two checks could not
fail: nothing exercised the coordinate gate (all three locality rows are refused on their
ADDRESS alone), and no control made a specific type and a name actually disagree.
⛔ Specificity is **defence in depth** — order and filter are redundant, each alone suffices —
so the harness gained multi-edit mutations and breaks the pair. That is also the realistic
mistake: the tidy-up that deletes "the redundant check" twice.

### 🔴 THE PRICE ROUTE: THE PREVIOUS CONCLUSION IS CORRECTED

`STATE.md` recorded, from a 9-site sample, *"There is no automated route to the missing 37
price lists."* Re-measured across **19 sites** now that Places has filled in more websites:
**16 answered, 7 carried a `$` amount.** So the route exists. **But reading the words around
those numbers, only ONE was a real price list:**

- **Aury Dental** — an unfinished template still carrying the theme's demo content:
  *"Flight London to Bratislava - $55"*, *"4 to 5 nights in Hungary"*, *"innovate
  open-source infrastructures via inexpensive materials"*.
- **ALMITAS SPA** and **Erika's Salon Spa** — **Fresha's OWN SaaS pricing** ($19.95/month per
  team member, 2.79% + $0.20 per transaction, terminals from $139). The booking host's
  footer, not the salon's services. ⛔ `fresha.com` is deliberately NOT in `NOT_THEIR_SITE`
  (4 providers run their diary there) — correct for the WEBSITE field, and exactly why price
  harvesting needs its own judgement.
- **Similares** — `$ 0.00`, an empty shopping cart. **Dr. De Leon Cantu** — a bundled
  consultation package, not a listed procedure.

⇒ **three of seven would have published another company's subscription fees or Hungarian
dental-tourism demo content as Nuevo Progreso medical prices**, and none of it is detectable
from the number. `tools/verify/price-harvest.mjs` **measures and never writes**, and prints
the surrounding words because they are the only thing that makes a number attributable.

⛔ **EVEN THE GOOD SITE COULD NOT BE READ FROM FLATTENED TEXT.** It renders as
*"…Empezando desde $3,000 USD Tummy Tuck Empezando desde $2,990 USD Implantes de Seno…"* —
which reads equally well as the price coming BEFORE or AFTER its label. Two plausible
readings, one position apart, on a $3,000 operation. Resolved from the **markup**, where each
price and its label sit in links sharing one `href`, then **confirmed on each procedure's own
page**. Two independent corroborations per price.

**4 prices added** (`tools/verify/apply-published-prices.mjs`, decisions in the file,
idempotent by provider+procedure): Tummy Tuck $3,000 · Breast Augmentation $2,990 · Facelift
$5,000 · Mommy Makeover $5,800, all for State of Art Medical Center.
⛔ **Refused and recorded so nobody re-derives it:** Liposucción carries FOUR different
published prices across two of the clinic's own pages — the clinic itself lists more than one.
Mastopexia $4,500, Bichectomía $400, Rinoplastia $2,800 and Blefaroplastia $1,200 are real
and unambiguous with **no matching procedure**; inventing a procedure row to hold a price is
how a category's vocabulary stops meaning anything. ⛔ Every note says **"starting price"**,
because the clinic writes *"Empezando desde"* and publishing a from-price as the price is the
most misleading thing this table can do.

### Verified live, each reading with a control (a nonsense slug 404s)

- New provider pages render **now** — `dynamicParams` serves them on demand.
- **All 4 prices live** on State of Art with the starting-price note AND the US comparison,
  and **liposuction correctly absent**. The new providers carry **no star rating**.
- **0 existing rows modified, 0 duplicate slugs, 0 invented ratings, 0 invented descriptions**
  — proven by snapshotting all 104 rows before and diffing after.

### ⚠️ Three things found on the way, none of them asked for

1. 🔴 **`avg_rating` IS SET ON 60 PROVIDERS AND THE LIVE PAGE RENDERS IT.**
   `STATE.md` records this as *"measured off the built artifact: ZERO of 104 pages render a
   star row, so avg_rating is null on every provider"*. **That is false.**
   `/dentists/dental-artistry` shows **"4.6 out of 5 · 98 reviews"** at the top and
   **"No reviews yet"** further down — seeded mock ratings presented as ours, on a page
   contradicting itself. **Pre-existing, NOT fixed** — changing 60 providers' displayed
   ratings on a live health directory is a product decision. My new rows carry none.
2. ⚠️ **The local gate's build+schema half tests MOCK DATA, not the directory.** There is no
   `.env.local`, so `shouldUseMock()` is true and `npm run build` generates 273 pages from
   `lib/mock-data.ts` regardless of the database. Production builds from the real DB. Worth
   knowing before reading a local page count as evidence about the live site.
3. ⚠️ **The sitemap is static and will not include the 48 new pages until a deploy.** Live it
   is **258 URLs, `Age: 37149`**, no `revalidate`. Category listings DO self-update
   (`revalidate = 3600`; measured `Age: 1292` against that window), so they need nothing —
   but **Google cannot discover the new providers until the site is redeployed.**

## 💲 2026-09-05 (later still) — THE PRICES WERE NOT GIVEN TO US BY THE PROVIDERS, AND THE PAGE SAID THEY WERE

Continuing the same session. `npm run verify` **REAL_VERIFY_EXIT=0**, `tsc` clean —
honest-claims **PASS (22 live claims caught, 15 honest sentences left alone)**,
`_mutate_honest_pages` **14 caught / 0 missed / 0 skipped**, `_mutate_places_write`
**16 caught / 0 missed / 0 skipped**, schema 1811, 273 pages.

### 🔴 THE PRICE-HARVEST PLAN IS DISPROVEN, AND THAT IS THE MOST USEFUL THING HERE

`STATE.md` proposes *"Firecrawl against each clinic's own site is the route"* to the 37
missing price lists. **Measured, and it does not work.** Nine provider websites probed:

| | |
|---|---|
| returned 200 | 9 |
| **published any price** | **1** (a single `$400`) |
| used the word price / precio / cost | **0** |
| were JS shells (i.e. the fetch missed content) | **0** |

⛔ **Followed the price/service subpages too** — `mustredentalclinic.com/services.html`
returns 4,901 chars and **zero** prices; 3 of 5 have no such link at all. So this is a
measured no, not a blind zero.

⛔ **The March 2026 research had already found the same thing and written it down.**
`lib/mock-data.ts:660` — *"Official website available but no public price list posted."*
And `mock-data.ts:2` records the real source: *"official clinic websites, WhatClinic,
DentalMexico, PlacidWay, ClinicBooking, Dental Departures"* — **three of which are the
medical-tourism aggregators this site competes with for head terms.**

⇒ **There is no automated route to the missing 37 price lists.**
⛔ **CORRECTED 2026-09-05 (later still ×2) — THIS WAS DRAWN FROM A 9-SITE SAMPLE AND IS
TOO STRONG.** Re-measured across 19 sites once Places had filled in more websites: 16
answered and **7 carried a `$` amount**, so a route does exist. It is simply a very poor
one -- reading the context, three of those seven were another company’s SaaS pricing or a
template’s Hungarian demo content, and only ONE was a real price list. See the newest entry. The 312 we have were
hand-researched. The options are manual research, or a signed provider maintaining their
own — which is what "sign one dentist" actually unlocks. ⚠️ 12 of the 37 have a website;
25 have neither a site nor prices.

### 🔴 AND THE PAGE MADE A CLAIM THAT FOLLOWS FROM IT

On every priced provider page, in both languages:

> **"These are the prices the provider gave ClearCross."**

⛔ **No provider has given ClearCross anything.** None has signed; there is one quote
request in the whole history of the database and it is still unanswered. For an unknown
share of the 312 line items the number came from a competitor's directory. The sentence
describes a supply relationship that does not exist, on a page naming a real business and
quoting a figure a patient will act on. `savingsProvenance` said the same thing.

⛔ **THIS REVERSES A DOCUMENTED PRIOR JUDGEMENT AND IT IS FLAGGED RATHER THAN QUIET.**
That exact sentence sat in `CLAIM_QUIET` as honest copy, and the `by-us` rule's own
comment asserted *"A provider gave us a number."* The prior call predates the evidence
above. Both now say where the number came from — which is also the more useful sentence
for the reader. New rule `provider-supplied`, **RED-proven: 3 failures** against the
wording that was live an hour earlier, naming the file and the sentence.

⛔ **The guard had a PRESERVATION CHECK ASSERTING THE FALSE SENTENCE**
(`en: /prices? the provider gave ClearCross/i`). It is **rewritten to assert the true one,
not deleted** — the property is real: the price table must still say where the figure came
from, in both languages, and the component must still render the key.

### 🔴 THE HARNESS THEN CAUGHT MY OWN FIX CREATING A BLIND SPOT

`honest-claims.mjs:60` reads `if ((rule.denial || DENIAL).test(s)) continue` — a rule with
no denial of its own inherits the **global** negation pattern. My first replacement read
*"...they were not supplied or confirmed by the clinic, and they can change"* as one long
sentence, which made that sentence a **safe harbour**: any claim written into it is
invisible to every denial-less rule. The `materials` mutation went **13 caught / 1 MISSED**
the moment its anchor was repaired; the guard on its own reported the tree clean.

Fixed at both ends — the negation now sits in a short sentence of its own, and `materials`
carries a targeted denial. ⚠️ **The other denial-less rules have the same exposure**; this
is the one that was demonstrated, so it is the one that was fixed rather than a speculative
rewrite of every rule.

⛔ **And the SKIP is why this was noticed at all.** Rewriting the copy moved a harness
anchor (`Ask` → `ask`, mid-clause), and the harness reported *"anchor matched 0 times,
mutation NOT applied — proves nothing"* rather than scoring a catch it never made.

### Also this round
- `dentaldepartures.com`, `medicaltourismco.com`, `placidway.com`, `bookimed.com`,
  `medigence.com` added to the website refusal list — **3 providers already hold a
  dentaldepartures link and 2 hold whatclinic**, curated before the filter existed, so
  `coalesce` correctly leaves them alone. That is a **data** decision, not something the
  rule can undo. ⛔ `fresha.com` is deliberately NOT refused: 4 providers run their own
  booking diary on it, and it is not a directory of their rivals.
- ⚠️ **All 312 prices carry `updated_at = 2026-07-14`** (the seed date) and the page shows
  no date at all. The research is dated March 2026 in `mock-data.ts`. Putting a six-month-old
  date on every price is a commercial call, not a code fix — **flagged, not taken**.

## 📞 2026-09-05 (later) — THE HARVESTER WOULD HAVE ERASED CURATED HOURS, AND IT WAS ABOUT TO POINT PATIENTS AT TWO COMPETITORS

Mario: *"having the right prices and services for each business from what they have
on google is key to making our site a real gem."*

⛔ **ONE HONEST CORRECTION FIRST, BECAUSE IT SETS THE PLAN.** Google publishes no
medical prices and never will. Places gives name, address, **phone, website, hours,
rating, types**. So "prices from Google" is two jobs: Places supplies the **website**,
and the website is where the clinic publishes its own prices. Places is the INPUT to
prices, not the source.

`npm run verify` **REAL_VERIFY_EXIT=0** — places-match **33**, new places-write **18**,
schema 1811, 273 pages. Harness `test/_mutate_places_write.mjs` **15 caught / 0 missed /
0 skipped**, tree restored and re-verified.

### 🔴 THE WRITE PATH HAD NO GUARD AT ALL, AND TWO OF ITS THREE RULES WERE WRONG

`test/places-match.mjs` guards WHICH provider a Places result may touch. **Nothing
guarded WHAT it then writes** — onto rows curated by hand from the clinics' own
material. Of the three columns:

| | rule | state |
|---|---|---|
| `phone` | coalesce | correct |
| `hours` | **bare assignment** | 🔴 **erases ours whenever Google is quiet** |
| `website` | — | 🔴 **never written; the field was never even requested** |

⛔ **The hours defect fires on exactly the run this session was about to do.**
`hours = ${hours}::jsonb` renders the literal `null` when Places returns no opening
hours, so `--apply` would have blanked hours on every matched provider Google happens
not to know — **53 of 78 visible providers hold hours**, on a directory whose job is
telling somebody when a clinic is open. Silent, and invisible on the page until
somebody drove to a closed shop.

✅ **`tools/verify/places-write.mjs`** — the write path extracted as a pure function so
it can be DRIVEN. ⛔ The rule stays expressed in SQL (`coalesce(nullif(col,''), new)`)
rather than a JS conditional: the right-hand side reads the OLD row, so the statement
**cannot** overwrite a curated value even if a future caller asks it to.

🛡️ **`test/places-write.mjs` (18 checks), RED-proven: 5 fail against what shipped**,
and the output names the defect in its own words — *"hours would be set without reading
the old row: hours = null::jsonb"*.

### 🔴 IT WAS ALSO ABOUT TO PUBLISH TWO COMPETITORS' PHONE NUMBERS

The dry run's 30 phone fills included two matches at the 0.60 name floor that are
different businesses on the same strip:

```
Fernando Rodriguez DDS  ->  BRACES Dr. Bernardo Rodriguez DDS-MS   (a different dentist)
Angie's Pharmacy        ->  Angel's Pharmacy                       (a different pharmacy)
```

⛔ **The second one is provable rather than a judgement call**: `Angel's Pharmacy` was
the best match for our `Angel's Pharmacy` at **1.00** AND for our `Angie's Pharmacy` at
**0.60**. One Google place, two of our providers — at most one can be right. That is the
documented failure mode of this API on this strip (`places-match.mjs` opens by recording
six real pharmacies all resolving to Linda Pharmacy), and nothing checked for it.

✅ **`contactConfident` + `contactWritable` + `CONTACT_THRESHOLD`.**
⛔ **The principle: a match good enough to say "this business exists" is not good enough
to say "this is its phone number."** The first shows a listing we already had; the second
sends a patient somewhere. They should not share a threshold. A refused contact write
does **not** refuse the match — the provider still verifies, still shows, still gets its
hours and coordinates.

Two independent refusals, neither covering the other's case:
- **collision** — one place claimed by 2+ providers; the weaker loses, **and a TIE
  refuses both**, because a tie is precisely when we cannot tell which business it is.
- **weak name** — score > 0.60, **or** one name's distinctive tokens contain the other's.

⛔ **The containment arm is load-bearing, not a nicety.** `SMILE MAKEOVERS / Stetic
Implant & Dental Centers` ↔ `Stetic Implant and Dental Centers` also scores 0.60 and is
genuinely the same clinic. A bare threshold raise would have dropped it. A shorter name
contained in the longer is one business written two ways; two names each carrying a word
the other lacks are two businesses.

### 🔴 AND I SET THAT THRESHOLD FROM A ROUNDED REPORT, WHICH IS ITS OWN LESSON

First value was **0.67**, read off the runner's two-decimal output. The true scores are
`0.600000 / 0.666667 / 0.833333 / 0.857143 / 1.000000`, so 0.67 sat just **above** the
second band and refused a correct match — `Nuevo Progreso Veterinary Specialists` ↔
`Nuevo Progreso VetSpecialists`.

⛔ **The refusal message gave it away by contradicting itself**: *"weak name 0.67
(< 0.67)"*. Now **0.63**, inside the measured gap, and the report prints **three**
decimals. ⚠️ The gap is only 0.0667 wide, so this cannot meet the 0.1 separation
`NAME_THRESHOLD` is held to — the guard asserts the bar is strictly inside the gap and
says why it cannot demand more. A mutation for **each end** of the gap is in the harness.

### ✅ APPLIED TO PRODUCTION, AND THE VERIFICATION IS THE DIFF, NOT THE EXIT CODE

Snapshotted all 104 rows before, re-read after:

| | before | after |
|---|---|---|
| phone | 37 | **65** |
| website | 27 | **31** |
| hours | 53 | **53** (the coalesce held) |
| verified | 78 | 78 |

**0 curated values overwritten. 0 erased. 0 visibility changes.** Both refused providers
still hold no phone and are still visible. Of the visible 78, phone coverage went
**32 → 60**.

⛔ `websiteUri` is **free** to request: rating and phone already bill this call at the
top Places SKU tier and it sits below that.

### ⛔ Traps paid for again

- **A shell heredoc ate every double backslash in the new guard**, so `'\\s*='` became
  `'\s*='` — which JavaScript reads as the literal `s*=`. The helper then matched nothing
  and reported the **code** as broken: a specific, plausible, false accusation. Rewritten
  with an editor. ⇒ regex-bearing files are never written through a heredoc.
- **Backticks inside a JS template literal** terminated the SQL string — a trap the
  original file's own comment warns about, walked into anyway.
- **The harness found a real hole**: nothing drove the builder with the gate CLOSED, so
  the gate could be computed perfectly and ignored at the write — *a report that says
  "refused" over a statement that writes is the worst of both, because it looks checked.*
  13 caught / 1 missed → 15 caught / 0 missed.
- **My first RED proof was wrong for the wrong reason** and had to be discarded: the
  guard failed against the FIX too. A guard that fails against both is measuring itself.

⏭️ **Next, and it is what Mario actually asked for: prices and services.** 41 of 78
visible providers publish prices; **31 now hold a website**, which is the route to the
other 37. Google cannot supply a price — the clinic's own page can.

## 🟢 2026-09-05 — THE SPANISH TREE IS SPANISH, AND SEVEN MORE LIVE CLAIMS ARE GONE

Mario: *"continue with the work, push and merge and continue."* Phase 4 of the plan
(Spanish) — and on the way to it, seven claims the site could not substantiate, all
live in production, none of which any guard could see.

✅ **PUSHED + DEPLOYED.** `main` **`322b694`** then **`40c5950`**, both sha-verified
against GitHub with `git ls-remote` and by reading the fixes back **out of the pushed
blobs**, not off the push output. ⛔ A push to `main` IS a production deploy.
`npm run verify` **REAL_VERIFY_EXIT=0** before each — 8 guards, 273 pages, schema
**1811/0**, mutation harness **14 caught / 0 missed / 0 skipped**.

### 🔴 SEVEN CLAIMS, AND THE GUARD SCANNED SIX FILES

`test/honest-claims.mjs` was already 383 lines of careful work. It missed all seven,
and the reason is structural rather than sloppy: **sections 1-5 scan a HAND-WRITTEN
LIST OF SIX FILES**, and its rules are literals for the four claims that were live in
August. What was found:

| where | what it said |
|---|---|
| `PriceTable` (every priced provider page, both languages) | *"All procedures at &lt;provider&gt; are performed by **licensed professionals** using the **same quality materials**."* — inches below the page's own *"we have not checked professional licences"* |
| `SavingsBanner` (every category page) | *"All procedures by licensed professionals."* |
| `SearchResultsClient` (every search) | *"Prices **verified by ClearCross**."* Nobody verifies a price; a provider gives us a number |
| homepage `trustBar` | *"**Credentials Verified** / By our team, on-site"* |
| homepage `trustBar` | *"**Real Patient Reviews** / From verified visitors"* — `clearcross_reviews` is EMPTY |
| homepage + quote form + **the patient EMAIL** | *"Average response: &lt;2hrs"*, *"most providers respond within 2 hours"*, *"They typically respond within 24 hours"* |
| quote form + quote detail + `/quote` meta description | *"Written price guarantee"*, *"Guaranteed Quote Price"*, *"Get a guaranteed price"*, *"No surprise fees — ever"* |

⛔ **THE CREDENTIALS ONE IS THE AUGUST CLAIM IN NEW WORDS.** The 2026-08-30 sweep
removed *"Cedula Profesional verified … checked by ClearCross"* from the provider
tooltip. The homepage said the same thing without either banned phrase, under a
heading reading **"Your Protection, Built In"**.

⛔ **AND THE REVIEWS PILLAR ADVERTISED A FEATURE THAT DOES NOT EXIST.** Section 4 had
already removed the average rating because there are no reviews; the trust pillar
selling them stayed. It now describes the **312 published prices**, which are real and
are the actual differentiator.

⛔ **THE SPANISH HALF WAS WORSE THAN THE ENGLISH.** `writtenQuotesDetail` read
*"El precio que ve es el precio que paga"* — **literally the sentence section 2 bans
in English**, invisible because that rule had no Spanish twin. This file's own lesson,
already written down: *retire an English term and its Spanish twin in the same commit.*

⛔ **THE RESPONSE-TIME CLAIMS ARE THE SHARPEST, BECAUSE ONE IS IN AN EMAIL.** There is
**ONE quote request in the entire history of the database**, submitted 2026-08-30 and
still `pending`. No provider has ever answered one, because none has ever been signed.
An email outlives the page it came from and gets forwarded.

### The fix is structural: the sweep discovers its own corpus

New **section 9** walks `components/`, `app/` and `lib/` — **121 files** — instead of a
list. Six rules, each with fixtures in BOTH directions, and the scan is **SKIPPED
loudly** if either half misclassifies. **19 live claims caught, 11 honest sentences
left alone.** Section 10 is the control that a deleted sentence does not satisfy a
deny-list: every surface must still say where its numbers came from, **in both
languages**, and the component must render the key.

⛔ **THE SELF-TEST CAUGHT THREE RULES NOT FIRING, AND THE CAUSE IS NOT OBVIOUS.** The
shared `DENIAL` test skips any sentence containing a negative word, so a disclaimer
cannot be mistaken for the claim it retracts. But *"**No** surprise fees"* and
*"Free, **no** commitment — most providers respond within 2 hours"* use a negative word
as part of the **promise**. A rule may now declare its own denial, one that governs the
claim (*"do not guarantee"*, *"have not checked"*) rather than a word anywhere in the
sentence.

⛔ **AND SECTION 1'S SPANISH RULE FIRED ON A DISCLAIMER I HAD JUST WRITTEN.** Spanish
conjugates without a pronoun, so *"No inspeccionamos la clínica ni las licencias"* is
indistinguishable from a claim — the English rule escapes only by accident of word
order (it needs *"we"* immediately before the verb, and a denial reads *"we have not
inspected"*). Rewritten in the **passive**, mirroring the English, which is the better
translation anyway. ⛔ **The blind spot is recorded AT the rule**, because the tempting
fix is to delete the disclaimer.

### The Spanish tree, measured on production before and after

|  | before | after |
|---|---|---|
| `/dentists` | en-ui 84 · es-ui 0 | unchanged |
| `/es/dentists` | **en-ui 83 · es-ui 1** | **en-ui 7 · es-ui 28** |
| `/es/dentists/dental-artistry` | en-ui 38 | **en-ui 8** |
| `/es/pharmacies` | en-ui 51 | **en-ui 7** |

Identical trees before. **129 Spanish pages were live and in the sitemap and every one
was the English page with a translated `<title>`**, in a market that is ~85% Hispanic.

**Two causes, two fixes.** CLIENT components hardcoded English and could always have
known the locale — `useI18n()` resolves from `usePathname()`, which runs during SSR, so
the Spanish text is in the HTML a crawler reads. **SERVER components could not know it
at all**: `app/es/**/page.tsx` re-exported the English component wholesale. Both the
category and provider routes now take a `locale` prop defaulting to `'en'`, and the
Spanish routes pass `'es'`.

⛔ **STILL 273 PRERENDERED ROUTES — nothing became dynamic.** `headers()`/`cookies()`
in a layout was deliberately NOT used: it opts the entire app out of static rendering,
which this file already records as a far worse trade.

**134 `ui` keys, EN/ES parity, none untranslated**, across 11 components + 2 server
pages. ⛔ **Popular SEARCH TERMS are deliberately untranslated** — they are queries
against English procedure names in the database, and translating the label without the
index returns zero results. Provider and procedure names stay English for the same
reason: that is a **data migration**, not copy.

### 🔴 The schema guard caught me breaking an invariant the code documents

Localising the visible breadcrumb left the **BreadcrumbList JSON-LD naming
"Optometrists" while the page showed "Eye Care"** — 17 pages — and the provider page's
own comment says *"the labels come from lib/schema.ts, which is also what the
BreadcrumbList reads, so the trail on screen and the trail in the JSON-LD cannot
disagree."* Fixed by resolving the label **once** and passing it into `providerGraph`,
so they cannot drift in either language. ⛔ The home crumb follows the locale too, in
**name AND url** — on `/es` the trail starts at `/es`, and a hardcoded `SITE_URL`
pointed the crumb at the English home page. Verified in a browser:
`everyCrumbIsVisible: true`, JSON-LD `["Inicio", "Dentistas", …]`, home item
`https://clearcrossprogreso.com/es`.

⛔ **AND VERIFYING IT ON PRODUCTION FOUND THE SAME BUG ONE CRUMB FURTHER OVER.** The
Spanish page emitted Spanish crumb NAMES pointing at ENGLISH URLs
(`…/optometrists`), and shared the English page's breadcrumb `@id` — two different
trails claiming to be the same node. A `localePrefix` now drives the breadcrumb's own
`@id` and its item URLs. ⛔ **The BUSINESS node deliberately keeps ONE `@id` across
both trees**: two language pages describe one business and consolidating them is
correct, while a BreadcrumbList describes THIS page's position in THIS tree. Those are
opposite requirements and the split is on purpose. English is byte-identical — the
prefix defaults to `''`, and the schema guard stayed at 1811/0.

### 🔴 CI ran four of the eight guards

`honest-claims`, `places-match`, `seed-safety` and `schema` had **never executed in
CI** — so a push could be green with the guard protecting a medical-credential claim on
a health directory never run at all, on a site about to be left unattended for two
months. All offline guards now run, plus schema (1811 checks) after the build, plus the
mutation harness. ⛔ Each on its own line, **not** an `&&` chain: one red must not hide
the guards behind it.

### Guards added

- `test/honest-claims.mjs` sections 9 + 10 — the tree-wide sweep and its control.
- `test/_mutate_honest_pages.mjs` — **14 caught / 0 missed / 0 skipped**, byte-restore
  verified, guard green again on the restored tree.
- `test/bilingual.mjs` section 5 (44 checks) — every shared component reads the
  dictionary, is a client component, and routes its links through `localizedPath`; the
  Spanish routes pass a locale rather than re-exporting; every `ui` key exists in both
  dictionaries **and the Spanish is not the English**.

⛔ **THE HARNESS'S OWN RESTORE CHECK CRIED WOLF FIRST.** It searched restored files for
*"licensed professionals"* and reported three as NOT RESTORED — because the fix ships
comments that QUOTE the removed claim in order to explain it. It compares **bytes**
against a snapshot now. **A restore check that cries wolf is worse than none: the next
person learns to ignore it, on the run where it is real.**

⛔ **AND IT REFUSED TO SCORE FIVE MUTATIONS** whose anchors had moved into the
dictionary — *"anchor matched 0 times, mutation NOT applied — proves nothing"* — rather
than mutating whatever sat at the old position. Re-pointed, then 14/14.

### Verified in a real browser, both trees

`lang="es"`, h1 **"Dentistas en Nuevo Progreso"**, 24× *Ver perfil*, 24× *Pedir
cotización*, quote form fully Spanish (*Su nombre*, *Correo electrónico*, *Solicitar
cotización*), price table fully Spanish, all eight retired Spanish claims **gone**, all
seven honest replacements rendering, **0 page console errors** (the only output was a
Chrome extension), **0 horizontal overflow**, **0 broken images**. No hydration mismatch
despite `SavingsBanner` becoming a client component.

### ⚠️ Traps paid for again

- ⛔ **The heredoc backslash trap, four times.** It turned `\\` into `\` (breaking a
  regex into a syntax error) and `\n` into a real newline inside a JS string literal.
  ⇒ **write escape-bearing files with the Write/Edit tool**, or build the character
  with `chr(92)`.
- ⛔ **`node --check` PASSES on an undefined identifier.** A generator emitted `+ NL`
  where `NL` was a Python variable; the script was syntactically valid and would have
  refused every anchor with a confusing "matched 0".
- ⛔ **Git Bash MSYS path conversion mangled a `/es/dentists` argument** into
  `C:/Program Files/Git/es/dentists`. Use `MSYS_NO_PATHCONV=1`.
- ⛔ **`grep -c` exits 1 on a zero count**, killing an `&&` chain on a correct result.
- ⛔ **The local server runs on MOCK data for reviews.** Local shows "Average Rating"
  and dated reviews; production correctly shows "No reviews yet". A local measurement
  is not a production measurement.
- ⚠️ A patch script that writes at the END means a mid-run refusal leaves the file
  untouched — which is right, but it also means a re-run double-applies anything
  written before the refusal (the dictionary blocks). Check before re-running.

### ⏭️ Open

1. ⛔ **ON MARIO: Search Console** — create the property, paste the HTML-tag code.
   `docs/MEASUREMENT.md` records this cannot be automated (the token carries only
   `webmasters`, not `siteverification`). Until then organic performance is
   unmeasurable, and this is what the AI Webmaster is waiting on.
2. ⛔ **ON MARIO: enable Web Analytics** in the Vercel dashboard. Both API routes were
   tried and refused.
3. **GA4** — `NEXT_PUBLIC_GA_ID`. The component is written and inert without it.
4. **The Places `--apply` phone harvest** — 30 numbers ready (coverage 36% → 64%),
   blocked on identifying which of the vault's 8 Google keys is enabled for Places.
5. **The remaining Spanish is DATA, not copy.** Procedure names ("Dental Cleaning") and
   provider names come from the database in English. A `name_es` column and a
   translation pass is the honest scope; nothing in the code is missing.
   ⚠️ `/es` still ships `<html lang="en">` in the **server** HTML — `I18nBody` sets it
   in a `useEffect`, so a browser sees `es` and a crawler sees `en`. The fix is a second
   root layout; hreflang already tells Google the language.
6. **The in-site quote loop** — a per-quote access token so `/quote/<id>` works for
   anonymous submitters, and moving the provider's price response out of the browser so
   the `quoted` email (fully written, currently **dead code**) actually fires.
7. **Unchanged and not blocking:** the revenue model, and the **Texas Patient
   Solicitation Act** gate before any per-patient commission.
8. 🔴 **LaTonya Glaze is still an unanswered lead** (`glazegyrl@gmail.com`, 2026-08-30,
   all-on-6 full mouth — the highest-value case this site can take). Nothing in the code
   can answer her.

## 🟢 2026-09-04 — THE LEAD PATH WORKS, AND THERE WAS A REAL CUSTOMER SITTING IN IT

Mario, after time away: *"the end goal was to have something that's already working that
people can actually go into… and we can start leaving it for a month or two to see if it
gains traction."*

✅ **PUSHED + DEPLOYED.** `main` **`00dd538`**, sha-verified against GitHub with
`git ls-remote` (not the push output) → production **`dpl_EU9ugGb3BgPkDVHksL9MULr7chhd`**,
READY, target production, sha-matched. ⛔ This repo is git-linked: **a push to `main` IS a
production deploy.** `npm run verify` **REAL_VERIFY_EXIT=0** before the push — 8 guard
suites, build compiled, schema 1811/0.

### 🔴 THE SITE HAD ONE QUOTE REQUEST IN ITS ENTIRE HISTORY, AND IT WAS REAL

**LaTonya Glaze, `glazegyrl@gmail.com`, 2026-08-30**, for Dental Artistry / World Dental
Center: *"Extraction of broken teeth and all on 6 full mouth"*. Status `pending`. Nobody was
ever told, because no email was configured on the project. `US_BENCHMARKS` puts all-on-4 at
**$25,000** — the highest-value lead this site could receive, unread for five days. Mario was
alerted separately the moment it was found. ⛔ Her row is untouched and must stay that way.

### The conversion path was broken end to end

1. 🔴 **The quote form 500'd on ~61% of providers, every time.** `QuoteForm.tsx:67` sent the
   literal string `'general'` into `procedure_id`, a `uuid NOT NULL` column. Where a provider
   publishes no prices the procedure `<select>` is not rendered at all, so the value was
   permanently `''` → `'general'` → cast error → `500 Failed to create quote request`. On the
   other 39% it failed whenever the visitor skipped a dropdown labelled *optional*. The API's
   own lookup hit the same error one block earlier and **discarded it**, so nothing logged the
   cause. Migration **004** makes the column optional (FK kept), applied and **verified by
   reading the schema back** — the Management API returns `[]` for DDL whether it worked or not.
2. 🔴 **No email existed.** The Vercel project carried **5 env vars**, none for mail. Now
   `RESEND_API_KEY` / `QUOTE_FROM_EMAIL` / `QUOTE_NOTIFY_TO`, **production only** — a preview
   deploy sending real mail is a second unwatched door. ⛔ Vercel snapshots env at build time,
   so the values alone do nothing; the deploy is what armed them.
3. 🔴 **`/quote?provider=<id>` discarded the provider** and showed a picker, and read
   `lib/mock-data` — the only page on the site that did, so its list was filtered on a frozen
   mock `verified` flag rather than the live column. Now redirects to the provider's own page
   at `#quote-form` and reads through `lib/data.ts`.
4. 🔴 **Both patient emails linked to `/quote/<id>`, which 404s for every anonymous
   submitter** — the only patient SELECT policy is `user_id = auth.uid()` and the anonymous
   funnel writes a `gen_random_uuid()` id via the service role. Every submitter is anonymous.
   Buttons removed; a `replyTo` added so a reply now reaches a human instead of a `noreply`.

**🟢 PROVEN ON PRODUCTION, not localhost:** a real quote submitted against
`accualaser-medical-spa` (**0 prices** — the exact case that 500'd) returned **HTTP 201**, the
row landed with **`procedure_id: null`**, and Resend reports the alert to Mario
**`delivered`** — subject *"[Quote] General enquiry — Accualaser Medical Spa"*. ⛔ Delivery
read from the provider, not from the 200; `sent` and `queued` are both non-terminal. Test row
and test user deleted and **proven gone by re-reading** (1 quote total, LaTonya's, intact).

### Measurement — the half that makes a two-month test mean anything

⛔ **CORRECTION to the previous entry, which said there is no analytics.** Vercel **Speed
Insights IS collecting** (data received 2026-08-30, which is how we know real traffic exists).
**Web Analytics holds an id but its API answers `404 not_found`** — provisioned and not
collecting. GA4 is inert (`NEXT_PUBLIC_GA_ID` unset), Search Console unverified.

New `components/analytics/OutboundTracker.tsx` + `lib/outbound.ts`: a delegated **capture-phase**
listener counting `tel:`, `wa.me`, outbound-website and quote-submit. Before it the only
measurable event on the site was a pageview — and on ~2/3 of provider pages those buttons are
the **only** working contact path (phone on 37/104, WhatsApp on 10/104). ⛔ `classify()` lives
in a plain `.ts` so the guard can **execute** it (14 hrefs + a control that it discriminates at
all); a source scan cannot tell a working classifier from one returning null for everything,
and "null for everything" is indistinguishable in the data from "nobody clicked".
Mutation-proven: a null-returning classify fails 7 checks.

### 🔴 Dr. Leo claimed a licence check the site disclaims

`concierge/kb.md` said *"Providers are verified against a valid Cédula Profesional"* while every
provider page says we have **not** checked any licence. He is a **voice** agent on a healthcare
directory. ⛔ **It was hardcoded in the GENERATOR** (`tools/build-concierge-kb.mjs`), so fixing
the `.md` alone would have let it return on the next rebuild. A second false claim came out of
the same paragraph — *"ratings and review counts come from that verification research"* — wrong
twice, since no page renders a star row at all. Honest advice preserved (*ask to see it at your
appointment*); the guard **keep-lists** it, because a naive deny rule deletes the disclaimer too.
Counts regenerated from the live DB: **46 → 78 providers, 5 → 7 categories**.

⛔ **HIS PERSONA IS A DATABASE ROW ON THE PETBUDDY PLATFORM — `git push` DOES NOT UPDATE HIM.**
Provisioned with `--agent-id agent_clearcrossprogreso938b30ece5` and **verified by reading the
row back with a control**: the Cédula claim GONE, the ratings claim GONE, honest advice kept,
count 78. ⛔ **Running `npm run concierge:provision` WITHOUT `--agent-id` CREATES A NEW AGENT**
rather than updating — it did, and the stray (`…d41ad13941`) was deleted and proven gone. Use
the flag.
⛔ **And the column is `kb_markdown`, not `knowledge_base`** — my first read-back asked for a
column that does not exist, got `undefined`, and reported the claim "GONE" on a row it had never
actually read. A confident false all-clear on the liability item. Always include a control.

### Data integrity — two wins we were already paying for

- **The Places runner fetched each clinic's phone and threw it away.** Dry run: **30 numbers,
  coverage 37 → 67 of 104 (36% → 64%)**. ⛔ It also switched to `internationalPhoneNumber`:
  the `nationalPhoneNumber` already in the mask returns a number in its **own country's**
  format, so a Mexican clinic comes back **undialable from a US phone** — it looks like a
  number and quietly does nothing. **20 of the 30 are +52**, so two-thirds of the harvest would
  have been useless. Writes via `coalesce(nullif(phone,''), new)` so it **cannot** overwrite a
  curated number. Migration **005** (`phone_source`) applied and schema-verified.
  ⏭️ **The `--apply` run has NOT been done** — it needs `GOOGLE_PLACES_KEY`; the vault holds 8
  Google keys and none is labelled for Places. One command once the key is identified.
- 🔴 **Re-running the seed would have reverted the site from 78 providers to 46.**
  `002_seed.sql`'s `ON CONFLICT DO UPDATE` overwrote `verified`, `lat`, `lng` — and `phone`.
  Those columns are now **absent from the update list**, so it is impossible rather than
  announced. RED 4 → GREEN 14; 8/8 mutations caught. Wired in as `verify:seed`.

### Also shipped

- **The structured data from 2026-09-01 that was never committed.** Production had been serving
  one generic `LocalBusiness` node and **0 `Offer` nodes** while STATE recorded it as shipped.
  Now live: 23 Offers on a dentist page, 7 on a pharmacy, breadcrumbs and real geo throughout.
- **ProviderCard links are locale-aware** (`localizedPath`). 129 Spanish pages are live and
  sitemapped and every provider link was hardcoded to the English tree, dropping a Spanish
  visitor into English on the first click in an ~85% Hispanic market. It is a client component
  and `usePathname()` resolves during SSR, so the corrected href is in the HTML a crawler reads.

### ⏭️ Open

1. ⛔ **ON MARIO: Search Console.** Create the property, paste the HTML-tag code.
   `docs/MEASUREMENT.md` records that this **cannot be automated** — the available token carries
   only `webmasters`, not `siteverification`. Until then organic performance is unmeasurable.
2. ⛔ **ON MARIO: enable Web Analytics** in the Vercel dashboard. Both API routes for it
   (`POST /v1/installations/analytics`, `PATCH webAnalytics`) were tried and refused.
3. **GA4** — `NEXT_PUBLIC_GA_ID`. The component is written and inert without it.
4. **The Places `--apply` phone harvest** (above) — 30 numbers waiting.
5. **Spanish, the rest of it**: `PriceTable`, `CategoryListingClient`, `SearchResultsClient`,
   `CompareDrawer` still hardcode English UI strings, and `CompareDrawer`/`FeaturedProviders`/
   `SearchResultsClient`/`FlashNotificationBanner` still hardcode English links. The
   dictionaries are already at 209-key parity — plumbing, not translation.
   ⚠️ `/es` still serves `<html lang="en">`: `I18nBody` sets it in a `useEffect`, and the fix
   (a second root layout) is a real refactor. hreflang already tells Google the language.
6. **The in-site quote loop** — a per-quote access token so `/quote/<id>` works for anonymous
   submitters, and moving the provider's price response out of the browser so the `quoted`
   email (fully written, currently **dead code**) actually fires.
7. **Unchanged and not blocking:** the revenue model, and the **Texas Patient Solicitation Act**
   gate before any per-patient commission.

## What this is
A bilingual directory for **Nuevo Progreso, Mexico** — the border town Rio Grande Valley
residents cross into for dental work, pharmacies, optometry, spas and cosmetic surgery.

**The end goal, in one sentence:** be the site every Valley resident opens **before** they
cross at Progreso, so the appointment routes through us.

**The wedge.** Head terms are owned by medical-tourism aggregators — WhatClinic, Dental
Departures, MedicalTourismCo, PlacidWay — and every one of them sells **fly-in dental
vacations** to someone in Chicago comparing Cancún and Los Algodones. ⛔ **Nobody writes for
the person in McAllen who drives over for the afternoon.** Bridge wait times, where to park
on the US side, can I go on my lunch break, what if something goes wrong when I'm back in
Weslaco. That intent has **~800,000 southbound pedestrian crossings a year** behind it.

**The moat is the prices.** Competitors publish ranges ("crowns $250-450"). We hold **312
per-provider line items**, down to five distinct Ivermectin packs at one pharmacy. As of
2026-09-01 they are machine-readable.

## LIVE
- **`https://clearcrossprogreso.com`** — Vercel, auto-deploys `main`. **A push IS a deploy.**
- Repo `mar2181/clearcrossprogreso` @ `C:\Users\mario\Projects\clearcrossprogreso`, `main`.
- Supabase `clearcross_*` tables. Concierge **Dr. Leo** live.
- ⚠️ A **755 MB gitignored `clearcrossprogreso.com/` directory** sits inside the repo (an old
  copy with its own worktrees). Not shipping. `find` hits it — filter it out.

## ⛔ Mario's standing decisions
- **$0 ad spend, organic only.** Revisit once analytics exist.
- **Technical fixes before new content.**
- Hidden listings → **re-verify against Google Places, then unhide** (done, below).
- 🔴 **Revenue model is STILL OPEN.** Flat listing fee vs per-patient commission vs featured
  placement. ⛔ **Texas Patient Solicitation Act is broader than the federal AKS and is not
  limited to government programs** — a Texas healthcare attorney reads it BEFORE the first
  commission is collected. Build the tracking regardless so the model can be switched.

## ⛔ Two questions already answered — do not re-litigate
- **"Do we need a physical address for Google?"** **No, and trying is a risk.** Google's GBP
  eligibility rules exclude lead-generation and online-only businesses; a virtual address is
  a suspension trigger. The local pack shows *businesses*, not directories of them. Confirmed
  independently: the GBP API has **no `locations create`**, and our quota is **0 req/min**.
- **"Do we need Google Ads?"** Not yet — see $0 above.

## Done (verified on production)
| | |
|---|---|
| Price comparison restored | `slug` added to 6 PostgREST embeds — the whole value prop was dead from one missing word. `$1,200` vs `$3,500 US` now renders |
| `AggregateRating` violation | now gated on **rendered** reviews, not the seeded column |
| Duplicate domain | canonicals + `X-Robots-Tag` on non-apex hosts |
| Sitemap | blog restored, `/es` added, hreflang both trees |
| Quote delivery | reaches a human; stops claiming success on failure |
| Honest claims | four classes of unsubstantiable claim removed (incl. the "Verified Provider — credentials checked" badge) |
| **Places re-verification** | 3-gate matcher; visible providers **46 → 78**. `/spas` 0→8, `/doctors` 0→4, `/optometrists` 1→8 |
| ISR | category + provider routes revalidate hourly, so a DB change no longer needs a deploy |
| **Structured data** | 104 pages, **312 `Offer` nodes**, specialized types, breadcrumbs, real geo — `docs/SCHEMA.md` |

⚠️ **The schema guard covers the English tree only, deliberately.** `/es` re-exports the
English component wholesale, so it emits byte-identical JSON-LD pointing at the English
canonical — defensible entity consolidation, and consistent with what those pages render
(which is English). Extending the guard there now would **pin the duplicate-content bug**
rather than catch it. It comes into scope with the `/es` rewrite.

## Guards
`npm run verify` = strip-comments · measurement · bilingual · quote-delivery · honest-claims ·
places-match · **`next build`** · **schema** (the schema guard reads the built HTML, so it runs
last). Mutation harnesses: `test/_mutate_places_match.py`, `test/_mutate_schema.py`.

⛔ **Put the exit code INSIDE the log** — `{ npm run verify; echo "EXIT=$?"; } > log 2>&1`.
A chain ending in `tail` reports *tail's* exit and a failed suite reads as 0. Hit again 2026-09-01.

## Traps this repo has already paid for
- ⛔ **A bash heredoc here eats quotes and backslashes.** It killed three separate patch
  scripts on 2026-09-01 alone (apostrophes in `Pancho's`, `\b` in a regex). **Write
  regex- or apostrophe-bearing files with the Write tool, never a heredoc.**
- ⛔ **`io.open(p, 'w')` on Windows silently rewrites a whole file LF→CRLF**, and
  `core.autocrlf` hides it in the diff. Always `newline=''` + `os.replace`.
- ⛔ **`grep -c` counts LINES, not matches** — useless on single-line minified HTML, and it
  **exits 1 on a zero count**, which kills a `&&` chain on a correct result.
- ⛔ **A string that exists somewhere is not a check.** Eight instances now, three of them
  on 2026-09-01 reading *rendered HTML*: "No reviews yet" also appears in the
  related-provider cards for OTHER clinics; apostrophes are `&#x27;` in markup; and a Map
  keyed by procedure name silently dropped four of five legitimate Ivermectin rows.
  ⇒ scope to the component that emits it, decode first, and check whether the data
  legitimately repeats before believing a red.
- ⛔ **One source of truth makes drift impossible AND drift-tests vacuous.** The price table
  and the JSON-LD both call `effectivePrice()`, so mutating that function moves both and they
  still agree — three mutations scored MISSED for exactly that reason. ⇒ **mutate the LINK**
  (the schema builder reaching for the raw column) **and add coverage floors** for what
  consistency cannot see (Free-row count, a discount that renders the same figure twice).
- ⛔ **Read the real field names.** The schema read `latitude`/`longitude`; the columns are
  `lat`/`lng`, so it emitted no geo on 104 pages whose coordinates had just been written.
  A field that does not exist and a value that is absent are indistinguishable in the output.
- ⛔ **Places Text Search answers a NONSENSE query with real businesses.** "Zzqx Nonexistent
  Clinic Nuevo Progreso" returns two operating clinics. A result is a **candidate**, never a
  confirmation. See `docs/PROVIDER_VERIFICATION.md`.
- ⛔ **Python buffers stdout when redirected** — a background harness log reads empty for
  minutes. Use `python -u`.
- ⚠️ Orphaned `next start` processes accumulate on this box across projects. Kill by PID.

## Open — blocked on Mario (asked four times)
1. **Search Console** HTML-tag verification code → `GOOGLE_SITE_VERIFICATION` on Vercel →
   redeploy → Verify → submit sitemap. **Nothing is measured until this happens.**
2. **Resend domain verification** for `clearcrossprogreso.com` (DNS), then `QUOTE_FROM_EMAIL`.
3. **Which inbox** quote requests land in → `QUOTE_NOTIFY_TO`.
4. Optional: GA4 property → `NEXT_PUBLIC_GA_ID` → redeploy.

## Open — recorded, not started
- 🔴 **The `/es` tree is the English pages with a translated `<title>`.** Measured: 82 English
  UI strings, 0 Spanish, identical to `/`. And **zero `/es/`-prefixed provider links exist
  site-wide** — 129 real Spanish pages nothing links to. ⛔ **In an ~85% Hispanic market this
  is bigger than its Phase 4 position suggests.** Needs a locale threaded through
  `ProviderCard` + `CategoryListingClient`, both shared with search and the homepage.
- 🔴 **63 of 104 providers have no prices at all (61%).** That is the moat's real limit and it
  is a *data* problem. Firecrawl (4,722 credits) against each clinic's own site is the route.
- ⚠️ **Every provider photo is AI-generated and recycled between competing clinics** —
  `fernando-rodriguez.jpg` appears on two rival dental pages. Not in structured data (on
  purpose). Needs real Places photos or honest relabelling.
- ⚠️ **26 providers failed Places verification** — still prerendered and in the sitemap, but
  unlinked from category pages. Not demoted; taking a live listing down is a louder decision.
- 🔴 **UN-RETIRED 2026-09-05: the retirement below is WRONG and the hazard is LIVE.**
  Measured on the live database and the live page: **60 providers hold a non-zero
  `avg_rating`**, and `/dentists/dental-artistry` renders **“4.6 out of 5 · 98 reviews”**
  above a section reading **“No reviews yet”**. Seeded mock ratings, presented as ours, on a
  page contradicting itself. Not fixed -- it is a product decision. Original note follows:
- ✅ **RETIRED 2026-09-01: the "60 providers carry a seeded `avg_rating`" item is STALE.**
  Measured off the built artifact: **ZERO of 104 pages render a star row**, so `avg_rating`
  is null on every provider and the unattributed-rating hazard is already gone. Found by a
  mutation that could not be made to fail; recorded as known-safe in `_mutate_schema.py`
  with a tripwire that goes red if a rating is ever backfilled.
- ⚠️ Category pages have almost no content (`/vets` ~15 unique words) and **no structured data
  anywhere but provider pages** — `ItemList` on categories and `Article` on the 10 blog posts
  are the obvious next step. The blog is the only thing already ranking page one.
- ⚠️ `/quote` and `/es/quote` render **hardcoded mock data** on a live real-DB site.
- ⚠️ **18 dependabot alerts** (11 high) surfaced on push, not triaged. ⛔ The 2 open dependabot
  branches are POISONED — one bumps `eslint-config-next` to ^16 (the ERESOLVE that broke the
  build for two months), the other DOWNGRADES `next`. ⛔ `feature/onedrive-recovery-2026-04-30`
  is a stale snapshot; merging would DELETE work.
- ⚠️ No referral/click-out tracking anywhere — a dentist asking "how many patients did you send
  me?" cannot be answered. Gated on the revenue decision.

## Last verified
**2026-09-01** — structured data shipped. `npm run verify` **REAL_VERIFY_EXIT=0**, all guards;
schema guard **1811 checks, 0 failed**; `test/_mutate_schema.py` **8 caught / 0 missed / 0
skipped** plus **2 recorded unprovable with measured reasons**. Coverage read off the built
artifact: **104 pages, 312 Offers, 11 Free rows, 104 with real coordinates, 28 with a rating**.
⛔ Three false failures from my own guard, and three mutations that SHOULD have missed, were
both diagnosed before anything was trusted — see the two trap entries above.
