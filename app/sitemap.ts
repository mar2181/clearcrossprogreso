// ⛔ DO NOT put `force-dynamic` back. `getAllPosts()` reads content/blog/*.mdx with
// fs at call time; under force-dynamic this sitemap runs in a serverless function
// where those files are not traced into the bundle, so readdirSync threw ENOENT, the
// catch below swallowed it, and production served 114 URLs with ZERO blog posts —
// silently, for weeks, while the blog was the only thing on the site ranking page one.
// Generated at build time, fs works and all 10 posts are emitted.
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getAllCategories, getAllProviderSlugs } from '@/lib/data';
import { bilingualAlternates, enUrl, esUrl } from '@/lib/hreflang';

type Entry = MetadataRoute.Sitemap[number];

/**
 * Emit BOTH language versions of one route, each carrying the hreflang pair.
 *
 * ⛔ The two entries are produced together, from one English path, on purpose.
 * Before this the sitemap listed 114 English URLs and ZERO Spanish ones — the
 * entire `/es` tree was invisible to Google in an ~85% Hispanic market — because
 * the Spanish routes were a separate concern nobody remembered. Pairing them here
 * makes "add a route but only in English" impossible rather than merely unlikely.
 *
 * The per-entry `alternates` emits xhtml:link hreflang in the sitemap itself,
 * which Google treats as equivalent to the HTML tags. That is what covers the
 * static pages, which carry no metadata export of their own.
 */
function pair(
  path: string,
  opts: { changeFrequency: Entry['changeFrequency']; priority: number; lastModified?: Date }
): Entry[] {
  const alternates = { languages: bilingualAlternates(path, 'en').languages };
  const lastModified = opts.lastModified ?? new Date();
  return [
    { url: enUrl(path), lastModified, changeFrequency: opts.changeFrequency, priority: opts.priority, alternates },
    // The Spanish copy is deliberately a notch lower in priority: it is a
    // translation of the same page, not an additional one.
    { url: esUrl(path), lastModified, changeFrequency: opts.changeFrequency, priority: Math.max(0.1, opts.priority - 0.1), alternates },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push(...pair('/', { changeFrequency: 'daily', priority: 1.0 }));

  // Category pages — from the data layer (works in mock and Supabase modes)
  try {
    const categories = await getAllCategories();
    (categories || []).forEach((cat: any) => {
      if (cat?.slug) {
        entries.push(...pair(`/${cat.slug}`, { changeFrequency: 'weekly', priority: 0.9 }));
      }
    });
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Blog index
  entries.push(...pair('/blog', { changeFrequency: 'weekly', priority: 0.8 }));

  // Blog posts
  try {
    const posts = await getAllPosts();
    posts.forEach((post) => {
      entries.push(
        ...pair(`/blog/${post.slug}`, {
          changeFrequency: 'monthly',
          priority: 0.7,
          lastModified: new Date(post.date),
        })
      );
    });
  } catch (error) {
    // ⛔ Deliberately asymmetric with the network blocks above and below: this read
    // touches only the local filesystem, so a failure here is a real defect and must
    // break the build rather than quietly ship a sitemap missing its best pages.
    console.error('Error fetching blog posts for sitemap:', error);
    throw error;
  }

  // Provider pages — data layer handles mock vs Supabase
  try {
    const slugs = await getAllProviderSlugs();
    slugs.forEach(({ category, provider }) => {
      if (category && provider) {
        entries.push(...pair(`/${category}/${provider}`, { changeFrequency: 'weekly', priority: 0.8 }));
      }
    });
  } catch (error) {
    console.error('Error fetching providers for sitemap:', error);
  }

  // Standing pages. Low ranking value individually, but they are what an E-E-A-T
  // assessment looks for on a health site, and every one of them was missing.
  // ⛔ `/search` and `/quote` are deliberately absent: search results are thin and
  // infinite, and /quote still renders mock data.
  for (const path of ['/about', '/how-it-works', '/safety', '/privacy', '/terms']) {
    entries.push(...pair(path, { changeFrequency: 'monthly', priority: 0.5 }));
  }

  return entries;
}
