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

export const metadata = {
  title: 'ClearCross Progreso - Medical Price Transparency for Nuevo Progreso, Mexico',
  description:
    'Compare prices for dental work, prescriptions, spa treatments and more in Nuevo Progreso, Mexico. Get firm quotes before you leave the US.',
};

export default async function Home() {
  const [featuredProviders, categoryCounts] = await Promise.all([
    getFeaturedProviders(),
    getCategoryCounts(),
  ]);

  return (
    <main className="w-full">
      {/* Hero Section */}
      <Hero />

      {/* Social Proof Stats — immediately after hero for trust */}
      <SocialProofBar />

      {/* Why ClearCross — explains the concept for new visitors */}
      <WhyClearCross />

      {/* Category Grid */}
      <CategoryGrid counts={categoryCounts} />

      {/* How It Works */}
      <HowItWorks />

      {/* Trust Bar — specific, linked guarantees */}
      <TrustBar />

      {/* Featured Providers */}
      <FeaturedProviders providers={featuredProviders} />

      {/* Testimonials — real stories, real savings */}
      <Testimonials />

      {/* Recent Blog Posts */}
      <RecentBlogPosts />
    </main>
  );
}
