# Measurement

Until 2026-08-29 this site had no analytics of any kind — no GA4, no Vercel
Analytics, no Search Console, no pixel. It had been public for roughly six weeks
and **not one visit had ever been measured**. Vercel's own API agreed:
`speedInsights.hasData: false`.

That is the single worst state for an SEO project to be in, because every
decision after it is a guess.

## What is live now (needs nothing from anybody)

| | where | key needed |
|---|---|---|
| **Vercel Web Analytics** | vercel.com → project → Analytics | none |
| **Vercel Speed Insights** | vercel.com → project → Speed Insights | none |

Both were already provisioned on the project (`webAnalytics.id`,
`speedInsights.id`) — the tags were simply never mounted. They are mounted in
`app/layout.tsx` now and report from the first deploy. Pageviews, referrers, top
pages, countries, devices, Core Web Vitals.

⚠️ Neither script appears in server HTML. Both inject from a `useEffect`, so
`curl | grep` reports zero on a perfectly working page. **Verify in a real
browser**, or by grepping the built client chunks for `_vercel/insights`.

## What is wired but inert, waiting on one value each

Both are gated on an environment variable and render **nothing** without it. A
half-configured tag is worse than none — it produces a page that looks
instrumented and reports nothing, which is the exact failure this file exists to
end.

### 1. GA4 — `NEXT_PUBLIC_GA_ID`

1. analytics.google.com → Admin → Create property → Web data stream for
   `https://clearcrossprogreso.com`
2. Copy the Measurement ID (`G-XXXXXXXXXX`)
3. Set `NEXT_PUBLIC_GA_ID` on the Vercel project and redeploy

⛔ `NEXT_PUBLIC_*` is inlined at **build** time. Setting the variable alone does
nothing — it needs a redeploy.

### 2. Search Console — `GOOGLE_SITE_VERIFICATION`

**The property already exists.** It was created via the API on 2026-08-29 and is
sitting in the account as `https://clearcrossprogreso.com/` with
`permissionLevel: siteUnverifiedUser`. Only ownership is outstanding.

1. search.google.com/search-console → the property is already listed
2. Choose the **HTML tag** method → copy the `content="..."` value
3. Set `GOOGLE_SITE_VERIFICATION` to that value on Vercel → redeploy
4. Back in GSC, click **Verify**
5. Submit the sitemap: `https://clearcrossprogreso.com/sitemap.xml`

⛔ **This cannot be automated, and it was measured rather than assumed.** The
`google-search-console-pp-cli` OAuth token carries only
`https://www.googleapis.com/auth/webmasters` and `webmasters.readonly` — **not**
`siteverification`. Nothing available here can mint a verification token or ask
Google to check one. (Independently confirmed: the same finding is on record from
the SPI Fun Rentals work.)

⛔ **The CLI cannot address this property at all.** It interpolates the site URL
into the request path without encoding it, so
`PUT /webmasters/v3/sites/https://clearcrossprogreso.com/` 404s. Proven with a
control: `sites-get sc-domain:rgvreef.org` succeeds on the same token, because a
`sc-domain:` value contains no slash. **Use raw HTTP with a percent-encoded site
URL** for anything touching this property — including `sitemaps/submit`.

## The guard

`npm run verify:measurement` (also in CI, and in `npm run verify`).

It asserts the three tags stay mounted, that GA4 stays inert without its
variable, that no measurement id is ever hardcoded, and that the Search Console
tag stays *conditional* rather than merely mentioning the variable name.

⛔ Its most valuable check is that `GoogleAnalytics.tsx` never uses
`useSearchParams`. That hook forces the nearest Suspense boundary into
client-side rendering, so a crawler receives a loading fallback instead of the
page — on a directory whose entire value is server-rendered HTML that Google can
read. Adding it to "also capture query params" is a reasonable-looking edit that
would quietly cost the ranking this project exists to win, and **nothing else
would go red**. The query string is still captured, by reading `window.location`
inside the effect, which costs nothing at render time.

Mutation harness: `python test/_mutate_measurement.py` — 8 mutations, 8 caught.
It found one of these checks vacuous on its first run (an earlier version matched
`GOOGLE_SITE_VERIFICATION` anywhere in the file, so replacing the condition with
`true` left the name in the value below and read green).
