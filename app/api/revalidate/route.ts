import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { BLOG_TAG, pathsFor } from '@/lib/revalidate';

/**
 * POST /api/revalidate — purge the pages a newly published webmaster post
 * changes. Called by the ClearCross brain the moment an owner presses Publish;
 * see lib/revalidate.ts for why.
 *
 * ⛔ IT REVALIDATES AND DOES NOTHING ELSE. No database read, no write, no
 * outbound call. It is not a publish path and must never grow into one.
 *
 * ⛔ IT FAILS CLOSED. No REVALIDATE_SECRET configured answers 503, never 200.
 * Deleting the variable can take revalidation DOWN; it can never open it.
 *
 * ⛔ THE SECRET RIDES IN THE `x-revalidate-secret` HEADER, never the query
 * string, which would land it in every access log on the way.
 *
 * ⛔ AND FAILURE IS CHEAP: the post row is already published before the brain
 * calls here, so an unreachable route only means the page appears within the
 * hour on its own.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ok(secret: string, got: string): boolean {
  // Length first (timingSafeEqual throws on a mismatch); leaks the length only.
  if (secret.length === 0 || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET || '';
  if (!secret) {
    return Response.json(
      { ok: false, error: 'REVALIDATE_SECRET is not set on this deployment' },
      { status: 503 },
    );
  }
  if (!ok(secret, req.headers.get('x-revalidate-secret') || '')) {
    return Response.json({ ok: false, error: 'bad secret' }, { status: 401 });
  }

  let slug: unknown = '';
  try {
    const body = (await req.json()) as { slug?: unknown };
    slug = body?.slug;
  } catch {
    return Response.json({ ok: false, error: 'bad body' }, { status: 400 });
  }

  const paths = pathsFor(slug);
  if (!paths) {
    return Response.json({ ok: false, error: 'bad slug' }, { status: 400 });
  }

  // The tag clears the cached DATA (index, post, sitemap); the paths clear the
  // cached RENDERS, including a 404 cached while the post was still a draft.
  // Next 15: revalidateTag takes ONE argument (the two-argument form is Next 16).
  revalidateTag(BLOG_TAG);
  for (const p of paths) revalidatePath(p);
  return Response.json({ ok: true, revalidated: paths, tag: BLOG_TAG });
}

/** GET answers 405 rather than 404, so "wrong method" never reads as "no endpoint". */
export async function GET() {
  return Response.json(
    { ok: false, error: 'POST only' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
