'use client';

import { useEffect, useState } from 'react';
import { PORTAL_LOCALE_COOKIE, DEFAULT_PORTAL_LOCALE, parsePortalLocale } from './locale-shared';
import { Locale } from './context';

function readCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_PORTAL_LOCALE;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${PORTAL_LOCALE_COOKIE}=([^;]*)`)
  );
  return parsePortalLocale(match ? decodeURIComponent(match[1]) : null);
}

// Client-component read of the same cookie `serverLocale.ts` reads
// server-side. Starts at the default for the first render (matches what the
// server rendered, avoiding a hydration mismatch) then corrects itself from
// the real cookie on mount — the correction is invisible in practice because
// it happens before paint on any machine fast enough to matter here.
export function usePortalLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(DEFAULT_PORTAL_LOCALE);

  useEffect(() => {
    setLocale(readCookie());
  }, []);

  return locale;
}

// Sets the portal language and reloads. A full reload — rather than trying
// to re-render every open form in place — is what guarantees the server
// components on this page (which read the cookie fresh on every request)
// and the client components (which only read it on mount) end up agreeing,
// with nothing left half-translated.
export function setPortalLocale(locale: Locale) {
  document.cookie = `${PORTAL_LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}
