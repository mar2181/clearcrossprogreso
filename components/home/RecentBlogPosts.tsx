import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  tag: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Why Americans Choose Mexico for Dental Work',
    excerpt:
      'Discover the benefits of seeking dental care in Nuevo Progreso, including cost savings and quality treatment. Learn what to expect before your visit.',
    date: 'Mar 15, 2025',
    readTime: 5,
    tag: 'Dental Care',
    slug: 'why-americans-choose-mexico-dental',
  },
  {
    id: '2',
    title: 'The Complete Guide to Comparing Medical Prices',
    excerpt:
      'Master the art of price comparison. We break down how to evaluate quotes, understand what\'s included, and avoid hidden costs.',
    date: 'Mar 8, 2025',
    readTime: 7,
    tag: 'Guide',
    slug: 'guide-comparing-medical-prices',
  },
  {
    id: '3',
    title: 'LASIK Surgery in Mexico: What You Need to Know',
    excerpt:
      'Everything you need to know about getting LASIK surgery in Nuevo Progreso, from pre-surgery preparation to post-op care and recovery.',
    date: 'Feb 28, 2025',
    readTime: 6,
    tag: 'Eye Care',
    slug: 'lasik-surgery-mexico-guide',
  },
];

export default function RecentBlogPosts() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            From Our Blog
          </h2>
          <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
            Tips, guides, and insights to help you make informed decisions about your medical care.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              {/* Tag Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-brand-green bg-opacity-10 text-brand-green font-sans text-xs font-semibold rounded-full">
                  {post.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-lg sm:text-xl text-gray-900 mb-3 line-clamp-2">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="font-sans text-sm sm:text-base text-gray-600 mb-4 flex-grow line-clamp-2">
                {post.excerpt}
              </p>

              {/* Meta & Read More */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-sans">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime} min read</span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <span className="inline-flex items-center gap-2 text-brand-blue font-sans font-semibold hover:text-brand-navy transition-colors cursor-pointer">
                    Read More
                    <ArrowRight size={16} />
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Blog Link */}
        <div className="text-center mt-12">
          <Link href="/blog">
            <button className="px-8 py-3 border-2 border-brand-blue text-brand-blue font-sans font-semibold rounded-lg hover:bg-brand-blue hover:text-white transition-colors">
              View All Articles
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
