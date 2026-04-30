'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { formatUSD } from '@/lib/utils';
import type { QuoteRequestWithDetails } from '@/lib/types';

const QUOTES_PER_PAGE = 10;

interface QuoteListProps {
  quotes: QuoteRequestWithDetails[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'status-pending';
    case 'quoted': return 'status-quoted';
    case 'accepted': return 'status-accepted';
    case 'rejected': return 'status-rejected';
    case 'completed': return 'status-completed';
    default: return 'default';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function QuoteList({ quotes }: QuoteListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-600 mb-6">
          No quote requests yet. Start by finding a provider.
        </p>
        <Link href="/dentistry">
          <Button variant="primary">Find Providers</Button>
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(quotes.length / QUOTES_PER_PAGE);
  const paginatedQuotes = quotes.slice(
    (currentPage - 1) * QUOTES_PER_PAGE,
    currentPage * QUOTES_PER_PAGE
  );

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">Provider</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">Procedure</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">Submitted</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-neutral-900 text-sm">Price</th>
              <th className="text-right py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuotes.map((quote) => (
              <tr key={quote.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-4 px-4">
                  <p className="font-semibold text-neutral-900">
                    {quote.provider?.name || 'Unknown'}
                  </p>
                </td>
                <td className="py-4 px-4 text-neutral-700">
                  {quote.procedure?.name || 'Custom Request'}
                </td>
                <td className="py-4 px-4 text-neutral-700 text-sm">
                  {formatDate(quote.created_at)}
                </td>
                <td className="py-4 px-4">
                  <Badge variant={getStatusBadgeVariant(quote.status)}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-right font-semibold text-neutral-900">
                  {quote.quoted_price ? formatUSD(quote.quoted_price) : '—'}
                </td>
                <td className="py-4 px-4 text-right">
                  <Link href={`/quote/${quote.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedQuotes.map((quote) => (
          <Link key={quote.id} href={`/quote/${quote.id}`}>
            <Card hover>
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {quote.provider?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {quote.procedure?.name || 'Custom Request'}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(quote.status)}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">{formatDate(quote.created_at)}</span>
                  <span className="font-semibold text-neutral-900">
                    {quote.quoted_price ? formatUSD(quote.quoted_price) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <p className="text-center text-xs text-neutral-400">
        Showing {(currentPage - 1) * QUOTES_PER_PAGE + 1}–{Math.min(currentPage * QUOTES_PER_PAGE, quotes.length)} of {quotes.length} quotes
      </p>
    </div>
  );
}
