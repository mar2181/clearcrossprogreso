'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ArrowLeft, Clock, DollarSign, Percent, MessageSquare, AlertCircle } from 'lucide-react';
import { FlashDiscount } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import CountdownTimer from '@/components/ui/CountdownTimer';
import ProviderSubnav from '@/components/providers/ProviderSubnav';
import { cn, formatUSD } from '@/lib/utils';
import { usePortalLocale } from '@/lib/i18n/usePortalLocale';
import { dictFor } from '@/lib/i18n/dict';

// Duration presets in hours. The label shown for each is looked up from the
// dictionary at render time (durationLabel below) rather than stored here,
// so it stays bilingual instead of hardcoding English text.
const DURATION_PRESETS = [
  { hours: 2 },
  { hours: 4 },
  { hours: 8 },
  { hours: 12 },
];

// A discount cannot be re-armed within this many hours of the last one ending
// — matches the "4-hour cooldown" text already printed at the bottom of this
// page, which had nothing enforcing it before this rewrite.
const COOLDOWN_HOURS = 4;

interface ProcedureOption {
  id: string;
  name: string;
  price_usd: number | null;
}

function durationLabel(hours: number, t: ReturnType<typeof dictFor>['provider']) {
  switch (hours) {
    case 2:
      return t.flashDuration2h;
    case 4:
      return t.flashDuration4h;
    case 8:
      return t.flashDuration8h;
    case 12:
      return t.flashDuration12h;
    default:
      return `${hours}h`;
  }
}

