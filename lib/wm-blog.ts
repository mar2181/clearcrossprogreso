/**
 * THE WEBMASTER'S POSTS — the articles the AI Webmaster (Vera) publishes into
 * Supabase `wm_blogs`, rendered through the SAME article renderer the
 * hand-written MDX posts use.
 *
 * ⛔ WHY THIS FILE EXISTS. The ClearCross brain went live on 2026-09-21 and can
 * write, illustrate and publish blog posts. Until this file, nothing on the site
 * read that table: a post could be approved in the owner console and have
 * nowhere to appear. Same gap Ariss Estates had (see its lib/blog.ts, 2026-09-05).
 *
 * ⛔ AN ADAPTER, NOT A SECOND RENDERER. A post's JSON blocks become the
 * markdown-ish text `components/blog/BlogContent.tsx`'s RichContent already
 * understands (`## `, `### `, `- `, `![alt](src)`, paragraphs). So a machine
 * post is styled exactly like the hand-written guide beside it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ⛔ THREE LOCKS ON A DRAFT.
 *   1. the ANON key, so RLS applies (the service key bypasses it; one dropped
 *      filter would then publish every draft on a database SHARED with seven
 *      other clients).
 *   2. RLS itself — measured 2026-09-21: the anon key returns only published
 *      rows; a bogus table 404s, so that reading discriminates.
 *   3. explicit `client_key=eq.clearcross_progreso` AND `status=eq.published`
 *      filters, below. Redundant with RLS on purpose.
 *
 * ⛔ ESCAPE FIRST, THEN MARK UP. RichContent renders paragraphs, headings and
 * list items through dangerouslySetInnerHTML — safe for hand-written MDX, an
 * injection surface for model-written text from a database. So every piece of
 * post text is HTML-escaped BEFORE it becomes a line, and the characters
 * RichContent treats as markup (`*`, and a leading `#`, `|`, `-`, `!`, `1.`)
 * are entity-encoded so post text can never change which element renders.
 * Image alt text is the one exception: RichContent renders it as a React child
 * (escaped for free), so it is stripped of the `[]()` that would break the
 * image line instead of being entity-escaped (which would show as `&amp;`).
 *
 * ⛔ ONE POST, ONE ENGLISH URL. `wm_blogs` has no language column and nothing
 * translates a post, so there is no `/es/blog/<slug>` for a webmaster post and
 * the sitemap lists it once, without an hreflang pair.
 *
 * ⛔ AN MDX POST WINS A SLUG COLLISION. If the webmaster ever publishes a slug a
 * hand-written file already has, the MDX file is what `/blog/<slug>` serves and
 * the database post is left OUT of the index and the sitemap — two cards with
 * one URL would be a card that lies about where it goes. The hand-written
 * posts were reviewed line by line against the honest-claims guard; a database
 * post was not, so the reviewed one is the one that wins.
 *
 * This module has NO IMPORTS so a plain `node` guard can load it and EXECUTE
 * the adapter rather than read it.
 */

/** The tenant. Every query is scoped to it; there is no unscoped read. */
export const CLIENT_KEY = 'clearcross_progreso';

/** The shared Supabase project that holds `wm_blogs`. */
export const SUPABASE_URL = 'https://svgsbaahxiaeljmfykzp.supabase.co';

/**
 * The project's ANON key. Public by design — it already ships in the browser
 * bundle of every sibling client site on this project. It grants nothing RLS
 * does not allow, and RLS on `wm_blogs` allows anonymous reads of PUBLISHED
 * rows only.
 */
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2Z3NiYWFoeGlhZWxqbWZ5a3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODc2ODksImV4cCI6MjA1Njg2MzY4OX0.S80GrL92vr2F-dwzWZqaz3Gt8RgttRi8ccC9y6sRQfI';

/** The cache tag on every read. Mirrored in lib/revalidate.ts (guarded). */
export const BLOG_TAG = 'wm-blogs';

/** This client's image bucket (clients/clearcross_progreso.json blog_image_bucket). */
export const IMAGE_BUCKET_PREFIX =
  `${SUPABASE_URL}/storage/v1/object/public/clearcross-images/`;

const SITE = 'https://clearcrossprogreso.com';

/**
 * ⛔ The slug goes into a PostgREST filter and a URL, so anything outside the
 * shape the brain generates is refused before it is interpolated.
 */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,119}$/;

export type WmPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  /** A site-relative path or this client's bucket URL; '' when none. */
  coverImage: string;
  /** RichContent-ready text. Every piece of post text inside is escaped. */
  content: string;
  readingTime: string;
  /** Marks where the post came from, for callers that need to branch. */
  source: 'webmaster';
};

/* ------------------------------------------------------------------ escape */

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    // RichContent turns **x** into <strong> and *x* into <em>. Encoding the
    // asterisk keeps post text from changing its own markup.
    .replace(/\*/g, '&#42;');
}

