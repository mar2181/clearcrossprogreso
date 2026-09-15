import { Metadata } from 'next';
import { getPriceIndex } from '@/lib/data';
import { bilingualAlternates } from '@/lib/hreflang';
import PriceHub from '@/components/prices/PriceHub';

export async function generateMetadata(): Promise<Metadata> {
  const index = await getPriceIndex();
  const title = `Lista de precios en Nuevo Progreso, México — ${index.length} tratamientos, clínica por clínica | ClearCross`;
  const description = `Precios publicados en Nuevo Progreso, México para ${index.length} tratamientos — trabajo dental, farmacia, vista y más — comparados clínica por clínica, del más barato al más caro. Conozca el precio antes de cruzar.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', locale: 'es_MX' },
    alternates: bilingualAlternates('/prices', 'es'),
  };
}

export default async function EsPricesHubPage() {
  return <PriceHub locale="es" />;
}

// ⛔ Declared, not re-exported — same reason as app/es/prices/[procedure]/page.tsx.
// Must match app/prices/page.tsx.
export const revalidate = 3600;
