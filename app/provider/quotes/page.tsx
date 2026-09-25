'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProviderSubnav from '@/components/providers/ProviderSubnav';
import { Loader2, ChevronDown } from 'lucide-react';
import { usePortalLocale } from '@/lib/i18n/usePortalLocale';
import { dictFor } from '@/lib/i18n/dict';

interface Quote {
  id: string;
  user_id: string;
  user: { full_name: string | null; email: string };
  procedure: { name: string } | null;
  description: string;
  photo_url: string | null;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'completed';
  quoted_price: number | null;
  provider_notes: string | null;
  created_at: string;
}

export default function QuotesPage() {
  const router = useRouter();
  const supabase = createClient();
  const locale = usePortalLocale();
  const t = dictFor(locale).provider;

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'quoted' | 'accepted' | 'completed'>(
    'all'
  );
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Response form state
  const [responsePrice, setResponsePrice] = useState<Record<string, string>>({});
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/auth/login?redirectTo=/provider/quotes');
        return;
      }

      // Get user data
      const { data: userData } = await supabase
        .from('clearcross_users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!userData || userData.role !== 'provider' || !userData.provider_id) {
        router.push('/');
        return;
      }

      // Get quote requests
      const { data: quoteData } = await supabase
        .from('clearcross_quote_requests')
        .select(
          `
          *,
          user:clearcross_users(*),
          procedure:clearcross_procedures(*)
        `
        )
        .eq('provider_id', userData.provider_id)
        .order('created_at', { ascending: false });

      setQuotes(quoteData || []);
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError(t.quotesErrorLoad);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (quoteId: string) => {
    try {
      setResponding(quoteId);
      setError('');

      const price = responsePrice[quoteId];
      const notes = responseNotes[quoteId];

      if (!price || parseFloat(price) <= 0) {
        setError(t.quotesErrorValidPrice);
        setResponding(null);
        return;
      }

      const { error: updateError } = await supabase
        .from('clearcross_quote_requests')
        .update({
          quoted_price: parseFloat(price),
          provider_notes: notes || null,
          status: 'quoted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (updateError) throw updateError;

      setSuccess(t.quotesSuccessSend);
      setTimeout(() => setSuccess(''), 3000);
      setResponsePrice({ ...responsePrice, [quoteId]: '' });
      setResponseNotes({ ...responseNotes, [quoteId]: '' });
      setExpandedId(null);
      await fetchQuotes();
    } catch (err) {
      console.error('Failed to respond to quote:', err);
      setError(t.quotesErrorRespond);
    } finally {
      setResponding(null);
    }
  };

  const filteredQuotes = quotes.filter(
    (q) => filter === 'all' || q.status === filter
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'quoted':
        return 'status-quoted';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'completed':
        return 'status-completed';
      default:
        return 'default';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t.statusPending;
      case 'quoted':
        return t.statusQuoted;
      case 'accepted':
        return t.statusAccepted;
      case 'rejected':
        return t.statusRejected;
      case 'completed':
        return t.statusCompleted;
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ProviderSubnav />
      <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">{t.quotesHeading}</h1>
          <p className="text-neutral-600">{t.quotesSubtitle}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'quoted', 'accepted', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === tab
                  ? 'bg-brand-blue text-white'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {tab === 'all' ? t.quotesTabAll : statusLabel(tab)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-error-light text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-3 bg-brand-green-light text-brand-green rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Quotes List */}
        <Card>
          <CardContent className="pt-6">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">
                  {filter === 'all'
                    ? t.quotesEmptyAll
                    : t.quotesEmpty.replace('{filter}', statusLabel(filter).toLowerCase())}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuotes.map((quote) => (
                  <div key={quote.id}>
                    {/* Quote Item */}
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === quote.id ? null : quote.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-100">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-neutral-900">
                              {quote.user?.full_name || t.quotesAnonymousPatient}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {quote.procedure?.name || t.quotesCustomRequest}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {formatDate(quote.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant={getStatusBadgeVariant(quote.status)}>
                              {statusLabel(quote.status)}
                            </Badge>
                            <ChevronDown
                              className={`w-5 h-5 text-neutral-500 transition-transform ${
                                expandedId === quote.id ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedId === quote.id && (
                      <div className="mt-2 p-4 bg-white border border-neutral-100 rounded-lg space-y-4">
                        {/* Patient Description */}
                        {quote.description && (
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 mb-2">
                              {t.quotesPatientRequest}
                            </p>
                            <p className="text-neutral-700 text-sm">{quote.description}</p>
                          </div>
                        )}

                        {/* Patient Photo */}
                        {quote.photo_url && (
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 mb-2">
                              {t.quotesReferencePhoto}
                            </p>
                            <img
                              src={quote.photo_url.startsWith('http')
                                ? quote.photo_url
                                : `/api/quotes/photo?path=${encodeURIComponent(quote.photo_url)}`}
                              alt=""
                              className="max-w-full sm:max-w-xs rounded-lg"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e5e5"/%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        )}

                        {/* Respond Form */}
                        {quote.status === 'pending' && (
                          <div className="space-y-4 border-t border-neutral-100 pt-4">
                            <p className="text-sm font-semibold text-neutral-900">{t.quotesSendQuote}</p>

                            <Input
                              label={t.quotesPriceLabel}
                              type="number"
                              placeholder="0.00"
                              value={responsePrice[quote.id] || ''}
                              onChange={(e) =>
                                setResponsePrice({
                                  ...responsePrice,
                                  [quote.id]: e.target.value,
                                })
                              }
                              step="0.01"
                              min="0"
                            />

                            <Textarea
                              label={t.quotesNotesLabel}
                              placeholder={t.quotesNotesPlaceholder}
                              value={responseNotes[quote.id] || ''}
                              onChange={(e) =>
                                setResponseNotes({
                                  ...responseNotes,
                                  [quote.id]: e.target.value,
                                })
                              }
                              rows={3}
                            />

                            <div className="flex gap-3">
                              <Button
                                variant="primary"
                                onClick={() => handleRespond(quote.id)}
                                loading={responding === quote.id}
                                disabled={responding === quote.id}
                              >
                                {t.quotesSendQuote}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setExpandedId(null)}
                                disabled={responding === quote.id}
                              >
                                {t.quotesCancel}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Already Responded */}
                        {quote.status !== 'pending' && quote.quoted_price && (
                          <div className="bg-neutral-50 p-4 rounded-lg border-t border-neutral-100">
                            <p className="text-sm font-semibold text-neutral-900 mb-2">
                              {t.quotesYourQuote}
                            </p>
                            <p className="text-2xl font-bold text-brand-blue mb-2">
                              ${quote.quoted_price.toFixed(2)}
                            </p>
                            {quote.provider_notes && (
                              <p className="text-sm text-neutral-700">{quote.provider_notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
