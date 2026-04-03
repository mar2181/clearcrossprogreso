import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ShieldCheck, ArrowRight, TrendingDown, DollarSign } from 'lucide-react';
import CategoryListingClient from '@/components/category/CategoryListingClient';
import SavingsBanner from '@/components/category/SavingsBanner';
import CategoryMap from '@/components/category/CategoryMap';
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
  dentists: 'US charges up to 2,400% more for dental work — implants, crowns, veneers, braces',
  pharmacies: 'US charges up to 9,900% more for prescriptions — Ozempic, insulin, antibiotics, Eliquis',
  spas: 'US charges up to 900% more for facials, massages, body sculpting, and beauty treatments',
  doctors: 'US charges up to 900% more for doctor visits, blood work, and checkups',
  optometrists: 'US charges up to 900% more for eye exams, prescription glasses, and contact lenses',
  'cosmetic-surgery': 'US charges up to 9,900% more for Botox, fillers, liposuction, and cosmetic procedures',
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
    title: `${categoryData.name} in Nuevo Progreso Mexico — Compare Prices & Save | ClearCross`,
    description: `Find verified ${categoryData.name.toLowerCase()} in Nuevo Progreso, Mexico. Compare prices, read reviews, and save big vs US costs. Get written quotes before you cross.`,
    openGraph: {
      title: `${categoryData.name} in Nuevo Progreso Mexico | ClearCross`,
      description: `Compare prices and save on ${categoryData.name.toLowerCase()} in Nuevo Progreso, Mexico.`,
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

      {/* Hero Banner — tall, immersive, minimal overlay */}
      <div className="relative bg-brand-navy overflow-hidden lg:mx-6 lg:mt-4 lg:rounded-2xl">
        {/* Full-bleed background image */}
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
            {/* Light bottom gradient only — lets the image breathe */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
          </div>
        )}

        {/* Taller hero: min-h so image is prominent on desktop */}
        <div className="container-page relative z-10 flex items-end py-16 sm:py-20 lg:py-0 lg:min-h-[420px] lg:items-end lg:pb-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 font-display drop-shadow-lg">
              {categoryData.name} in Nuevo Progreso
            </h1>
            <p className="text-lg text-white/90 mb-5 leading-relaxed drop-shadow-md">
              {tagline}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>
                  <strong>{providersList.length}</strong> verified providers
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <TrendingDown className="w-4 h-4 text-amber" />
                <span>Save <strong>$100s–$1000s</strong> vs US prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-10 sm:py-14">
        {/* Savings Comparison Banner */}
        {['dentists', 'cosmetic-surgery', 'optometrists', 'doctors', 'pharmacies', 'spas'].includes(category) && (
          <div className="mb-10">
            <SavingsBanner
              providers={providersList}
              categoryName={categoryData.name}
              categorySlug={category}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Map toggle */}
            <CategoryMap
              providers={providersList}
              categoryName={categoryData.name}
              categorySlug={category}
            />

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
