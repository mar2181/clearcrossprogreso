'use client';

import React from 'react';
import Link from 'next/link';
import { ProviderPrice } from '@/lib/types';
import { cn, formatUSD } from '@/lib/utils';

interface PriceTableProps {
  prices: (ProviderPrice & { procedure?: { name: string; sort_order: number } })[];
  providerName: string;
  providerId?: string;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, providerName, providerId }) => {
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 font-semibold text-neutral-dark">
                Procedure
              </th>
              <th className="text-right py-3 px-4 font-semibold text-neutral-dark">
                Price (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPrices.map((item, index) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceTable;
