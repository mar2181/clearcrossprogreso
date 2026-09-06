import { Metadata } from 'next';
import { getProcedureComparison } from '@/lib/data';
import { procedurePath } from '@/lib/procedure-pages';
import { bilingualAlternates } from '@/lib/hreflang';
import { procedureLabel } from '@/lib/i18n/procedure-label';
import { formatUSD } from '@/lib/utils';

interface PageProps {
  params: Promise<{ procedure: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { procedure } = await params;
  const c = await getProcedureComparison(procedure);
  if (!c) return { title: 'No Encontrado | ClearCross' };

  const name = procedureLabel(c.procedureSlug, 'es', c.procedureName);
  const low = formatUSD(c.lowUsd);
  const title = `Precio de ${name} en Nuevo Progreso — ${c.entries.length} clínicas comparadas | ClearCross`;
  const description = c.usBenchmarkUsd
    ? `${c.entries.length} clínicas en Nuevo Progreso publican un precio de ${name}, desde ${low}. El promedio de pago propio en EE. UU. es ${formatUSD(c.usBenchmarkUsd)}. Compare todas y pida el precio por escrito.`
    : `${c.entries.length} clínicas en Nuevo Progreso publican un precio de ${name}, desde ${low}. Compárelas una al lado de la otra y pida el precio por escrito.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', locale: 'es_MX' },
    alternates: bilingualAlternates(procedurePath(procedure), 'es'),
  };
}

// ⛔ NOT a bare re-export. The English component takes a locale and defaults to
// 'en', so re-exporting it would serve English copy on the Spanish page with
// only the <title> translated — the exact bug app/es/[category]/page.tsx
// already carries a comment about. Pass the locale.
import ProcedurePricePage from '@/app/prices/[procedure]/page';

export default async function EsProcedurePricePage({ params }: PageProps) {
  return ProcedurePricePage({ params, locale: 'es' });
}

export { generateStaticParams } from '@/app/prices/[procedure]/page';
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
// ⛔ This value must match app/prices/[procedure]/page.tsx. Guarded in test/procedure-pages.mjs.
export const revalidate = 3600;
