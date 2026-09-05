'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { categoryLabel } from '@/lib/i18n/category-label';
import { TrendingDown, DollarSign } from 'lucide-react';
import { US_BENCHMARKS, getSavings } from '@/lib/us-benchmarks';
import { formatUSD } from '@/lib/utils';

interface SavingsBannerProps {
  providers: any[];
  categoryName: string;
  categorySlug: string;
}

// Category-specific savings callouts, keyed to the dictionary so they read in
// the visitor's language. ⚠️ The percentages are HAND-WRITTEN, not computed
// from the prices below them -- see the note in STATE.md.
const SAVINGS_HEADLINE_KEYS: Record<string, 'savingsDentists' | 'savingsCosmeticSurgery' | 'savingsOptometrists' | 'savingsDoctors' | 'savingsPharmacies' | 'savingsSpas'> = {
  dentists: 'savingsDentists',
  'cosmetic-surgery': 'savingsCosmeticSurgery',
  optometrists: 'savingsOptometrists',
  doctors: 'savingsDoctors',
  pharmacies: 'savingsPharmacies',
  spas: 'savingsSpas',
};

const SavingsBanner: React.FC<SavingsBannerProps> = ({ providers, categoryName, categorySlug }) => {
  const { dict } = useI18n();
  // Collect all unique procedures with prices from all providers in this category
  const procedureSavings: Map<string, { name: string; usPrice: number; mexicoPriceLow: number; percentSaved: number }> = new Map();

  for (const provider of providers) {
    const prices = provider.provider_prices || provider.prices || [];
    for (const price of prices) {
      if (!price.price_usd || price.price_usd <= 0) continue;
      const slug = price.procedure?.slug || price.procedure_id;
      if (!slug) continue;
      const savings = getSavings(slug, price.price_usd);
      if (!savings) continue;
      const existing = procedureSavings.get(slug);
      if (!existing || price.price_usd < existing.mexicoPriceLow) {
        procedureSavings.set(slug, {
          name: price.procedure?.name || slug,
          usPrice: savings.usPrice,
          mexicoPriceLow: price.price_usd,
          percentSaved: savings.percentSaved,
        });
      }
    }
  }

  if (procedureSavings.size === 0) return null;

  // Sort by savings percentage descending, pick top 4-5
  const topSavings = Array.from(procedureSavings.values())
    .sort((a, b) => b.percentSaved - a.percentSaved)
    .slice(0, 5);

  const headlineKey = SAVINGS_HEADLINE_KEYS[categorySlug];
  const headline = headlineKey
    ? dict.ui[headlineKey]
    : dict.ui.savingsGeneric.replace('{category}', categoryLabel(categorySlug, dict, categoryName));

  return (
    <div className="bg-gradient-to-r from-brand-green/5 to-brand-green/10 border border-brand-green/20 rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-green/15 flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <h3 className="font-display font-bold text-neutral-dark text-lg">
            💰 {headline}
          </h3>
          <p className="text-sm text-neutral-mid mt-1">
            {/*
              ⛔ "All procedures by licensed professionals." was live here on every
              category page and we have checked nobody's licence. Attribute the
              figures instead. See test/honest-claims.mjs section 9.
            */}
            {dict.ui.savingsBannerNote}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {topSavings.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm"
          >
            <p className="text-sm font-semibold text-neutral-dark mb-2 line-clamp-1">
              {item.name}
            </p>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-neutral-400">{dict.ui.savingsFrom}</p>
                <p className="text-xl font-bold text-brand-green">
                  {formatUSD(item.mexicoPriceLow)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">{dict.ui.savingsUsAvg}</p>
                <p className="text-sm text-neutral-400 line-through">
                  {formatUSD(item.usPrice)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                {dict.ui.savePercent.replace('{n}', String(item.percentSaved))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavingsBanner;
