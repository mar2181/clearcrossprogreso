/**
 * Provider gallery image mapping.
 * Maps provider slugs to arrays of image paths for the detail page gallery.
 * Images were generated via fal.ai flux-pro/v1.1-ultra.
 */

// Dental gallery image sets
const DENTAL_SET_A = [
  '/images/providers/clinic-exterior-modern.jpg',
  '/images/providers/reception-waiting-room.jpg',
  '/images/providers/operatory-room.jpg',
  '/images/providers/dental-team.jpg',
];

const DENTAL_SET_B = [
  '/images/providers/clinic-entrance-plaza.jpg',
  '/images/providers/sterilization-room.jpg',
  '/images/providers/intraoral-camera.jpg',
  '/images/providers/consultation-desk.jpg',
];

const DENTAL_SET_C = [
  '/images/providers/implant-surgery-room.jpg',
  '/images/providers/ct-scanner.jpg',
  '/images/providers/implant-kit.jpg',
  '/images/providers/happy-result.jpg',
];

const DENTAL_SET_D = [
  '/images/providers/family-waiting.jpg',
  '/images/providers/smile-design.jpg',
  '/images/providers/perfect-smile.jpg',
  '/images/providers/clinic-hallway.jpg',
];

const DENTAL_SET_E = [
  '/images/providers/neighborhood-clinic.jpg',
  '/images/providers/simple-operatory.jpg',
  '/images/providers/greeting-patient.jpg',
  '/images/providers/happy-repair.jpg',
];

const DENTAL_SET_F = [
  '/images/providers/premium-interior.jpg',
  '/images/providers/cadcam-milling.jpg',
  '/images/providers/luxury-chair.jpg',
  '/images/providers/man-smile.jpg',
];

// Pharmacy gallery image sets
const PHARMACY_CHAIN = [
  '/images/providers/pharmacy-chain-exterior.jpg',
  '/images/providers/pharmacy-chain-interior.jpg',
  '/images/providers/pharmacy-chain-counter.jpg',
];

const PHARMACY_LOCAL = [
  '/images/providers/pharmacy-local-exterior.jpg',
  '/images/providers/pharmacy-local-counter.jpg',
  '/images/providers/pharmacy-local-service.jpg',
];

const PHARMACY_MEDCENTER = [
  '/images/providers/pharmacy-medcenter-exterior.jpg',
  '/images/providers/pharmacy-counting-pills.jpg',
  '/images/providers/pharmacy-insulin-fridge.jpg',
];

const PHARMACY_BOUTIQUE = [
  '/images/providers/pharmacy-boutique.jpg',
  '/images/providers/pharmacy-consultation.jpg',
  '/images/providers/pharmacy-price-display.jpg',
];

// Spa gallery image sets
const SPA_SET_A = [
  '/images/providers/spa-exterior.jpg',
  '/images/providers/spa-massage-room.jpg',
  '/images/providers/spa-facial-treatment.jpg',
];

const SPA_SET_B = [
  '/images/providers/spa-nail-station.jpg',
  '/images/providers/spa-microblading.jpg',
  '/images/providers/spa-salon-interior.jpg',
];

const SPA_SET_C = [
  '/images/providers/spa-body-sculpting.jpg',
  '/images/providers/spa-sauna-steam.jpg',
  '/images/providers/spa-relaxation-area.jpg',
];

const COSMETIC_SET = [
  '/images/providers/cosmetic-consultation.jpg',
  '/images/providers/cosmetic-treatment-room.jpg',
  '/images/providers/cosmetic-botox-injection.jpg',
];

// Doctor / General Medicine gallery image set
const DOCTOR_SET = [
  '/images/providers/doctor-consultation-room.jpg',
  '/images/providers/doctor-waiting-area.jpg',
  '/images/providers/doctor-stethoscope.jpg',
];

// Optical/Optometrist gallery image set
const OPTICAL_SET = [
  '/images/providers/optical-storefront.jpg',
  '/images/providers/optical-exam-room.jpg',
  '/images/providers/optical-frames-display.jpg',
];

// Generic filler images (mix into any gallery to pad to 6-8)
const GENERIC_DENTAL = [
  '/images/general/main-avenue-dental.jpg',
  '/images/general/border-crossing-real.jpg',
  '/images/general/waiting-room.jpg',
  '/images/general/happy-patient.jpg',
  '/images/general/price-savings.jpg',
  '/images/general/patient-walking.jpg',
];

const GENERIC_PHARMACY = [
  '/images/general/nuevo-progreso-street.jpg',
  '/images/general/border-crossing-real.jpg',
  '/images/general/pharmacy-purchase.jpg',
  '/images/general/waiting-room.jpg',
];

