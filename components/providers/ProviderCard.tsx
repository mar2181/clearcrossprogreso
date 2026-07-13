'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Award, Zap, GitCompareArrows, Check } from 'lucide-react';
import { Provider, ProviderPrice, FlashDiscount } from '@/lib/types';
import { cn, formatUSD } from '@/lib/utils';
import { getSavings } from '@/lib/us-benchmarks';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import CountdownTimer from '@/components/ui/CountdownTimer';

interface ProviderCardProps {
  provider: Provider & {
    prices?: (ProviderPrice & { procedure?: { name: string; id?: string; slug?: string } })[];
    category?: {
      name: string;
      slug: string;
    };
  };
  filteredProcedureIds?: string[];
  flashDiscount?: FlashDiscount | null;
  onCompare?: () => void;
  isInCompare?: boolean;
}

function getYearsExperience(graduationYear: number | null): number | null {
  if (!graduationYear) return null;
  return new Date().getFullYear() - graduationYear;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, filteredProcedureIds = [], flashDiscount, onCompare, isInCompare = false }) => {
  const categoryName = provider.category?.name || 'Medical';
  const categorySlug = provider.category?.slug || 'dentists';
  const yearsExp = getYearsExperience(provider.graduation_year);
  const [isFlashExpired, setIsFlashExpired] = React.useState(false);
  const activeFlash = flashDiscount && !isFlashExpired ? flashDiscount : null;

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
              {/* Flash Discount Badge */}
              {activeFlash && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                      <Zap className="w-3 h-3 fill-current" />
                      FLASH DEAL
                    </span>
                    <CountdownTimer
                      expiresAt={activeFlash.expires_at}
                      onExpire={() => setIsFlashExpired(true)}
                      className="bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Flash badge when no photo */}
        {!provider.photo_url && activeFlash && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                <Zap className="w-3 h-3 fill-current" />
                FLASH DEAL
              </span>
              <CountdownTimer
                expiresAt={activeFlash.expires_at}
                onExpire={() => setIsFlashExpired(true)}
              />
            </div>
          </div>
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

        {/* Price section — shows filtered procedure price when filters active, with flash discount */}
        {displayPrice && displayPrice.price_usd ? (
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs text-neutral-500 mb-1">
              {displayPrice.procedure?.name || 'Starting price'}
            </p>
            {activeFlash && isFlashApplicable(activeFlash, displayPrice) ? (
              <div>
                <p className="text-sm text-neutral-400 line-through">
                  {formatUSD(displayPrice.price_usd)}
                </p>
                <p className="price-display text-xl text-brand-green font-bold">
                  {formatUSD(calcDiscountedPrice(displayPrice.price_usd, activeFlash))}
                </p>
                {activeFlash.message && (
                  <p className="text-xs text-orange-600 mt-1 line-clamp-1">
                    {activeFlash.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="price-display text-xl">
                {formatUSD(displayPrice.price_usd)}
              </p>
            )}
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

// Check if a flash discount applies to a specific price entry
function isFlashApplicable(flash: FlashDiscount, price: any): boolean {
  // If no procedure_ids specified, discount applies to everything
  if (!flash.procedure_ids || flash.procedure_ids.length === 0) return true;
  const procId = price.procedure_id || price.procedure?.id;
  return procId ? flash.procedure_ids.includes(procId) : false;
}

// Calculate the discounted price
function calcDiscountedPrice(originalPrice: number, flash: FlashDiscount): number {
  if (flash.discount_type === 'percentage') {
    return Math.round(originalPrice * (1 - flash.discount_value / 100) * 100) / 100;
  }
  return Math.max(0, originalPrice - flash.discount_value);
}

export default ProviderCard;
