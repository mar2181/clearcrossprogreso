import type { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient';
import { bilingualAlternates } from '@/lib/hreflang';

/*
 * ⛔ A SERVER WRAPPER SO THE PAGE CAN HAVE ITS OWN TITLE. See app/about/page.tsx.
 */
export const metadata: Metadata = {
  title: 'How ClearCross Works: Compare Nuevo Progreso Prices Before You Cross',
  description:
    'Search a procedure, compare the published prices clinic by clinic, and ask for a written quote before you walk across the bridge to Nuevo Progreso.',
  alternates: bilingualAlternates('/how-it-works', 'en'),
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
