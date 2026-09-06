/**
 * The display name for a procedure, in the reader's language.
 *
 * ⛔ SAME PROBLEM AS category-label.ts, ONE LEVEL DOWN, AND MORE VISIBLE.
 * `clearcross_procedures.name` is a database column and it is English, so a
 * Spanish page whose entire H1 is a procedure name would read "Precios de
 * Dental Implant en Nuevo Progreso" — half-translated, and targeting an English
 * phrase in a market that is roughly 85% Hispanic.
 *
 * ⛔ IT FALLS BACK TO THE DATABASE NAME, NEVER TO A BLANK OR A SLUG. A procedure
 * added to Supabase before it appears here must still render its English name —
 * a real term a reader can act on — rather than "3-unit-bridge" or nothing.
 * That fallback is what makes this a lookup rather than a data migration.
 *
 * ⛔ ONLY UNAMBIGUOUS CLINICAL TERMS ARE LISTED. Every entry is the standard
 * Spanish name a clinic in Nuevo Progreso would itself print on a price list.
 * If a term has no single obvious translation it is LEFT OUT so the English
 * name shows, because a confidently wrong medical word on a price page is worse
 * than an English one a reader recognises from the clinic's own sign.
 */
const PROCEDURE_ES: Record<string, string> = {
  // ─── Dental ────────────────────────────────────────────────────────────
  'dental-implant': 'implantes dentales',
  'zirconia-crown': 'coronas de zirconia',
  'metal-porcelain-crown': 'coronas de porcelana con metal',
  'emax-crown': 'coronas E-Max',
  'crown-over-implant': 'corona sobre implante',
  'root-canal': 'endodoncia',
  'porcelain-veneer': 'carillas de porcelana',
  'composite-veneer': 'carillas de resina',
  lumineer: 'lumineers',
  'dental-cleaning': 'limpieza dental',
  'deep-cleaning': 'limpieza profunda',
  'teeth-whitening': 'blanqueamiento dental',
  'composite-filling': 'resinas dentales',
  'tooth-extraction': 'extracción dental',
  'wisdom-tooth-extraction': 'extracción de muelas del juicio',
  dentures: 'dentaduras',
  braces: 'brackets',
  'bone-graft': 'injerto de hueso',
  '3-unit-bridge': 'puente dental de tres piezas',
  'all-on-4': 'implantes All-on-4',
  'all-on-6': 'implantes All-on-6',
  'consultation-exam': 'consulta dental',
  // ─── Pharmacy ──────────────────────────────────────────────────────────
  'weight-loss-ozempic-wegovy': 'medicamentos para bajar de peso',
  'pain-relief': 'analgésicos y antiinflamatorios',
  'respiratory-asthma': 'medicamentos para el asma',
  'erectile-dysfunction': 'medicamentos para disfunción eréctil',
  ivermectin: 'ivermectina',
  'acid-reflux': 'medicamentos para el reflujo',
  insulin: 'insulina',
  // ─── Eye care / cosmetic ───────────────────────────────────────────────
  'eye-exam': 'examen de la vista',
  'cosmetic-consultation': 'consulta estética',
};

export function procedureLabel(slug: string, locale: 'en' | 'es', dbName: string): string {
  if (locale !== 'es') return dbName;
  return PROCEDURE_ES[slug] || dbName;
}

/** Exported so a guard can assert every listed slug is a real procedure. */
export const PROCEDURE_ES_SLUGS = Object.keys(PROCEDURE_ES);
