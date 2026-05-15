'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Provider } from '@/lib/types';

interface ProviderProfileFormProps {
  provider: Provider;
}

export default function ProviderProfileForm({ provider }: ProviderProfileFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: provider.name || '',
    address: provider.address || '',
    phone: provider.phone || '',
    whatsapp: provider.whatsapp || '',
    website: provider.website || '',
    description: provider.description || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to save changes' });
        return;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-5">
        {/* Clinic Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Clinic / Business Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
            required
            minLength={2}
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
            placeholder="Street address in Nuevo Progreso"
          />
        </div>

        {/* Phone + WhatsApp side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
              placeholder="+52 899 123 4567"
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-neutral-700 mb-1.5">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
              placeholder="+52 899 123 4567"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={form.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
            About Your Practice
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={5}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors resize-y"
            placeholder="Tell patients about your clinic, experience, and what makes you different..."
            maxLength={2000}
          />
          <p className="text-xs text-neutral-400 mt-1">
            {form.description.length}/2000 characters
          </p>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-navy transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
