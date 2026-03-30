'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { Provider, ProviderPrice } from '@/lib/types';
import { cn, formatUSD } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

interface ProviderCardProps {
  provider: Provider & {
    prices?: (ProviderPrice & { procedure?: { name: string } })[];
    category?: {
      name: string;
      slug: string;
    };
  };
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const categoryName = provider.category?.name || 'Medical';
  const categorySlug = provider.category?.slug || 'dentists';

  // Get first available price (check both 'prices' and 'provider_prices' keys)
  const priceList = provider.prices || (provider as any).provider_prices || [];
  const firstPrice = priceList.length > 0
    ? priceList.find((p: any) => p.price_usd)
    : null;

  return (
    <Card hover className="flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-0">
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

          {/* Category badge */}
          <Badge variant="default" className="text-xs inline-block">
            {categoryName}
          </Badge>
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

        {/* Price section */}
        {firstPrice && firstPrice.price_usd ? (
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs text-neutral-500 mb-1">
              {firstPrice.procedure?.name || 'Starting price'}
            </p>
            <p className="price-display text-xl">
              {formatUSD(firstPrice.price_usd)}
            </p>
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
