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
  getAllCategories,
  getProvidersForCategory,
  getProceduresForCategory,
  getActiveFlashDiscounts,
  getPricedProcedures,
  getCategoryCounts,
} from '@/lib/data';
import { bilingualAlternates } from '@/lib/hreflang';
import { en, es, type Locale } from '@/lib/i18n';
import { localizedPath } from '@/lib/i18n/get-locale';
import { categoryLabel } from '@/lib/i18n/category-label';
import { procedureLabel } from '@/lib/i18n/procedure-label';
import { procedurePath } from '@/lib/procedure-pages';

// Hero and fallback images keyed by slug — new categories without
// an entry here will simply use the gradient background.
const CATEGORY_HEROES: Record<string, string> = {
  dentists: '/images/heroes/dentists-hero.jpg',
  pharmacies: '/images/heroes/pharmacies-hero.jpg',
  spas: '/images/heroes/spas-hero.jpg',
  doctors: '/images/heroes/doctors-hero.jpg',
  optometrists: '/images/heroes/optometrists-hero.jpg',
  'cosmetic-surgery': '/images/heroes/cosmetic-surgery-hero.jpg',
};

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

// What the searcher calls one of these, for the <title> and snippet. A category
// with no entry falls back to the plain name rather than inventing a noun.
const CATEGORY_SINGULAR_EN: Record<string, string> = {
  dentists: 'Dentist',
  pharmacies: 'Pharmacy',
  spas: 'Spa',
  doctors: 'Doctor',
  optometrists: 'Eye Care',
  'cosmetic-surgery': 'Cosmetic Surgery',
  vets: 'Vet',
  liquor: 'Liquor Store',
};
const CATEGORY_NOUN_EN: Record<string, string> = {
  dentists: 'dentists',
  pharmacies: 'pharmacies',
  spas: 'spas',
  doctors: 'doctors',
  optometrists: 'eye care providers',
  'cosmetic-surgery': 'cosmetic surgery clinics',
  vets: 'vets',
  liquor: 'liquor stores',
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategoryBySlug(category);

  if (!categoryData) {
    return { title: 'Category Not Found | ClearCross' };
  }

  // ⛔ WHY THESE TITLES CHANGED (2026-09-14, Search Console, 28 days):
  // /pharmacies sat at position ~9-10 for "progreso mexico pharmacy price list"
  // and its variants — ~40 impressions, ZERO clicks — under a title that led
  // with "Pharmacies in Nuevo Progreso Mexico — Compare Prices & Save". The
  // searcher's words ("progreso mexico pharmacy ... price") now lead the title.
  //
  // ⛔ The old description said "read reviews". clearcross_reviews is EMPTY and
  // every rating was nulled on 2026-09-06 — a snippet promising reviews is a
  // false claim sitting in Google's results, not just on the page.
  const counts = await getCategoryCounts().catch(() => ({} as Record<string, number>));
  const n = counts[category] || 0;
  const noun = CATEGORY_NOUN_EN[category];
  const singular = CATEGORY_SINGULAR_EN[category] || categoryData.name;
  const title = n >= 2 && noun
    ? `Nuevo Progreso, Mexico ${singular} Prices — ${n} ${noun.replace(/\b\w/g, (ch) => ch.toUpperCase())} Compared | ClearCross`
    : `${categoryData.name} in Nuevo Progreso, Mexico | ClearCross`;
  // ⛔ The fallback makes no claim about prices or phone numbers: it serves the
  // categories with 0 or 1 listings, and "published prices in one place" over an
  // empty page is the same false snippet this block exists to remove.
  const description = n >= 2 && noun
    ? `Compare ${n} ${noun} in Nuevo Progreso, Mexico side by side: published prices and phone numbers in one place. Know the price before you cross the bridge.`
    : `${categoryData.name} in Nuevo Progreso, Mexico — part of ClearCross, a bilingual directory of the businesses across the Progreso bridge.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: bilingualAlternates(`/${category}`, 'en'),
  };
}

/**
 * Regenerate hourly instead of only at build time.
 *
 * These pages filter on `verified`, and that column now changes OUTSIDE a
 * deploy: tools/verify/run-places-verification.mjs re-checks every provider
 * against Google Places and flips the flag in the database. Baked purely at
 * build time, 32 providers that had just earned their listing stayed invisible
 * on the live site and /spas still read "No providers" -- with the database
 * saying otherwise and nothing anywhere going red.
 *
 * A directory that needs a code push to show a new business is a directory
 * that goes stale between pushes. ISR keeps the page fully static and
 * crawlable -- the HTML a bot receives is unchanged -- while letting inventory
 * appear on its own.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

export default async function CategoryPage({ params, locale = 'en' }: CategoryPageProps & { locale?: Locale }) {
  const { category } = await params;
  const dict = locale === 'es' ? es : en;
  const t = dict.category;

  const categoryData = await getCategory(category);
  if (!categoryData) notFound();

  const providersList = await getProvidersForCategory(categoryData.id, categoryData.slug);
  const procedures = await getProceduresForCategory(categoryData.id, categoryData.slug);
  const flashDiscounts = await getActiveFlashDiscounts(categoryData.slug);

  // The procedure comparison pages that belong to this category.
  //
  // ⛔ THIS STRIP IS THE ONLY INTERNAL PATH TO THOSE PAGES. Without it they
  // are reachable from the sitemap and from each other and from nowhere on
  // the site a reader or a crawler actually walks — orphans that render
  // perfectly and collect nothing. The sitemap gets a URL discovered; an
  // internal link is what makes it worth ranking.
  const pricedProcedures = (await getPricedProcedures()).filter(
    (p) => p.categorySlug === categoryData.slug
  );

  const heroImage = CATEGORY_HEROES[category] || CATEGORY_FALLBACKS[category] || null;
  const categoryTitle = categoryLabel(categoryData.slug, dict, categoryData.name);
  const tagline = categoryData.description;

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-400">
            <li>
              <Link href={localizedPath('/', locale)} className="hover:text-brand-blue transition-colors">{t.home}</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-neutral-dark font-medium">
              {categoryTitle}
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
              alt={`${categoryTitle} — Nuevo Progreso`}
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
              {categoryTitle} {t.inNuevoProgreso}
            </h1>
            <p className="text-lg text-white/90 mb-5 leading-relaxed drop-shadow-md">
              {tagline}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>
                  <strong>{providersList.length}</strong> {t.verifiedProviders}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <TrendingDown className="w-4 h-4 text-amber" />
                <span>{t.saveVsUS}</span>
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

        {pricedProcedures.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-semibold text-neutral-dark text-lg">
              {dict.ui.procCompareHeading}
            </h2>
            <p className="text-sm text-neutral-mid mt-1 mb-4">{dict.ui.procCompareSub}</p>
            <div className="flex flex-wrap gap-2">
              {pricedProcedures.map((p) => (
                <Link
                  key={p.slug}
                  href={localizedPath(procedurePath(p.slug), locale)}
                  className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full pl-4 pr-3 py-2 text-sm font-medium text-neutral-dark hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {procedureLabel(p.slug, locale, p.name)}
                  <span className="text-xs text-neutral-400 tabular-nums">
                    {dict.ui.procClinicCount.replace('{n}', String(p.clinicCount))}
                  </span>
                </Link>
              ))}
            </div>
          </section>
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
              flashDiscounts={flashDiscounts}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Info Card */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-display font-semibold text-neutral-dark mb-3">
                {t.aboutPrefix} {categoryTitle}
              </h2>
              <p className="text-sm text-neutral-mid leading-relaxed mb-4">
                {categoryData.description}
              </p>
              <div className="space-y-2">
                <Link
                  href={localizedPath('/safety', locale)}
                  className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t.isItSafe}
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href={localizedPath('/how-it-works', locale)}
                  className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-navy transition-colors"
                >
                  {t.howDoesItWork}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-brand-blue to-brand-navy rounded-xl p-6 text-white shadow-sm">
              <h3 className="font-display font-semibold mb-2">{t.needSpecificPrice}</h3>
              <p className="text-sm mb-4 text-blue-200/80">
                {t.quoteDesc}
              </p>
              <Link
                href={localizedPath('/quote', locale)}
                className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-light transition-colors text-sm"
              >
                {t.getQuote}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Provider CTA */}
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-6">
              <h3 className="font-display font-semibold text-neutral-dark mb-2">{t.areYouProvider}</h3>
              <p className="text-sm text-neutral-mid mb-4">
                {t.providerDesc}
              </p>
              <Link
                href={localizedPath('/auth/register?role=provider', locale)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green/80 transition-colors"
              >
                {t.listBusiness}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
