# The two language trees

The site serves English at the root and Spanish at real `/es/...` URLs — 129 pages
each. The Rio Grande Valley is roughly 85% Hispanic, so the Spanish tree is not a
courtesy, it is half the addressable market.

## What was wrong (measured on production, 2026-08-29)

| | before | after |
|---|---|---|
| hreflang on `/` | **0 tags** | 3 |
| hreflang on `/es` | 2 tags, pointing at `/` | 3, reciprocal |
| sitemap URLs | 124 | **258** |
| Spanish URLs in the sitemap | **0** | 129 |
| hreflang in the sitemap | 0 | 774 |
| `/about`, `/how-it-works`, `/safety`, `/privacy`, `/terms` | in neither tree's sitemap | both trees |

⛔ **The Spanish tree's hreflang was doing nothing at all.** Google's rule is that
the annotation must be reciprocal: if page A names B as its alternate and B does
not name A back, the *entire* annotation is discarded. `/es` named `/`; `/` named
nothing. Each side was individually well-formed, which is why nothing ever looked
broken.

⛔ **`es-MX` excluded the actual audience.** It targets Spanish speakers *in
Mexico*. Our reader is a Spanish speaker in McAllen or Weslaco with a US locale,
and `es-MX` does not match them. Bare `es` is a superset of both `es-US` and
`es-MX` and cannot mis-target, so that is what ships. Same reasoning for `en` over
`en-US`.

## How it works now

`lib/hreflang.ts` is the only thing that knows how the trees pair up. Given an
**English** path it derives both URLs, so the Spanish URL is never passed in and
the two sides cannot drift. Every bilingual page and every sitemap entry calls it.

`x-default` points at English deliberately — it is what Google serves a visitor
matching *neither* language, not a claim about which audience matters more.

The sitemap emits both languages from one call and attaches `xhtml:link` hreflang
to every entry. That second mechanism is what covers the five standing pages,
which carry no metadata export of their own.

## `<html lang>` — done, but not the way it looks

⛔ **The server HTML says `lang="en"` on `/es`, and that is not a bug.** In the App
Router only the root layout may render `<html>`, so a per-tree `lang` would mean
two root layouts behind route groups — which also turns every language switch into
a full page reload. `components/layout/I18nBody.tsx` sets
`document.documentElement.lang` from the pathname in an effect instead.

Verified in a real browser: `/es` and `/es/dentists` both report `lang="es"`, and
it updates across client-side navigation. ⚠️ A crawler and "view source" still see
`en`. That costs nothing for ranking — Google determines language from the content
and from hreflang, not from this attribute — and the accessibility value (screen
readers, browser translate prompts) is delivered.

## The guard

`npm run verify:bilingual` (also in CI, and in `npm run verify`). 83 checks.

It **executes** `lib/hreflang.ts` rather than scanning it, because "the file
contains the word `languages`" is satisfied by an annotation pointing at the wrong
URL. It asserts reciprocity, that each canonical appears in its own alternate set,
that the two canonicals differ, that `x-default` resolves to English, that no page
hand-rolls a second language map, that `es-MX` cannot come back, and that every
sitemap entry is emitted as a pair.

Mutation harness: `python test/_mutate_bilingual.py` — 9 mutations, 9 caught. It
found one check vacuous on its first run: `/alternates/.test(sitemapSource)` was
satisfied by `const alternates = undefined`, because the identifier survived. It
pins the construct now.

## Traps recorded

⛔ **`curl | grep hreflang` returns 0 on a working page.** Next writes `hrefLang`
in camelCase on the wire. The browser DOM normalises it to lowercase, so the two
instruments genuinely disagree — match case-insensitively against HTTP.

⛔ **"the last line starting with `import `" is not "the last import statement".**
A multi-line `import {` matches on its opening line, so inserting after it lands
*inside* the statement. That produced a syntax error in
`app/[category]/page.tsx` during this work; TypeScript caught it.

⚠️ **A local build has no `.env*`, so it renders MOCK data.** Body text measured
locally is not production content. Head metadata and the sitemap are unaffected —
the local sitemap was set-compared against production and is exactly its 124 URLs
plus the 5 intended additions, with zero providers lost.

⚠️ **Latent, pre-existing, not fixed here:** the flash-discount countdown renders a
time string server-side (`3h 56m left`) that the client cannot reproduce, causing a
React #418 hydration mismatch. It fires locally because the mock data has an active
discount and does not fire on production because no real discount is currently
running — proven by sweeping both with the same browser. **It will fire on
production the moment a real flash discount is active.**
