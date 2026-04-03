'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Sparkles, Award, ArrowRight } from 'lucide-react';
import { formatUSD } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

// Category images for fallback thumbnails
const CATEGORY_IMAGES: Record<string, string> = {
  dentists: '/images/categories/dental.jpg',
  pharmacies: '/images/categories/pharmacies.jpg',
  spas: '/images/categories/spa.jpg',
  'cosmetic-surgery': '/images/categories/cosmetic-surgery.jpg',
  optometrists: '/images/categories/eye-care.jpg',
  doctors: '/images/providers/doctor-consultation-room.jpg',
};

interface FeaturedProviderData {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  featured: boolean;
  verified: boolean;
  avg_rating: number | null;
  review_count: number;
  photo_url: string | null;
  graduation_year: number | null;
  provider_prices: {
    price_usd: number | null;
    price_notes: string | null;
    procedure?: { id: string; name: string };
  }[];
  category?: {
    name: string;
    slug: string;
  };
}

function getYearsExperience(graduationYear: number | null): number | null {
  if (!graduationYear) return null;
  return new Date().getFullYear() - graduationYear;
}

export default function FeaturedProviders({ providers }: { providers: FeaturedProviderData[] }) {
  const { dict } = useI18n();
  const d = dict.featuredProviders;

  if (!providers || providers.length === 0) return null;

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {d.headline}
          </h2>
          <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
            {d.subtitle}
          </p>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => {
            const catSlug = provider.category?.slug || 'dentists';
            const catName = provider.category?.name || 'Medical';
            const catImage = CATEGORY_IMAGES[catSlug];
            const cardImage = provider.photo_url || catImage;
            const yearsExp = getYearsExperience(provider.graduation_year);

            // Get the lowest price to display
            const pricesWithValues = (provider.provider_prices || []).filter(p => p.price_usd);
            const lowestPrice = pricesWithValues.length > 0
              ? pricesWithValues.reduce((min, p) => (p.price_usd! < min.price_usd! ? p : min))
              : null;

            return (
              <Link
                key={provider.id}
                href={`/${catSlug}/${provider.slug}`}
                className="group flex flex-col bg-white border border-neutral-200 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Card Image */}
                {cardImage && (
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={cardImage}
                      alt={provider.name}
                      fill
                      className={`object-cover group-hover:scale-105 transition-transform duration-300 ${provider.photo_url ? 'object-top' : ''}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Featured badge overlay */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                        <Sparkles className="w-3 h-3" />
                        {d.featured}
                      </span>
                    </div>

                    {/* Price overlay */}
                    {lowestPrice && lowestPrice.price_usd && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                          <p className="text-[10px] font-medium text-neutral-mid leading-tight">{d.from}</p>
                          <p className="text-lg font-bold text-brand-green leading-tight">
                            {formatUSD(lowestPrice.price_usd)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="flex-1 p-5">
                  {/* Category + Experience badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue font-sans text-xs font-semibold rounded-full">
                      {catName}
                    </span>
                    {provider.verified && (
                      <span
                        className="inline-block px-2.5 py-0.5 bg-brand-green/10 text-brand-green text-xs font-semibold rounded-full border border-brand-green/20 cursor-help"
                        title="Cedula Profesional verified. Credentials current as of 2026. Clinic conditions and sterilization protocols checked."
                      >
                        {d.verified}
                      </span>
                    )}
                    {yearsExp && yearsExp > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-navy/5 text-brand-navy text-xs font-semibold rounded-full border border-brand-navy/10">
                        <Award className="w-3 h-3" />
                        {yearsExp}+ yrs
                      </span>
                    )}
                  </div>

                  {/* Provider Name */}
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                    {provider.name}
                  </h3>

                  {/* Rating & Reviews */}
                  {provider.avg_rating ? (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Math.round(provider.avg_rating!)
                                ? 'fill-amber text-amber'
                                : 'text-neutral-200 fill-neutral-200'
                            }
                          />
                        ))}
                      </div>
                      <span className="font-sans text-sm font-semibold text-neutral-dark">
                        {provider.avg_rating.toFixed(1)}
                      </span>
                      <span className="font-sans text-xs text-neutral-400">
                        ({provider.review_count})
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 mb-3">{d.noReviews}</p>
                  )}

                  {/* Top procedure pills */}
                  {pricesWithValues.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {pricesWithValues.slice(0, 2).map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs bg-neutral-50 text-neutral-600 px-2.5 py-1 rounded-lg border border-neutral-200"
                        >
                          <span className="truncate max-w-[120px]">{p.procedure?.name || 'Service'}</span>
                          <span className="font-bold text-brand-green">
                            {formatUSD(p.price_usd!)}
                          </span>
                        </span>
                      ))}
                      {pricesWithValues.length > 2 && (
                        <span className="text-xs text-neutral-400 px-2 py-1">
                          +{pricesWithValues.length - 2} {d.more}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA footer */}
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white font-sans font-semibold rounded-lg group-hover:bg-brand-navy transition-colors text-sm">
                    {d.viewProfile}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
