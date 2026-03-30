'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Search, ArrowRight, Sparkles, SearchX, TrendingUp } from 'lucide-react';
import { formatUSD } from '@/lib/utils';
import type { SearchResult } from '@/lib/data';

// Map category slugs to their thumbnail images
const CATEGORY_IMAGES: Record<string, string> = {
  dentists: '/images/categories/dental.jpg',
  pharmacies: '/images/categories/pharmacies.jpg',
  spas: '/images/categories/spa.jpg',
  'cosmetic-surgery': '/images/categories/cosmetic-surgery.jpg',
  optometrists: '/images/categories/eye-care.jpg',
  doctors: '/images/categories/wellness.jpg',
  vets: '/images/categories/veterinary.jpg',
  liquor: '/images/categories/pharmacies.jpg', // fallback
};

interface SearchResultsClientProps {
  results: SearchResult[];
  query: string;
}

// Popular search suggestions for empty states
const POPULAR_SEARCHES = [
  { label: 'Dental Crown', query: 'dental crown' },
  { label: 'Insulin', query: 'insulin' },
  { label: 'Botox', query: 'botox' },
  { label: 'Teeth Cleaning', query: 'cleaning' },
  { label: 'Massage', query: 'massage' },
  { label: 'Eye Exam', query: 'eye exam' },
  { label: 'Implant', query: 'implant' },
  { label: 'Ozempic', query: 'ozempic' },
];

