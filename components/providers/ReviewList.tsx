'use client';

import React from 'react';
import { Review } from '@/lib/types';
import { cn } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">
          No reviews yet. Be the first to share your experience.
        </p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Filter to only verified reviews
  const verifiedReviews = reviews.filter((r) => r.verified);

  return (
    <div className="space-y-6">
      {/* Summary */}
      {verifiedReviews.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-neutral-500 text-sm mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} size="md" />
                <span className="text-sm text-neutral-600">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div>
            </div>
            <div className="text-right ml-auto">
              <p className="text-2xl font-bold text-neutral-dark">
                {verifiedReviews.length}
              </p>
              <p className="text-xs text-neutral-500">
                {verifiedReviews.length === 1 ? 'verified review' : 'verified reviews'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {verifiedReviews.length > 0 ? (
          verifiedReviews.map((review) => (
            <div
              key={review.id}
              className="border border-neutral-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <StarRating rating={review.rating} size="sm" className="mb-2" />
                  {review.verified && (
                    <Badge variant="verified" className="text-xs">
                      ✓ Verified Patient
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-neutral-500 flex-shrink-0">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {review.comment && (
                <p className="text-neutral-dark text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">No verified reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
