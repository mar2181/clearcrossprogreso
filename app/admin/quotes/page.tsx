export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MarkHandledForm from '@/components/admin/MarkHandledForm';
import AdminSubnav from '@/components/admin/AdminSubnav';
import { getPortalLocale } from '@/lib/i18n/serverLocale';
import { dictFor } from '@/lib/i18n/dict';
import type { Locale } from '@/lib/i18n/context';

// The system of record for every quote request across the whole directory,
// regardless of whether the clinic it went to has an account yet. Today
// (2026-09-24) zero providers have an account, so this is the ONLY place a
// lead can be seen and closed out without reading the database by hand —
// see STATE.md's "THE LEAD PATH WORKS" incident and the ClearCross plan.
type AdminQuote = {
  id: string;
  status: string;
  description: string | null;
  responded_at: string | null;
  provider_notes: string | null;
  created_at: string;
  user: { full_name: string | null; email: string | null; phone: string | null } | null;
  procedure: { name: string | null } | null;
  provider: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    slug: string;
  } | null;
};

function ageLabel(createdAt: string, t: ReturnType<typeof dictFor>['admin']): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const hours = ms / 36e5;
  if (hours < 1) return t.quotesAgeMinutes.replace('{n}', String(Math.max(1, Math.round(ms / 6e4))));
  if (hours < 48) return t.quotesAgeHours.replace('{n}', String(Math.round(hours)));
  return t.quotesAgeDays.replace('{n}', String(Math.round(hours / 24)));
}

function fmt(dateString: string, locale: Locale): string {
  return new Date(dateString).toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function AdminQuotesPage() {
  const locale = await getPortalLocale();
  const t = dictFor(locale).admin;
  const supabase = createServerSupabaseClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/auth/login?redirectTo=/admin/quotes');
  }

  // Role check runs against the SESSION-scoped client, which RLS restricts
  // to the caller's own row (id = auth.uid()) — a non-admin cannot read a
  // different user's role='admin' row to spoof this.
  const { data: userData } = await supabase
    .from('clearcross_users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (!userData || userData.role !== 'admin') {
    redirect('/');
  }

  // Cross-provider read needs the service-role client — RLS has no
  // admin-read-all policy on purpose (see 001_clearcross_schema.sql), so an
  // admin's own session client would only ever see their own row.
  const admin = createAdminClient();
  const reader = admin ?? supabase;

  const { data, error } = await reader
    .from('clearcross_quote_requests')
    .select(
      `
      id, status, description, responded_at, provider_notes, created_at,
      user:clearcross_users(full_name, email, phone),
      procedure:clearcross_procedures(name),
      provider:clearcross_providers(id, name, phone, whatsapp, slug)
    `
    )
    .order('created_at', { ascending: true });

  const quotes = ((data as unknown as AdminQuote[] | null) ?? []).slice();
  const unanswered = quotes.filter((q) => !q.responded_at);
  const answered = quotes.filter((q) => q.responded_at).reverse();

  return (
    <>
      <AdminSubnav />
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            {t.quotesHeading}
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            {error
              ? t.quotesErrorRead
              : t.quotesSummary
                  .replace('{waiting}', String(unanswered.length))
                  .replace('{handled}', String(answered.length))}
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-error">
            <CardContent className="py-4 text-error text-sm">
              {(error as any).message ?? String(error)}
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-semibold text-neutral-900 mb-3">
          {t.quotesWaitingHeading.replace('{n}', String(unanswered.length))}
        </h2>
        <div className="space-y-3 mb-10">
          {unanswered.length === 0 && !error && (
            <p className="text-sm text-neutral-500">{t.quotesNothingWaiting}</p>
          )}
          {unanswered.map((q) => (
            <Card key={q.id} className="border-amber-300">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[240px] break-words">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={`status-${q.status}` as any}>{q.status}</Badge>
                      <span className="text-xs text-neutral-500">
                        {ageLabel(q.created_at, t)} · {fmt(q.created_at, locale)}
                      </span>
                    </div>
                    <p className="font-medium text-neutral-900">
                      {q.user?.full_name || t.quotesUnknownPatient}{' '}
                      <span className="font-normal text-neutral-500 text-sm">
                        {q.user?.email} {q.user?.phone ? `· ${q.user.phone}` : ''}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-700 mt-1">
                      <span className="font-medium">
                        {q.provider?.name || t.quotesUnknownProvider}
                      </span>
                      {q.provider?.phone ? ` — ${q.provider.phone}` : ''}
                      {q.procedure?.name ? ` · ${q.procedure.name}` : ''}
                    </p>
                    {q.description && (
                      <p className="text-sm text-neutral-600 mt-2 whitespace-pre-wrap">
                        {q.description}
                      </p>
                    )}
                    {q.provider?.slug && (
                      <Link
                        href={`/dentists/${q.provider.slug}`}
                        className="text-xs text-brand-blue hover:underline mt-1 inline-block"
                      >
                        {t.quotesViewListing} →
                      </Link>
                    )}
                  </div>
                  <div className="shrink-0">
                    <MarkHandledForm quoteId={q.id} locale={locale} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-neutral-900 mb-3">
          {t.quotesHandledHeading.replace('{n}', String(answered.length))}
        </h2>
        <div className="space-y-3">
          {answered.map((q) => (
            <Card key={q.id}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={`status-${q.status}` as any}>{q.status}</Badge>
                  <span className="text-xs text-neutral-500">
                    {t.quotesClosed.replace('{when}', fmt(q.responded_at as string, locale))}
                  </span>
                </div>
                <p className="text-sm text-neutral-800">
                  {q.user?.full_name || t.quotesUnknownPatient} → {q.provider?.name || t.quotesUnknownProvider}
                </p>
                {q.provider_notes && (
                  <p className="text-xs text-neutral-500 mt-1 whitespace-pre-wrap">
                    {q.provider_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