/**
 * One escaped line of text that cannot be mistaken for block markup by
 * RichContent: a leading `#`, `|`, `-`, `!` or `1.` is entity-encoded (it still
 * reads the same on screen, because the line renders through innerHTML).
 */
export function line(text: string): string {
  let t = esc(String(text || '').replace(/\s+/g, ' ').trim());
  if (!t) return '';
  if (/^[#|!-]/.test(t)) t = `&#${t.charCodeAt(0)};` + t.slice(1);
  t = t.replace(/^(\d+)\./, '$1&#46;');
  return t;
}

/** Alt text for an `![alt](src)` line: rendered as a React child, so no entities. */
function altText(s: string): string {
  return String(s || '').replace(/[\[\]()\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * An image URL this site may hand to next/image, or null.
 *
 * ⛔ next/image REFUSES an unconfigured host, and it does so by throwing during
 * render — a bad URL in one post would take the whole article down. So only two
 * shapes are accepted: a site-relative path under /images/, and this client's
 * own bucket. The brain's hero defaults are site paths
 * (`/images/heroes/dentists-hero.jpg`), sometimes written absolute on our own
 * domain, which is converted back to relative.
 */
export function safeImage(u: unknown): string | null {
  if (typeof u !== 'string') return null;
  let s = u.trim();
  if (!s) return null;
  if (s.startsWith(SITE + '/')) s = s.slice(SITE.length);
  if (s.startsWith('/images/') && !s.includes('..') && /^[A-Za-z0-9/._-]+$/.test(s)) return s;
  if (s.startsWith(IMAGE_BUCKET_PREFIX) && !s.includes('..') && !/[\s"'<>()]/.test(s)) return s;
  return null;
}

/* ------------------------------------------------------------------ blocks */

type Raw = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const arr = (v: unknown): Raw[] =>
  Array.isArray(v) ? v.filter((x): x is Raw => !!x && typeof x === 'object') : [];

const ALIAS: Record<string, string> = {
  h2: 'heading', h3: 'heading', subheading: 'heading',
  quote: 'pullquote', blockquote: 'pullquote',
  list: 'checklist', bullets: 'checklist',
  cta: 'cta_band', stats: 'stat_strip', faqs: 'faq', feature: 'callout',
};

/** Paragraphs from a text field, each escaped, blank runs collapsed. */
function paras(text: string): string[] {
  return String(text || '')
    .split(/\n{2,}/)
    .map(line)
    .filter(Boolean);
}

/**
 * One writer block becomes zero or more RichContent lines.
 * ⛔ An unknown type is DROPPED, never rendered raw.
 */
function toLines(raw: Raw, img: (ref: string) => { src: string; alt: string } | null): string[] {
  const t = ALIAS[str(raw.type).toLowerCase()] || str(raw.type).toLowerCase();
  const out: string[] = [];
  const h2 = (s: string) => { const l = line(s); if (l) out.push(`## ${l}`); };
  const h3 = (s: string) => { const l = line(s); if (l) out.push(`### ${l}`); };
  const picture = (ref: string, caption: string) => {
    const i = img(ref);
    if (i) out.push(`![${altText(caption || i.alt)}](${i.src})`);
  };

  switch (t) {
    case 'paragraph':
      out.push(...paras(str(raw.text)));
      break;
    case 'heading':
      h2(str(raw.text));
      break;
    case 'stat_strip':
      for (const s of arr(raw.stats)) {
        const v = line(str(s.value));
        const l = line(str(s.label));
        if (v && l) out.push(`- ${v} — ${l}`);
      }
      break;
    case 'split':
      picture(str(raw.image_ref), '');
      h3(str(raw.heading));
      out.push(...paras(str(raw.text)));
      break;
    case 'cards':
      for (const c of arr(raw.cards)) {
        h3(str(c.title));
        out.push(...paras(str(c.text)));
      }
      break;
    case 'pullquote': {
      const q = line(str(raw.text));
      const by = line(str(raw.attribution));
      if (q) out.push(by ? `&#8220;${q}&#8221; — ${by}` : `&#8220;${q}&#8221;`);
      break;
    }
    case 'image':
      picture(str(raw.image_ref), str(raw.caption));
      break;
    case 'checklist':
      h3(str(raw.heading));
      for (const s of Array.isArray(raw.items) ? raw.items : []) {
        const l = line(str(s));
        if (l) out.push(`- ${l}`);
      }
      break;
    case 'faq': {
      const qa = arr(raw.qa).filter((x) => str(x.q) && str(x.a));
      if (qa.length) {
        h2(str(raw.heading) || 'Common questions');
        for (const x of qa) {
          h3(str(x.q));
          out.push(...paras(str(x.a)));
        }
      }
      break;
    }
    case 'callout':
      h3(str(raw.heading));
      for (const p of Array.isArray(raw.paras) ? raw.paras : [raw.text]) out.push(...paras(str(p)));
      break;
    case 'cta_band':
      h3(str(raw.heading));
      out.push(...paras(str(raw.text)));
      break;
    default:
      break;
  }
  // A blank line between blocks closes any open list in RichContent.
  return out.length ? [...out, ''] : [];
}

type ImgEntry = { ref?: string; url?: string; alt?: string };

function imageResolver(images: unknown) {
  const by = new Map<string, { src: string; alt: string }>();
  for (const i of arr(images) as ImgEntry[]) {
    // `hero_video` shares the array and is not a picture.
    const src = safeImage(i.url);
    if (i.ref && i.ref !== 'hero_video' && src) by.set(i.ref, { src, alt: str(i.alt) });
  }
  return (ref: string) => (ref ? by.get(ref) || null : null);
}

/** The site's topic tags, which gate BlogContent's price band and checklists. */
function tagsFor(category: string): string[] {
  const c = category.toLowerCase();
  if (/dental|dentist|teeth/.test(c)) return ['dental'];
  if (/pharmac|medicine/.test(c)) return ['pharmacy'];
  if (/cosmetic|spa/.test(c)) return ['cosmetic'];
  return [];
}

export function shape(row: Raw): WmPost | null {
  const slug = str(row.slug);
  const title = str(row.title);
  if (!SLUG_RE.test(slug) || !title) return null;
  // ⛔ Belt and braces: even if RLS and the query filter were both lost, a row
  // for another tenant or a draft never becomes a post.
  if (row.client_key !== undefined && row.client_key !== CLIENT_KEY) return null;
  if (row.status !== undefined && row.status !== 'published') return null;

  let parsed: unknown = row.content;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = [{ type: 'paragraph', text: row.content }];
    }
  }
  const img = imageResolver(row.images);
  const content = arr(parsed).flatMap((b) => toLines(b, img)).join('\n').trim();
  const words = content
    .replace(/&#?[a-z0-9]+;/gi, ' ')
    .replace(/[#!|()[\]-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const rawDate = str(row.date) || str(row.created_at);
  const date = /^\d{4}-\d{2}-\d{2}/.test(rawDate) ? rawDate.slice(0, 10) : '';

  return {
    slug,
    title,
    excerpt: str(row.excerpt),
    date,
    author: str(row.author) || 'ClearCross Progreso',
    tags: tagsFor(str(row.category)),
    coverImage: safeImage(row.image) || '',
    content,
    readingTime: `${Math.max(1, Math.round(words / 200))} min read`,
    source: 'webmaster',
  };
}

/* ------------------------------------------------------------------- fetch */

const COLS = 'slug,title,excerpt,category,author,image,images,date,created_at,content,status,client_key';

/** The exact query URL. Exported so the guard can assert every filter is on it. */
export function queryUrl(extra: string): string {
  return (
    `${SUPABASE_URL}/rest/v1/wm_blogs?select=${COLS}` +
    `&client_key=eq.${CLIENT_KEY}&status=eq.published${extra}`
  );
}

async function query(extra: string): Promise<Raw[]> {
  try {
    const r = await fetch(queryUrl(extra), {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      // ⛔ A post published in the console must appear WITHOUT a deploy. An hour
      // bounds the read load; /api/revalidate makes publish immediate. The TAG is
      // what lets one call purge this data wherever it is read, sitemap included.
      // ⛔ NOT cache: 'no-store' — that would make the blog dynamic on every hit.
      next: { revalidate: 3600, tags: [BLOG_TAG] },
    } as RequestInit);
    if (!r.ok) return [];
    return arr(await r.json());
  } catch {
    // ⛔ An unreachable database renders as NO webmaster posts, never a broken
    // blog: the hand-written posts do not depend on a third party being up.
    return [];
  }
}

/**
 * Published webmaster posts, newest first, minus any slug in `exclude`
 * (the MDX slugs — an MDX post wins a collision; see the header).
 */
export async function wmPosts(exclude: Iterable<string> = []): Promise<WmPost[]> {
  const skip = new Set(exclude);
  const rows = await query('&order=created_at.desc&limit=50');
  return rows
    .map(shape)
    .filter((p): p is WmPost => p !== null && !skip.has(p.slug));
}

/** One published webmaster post by slug, or null. */
export async function wmPostBySlug(slug: string): Promise<WmPost | null> {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) return null;
  const rows = await query(`&slug=eq.${slug}&limit=1`);
  return rows.length ? shape(rows[0]) : null;
}

/**
 * The /blog index: hand-written posts plus webmaster posts, newest first.
 * ⛔ A webmaster post whose slug an MDX post already has is dropped here too
 * (wmPosts already excludes it; this is the second lock, for any caller that
 * forgot to pass the MDX slugs).
 */
export function mergeBlogIndex<A extends { slug: string; date: string }, B extends { slug: string; date: string }>(
  mdx: A[],
  wm: B[],
): Array<A | B> {
  const taken = new Set(mdx.map((p) => p.slug));
  const time = (d: string) => {
    const t = new Date(d).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  return [...mdx, ...wm.filter((p) => !taken.has(p.slug))].sort((a, b) => time(b.date) - time(a.date));
}
