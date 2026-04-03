export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';
import { providers as mockProviders } from '@/lib/mock-data';
import { en } from '@/lib/i18n/dictionaries/en';

export const metadata: Metadata = {
  title: 'Get a Quote | ClearCross Progreso',
  description: 'Get a guaranteed price before you cross the border. Request a quote from our vetted providers in Nuevo Progreso, Mexico.',
};

export default async function QuotePage() {
  const d = en.quote;
  // Sort by featured first, then by name
  const featuredProviders = mockProviders
    .filter((p) => p.verified)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <div className="bg-brand-blue text-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {d.title}
          </h1>
          <p className="text-lg text-blue-100">
            {d.subtitle}
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          {/* How It Works */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              {d.processTitle}
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {d.step1Title}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {d.step1Desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {d.step2Title}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {d.step2Desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {d.step3Title}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {d.step3Desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white text-sm font-medium flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {d.step4Title}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {d.step4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-200 my-8"></div>

          {/* Provider Selection */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Select a Provider to Get a Quote
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Browse our verified providers and click on one to request a personalized price quote.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/${provider.category_id === 'cat-dentists' ? 'dentists' : 'dentists'}/${provider.slug}`}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-brand-blue hover:shadow-md transition-all group"
                >
                  <p className="font-semibold text-neutral-900 group-hover:text-brand-blue">
                    {provider.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{provider.address}</p>
                  {provider.avg_rating && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-amber">
                      <span>★</span>
                      <span>{provider.avg_rating.toFixed(1)}</span>
                      <span className="text-neutral-400">({provider.review_count})</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-neutral-900 mb-2">
            {d.questionsTitle}
          </h3>
          <p className="text-sm text-neutral-700">
            {d.questionsDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
