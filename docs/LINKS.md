# Internal links

## What was wrong

Three navigation links pointed at routes that do not exist, or at the wrong page,
on every page of the site:

| link | pointed at | reality |
|---|---|---|
| navbar user menu → Sign in | `/login` | **404** — the page is at `/auth/login` |
| navbar user menu → Register | `/register` | **404** — the page is at `/auth/register` |
| "List Your Business" (footer ×2, every category page) | `/quote` | the **patient** quote form |

⛔ Every one of them was a valid `<Link href>` to a string. Nothing type-checks
that, nothing rendered an error, and they were found by a human clicking.
Confirmed live on production while fixing them: `/login` → 404, `/register` → 404.

⛔ **And "List Your Business" was worse than a 404.** A dentist who wanted to be
listed was taken to a form asking which dental treatment they were shopping for.

## The find underneath it

**Provider onboarding already exists and is properly built.** `/auth/register` has
an "I'm a Provider" toggle that inserts a `clearcross_providers` row and links
`provider_id` onto the new user, asking for clinic name, category and WhatsApp. It
was simply unreachable, because nothing linked to it correctly.

⇒ The plan filed provider onboarding under Phase 5. It turns out to be two links.
`?role=provider` now preselects the toggle, so the clinic fields are on screen
when a provider arrives from that CTA.

⛔ The role is read in an effect AFTER mount, not in the `useState` initializer.
An initializer touching `window.location` renders `patient` on the server and
`provider` on the client — a hydration mismatch, the same defect the
flash-discount countdown already has. And deliberately not `useSearchParams`,
which pushes the nearest Suspense boundary into client-side rendering.

## `/es` has no auth tree

`localizedPath('/auth/login', 'es')` would produce `/es/auth/login`, which is a
404 — the same bug, one tree over. The rule lives in `localizedPath` itself
(`ENGLISH_ONLY`) rather than at each link, because the navbar, the mobile menu and
the footer all route through that one function, and so will the next auth link
somebody adds.

⚠️ The cost is deliberate and honest: a Spanish-speaking visitor gets an English
sign-in page. That is strictly better than the 404 they got before. The fix is to
translate the page, not to re-break the link.

## The guard

`npm run verify:links` — needs a running server (`BASE=http://localhost:PORT`),
and runs in CI on its own step after the build.

It crawls a seed page of every route SHAPE in both trees, discovers a real
provider URL and a real blog post **out of the sitemap** so it cannot go stale as
content is added, collects every internal `href`, and fetches each one. 112 links
on the current build.

⛔ **No browser.** Playwright is not a dependency of this repo, so a
browser-based version could only ever run on one laptop. Next server-renders its
client components, so the navbar and footer are in the HTML and plain `fetch` can
see them — which means this runs in CI, which is the entire point.

Mutation harness: `python test/_mutate_links.py` — 4 mutations, 4 caught. ⛔ It
**rebuilds between mutations**, because the guard reads served HTML; a mutation to
source that is never built is one the guard cannot observe.

## Traps recorded

⛔ **A page-wide regex is not a check on one element.** The CTA check first tested
the whole page for `/auth/register?role=provider` and passed against a broken CTA,
because the FOOTER carries the same link on every page. The harness caught it —
that mutation scored MISSED on the first run. It is scoped to the CTA block now,
and asserts the patient quote form is *absent* from that block as well.

⛔ **A harness must hand its environment to the child.** The first run reported
"baseline is not green" about a perfectly healthy tree: it started its server on
`$PORT` while `test/links.mjs` defaulted to `:3100`. A confident red from the
instrument, not the product.

⛔ **`fetch` gating on `text/html` cannot read a sitemap.** `/sitemap.xml` is
`application/xml`, so an earlier draft read it as an empty string and sampled zero
URLs — which would have reported "all links resolve" having checked nothing. The
`< 50 URLs` control is what caught it; keep both.

⛔ **Grep the escaped form.** Checking production for `I'm a Provider` returned 0
on a page that contains it — the apostrophe is HTML-escaped to `I&#x27;m`. A
negative control (nonsense string → 0) does not catch this; only a positive
control does.

⚠️ **Not fixed, recorded:** `app/quote/page.tsx` imports `mockProviders` directly,
so the live real-database site lists mock providers there. Measured: all 8 of
their links currently resolve 200, because the mock slugs match the real data — so
it is a staleness risk, not a broken-link one. `/quote` is excluded from the
sitemap for this reason.

⚠️ `POST /api/quotes` with an empty body returns **500**, not 400 —
`request.formData()` throws and the outer catch turns it into "Internal server
error". Noise in logs, not a defect anyone hits.
