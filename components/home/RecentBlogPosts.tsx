import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { getAllPosts, BlogPost } from '@/lib/blog';

// Map common tags to cover images
const TAG_IMAGES: Record<string, string> = {
  dental: '/images/blog/best-dentists.jpg',
  pharmacies: '/images/blog/pharmacies-nuevo-progreso.jpg',
  'cosmetic surgery': '/images/blog/botox-cosmetic.jpg',
  safety: '/images/blog/safe-dental-mexico.jpg',
  guide: '/images/blog/border-crossing.jpg',
  'eye care': '/images/blog/dental-crown-cost.jpg',
};

function getCoverImage(post: BlogPost): string | null {
  if (post.coverImage) return post.coverImage;
  // Try to match a tag to an image
  for (const tag of post.tags) {
    const lower = tag.toLowerCase();
    if (TAG_IMAGES[lower]) return TAG_IMAGES[lower];
  }
  return '/images/blog/best-dentists.jpg'; // fallback
}

export default async function RecentBlogPosts() {
  let posts: BlogPost[] = [];
  try {
    const allPosts = await getAllPosts();
    posts = allPosts.slice(0, 3);
  } catch {
    // If blog loading fails, don't crash the homepage
    return null;
  }

  if (posts.length === 0) return null;

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const coverImage = getCoverImage(post);
            const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Cover Image */}
                {coverImage && (
                  <div className="relative w-full h-44 overflow-hidden">
                    <Image
                      src={coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-5">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-green/10 text-brand-green font-sans text-xs font-semibold rounded-full"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="font-sans text-sm text-gray-600 mb-4 flex-grow line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>{formattedDate}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-brand-blue font-semibold text-xs group-hover:text-brand-navy transition-colors">
                      Read
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Blog Link */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-brand-blue text-brand-blue font-sans font-semibold rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
          >
            View All Articles
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
