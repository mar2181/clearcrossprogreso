/**
 * The one place that knows how the two language trees pair up.
 *
 * The Spanish tree mirrors the English tree exactly: every route `/x` has a
 * counterpart at `/es/x`. That fact lived in five separate files, each writing
 * its own URL strings by hand — which is how the English side ended up with no
 * hreflang at all while the Spanish side had it.
 *
 * ⛔ HREFLANG IS ONLY VALID IF IT IS RECIPROCAL. Google's rule: if page A names
 * B as its alternate and B does not name A back, the ENTIRE annotation is
 * discarded. Measured on production 2026-08-29 — `/es` emitted two alternate
 * links and `/` emitted zero, so the Spanish tree's hreflang has been doing
 * nothing at all. Both sides now come from this function, so one side cannot
 * gain or lose a link without the other.
 *
 * ⛔ LANGUAGE CODES: the previous annotation used `es-MX`, which targets Spanish
 * speakers *in Mexico* — i.e. it excluded the actual audience, a Spanish-speaking
 * resident of McAllen or Weslaco with a US locale. Bare `es` is a superset of
 * both `es-US` and `es-MX` and cannot mis-target, so it is used instead. Same
 * reasoning for `en` over `en-US`.
 *
 * ⛔ `x-default` points at ENGLISH deliberately. It is what Google serves a
 * visitor whose language matches neither entry (a French speaker, say), not a
 * statement about which audience matters more.
 */

const BASE = 'https://clearcrossprogreso.com';

/**
 * Normalise an English route path to the exact string the site already
 * canonicalises to.
 *
 * ⛔ The home page canonicalises to `https://clearcrossprogreso.com` with NO
 * trailing slash — measured live, not assumed. A self-referencing hreflang must
 * match the canonical character for character, so the two are produced here from
 * the same expression rather than written out twice.
 */
function normalise(path: string): string {
  if (!path || path === '/') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

export function enUrl(path: string): string {
  return `${BASE}${normalise(path)}`;
}

export function esUrl(path: string): string {
  return `${BASE}/es${normalise(path)}`;
}

export type Locale = 'en' | 'es';

/**
 * The full `alternates` block for a bilingual route.
 *
 * @param path   the ENGLISH route path (`/`, `/dentists`, `/blog/some-post`).
 *               The Spanish URL is derived, never passed in — that is what makes
 *               the two trees impossible to drift apart.
 * @param locale which tree this page belongs to, i.e. which URL is canonical.
 */
export function bilingualAlternates(path: string, locale: Locale) {
  const en = enUrl(path);
  const es = esUrl(path);
  return {
    canonical: locale === 'es' ? es : en,
    languages: {
      en,
      es,
      'x-default': en,
    },
  };
}
