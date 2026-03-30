export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatUSD } from '@/lib/utils';
import { QuoteRequestWithDetails } from '@/lib/types';
import { ArrowRight, FileText } from 'lucide-react';

export const metadata = {
  title: 'Dashboard - ClearCross Progreso',
  description: 'Manage your quote requests',
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard');
  }

  // Fetch user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'patient') {
    redirect('/');
  }

  // Fetch quote requests with joins
  const { data: quoteRequests } = await supabase
    .from('quote_requests')
    .select(
      `
      *,
      provider:providers(*),
      procedure:procedures(*),
      user:users(*)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const quotes = (quoteRequests || []) as QuoteRequestWithDetails[];

  // Calculate stats
  const stats = {
    total: quotes.length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    completed: quotes.filter((q) => q.status === 'completed').length,
  };

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
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Welcome back, {userData.full_name || 'Patient'}!
          </h1>
          <p className="text-neutral-600">Manage your quote requests and track your visits</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-blue">{stats.total}</p>
                <p className="text-neutral-600 text-sm mt-2">Total Quotes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-green">{stats.accepted}</p>
                <p className="text-neutral-600 text-sm mt-2">Accepted Quotes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-navy">{stats.completed}</p>
                <p className="text-neutral-600 text-sm mt-2">Completed Visits</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Requests */}
        <Card>
          <CardHeader className="border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">Your Quote Requests</h2>
          </CardHeader>

          <CardContent className="pt-6">
            {quotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 mb-6">
                  No quote requests yet. Start by finding a provider.
                </p>
                <Link href="/dentistry">
                  <Button variant="primary">Find Providers</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Provider
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Procedure
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Submitted
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-neutral-900 text-sm">
                          Price
                        </th>
                        <th className="text-right py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote) => (
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
                  {quotes.map((quote) => (
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
