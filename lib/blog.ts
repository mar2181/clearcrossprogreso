import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface BlogFrontmatter {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  coverImage?: string;
  slug: string;
}

export interface BlogPost extends BlogFrontmatter {
  content: string;
  readingTime: string;
}

const blogsDirectory = path.join(process.cwd(), 'content/blog');

/*
 * The Spanish body of a post, when one has been written. A post with no file
 * here is not broken -- the Spanish route renders the English body under an
 * amber notice that says so, which is the honest state and is the state most
 * of the posts are in.
 *
 * ⛔ NOTE ON getAllPosts: this is a SUBDIRECTORY of content/blog, and
 * getAllPosts filters readdirSync on .mdx, so the directory entry "es" is
 * dropped and a translation can never appear as an extra post on the ENGLISH
 * index. The guard pins that count, because the failure would be silent: it
 * would put Spanish cards on the English blog and nothing would go red.
 */
const esBlogDirectory = path.join(blogsDirectory, 'es');

/*
 * ⛔ The slug is concatenated into a filesystem path. Every real slug is
 * derived from a filename and matches this, so it rejects nothing that
 * exists -- it closes the traversal that appending .mdx to an arbitrary slug
 * otherwise allows. dynamicParams is on by default, so a request can reach
 * these readers carrying a slug nobody generated.
 */
const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Get all blog posts, sorted by date (newest first)
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(blogsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      return getPostBySlug(slug);
    })
    .filter((post): post is BlogPost => post !== null);

  // Sort by date descending
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  if (!SAFE_SLUG.test(slug)) return null;
  try {
    const filePath = path.join(blogsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const readTime = readingTime(content);

    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      author: data.author || '',
      tags: data.tags || [],
      coverImage: data.coverImage || '',
      content,
      readingTime: readTime.text,
    };
  } catch (error) {
    return null;
  }
}

/**
 * The Spanish body of a post, or null when nobody has written one yet.
 *
 * ⛔ NULL IS A FIRST-CLASS ANSWER AND THE CALLER MUST BRANCH ON IT. Falling
 * back to the English body silently is exactly the state this exists to end:
 * a Spanish URL serving English text with a Spanish title on it is duplicate
 * content, and it reads to a visitor as a page that failed to load rather
 * than as an article we have not translated. The Spanish route renders the
 * English body only WITH the notice that says so.
 */
export function getSpanishPostBySlug(slug: string): BlogPost | null {
  if (!SAFE_SLUG.test(slug)) return null;
  try {
    const filePath = path.join(esBlogDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const readTime = readingTime(content);

    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      author: data.author || '',
      tags: data.tags || [],
      coverImage: data.coverImage || '',
      content,
      readingTime: readTime.text,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Every slug that has a Spanish body on disk.
 *
 * ⛔ Reads the directory rather than a hand-written list. A list is the shape
 * this repo has already been bitten by twice on this exact route -- a post
 * with no entry looks identical to a post that was never written, and nothing
 * goes red. The directory is allowed not to exist.
 */
export function getTranslatedSlugs(): string[] {
  try {
    return fs
      .readdirSync(esBlogDirectory)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''))
      .sort();
  } catch (error) {
    return [];
  }
}

/**
 * Get all unique tags from all posts
 */
export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagSet.add(tag);
    });
  });

  return Array.from(tagSet).sort();
}

/**
 * Filter posts by tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}
