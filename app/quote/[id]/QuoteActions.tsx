'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QuoteActionsProps {
  quoteId: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'completed';
  quotedPrice?: number | null;
  providerNotes?: string | null;
}

type ReviewRating = 1 | 2 | 3 | 4 | 5;

export function QuoteActions({
  quoteId,
  status,
  quotedPrice,
  providerNotes,
}: QuoteActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<'accept' | 'decline' | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Review form state
  const [rating, setRating] = useState<ReviewRating | null>(null);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept quote');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Quote accepted! Your price is now locked in.',
      });
      setShowConfirmDialog(null);

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to accept quote',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`/api/quotes/${quoteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline quote');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Quote declined. You can request another quote anytime.',
      });
      setShowConfirmDialog(null);

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to decline quote',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select a rating',
      });
      return;
    }

    setReviewLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quoteId,
          rating,
          comment: comment || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your review!',
      });

      // Reset form
      setRating(null);
      setComment('');

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to submit review',
      });
    } finally {
      setReviewLoading(false);
    }
  };

  // Pending Status - Show waiting message
  if (status === 'pending') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Quote Request Submitted
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              Your request has been sent to the provider. We'll notify you by email when they respond with a price quote. This typically takes 1-2 business days.
            </p>
            <div className="space-y-2 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-600"></div>
                <span>Step 1 Complete: Request Submitted</span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="h-2 w-2 rounded-full bg-amber-300"></div>
                <span>Step 2: Waiting for Provider Response</span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="h-2 w-2 rounded-full bg-amber-300"></div>
                <span>Step 3: Accept or Decline Quote</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quoted Status - Show price and action buttons
  if (status === 'quoted') {
    return (
      <div className="space-y-4">
        {submitStatus && (
          <div
            className={cn(
              'p-4 rounded-lg border flex gap-3',
              submitStatus.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            )}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={cn(
                'text-sm',
                submitStatus.type === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
              )}
            >
              {submitStatus.message}
            </p>
          </div>
        )}

        {/* Price Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-sm text-green-700 mb-2 font-medium">
            Guaranteed Quote Price
          </p>
          <p className="text-4xl font-bold text-green-700 mb-4">
            ${quotedPrice?.toFixed(2) || '0.00'}
          </p>
          {providerNotes && (
            <div className="bg-white rounded p-3 text-sm text-neutral-700 border border-green-100">
              <p className="font-medium text-neutral-900 mb-1">Provider Notes:</p>
              <p>{providerNotes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowConfirmDialog('accept')}
            disabled={isLoading}
            size="md"
            variant="primary"
          >
            Accept Quote
          </Button>
          <Button
            onClick={() => setShowConfirmDialog('decline')}
            disabled={isLoading}
            size="md"
            variant="outline"
          >
            Decline
          </Button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">
                {showConfirmDialog === 'accept'
                  ? 'Accept This Quote?'
                  : 'Decline This Quote?'}
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                {showConfirmDialog === 'accept'
                  ? 'By accepting, you confirm that you will proceed with the procedure at the quoted price. This price is locked in.'
                  : 'You can request another quote from a different provider anytime.'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmDialog(null)}
                  disabled={isLoading}
                  variant="ghost"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    showConfirmDialog === 'accept'
                      ? handleAccept()
                      : handleDecline()
                  }
                  disabled={isLoading}
                  loading={isLoading}
                  variant={showConfirmDialog === 'accept' ? 'primary' : 'outline'}
                  size="md"
                  className="flex-1"
                >
                  {showConfirmDialog === 'accept' ? 'Accept' : 'Decline'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Accepted Status - Show locked price
  if (status === 'accepted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Quote Accepted!</h3>
            <p className="text-sm text-green-800 mt-1">
              Your price is locked in at <span className="font-bold">${quotedPrice?.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {providerNotes && (
          <div className="bg-white rounded p-4 text-sm text-neutral-700 border border-green-100 mb-4">
            <p className="font-medium text-neutral-900 mb-2">Provider Notes:</p>
            <p>{providerNotes}</p>
          </div>
        )}

        <div className="bg-white rounded p-4 border border-green-100 space-y-2">
          <h4 className="font-medium text-neutral-900 text-sm">What's Next:</h4>
          <ul className="text-sm text-neutral-700 space-y-1">
            <li>• Contact the provider to schedule your appointment</li>
            <li>• Bring this quote confirmation on your visit date</li>
            <li>• The quoted price applies when you visit</li>
          </ul>
        </div>
      </div>
    );
  }

  // Rejected Status - Show declined message
  if (status === 'rejected') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-800">
            You declined this quote. You can request quotes from other providers anytime.
          </p>
        </div>
        <a href="/quote" className="block">
          <Button
            variant="primary"
            size="md"
            className="w-full"
          >
            Request Another Quote
          </Button>
        </a>
      </div>
    );
  }

  // Completed Status - Show review form
  if (status === 'completed') {
    return (
      <div className="space-y-6">
        {submitStatus && (
          <div
            className={cn(
              'p-4 rounded-lg border flex gap-3',
              submitStatus.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            )}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={cn(
                'text-sm',
                submitStatus.type === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
              )}
            >
              {submitStatus.message}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            How was your experience?
          </h3>
          <p className="text-sm text-blue-800 mb-6">
            Your feedback helps other patients find the best providers in Nuevo Progreso.
          </p>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star as ReviewRating)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  type="button"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      rating && star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-neutral-300 hover:text-yellow-300'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:outline-none resize-none placeholder:text-neutral-400"
            />
            <p className="text-xs text-neutral-500 mt-1">
              {comment.length} / 500 characters
            </p>
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={reviewLoading || !rating}
            loading={reviewLoading}
            variant="primary"
            size="md"
            className="w-full"
          >
            Submit Review
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
