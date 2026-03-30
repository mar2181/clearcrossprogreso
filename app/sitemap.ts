export const dynamic = 'force-dynamic';
import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAllPosts } from '@/lib/blog';

const CATEGORY_SLUGS = [
  'dentists',
  'pharmacies',
  'spas',
  'optometrists',
  'cosmetic-surgery',
  'liquor',
  'vets',
];

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

  // Category pages
  CATEGORY_SLUGS.forEach((slug) => {
    entries.push({
      url: `${BASE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

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
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Provider pages - fetch from Supabase
  try {
    const supabase = createServerSupabaseClient();

    // Get all providers with their category info
    const { data: providers, error } = await supabase
      .from('providers')
      .select('slug, category:category_id(slug)');

    if (!error && providers) {
      providers.forEach((provider) => {
        const categorySlug = (provider.category as any)?.slug;
        if (categorySlug && provider.slug) {
          entries.push({
            url: `${BASE_URL}/${categorySlug}/${provider.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error fetching providers for sitemap:', error);
  }

  return entries;
}
