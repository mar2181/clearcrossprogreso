import type { Dictionary } from './context';

/**
 * The display name for a category, in the reader's language.
 *
 * ⛔ WHY THIS EXISTS RATHER THAN JUST READING provider.category.name.
 * The category name is a DATABASE column and it is English, so every card,
 * badge and breadcrumb on the Spanish tree said "Dentists". Measured on
 * /es/dentists: 27 occurrences on one page -- by a wide margin the most
 * repeated English string in the Spanish tree.
 *
 * The translations already existed (dict.category.catDentists and friends);
 * nothing was reading them outside the page metadata. So this is a lookup, not
 * a data migration -- the Spanish name for "Dentists" does not need to be added
 * to Supabase for a Spanish reader to see it.
 *
 * ⛔ IT FALLS BACK TO THE DATABASE NAME, NEVER TO A BLANK OR A SLUG. A category
 * added to Supabase before its dictionary entry exists must still render its
 * English name -- which is a real word a reader can act on -- rather than
 * "cosmetic-surgery" or nothing at all. Guarded by test/bilingual.mjs.
 */
const KEY_BY_SLUG: Record<string, keyof Dictionary['category']> = {
  dentists: 'catDentists',
  pharmacies: 'catPharmacies',
  spas: 'catSpas',
  optometrists: 'catOptometrists',
  'cosmetic-surgery': 'catCosmeticSurgery',
  doctors: 'catDoctors',
  liquor: 'catLiquor',
  vets: 'catVets',
};

export function categoryLabel(
  slug: string | null | undefined,
  dict: Dictionary,
  fallback?: string | null,
): string {
  const key = slug ? KEY_BY_SLUG[slug] : undefined;
  if (key) {
    const label = dict.category[key];
    if (typeof label === 'string' && label) return label;
  }
  return fallback || dict.ui.categoryFallback;
}

/** The slugs this module knows how to translate. Exported for the guard. */
export const TRANSLATED_CATEGORY_SLUGS = Object.keys(KEY_BY_SLUG);
