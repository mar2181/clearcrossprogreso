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

// Re-export the default component + static params from English version
export { default } from '@/app/[category]/page';
export { generateStaticParams } from '@/app/[category]/page';
// Route segment config is read per route file, so the Spanish tree needs its
// own export -- without it /es would stay build-time-only while / revalidates.
export { revalidate } from '@/app/[category]/page';
