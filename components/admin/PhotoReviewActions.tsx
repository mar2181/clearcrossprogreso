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
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => decide('approve')}
          disabled={busy !== null}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded disabled:opacity-50"
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
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold rounded disabled:opacity-50"
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
