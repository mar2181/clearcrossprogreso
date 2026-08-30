import { Locale } from './context';

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/es') || pathname.startsWith('/es/')) {
    return 'es';
  }
  return 'en';
}

/**
 * Routes that exist in ENGLISH ONLY.
 *
 * ⛔ There is no `/es/auth` tree, so localising an auth path produces a 404. The
 * rule lives here rather than at each link because the navbar, the mobile menu
 * and the footer all route through this one function — and the next auth link
 * somebody adds will too.
 *
 * The cost is honest and deliberate: a Spanish-speaking visitor gets an English
 * sign-in page. That is strictly better than the 404 they got before, and the
 * fix is to translate the page, not to re-break the link.
 */
const ENGLISH_ONLY = ['/auth/'];

export function localizedPath(path: string, locale: Locale): string {
  if (ENGLISH_ONLY.some((prefix) => path.startsWith(prefix))) return path;
  if (locale === 'es') {
    if (path.startsWith('/es')) return path;
    return `/es${path}`;
  }
  if (path.startsWith('/es')) {
    return path.slice(3) || '/';
  }
  return path;
}

export function stripLocale(path: string): string {
  if (path.startsWith('/es')) {
    return path.slice(3) || '/';
  }
  return path;
}
