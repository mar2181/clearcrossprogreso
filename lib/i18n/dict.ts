import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import { Locale } from './context';

// The portal reads translated strings straight off these dictionaries —
// no <I18nProvider>/useI18n() context needed. That machinery exists for the
// public site, where a server parent already resolves `locale` once and
// passes it down through several layers of nested components. Every portal
// page resolves its OWN locale (getPortalLocale() server-side,
// usePortalLocale() client-side) and reads directly from here — one fewer
// layer, and it works identically in a server component (no hooks allowed)
// and a client one.
export function dictFor(locale: Locale) {
  return locale === 'es' ? es : en;
}
