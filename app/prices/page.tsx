/**
 * /prices — every price comparison on the site, on one page.
 * The body is components/prices/PriceHub.tsx (see why there).
 */
import { Metadata } from 'next';
import { getPriceIndex } from '@/lib/data';
import { bilingualAlternates } from '@/lib/hreflang';
import PriceHub from '@/components/prices/PriceHub';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const index = await getPriceIndex();
  const title = `Nuevo Progreso, Mexico Price List — ${index.length} Treatments Compared Clinic by Clinic | ClearCross`;
  const description = `Published prices in Nuevo Progreso, Mexico for ${index.length} treatments — dental work, pharmacy, eye care and more — each compared clinic by clinic, cheapest first. Know the price before you cross.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: bilingualAlternates('/prices', 'en'),
  };
}

export default async function PricesHubPage() {
  return <PriceHub locale="en" />;
}
