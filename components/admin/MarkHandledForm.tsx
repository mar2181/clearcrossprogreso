'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import type { Locale } from '@/lib/i18n/context';
import { dictFor } from '@/lib/i18n/dict';

export default function MarkHandledForm({ quoteId, locale }: { quoteId: string; locale: Locale }) {
  const t = dictFor(locale).admin;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/handle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.markHandledError);
        setSaving(false);
        return;
      }
      setOpen(false);
      setNote('');
      router.refresh();
    } catch {
      setError(t.markHandledError);
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {t.markHandled}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 w-full max-w-sm">
      <Textarea
        placeholder={t.markHandledPlaceholder}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
        disabled={saving}
        rows={2}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={saving} disabled={saving}>
          {t.markHandledSave}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setOpen(false);
            setError('');
          }}
          disabled={saving}
        >
          {t.markHandledCancel}
        </Button>
      </div>
    </form>
  );
}
