'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/get-locale';
import { procedureLabel } from '@/lib/i18n/procedure-label';
import { procedurePath } from '@/lib/procedure-pages';
import { PRICED_PROCEDURES } from '@/lib/concierge-routes.generated';

/*
 * ⛔ WHY THIS EXISTS. Measured 2026-09-13 with the Search Console URL Inspection
 * API: every /prices/* page was "Discovered - currently not indexed", and so was
 * /dentists. The home page — the most-crawled page on the site — carried ZERO
 * links to a price page; the only page linking all of them was /dentists, which
 * Google had not read either. So the pages that answer "what does it cost" were
 * reachable only through a page nobody had crawled.
 *
 * ⛔ THE LIST IS GENERATED, NEVER TYPED. PRICED_PROCEDURES is derived from the
 * same threshold generateStaticParams uses, so this block cannot link a 404 and a
 * new price page appears here the next time the builder runs.
 */
export default function PriceLinks() {
  const { dict, locale } = useI18n();
  const d = dict.priceLinks;

  if (PRICED_PROCEDURES.length === 0) return null;

  return (
    <section id="prices" className="w-full py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-green mb-3">
            {d.sectionLabel}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
            {d.headline}
          </h2>
          <p className="font-sans text-neutral-mid text-lg max-w-2xl mx-auto">{d.subtitle}</p>
        </div>

        <ul className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {PRICED_PROCEDURES.map((p) => (
            <li key={p.slug}>
              <Link
                href={localizedPath(procedurePath(p.slug), locale)}
                className="inline-block px-4 py-2 rounded-full border border-neutral-200 bg-neutral-light text-sm font-medium text-neutral-dark hover:border-brand-blue hover:text-brand-blue transition-colors"
              >
                {procedureLabel(p.slug, locale, p.name)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="text-center mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          <Link
            href={localizedPath('/prices', locale)}
            className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:underline"
          >
            {dict.ui.pricesHubLink} →
          </Link>
          <Link
            href={localizedPath('/dentists', locale)}
            className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:underline"
          >
            {d.allDentists} →
          </Link>
        </div>
      </div>
    </section>
  );
}
