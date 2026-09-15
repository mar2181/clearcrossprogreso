import { Metadata } from 'next';
import { getCategoryBySlug, getCategoryCounts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { bilingualAlternates } from '@/lib/hreflang';

const CATEGORY_LABELS_ES: Record<string, string> = {
  dentists: 'Dentistas',
  pharmacies: 'Farmacias',
  spas: 'Spas y Bienestar',
  optometrists: 'Cuidado de la Vista',
  'cosmetic-surgery': 'Cirugía Estética',
  doctors: 'Doctores',
  liquor: 'Licores',
  vets: 'Veterinaria',
};

// "Precios de <x>" in the title and "Compare N <x>" in the snippet. Kept as
// separate maps because Spanish gender makes one noun read wrong in one slot.
const CATEGORY_TITLE_NOUN_ES: Record<string, string> = {
  dentists: 'dentistas',
  pharmacies: 'farmacias',
  spas: 'spas',
  doctors: 'doctores',
  optometrists: 'ópticas',
  'cosmetic-surgery': 'cirugía estética',
  vets: 'veterinarios',
  liquor: 'licores',
};
const CATEGORY_NOUN_ES: Record<string, string> = {
  dentists: 'dentistas',
  pharmacies: 'farmacias',
  spas: 'spas',
  doctors: 'doctores',
  optometrists: 'ópticas y optometristas',
  'cosmetic-surgery': 'clínicas de cirugía estética',
  vets: 'veterinarios',
  liquor: 'tiendas de licores',
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategoryBySlug(category);

  if (!categoryData) {
    return { title: 'Categoría No Encontrada | ClearCross' };
  }

  const spanishName = CATEGORY_LABELS_ES[category] || categoryData.name;
  // ⛔ Mirrors app/[category]/page.tsx: the old description promised "lea
  // reseñas" over an empty reviews table. See the comment there.
  const counts = await getCategoryCounts().catch(() => ({} as Record<string, number>));
  const n = counts[category] || 0;
  const titleNoun = CATEGORY_TITLE_NOUN_ES[category];
  const noun = CATEGORY_NOUN_ES[category];
  const title = n >= 2 && titleNoun
    ? `Precios de ${titleNoun} en Nuevo Progreso, México — compare ${n} | ClearCross`
    : `${spanishName} en Nuevo Progreso, México | ClearCross`;
  const description = n >= 2 && noun
    ? `Compare ${n} ${noun} en Nuevo Progreso, México, uno al lado del otro: precios publicados y teléfonos en un solo lugar. Conozca el precio antes de cruzar el puente.`
    : `${spanishName} en Nuevo Progreso, México — parte de ClearCross, un directorio bilingüe de los negocios al otro lado del puente de Progreso.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_MX',
    },
    alternates: bilingualAlternates(`/${category}`, 'es'),
  };
}

// ⛔ NOT a bare re-export any more. The English component now takes a locale
// and defaults to 'en', so re-exporting it served English copy on every page of
// the Spanish tree -- only the <title> was translated. Pass the locale.
import CategoryPage from '@/app/[category]/page';

export default async function EsCategoryPage({ params }: CategoryPageProps) {
  return CategoryPage({ params, locale: 'es' });
}

export { generateStaticParams } from '@/app/[category]/page';
// ⛔ DECLARED, NOT RE-EXPORTED — and the reason is narrower than it looks.
// `export { revalidate } from '...'` makes Next warn on every build: "can't
// recognize the exported `revalidate` field ... The default config will be
// used instead".
//
// ⚠️ THAT WARNING OVERSTATES IT, and this was measured rather than assumed:
// the route table printed `1h` for this route with the re-export in place,
// exactly as it does now. So the re-export was NOT silently disabling ISR.
// What the declared form buys is that the value is statically analysable and
// the build stops emitting a warning nobody can act on — and a build that
// cries wolf four times is a build whose real warnings get skimmed.
//
// ⛔ This value must match app/[category]/page.tsx. Guarded in test/procedure-pages.mjs.
export const revalidate = 3600;
