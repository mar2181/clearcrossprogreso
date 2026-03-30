'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Loader2, ChevronDown } from 'lucide-react';

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
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!userData || userData.role !== 'provider' || !userData.provider_id) {
        router.push('/');
        return;
      }

      // Get quote requests
      const { data: quoteData } = await supabase
        .from('quote_requests')
        .select(
          `
          *,
          user:users(*),
          procedure:procedures(*)
        `
        )
        .eq('provider_id', userData.provider_id)
        .order('created_at', { ascending: false });

      setQuotes(quoteData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load quotes');
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
        setError('Please enter a valid price');
        setResponding(null);
        return;
      }

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          quoted_price: parseFloat(price),
          provider_notes: notes || null,
          status: 'quoted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (updateError) throw updateError;

      setSuccess('Quote sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setResponsePrice({ ...responsePrice, [quoteId]: '' });
      setResponseNotes({ ...responseNotes, [quoteId]: '' });
      setExpandedId(null);
      await fetchQuotes();
    } catch (err: any) {
      setError(err.message || 'Failed to respond to quote');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Quote Requests</h1>
          <p className="text-neutral-600">Respond to patient requests for quotes</p>
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  No {filter !== 'all' ? filter : ''} quote requests
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
                              {quote.user?.full_name || 'Anonymous Patient'}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {quote.procedure?.name || 'Custom Request'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {formatDate(quote.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant={getStatusBadgeVariant(quote.status)}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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
                              Patient Request
                            </p>
                            <p className="text-neutral-700 text-sm">{quote.description}</p>
                          </div>
                        )}

                        {/* Patient Photo */}
                        {quote.photo_url && (
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 mb-2">
                              Reference Photo
                            </p>
                            <img
                              src={quote.photo_url}
                              alt="Patient reference"
                              className="max-w-xs rounded-lg"
                            />
                          </div>
                        )}

                        {/* Respond Form */}
                        {quote.status === 'pending' && (
                          <div className="space-y-4 border-t border-neutral-100 pt-4">
                            <p className="text-sm font-semibold text-neutral-900">Send Quote</p>

                            <Input
                              label="Price (USD)"
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
                              label="Notes (Optional)"
                              placeholder="e.g., This includes the initial consultation..."
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
                                Send Quote
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setExpandedId(null)}
                                disabled={responding === quote.id}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Already Responded */}
                        {quote.status !== 'pending' && quote.quoted_price && (
                          <div className="bg-neutral-50 p-4 rounded-lg border-t border-neutral-100">
                            <p className="text-sm font-semibold text-neutral-900 mb-2">
                              Your Quote
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
  );
}
