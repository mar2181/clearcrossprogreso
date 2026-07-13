export const dynamic = 'force-dynamic';
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
    console.error('Error fetching blog posts for sitemap:', error);
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
