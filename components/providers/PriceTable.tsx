'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { ProviderPrice, FlashDiscount } from '@/lib/types';
import { cn, formatUSD } from '@/lib/utils';
import { US_BENCHMARKS } from '@/lib/us-benchmarks';
// One definition of what a price is, shared with the JSON-LD builder so the
// table and the structured data cannot drift apart. See lib/pricing.ts.
import { effectivePrice } from '@/lib/pricing';
import { useI18n } from '@/lib/i18n';

interface PriceTableProps {
  prices: (ProviderPrice & { procedure?: { name: string; sort_order: number; slug?: string; id?: string } })[];
  providerName: string;
  providerId?: string;
  flashDiscount?: FlashDiscount | null;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, providerName, providerId, flashDiscount }) => {
  const { dict } = useI18n();
  const [showComparison, setShowComparison] = useState(true);

  // Sort by procedure sort_order
  const sortedPrices = [...prices].sort((a, b) => {
    const orderA = a.procedure?.sort_order ?? 999;
    const orderB = b.procedure?.sort_order ?? 999;
    return orderA - orderB;
  });

  if (sortedPrices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">{dict.ui.noProceduresYet}</p>
      </div>
    );
  }

  // Calculate total potential savings
  let totalSaved = 0;
  let savingsCount = 0;
  sortedPrices.forEach(item => {
    const slug = item.procedure?.slug || '';
    const usPrice = US_BENCHMARKS[slug];
    if (usPrice && item.price_usd && item.price_usd > 0) {
      totalSaved += usPrice - item.price_usd;
      savingsCount++;
    }
  });

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-brand-green-light border border-brand-green/20 rounded-lg p-4">
        <p className="text-sm text-brand-green font-medium">
          {dict.ui.priceSourceNote}
        </p>
      </div>

      {/* Toggle for US comparison */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={cn(
            'text-sm font-medium px-3 py-1.5 rounded-full transition-colors',
            showComparison
              ? 'bg-brand-green/10 text-brand-green border border-brand-green/30'
              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
          )}
        >
          {showComparison ? dict.ui.comparisonOn : dict.ui.comparisonOff}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                {dict.ui.colProcedure}
              </th>
              <th className="text-right py-3 px-4 font-semibold text-brand-green">
                {dict.ui.colProgresoPrice}
              </th>
              {showComparison && (
                <>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-400">
                    {dict.ui.colUsPrice}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-green">
                    {dict.ui.colYouSave}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPrices.map((item, index) => {
              const priced = effectivePrice(item, flashDiscount);
              const procedureSlug = item.procedure?.slug || '';
              const usPrice = US_BENCHMARKS[procedureSlug] || null;
              const dollarSaved = usPrice && item.price_usd ? usPrice - item.price_usd : null;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-neutral-100 transition-colors hover:bg-neutral-50',
                    index % 2 === 1 && 'bg-neutral-50'
                  )}
                >
                  <td className="py-3 px-4 text-neutral-dark">
                    <span>{item.procedure?.name || dict.ui.colProcedure}</span>
                    {item.price_notes && (
                      <span className="block text-xs text-neutral-500 mt-0.5">
                        {item.price_notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {priced ? (
                      priced.amount === 0 ? (
                        <span className="font-semibold text-brand-green">{dict.ui.free}</span>
                      ) : priced.wasAmount !== undefined ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs text-neutral-400 line-through">
                            {formatUSD(priced.wasAmount)}
                          </span>
                          <span className="font-bold text-brand-green flex items-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                            {formatUSD(priced.amount)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-brand-green">
                          {formatUSD(priced.amount)}
                        </span>
                      )
                    ) : (
                      <Link
                        href="#quote-form"
                        className="text-brand-blue hover:underline font-medium"
                      >
                        {dict.ui.requestQuote}
                      </Link>
                    )}
                  </td>
                  {showComparison && (
                    <>
                      <td className="py-3 px-4 text-right text-neutral-400">
                        {usPrice ? (
                          <span className="line-through">{formatUSD(usPrice)}</span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {dollarSaved && dollarSaved > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green font-bold text-xs px-2 py-1 rounded-full">
                            {dict.ui.save} ${dollarSaved.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom savings summary */}
      {showComparison && savingsCount > 0 && (
        <div className="bg-gradient-to-r from-brand-green/5 to-brand-blue/5 border border-brand-green/20 rounded-lg p-4">
          <p className="text-sm text-neutral-dark">
            <span className="font-bold text-brand-green">💰 Save ${totalSaved.toLocaleString()}</span> {dict.ui.savingsSummaryTail.replace('{n}', String(savingsCount))}
            {/*
              ⛔ This sentence used to read "All procedures at {providerName} are
              performed by licensed professionals using the same quality
              materials." Two claims, neither of which we can substantiate, on a
              page whose own disclaimer says we have NOT checked any licence --
              and it rendered in both language trees. Say where the number came
              from instead; that part is true and is the part a reader needs.
              Guarded by test/honest-claims.mjs sections 9 and 10.
            */}
            {dict.ui.savingsProvenance.replace('{provider}', providerName)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceTable;
