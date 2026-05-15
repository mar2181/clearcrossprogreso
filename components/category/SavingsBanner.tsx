import React from 'react';
import { TrendingDown, DollarSign } from 'lucide-react';
import { US_BENCHMARKS, getSavings } from '@/lib/us-benchmarks';
import { formatUSD } from '@/lib/utils';

interface SavingsBannerProps {
  providers: any[];
  categoryName: string;
  categorySlug: string;
}

// Category-specific savings callouts
const SAVINGS_HEADLINES: Record<string, string> = {
  dentists: 'Save up to 96% on dental work vs US prices',
  'cosmetic-surgery': 'Save up to 100% on cosmetic procedures vs US prices',
  optometrists: 'Save up to 90% on eye care vs US prices',
  doctors: 'Save up to 90% on doctor visits & labs vs US prices',
  pharmacies: 'Save up to 99% on prescriptions vs US prices',
  spas: 'Save up to 90% on spa & wellness vs US prices',
};

const SavingsBanner: React.FC<SavingsBannerProps> = ({ providers, categoryName, categorySlug }) => {
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

  const headline = SAVINGS_HEADLINES[categorySlug] || `Save big on ${categoryName} vs US prices`;

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
            Compared to average US self-pay prices. All procedures by licensed professionals.
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
                <p className="text-xs text-neutral-400">From</p>
                <p className="text-xl font-bold text-brand-green">
                  {formatUSD(item.mexicoPriceLow)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">US avg</p>
                <p className="text-sm text-neutral-400 line-through">
                  {formatUSD(item.usPrice)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                Save {item.percentSaved}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavingsBanner;
