'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft, Clock, DollarSign, Percent, MessageSquare, AlertCircle } from 'lucide-react';
import { FlashDiscount } from '@/lib/types';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { cn, formatUSD } from '@/lib/utils';

// Duration presets in hours
const DURATION_PRESETS = [
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
  { label: '12 hours', hours: 12 },
];

interface ProcedureOption {
  id: string;
  name: string;
  price_usd: number | null;
}

export default function FlashDiscountPage() {
  // Form state
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mock data for procedures (in real mode, fetched from API)
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<FlashDiscount | null>(null);

  useEffect(() => {
    // Fetch provider's procedures and any active flash discount
    // For now, use mock data endpoint
    fetch('/api/providers?action=my-procedures')
      .then((r) => r.json())
      .then((data) => {
        if (data.procedures) setProcedures(data.procedures);
        if (data.activeFlashDiscount) setActiveDiscount(data.activeFlashDiscount);
      })
      .catch(() => {
        // Fallback mock procedures for development
        setProcedures([
          { id: 'proc-cleaning', name: 'Dental Cleaning', price_usd: 30 },
          { id: 'proc-whitening', name: 'Teeth Whitening', price_usd: 150 },
          { id: 'proc-crown-zirconia', name: 'Zirconia Crown', price_usd: 360 },
          { id: 'proc-implant', name: 'Dental Implant', price_usd: 1050 },
          { id: 'proc-veneer-porcelain', name: 'Porcelain Veneer', price_usd: 380 },
        ]);
      });
  }, []);

  // Validation
  const validationError = useMemo(() => {
    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 50)) {
      return 'Percentage discount must be between 1% and 50%';
    }
    if (discountType === 'fixed' && (discountValue < 1 || discountValue > 200)) {
      return 'Fixed discount must be between $1 and $200';
    }
    if (durationHours < 1 || durationHours > 24) {
      return 'Duration must be between 1 and 24 hours';
    }
    if (message.length > 140) {
      return 'Message must be 140 characters or fewer';
    }
    return null;
  }, [discountType, discountValue, durationHours, message]);

  const handleSubmit = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/providers?action=create-flash-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discount_type: discountType,
          discount_value: discountValue,
          procedure_ids: selectedProcedures.length > 0 ? selectedProcedures : [],
          duration_hours: durationHours,
          message: message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create flash discount');
      }

      const data = await res.json();
      setActiveDiscount(data.flashDiscount);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndEarly = async () => {
    if (!activeDiscount) return;

    try {
      await fetch('/api/providers?action=end-flash-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_id: activeDiscount.id }),
      });
      setActiveDiscount(null);
      setSuccess(false);
    } catch {
      setError('Failed to end discount');
    }
  };

  const toggleProcedure = (procId: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(procId) ? prev.filter((id) => id !== procId) : [...prev, procId]
    );
  };

  // Preview calculation
  const previewPrice = useMemo(() => {
    const samplePrice = procedures.find((p) => p.price_usd && p.price_usd > 0)?.price_usd || 100;
    if (discountType === 'percentage') {
      return Math.round(samplePrice * (1 - discountValue / 100) * 100) / 100;
    }
    return Math.max(0, samplePrice - discountValue);
  }, [procedures, discountType, discountValue]);

  const sampleOriginalPrice = procedures.find((p) => p.price_usd && p.price_usd > 0)?.price_usd || 100;

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back link */}
        <Link
          href="/provider"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-blue mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Flash Discount</h1>
            <p className="text-sm text-neutral-500">
              Create a time-limited deal to fill empty appointment slots
            </p>
          </div>
        </div>

        {/* Active Discount Display */}
        {activeDiscount && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">Active Flash Discount</span>
              </div>
              <CountdownTimer
                expiresAt={activeDiscount.expires_at}
                onExpire={() => setActiveDiscount(null)}
                size="md"
                className="!text-yellow-200"
              />
            </div>
            <p className="text-white/90 mb-1">
              {activeDiscount.discount_type === 'percentage'
                ? `${activeDiscount.discount_value}% off`
                : `$${activeDiscount.discount_value} off`}
              {activeDiscount.procedure_ids.length > 0
                ? ` on ${activeDiscount.procedure_ids.length} procedure(s)`
                : ' on all procedures'}
            </p>
            {activeDiscount.message && (
              <p className="text-white/75 text-sm italic">"{activeDiscount.message}"</p>
            )}
            <button
              onClick={handleEndEarly}
              className="mt-4 px-5 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors text-sm"
            >
              End Early
            </button>
          </div>
        )}

        {/* Creation Form (hidden when active discount exists) */}
        {!activeDiscount && (
          <div className="space-y-6">
            {/* Discount Type */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand-blue" />
                Discount Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    discountType === 'percentage'
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  )}
                >
                  <Percent className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-semibold block">Percentage Off</span>
                  <span className="text-xs">e.g., 20% off</span>
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    discountType === 'fixed'
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  )}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-semibold block">Fixed Amount Off</span>
                  <span className="text-xs">e.g., $50 off</span>
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4">
                {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
              </h2>
              <div className="flex items-center gap-3">
                {discountType === 'percentage' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-24 px-4 py-3 border border-neutral-200 rounded-lg text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                    <span className="text-2xl font-bold text-neutral-400">%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-24 px-4 py-3 border border-neutral-200 rounded-lg text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>
                )}
                <span className="text-sm text-neutral-500">
                  Max: {discountType === 'percentage' ? '50%' : '$200'}
                </span>
              </div>

              {/* Live preview */}
              <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-500 mb-1">Preview</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400 line-through">
                    {formatUSD(sampleOriginalPrice)}
                  </span>
                  <span className="text-lg font-bold text-brand-green">
                    {formatUSD(previewPrice)}
                  </span>
                  <span className="text-xs text-orange-600 font-medium">
                    Save {discountType === 'percentage'
                      ? `${discountValue}%`
                      : formatUSD(discountValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Procedures */}
            {procedures.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <h2 className="font-semibold text-neutral-dark mb-2">
                  Apply to Procedures
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  Select specific procedures, or leave empty to apply to all.
                </p>
                <div className="flex flex-wrap gap-2">
                  {procedures.map((proc) => (
                    <button
                      key={proc.id}
                      onClick={() => toggleProcedure(proc.id)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                        selectedProcedures.includes(proc.id)
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-blue'
                      )}
                    >
                      {proc.name}
                      {proc.price_usd ? ` (${formatUSD(proc.price_usd)})` : ''}
                    </button>
                  ))}
                </div>
                {selectedProcedures.length === 0 && (
                  <p className="text-xs text-neutral-400 mt-2 italic">
                    No procedures selected — discount applies to all your listed prices
                  </p>
                )}
              </div>
            )}

            {/* Duration */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-blue" />
                Duration
              </h2>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.hours}
                    onClick={() => setDurationHours(preset.hours)}
                    className={cn(
                      'px-5 py-2.5 rounded-lg text-sm font-medium transition-all border',
                      durationHours === preset.hours
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-navy'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-blue" />
                Message (Optional)
              </h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={140}
                rows={2}
                placeholder="e.g., Open slot this afternoon — walk-ins welcome!"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue resize-none"
              />
              <p className="text-xs text-neutral-400 mt-1 text-right">
                {message.length}/140
              </p>
            </div>

            {/* Error */}
            {(error || validationError) && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error || validationError}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !!validationError}
              className={cn(
                'w-full py-4 rounded-xl text-lg font-bold transition-all duration-200 flex items-center justify-center gap-2',
                isSubmitting || validationError
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5'
              )}
            >
              <Zap className="w-5 h-5 fill-current" />
              {isSubmitting ? 'Going Live...' : 'Go Live'}
            </button>

            {/* Rules */}
            <div className="text-xs text-neutral-400 space-y-1">
              <p>• Maximum discount: 50% or $200</p>
              <p>• Duration: 1–24 hours</p>
              <p>• Only 1 active flash discount at a time</p>
              <p>• 4-hour cooldown between discounts</p>
            </div>
          </div>
        )}

        {/* Success state */}
        {success && activeDiscount && (
          <div className="mt-6 p-4 bg-brand-green/10 border border-brand-green/20 rounded-xl text-center">
            <p className="text-brand-green font-semibold mb-2">
              Your flash discount is live!
            </p>
            <p className="text-sm text-neutral-600">
              Patients browsing your category can now see your deal with a countdown timer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
