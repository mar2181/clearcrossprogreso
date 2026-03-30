import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Provider, Procedure } from '@/lib/types';
import { QuoteForm } from '@/components/quotes/QuoteForm';

export const metadata: Metadata = {
  title: 'Get a Quote | ClearCross Progreso',
  description: 'Get a guaranteed price before you cross the border. Request a quote from our vetted providers in Nuevo Progreso, Mexico.',
};

async function getProvidersAndProcedures(preselectedProviderId?: string) {
  const supabase = createServerSupabaseClient();

  // Fetch all providers
  const { data: providersData, error: providersError } = await supabase
    .from('providers')
    .select('*')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('name', { ascending: true });

  if (providersError) {
    console.error('Error fetching providers:', providersError);
    throw new Error('Failed to load providers');
  }

  // Fetch all procedures
  const { data: proceduresData, error: proceduresError } = await supabase
    .from('procedures')
    .select('*')
    .order('sort_order', { ascending: true });

  if (proceduresError) {
    console.error('Error fetching procedures:', proceduresError);
    throw new Error('Failed to load procedures');
  }

  return {
    providers: (providersData || []) as Provider[],
    procedures: (proceduresData || []) as Procedure[],
    preselectedProviderId,
  };
}

interface QuotePageProps {
  searchParams: { provider?: string };
}

export default async function QuotePage({
  searchParams,
}: QuotePageProps) {
  const { providers, procedures, preselectedProviderId } =
    await getProvidersAndProcedures(searchParams.provider);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <div className="bg-brand-blue text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Get a Price Quote
          </h1>
          <p className="text-lg text-blue-100">
            Know the price before you cross the border. Submit your details and our providers will send you a guaranteed quote.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          {/* How It Works */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              The Quote Process
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    Submit Your Details
                  </p>
                  <p className="text-sm text-neutral-600">
                    Tell us about your procedure and upload a photo if needed
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    Provider Responds
                  </p>
                  <p className="text-sm text-neutral-600">
                    We'll send your request to the provider. You'll receive a guaranteed price quote
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    Accept or Decline
                  </p>
                  <p className="text-sm text-neutral-600">
                    Review the quote and decide. Accepted quotes lock in the price
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    Visit & Review
                  </p>
                  <p className="text-sm text-neutral-600">
                    Complete your procedure and leave a review to help others
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-200 my-8"></div>

          {/* Form */}
          <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <QuoteForm
              providers={providers}
              procedures={procedures}
              preselectedProviderId={preselectedProviderId}
            />
          </Suspense>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-neutral-900 mb-2">
            Questions?
          </h3>
          <p className="text-sm text-neutral-700">
            Our quotes are guaranteed and binding once accepted. We recommend uploading a clear photo of your concern to help providers give you the most accurate quote possible.
          </p>
        </div>
      </div>
    </div>
  );
}
