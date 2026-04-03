import { Locale } from './context';

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/es') || pathname.startsWith('/es/')) {
    return 'es';
  }
  return 'en';
}

export function localizedPath(path: string, locale: Locale): string {
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
