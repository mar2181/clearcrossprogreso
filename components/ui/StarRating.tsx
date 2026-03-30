'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarSize = 'sm' | 'md' | 'lg';

interface StarRatingProps {
  rating: number;
  size?: StarSize;
  showCount?: number;
  className?: string;
}

const sizeMap: Record<StarSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  showCount,
  className,
}) => {
  const iconSize = sizeMap[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={iconSize}
            className="fill-amber text-amber"
          />
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative">
            <Star size={iconSize} className="text-neutral-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={iconSize} className="fill-amber text-amber" />
            </div>
          </div>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={iconSize}
            className="text-neutral-300"
          />
        ))}
      </div>

      {/* Review Count */}
      {showCount !== undefined && (
        <span className="text-sm text-neutral-500 ml-1">
          ({showCount} {showCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
