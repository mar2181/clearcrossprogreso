'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, X } from 'lucide-react';
import { FlashDiscount } from '@/lib/types';
import CountdownTimer from '@/components/ui/CountdownTimer';

interface FlashNotification {
  discount: FlashDiscount;
  providerName: string;
  categorySlug: string;
  procedureName?: string;
}

export default function FlashNotificationBanner() {
  const [notifications, setNotifications] = useState<FlashNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch personalized flash notifications for logged-in users
    fetch('/api/providers?action=flash-notifications')
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {
        // Silently fail — no notifications for anonymous users
      });
  }, []);

  const visibleNotifications = notifications.filter((n) => !dismissed.has(n.discount.id));

  if (visibleNotifications.length === 0) return null;

  const current = visibleNotifications[currentIndex % visibleNotifications.length];
  if (!current) return null;

  const discountLabel =
    current.discount.discount_type === 'percentage'
      ? `${current.discount.discount_value}% off`
      : `$${current.discount.discount_value} off`;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
      <div className="container-page py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-4 h-4 fill-current flex-shrink-0" />
          <p className="truncate">
            <strong>{current.providerName}</strong> has{' '}
            <strong>{discountLabel}</strong>
            {current.procedureName && ` on ${current.procedureName}`}
            {' — '}
            <CountdownTimer
              expiresAt={current.discount.expires_at}
              onExpire={() => setDismissed((prev) => new Set(prev).add(current.discount.id))}
              className="!text-yellow-200 inline"
            />
            {current.discount.message && (
              <span className="hidden sm:inline text-white/80"> — {current.discount.message}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/${current.categorySlug}?flash=true`}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
          >
            View Deal
          </Link>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(current.discount.id))}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
