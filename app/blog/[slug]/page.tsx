import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { wmPostBySlug, wmPosts } from '@/lib/wm-blog';
import BlogContent from '@/components/blog/BlogContent';
import { bilingualAlternates, enUrl } from '@/lib/hreflang';

interface Props {
  params: Promise<{ slug: string }>;
}

/*
 * ⛔ ISR, AND `dynamicParams` LEFT AT ITS DEFAULT OF TRUE. The MDX posts and
 * whatever the webmaster had published at BUILD time are prerendered; a post
 * published afterwards is rendered on demand and then cached. Setting
 * dynamicParams = false would 404 every post published after the last deploy.
 * The hour is the fallback; /api/revalidate makes a publish immediate.
 *
 * ⛔ The MDX files are read with fs at regeneration time too, so next.config.js
 * traces content/blog into this route (outputFileTracingIncludes). Without that
 * a regenerated hand-written post would come back "not found".
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const wm = await wmPosts(posts.map((p) => p.slug));
  return [...posts, ...wm].map((post) => ({ slug: post.slug }));
}

/**
 * The post for a slug. ⛔ MDX FIRST: a hand-written post wins a slug collision
 * (see lib/wm-blog.ts). The database is only asked when no file exists.
 */
async function resolve(slug: string) {
  const mdx = getPostBySlug(slug);
  if (mdx) return { post: mdx, webmaster: false as const };
  const wm = await wmPostBySlug(slug);
  if (wm) return { post: wm, webmaster: true as const };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await resolve(slug);

  if (!found) {
    return { title: 'Post Not Found' };
  }
  const { post, webmaster } = found;

  const base: Metadata = {
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

  // ⛔ A webmaster post has ONE English URL and no Spanish twin, so it gets a
  // canonical and NO hreflang pair — pointing hreflang at /es/blog/<slug>
  // would hand Google a 404 as this page's translation.
  if (webmaster) {
    return { ...base, alternates: { canonical: enUrl(`/blog/${slug}`) } };
  }
  return { ...base, alternates: bilingualAlternates(`/blog/${slug}`, 'en') };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const found = await resolve(slug);

  /*
   * ⛔ A REAL 404, NOT A 200 "Post Not Found" PAGE. The brain warms a post URL
   * after publishing (it chases a 200) and after unpublishing (it chases a
   * 404); a soft 404 answers 200 for a post that does not exist, so a warm
   * would report success over a missing page. A draft, a nonsense slug and an
   * unreachable database all land here.
   */
  if (!found) notFound();
  const { post } = found;

  const posts = await getAllPosts();
  const relatedPosts = posts
    .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const image = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `https://clearcrossprogreso.com${post.coverImage}`
    : '';

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
    ...(image ? { image } : {}),
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
