import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ShieldCheck, ArrowRight, TrendingDown } from 'lucide-react';
import CategoryListingClient from '@/components/category/CategoryListingClient';
import {
  getCategory,
  getCategoryBySlug,
  getProvidersForCategory,
  getProceduresForCategory,
} from '@/lib/data';

const CATEGORY_SLUGS = [
  'dentists',
  'pharmacies',
  'spas',
  'doctors',
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

const CATEGORY_HEROES: Record<string, string> = {
  dentists: '/images/heroes/dentists-hero.jpg',
  pharmacies: '/images/heroes/pharmacies-hero.jpg',
  spas: '/images/heroes/spas-hero.jpg',
  doctors: '/images/heroes/doctors-hero.jpg',
  optometrists: '/images/heroes/optometrists-hero.jpg',
  'cosmetic-surgery': '/images/heroes/cosmetic-surgery-hero.jpg',
};

const CATEGORY_TAGLINES: Record<string, string> = {
  dentists: 'Save 40-70% on dental work with verified providers',
  pharmacies: 'Prescription medications at a fraction of US prices',
  spas: 'Relaxation and wellness treatments at unbeatable prices',
  doctors: 'Affordable consultations and medical care',
  optometrists: 'Eye exams, glasses, and contacts for less',
  'cosmetic-surgery': 'Board-certified surgeons at a fraction of US prices',
  liquor: 'Spirits, wine, and beer from Nuevo Progreso shops',
  vets: 'Affordable veterinary care for your pets',
};

// Fallback images if hero doesn't exist
const CATEGORY_FALLBACKS: Record<string, string> = {
  dentists: '/images/categories/dental.jpg',
  pharmacies: '/images/categories/pharmacies.jpg',
  spas: '/images/categories/spa.jpg',
  doctors: '/images/providers/doctor-consultation-room.jpg',
  optometrists: '/images/categories/eye-care.jpg',
  'cosmetic-surgery': '/images/categories/cosmetic-surgery.jpg',
  liquor: '/images/categories/wellness.jpg',
  vets: '/images/categories/veterinary.jpg',
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategoryBySlug(category);

  if (!categoryData) {
    return { title: 'Category Not Found | ClearCross' };
  }

  return {
    title: `${categoryData.name} in Nuevo Progreso Mexico — Compare Prices | ClearCross`,
    description: `Find and compare prices for ${categoryData.name.toLowerCase()} in Nuevo Progreso, Mexico. View verified providers, prices, and patient reviews.`,
    openGraph: {
      title: `${categoryData.name} in Nuevo Progreso Mexico | ClearCross`,
      description: `Find and compare prices for ${categoryData.name.toLowerCase()} in Nuevo Progreso, Mexico.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ category: slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const categoryData = await getCategory(category);
  if (!categoryData) notFound();

  const providersList = await getProvidersForCategory(categoryData.id, categoryData.slug);
  const procedures = await getProceduresForCategory(categoryData.id, categoryData.slug);

  const heroImage = CATEGORY_HEROES[category] || CATEGORY_FALLBACKS[category];
  const tagline = CATEGORY_TAGLINES[category] || categoryData.description;

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-400">
            <li>
              <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-neutral-dark font-medium">
              {CATEGORY_LABELS[category] || categoryData.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-brand-navy overflow-hidden">
        {/* Background image */}
        {heroImage && (
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt={`${categoryData.name} in Nuevo Progreso`}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/70 to-brand-navy/50" />
          </div>
        )}

        <div className="container-page relative z-10 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 font-display">
              {categoryData.name} in Nuevo Progreso
            </h1>
            <p className="text-lg text-blue-100/80 mb-5 leading-relaxed">
              {tagline}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-white/90">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>
                  <strong>{providersList.length}</strong> verified providers
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <TrendingDown className="w-4 h-4 text-amber" />
                <span>Save <strong>40-70%</strong> vs US prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <CategoryListingClient
              providers={providersList}
              procedures={procedures}
              categoryName={categoryData.name}
              categorySlug={categoryData.slug}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Info Card */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-display font-semibold text-neutral-dark mb-3">
                About {categoryData.name}
              </h2>
              <p className="text-sm text-neutral-mid leading-relaxed mb-4">
                {categoryData.description}
              </p>
              <div className="space-y-2">
                <Link
                  href="/safety"
                  className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Is it safe?
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy transition-colors"
                >
                  How does it work?
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-brand-blue to-brand-navy rounded-xl p-6 text-white shadow-sm">
              <h3 className="font-display font-semibold mb-2">Need a specific price?</h3>
              <p className="text-sm mb-4 text-blue-200/80">
                Request a personalized quote from any provider. Free, no commitment.
              </p>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-light transition-colors text-sm"
              >
                Get a Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Provider CTA */}
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-6">
              <h3 className="font-display font-semibold text-neutral-dark mb-2">Are you a provider?</h3>
              <p className="text-sm text-neutral-mid mb-4">
                List your business and reach thousands of Americans looking for services in Nuevo Progreso.
              </p>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green/80 transition-colors"
              >
                List Your Business
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
