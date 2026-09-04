# ClearCross Progreso — Project STATE (single source of truth)

> Authoritative current state. This OVERRIDES older scattered notes.
> Bump "Last verified" when things change. Keep it tight (~150 lines).

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
