import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | ClearCross Progreso`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://clearcrossprogreso.com/blog/${slug}`,
      type: 'article',
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <Link
            href="/blog"
            className="text-[#1A5CB0] font-semibold hover:text-[#3A8B2F]"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const posts = await getAllPosts();
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const relatedPosts = posts
    .filter((p) =>
      p.tags.some((tag) => post.tags.includes(tag))
    )
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/blog"
          className="text-[#1A5CB0] font-semibold hover:text-[#3A8B2F] inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Cover Image Hero */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Post Header */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold font-sora text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <span>By {post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-block px-3 py-1 text-sm font-medium bg-blue-50 text-[#1A5CB0] rounded hover:bg-[#1A5CB0] hover:text-white transition-colors capitalize"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-10"></div>

        {/* MDX Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <style>{`
            .prose {
              color: #374151;
            }
            .prose h2 {
              font-family: 'Sora', sans-serif;
              color: #1A3A6B;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }
            .prose h3 {
              font-family: 'Sora', sans-serif;
              color: #1A5CB0;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }
            .prose p {
              margin-bottom: 1.25rem;
              line-height: 1.75;
            }
            .prose ul, .prose ol {
              margin-bottom: 1.25rem;
            }
            .prose li {
              margin-bottom: 0.5rem;
            }
            .prose a {
              color: #1A5CB0;
              text-decoration: underline;
            }
            .prose a:hover {
              color: #3A8B2F;
            }
            .prose blockquote {
              border-left-color: #1A5CB0;
              color: #6B7280;
              font-style: italic;
            }
            .prose strong {
              color: #1F2937;
              font-weight: 600;
            }
          `}</style>
          <MDXRemote source={post.content} />
        </div>

        {/* Mid-Article CTA */}
        <div className="bg-gradient-to-r from-[#1A5CB0] to-[#1A3A6B] text-white rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold font-sora mb-3">
            Ready to Schedule Your Dental Care?
          </h3>
          <p className="text-blue-100 mb-6">
            Looking for a dentist in Nuevo Progreso? Compare prices, read
            reviews, and book your appointment on ClearCross Progreso.
          </p>
          <Link
            href="/dentists"
            className="inline-flex items-center px-6 py-3 bg-white text-[#1A5CB0] font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Compare Dentists & Prices
            <svg
              className="w-5 h-5 ml-2"
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

        {/* Divider */}
        <div className="border-t border-gray-200 mb-12"></div>

        {/* Author Bio */}
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            About the Author
          </h4>
          <p className="text-gray-700">
            The ClearCross Progreso team is dedicated to providing accurate,
            helpful information about dental tourism in Mexico. We help patients
            make informed decisions about their dental care across the border.
          </p>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold font-sora text-gray-900 mb-8">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative h-40 overflow-hidden">
                    {relatedPost.coverImage ? (
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1A5CB0] to-[#3A8B2F] flex items-center justify-center p-4">
                        <h3 className="text-white font-bold text-center text-sm">
                          {relatedPost.title}
                        </h3>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(relatedPost.date).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
