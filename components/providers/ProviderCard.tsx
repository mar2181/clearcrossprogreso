'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Award, TrendingDown, GitCompareArrows, Check } from 'lucide-react';
import { Provider, ProviderPrice } from '@/lib/types';
import { cn, formatUSD } from '@/lib/utils';
import { getSavings } from '@/lib/us-benchmarks';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface ProviderCardProps {
  provider: Provider & {
    prices?: (ProviderPrice & { procedure?: { name: string; id?: string; slug?: string } })[];
    category?: {
      name: string;
      slug: string;
    };
  };
  filteredProcedureIds?: string[];
  onCompare?: () => void;
  isInCompare?: boolean;
}

function getYearsExperience(graduationYear: number | null): number | null {
  if (!graduationYear) return null;
  return new Date().getFullYear() - graduationYear;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, filteredProcedureIds = [], onCompare, isInCompare = false }) => {
  const categoryName = provider.category?.name || 'Medical';
  const categorySlug = provider.category?.slug || 'dentists';
  const yearsExp = getYearsExperience(provider.graduation_year);

  // Get price list (check both 'prices' and 'provider_prices' keys)
  const priceList = provider.prices || (provider as any).provider_prices || [];

  // Show filtered procedure price when filters are active, otherwise first price
  const displayPrice = useMemo(() => {
    if (filteredProcedureIds.length > 0) {
      const matching = priceList.filter((p: any) =>
        filteredProcedureIds.includes(p.procedure_id || p.procedure?.id)
      );
      return matching.find((p: any) => p.price_usd) || null;
    }
    return priceList.find((p: any) => p.price_usd) || null;
  }, [priceList, filteredProcedureIds]);

  const hasActiveFilter = filteredProcedureIds.length > 0;

  return (
    <Card hover className="flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-0">
        {/* Provider photo */}
        {provider.photo_url && (
          <Link href={`/${categorySlug}/${provider.slug}`}>
            <div className="relative w-full h-40 overflow-hidden rounded-t-xl">
              <Image
                src={provider.photo_url}
                alt={provider.name}
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </Link>
        )}

        {/* Header with badges */}
        <div className="p-4 pb-3 border-b border-neutral-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/${categorySlug}/${provider.slug}`}
              className="flex-1 hover:text-brand-blue transition-colors"
            >
              <h3 className="font-semibold text-neutral-dark text-sm line-clamp-2">
                {provider.name}
              </h3>
            </Link>
            <div className="flex gap-1 flex-shrink-0">
              {provider.verified && (
                <Badge variant="verified" className="text-xs">
                  ✓ Verified
                </Badge>
              )}
              {provider.featured && (
                <Badge variant="featured" className="text-xs">
                  ★ Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category badge */}
            <Badge variant="default" className="text-xs inline-block">
              {categoryName}
            </Badge>

            {/* Experience badge */}
            {yearsExp && yearsExp > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-brand-navy/5 text-brand-navy font-medium px-2 py-0.5 rounded-full border border-brand-navy/10">
                <Award className="w-3 h-3" />
                {yearsExp}+ yrs
              </span>
            )}
          </div>
        </div>

        {/* Rating and review count */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            {provider.avg_rating ? (
              <>
                <StarRating
                  rating={provider.avg_rating}
                  size="sm"
                  showCount={provider.review_count}
                />
              </>
            ) : (
              <span className="text-xs text-neutral-500">No reviews yet</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="flex gap-2 text-xs text-neutral-mid">
            <MapPin size={14} className="flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{provider.address}</p>
          </div>
        </div>

        {/* Price section — shows filtered procedure price when filters active */}
        {displayPrice && displayPrice.price_usd ? (
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs text-neutral-500 mb-1">
              {displayPrice.procedure?.name || 'Starting price'}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="price-display text-xl">
                {formatUSD(displayPrice.price_usd)}
              </p>
              {(() => {
                const slug = displayPrice.procedure?.slug || (displayPrice as any).procedure_id || '';
                const savings = getSavings(slug, displayPrice.price_usd);
                if (!savings) return null;
                return (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    Save {savings.percentSaved}%
                  </span>
                );
              })()}
            </div>
            {(() => {
              const slug = displayPrice.procedure?.slug || (displayPrice as any).procedure_id || '';
              const savings = getSavings(slug, displayPrice.price_usd);
              if (!savings) return null;
              return (
                <p className="text-xs text-neutral-400 mt-0.5">
                  <span className="line-through">{formatUSD(savings.usPrice)}</span> US avg
                </p>
              );
            })()}
          </div>
        ) : hasActiveFilter ? (
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs text-neutral-400 italic mb-1">No price listed for this procedure</p>
            <Link
              href={`/quote?provider=${provider.id}`}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Request Quote
            </Link>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-neutral-100">
            <Link
              href={`/quote?provider=${provider.id}`}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Request Quote
            </Link>
          </div>
        )}
      </CardContent>

      {/* Action buttons */}
      <div className="p-4 flex gap-2">
        {onCompare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onCompare();
            }}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
              isInCompare
                ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30'
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand-blue hover:text-brand-blue'
            )}
            title={isInCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {isInCompare ? <Check className="w-4 h-4" /> : <GitCompareArrows className="w-4 h-4" />}
          </button>
        )}
        <Link
          href={`/${categorySlug}/${provider.slug}`}
          className="flex-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            View Profile
          </Button>
        </Link>
        <Link
          href={`/quote?provider=${provider.id}`}
          className="flex-1"
        >
          <Button
            variant="primary"
            size="sm"
            className="w-full"
          >
            Get Quote
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ProviderCard;
