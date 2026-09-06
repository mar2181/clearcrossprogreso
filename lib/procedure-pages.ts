/**
 * The procedure comparison page — what it is, and why the rules are these.
 *
 * ⛔ THE GAP THIS CLOSES. Measured 2026-09-06 against the live sitemap: the site
 * published 354 URLs and not one of them targeted the query a person actually
 * types. A provider page targets a BRAND ("Dental Artistry Nuevo Progreso") —
 * nobody searches that unless they already know the clinic. A category page
 * targets one broad head term. The high-intent middle layer — "dental implants
 * nuevo progreso cost" — had no page at all.
 *
 * That is not a guess about how this market ranks. Every result on page one for
 * that query is a procedure x location page and NOT ONE is a clinic profile:
 *   whatclinic.com/dentists/mexico/nuevo-progreso/all-on-4-dental-implants
 *   placidway.com/search-medical-pricings/dental-implants+dentistry/nuevo-progreso+mexico
 *   medicaltourismco.com/all-on-4-dental-implants-in-nuevo-progreso/
 *   mexicodental.co/nuevo-progreso-dentist-prices/
 * And every one of them publishes a RANGE ("$800 to $1,200", "around $7,160").
 * We hold 316 per-clinic figures. The comparison IS the differentiator, so the
 * page whose whole job is to show it is the page that was missing.
 *
 * This module is deliberately PURE — no database, no React. The rules below are
 * the ones that decide whether a page is honest, so a guard has to be able to
 * execute them against fixtures rather than scan for them in a component.
 */
import { getSavings } from '@/lib/us-benchmarks';

/**
 * ⛔ A page needs at least this many clinics or it does not exist.
 *
 * One clinic is not a comparison — it is a provider page with a worse title,
 * and shipping dozens of them buries the handful that carry real depth. Three
 * is DERIVED, not picked: measured against the live database it yields 31
 * procedures, and dropping to 2 adds only thin pages while 5 would discard
 * genuinely useful ones (eye-exam has 4 clinics, e-max crown 4, lumineer 3).
 *
 * ⛔ Do not lower this to make the page count look bigger. The count is not the
 * product; the comparison is.
 */
export const MIN_CLINICS_FOR_PRICE_PAGE = 3;

export interface ComparisonInput {
  procedure: { id: string; slug: string; name: string; category_id: string };
  category: { slug: string; name: string };
  /** Every price row for this procedure, from any provider, unfiltered. */
  rows: {
    price_usd: number | null;
    price_notes?: string | null;
    provider: {
      id: string;
      slug: string;
      name: string;
      verified?: boolean | null;
      phone?: string | null;
      whatsapp?: string | null;
      avg_rating?: number | null;
      review_count?: number | null;
    } | null;
  }[];
}

export interface ComparisonEntry {
  providerSlug: string;
  providerName: string;
  priceUsd: number;
  priceNotes: string | null;
  phone: string | null;
  whatsapp: string | null;
  rating: number | null;
  reviewCount: number;
}

export interface Comparison {
  procedureSlug: string;
  procedureName: string;
  categorySlug: string;
  categoryName: string;
  entries: ComparisonEntry[];
  /** The cheapest and dearest published figure. Equal when every clinic agrees. */
  lowUsd: number;
  highUsd: number;
  /** Average US self-pay price, or null when we hold no benchmark. */
  usBenchmarkUsd: number | null;
  /** Saving against that benchmark at the CHEAPEST published price, or null. */
  bestSavingPercent: number | null;
}

/**
 * Build the comparison, or return null when there is no page to build.
 *
 * ⛔ A row with `price_usd === null` is DROPPED, never counted as zero and never
 * rendered as "call for price" inside a price comparison. The provider page has
 * a quote link for that case; here it would put a clinic in a price table with
 * no price, which reads as free.
 *
 * ⛔ A row with `price_usd === 0` is KEPT. Zero is a real, deliberate value in
 * this data (free consultations and eye exams) and lib/pricing.ts already
 * renders it as "Free". Treating it as missing would delete a true fact.
 *
 * ⛔ Only VERIFIED providers count — the same gate every category page uses. An
 * unverified clinic must not reach a page through a side door.
 *
 * ⛔ ONE ROW PER PROVIDER, AND IT IS THE CHEAPEST ONE. This is not a
 * hypothetical: measured on production, a pharmacy lists SEVERAL products under
 * one heading — nine pain-relief rows from one pharmacy, five weight-loss rows,
 * six ivermectin packs. Without the de-duplication `/prices/pain-relief` would
 * have announced "9 clinics in Nuevo Progreso publish a price" above the same
 * pharmacy printed nine times.
 *
 * ⛔ And WHICH row survives has to be decided, not left to arrive. PostgREST
 * guarantees no order, so keeping the first one seen means the figure shown for
 * a multi-product pharmacy is arbitrary — it could be the $41 pack or the $393
 * one, and the page sorts on it. The cheapest is the only defensible choice: it
 * is deterministic, it matches the page's own "from" framing, and it is already
 * the rule SavingsBanner uses for exactly this data.
 */
export function buildComparison(input: ComparisonInput): Comparison | null {
  const cheapest = new Map<string, ComparisonEntry>();

  for (const row of input.rows) {
    const p = row.provider;
    if (!p || !p.verified) continue;
    if (row.price_usd === null || row.price_usd === undefined) continue;
    if (typeof row.price_usd !== 'number' || Number.isNaN(row.price_usd)) continue;
    if (row.price_usd < 0) continue;

    const held = cheapest.get(p.id);
    if (held && held.priceUsd <= row.price_usd) continue;

    cheapest.set(p.id, {
      providerSlug: p.slug,
      providerName: p.name,
      priceUsd: row.price_usd,
      priceNotes: row.price_notes ?? null,
      phone: p.phone ?? null,
      whatsapp: p.whatsapp ?? null,
      rating: p.avg_rating ?? null,
      reviewCount: p.review_count ?? 0,
    });
  }

  const entries: ComparisonEntry[] = Array.from(cheapest.values());
  if (entries.length < MIN_CLINICS_FOR_PRICE_PAGE) return null;

  // Cheapest first. ⛔ Ties break on NAME, not on input order: a PostgREST
  // result set has no guaranteed order, so an unsorted tie would reshuffle the
  // table between builds and read to a crawler as a page that keeps changing.
  entries.sort((a, b) =>
    a.priceUsd !== b.priceUsd
      ? a.priceUsd - b.priceUsd
      : a.providerName.localeCompare(b.providerName)
  );

  const lowUsd = entries[0].priceUsd;
  const highUsd = entries[entries.length - 1].priceUsd;

  // ⛔ getSavings returns null when we hold no benchmark, when the price is 0,
  // or when the saving is not positive. All three must render as "no saving
  // claim", never as a 0% badge — a badge that says 0% still asserts we did the
  // comparison and found nothing, which is a different claim from silence.
  const saving = getSavings(input.procedure.slug, lowUsd);

  return {
    procedureSlug: input.procedure.slug,
    procedureName: input.procedure.name,
    categorySlug: input.category.slug,
    categoryName: input.category.name,
    entries,
    lowUsd,
    highUsd,
    usBenchmarkUsd: saving ? saving.usPrice : null,
    bestSavingPercent: saving ? saving.percentSaved : null,
  };
}

/** The canonical English path for a procedure page. One place, so a rename cannot strand a link. */
export function procedurePath(slug: string): string {
  return `/prices/${slug}`;
}
