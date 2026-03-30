'use client';

import React, { useMemo, useState } from 'react';
import { Provider, Procedure } from '@/lib/types';
import { cn } from '@/lib/utils';
import ProviderCard from '@/components/providers/ProviderCard';
import Button from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';

interface CategoryListingClientProps {
  providers: Provider[];
  procedures: Procedure[];
  categoryName: string;
  categorySlug: string;
}

type SortOption = 'rating' | 'price-low' | 'price-high' | 'reviewed';

const CategoryListingClient: React.FC<CategoryListingClientProps> = ({
  providers,
  procedures,
  categoryName,
  categorySlug,
}) => {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Filter providers by selected procedures
  const filteredProviders = useMemo(() => {
    if (selectedProcedures.length === 0) {
      return providers;
    }

    return providers.filter((provider) => {
      // Check if provider has prices for any selected procedures
      const prices = (provider as any).provider_prices;
      if (!prices || prices.length === 0) {
        return false;
      }

      const providerProcedureIds = (prices as any[]).map(
        (p) => p.procedure_id || p.procedure?.id
      );

      return selectedProcedures.some((procId) =>
        providerProcedureIds.includes(procId)
      );
    });
  }, [providers, selectedProcedures]);

  // Sort providers
  const sortedProviders = useMemo(() => {
    const sorted = [...filteredProviders];

    switch (sortBy) {
      case 'rating':
        return sorted.sort(
          (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)
        );

      case 'price-low': {
        return sorted.sort((a, b) => {
          const priceA = getLowestPrice(a);
          const priceB = getLowestPrice(b);
          if (priceA === null) return 1;
          if (priceB === null) return -1;
          return priceA - priceB;
        });
      }

      case 'price-high': {
        return sorted.sort((a, b) => {
          const priceA = getLowestPrice(a);
          const priceB = getLowestPrice(b);
          if (priceA === null) return -1;
          if (priceB === null) return 1;
          return priceB - priceA;
        });
      }

      case 'reviewed':
        return sorted.sort((a, b) => b.review_count - a.review_count);

      default:
        return sorted;
    }
  }, [filteredProviders, sortBy]);

  const handleProcedureToggle = (procId: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procId)
        ? prev.filter((id) => id !== procId)
        : [...prev, procId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Procedure Filter Pills */}
      {procedures.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-neutral-dark mb-3">
            Filter by Procedure
          </p>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 sm:flex-wrap">
              {procedures.map((proc) => (
                <button
                  key={proc.id}
                  onClick={() => handleProcedureToggle(proc.id)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                    selectedProcedures.includes(proc.id)
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-neutral-dark border-neutral-200 hover:border-brand-blue hover:text-brand-blue'
                  )}
                >
                  {proc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort and Results */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-neutral-500">
          Showing {sortedProviders.length} of {providers.length} providers
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-neutral-dark">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm appearance-none bg-white cursor-pointer hover:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
          >
            <option value="rating">Highest Rating</option>
            <option value="reviewed">Most Reviewed</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Provider Grid */}
      {sortedProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={{
                ...provider,
                category: {
                  name: categoryName,
                  slug: categorySlug,
                },
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">
            No providers found matching your criteria.
          </p>
          <button
            onClick={() => setSelectedProcedures([])}
            className="text-brand-blue font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

function getLowestPrice(provider: Provider): number | null {
  const prices = ((provider as any).provider_prices as any[])?.filter(
    (p) => p.price_usd
  ) || [];

  if (prices.length === 0) return null;

  return Math.min(...prices.map((p) => p.price_usd));
}

export default CategoryListingClient;
