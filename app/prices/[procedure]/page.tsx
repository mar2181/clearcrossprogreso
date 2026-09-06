/**
 * /prices/<procedure> — every clinic's price for one treatment, side by side.
 *
 * ⛔ WHY THIS ROUTE IS STATIC (`app/prices/`) AND NOT `/<category>/<procedure>`.
 * `app/[category]/[provider]` already owns every two-segment path, so a
 * procedure sitting there would be indistinguishable from a clinic slug and the
 * resolver would have to guess. Next resolves a static segment before a dynamic
 * one, so `/prices/...` is unambiguous by construction. ⛔ It also means no
 * category may ever use the slug `prices` — guarded in test/procedure-pages.mjs.
 *
 * ⛔ THE SPANISH PATH IS `/es/prices/...`, NOT `/es/precios/...`. Every route on
 * this site mirrors its English path exactly (`/es/how-it-works`, `/es/safety`,
 * `/es/dentists`), and lib/hreflang.ts derives the Spanish URL from the English
 * one for precisely that reason. Inventing a translated segment here would be
 * the one route the hreflang pair could not derive, and a non-reciprocal
 * hreflang annotation is discarded wholesale by Google.
 *
 * ⚠️ NO JSON-LD, DELIBERATELY, THIS ROUND. An ItemList of Offers here is
 * defensible and probably worth having — but test/schema.mjs walks the eight
 * category directories only, so markup added here would be the one structured-
 * data surface on the site nobody guards. This repo has already shipped a
 * policy violation of exactly that shape (an aggregateRating over a panel
 * reading "No reviews yet"). Ship the markup with its own guard, not before.
 */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Phone, ArrowRight, TrendingDown } from 'lucide-react';
