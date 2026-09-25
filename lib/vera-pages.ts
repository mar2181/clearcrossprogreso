/**
 * Pages the AI webmaster writes — one JSON file in content/vera-pages/ IS one
 * page at /services/<slug>.
 *
 * The brain's page worker (custom-designs-brain/workers/page_worker.py) commits
 * exactly ONE file, content/vera-pages/<slug>.json, on a branch; the owner
 * approves the preview; the merge publishes it. Nothing else in this repo has to
 * change for a new page, which is the whole point: the route, the sitemap and the
 * metadata all read from here.
 *
 * The spec contract is the brain's (server.py _validate_page_spec): title,
 * subtitle, description, heroImage, 4-6 features {icon,title,description}, 4-6
 * process steps {step,title,description}, seo {title, description}. No
 * testimonials or reviews ever reach this file — the brain drops them — and the
 * page has nowhere to render one.
 *
 * ⛔ THIS IS A HEALTH DIRECTORY. The page renders ONLY the spec's own text: no
 * prices, no ratings, no provider list, no "verified" badge. Every claim on it is
 * the model's text, which is why test/honest-claims.mjs sweeps
 * content/vera-pages/*.json exactly like the blog MDX (section 9).
 *
 * ⛔ READ AT BUILD TIME ONLY. The route sets dynamicParams = false, so every page
 * is prerendered and an unknown slug is a real 404 — no serverless render ever
 * reads this folder, so no outputFileTracingIncludes entry is needed.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const VERA_DIR = join(process.cwd(), 'content', 'vera-pages');

export interface VeraFeature { icon: string; title: string; description: string }
export interface VeraStep { step?: number; title: string; description: string }
export interface VeraPageSpec {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  heroImage?: string;
  features: VeraFeature[];
  process: VeraStep[];
  seo?: { title?: string; description?: string };
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Only a photograph this site already ships. The brain offers heroes from
// clients/clearcross_progreso.json hero_image_paths; anything else — an external
// URL, a path that was renamed, a typo — renders the plain navy hero, never a 404
// image or a third-party request on a health page.
const HERO = /^\/images\/(heroes|blog|general)\/[a-z0-9-]+\.jpg$/;

export function servicePath(slug: string): string {
  return `/services/${slug}`;
}

export function heroOf(spec: VeraPageSpec): string | null {
  const h = spec.heroImage || '';
  if (!HERO.test(h)) return null;
  return existsSync(join(process.cwd(), 'public', h)) ? h : null;
}

/** Returns a clean spec, or null when the file cannot be served as a page. */
export function parseSpec(name: string, raw: string): VeraPageSpec | null {
  let spec: any;
  try {
    spec = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!spec || typeof spec !== 'object') return null;
  // ⛔ The file name IS the URL. A spec whose slug disagrees with its name is not
  // served: the router, the sitemap and the canonical would each pick a different
  // one of the two.
  if (typeof spec.slug !== 'string' || spec.slug !== name || !SLUG.test(name)) return null;
  if (typeof spec.title !== 'string' || !spec.title.trim()) return null;
  const txt = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const features = (Array.isArray(spec.features) ? spec.features : [])
    .map((f: any) => ({ icon: txt(f?.icon), title: txt(f?.title), description: txt(f?.description) }))
    .filter((f: VeraFeature) => f.title && f.description);
  const process = (Array.isArray(spec.process) ? spec.process : [])
    .map((p: any) => ({ title: txt(p?.title), description: txt(p?.description) }))
    .filter((p: VeraStep) => p.title && p.description);
  return {
    slug: name,
    title: spec.title.trim(),
    subtitle: txt(spec.subtitle),
    description: txt(spec.description),
    heroImage: txt(spec.heroImage),
    features,
    process,
    seo: { title: txt(spec.seo?.title), description: txt(spec.seo?.description) },
  };
}

export function allVeraPages(): VeraPageSpec[] {
  if (!existsSync(VERA_DIR)) return [];
  return readdirSync(VERA_DIR)
    .filter((n) => n.endsWith('.json'))
    .sort()
    .map((n) => parseSpec(n.slice(0, -5), readFileSync(join(VERA_DIR, n), 'utf8')))
    .filter((s): s is VeraPageSpec => s !== null);
}

export function veraPageBySlug(slug: string): VeraPageSpec | null {
  return allVeraPages().find((s) => s.slug === slug) ?? null;
}
