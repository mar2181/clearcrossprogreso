/**
 * GET /api/border-wait — the live Progreso crossing wait, from CBP.
 *
 * ⛔ WHY WE PROXY INSTEAD OF CALLING CBP FROM THE BROWSER. The feed answers
 * `Access-Control-Allow-Origin: *`, so the browser COULD call it directly, and
 * that is the tempting build because it is less code. Three reasons not to:
 *
 *   1. One call per revalidation window serves every visitor. Direct from the
 *      browser it is one call per pageview at a federal endpoint that sends
 *      `Cache-Control: no-store` — we would be the ones hammering it.
 *   2. Their CORS header is not a promise. The day it changes, every visitor's
 *      panel breaks at once and nothing here would have gone red first.
 *   3. The shape stays ours. `readProgreso` runs in one place, so the "an empty
 *      delay is not zero" rule cannot be reimplemented differently client-side.
 */
import { NextResponse } from 'next/server';
import { readProgreso } from '@/lib/border-wait';

const CBP_FEED = 'https://bwt.cbp.gov/api/waittimes';

/**
 * ⛔ THE ROUTE IS DYNAMIC AND THE UPSTREAM FETCH IS WHAT GETS CACHED.
 *
 * A statically-cached ROUTE would also cache a FAILURE for the whole window —
 * one bad minute at CBP and the panel says "unavailable" for five minutes after
 * it recovered. Caching the fetch instead means a successful read is shared by
 * everyone and a failed one is retried on the next request.
 *
 * 300s is well inside CBP's own cadence (they update several times an hour), so
 * the panel is never more than five minutes behind while costing one call.
 */
export const dynamic = 'force-dynamic';
const REVALIDATE_SECONDS = 300;

/** ⛔ Bounded. An unbounded fetch on a page load hangs the panel forever. */
const TIMEOUT_MS = 6000;

export async function GET() {
  let payload: unknown;
  try {
    const res = await fetch(CBP_FEED, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, reason: `CBP answered ${res.status}` },
        { status: 200, headers: { 'cache-control': 'no-store' } },
      );
    }
    payload = await res.json();
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: err instanceof Error ? err.name : 'fetch failed' },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }

  const reading = readProgreso(payload);

  // ⛔ A FEED WE CANNOT READ IS A FAILURE, NOT AN EMPTY READING. Returning a
  // zeroed shape here would render as "no wait" on the page — the exact lie
  // lib/border-wait.ts exists to prevent, reintroduced one layer up.
  if (!reading) {
    return NextResponse.json(
      { ok: false, reason: 'the Progreso port was not in the CBP feed' },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }

  return NextResponse.json(
    { ok: true, reading },
    { status: 200, headers: { 'cache-control': `public, max-age=0, s-maxage=${REVALIDATE_SECONDS}` } },
  );
}