export default function SearchResultsClient({ results, query }: SearchResultsClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  if (!query || query.length < 2) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 bg-brand-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Search className="w-10 h-10 text-brand-blue/40" />
        </div>
        <p className="text-neutral-dark text-lg font-semibold font-display">
          Start searching
        </p>
        <p className="text-neutral-400 text-sm mt-2 max-w-sm mx-auto">
          Type at least 2 characters to search across procedures, medicines, and providers
        </p>
        <div className="mt-8">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Popular searches</p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.map((s) => (
              <Link
                key={s.query}
                href={`/search?q=${encodeURIComponent(s.query)}`}
                className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <SearchX className="w-10 h-10 text-red-300" />
        </div>
        <p className="text-neutral-dark text-lg font-semibold font-display mb-1">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-neutral-400 text-sm mb-8 max-w-sm mx-auto">
          We couldn&apos;t find any matching procedures or providers. Try one of these popular searches:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {POPULAR_SEARCHES.map((s) => (
            <Link
              key={s.query}
              href={`/search?q=${encodeURIComponent(s.query)}`}
              className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-600 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
            >
              {s.label}
            </Link>
          ))}
        </div>
        <Link
          href="/#categories"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-lg font-medium text-sm hover:bg-brand-navy transition-colors shadow-sm"
        >
          Browse All Categories
          <ArrowRight className="w-4 h-4" />
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

  const categoryNames = Object.keys(grouped);

  // Filter results if a category filter is active
  const filteredGrouped = activeFilter
    ? { [activeFilter]: grouped[activeFilter] }
    : grouped;

  return (
    <div className="space-y-6">
      {/* Category filter chips */}
      {categoryNames.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === null
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            All ({results.length})
          </button>
          {categoryNames.map((catName) => {
            const catSlug = grouped[catName][0].category.slug;
            const catImage = CATEGORY_IMAGES[catSlug];
            return (
              <button
                key={catName}
                onClick={() => setActiveFilter(activeFilter === catName ? null : catName)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === catName
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {catImage && (
                  <Image
                    src={catImage}
                    alt=""
                    width={18}
                    height={18}
                    className="rounded-full object-cover w-[18px] h-[18px]"
                  />
                )}
                {catName} ({grouped[catName].length})
              </button>
            );
          })}
        </div>
      )}

      {/* Results by category */}
      {Object.entries(filteredGrouped).map(([categoryName, categoryResults]) => {
        const catSlug = categoryResults[0].category.slug;
        const catImage = CATEGORY_IMAGES[catSlug];

        return (
          <div key={categoryName}>
            {/* Category header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h2 className="font-display text-lg font-bold text-neutral-dark flex items-center gap-2.5">
                {catImage && (
                  <Image
                    src={catImage}
                    alt={categoryName}
                    width={28}
                    height={28}
                    className="rounded-lg object-cover w-7 h-7 shadow-sm"
                  />
                )}
                {categoryName}
                <span className="text-sm font-normal text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                  {categoryResults.length}
                </span>
              </h2>
              <Link
                href={`/${catSlug}`}
                className="text-sm text-brand-blue font-medium hover:text-brand-navy flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Result cards */}
            <div className="space-y-3">
              {categoryResults.map((result) => {
                const isFeatured = result.provider.featured;
                const lowestPrice = result.matchedProcedures
                  .filter((mp) => mp.price_usd)
                  .map((mp) => mp.price_usd!);
                const minPrice = lowestPrice.length > 0 ? Math.min(...lowestPrice) : null;

                return (
                  <Link
                    key={result.provider.id}
                    href={`/${result.category.slug}/${result.provider.slug}`}
                    className={`group block rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      isFeatured
                        ? 'bg-gradient-to-r from-brand-blue/[3%] to-transparent border-l-[3px] border-l-brand-blue border border-neutral-200/80 shadow-sm'
                        : 'bg-white border border-neutral-200 shadow-sm hover:border-brand-blue/30'
                    }`}
                  >
                    <div className="flex items-stretch">
                      {/* Category thumbnail */}
                      {catImage && (
                        <div className="relative w-20 sm:w-24 flex-shrink-0 hidden sm:block">
                          <Image
                            src={catImage}
                            alt={categoryName}
                            fill
                            className="object-cover rounded-l-xl"
                            sizes="96px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-l-xl" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0 p-4 sm:pl-5">
                        <div className="flex items-start justify-between gap-3">
                          {/* Provider info */}
                          <div className="flex-1 min-w-0">
                            {/* Name + badges */}
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-semibold text-neutral-dark text-[15px] group-hover:text-brand-blue transition-colors">
                                {result.provider.name}
                              </h3>
                              {result.provider.verified && (
                                <span className="flex-shrink-0 text-[10px] bg-brand-green/10 text-brand-green font-semibold px-2 py-0.5 rounded-full border border-brand-green/20">
                                  Verified
                                </span>
                              )}
                              {isFeatured && (
                                <span className="flex-shrink-0 text-[10px] bg-amber/10 text-amber font-semibold px-2 py-0.5 rounded-full border border-amber/20 inline-flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Featured
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            {result.provider.avg_rating && (
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3.5 h-3.5 ${
                                        star <= Math.round(result.provider.avg_rating!)
                                          ? 'text-amber fill-amber'
                                          : 'text-neutral-200 fill-neutral-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-semibold text-neutral-dark">
                                  {result.provider.avg_rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  ({result.provider.review_count})
                                </span>
                              </div>
                            )}

                            {/* Address */}
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{result.provider.address}</span>
                            </div>

                            {/* Matched procedures */}
                            {result.matchedProcedures.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {result.matchedProcedures.slice(0, 3).map((mp, idx) => (
                                  <span
                                    key={`${mp.id}-${idx}`}
                                    className="inline-flex items-center gap-1 text-xs bg-brand-blue/5 text-brand-blue/80 pl-2.5 pr-1.5 py-1 rounded-lg border border-brand-blue/10"
                                  >
                                    <span className="truncate max-w-[140px]">{mp.name}</span>
                                    {mp.price_usd && (
                                      <span className="font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded-md ml-0.5">
                                        {formatUSD(mp.price_usd)}
                                      </span>
                                    )}
                                  </span>
                                ))}
                                {result.matchedProcedures.length > 3 && (
                                  <span className="text-xs text-neutral-400 px-2 py-1 bg-neutral-50 rounded-lg">
                                    +{result.matchedProcedures.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Price badge (right side) */}
                          {minPrice && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="bg-brand-green/10 rounded-xl px-3 py-2.5 text-center border border-brand-green/15">
                                <p className="text-[10px] font-medium text-brand-green/70 uppercase tracking-wider">from</p>
                                <p className="text-xl font-bold text-brand-green leading-tight">
                                  {formatUSD(minPrice)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Results footer */}
      <div className="text-center pt-4 pb-2">
        <p className="text-sm text-neutral-400">
          Showing {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-neutral-300">
          <TrendingUp className="w-3 h-3" />
          <span>Prices verified by ClearCross</span>
        </div>
      </div>
    </div>
  );
}
