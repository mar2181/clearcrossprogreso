/**
 * What a price actually IS, in one place.
 *
 * ⛔ WHY THIS FILE EXISTS. The discount math used to live as two module-private
 * functions inside `components/providers/PriceTable.tsx`, which is a
 * `'use client'` component. A server component cannot import from it, so
 * building structured data meant writing a SECOND copy of the arithmetic.
 *
 * Two copies of "what does this cost" is how a page ends up rendering $960 in
 * the table while its JSON-LD tells Google $1,200 -- and the schema is the copy
 * nobody looks at, so the drift is silent. That is exactly the failure class
 * that put an `aggregateRating` of 4.2 on a page reading "No reviews yet".
 *
 * So: the table and the schema both call `effectivePrice()`. They cannot
 * disagree, by construction rather than by discipline.
 */
import type { FlashDiscount, ProviderPrice } from '@/lib/types';

export type PricedProcedure = ProviderPrice & {
  procedure?: { name: string; sort_order: number; slug?: string; id?: string };
};

export function getDiscountedPrice(price: number, flash: FlashDiscount): number {
  if (flash.discount_type === 'percentage') {
    return Math.round(price * (1 - flash.discount_value / 100) * 100) / 100;
  }
  return Math.max(0, price - flash.discount_value);
}

export function isProcedureDiscounted(
  procId: string | undefined,
  flash: FlashDiscount,
): boolean {
  if (!procId) return false;
  // An empty procedure_ids list means the discount applies to everything.
  if (!flash.procedure_ids || flash.procedure_ids.length === 0) return true;
  return flash.procedure_ids.includes(procId);
}

export interface EffectivePrice {
  /** The number the visitor actually sees. */
  amount: number;
  /** The pre-discount number, present only when a discount is applied. */
  wasAmount?: number;
  /** Real expiry from the discount row -- never invented. */
  validUntil?: string;
}

/**
 * The price this row renders, or `null` when it renders no price at all.
 *
 * ⛔ `null` is not "zero" and not "unknown-so-guess". A row with
 * `price_usd === null` renders a "Request a quote" LINK, not a figure -- so
 * there is nothing to put in an Offer, and inventing one would advertise a
 * price this provider has never given us.
 *
 * ⛔ `price_usd === 0` is a real, deliberate value: the table renders the word
 * "Free" (consultations, mostly). An Offer at 0 is therefore honest and matches
 * the page. Do not "fix" this by treating 0 as missing.
 */
export function effectivePrice(
  item: PricedProcedure,
  flash?: FlashDiscount | null,
): EffectivePrice | null {
  const base = item.price_usd;
  if (base === null || base === undefined) return null;
  if (base === 0) return { amount: 0 };

  const procId = item.procedure_id || item.procedure?.id;
  if (flash && isProcedureDiscounted(procId, flash)) {
    return {
      amount: getDiscountedPrice(base, flash),
      wasAmount: base,
      validUntil: flash.expires_at,
    };
  }
  return { amount: base };
}
