import { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import BlogContent from '@/components/blog/BlogContent';
import { bilingualAlternates } from '@/lib/hreflang';

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
    return { title: 'Post Not Found' };
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
    alternates: bilingualAlternates(`/blog/${slug}`, 'en'),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Post Not Found
          </h1>
          <a href="/blog" className="text-brand-blue font-semibold hover:text-brand-navy">
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  const posts = await getAllPosts();
  const relatedPosts = posts
    .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  // ⛔ Describes what the page renders: the H1 title, the date and author shown
  // in the byline, the cover image. No rating, no review, no FAQ (Google retired
  // FAQ rich results in May 2026). Guarded by test/article-schema.mjs against the
  // BUILT page and the MDX frontmatter.
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://clearcrossprogreso.com/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    inLanguage: 'en',
    mainEntityOfPage: `https://clearcrossprogreso.com/blog/${post.slug}`,
    ...(post.coverImage ? { image: `https://clearcrossprogreso.com${post.coverImage}` } : {}),
    author: { '@type': 'Organization', name: post.author, url: 'https://clearcrossprogreso.com/about' },
    publisher: {
      '@type': 'Organization',
      name: 'ClearCross Progreso',
      url: 'https://clearcrossprogreso.com',
      logo: { '@type': 'ImageObject', url: 'https://clearcrossprogreso.com/apple-touch-icon.png' },
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData).replace(/</g, '\\u003c') }}
    />
    <BlogContent
      post={{
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        author: post.author,
        tags: post.tags,
        coverImage: post.coverImage,
        content: post.content,
        readingTime: post.readingTime,
      }}
      relatedPosts={relatedPosts.map((rp) => ({
        slug: rp.slug,
        title: rp.title,
        excerpt: rp.excerpt,
        date: rp.date,
        coverImage: rp.coverImage,
        tags: rp.tags,
      }))}
    />
    </>
  );
}
