import Hero from '@/components/home/Hero';
import SocialProofBar from '@/components/home/SocialProofBar';
import WhyClearCross from '@/components/home/WhyClearCross';
import CategoryGrid from '@/components/home/CategoryGrid';
import HowItWorks from '@/components/home/HowItWorks';
import TrustBar from '@/components/home/TrustBar';
import FeaturedProviders from '@/components/home/FeaturedProviders';
import Testimonials from '@/components/home/Testimonials';
import RecentBlogPosts from '@/components/home/RecentBlogPosts';
import { getFeaturedProviders, getCategoryCounts } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mejores Dentistas y Servicios Médicos en Nuevo Progreso México | ClearCross',
  description:
    'Encuentre y compare precios de dentistas, farmacias, spas y servicios médicos en Nuevo Progreso, México. Conozca el precio antes de cruzar. Ahorre 80-90% en cuidados dentales.',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://clearcrossprogreso.com/es',
    siteName: 'ClearCross Progreso',
    title: 'Mejores Dentistas y Servicios Médicos en Nuevo Progreso México | ClearCross',
    description:
      'Encuentre y compare precios de dentistas, farmacias, spas y servicios médicos en Nuevo Progreso, México. Conozca el precio antes de cruzar.',
  },
  alternates: {
    canonical: 'https://clearcrossprogreso.com/es',
    languages: {
      'en-US': 'https://clearcrossprogreso.com',
      'es-MX': 'https://clearcrossprogreso.com/es',
    },
  },
};

export default async function EsHome() {
  const [featuredProviders, categoryCounts] = await Promise.all([
    getFeaturedProviders(),
    getCategoryCounts(),
  ]);

  return (
    <main className="w-full">
      <Hero />
      <SocialProofBar />
      <WhyClearCross />
      <CategoryGrid counts={categoryCounts} />
      <HowItWorks />
      <TrustBar />
      <FeaturedProviders providers={featuredProviders} />
      <Testimonials />
      <RecentBlogPosts />
    </main>
  );
}
