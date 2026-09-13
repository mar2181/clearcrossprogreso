import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { bilingualAlternates } from '@/lib/hreflang';

/*
 * ⛔ A SERVER WRAPPER SO THE PAGE CAN HAVE ITS OWN TITLE. The body is a client
 * component, which cannot export metadata, so until 2026-09-13 /about shipped the
 * root layout's "Best Dentists & Medical Services..." — the same title as the
 * home page and every 404. Duplicate titles tell Google several URLs are one page.
 */
export const metadata: Metadata = {
  title: 'About ClearCross Progreso: Healthcare Prices Across the Border',
  description:
    'Who runs ClearCross, why it exists, and how we collect the prices for dentists, pharmacies and clinics in Nuevo Progreso, Mexico.',
  alternates: bilingualAlternates('/about', 'en'),
};

export default function AboutPage() {
  return <AboutClient />;
}
