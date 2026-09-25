export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveProviderPhotoUrl } from '@/lib/provider-photo';
import { Card, CardContent } from '@/components/ui/Card';
import PhotoReviewActions from '@/components/admin/PhotoReviewActions';
import AdminSubnav from '@/components/admin/AdminSubnav';
import { getPortalLocale } from '@/lib/i18n/serverLocale';
import { dictFor } from '@/lib/i18n/dict';
import BrokenImgFallback from '@/components/ui/BrokenImgFallback';

type PendingProvider = {
  id: string;
  name: string;
  slug: string;
  gallery_pending: string[] | null;
};

export default async function AdminPhotosPage() {
  const locale = await getPortalLocale();
  const t = dictFor(locale).admin;
  const supabase = createServerSupabaseClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/auth/login?redirectTo=/admin/photos');
  }

  const { data: userData } = await supabase
    .from('clearcross_users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (!userData || userData.role !== 'admin') {
    redirect('/');
  }

  // Cross-provider read needs the service-role client — RLS has no
  // admin-read-all policy (see 001_clearcross_schema.sql).
  const admin = createAdminClient();
  const reader = admin ?? supabase;

  const { data, error } = await reader
    .from('clearcross_providers')
    .select('id, name, slug, gallery_pending')
    .order('name');

  const providers = ((data as PendingProvider[] | null) ?? []).filter(
    (p) => (p.gallery_pending ?? []).length > 0
  );
  const totalPending = providers.reduce((n, p) => n + (p.gallery_pending?.length ?? 0), 0);

  return (
    <>
      <AdminSubnav />
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">{t.photosHeading}</h1>
          <p className="text-neutral-600 text-sm mt-1">
            {error
              ? t.photosErrorRead
              : (totalPending === 1 ? t.photosSummaryOne : t.photosSummaryMany)
                  .replace('{n}', String(totalPending))
                  .replace('{providers}', String(providers.length))}
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-error">
            <CardContent className="py-4 text-error text-sm">
              {(error as any).message ?? String(error)}
            </CardContent>
          </Card>
        )}

        {!error && providers.length === 0 && (
          <p className="text-sm text-neutral-500">{t.photosNothingWaiting}</p>
        )}

        <div className="space-y-6">
          {providers.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-4">
                <p className="font-semibold text-neutral-900 mb-3">{p.name}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(p.gallery_pending ?? []).map((path) => (
                    <div key={path} className="space-y-2">
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                        <BrokenImgFallback
                          src={resolveProviderPhotoUrl(path)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <PhotoReviewActions providerId={p.id} path={path} locale={locale} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
