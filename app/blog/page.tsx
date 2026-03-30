import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getAllTags } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog | ClearCross Progreso — Dental Tourism Guides & Tips',
  description:
    'Expert guides on dental tourism in Nuevo Progreso Mexico. Learn about costs, safety, and how to get the best dental care across the border.',
  openGraph: {
    title: 'Blog | ClearCross Progreso',
    description:
      'Expert guides on dental tourism in Nuevo Progreso Mexico.',
    url: 'https://clearcrossprogreso.com/blog',
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const tags = await getAllTags();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A5CB0] to-[#1A3A6B] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-sora mb-4">
            Dental Tourism Guides
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Everything you need to know about getting dental care in Nuevo
            Progreso, Mexico. From costs and safety to border crossing tips.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Filter by Topic
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/blog"
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-900 hover:bg-[#1A5CB0] hover:text-white"
              >
                All Posts
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-900 hover:bg-[#1A5CB0] hover:text-white capitalize"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A5CB0] to-[#3A8B2F] flex items-center justify-center p-6">
                    <h3 className="text-white font-bold text-lg leading-tight text-center">
                      {post.title}
                    </h3>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="flex-1 p-6 flex flex-col">
                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <span>{post.readingTime}</span>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-[#1A5CB0] rounded capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read More Link */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-[#1A5CB0] font-semibold hover:text-[#3A8B2F] transition-colors mt-auto"
                >
                  Read More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* No Posts */}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No blog posts found. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
