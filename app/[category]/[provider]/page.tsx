import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Globe, MapPin, Phone, Star } from 'lucide-react';
import PriceTable from '@/components/providers/PriceTable';
import ReviewList from '@/components/providers/ReviewList';
import ProviderCard from '@/components/providers/ProviderCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import { Card, CardContent } from '@/components/ui/Card';
import { formatUSD } from '@/lib/utils';
import { getProviderGallery } from '@/lib/provider-gallery';
import {
  getProviderBySlug,
  getProviderReviews,
  getRelatedProviders,
  getAllProviderSlugs,
} from '@/lib/data';

const CATEGORY_SLUGS = [
  'dentists',
  'pharmacies',
  'spas',
  'optometrists',
  'cosmetic-surgery',
  'liquor',
  'vets',
];

interface ProviderPageProps {
  params: Promise<{ category: string; provider: string }>;
}

export async function generateMetadata({
  params,
}: ProviderPageProps): Promise<Metadata> {
  const { category, provider } = await params;

  const providerData = await getProviderBySlug(provider);

  if (!providerData) {
    return {
      title: 'Provider Not Found | ClearCross',
    };
  }

  return {
    title: `${providerData.name} — ${CATEGORY_SLUGS.includes(category) ? category : 'Medical'} in Nuevo Progreso Mexico | Prices & Reviews | ClearCross`,
    description: `View prices, reviews, and details for ${providerData.name} in Nuevo Progreso, Mexico. Get a quote for medical services.`,
    openGraph: {
      title: `${providerData.name} | ClearCross Progreso`,
      description: `View prices, reviews, and contact information for ${providerData.name}`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return getAllProviderSlugs();
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { category, provider } = await params;

  // Fetch provider with prices and procedures
  const providerData = await getProviderBySlug(provider);

  if (!providerData) {
    notFound();
  }

  // Fetch reviews
  const reviews = await getProviderReviews(providerData.id);

  // Fetch related providers (same category)
  const relatedProviders = await getRelatedProviders(
    providerData.category_id,
    providerData.id
  );

  const categoryData = (providerData as any).categories || { name: 'Services', slug: category };

  // Format structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: providerData.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: providerData.address,
      addressLocality: 'Nuevo Progreso',
      addressRegion: 'Tamaulipas',
      addressCountry: 'MX',
    },
    telephone: providerData.phone || undefined,
    url: providerData.website || undefined,
    ...(providerData.avg_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: providerData.avg_rating.toFixed(1),
        reviewCount: providerData.review_count,
      },
    }),
  };

  return (
    <main className="min-h-screen bg-white">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-brand-blue/5 to-brand-green/5 border-b border-neutral-200">
        <div className="container-page py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-2">
                {providerData.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 flex-wrap">
                <Badge variant="default">{categoryData.name}</Badge>
                {providerData.verified && (
                  <Badge variant="verified">✓ Verified</Badge>
                )}
                {providerData.featured && (
                  <Badge variant="featured">★ Featured</Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-neutral-mid">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{providerData.address}</span>
                </div>
                {providerData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <a
                      href={`tel:${providerData.phone}`}
                      className="text-brand-blue hover:underline"
                    >
                      {providerData.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {providerData.whatsapp && (
                <a
                  href={`https://wa.me/${providerData.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              )}
              {providerData.website && (
                <a
                  href={providerData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-brand-blue text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-colors font-medium text-sm"
                >
                  <Globe size={18} />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Rating Summary */}
          {providerData.avg_rating && (
            <div className="mt-4 flex items-center gap-3">
              <StarRating rating={providerData.avg_rating} size="md" />
              <span className="text-sm text-neutral-mid">
                {providerData.avg_rating.toFixed(1)} ({providerData.review_count}{' '}
                {providerData.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Photo Gallery */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-dark mb-4">
                Gallery
              </h2>
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-3 sm:flex-wrap">
                  {getProviderGallery(providerData.slug, category).map((src, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden relative group"
                    >
                      <Image
                        src={src}
                        alt={`${providerData.name} photo ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 160px, 192px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Prices */}
            {(providerData as any).provider_prices &&
              (providerData as any).provider_prices.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-neutral-dark mb-6">
                    Pricing
                  </h2>
                  <PriceTable
                    prices={(providerData as any).provider_prices}
                    providerName={providerData.name}
                    providerId={providerData.id}
                  />
                </section>
              )}

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-dark mb-6">
                Patient Reviews
              </h2>
              <ReviewList reviews={reviews || []} />
            </section>

            {/* Map */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-dark mb-4">
                Location
              </h2>
              <div
                className="w-full h-96 bg-neutral-100 border border-neutral-300 rounded-lg flex items-center justify-center"
                data-lat={providerData.lat}
                data-lng={providerData.lng}
              >
                <span className="text-neutral-500">Map loading...</span>
              </div>
            </section>

            {/* Related Providers */}
            {relatedProviders && relatedProviders.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-neutral-dark mb-6">
                  Related {categoryData.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedProviders.map((relProvider: any) => (
                    <ProviderCard
                      key={relProvider.id}
                      provider={{
                        ...relProvider,
                        category: categoryData,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Quote CTA */}
            <Card className="sticky top-6 overflow-hidden">
              <div className="bg-gradient-to-br from-brand-blue to-brand-blue/80 text-white p-6">
                <h3 className="text-xl font-bold mb-4">Get a Quote</h3>

                <form
                  action={`/quote?provider=${providerData.id}`}
                  method="GET"
                  className="space-y-4"
                >
                  {/* Procedure Select */}
                  {(providerData as any).provider_prices &&
                    (providerData as any).provider_prices.length > 0 && (
                      <div>
                        <label
                          htmlFor="procedure"
                          className="block text-sm font-medium mb-2"
                        >
                          Procedure
                        </label>
                        <select
                          id="procedure"
                          name="procedure"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                        >
                          <option value="">Select a procedure</option>
                          {Array.from(
                            new Map(
                              ((providerData as any).provider_prices as any[]).map((p: any) => [
                                p.procedure?.id,
                                p.procedure?.name,
                              ])
                            ).entries()
                          ).map(([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium mb-2"
                    >
                      Additional Details
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Tell us more about what you need..."
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm resize-none"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium mb-2">
                      Upload Photo (Optional)
                    </label>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      className="w-full text-xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-white text-brand-blue font-bold rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Request Quote
                  </button>
                </form>

                <p className="text-xs text-white/70 mt-4 text-center">
                  Free quotes, no commitment
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
