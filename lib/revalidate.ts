/**
 * WHICH PAGES A NEWLY PUBLISHED WEBMASTER POST INVALIDATES.
 *
 * ⛔ WHY THIS EXISTS — measured on Ariss Estates 2026-09-06, same architecture:
 * the blog routes cache their answer for an hour, so a post URL visited while
 * still a draft caches a 404 for that hour, and the /blog index goes on listing
 * nothing new. The owner console shows the live URL, so clicking it before
 * pressing Publish is the ordinary thing to do. The brain calls
 * /api/revalidate right after publishing (SITE_REVALIDATE_SECRET on the brain,
 * REVALIDATE_SECRET here) and these paths plus the data tag are purged.
 *
 * ⛔ No `/es/...` path: a webmaster post has one English URL and is not listed
 * on the Spanish index (see lib/wm-blog.ts).
 *
 * This module has NO IMPORTS so a plain `node` guard can execute it. The tag is
 * mirrored from lib/wm-blog.ts by hand and the guard fails if they drift.
 */

export const BLOG_TAG = 'wm-blogs';

/** Mirrors SLUG_RE in lib/wm-blog.ts. Guarded against drift. */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,119}$/;

/**
 * Every path a newly published post changes, or null for a slug that cannot be
 * one of ours — the caller refuses rather than revalidating a guessed path.
 * ⛔ The slug is concatenated into a path handed to revalidatePath, so a `../`
 * or a second `/` is refused here, before it gets there.
 */
export function pathsFor(slug: unknown): string[] | null {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) return null;
  return [`/blog/${slug}`, '/blog', '/sitemap.xml'];
}
