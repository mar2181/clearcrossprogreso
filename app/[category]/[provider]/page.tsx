import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageCircle,
  Globe,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  Award,
  ShieldCheck,
  Sparkles,
  Clock,
  Camera,
  TrendingDown,
  MessageSquare,
} from 'lucide-react';
import PriceTable from '@/components/providers/PriceTable';
import ProviderMap from '@/components/providers/ProviderMap';
import ReviewList from '@/components/providers/ReviewList';
import ProviderCard from '@/components/providers/ProviderCard';
import QuoteForm from '@/components/quotes/QuoteForm';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { Card } from '@/components/ui/Card';
import { formatUSD } from '@/lib/utils';
import { getSavings } from '@/lib/us-benchmarks';
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

const CATEGORY_LABELS: Record<string, string> = {
  dentists: 'Dentists',
  pharmacies: 'Pharmacies',
  spas: 'Spas',
  optometrists: 'Eye Care',
  'cosmetic-surgery': 'Cosmetic Surgery',
  doctors: 'Doctors',
  liquor: 'Liquor',
  vets: 'Veterinary',
};

interface ProviderPageProps {
  params: Promise<{ category: string; provider: string }>;
}

function getYearsExperience(graduationYear: number | null | undefined): number | null {
  if (!graduationYear) return null;
  return new Date().getFullYear() - graduationYear;
}

