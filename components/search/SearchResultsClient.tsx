'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Search, ArrowRight } from 'lucide-react';
import { formatUSD } from '@/lib/utils';
import type { SearchResult } from '@/lib/data';

interface SearchResultsClientProps {
  results: SearchResult[];
  query: string;
}

export default function SearchResultsClient({ results, query }: SearchResultsClientProps) {
  if (!query || query.length < 2) {
    return (
      <div className="text-center py-16">
        <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 text-lg">
          Type at least 2 characters to search
        </p>
        <p className="text-neutral-400 text-sm mt-2">
          Search for procedures, services, or provider names
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 text-lg mb-2">
          No results found for &ldquo;{query}&rdquo;
        </p>
        <p className="text-neutral-400 text-sm mb-6">
          Try searching for &ldquo;cleaning&rdquo;, &ldquo;implant&rdquo;, &ldquo;insulin&rdquo;, &ldquo;massage&rdquo;, or a provider name
        </p>
        <Link
          href="/#categories"
          className="inline-block px-6 py-2.5 bg-brand-blue text-white rounded-lg font-medium text-sm hover:bg-brand-navy transition-colors"
        >
          Browse All Categories
        </Link>
      </div>
    );
  }

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    const catName = result.category.name || 'Other';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(result);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([categoryName, categoryResults]) => (
        <div key={categoryName}>
          {/* Category header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-dark flex items-center gap-2">
              {categoryName}
              <span className="text-sm font-normal text-neutral-400">
                ({categoryResults.length})
              </span>
            </h2>
            <Link
              href={`/${categoryResults[0].category.slug}`}
              className="text-sm text-brand-blue font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Result cards */}
          <div className="space-y-3">
            {categoryResults.map((result) => (
              <Link
                key={result.provider.id}
                href={`/${result.category.slug}/${result.provider.slug}`}
                className="block border border-neutral-200 rounded-xl p-4 hover:border-brand-blue/40 hover:shadow-md transition-all bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Provider info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-dark text-sm truncate">
                        {result.provider.name}
                      </h3>
                      {result.provider.verified && (
                        <span className="flex-shrink-0 text-[10px] bg-brand-green/10 text-brand-green font-medium px-1.5 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                      {result.provider.featured && (
                        <span className="flex-shrink-0 text-[10px] bg-amber/10 text-amber font-medium px-1.5 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {result.provider.avg_rating && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                        <span className="text-xs font-medium text-neutral-dark">
                          {result.provider.avg_rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-400">
                          ({result.provider.review_count} reviews)
                        </span>
                      </div>
                    )}

                    {/* Address */}
                    <div className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{result.provider.address}</span>
                    </div>

                    {/* Matched procedures with prices */}
                    {result.matchedProcedures.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedProcedures.slice(0, 4).map((mp) => (
                          <span
                            key={mp.id}
                            className="inline-flex items-center gap-1 text-xs bg-brand-blue/5 text-brand-blue px-2 py-1 rounded-full"
                          >
                            {mp.name}
                            {mp.price_usd && (
                              <span className="font-semibold">
                                {formatUSD(mp.price_usd)}
                              </span>
                            )}
                          </span>
                        ))}
                        {result.matchedProcedures.length > 4 && (
                          <span className="text-xs text-neutral-400 px-2 py-1">
                            +{result.matchedProcedures.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price highlight (right side) */}
                  {result.matchedProcedures.some((mp) => mp.price_usd) && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-neutral-400">from</p>
                      <p className="text-lg font-bold text-brand-green">
                        {formatUSD(
                          Math.min(
                            ...result.matchedProcedures
                              .filter((mp) => mp.price_usd)
                              .map((mp) => mp.price_usd!)
                          )
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
