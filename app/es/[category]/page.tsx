import { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/data';
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
  return {
    title: `${spanishName} en Nuevo Progreso México — Compare Precios y Ahorre | ClearCross`,
    description: `Encuentre ${spanishName.toLowerCase()} verificados en Nuevo Progreso, México. Compare precios, lea reseñas y ahorre mucho comparado con precios en EE.UU. Obtenga cotizaciones escritas antes de cruzar.`,
    openGraph: {
      title: `${spanishName} en Nuevo Progreso México | ClearCross`,
      description: `Compare precios y ahorre en ${spanishName.toLowerCase()} en Nuevo Progreso, México.`,
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
