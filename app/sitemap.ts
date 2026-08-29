// ⛔ DO NOT put `force-dynamic` back. `getAllPosts()` reads content/blog/*.mdx with
// fs at call time; under force-dynamic this sitemap runs in a serverless function
// where those files are not traced into the bundle, so readdirSync threw ENOENT, the
// catch below swallowed it, and production served 114 URLs with ZERO blog posts —
// silently, for weeks, while the blog was the only thing on the site ranking page one.
// Generated at build time, fs works and all 10 posts are emitted.
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getAllCategories, getAllProviderSlugs } from '@/lib/data';

const BASE_URL = 'https://clearcrossprogreso.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Category pages — from the data layer (works in mock and Supabase modes)
  try {
    const categories = await getAllCategories();
    (categories || []).forEach((cat: any) => {
      if (cat?.slug) {
        entries.push({
          url: `${BASE_URL}/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    });
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Blog index
  entries.push({
    url: `${BASE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // Blog posts
  try {
    const posts = await getAllPosts();
    posts.forEach((post) => {
      entries.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
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
        entries.push({
          url: `${BASE_URL}/${category}/${provider}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  } catch (error) {
    console.error('Error fetching providers for sitemap:', error);
  }

  return entries;
}
