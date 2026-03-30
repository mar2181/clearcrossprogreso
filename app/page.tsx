import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import HowItWorks from '@/components/home/HowItWorks';
import TrustBar from '@/components/home/TrustBar';
import FeaturedProviders from '@/components/home/FeaturedProviders';
import RecentBlogPosts from '@/components/home/RecentBlogPosts';

export const metadata = {
  title: 'ClearCross Progreso - Medical Price Transparency for Nuevo Progreso, Mexico',
  description:
    'Compare prices for dental work, prescriptions, spa treatments and more in Nuevo Progreso, Mexico. Get firm quotes before you leave the US.',
};

export default function Home() {
  return (
    <main className="w-full">
      {/* Hero Section */}
      <Hero />

      {/* Category Grid */}
      <CategoryGrid />

      {/* How It Works */}
      <HowItWorks />

      {/* Trust Bar */}
      <TrustBar />

      {/* Featured Providers */}
      <FeaturedProviders />

      {/* Recent Blog Posts */}
      <RecentBlogPosts />
    </main>
  );
}
