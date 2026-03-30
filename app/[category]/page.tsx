import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  const categoryData = await getCategoryBySlug(category);

  if (!categoryData) {
    return {
      title: 'Category Not Found | ClearCross',
    };
  }

  const categoryName = categoryData.name;

  return {
    title: `${categoryName} in Nuevo Progreso Mexico — Compare Prices | ClearCross`,
    description: `Find and compare prices for ${categoryName.toLowerCase()} in Nuevo Progreso, Mexico. View verified providers, prices, and patient reviews.`,
    openGraph: {
      title: `${categoryName} in Nuevo Progreso Mexico | ClearCross`,
      description: `Find and compare prices for ${categoryName.toLowerCase()} in Nuevo Progreso, Mexico.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({
    category: slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Fetch category
  const categoryData = await getCategory(category);

  if (!categoryData) {
    notFound();
  }

  // Fetch providers with prices and procedures
  const providersList = await getProvidersForCategory(categoryData.id, categoryData.slug);

  // Fetch all procedures for this category for filter
  const procedures = await getProceduresForCategory(categoryData.id, categoryData.slug);

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-brand-blue/5 to-brand-green/5 border-b border-neutral-200">
        <div className="container-page py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
            {categoryData.name} in Nuevo Progreso
          </h1>
          <p className="text-lg text-neutral-mid max-w-2xl mb-4">
            {categoryData.description}
          </p>
          <p className="text-sm text-neutral-500">
            {providersList.length} verified{' '}
            {providersList.length === 1 ? 'provider' : 'providers'} found
          </p>
        </div>
      </div>

      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Client-side filters and sorting */}
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
            <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50">
              <h2 className="font-semibold text-neutral-dark mb-3">
                About {categoryData.name}
              </h2>
              <p className="text-sm text-neutral-mid leading-relaxed mb-4">
                {categoryData.description}
              </p>
              <a
                href="/safety"
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Is it safe? →
              </a>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-brand-green to-brand-green/80 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Are you a provider?</h3>
              <p className="text-sm mb-4 text-white/90">
                List your business and reach more patients looking for services
                in Nuevo Progreso.
              </p>
              <a
                href="/list-business"
                className="inline-block bg-white text-brand-green font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
              >
                List Your Business
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