import { getPricedProcedures, getProcedureComparison } from '@/lib/data';
import { procedurePath } from '@/lib/procedure-pages';
import { bilingualAlternates } from '@/lib/hreflang';
import { en, es, type Locale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/get-locale';
import { categoryLabel } from '@/lib/i18n/category-label';
import { procedureLabel } from '@/lib/i18n/procedure-label';
import { formatUSD } from '@/lib/utils';

interface PageProps {
  params: Promise<{ procedure: string }>;
}

/**
 * ⛔ Same reasoning as the category pages: these filter on `verified` and on
 * price rows, and BOTH change outside a deploy. Baked purely at build time a
 * clinic that just earned its listing stays off the comparison until somebody
 * pushes code, and nothing anywhere goes red.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const procs = await getPricedProcedures();
  return procs.map((p) => ({ procedure: p.slug }));
}

/**
 * ⛔ A slug with no comparison must 404, not render an empty page — which is
 * what the null check below does. Params are generated for the pages that clear
 * the bar; anything else falls through to notFound().
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { procedure } = await params;
  const c = await getProcedureComparison(procedure);
  if (!c) return { title: 'Not Found | ClearCross' };

  const low = formatUSD(c.lowUsd);
  const title = `${c.procedureName} Cost in Nuevo Progreso — ${c.entries.length} Clinic Prices Compared | ClearCross`;
  const description = c.usBenchmarkUsd
    ? `${c.entries.length} clinics in Nuevo Progreso publish a price for ${c.procedureName.toLowerCase()}, from ${low}. Average US self-pay price is ${formatUSD(c.usBenchmarkUsd)}. Compare every clinic, then get the price in writing.`
    : `${c.entries.length} clinics in Nuevo Progreso publish a price for ${c.procedureName.toLowerCase()}, from ${low}. Compare every clinic side by side, then get the price in writing.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    alternates: bilingualAlternates(procedurePath(procedure), 'en'),
  };
}

export default async function ProcedurePricePage({
  params,
  locale = 'en',
}: PageProps & { locale?: Locale }) {
  const { procedure } = await params;
  const dict = locale === 'es' ? es : en;
  const t = dict.ui;

  const c = await getProcedureComparison(procedure);
  if (!c) notFound();

  const procName = procedureLabel(c.procedureSlug, locale, c.procedureName);
  const catName = categoryLabel(c.categorySlug, dict, c.categoryName);
  const allSame = c.lowUsd === c.highUsd;

  // Sibling comparisons in the same category — the internal links that let a
  // crawler reach these pages from each other rather than from the sitemap
  // alone, and the single most useful thing to a reader who is price-shopping.
  const siblings = (await getPricedProcedures())
    .filter((p) => p.categorySlug === c.categorySlug && p.slug !== c.procedureSlug)
    .slice(0, 8);

  const price = (n: number) => (n === 0 ? t.procFree : formatUSD(n));

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-400 flex-wrap">
            <li>
              <Link href={localizedPath('/', locale)} className="hover:text-brand-blue transition-colors">
                {dict.category.home}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li>
              <Link href={localizedPath(`/${c.categorySlug}`, locale)} className="hover:text-brand-blue transition-colors">
                {catName}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-neutral-dark font-medium">{procName}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-brand-navy text-white">
        <div className="container-page py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4 max-w-3xl">
            {t.procHeading.replace('{procedure}', procName)}
          </h1>
          <p className="text-lg text-white/85 max-w-2xl leading-relaxed">
            {t.procIntro.replace('{n}', String(c.entries.length))}
          </p>

          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <div className="bg-white/10 rounded-xl px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-white/60 mb-1">{t.savingsFrom}</p>
              <p className="text-2xl font-bold tabular-nums">{price(c.lowUsd)}</p>
            </div>
            {c.usBenchmarkUsd !== null && (
              <div className="bg-white/10 rounded-xl px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-1">{t.procUsAvgLabel}</p>
                <p className="text-2xl font-bold tabular-nums text-white/70 line-through">
                  {formatUSD(c.usBenchmarkUsd)}
                </p>
              </div>
            )}
            {c.bestSavingPercent !== null && (
              <div className="bg-brand-green rounded-xl px-5 py-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                <p className="text-lg font-bold">
                  {t.procSaveUpTo.replace('{n}', String(c.bestSavingPercent))}
                </p>
              </div>
            )}
          </div>

          <p className="mt-5 text-sm text-white/70 max-w-2xl">
            {allSame
              ? t.procAllSame.replace('{n}', String(c.entries.length)).replace('{low}', price(c.lowUsd))
              : t.procRange.replace('{low}', price(c.lowUsd)).replace('{high}', price(c.highUsd))}
          </p>
        </div>
      </div>

      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* The comparison itself */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-neutral-100 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <span>{t.procTableClinic}</span>
                <span className="text-right">{t.procTablePrice}</span>
                <span />
              </div>

              <ul className="divide-y divide-neutral-100">
                {c.entries.map((e, i) => (
                  <li
                    key={e.providerSlug}
                    className={`px-5 py-4 sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4 sm:items-center ${
                      i === 0 ? 'bg-brand-green/5' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <Link
                        href={localizedPath(`/${c.categorySlug}/${e.providerSlug}`, locale)}
                        className="font-semibold text-neutral-dark hover:text-brand-blue transition-colors"
                      >
                        {e.providerName}
                      </Link>
                      {e.priceNotes && (
                        <p className="text-sm text-neutral-mid mt-0.5">{e.priceNotes}</p>
                      )}
                    </div>

                    <p
                      className={`text-xl font-bold tabular-nums mt-2 sm:mt-0 sm:text-right ${
                        i === 0 ? 'text-brand-green' : 'text-neutral-dark'
                      }`}
                    >
                      {price(e.priceUsd)}
                    </p>

                    <div className="flex items-center gap-3 mt-2 sm:mt-0 sm:justify-end">
                      {e.phone && (
                        <a
                          href={`tel:${e.phone.replace(/[^0-9+]/g, '')}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {t.procCall}
                        </a>
                      )}
                      <Link
                        href={localizedPath(`/${c.categorySlug}/${e.providerSlug}`, locale)}
                        className="text-sm text-neutral-400 hover:text-brand-blue transition-colors whitespace-nowrap"
                      >
                        {t.procViewClinic}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/*
              ⛔ THE DISCLOSURE IS THE SHIPPED STRING, REUSED VERBATIM.
              An unknown share of these figures came from public listings rather
              than from the clinic, none of them was confirmed by the clinic, and
              a comparison page states them side by side as if settled. Writing a
              second, gentler sentence here is exactly how the site would end up
              making two different claims about the same numbers.
            */}
            <p className="mt-4 text-sm text-neutral-mid leading-relaxed">
              {t.priceSourceNote}
            </p>

            {siblings.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display font-semibold text-neutral-dark text-lg mb-4">
                  {t.procAlsoCompared}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {siblings.map((s) => (
                    <Link
                      key={s.slug}
                      href={localizedPath(procedurePath(s.slug), locale)}
                      className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full pl-4 pr-3 py-2 text-sm font-medium text-neutral-dark hover:border-brand-blue hover:text-brand-blue transition-colors"
                    >
                      {procedureLabel(s.slug, locale, s.name)}
                      <span className="text-xs text-neutral-400 tabular-nums">
                        {t.procClinicCount.replace('{n}', String(s.clinicCount))}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-blue to-brand-navy rounded-xl p-6 text-white shadow-sm">
              <h2 className="font-display font-semibold mb-2">{t.procCtaTitle}</h2>
              <p className="text-sm mb-4 text-blue-200/80">{t.procCtaBody}</p>
              <Link
                href={localizedPath('/quote', locale)}
                className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-light transition-colors text-sm"
              >
                {t.procCtaButton}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <Link
                href={localizedPath(`/${c.categorySlug}`, locale)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
              >
                {t.procBackToCategory.replace('{category}', catName.toLowerCase())}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
