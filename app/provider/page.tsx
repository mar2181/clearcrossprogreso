export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { BarChart3, Eye, FileText, TrendingUp, Zap } from 'lucide-react';

export const metadata = {
  title: 'Provider Dashboard - ClearCross Progreso',
  description: 'Manage your provider profile and quotes',
};

export default async function ProviderDashboardPage() {
  const supabase = createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/provider');
  }

  // Fetch user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'provider' || !userData.provider_id) {
    redirect('/');
  }

  // Fetch provider data
  const { data: providerData } = await supabase
    .from('providers')
    .select('*')
    .eq('id', userData.provider_id)
    .single();

  // Fetch ALL quote requests for accurate stats (not just 10)
  const { data: allQuoteRequests, count: totalQuoteCount } = await supabase
    .from('quote_requests')
    .select('id, status', { count: 'exact' })
    .eq('provider_id', userData.provider_id);

  // Fetch recent 10 for the list display
  const { data: quoteRequests } = await supabase
    .from('quote_requests')
    .select(
      `
      *,
      user:users(*),
      procedure:procedures(*)
    `
    )
    .eq('provider_id', userData.provider_id)
    .order('created_at', { ascending: false })
    .limit(10);

  const quotes = quoteRequests || [];
  const allQuotes = allQuoteRequests || [];

  // Calculate stats from ALL quotes, not just the 10 displayed
  const totalRequests = totalQuoteCount ?? allQuotes.length;
  const acceptedQuotes = allQuotes.filter((q) => q.status === 'accepted').length;

  const stats = {
    totalRequests,
    acceptedQuotes,
    completedVisits: allQuotes.filter((q) => q.status === 'completed').length,
    conversionRate:
      totalRequests > 0
        ? Math.round((acceptedQuotes / totalRequests) * 100)
        : 0,
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
            Welcome back, {providerData?.name || 'Provider'}
          </h1>
          <p className="text-neutral-600">Manage your quotes and pricing</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Quote Requests</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {stats.totalRequests}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-brand-blue opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Accepted Quotes</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {stats.acceptedQuotes}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-brand-green opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Completed Visits</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {stats.completedVisits}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-brand-navy opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {stats.conversionRate}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-amber opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Quote Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-neutral-100">
                <h2 className="text-xl font-bold text-neutral-900">Recent Quote Requests</h2>
              </CardHeader>

              <CardContent className="pt-6">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-600">No quote requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {quote.user?.full_name || 'Anonymous'}
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
                          {quote.status === 'pending' && (
                            <Link href="/provider/quotes">
                              <Button variant="outline" size="sm">
                                Respond
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="border-b border-neutral-100">
                <h3 className="font-bold text-neutral-900">Quick Actions</h3>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Link href="/provider/flash-discount">
                  <Button variant="primary" size="lg" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-none">
                    <Zap className="w-4 h-4 mr-2 fill-current" />
                    Flash Discount
                  </Button>
                </Link>
                <Link href="/provider/prices">
                  <Button variant="primary" size="lg" className="w-full">
                    Manage Prices
                  </Button>
                </Link>
                <Link href="/provider/profile">
                  <Button variant="outline" size="lg" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/provider/quotes">
                  <Button variant="outline" size="lg" className="w-full">
                    View All Quotes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm space-y-3">
                  <div>
                    <p className="text-neutral-600 text-xs">Business</p>
                    <p className="font-semibold text-neutral-900">{providerData?.name}</p>
                  </div>
                  {providerData?.phone && (
                    <div>
                      <p className="text-neutral-600 text-xs">Phone</p>
                      <p className="font-semibold text-neutral-900">{providerData.phone}</p>
                    </div>
                  )}
                  {providerData?.whatsapp && (
                    <div>
                      <p className="text-neutral-600 text-xs">WhatsApp</p>
                      <p className="font-semibold text-neutral-900">{providerData.whatsapp}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