const GENERIC_SPA = [
  '/images/general/nuevo-progreso-street.jpg',
  '/images/general/happy-patient.jpg',
];

/**
 * Mapping of provider slugs to gallery image arrays.
 * Each provider gets their assigned set + generic fillers to reach 6-8 images.
 */
const providerGalleryMap: Record<string, string[]> = {
  // --- DENTAL PROVIDERS ---
  // Set A: Modern flagship clinics
  'progreso-smile-dental-center': [...DENTAL_SET_A, GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'texas-dental-clinic': [...DENTAL_SET_A, GENERIC_DENTAL[2], GENERIC_DENTAL[3]],

  // Set B: Clean clinical
  'dental-artistry': [...DENTAL_SET_B, GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'magic-dental-clinic': [...DENTAL_SET_B, GENERIC_DENTAL[2], GENERIC_DENTAL[3]],

  // Set C: Implant specialists
  'salazar-dental-implant-center': [...DENTAL_SET_C, GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'dr-alejandro-benitez': [...DENTAL_SET_C, GENERIC_DENTAL[2], GENERIC_DENTAL[3]],
  'alpha-dental-implant-center': [...DENTAL_SET_C, GENERIC_DENTAL[0], GENERIC_DENTAL[3]],

  // Set D: Cosmetic/Family
  'creative-smile': [...DENTAL_SET_D, GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'guadalcazar-dental-clinic': [...DENTAL_SET_D, GENERIC_DENTAL[2], GENERIC_DENTAL[3]],

  // Set E: Budget-friendly
  'my-dentist-nuevo-progreso': [...DENTAL_SET_E, GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'pier-dental-clinic': [...DENTAL_SET_E, GENERIC_DENTAL[2], GENERIC_DENTAL[3]],
  'munoz-dental-care': [...DENTAL_SET_E, GENERIC_DENTAL[0], GENERIC_DENTAL[3]],

  // Set F: Premium/Tech
  'dental-rocio': [...DENTAL_SET_F, GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'smile-makeovers-stetic': [...DENTAL_SET_F, GENERIC_DENTAL[2], GENERIC_DENTAL[3]],
  'platinum-dental-care': [...DENTAL_SET_F, GENERIC_DENTAL[0], GENERIC_DENTAL[3]],

  // Remaining dental providers get mixed sets
  'pro-dental-clinic-mx': [...DENTAL_SET_A.slice(0, 2), ...DENTAL_SET_B.slice(2), GENERIC_DENTAL[0], GENERIC_DENTAL[1]],
  'rio-dental-office': [...DENTAL_SET_E.slice(0, 2), ...DENTAL_SET_D.slice(2), GENERIC_DENTAL[0], GENERIC_DENTAL[3]],
  'dr-juan-carlos-martinez': [...DENTAL_SET_C.slice(0, 2), ...DENTAL_SET_F.slice(2), GENERIC_DENTAL[1], GENERIC_DENTAL[2]],

  // --- PHARMACY PROVIDERS ---
  'farmacias-benavides': [...PHARMACY_CHAIN, ...GENERIC_PHARMACY],
  'panchos-pharmacy': [...PHARMACY_LOCAL, ...GENERIC_PHARMACY],
  'el-disco-pharmacy': [...PHARMACY_LOCAL, GENERIC_PHARMACY[0]],
  'jessicas-med-center': [...PHARMACY_MEDCENTER, ...GENERIC_PHARMACY],
  'linda-pharmacy': [...PHARMACY_BOUTIQUE, ...GENERIC_PHARMACY],
  'shammah-pharmacy': [...PHARMACY_BOUTIQUE, GENERIC_PHARMACY[0]],
  'angels-pharmacy': [...PHARMACY_LOCAL.slice(0, 2), PHARMACY_BOUTIQUE[2], GENERIC_PHARMACY[0]],
  'lm-pharmacy': [...PHARMACY_MEDCENTER.slice(0, 2), PHARMACY_LOCAL[2], GENERIC_PHARMACY[0]],
  'angies-pharmacy': [...PHARMACY_BOUTIQUE.slice(0, 2), PHARMACY_LOCAL[2], GENERIC_PHARMACY[0]],
  'el-ezaby-pharmacy': [...PHARMACY_CHAIN.slice(0, 2), PHARMACY_MEDCENTER[2], GENERIC_PHARMACY[0]],

  // --- SPA PROVIDERS ---
  'yomis-spa': [...SPA_SET_A, ...SPA_SET_B.slice(0, 1), ...GENERIC_SPA],
  'almitas-spa': [...SPA_SET_B, ...SPA_SET_A.slice(0, 1), ...GENERIC_SPA],
  'spa-las-flores': [...SPA_SET_A, ...SPA_SET_C.slice(0, 1), ...GENERIC_SPA],
  'erikas-salon-spa': [...SPA_SET_B, ...SPA_SET_C.slice(0, 1), ...GENERIC_SPA],
  'mariels-salon-spa': [...SPA_SET_B, ...SPA_SET_A.slice(0, 1), ...GENERIC_SPA],
  'elegance-boutique-spa': [...SPA_SET_A.slice(0, 2), ...SPA_SET_B.slice(0, 2), ...GENERIC_SPA],
  'spa-miranda': [...SPA_SET_B, ...SPA_SET_A.slice(0, 1), ...GENERIC_SPA],
  'slim-spa': [...SPA_SET_C, ...GENERIC_SPA],

  // --- COSMETIC SURGERY PROVIDERS ---
  'international-clinic-of-cosmetics': [...COSMETIC_SET, ...SPA_SET_A.slice(0, 1), ...GENERIC_DENTAL.slice(0, 2)],
  'integra-medical-center': [...COSMETIC_SET, ...DENTAL_SET_F.slice(0, 2), GENERIC_DENTAL[0]],
  'accualaser-plastic-surgery': [...COSMETIC_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'clinica-novo-corpo': [...COSMETIC_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'clinica-de-imagen': [...COSMETIC_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'dr-paulina-verastegui': [...COSMETIC_SET, ...SPA_SET_A, GENERIC_DENTAL[0]],
  'dr-victoria-navarro': [...COSMETIC_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'dr-estrada-medical-dental': [...COSMETIC_SET, ...DENTAL_SET_B.slice(0, 2), GENERIC_DENTAL[0]],
  'dra-katya-corona-aesthetic': [...COSMETIC_SET, ...SPA_SET_B.slice(0, 1), ...GENERIC_DENTAL.slice(0, 2)],

  // --- OPTOMETRIST / OPTICAL PROVIDERS ---
  'flores-optical': [...OPTICAL_SET, ...GENERIC_SPA.slice(0, 1), ...GENERIC_DENTAL.slice(0, 2)],
  'ramirez-optical': [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'bocanegra-opticas': [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'expert-vision-optical': [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'optical-jesslife': [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'riverside-farmacia-optica': [...OPTICAL_SET, ...GENERIC_PHARMACY.slice(0, 2)],
  'optica-almaguer': [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'oftalmologo-nuevo-progreso': [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)],

  // --- DOCTOR / GENERAL MEDICINE PROVIDERS ---
  'dr-jose-de-leon-cantu': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'centro-medico-emanuel': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(1, 3)],
  'anaya-medical-center': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'dr-pedro-hurtado-ortiz': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(2, 4)],
  'dra-cintya-gonzalez-suarez': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'consultorio-medico-juarez': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(1, 3)],
  'consultorio-del-mondragon': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'dr-eliezer-martinez-salinas': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(2, 4)],
  'dr-jose-eng-leo': [...DOCTOR_SET, ...GENERIC_DENTAL.slice(0, 2)],
  'farmacia-centro-medico': [...DOCTOR_SET, ...GENERIC_PHARMACY.slice(0, 2)],
};

/**
 * Get gallery images for a provider.
 * Falls back to generic images if provider has no assigned set.
 */
export function getProviderGallery(providerSlug: string, categorySlug?: string): string[] {
  if (providerGalleryMap[providerSlug]) {
    return providerGalleryMap[providerSlug];
  }

  // Fallback based on category
  if (categorySlug === 'pharmacies') {
    return [...PHARMACY_LOCAL, ...GENERIC_PHARMACY];
  }

  if (categorySlug === 'spas') {
    return [...SPA_SET_A, ...GENERIC_SPA];
  }

  if (categorySlug === 'cosmetic-surgery') {
    return [...COSMETIC_SET, ...GENERIC_DENTAL.slice(0, 2)];
  }

  if (categorySlug === 'optometrists') {
    return [...OPTICAL_SET, ...GENERIC_DENTAL.slice(0, 2)];
  }

  if (categorySlug === 'doctors') {
    return [...DOCTOR_SET, ...GENERIC_DENTAL.slice(0, 2)];
  }

  // Default dental fallback
  return [...DENTAL_SET_A.slice(0, 2), ...GENERIC_DENTAL.slice(0, 2)];
}
