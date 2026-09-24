'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

export default function MarkHandledForm({ quoteId }: { quoteId: string }) {
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
        setError(data.error || 'Failed to save');
        setSaving(false);
        return;
      }
      setOpen(false);
      setNote('');
      router.refresh();
    } catch {
      setError('Failed to save');
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Mark handled
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 w-full max-w-sm">
      <Textarea
        placeholder="What did you do? e.g. Called the clinic directly and connected the patient."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
        disabled={saving}
        rows={2}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={saving} disabled={saving}>
          Save
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
          Cancel
        </Button>
      </div>
    </form>
  );
}
