import { Locale } from './context';

// The provider/admin portal's own language preference — separate from the
// public site's `/es/...` route-based localization, because this is an
// authenticated area with no SEO stake: one cookie, toggleable in place,
// beats a parallel `/es/provider/*` route tree nobody would ever search for.
//
// This file has NO server- or browser-only imports (no `next/headers`, no
// `document`) so both `serverLocale.ts` (server components) and
// `usePortalLocale.ts` (client components) can share one source of truth for
// the cookie name and the default without either pulling in the other's
// runtime.
export const PORTAL_LOCALE_COOKIE = 'cc_locale';

// Default to Spanish — every real provider signing into this portal is a
// Nuevo Progreso business owner. English is the toggle, not the default.
export const DEFAULT_PORTAL_LOCALE: Locale = 'es';

export function parsePortalLocale(value: string | undefined | null): Locale {
  return value === 'en' || value === 'es' ? value : DEFAULT_PORTAL_LOCALE;
}
