// ⛔ DO NOT put `force-dynamic` back. `getAllPosts()` reads content/blog/*.mdx with
// fs at call time; under force-dynamic this sitemap runs in a serverless function
// where those files are not traced into the bundle, so readdirSync threw ENOENT, the
// catch below swallowed it, and production served 114 URLs with ZERO blog posts —
// silently, for weeks, while the blog was the only thing on the site ranking page one.
// Generated at build time, fs works and all 10 posts are emitted.
import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { wmPosts } from '@/lib/wm-blog';
import { allVeraPages } from '@/lib/vera-pages';
import { getAllCategories, getAllProviderSlugs, getPricedProcedures } from '@/lib/data';
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

/**
 * ONE English URL with NO hreflang pair — used for the webmaster's database
 * posts and nothing else.
 *
 * ⛔ The exception to pair(), and a deliberate one: a webmaster post has no
 * Spanish twin (wm_blogs has no language column and nothing translates a post),
 * so pairing it would advertise /es/blog/<slug> — a 404 — as its translation.
 * test/bilingual.mjs allows exactly ONE englishOnly() call site and pins it to
 * the webmaster block.
 */
function englishOnly(
  path: string,
  opts: { changeFrequency: Entry['changeFrequency']; priority: number; lastModified?: Date }
): Entry[] {
  return [{ url: enUrl(path), lastModified: opts.lastModified ?? new Date(), changeFrequency: opts.changeFrequency, priority: opts.priority }];
}

// ⛔ ISR, matching the blog routes: the webmaster posts come from Supabase. The
// MDX files are read with fs, so next.config.js traces content/blog into this
// route — without that a runtime regeneration throws on the blog block below.
export const revalidate = 3600;

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

  // The webmaster's published posts (lib/wm-blog.ts). ⛔ English only, and an MDX
  // post wins a slug collision, so a clashing database post is not listed twice.
  // A failed read degrades to "no webmaster posts" inside wmPosts itself; the
  // hand-written posts above must never be taken down by a third party.
  try {
    const mdxSlugs = (await getAllPosts()).map((p) => p.slug);
    const webmaster = await wmPosts(mdxSlugs);
    webmaster.forEach((post) => {
      entries.push(
        ...englishOnly(`/blog/${post.slug}`, {
          changeFrequency: 'monthly',
          priority: 0.7,
          lastModified: post.date ? new Date(post.date) : undefined,
        })
      );
    });
  } catch (error) {
    console.error('Error fetching webmaster posts for sitemap:', error);
  }

  // The webmaster's pages (lib/vera-pages.ts), /services/<slug>. ⛔ English only,
  // for the same reason as the posts above, and read from the SAME function the
  // route's generateStaticParams uses, so the sitemap cannot list a guide the
  // router did not build. Local files: a read failure is a real defect, so it
  // is not caught.
  allVeraPages().forEach((spec) => {
    entries.push(...englishOnly(`/services/${spec.slug}`, { changeFrequency: 'monthly', priority: 0.7 }));
  });

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

  // Procedure comparison pages — /prices/<procedure>.
  //
  // ⛔ These come from getPricedProcedures(), the SAME reader
  // generateStaticParams uses. A sitemap that advertises a URL the router
  // does not build is a 404 handed straight to Google, and a router that
  // builds a page the sitemap never mentions is a page nobody finds.
  try {
    const priced = await getPricedProcedures();
    // The hub that lists every comparison. Emitted only when there is at least
    // one comparison, because app/prices/page.tsx 404s on an empty index.
    if (priced.length > 0) {
      entries.push(...pair('/prices', { changeFrequency: 'weekly', priority: 0.9 }));
    }
    priced.forEach((p) => {
      if (p.slug) {
        // Priority above a provider page and level with a category: this is
        // the layer that targets what people actually search for.
        entries.push(...pair(`/prices/${p.slug}`, { changeFrequency: 'weekly', priority: 0.9 }));
      }
    });
  } catch (error) {
    console.error('Error fetching priced procedures for sitemap:', error);
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
