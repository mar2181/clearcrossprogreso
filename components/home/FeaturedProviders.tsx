import Link from 'next/link';
import { Star } from 'lucide-react';

interface FeaturedProvider {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  featuredPrice: string;
  featuredService: string;
  slug: string;
}

const featuredProviders: FeaturedProvider[] = [
  {
    id: 'prov-progreso-smile',
    name: 'Progreso Smile Dental Center',
    category: 'Dental Work',
    categorySlug: 'dentists',
    rating: 4.8,
    reviewCount: 187,
    featuredPrice: '$30',
    featuredService: 'Dental Cleaning',
    slug: 'progreso-smile-dental-center',
  },
  {
    id: 'prov-texas-dental',
    name: 'Texas Dental Clinic',
    category: 'Dental Work',
    categorySlug: 'dentists',
    rating: 4.7,
    reviewCount: 156,
    featuredPrice: '$1,000',
    featuredService: 'Dental Implant',
    slug: 'texas-dental-clinic',
  },
  {
    id: 'prov-dental-artistry',
    name: 'Dental Artistry',
    category: 'Dental Work',
    categorySlug: 'dentists',
    rating: 4.6,
    reviewCount: 98,
    featuredPrice: '$25',
    featuredService: 'Dental Cleaning',
    slug: 'dental-artistry',
  },
  {
    id: 'prov-panchos',
    name: "Pancho's Pharmacy / El Disco",
    category: 'Pharmacy',
    categorySlug: 'pharmacies',
    rating: 4.5,
    reviewCount: 134,
    featuredPrice: '$250',
    featuredService: 'Ozempic 0.50 mg',
    slug: 'panchos-pharmacy',
  },
  {
    id: 'prov-jessicas',
    name: "Jessica's Med Center",
    category: 'Pharmacy',
    categorySlug: 'pharmacies',
    rating: 4.4,
    reviewCount: 67,
    featuredPrice: '$5',
    featuredService: 'Insulin FlexPen',
    slug: 'jessicas-med-center',
  },
  {
    id: 'prov-shammah',
    name: 'Shammah Pharmacy',
    category: 'Pharmacy',
    categorySlug: 'pharmacies',
    rating: 4.2,
    reviewCount: 32,
    featuredPrice: '$2.95',
    featuredService: 'Z-Pak / Azithromycin',
    slug: 'shammah-pharmacy',
  },
];

export default function FeaturedProviders() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Featured Providers
          </h2>
          <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
            Highly-rated clinics and pharmacies in Nuevo Progreso with verified, transparent pricing.
          </p>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProviders.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-brand-blue bg-opacity-10 text-brand-blue font-sans text-xs font-semibold rounded-full">
                  {provider.category}
                </span>
              </div>

              {/* Provider Name */}
              <h3 className="font-display font-bold text-lg sm:text-xl text-gray-900 mb-3">
                {provider.name}
              </h3>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(provider.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-sans text-sm text-gray-600">
                  {provider.rating} ({provider.reviewCount} reviews)
                </span>
              </div>

              {/* Featured Price */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-sans text-xs text-gray-500 mb-1">
                  {provider.featuredService}
                </p>
                <p className="font-display font-bold text-2xl text-brand-green">
                  {provider.featuredPrice}
                </p>
              </div>

              {/* View Profile Button */}
              <Link href={`/${provider.categorySlug}/${provider.slug}`}>
                <button className="w-full py-3 px-4 bg-brand-blue text-white font-sans font-semibold rounded-lg hover:bg-brand-navy transition-colors">
                  View Profile
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
