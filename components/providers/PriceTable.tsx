'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProviderPrice } from '@/lib/types';
import { cn, formatUSD } from '@/lib/utils';

// US price benchmarks for comparison
const US_BENCHMARKS: Record<string, number> = {
  'dental-cleaning': 150,
  'composite-filling': 250,
  'root-canal': 1200,
  'metal-porcelain-crown': 1200,
  'zirconia-crown': 1500,
  'emax-crown': 1800,
  'dental-implant': 3500,
  'all-on-4': 25000,
  'all-on-6': 30000,
  'porcelain-veneer': 1500,
  'teeth-whitening': 600,
  'dentures': 2000,
  'wisdom-tooth-extraction': 400,
  'braces': 6000,
  'bone-graft': 1200,
  'composite-veneer': 800,
  'lumineer': 2000,
  'crown-over-implant': 1500,
  '3-unit-bridge': 3600,
  'deep-cleaning': 300,
  'tooth-extraction': 250,
  'periapical-xray': 35,
};

interface PriceTableProps {
  prices: (ProviderPrice & { procedure?: { name: string; sort_order: number; slug?: string } })[];
  providerName: string;
  providerId?: string;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, providerName, providerId }) => {
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
        <p className="text-neutral-500">No procedures listed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-brand-green-light border border-brand-green/20 rounded-lg p-4">
        <p className="text-sm text-brand-green font-medium">
          Prices listed here are final and guaranteed. Providers agree that quoted prices will not change upon arrival.
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
          {showComparison ? '🇺🇸 US comparison ON' : '🇺🇸 Show US prices'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                Procedure
              </th>
              <th className="text-right py-3 px-4 font-semibold text-neutral-dark">
                Progreso Price
              </th>
              {showComparison && (
                <>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-400">
                    US Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-green">
                    You Save
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPrices.map((item, index) => {
              const procedureSlug = item.procedure?.slug || '';
              const usPrice = US_BENCHMARKS[procedureSlug] || null;
              const savings = usPrice && item.price_usd ? Math.round(((usPrice - item.price_usd) / usPrice) * 100) : null;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-neutral-100 transition-colors hover:bg-neutral-50',
                    index % 2 === 1 && 'bg-neutral-50'
                  )}
                >
                  <td className="py-3 px-4 text-neutral-dark">
                    <span>{item.procedure?.name || 'Procedure'}</span>
                    {item.price_notes && (
                      <span className="block text-xs text-neutral-500 mt-0.5">
                        {item.price_notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.price_usd !== null && item.price_usd !== undefined ? (
                      item.price_usd === 0 ? (
                        <span className="font-semibold text-brand-green">
                          Free
                        </span>
                      ) : (
                        <span className="font-semibold text-brand-green">
                          {formatUSD(item.price_usd)}
                        </span>
                      )
                    ) : (
                      <Link
                        href={`/quote?provider=${providerId}`}
                        className="text-brand-blue hover:underline font-medium"
                      >
                        Request Quote
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
                        {savings ? (
                          <span className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green font-bold text-xs px-2 py-1 rounded-full">
                            {savings}% OFF
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
      {showComparison && (
        <div className="bg-gradient-to-r from-brand-green/5 to-brand-blue/5 border border-brand-green/20 rounded-lg p-4">
          <p className="text-sm text-neutral-dark">
            <span className="font-bold text-brand-green">💰 Save 55–99%</span> compared to US dental prices. 
            All procedures at {providerName} are performed by licensed dentists using the same quality materials.
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceTable;
