import type { Metadata } from 'next';
import HowItWorksClient from '@/app/how-it-works/HowItWorksClient';
import { bilingualAlternates } from '@/lib/hreflang';

/*
 * ⛔ NOT A BARE RE-EXPORT OF THE ENGLISH ROUTE. See app/es/about/page.tsx.
 */
export const metadata: Metadata = {
  title: 'Cómo funciona ClearCross: compare precios en Nuevo Progreso antes de cruzar',
  description:
    'Busque un procedimiento, compare los precios publicados consultorio por consultorio y pida una cotización por escrito antes de cruzar el puente a Nuevo Progreso.',
  alternates: bilingualAlternates('/how-it-works', 'es'),
};

export default function HowItWorksPageEs() {
  return <HowItWorksClient />;
}
