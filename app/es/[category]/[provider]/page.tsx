import { Metadata } from 'next';
import { getProviderBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';

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

interface ProviderPageProps {
  params: Promise<{ category: string; provider: string }>;
}

export async function generateMetadata({
  params,
}: ProviderPageProps): Promise<Metadata> {
  const { category, provider } = await params;
  const providerData = await getProviderBySlug(provider);

  if (!providerData) {
    return { title: 'Proveedor No Encontrado | ClearCross' };
  }

  const spanishCategory = CATEGORY_LABELS_ES[category] || category;
  return {
    title: `${providerData.name} — ${spanishCategory} en Nuevo Progreso México | Precios y Reseñas | ClearCross`,
    description: `Vea precios y reseñas para ${providerData.name} en Nuevo Progreso, México. Ahorre mucho comparado con precios en EE.UU. Obtenga una cotización gratuita y escrita.`,
    openGraph: {
      title: `${providerData.name} | ClearCross Progreso`,
      description: `Vea precios, reseñas e información de contacto para ${providerData.name}. Compare precios y ahorre comparado con costos en EE.UU.`,
      type: 'website',
      locale: 'es_MX',
    },
    alternates: {
      canonical: `https://clearcrossprogreso.com/es/${category}/${provider}`,
      languages: {
        'en-US': `https://clearcrossprogreso.com/${category}/${provider}`,
        'es-MX': `https://clearcrossprogreso.com/es/${category}/${provider}`,
      },
    },
  };
}

// Re-export the default component + static params from English version
export { default } from '@/app/[category]/[provider]/page';
export { generateStaticParams } from '@/app/[category]/[provider]/page';
