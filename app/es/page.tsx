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
