'use client';

import { useState, useTransition } from 'react';
import { useI18n } from '@/lib/i18n';
import { MessageSquare, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Clock, Star } from 'lucide-react';

interface QuoteFormProps {
  providerId: string;
  providerName: string;
  procedures: Array<{ id: string; name: string }>;
  hasProcedures: boolean;
}

interface FormState {
  procedureId: string;
  description: string;
  name: string;
  email: string;
  phone: string;
  photo: File | null;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function QuoteForm({ providerId, providerName, procedures, hasProcedures }: QuoteFormProps) {
  const { dict } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [quoteId, setQuoteId] = useState<string>('');

  const [form, setForm] = useState<FormState>({
    procedureId: '',
    description: '',
    name: '',
    email: '',
    phone: '',
    photo: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) newErrors.name = dict.ui.qfErrName;
    if (!form.email.trim()) newErrors.email = dict.ui.qfErrEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = dict.ui.qfErrEmailInvalid;
    if (!form.phone.trim()) newErrors.phone = dict.ui.qfErrPhone;
    if (!form.description.trim()) newErrors.description = dict.ui.qfErrDesc;
    else if (form.description.length < 50) newErrors.description = dict.ui.qfErrDescShort;
    else if (form.description.length > 2000) newErrors.description = dict.ui.qfErrDescLong;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('provider_id', providerId);
    // Only sent when the visitor actually chose one.
    //
    // This used to fall back to a sentinel string, which went into a column
    // typed uuid NOT NULL -- a guaranteed 500 on the 61% of providers that
    // publish no prices, because the <select> below is not rendered at all
    // there and so this value was permanently empty. Guarded by
    // test/quote-delivery.mjs section 5.
    if (form.procedureId) formData.append('procedure_id', form.procedureId);
    formData.append('description', form.description.trim());
    formData.append('name', form.name.trim());
    formData.append('email', form.email.trim());
    formData.append('phone', form.phone.trim());
    if (form.photo) formData.append('photo', form.photo);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || dict.ui.qfErrSubmit);
      }

      setQuoteId(data.id);
      setStatus('success');

      // The one conversion this form produces.
      //
      // Imported dynamically so the analytics bundle is never on the submit
      // path, and wrapped because a measurement failure must not turn a lead
      // that already reached the server into an error on screen.
      try {
        const { track } = await import('@vercel/analytics');
        const payload = { provider: providerName, path: window.location.pathname };
        track('quote_submitted', payload);
        window.gtag?.('event', 'quote_submitted', payload);
      } catch {
        /* never break a lead that has already been accepted */
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : dict.ui.qfErrGeneric);
      setStatus('error');
    }
  }

  function resetForm() {
    setForm({
      procedureId: '',
      description: '',
      name: '',
      email: '',
      phone: '',
      photo: null,
    });
    setStatus('idle');
    setQuoteId('');
    setErrorMessage('');
    setErrors({});
  }

  // Success state
  if (status === 'success') {
    return (
      <Card id="quote-form" className="sticky top-6 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-green to-brand-green/80 text-white p-6">
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-2">{dict.ui.qfSubmitted}</h3>
            <p className="text-green-100 text-sm mb-4">
              {dict.ui.qfSentTo.replace('{provider}', providerName)}
            </p>
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-green-100">
                <strong>{dict.ui.qfReferenceId}</strong> {quoteId}
              </p>
            </div>
            <p className="text-sm text-green-100 mb-4">
              {dict.ui.qfCheckEmail}
            </p>
            <button
              onClick={resetForm}
              className="w-full px-4 py-3 bg-white text-brand-green font-bold rounded-lg hover:bg-green-50 transition-colors shadow-sm"
            >
              {dict.ui.qfAnother}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
            <div className="flex items-center gap-2.5 text-sm">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{dict.ui.qfAskInWriting}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{dict.ui.qfNoAccount}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Star className="w-4 h-4 flex-shrink-0" />
              <span>{dict.ui.qfNoCommitment}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card id="quote-form" className="sticky top-6 overflow-hidden">
      <div className="bg-gradient-to-br from-brand-blue to-brand-navy text-white p-6">
        <h3 className="text-xl font-bold mb-1">{dict.ui.qfTitle}</h3>
        <p className="text-blue-200 text-sm mb-5">
          {dict.ui.qfSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Procedure Select */}
          {hasProcedures && (
            <div>
              <label htmlFor="procedure" className="block text-sm font-medium mb-1.5">
                {dict.ui.qfProcedure}
              </label>
              <select
                id="procedure"
                value={form.procedureId}
                onChange={(e) => setForm({ ...form, procedureId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              >
                <option value="">{dict.ui.qfSelectProcedure}</option>
                {procedures.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">
              {dict.ui.qfWhatDoYouNeed}
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder={dict.ui.qfDescribePlaceholder}
              className={`w-full px-3 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm resize-none ${
                errors.description ? 'border-red-400' : 'border-white/30'
              }`}
            />
            {errors.description && (
              <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-blue-200/50 mt-1">
              {form.description.length}/2000 characters
            </p>
          </div>

          {/* Contact Fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              {dict.ui.qfYourName}
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={dict.ui.qfNamePlaceholder}
              className={`w-full px-3 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                errors.name ? 'border-red-400' : 'border-white/30'
              }`}
            />
            {errors.name && (
              <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              {dict.ui.qfEmail}
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
              className={`w-full px-3 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                errors.email ? 'border-red-400' : 'border-white/30'
              }`}
            />
            {errors.email && (
              <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
              {dict.ui.qfPhone}
            </label>
            <input
              type="tel"
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(956) 123-4567"
              className={`w-full px-3 py-2.5 rounded-lg bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm ${
                errors.phone ? 'border-red-400' : 'border-white/30'
              }`}
            />
            {errors.phone && (
              <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium mb-1.5">
              Upload Photo <span className="text-blue-200/50">{dict.ui.qfOptional}</span>
            </label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/20 text-xs text-blue-200/60">
              <Camera className="w-4 h-4 flex-shrink-0" />
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white/20 file:text-white hover:file:bg-white/30"
              />
            </div>
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="p-3 bg-red-500/20 border border-red-400 rounded-lg text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full px-4 py-3 bg-white text-brand-blue font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 ${
              isPending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-light'
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {dict.ui.qfSubmitting}
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                {dict.ui.qfSubmit}
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-blue-200/50 mt-4 text-center">
          {dict.ui.qfPrivacy}
        </p>
      </div>
    </Card>
  );
}
