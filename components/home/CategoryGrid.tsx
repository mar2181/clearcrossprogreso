'use client';

import Link from 'next/link';
import Image from 'next/image';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

const categories: Category[] = [
  { id: 'dentists', name: 'Dental Work', slug: 'dentists', image: '/images/categories/dental.jpg' },
  { id: 'pharmacies', name: 'Pharmacies', slug: 'pharmacies', image: '/images/categories/pharmacies.jpg' },
  { id: 'spas', name: 'Spa & Wellness', slug: 'spas', image: '/images/categories/spa.jpg' },
  { id: 'doctors', name: 'Doctors', slug: 'doctors', image: '/images/providers/doctor-consultation-room.jpg' },
  { id: 'optometrists', name: 'Eye Care', slug: 'optometrists', image: '/images/categories/eye-care.jpg' },
  { id: 'cosmetic-surgery', name: 'Cosmetic Surgery', slug: 'cosmetic-surgery', image: '/images/categories/cosmetic-surgery.jpg' },
  { id: 'liquor', name: 'Liquor & Spirits', slug: 'liquor', image: '/images/categories/wellness.jpg' },
  { id: 'vets', name: 'Veterinary', slug: 'vets', image: '/images/categories/veterinary.jpg' },
];

interface CategoryGridProps {
  counts?: Record<string, number>;
}

export default function CategoryGrid({ counts = {} }: CategoryGridProps) {
  return (
    <section id="categories" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <AnimateIn>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-green mb-2">
              Browse by Category
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What are you looking for?
            </h2>
            <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
              Browse our extensive network of verified providers across multiple categories.
            </p>
          </div>
        </AnimateIn>

        {/* Category Grid */}
        <StaggerContainer
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8"
          stagger={0.07}
        >
          {categories.map((category) => {
            const providerCount = counts[category.slug] || 0;
            const isComingSoon = providerCount === 0;

            return (
              <StaggerItem key={category.id}>
                <Link href={isComingSoon ? '#' : `/${category.slug}`}>
                  <div className={`group h-full bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-neutral-200/60 ${isComingSoon ? 'opacity-60 hover:opacity-80' : ''}`}>
                    {/* Category Image */}
                    <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/10 transition-colors duration-300" />
                      {isComingSoon && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="px-3 py-1 bg-white/90 text-neutral-dark text-xs font-semibold rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="p-4 text-center">
                      <h3 className="font-display font-semibold text-gray-900 mb-1 text-sm sm:text-base group-hover:text-brand-blue transition-colors">
                        {category.name}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-gray-500">
                        {providerCount > 0
                          ? `${providerCount} providers`
                          : 'Coming soon'}
                      </p>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
