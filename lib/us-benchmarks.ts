/**
 * US price benchmarks for medical procedures.
 * Used across PriceTable, ProviderCard, and category pages
 * to show savings comparisons.
 *
 * Sources: Medical Tourism Co (2026), HolaMedic (2026),
 * Medical Tourism Packages (2026), industry averages.
 */

export const US_BENCHMARKS: Record<string, number> = {
  // ─── DENTAL ──────────────────────────────────────────
  'consultation-exam': 150,
  'dental-cleaning': 150,
  'deep-cleaning': 300,
  'periapical-xray': 35,
  'composite-filling': 250,
  'tooth-extraction': 250,
  'wisdom-tooth-extraction': 400,
  'root-canal': 1200,
  'metal-porcelain-crown': 1200,
  'zirconia-crown': 1500,
  'emax-crown': 1800,
  'composite-veneer': 800,
  'porcelain-veneer': 1500,
  'lumineer': 2000,
  'teeth-whitening': 600,
  'dental-implant': 3500,
  'crown-over-implant': 1500,
  'dentures': 2000,
  'all-on-4': 25000,
  'all-on-6': 30000,
  'braces': 6000,
  '3-unit-bridge': 3600,
  'bone-graft': 1200,

  // ─── COSMETIC SURGERY ────────────────────────────────
  'cosmetic-consultation': 150,
  'botox-wrinkle-treatment': 600,    // ~$17/unit × ~15-50 units
  'dermal-fillers': 750,             // per syringe US avg
  'lip-filler': 750,
  'jaw-filler': 800,
  'thread-lift': 3500,
  'chemical-peel': 300,
  'mesotherapy': 500,
  'laser-skin-resurfacing': 2500,
  'liposuction': 6000,               // conservative; can be $11,500+
  'tummy-tuck': 13000,
  'breast-augmentation': 11500,
  'facelift': 19500,
  'mommy-makeover': 14000,
  'endolift-facial-rejuvenation': 4000,
  'spider-veins-treatment': 1000,
  'collagen-stimulator': 1000,
  'profhilo': 800,
  'tattoo-removal': 500,             // per session
  'excessive-sweating-treatment': 1000,

  // ─── OPTOMETRY / EYE CARE ───────────────────────────
  'eye-exam': 200,
  'prescription-glasses': 400,       // frames + lenses avg
  'contact-lenses': 250,             // annual supply
  'sunglasses': 250,                 // prescription sunglasses
  'progressive-lenses': 500,
  'eye-exam-glasses-package': 500,
  'same-day-glasses': 500,

  // ─── DOCTORS ─────────────────────────────────────────
  'doctor-consultation': 250,        // GP/specialist visit
  'blood-work-cbc': 150,
  'metabolic-panel': 200,
  'house-call': 500,
  'full-physical-checkup': 350,
  'doctor-xray': 300,
  'injection-vaccination': 100,
  'wound-care': 250,

  // ─── PHARMACIES ──────────────────────────────────────
  // Per-unit or per-fill comparison
  'weight-loss-ozempic-wegovy': 1200,  // monthly Ozempic/Wegovy
  'insulin': 350,                       // monthly insulin
  'pain-relief': 30,                    // per bottle OTC
  'antibiotics': 75,                    // Z-Pak US
  'erectile-dysfunction': 100,          // per fill Viagra/Cialis
  'respiratory-asthma': 90,            // albuterol inhaler
  'acid-reflux': 40,                   // Nexium/Prilosec
  'ivermectin': 80,
  'blood-pressure': 50,                // per month
  'blood-thinner': 550,               // Eliquis monthly
  'skin-care-tretinoin': 100,
  'nerve-pain-gabapentin': 60,
  'contraceptives': 50,

  // ─── SPAS ────────────────────────────────────────────
  'facial-skincare-treatment': 150,
  'body-massage': 120,
  'body-scrub-wrap': 150,
  'manicure-pedicure': 75,
  'microblading': 500,
  'eyebrow-services': 30,
  'haircut-styling': 60,
  'body-sculpting-cellulite': 500,
};

/**
 * Get savings info for a procedure
 */
export function getSavings(procedureSlug: string, mexicoPrice: number | null): {
  usPrice: number;
  saved: number;
  percentSaved: number;
} | null {
  const usPrice = US_BENCHMARKS[procedureSlug];
  if (!usPrice || !mexicoPrice || mexicoPrice <= 0) return null;
  const saved = usPrice - mexicoPrice;
  if (saved <= 0) return null;
  return {
    usPrice,
    saved,
    percentSaved: Math.round((saved / usPrice) * 100),
  };
}

/**
 * Get the max savings percentage across a list of procedures with prices
 */
export function getMaxSavingsPercent(
  prices: { procedureSlug: string; priceUsd: number | null }[]
): number | null {
  let maxPercent = 0;
  for (const p of prices) {
    const savings = getSavings(p.procedureSlug, p.priceUsd);
    if (savings && savings.percentSaved > maxPercent) {
      maxPercent = savings.percentSaved;
    }
  }
  return maxPercent > 0 ? maxPercent : null;
}
