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
  title: 'ClearCross Progreso — The US Charges Up to 2,400% More for Healthcare',
  description:
    'Compare real prices for dental implants, Botox, Ozempic, eye exams and more in Nuevo Progreso, Mexico. The US charges 400–2,400% more for the same care. Get written quotes before you cross the border.',
};

export default async function Home() {
  let featuredProviders: Awaited<ReturnType<typeof getFeaturedProviders>> = [];
  let categoryCounts: Awaited<ReturnType<typeof getCategoryCounts>> = {};

  try {
    const [fp, cc] = await Promise.all([
      getFeaturedProviders().catch(() => []),
      getCategoryCounts().catch(() => ({})),
    ]);
    featuredProviders = fp;
    categoryCounts = cc;
  } catch (error) {
    console.error('Home page data fetch failed:', error);
  }

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
