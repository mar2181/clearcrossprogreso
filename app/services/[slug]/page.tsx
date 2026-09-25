/**
 * /services/<slug> — a page the AI webmaster wrote (lib/vera-pages.ts).
 *
 * ⛔ WHY `/services/`. The brain's page worker records every URL as
 * <live_base>/services/<slug> (workers/page_worker.py live_page_for), so the path
 * is the worker's contract, not a choice made here. `app/[category]/[provider]` owns every two-segment path and
 * `app/[category]` every one-segment path; a static segment resolves first, so
 * `/services/...` can never be mistaken for a clinic or a category. ⛔ No category
 * may ever use the slug `services` — guarded in test/vera-pages.mjs.
 *
 * ⛔ ENGLISH ONLY, AND SAID SO. A webmaster page has no Spanish twin (the brain
 * writes one language and nothing translates it), so this page emits a canonical
 * and NO hreflang pair — pairing it would advertise /es/services/<slug>, a 404, as
 * its translation, and a non-reciprocal annotation is discarded wholesale. The
 * sitemap lists it through englishOnly(), the same exception the webmaster's
 * blog posts use.
 *
 * ⛔ dynamicParams = false: every page is prerendered from the files that exist at
 * build time, and a slug with no file is a real 404 rather than a runtime render.
 */
import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Shield, Camera, Zap, Home, Wifi, Clock, Award, Settings, Monitor, Speaker,
  Lock, Eye, TrendingUp, Globe, Network, Star, Users, Wrench, CheckCircle, Phone,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import { allVeraPages, servicePath, heroOf, veraPageBySlug } from '@/lib/vera-pages';
import { enUrl } from '@/lib/hreflang';

export const dynamicParams = false;

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Camera, Zap, Home, Wifi, Clock, Award, Settings, Monitor, Speaker,
  Lock, Eye, TrendingUp, Globe, Network, Star, Users, Wrench, CheckCircle, Phone,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allVeraPages().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const spec = veraPageBySlug(slug);
  if (!spec) return { title: 'Not Found | ClearCross' };
  const title = spec.seo?.title || spec.title;
  const description = spec.seo?.description || spec.description || spec.subtitle || spec.title;
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', url: enUrl(servicePath(spec.slug)) },
    alternates: { canonical: enUrl(servicePath(spec.slug)) },
  };
}

export default async function VeraServicePage({ params }: PageProps) {
  const { slug } = await params;
  const spec = veraPageBySlug(slug);
  if (!spec) notFound();
  const hero = heroOf(spec);

  return (
    <main className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-page py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-400 flex-wrap">
            <li>
              <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-neutral-dark font-medium">{spec.title}</li>
          </ol>
        </div>
      </nav>

      <div className="relative bg-brand-navy text-white overflow-hidden">
        {hero && (
          <Image src={hero} alt="" fill priority className="object-cover opacity-25" sizes="100vw" />
        )}
        <div className="relative container-page py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4 max-w-3xl">
            {spec.title}
          </h1>
          {spec.subtitle && (
            <p className="text-lg text-white/85 max-w-2xl leading-relaxed">{spec.subtitle}</p>
          )}
        </div>
      </div>

      <div className="container-page py-10 sm:py-14">
        {spec.description && (
          <p className="max-w-3xl text-lg leading-relaxed text-neutral-mid mb-12">{spec.description}</p>
        )}

        {spec.features.length > 0 && (
          <section className="mb-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {spec.features.map((f, i) => {
                const Icon = ICONS[f.icon] || CheckCircle;
                return (
                  <div key={i} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <div className="w-11 h-11 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-blue" />
                    </div>
                    <h2 className="font-display font-semibold text-neutral-dark text-lg mb-2">{f.title}</h2>
                    <p className="text-neutral-mid leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {spec.process.length > 0 && (
          <section className="mb-14 max-w-3xl">
            <ol className="space-y-5">
              {spec.process.map((p, i) => (
                <li key={i} className="flex gap-5">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 flex-1 shadow-sm">
                    <h3 className="font-display font-semibold text-neutral-dark mb-1">{p.title}</h3>
                    <p className="text-neutral-mid leading-relaxed">{p.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/*
          ⛔ Navigation only — no price, no provider, no claim. Everything a reader
          is told on this page is the spec's own text, which is what the honest-claims
          sweep reads; a sentence written here would be one the sweep does not see
          per page and the webmaster cannot change.
        */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/prices"
            className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-navy transition-colors text-sm"
          >
            Compare prices by procedure
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-dark font-semibold px-5 py-2.5 rounded-lg hover:border-brand-blue transition-colors text-sm"
          >
            Browse all providers
          </Link>
        </div>
      </div>
    </main>
  );
}
