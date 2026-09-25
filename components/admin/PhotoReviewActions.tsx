'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, X } from 'lucide-react';
import type { Locale } from '@/lib/i18n/context';
import { dictFor } from '@/lib/i18n/dict';

export default function PhotoReviewActions({
  providerId,
  path,
  locale,
}: {
  providerId: string;
  path: string;
  locale: Locale;
}) {
  const t = dictFor(locale).admin;
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const decide = async (action: 'approve' | 'reject') => {
    setError('');
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/photos/${providerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.photosErrorSave);
        setBusy(null);
        return;
      }
      router.refresh();
    } catch {
      setError(t.photosErrorSave);
      setBusy(null);
    }
  };

  return (
    <div>
      {/*
        Not the shared <Button/> component: its smallest size (px-3 py-1.5
        text-sm) is too wide for this pair to sit side by side inside a
        grid-cols-4 photo tile without wrapping. Kept as raw buttons at the
        same compact size as before, but on the app's own brand token for
        approve (bg-brand-green, matching Button's `secondary` variant and
        MarkHandledForm) instead of Tailwind's unrelated default green-600 —
        and the same focus ring Button uses, for keyboard parity.
      */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => decide('approve')}
          disabled={busy !== null}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-brand-green hover:bg-brand-green/90 active:bg-brand-green/80 text-white text-xs font-semibold rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === 'approve' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {t.photosApprove}
        </button>
        <button
          type="button"
          onClick={() => decide('reject')}
          disabled={busy !== null}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === 'reject' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          {t.photosReject}
        </button>
      </div>
      {error && <p className="text-[11px] text-error mt-1">{error}</p>}
    </div>
  );
}
