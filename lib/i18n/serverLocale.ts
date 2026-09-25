import { cookies } from 'next/headers';
import { PORTAL_LOCALE_COOKIE, parsePortalLocale } from './locale-shared';
import { Locale } from './context';

// Server-component read of the provider/admin portal's saved language.
// Never throws on a missing or malformed cookie — falls back to the default
// (Spanish) rather than crashing a dashboard render.
export async function getPortalLocale(): Promise<Locale> {
  const store = await cookies();
  return parsePortalLocale(store.get(PORTAL_LOCALE_COOKIE)?.value);
}
