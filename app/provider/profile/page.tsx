export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProviderProfileForm from '@/components/providers/ProviderProfileForm';

export const metadata = {
  title: 'Edit Profile - ClearCross Progreso',
  description: 'Update your provider profile information',
};

export default async function ProviderProfilePage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/provider/profile');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'provider' || !userData.provider_id) {
    redirect('/');
  }

  const { data: providerData } = await supabase
    .from('providers')
    .select('*')
    .eq('id', userData.provider_id)
    .single();

  if (!providerData) {
    redirect('/provider');
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Edit Profile</h1>
          <p className="text-neutral-600">
            Update your clinic information. Changes will appear on your public profile once saved.
          </p>
        </div>

        <ProviderProfileForm provider={providerData} />
      </div>
    </div>
  );
}
