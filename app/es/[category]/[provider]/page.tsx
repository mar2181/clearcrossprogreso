import { Metadata } from 'next';
import { getProviderBySlug } from '@/lib/data';
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
    alternates: bilingualAlternates(`/${category}/${provider}`, 'es'),
  };
}

// ⛔ NOT a bare re-export. See app/es/[category]/page.tsx -- the English
// component takes a locale and defaults to 'en', so re-exporting it served
// English copy to every Spanish reader while only the <title> was translated.
import ProviderPage from '@/app/[category]/[provider]/page';

export default async function EsProviderPage({ params }: ProviderPageProps) {
  return ProviderPage({ params, locale: 'es' });
}

export { generateStaticParams } from '@/app/[category]/[provider]/page';
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
// ⛔ This value must match app/[category]/[provider]/page.tsx. Guarded in test/procedure-pages.mjs.
export const revalidate = 3600;
