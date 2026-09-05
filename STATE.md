# ClearCross Progreso — Project STATE (single source of truth)

> Authoritative current state. This OVERRIDES older scattered notes.
> Bump "Last verified" when things change. Keep it tight (~150 lines).

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