export async function generateMetadata({
  params,
}: ProviderPageProps): Promise<Metadata> {
  const { category, provider } = await params;
  const providerData = await getProviderBySlug(provider);

  if (!providerData) {
    return { title: 'Provider Not Found | ClearCross' };
  }

  return {
    title: `${providerData.name} — ${CATEGORY_LABELS[category] || category} in Nuevo Progreso Mexico | Prices & Reviews | ClearCross`,
    description: `View prices and reviews for ${providerData.name} in Nuevo Progreso, Mexico. Save big vs US prices. Get a free written quote.`,
    openGraph: {
      title: `${providerData.name} | ClearCross Progreso`,
      description: `View prices, reviews, and contact information for ${providerData.name}. Compare prices and save vs US costs.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return getAllProviderSlugs();
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { category, provider } = await params;

  const providerData = await getProviderBySlug(provider);
  if (!providerData) notFound();

  const reviews = await getProviderReviews(providerData.id);
  const relatedProviders = await getRelatedProviders(
    providerData.category_id,
    providerData.id
  );

  const categoryData = (providerData as any).categories || { name: 'Services', slug: category };
  const yearsExp = getYearsExperience((providerData as any).graduation_year);
  const galleryImages = getProviderGallery(providerData.slug, category);
  const hasGallery = galleryImages.length > 0;
  const providerPrices = (providerData as any).provider_prices || [];
  const hasPrices = providerPrices.length > 0;

  // Structured data
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
    <main className="min-h-screen bg-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ── Breadcrumbs ── */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-400">
            <li>
              <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li>
              <Link href={`/${category}`} className="hover:text-brand-blue transition-colors">
                {CATEGORY_LABELS[category] || categoryData.name}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-neutral-dark font-medium truncate max-w-[200px]">
              {providerData.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-page py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Provider info */}
            <div className="flex-1">
              {/* Photo + Name row */}
              <div className="flex items-start gap-5">
                {/* Provider photo or initial */}
                {(providerData as any).photo_url ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-neutral-200 shadow-sm">
                    <Image
                      src={(providerData as any).photo_url}
                      alt={providerData.name}
                      fill
                      className="object-cover object-top"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 border-2 border-brand-blue/20">
                    <span className="font-display text-3xl font-bold text-brand-blue">
                      {providerData.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-2 leading-tight">
                    {providerData.name}
                  </h1>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="default">{categoryData.name}</Badge>
                    {providerData.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-green/10 text-brand-green text-xs font-bold rounded-full border border-brand-green/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {providerData.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber/10 text-amber text-xs font-bold rounded-full border border-amber/20">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {yearsExp && yearsExp > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-navy/5 text-brand-navy text-xs font-bold rounded-full border border-brand-navy/10">
                        <Award className="w-3 h-3" />
                        {yearsExp}+ years experience
                      </span>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-mid">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span>{providerData.address}</span>
                    </div>
                    {providerData.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        <a href={`tel:${providerData.phone}`} className="text-brand-blue hover:underline">
                          {providerData.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Savings callout */}
                  {hasPrices && (() => {
                    const maxSav = providerPrices
                      .map((p: any) => {
                        const slug = p.procedure?.slug || p.procedure_id;
                        return getSavings(slug, p.price_usd);
                      })
                      .filter(Boolean)
                      .sort((a: any, b: any) => b.percentSaved - a.percentSaved)[0];
                    if (!maxSav) return null;
                    return (
                      <div className="mt-3 flex items-center gap-2 p-3 bg-brand-green/5 rounded-lg border border-brand-green/20">
                        <TrendingDown className="w-4 h-4 text-brand-green flex-shrink-0" />
                        <p className="text-sm text-brand-green font-semibold">
                          US charges up to {Math.round((maxSav.percentSaved / (100 - maxSav.percentSaved)) * 100)}% more for this procedure at comparable providers
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Rating */}
              {providerData.avg_rating && (
                <div className="mt-5 flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-center">
                    <p className="font-display text-3xl font-bold text-neutral-dark">
                      {providerData.avg_rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">out of 5</p>
                  </div>
                  <div className="border-l border-neutral-200 pl-4">
                    <StarRating rating={providerData.avg_rating} size="md" />
                    <p className="text-sm text-neutral-mid mt-1">
                      {providerData.review_count} {providerData.review_count === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Action buttons */}
            <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0">
              {providerData.whatsapp && (
                <a
                  href={`https://wa.me/${providerData.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#20BD5A] transition-colors font-semibold text-sm shadow-sm"
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-brand-blue text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-colors font-semibold text-sm"
                >
                  <Globe size={18} />
                  Website
                </a>
              )}
              <a
                href="#quote-form"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl hover:bg-brand-navy transition-colors font-semibold text-sm shadow-sm"
              >
                <MessageSquare size={18} />
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* About Section */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-green" />
                About {providerData.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {yearsExp && yearsExp > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Award className="w-5 h-5 text-brand-navy flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-dark">{yearsExp}+ Years Experience</p>
                      <p className="text-xs text-neutral-mid">Licensed since {(providerData as any).graduation_year}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-dark">Nuevo Progreso</p>
                    <p className="text-xs text-neutral-mid">{providerData.address}</p>
                  </div>
                </div>
                {providerData.verified && (
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-dark">Verified Provider</p>
                      <p className="text-xs text-neutral-mid">Credentials checked by ClearCross</p>
                    </div>
                  </div>
                )}
                {hasPrices && (
                  <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Clock className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-neutral-dark">{providerPrices.length} Services Listed</p>
                      <p className="text-xs text-neutral-mid">Transparent pricing</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Photo Gallery — only if images exist */}
            {hasGallery && (
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-neutral-400" />
                  Photos
                  <span className="text-sm font-normal text-neutral-400 ml-1">
                    ({galleryImages.length})
                  </span>
                </h2>
                <div className="overflow-x-auto pb-2 -mx-2 px-2">
                  <div className="flex gap-3 sm:flex-wrap">
                    {galleryImages.map((src, i) => (
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
            )}

            {/* Prices */}
            {hasPrices && (
              <section className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-dark mb-6">
                  Pricing
                </h2>
                <PriceTable
                  prices={providerPrices}
                  providerName={providerData.name}
                  providerId={providerData.id}
                />
                <div className="mt-4 p-3 bg-brand-green/5 rounded-lg border border-brand-green/20">
                  <p className="text-xs text-brand-green font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    All prices are written quotes — the price listed is the price you pay. No hidden fees.
                  </p>
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber" />
                Patient Reviews
              </h2>
              {reviews && reviews.length > 0 ? (
                <ReviewList reviews={reviews} />
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-neutral-300" />
                  </div>
                  <p className="text-neutral-dark font-semibold mb-1">
                    No reviews yet
                  </p>
                  <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                    Have you visited {providerData.name}? Be the first to share your experience and help other patients make informed decisions.
                  </p>
                </div>
              )}
            </section>

            {/* Location */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-blue" />
                Location
              </h2>
              <ProviderMap
                name={providerData.name}
                address={providerData.address}
                lat={providerData.lat}
                lng={providerData.lng}
                categorySlug={category}
              />
            </section>

            {/* Related Providers */}
            {relatedProviders && relatedProviders.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-neutral-dark mb-6">
                  Other {CATEGORY_LABELS[category] || categoryData.name} in Nuevo Progreso
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                  {relatedProviders.slice(0, 4).map((relProvider: any) => (
                    <ProviderCard
                      key={relProvider.id}
                      provider={{
                        ...relProvider,
                        category: categoryData,
                      }}
                    />
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Link
                    href={`/${category}`}
                    className="inline-flex items-center gap-2 text-sm text-brand-blue font-semibold hover:text-brand-navy transition-colors"
                  >
                    View all {CATEGORY_LABELS[category] || categoryData.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div>
            <QuoteForm
              providerId={providerData.id}
              providerName={providerData.name}
              procedures={hasPrices
                ? Array.from(
                    new Map(
                      (providerPrices as any[]).map((p: any) => [
                        p.procedure?.id,
                        { id: p.procedure?.id, name: p.procedure?.name },
                      ])
                    ).values()
                  )
                : []}
              hasProcedures={hasPrices}
            />
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-neutral-dark text-sm truncate">
              {providerData.name}
            </p>
            {providerData.avg_rating && (
              <div className="flex items-center gap-1 text-xs text-neutral-mid">
                <Star className="w-3 h-3 fill-amber text-amber" />
                {providerData.avg_rating.toFixed(1)}
                <span className="text-neutral-400">
                  ({providerData.review_count})
                </span>
              </div>
            )}
          </div>
          {providerData.whatsapp && (
            <a
              href={`https://wa.me/${providerData.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] text-white rounded-lg font-semibold text-sm shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </a>
          )}
          <a
            href="#quote-form"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-brand-navy transition-colors"
          >
            Get Quote
          </a>
        </div>
      </div>
    </main>
  );
}
