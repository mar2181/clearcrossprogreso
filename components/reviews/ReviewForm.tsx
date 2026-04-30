'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  quoteId: string;
  providerName: string;
  procedureName: string;
}

export default function ReviewForm({ quoteId, providerName, procedureName }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_id: quoteId, rating, comment: comment.trim() || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit review');
        return;
      }

      setSubmitted(true);
      setTimeout(() => router.refresh(), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-green-800 mb-1">Thank you for your review!</p>
        <p className="text-sm text-green-600">
          Your feedback helps other patients find great care in Nuevo Progreso.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-neutral-900 mb-1">
        How was your visit?
      </h3>
      <p className="text-sm text-neutral-500 mb-5">
        Rate your experience with {providerName} for {procedureName}
      </p>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-amber fill-amber'
                  : 'text-neutral-200'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-medium text-neutral-600">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label htmlFor="review-comment" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Tell others about your experience (optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors resize-y"
          placeholder="What did you like? Was the price fair? Would you go back?"
        />
        <p className="text-xs text-neutral-400 mt-1">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold text-sm hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
