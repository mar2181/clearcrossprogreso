/**
 * Structured data for provider pages.
 *
 * THE MOAT. Every competitor in this SERP publishes ranges ("crowns $250-450").
 * We hold 299 live per-provider line items, and today Google reads them as
 * plain text in a table. This turns them into an OfferCatalog so a search
 * engine -- and, increasingly, an answer engine -- can state the number.
 *
 * ⛔ THE ONE RULE, AND IT IS NOT NEGOTIABLE: this file may only describe what
 * the page actually renders. This site has already shipped the opposite once --
 * an `aggregateRating` of 4.2/27 sat on a page whose review panel read "No
 * reviews yet", which is a Google structured-data policy violation and manual-
 * action territory on a health site. The prices are a far bigger surface for
 * the same mistake: 299 of them, all invisible to anyone reading the page.
 *
 * So every field below is either derived from the same helper the visible
 * component uses, or omitted. Nothing here is inferred, defaulted or padded.
 */
import type { FlashDiscount, Provider } from '@/lib/types';
import { effectivePrice, type PricedProcedure } from '@/lib/pricing';

export const SITE_URL = 'https://clearcrossprogreso.com';

/**
 * schema.org types, one per vertical. Every value is a real type in the
 * vocabulary -- a made-up type is silently ignored, which looks identical to
 * having no markup at all.
 */
export const CATEGORY_SCHEMA_TYPE: Record<string, string> = {
  dentists: 'Dentist',
  doctors: 'Physician',
  'cosmetic-surgery': 'MedicalClinic',
  pharmacies: 'Pharmacy',
  optometrists: 'Optician',
  vets: 'VeterinaryCare',
  spas: 'DaySpa',
  liquor: 'LiquorStore',
};

/**
 * Singular human labels.
 *
 * ⛔ This replaces an EMPTY `CATEGORY_LABELS` object that sat in the provider
 * page. Every lookup fell through to the fallback, so all 104 provider titles
 * read "-- dentists in Nuevo Progreso" (the raw plural URL slug) while the
 * category page beside them correctly read "Dentists in Nuevo Progreso".
 *
 * The breadcrumb markup below and the visible breadcrumb read from this same
 * map, because a BreadcrumbList naming something different from the trail on
 * screen is the same class of lie as the rating was.
 */
export const CATEGORY_LABEL: Record<string, string> = {
  dentists: 'Dentist',
  doctors: 'Doctor',
  'cosmetic-surgery': 'Cosmetic Surgery Clinic',
  pharmacies: 'Pharmacy',
  optometrists: 'Optometrist',
  vets: 'Veterinarian',
  spas: 'Spa',
  liquor: 'Liquor Store',
};

/** Plural, for breadcrumbs and category headings. */
export const CATEGORY_LABEL_PLURAL: Record<string, string> = {
  dentists: 'Dentists',
  doctors: 'Doctors',
  'cosmetic-surgery': 'Cosmetic Surgery',
  pharmacies: 'Pharmacies',
  optometrists: 'Optometrists',
  vets: 'Vets',
  spas: 'Spas',
  liquor: 'Liquor',
};

interface OfferNode {
  '@type': 'Offer';
  itemOffered: { '@type': 'Service'; name: string };
  price: string;
  priceCurrency: 'USD';
  availability: string;
  priceValidUntil?: string;
  description?: string;
}

/**
 * One Offer per price the page actually shows.
 *
 * ⛔ A row whose `price_usd` is null renders a "Request a quote" link, not a
 * figure. It gets no Offer. Emitting one would put a number on a procedure this
 * provider has never quoted us -- inventing a price for a real business.
 *
 * ⛔ The amount is the EFFECTIVE price, so a flash discount that strikes $1,200
 * through and shows $960 emits 960. Emitting the undiscounted figure would make
 * the markup contradict the table directly above it.
 */
export function priceOffers(
  prices: PricedProcedure[],
  flash?: FlashDiscount | null,
): OfferNode[] {
  const offers: OfferNode[] = [];
  for (const item of prices || []) {
    const name = item.procedure?.name;
    if (!name) continue; // nothing to name the service
    const priced = effectivePrice(item, flash);
    if (!priced) continue; // the page shows no price -> no Offer
    const offer: OfferNode = {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name },
      price: priced.amount.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    };
    // Only ever from a real expiry on a real discount row.
    if (priced.validUntil) offer.priceValidUntil = priced.validUntil;
    if (item.price_notes) offer.description = item.price_notes;
    offers.push(offer);
  }
  return offers;
}

export interface ProviderGraphInput {
  provider: Provider & {
    address?: string | null;
    phone?: string | null;
    website?: string | null;
  };
  category: string;
  prices: PricedProcedure[];
  reviews: { rating: number }[];
  flashDiscount?: FlashDiscount | null;
}

/**
 * The whole page as one JSON-LD graph.
 *
 * A single @graph rather than several script tags: the BreadcrumbList and the
 * business reference each other by @id, which is what lets a crawler treat them
 * as one entity instead of three unrelated fragments.
 */
export function providerGraph({
  provider,
  category,
  prices,
  reviews,
  flashDiscount,
}: ProviderGraphInput) {
  const pageUrl = SITE_URL + '/' + category + '/' + provider.slug;
  const businessId = pageUrl + '#business';
  const offers = priceOffers(prices, flashDiscount);

  const business: Record<string, unknown> = {
    '@type': CATEGORY_SCHEMA_TYPE[category] || 'LocalBusiness',
    '@id': businessId,
    name: provider.name,
    url: pageUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: provider.address || undefined,
      addressLocality: 'Nuevo Progreso',
      addressRegion: 'Tamaulipas',
      addressCountry: 'MX',
    },
    currenciesAccepted: 'USD',
  };

  if (provider.phone) business.telephone = provider.phone;
  if (provider.website) business.sameAs = [provider.website];

  // The description is real, provider-supplied prose sitting in the database.
  const description = (provider as { description?: string | null }).description;
  if (description) business.description = description;

  // Real coordinates only. A missing geo is omitted, never defaulted to the
  // centre of town -- a wrong pin sends somebody to the wrong door.
  //
  // ⛔ The columns are `lat`/`lng`, NOT `latitude`/`longitude`. The first draft
  // of this file read the long names, found undefined on every provider, and
  // silently emitted no geo at all -- on 104 pages whose coordinates the Places
  // verification had just written. A field name that does not exist and a value
  // that is genuinely absent are indistinguishable from the output.
  const lat = provider.lat;
  const lng = provider.lng;
  if (typeof lat === 'number' && typeof lng === 'number') {
    business.geo = { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };
  }

  if (offers.length > 0) {
    business.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: (CATEGORY_LABEL[category] || 'Service') + ' prices at ' + provider.name,
      itemListElement: offers,
    };
  }

  // ⛔ Gated on the reviews the page RENDERS, never on the seeded avg_rating.
  // Same rule that removed the 4.2/27 block; it applies here unchanged.
  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
    };
  }

  // ⛔ Mirrors the visible breadcrumb exactly: Home > Category > Provider.
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': pageUrl + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: CATEGORY_LABEL_PLURAL[category] || category,
        item: SITE_URL + '/' + category,
      },
      { '@type': 'ListItem', position: 3, name: provider.name },
    ],
  };

  return { '@context': 'https://schema.org', '@graph': [business, breadcrumb] };
}