export default function FlashDiscountPage() {
  const router = useRouter();
  const supabase = createClient();
  const locale = usePortalLocale();
  const t = dictFor(locale).provider;

  // Form state
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [providerId, setProviderId] = useState<string | null>(null);
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<FlashDiscount | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/auth/login?redirectTo=/provider/flash-discount');
        return;
      }

      const { data: userData } = await supabase
        .from('clearcross_users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!userData || userData.role !== 'provider' || !userData.provider_id) {
        router.push('/');
        return;
      }

      setProviderId(userData.provider_id);

      const { data: providerData } = await supabase
        .from('clearcross_providers')
        .select('category_id')
        .eq('id', userData.provider_id)
        .single();

      // The procedures actually priced by this provider — real category, real
      // prices, never a hardcoded dental-only guess for whatever category the
      // signed-in provider happens to be.
      if (providerData?.category_id) {
        const { data: priceRows } = await supabase
          .from('clearcross_provider_prices')
          .select('procedure_id, price_usd, procedure:clearcross_procedures(id, name)')
          .eq('provider_id', userData.provider_id)
          .not('price_usd', 'is', null);

        const opts: ProcedureOption[] = (priceRows || [])
          .filter((r: any) => r.procedure)
          .map((r: any) => ({
            id: r.procedure_id,
            name: r.procedure.name,
            price_usd: r.price_usd,
          }));
        setProcedures(opts);
      }

      // An active discount for this provider, if any.
      const { data: active } = await supabase
        .from('clearcross_flash_discounts')
        .select('*')
        .eq('provider_id', userData.provider_id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveDiscount(active as FlashDiscount | null);

      // The most recent discount at all (active or already expired/ended), to
      // enforce the cooldown even once the active one has lapsed.
      const { data: mostRecent } = await supabase
        .from('clearcross_flash_discounts')
        .select('expires_at')
        .eq('provider_id', userData.provider_id)
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mostRecent?.expires_at) {
        const cooldownEnds = new Date(
          new Date(mostRecent.expires_at).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
        );
        if (cooldownEnds > new Date()) {
          setCooldownUntil(cooldownEnds.toISOString());
        }
      }
    } catch (err) {
      console.error('Failed to load flash discount settings:', err);
      setError(t.flashErrorLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation
  const validationError = useMemo(() => {
    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 50)) {
      return t.flashErrorPercentRange;
    }
    if (discountType === 'fixed' && (discountValue < 1 || discountValue > 200)) {
      return t.flashErrorFixedRange;
    }
    if (durationHours < 1 || durationHours > 24) {
      return t.flashErrorDuration;
    }
    if (message.length > 140) {
      return t.flashErrorMessageLength;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountType, discountValue, durationHours, message, locale]);

  const handleSubmit = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!providerId) {
      setError(t.flashErrorNoProvider);
      return;
    }
    if (cooldownUntil) {
      setError(t.flashErrorCooldown);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startsAt = new Date();
      const expiresAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);

      const { data, error: insertError } = await supabase
        .from('clearcross_flash_discounts')
        .insert({
          provider_id: providerId,
          discount_type: discountType,
          discount_value: discountValue,
          procedure_ids: selectedProcedures.length > 0 ? selectedProcedures : [],
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          message: message || null,
          is_active: true,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      setActiveDiscount(data as FlashDiscount);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to post flash discount:', err);
      setError(t.flashErrorPost);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndEarly = async () => {
    if (!activeDiscount) return;

    setIsEnding(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('clearcross_flash_discounts')
        .update({ is_active: false })
        .eq('id', activeDiscount.id);

      if (updateError) throw updateError;

      setActiveDiscount(null);
      setSuccess(false);
      // Ending early still starts the cooldown clock from now.
      const cooldownEnds = new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000);
      setCooldownUntil(cooldownEnds.toISOString());
    } catch (err) {
      console.error('Failed to end flash discount:', err);
      setError(t.flashErrorEnd);
    } finally {
      setIsEnding(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Zap className="w-8 h-8 text-orange-500 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <ProviderSubnav />
      <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back link */}
        <Link
          href="/provider"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-blue mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.flashBackToDashboard}
        </Link>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">{t.flashHeading}</h1>
            <p className="text-sm text-neutral-500">
              {t.flashSubtitle}
            </p>
          </div>
        </div>

        {/* Active Discount Display */}
        {activeDiscount && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">{t.flashActiveLabel}</span>
              </div>
              <CountdownTimer
                expiresAt={activeDiscount.expires_at}
                onExpire={() => setActiveDiscount(null)}
                size="md"
                className="!text-yellow-200"
                locale={locale}
              />
            </div>
            <p className="text-white/90 mb-1">
              {activeDiscount.discount_type === 'percentage'
                ? t.flashOffPercent.replace('{n}', String(activeDiscount.discount_value))
                : t.flashOffFixed.replace('{n}', String(activeDiscount.discount_value))}
              {activeDiscount.procedure_ids.length > 0
                ? ` ${t.flashOnProcedures.replace('{n}', String(activeDiscount.procedure_ids.length))}`
                : ` ${t.flashOnAll}`}
            </p>
            {activeDiscount.message && (
              <p className="text-white/75 text-sm italic">"{activeDiscount.message}"</p>
            )}
            <button
              onClick={handleEndEarly}
              disabled={isEnding}
              className="mt-4 px-5 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
            >
              {isEnding ? t.flashEnding : t.flashEndEarly}
            </button>
          </div>
        )}

        {/* Cooldown notice — shown once a discount just ended or expired */}
        {!activeDiscount && cooldownUntil && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {t.flashCooldownNotice.replace(
              '{time}',
              new Date(cooldownUntil).toLocaleTimeString(locale === 'es' ? 'es-MX' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
            )}
          </div>
        )}

        {/* Creation Form (hidden when active discount exists or cooling down) */}
        {!activeDiscount && !cooldownUntil && (
          <div className="space-y-6">
            {/* Discount Type */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand-blue" />
                {t.flashDiscountType}
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
                  <span className="font-semibold block">{t.flashPercentageOff}</span>
                  <span className="text-xs">{t.flashPercentageExample}</span>
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
                  <span className="font-semibold block">{t.flashFixedAmountOff}</span>
                  <span className="text-xs">{t.flashFixedExample}</span>
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4">
                {discountType === 'percentage' ? t.flashDiscountPercentage : t.flashDiscountAmount}
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
                  {discountType === 'percentage' ? t.flashMaxPercent : t.flashMaxFixed}
                </span>
              </div>

              {/* Live preview */}
              <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-500 mb-1">{t.flashPreview}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400 line-through">
                    {formatUSD(sampleOriginalPrice)}
                  </span>
                  <span className="text-lg font-bold text-brand-green">
                    {formatUSD(previewPrice)}
                  </span>
                  <span className="text-xs text-orange-600 font-medium">
                    {discountType === 'percentage'
                      ? t.flashSavePercent.replace('{n}', String(discountValue))
                      : t.flashSaveFixed.replace('{value}', formatUSD(discountValue))}
                  </span>
                </div>
              </div>
            </div>

            {/* Procedures */}
            {procedures.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <h2 className="font-semibold text-neutral-dark mb-2">
                  {t.flashApplyToProcedures}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  {t.flashApplyToProceduresHint}
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
                    {t.flashNoProceduresSelected}
                  </p>
                )}
              </div>
            )}

            {/* Duration */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-blue" />
                {t.flashDuration}
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
                    {durationLabel(preset.hours, t)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-blue" />
                {t.flashMessage}
              </h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={140}
                rows={2}
                placeholder={t.flashMessagePlaceholder}
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
              {isSubmitting ? t.flashGoingLive : t.flashGoLive}
            </button>

            {/* Rules */}
            <div className="text-xs text-neutral-400 space-y-1">
              <p>• {t.flashRuleMax}</p>
              <p>• {t.flashRuleDuration}</p>
              <p>• {t.flashRuleOneActive}</p>
              <p>• {t.flashRuleCooldown}</p>
            </div>
          </div>
        )}

        {/* Success state */}
        {success && activeDiscount && (
          <div className="mt-6 p-4 bg-brand-green/10 border border-brand-green/20 rounded-xl text-center">
            <p className="text-brand-green font-semibold mb-2">
              {t.flashSuccessLive}
            </p>
            <p className="text-sm text-neutral-600">
              {t.flashSuccessBody}
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
