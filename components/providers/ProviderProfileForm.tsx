'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import type { Provider } from '@/lib/types';
import type { Locale } from '@/lib/i18n/context';
import { dictFor } from '@/lib/i18n/dict';
import Button from '@/components/ui/Button';

interface ProviderProfileFormProps {
  provider: Provider;
  locale: Locale;
}

export default function ProviderProfileForm({ provider, locale }: ProviderProfileFormProps) {
  const t = dictFor(locale).provider;
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
        setMessage({ type: 'error', text: t.profileErrorSave });
        return;
      }

      setMessage({ type: 'success', text: t.profileSuccessSave });
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: t.profileErrorGeneric });
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
            {t.profileNameLabel}
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
            {t.profileAddressLabel}
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
            placeholder={t.profileAddressPlaceholder}
          />
        </div>

        {/* Phone + WhatsApp side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t.profilePhoneLabel}
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
              placeholder={t.profilePhonePlaceholder}
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t.profileWhatsappLabel}
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
              placeholder={t.profilePhonePlaceholder}
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t.profileWebsiteLabel}
          </label>
          <input
            id="website"
            type="url"
            value={form.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors"
            placeholder={t.profileWebsitePlaceholder}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t.profileAboutLabel}
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={5}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-neutral-900 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-colors resize-y"
            placeholder={t.profileAboutPlaceholder}
            maxLength={2000}
          />
          <p className="text-xs text-neutral-400 mt-1">
            {t.profileCharCount.replace('{n}', String(form.description.length))}
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
      <Button type="submit" size="lg" loading={saving}>
        {!saving && <Save className="w-4 h-4 mr-2" />}
        {saving ? t.profileSaving : t.profileSaveChanges}
      </Button>
    </form>
  );
}
