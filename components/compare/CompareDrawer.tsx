'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { X, GitCompareArrows, ShieldCheck, Star, TrendingDown } from 'lucide-react';
import { formatUSD, cn } from '@/lib/utils';
import { getSavings, US_BENCHMARKS } from '@/lib/us-benchmarks';

export interface CompareProvider {
  id: string;
  name: string;
  slug: string;
  address: string;
  verified: boolean;
  avg_rating: number | null;
  review_count: number;
  categorySlug: string;
  prices: {
    procedureName: string;
    procedureSlug: string;
    priceUsd: number | null;
  }[];
}

interface CompareDrawerProps {
  providers: CompareProvider[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function CompareDrawer({ providers, onRemove, onClear }: CompareDrawerProps) {
  if (providers.length === 0) return null;

  // Collect all unique procedures across selected providers
  const allProcedures = new Map<string, { name: string; usPrice: number }>();
  for (const p of providers) {
    for (const price of p.prices) {
      if (price.priceUsd && price.priceUsd > 0 && !allProcedures.has(price.procedureSlug)) {
        const usPrice = US_BENCHMARKS[price.procedureSlug];
        if (usPrice) {
          allProcedures.set(price.procedureSlug, {
            name: price.procedureName,
            usPrice,
          });
        }
      }
    }
  }

  const procedureList = Array.from(allProcedures.entries());

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-brand-blue shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-brand-blue" />
            <h3 className="font-display font-bold text-neutral-dark">
              Compare {providers.length} Provider{providers.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-sm text-neutral-400 hover:text-neutral-dark transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="inline-flex gap-4 min-w-full">
            {/* Provider columns */}
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex-shrink-0 w-64 bg-neutral-50 rounded-xl border border-neutral-200 p-4"
              >
                {/* Provider header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${provider.categorySlug}/${provider.slug}`}
                      className="font-semibold text-sm text-neutral-dark hover:text-brand-blue transition-colors line-clamp-1"
                    >
                      {provider.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {provider.verified && (
                        <span className="text-xs text-brand-green font-medium">✓ Verified</span>
                      )}
                      {provider.avg_rating && (
                        <span className="text-xs text-neutral-mid flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber text-amber" />
                          {provider.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(provider.id)}
                    className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>

                {/* Prices */}
                <div className="space-y-2">
                  {procedureList.map(([slug, { name, usPrice }]) => {
                    const providerPrice = provider.prices.find(
                      (p) => p.procedureSlug === slug
                    );
                    const mexicoPrice = providerPrice?.priceUsd;
                    const savings = mexicoPrice ? getSavings(slug, mexicoPrice) : null;

                    return (
                      <div key={slug} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-mid truncate mr-2">{name}</span>
                        {mexicoPrice ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="font-bold text-brand-green">
                              {formatUSD(mexicoPrice)}
                            </span>
                            {savings && (
                              <span className="text-[10px] text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded-full font-bold">
                                -{savings.percentSaved}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <Link
                  href={`/${provider.categorySlug}/${provider.slug}`}
                  className="mt-3 block text-center text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
                >
                  View full profile →
                </Link>
              </div>
            ))}

            {/* US price reference column */}
            {procedureList.length > 0 && (
              <div className="flex-shrink-0 w-48 bg-neutral-100 rounded-xl border border-neutral-200 p-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">
                  🇺🇸 US Average
                </p>
                <div className="space-y-2">
                  {procedureList.map(([slug, { name, usPrice }]) => (
                    <div key={slug} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 truncate mr-2">{name}</span>
                      <span className="text-neutral-400 line-through flex-shrink-0">
                        {formatUSD(usPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage compare state
 */
export function useCompare() {
  const [compareList, setCompareList] = useState<CompareProvider[]>([]);

  const addToCompare = useCallback((provider: CompareProvider) => {
    setCompareList((prev) => {
      if (prev.length >= 3) return prev; // Max 3
      if (prev.some((p) => p.id === provider.id)) return prev;
      return [...prev, provider];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback(
    (id: string) => compareList.some((p) => p.id === id),
    [compareList]
  );

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore: compareList.length < 3,
  };
}
