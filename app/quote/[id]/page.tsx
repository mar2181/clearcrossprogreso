import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QuoteRequestWithDetails } from '@/lib/types';
import { formatUSD, getStatusColor, getStatusLabel } from '@/lib/utils';
import { QuoteActions } from './QuoteActions';

export const metadata: Metadata = {
  title: 'Quote Details | ClearCross Progreso',
  description: 'View your quote request status and details',
};

async function getQuoteWithDetails(id: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select(
      `
      *,
      provider:providers(*),
      procedure:procedures(*),
      user:users(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quote:', error);
    return null;
  }

  return data as QuoteRequestWithDetails;
}

function generateShortId(fullId: string): string {
  return fullId.slice(0, 8).toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface QuoteDetailPageProps {
  params: { id: string };
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const quote = await getQuoteWithDetails(params.id);

  if (!quote) {
    notFound();
  }

  const shortId = generateShortId(quote.id);
  const statusColor = getStatusColor(quote.status);
  const statusLabel = getStatusLabel(quote.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                Quote #{shortId}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Requested on {formatDate(quote.created_at)}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full border text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Quote Details Card */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <h2 className="font-semibold text-neutral-900">
                  Quote Details
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Provider</span>
                  <span className="font-medium text-neutral-900">
                    {quote.provider.name}
                  </span>
                </div>
                {quote.procedure && (
                  <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                    <span className="text-sm text-neutral-600">Procedure</span>
                    <span className="font-medium text-neutral-900">
                      {quote.procedure.name}
                    </span>
                  </div>
                )}
                <div className="py-3 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Description</span>
                  <p className="font-medium text-neutral-900 mt-2 text-sm leading-relaxed">
                    {quote.description}
                  </p>
                </div>
                {quote.photo_url && (
                  <div className="py-3">
                    <span className="text-sm text-neutral-600 block mb-3">
                      Uploaded Photo
                    </span>
                    <img
                      src={quote.photo_url}
                      alt="Quote reference photo"
                      className="w-full h-48 object-cover rounded-lg border border-neutral-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <h2 className="font-semibold text-neutral-900">
                  Contact Information
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Name</span>
                  <span className="font-medium text-neutral-900">
                    {quote.user.full_name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm text-neutral-600">Email</span>
                  <span className="font-medium text-neutral-900">
                    {quote.user.email}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-neutral-600">Phone</span>
                  <span className="font-medium text-neutral-900">
                    {quote.user.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <h2 className="font-semibold text-neutral-900">Timeline</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-brand-blue"></div>
                      <div
                        className={`w-0.5 h-8 ${
                          ['quoted', 'accepted', 'rejected', 'completed'].includes(
                            quote.status
                          )
                            ? 'bg-brand-blue'
                            : 'bg-neutral-300'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-900">
                        Request Submitted
                      </p>
                      <p className="text-xs text-neutral-600">
                        {formatDate(quote.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          ['quoted', 'accepted', 'rejected', 'completed'].includes(
                            quote.status
                          )
                            ? 'bg-brand-blue'
                            : 'bg-neutral-300'
                        }`}
                      ></div>
                      <div
                        className={`w-0.5 h-8 ${
                          ['accepted', 'rejected', 'completed'].includes(quote.status)
                            ? 'bg-brand-blue'
                            : 'bg-neutral-300'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-900">
                        Provider Response
                      </p>
                      {quote.responded_at ? (
                        <p className="text-xs text-neutral-600">
                          {formatDate(quote.responded_at)}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-500">Pending...</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          ['accepted', 'completed'].includes(quote.status)
                            ? 'bg-brand-green'
                            : ['rejected'].includes(quote.status)
                            ? 'bg-red-500'
                            : 'bg-neutral-300'
                        }`}
                      ></div>
                      <div
                        className={`w-0.5 h-8 ${
                          ['completed'].includes(quote.status)
                            ? 'bg-brand-green'
                            : 'bg-neutral-300'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-900">
                        You {quote.status === 'accepted' ? 'Accepted' : 'Declined'}{' '}
                        Quote
                      </p>
                      <p className="text-xs text-neutral-500">
                        {quote.price_locked ? 'Price Locked' : 'Awaiting decision'}
                      </p>
                    </div>
                  </div>

                  {quote.status === 'completed' && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-brand-blue"></div>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-neutral-900">
                          Completed
                        </p>
                        <p className="text-xs text-neutral-500">
                          Visit completed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Provider Info Card */}
            {quote.status !== 'rejected' && quote.status !== 'pending' && (
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                  <h2 className="font-semibold text-neutral-900">
                    Provider Contact
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wide">
                      Address
                    </p>
                    <p className="text-sm text-neutral-900 mt-1">
                      {quote.provider.address}
                    </p>
                  </div>
                  {quote.provider.phone && (
                    <div>
                      <p className="text-xs text-neutral-600 uppercase tracking-wide">
                        Phone
                      </p>
                      <a
                        href={`tel:${quote.provider.phone}`}
                        className="text-sm text-brand-blue hover:underline mt-1"
                      >
                        {quote.provider.phone}
                      </a>
                    </div>
                  )}
                  {quote.provider.whatsapp && (
                    <div>
                      <p className="text-xs text-neutral-600 uppercase tracking-wide">
                        WhatsApp
                      </p>
                      <a
                        href={`https://wa.me/${quote.provider.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-green hover:underline mt-1"
                      >
                        Message on WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-8">
          <QuoteActions
            quoteId={quote.id}
            status={quote.status}
            quotedPrice={quote.quoted_price}
            providerNotes={quote.provider_notes}
          />
        </div>
      </div>
    </div>
  );
}
