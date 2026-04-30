export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { QuoteRequestWithDetails } from '@/lib/types';
import QuoteList from '@/components/dashboard/QuoteList';

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
            <QuoteList quotes={quotes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
