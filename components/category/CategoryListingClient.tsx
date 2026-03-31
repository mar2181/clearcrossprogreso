'use client';

import React, { useMemo, useState } from 'react';
import { Provider, Procedure } from '@/lib/types';
import { cn } from '@/lib/utils';
import ProviderCard from '@/components/providers/ProviderCard';
import Button from '@/components/ui/Button';
import { ChevronDown, Award, SlidersHorizontal, X } from 'lucide-react';

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
  // Draft selection (what user is picking)
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  // Applied filter (what's actually filtering results)
  const [appliedProcedures, setAppliedProcedures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [minExperience, setMinExperience] = useState<number>(0);

  const currentYear = new Date().getFullYear();

  // Detect if user has changed filters but not applied yet
  const hasUnappliedChanges = useMemo(() => {
    if (selectedProcedures.length !== appliedProcedures.length) return true;
    return !selectedProcedures.every((id) => appliedProcedures.includes(id));
  }, [selectedProcedures, appliedProcedures]);

  const handleApplyFilters = () => {
    setAppliedProcedures([...selectedProcedures]);
  };

  const handleClearFilters = () => {
    setSelectedProcedures([]);
    setAppliedProcedures([]);
    setMinExperience(0);
  };

  // Filter providers by APPLIED procedures and experience
  const filteredProviders = useMemo(() => {
    let filtered = providers;

    if (appliedProcedures.length > 0) {
      filtered = filtered.filter((provider) => {
        const prices = (provider as any).provider_prices;
        if (!prices || prices.length === 0) return false;
        const providerProcedureIds = (prices as any[]).map(
          (p) => p.procedure_id || p.procedure?.id
        );
        return appliedProcedures.some((procId) =>
          providerProcedureIds.includes(procId)
        );
      });
    }

    if (minExperience > 0) {
      filtered = filtered.filter((provider) => {
        if (!provider.graduation_year) return false;
        const years = currentYear - provider.graduation_year;
        return years >= minExperience;
      });
    }

    return filtered;
  }, [providers, appliedProcedures, minExperience, currentYear]);

  // Sort providers — use filtered procedure price when sorting by price
  const sortedProviders = useMemo(() => {
    const sorted = [...filteredProviders];

    const compareBySort = (a: typeof sorted[0], b: typeof sorted[0]) => {
      switch (sortBy) {
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'price-low': {
          const priceA = getRelevantPrice(a, appliedProcedures);
          const priceB = getRelevantPrice(b, appliedProcedures);
          if (priceA === null) return 1;
          if (priceB === null) return -1;
          return priceA - priceB;
        }
        case 'price-high': {
          const priceA = getRelevantPrice(a, appliedProcedures);
          const priceB = getRelevantPrice(b, appliedProcedures);
          if (priceA === null) return -1;
          if (priceB === null) return 1;
          return priceB - priceA;
        }
        case 'reviewed':
          return b.review_count - a.review_count;
        default:
          return 0;
      }
    };

    return sorted.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return compareBySort(a, b);
    });
  }, [filteredProviders, sortBy, appliedProcedures]);

  const handleProcedureToggle = (procId: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procId)
        ? prev.filter((id) => id !== procId)
        : [...prev, procId]
    );
  };

  // Get applied procedure names for the active filter banner
  const appliedProcedureNames = useMemo(() => {
    return appliedProcedures.map((id) => {
      const proc = procedures.find((p) => p.id === id);
      return proc?.name || id;
    });
  }, [appliedProcedures, procedures]);

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

      {/* Experience Filter */}
      {providers.some(p => p.graduation_year) && (
        <div>
          <p className="text-sm font-semibold text-neutral-dark mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-brand-navy" />
            Filter by Experience
          </p>
          <div className="flex gap-2 flex-wrap">
            {[0, 5, 10, 15, 20, 25].map((years) => (
              <button
                key={years}
                onClick={() => setMinExperience(years)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  minExperience === years
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-neutral-dark border-neutral-200 hover:border-brand-navy hover:text-brand-navy'
                )}
              >
                {years === 0 ? 'Any' : `${years}+ years`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apply Filters Button */}
      {(selectedProcedures.length > 0 || appliedProcedures.length > 0) && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleApplyFilters}
            disabled={!hasUnappliedChanges}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              hasUnappliedChanges
                ? 'bg-brand-blue text-white hover:bg-brand-navy shadow-md hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {appliedProcedures.length > 0 ? 'Update Results' : 'Show Results'}
          </button>
          {appliedProcedures.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-mid hover:text-neutral-dark hover:bg-neutral-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Active Filter Banner */}
      {appliedProcedures.length > 0 && (
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-5 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-brand-blue">Showing prices for:</span>
          {appliedProcedureNames.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue text-white text-xs font-semibold rounded-full"
            >
              {name}
              <button
                onClick={() => {
                  const newSelected = selectedProcedures.filter(
                    (id) => procedures.find((p) => p.id === id)?.name !== name
                  );
                  const newApplied = appliedProcedures.filter(
                    (id) => procedures.find((p) => p.id === id)?.name !== name
                  );
                  setSelectedProcedures(newSelected);
                  setAppliedProcedures(newApplied);
                }}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
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
              filteredProcedureIds={appliedProcedures}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">
            No providers found matching your criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="text-brand-blue font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

function getRelevantPrice(provider: Provider, procedureIds: string[]): number | null {
  const prices = ((provider as any).provider_prices as any[])?.filter(
    (p) => p.price_usd
  ) || [];

  if (prices.length === 0) return null;

  // When procedure filter is active, use only matching prices
  if (procedureIds.length > 0) {
    const filtered = prices.filter((p) =>
      procedureIds.includes(p.procedure_id || p.procedure?.id)
    );
    if (filtered.length === 0) return null;
    return Math.min(...filtered.map((p) => p.price_usd));
  }

  return Math.min(...prices.map((p) => p.price_usd));
}

export default CategoryListingClient;
