export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveProviderPhotoUrl } from '@/lib/provider-photo';
import ProviderPhotoUpload from '@/components/providers/ProviderPhotoUpload';
import ProviderSubnav from '@/components/providers/ProviderSubnav';
import { getPortalLocale } from '@/lib/i18n/serverLocale';
import { dictFor } from '@/lib/i18n/dict';

export const metadata = {
  title: 'Manage Photos - ClearCross Progreso',
  description: 'Upload real photos of your clinic',
};

export default async function ProviderPhotosPage() {
  const supabase = createServerSupabaseClient();
  const locale = await getPortalLocale();
  const t = dictFor(locale).provider;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/provider/photos');
  }

  const { data: userData } = await supabase
    .from('clearcross_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'provider' || !userData.provider_id) {
    redirect('/');
  }

  const { data: providerData } = await supabase
    .from('clearcross_providers')
    .select('id, gallery_urls, gallery_pending')
    .eq('id', userData.provider_id)
    .single();

  if (!providerData) {
    redirect('/provider');
  }

  const live = ((providerData.gallery_urls as string[] | null) ?? []).map((path) => ({
    path,
    url: resolveProviderPhotoUrl(path),
  }));
  const pending = ((providerData.gallery_pending as string[] | null) ?? []).map((path) => ({
    path,
    url: resolveProviderPhotoUrl(path),
  }));

  return (
    <>
      <ProviderSubnav />
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t.photosHeading}</h1>
            <p className="text-neutral-600">{t.photosSubtitle}</p>
          </div>

          <ProviderPhotoUpload providerId={providerData.id} live={live} pending={pending} locale={locale} />
        </div>
      </div>
    </>
  );
}
