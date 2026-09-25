'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/context';
import { dictFor } from '@/lib/i18n/dict';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  size?: 'sm' | 'md';
  // Optional so the three public-site callers that don't yet resolve a
  // locale (FlashDiscountBanner, FlashNotificationBanner) keep behaving
  // exactly as before. The portal always passes its own resolved locale.
  locale?: Locale;
}

function getTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff,
  };
}

function formatTime(time: ReturnType<typeof getTimeRemaining>, locale: Locale) {
  const t = dictFor(locale).provider;
  if (time.total <= 0) return t.countdownExpired;
  if (time.hours > 0) {
    return t.countdownHoursMinutes.replace('{h}', String(time.hours)).replace('{m}', String(time.minutes));
  }
  return t.countdownMinutesSeconds.replace('{m}', String(time.minutes)).replace('{s}', String(time.seconds));
}

export default function CountdownTimer({
  expiresAt,
  onExpire,
  className,
  size = 'sm',
  locale = 'en',
}: CountdownTimerProps) {
  const [time, setTime] = useState(getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTime(remaining);

      if (remaining.total <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (time.total <= 0) return null;

  const isUrgent = time.total < 30 * 60 * 1000; // Under 30 minutes

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium tabular-nums',
        isUrgent && 'animate-pulse',
        size === 'sm' ? 'text-xs' : 'text-sm',
        isUrgent ? 'text-red-600' : 'text-orange-600',
        className
      )}
    >
      <svg
        className={cn('flex-shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {formatTime(time, locale)}
    </span>
  );
}
