import type { Metadata } from 'next';
import AboutClient from '@/app/about/AboutClient';
import { bilingualAlternates } from '@/lib/hreflang';

/*
 * ⛔ NOT A BARE RE-EXPORT OF THE ENGLISH ROUTE. The client body resolves its
 * language from the pathname; only the metadata differs. A re-export inherited
 * the Spanish home page's title, so /es/about and /es were the same page to Google.
 */
export const metadata: Metadata = {
  title: 'Acerca de ClearCross Progreso: precios de salud al otro lado de la frontera',
  description:
    'Quién está detrás de ClearCross, por qué existe y cómo reunimos los precios de dentistas, farmacias y consultorios en Nuevo Progreso, México.',
  alternates: bilingualAlternates('/about', 'es'),
};

export default function AboutPageEs() {
  return <AboutClient />;
}
