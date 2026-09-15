/**
 * The /prices hub body, shared by app/prices/page.tsx and app/es/prices/page.tsx.
 *
 * ⛔ WHY THIS EXISTS (2026-09-14). Search Console, 28 days: /pharmacies ranked
 * ~9-10 for "progreso mexico pharmacy price list" and its variants with zero
 * clicks, and the comparison pages were reachable only from a strip on each
 * category page and the home page. Nothing answered the head term itself —
 * "Nuevo Progreso prices" — and no single page let a crawler find every one.
 *
 * ⛔ A COMPONENT, NOT A PAGE WITH A `locale` PROP. Next type-checks a static
 * route's default export against its generated PageProps, and an extra prop
 * fails the build ("does not satisfy the constraint '{ [x: string]: never; }'").
 *
 * ⛔ Every figure comes from getPriceIndex(), built from the same
 * getProcedureComparison() each linked page renders, so "from $X" here is the
 * number at the top of the page it links to. Guarded in test/procedure-pages.mjs
 * against the BUILT pages, not the function.
 */
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getPriceIndex } from '@/lib/data';
import { procedurePath } from '@/lib/procedure-pages';
import { en, es, type Locale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/get-locale';
import { categoryLabel } from '@/lib/i18n/category-label';
import { procedureLabel } from '@/lib/i18n/procedure-label';
import { formatUSD } from '@/lib/utils';
import { SITE_URL } from '@/lib/schema';

export default async function PriceHub({ locale }: { locale: Locale }) {
  const dict = locale === 'es' ? es : en;
  const t = dict.ui;
  const index = await getPriceIndex();
  if (index.length === 0) notFound();

  // Group by category, keeping the order the index already sorts in
  // (most clinics first), so the deepest comparisons lead each group.
  const groups: { slug: string; label: string; rows: typeof index }[] = [];
  for (const row of index) {
    let g = groups.find((x) => x.slug === row.categorySlug);
    if (!g) {
      g = { slug: row.categorySlug, label: categoryLabel(row.categorySlug, dict, row.categoryName), rows: [] };
      groups.push(g);
    }
    g.rows.push(row);
  }

  const base = SITE_URL + (locale === 'es' ? '/es' : '');
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': base + '/prices#pages',
        name: t.pricesHubHeading,
        numberOfItems: index.length,
        itemListElement: index.map((row, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: procedureLabel(row.slug, locale, row.name),
          url: base + procedurePath(row.slug),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': base + '/prices#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: dict.category.home, item: base },
          { '@type': 'ListItem', position: 2, name: t.pricesHubCrumb },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-400 flex-wrap">
            <li>
              <Link href={localizedPath('/', locale)} className="hover:text-brand-blue transition-colors">
                {dict.category.home}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-neutral-dark font-medium">{t.pricesHubCrumb}</li>
          </ol>
        </div>
      </nav>

      <div className="bg-brand-navy text-white">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4 max-w-3xl">
            {t.pricesHubHeading}
          </h1>
          <p className="text-lg text-white/85 max-w-2xl leading-relaxed">
            {t.pricesHubIntro.replace('{n}', String(index.length))}
          </p>
        </div>
      </div>

      <div className="container-page py-10 sm:py-14 space-y-10">
        {groups.map((g) => (
          <section key={g.slug}>
            <h2 className="font-display font-semibold text-neutral-dark text-xl mb-4">
              <Link href={localizedPath(`/${g.slug}`, locale)} className="hover:text-brand-blue transition-colors">
                {g.label}
              </Link>
            </h2>
            <ul className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100 shadow-sm">
              {g.rows.map((row) => (
                <li key={row.slug}>
                  <Link
                    href={localizedPath(procedurePath(row.slug), locale)}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors"
                    data-hub-row={row.slug}
                  >
                    <span className="font-semibold text-neutral-dark">{procedureLabel(row.slug, locale, row.name)}</span>
                    <span className="flex items-center gap-4 text-sm">
                      <span className="hidden sm:inline text-neutral-400 whitespace-nowrap">
                        {t.procClinicCount.replace('{n}', String(row.clinicCount))}
                      </span>
                      <span className="font-bold tabular-nums text-neutral-dark whitespace-nowrap" data-hub-from={row.lowUsd}>
                        {t.pricesHubFrom.replace('{price}', row.lowUsd === 0 ? t.procFree : formatUSD(row.lowUsd))}
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-sm text-neutral-mid leading-relaxed max-w-3xl">{t.priceSourceNote}</p>
      </div>
    </main>
  );
}
