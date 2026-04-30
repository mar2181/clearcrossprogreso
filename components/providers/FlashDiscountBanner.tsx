'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { FlashDiscount } from '@/lib/types';
import CountdownTimer from '@/components/ui/CountdownTimer';

interface FlashDiscountBannerProps {
  flashDiscount: FlashDiscount;
  providerName: string;
  providerId: string;
  categorySlug: string;
}

export default function FlashDiscountBanner({
  flashDiscount,
  providerName,
  providerId,
  categorySlug,
}: FlashDiscountBannerProps) {
  const [expired, setExpired] = useState(false);

  if (expired) return null;

  const discountLabel =
    flashDiscount.discount_type === 'percentage'
      ? `${flashDiscount.discount_value}% off`
      : `$${flashDiscount.discount_value} off`;

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white">
      <div className="container-page py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full flex-shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg">
                  Flash Deal: {discountLabel}
                </span>
                <CountdownTimer
                  expiresAt={flashDiscount.expires_at}
                  onExpire={() => setExpired(true)}
                  size="md"
                  className="!text-yellow-200"
                />
              </div>
              {flashDiscount.message && (
                <p className="text-white/90 text-sm mt-0.5">
                  {flashDiscount.message}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/quote?provider=${providerId}&flash=${flashDiscount.id}`}
            className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-50 transition-colors text-sm shadow-lg flex-shrink-0"
          >
            Get This Deal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
