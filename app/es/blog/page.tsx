import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { bilingualAlternates } from '@/lib/hreflang';

export const metadata: Metadata = {
  title: 'Blog — Consejos y Guías de Salud en Nuevo Progreso | ClearCross',
  description:
    'Artículos sobre cuidado dental, farmacias, cirugía estética y más en Nuevo Progreso, México. Compare precios y ahorre.',
  openGraph: {
    title: 'Blog — Consejos y Guías de Salud en Nuevo Progreso | ClearCross',
    description:
      'Artículos sobre cuidado dental, farmacias, cirugía estética y más en Nuevo Progreso, México.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: bilingualAlternates('/blog', 'es'),
};

const CATEGORY_LABELS_ES: Record<string, string> = {
  dental: 'Dental',
  pharmacy: 'Farmacia',
  cosmetic: 'Estética',
  guides: 'Guías',
  costs: 'Costos',
  cost: 'Costos',
  travel: 'Viaje',
  safety: 'Seguridad',
  'weight-loss': 'Pérdida de peso',
  'medical-tourism': 'Turismo médico',
};

/*
 * ⛔ THE LIST IS DERIVED. THE TRANSLATIONS ARE NOT. THAT SPLIT IS THE POINT.
 *
 * This was a hand-written array of five posts. There are fourteen, so nine
 * were invisible in Spanish -- their pages existed and nothing linked to
 * them -- and every new post stayed invisible until somebody remembered to
 * edit this file by hand. Deriving the list from getAllPosts() makes that
 * impossible.
 *
 * ⛔ A TITLE CANNOT BE DERIVED, so ES_COPY stays hand-written per slug. A
 * post with no entry falls back to its English title and excerpt rather
 * than being dropped: an English title in a Spanish list is honest and the
 * reader can still reach the article, and the post page already carries the
 * banner saying the body is in English. Silently omitting it is the exact
 * failure this change exists to fix.
 */
const ES_COPY: Record<string, { title: string; excerpt: string }> = {
  'buying-ozempic-nuevo-progreso-mexico': {
    title: 'Comprando Ozempic en Nuevo Progreso: Guía de Precios 2026',
    excerpt: 'El Ozempic cuesta $900–$1,400/mes en EE.UU. En Nuevo Progreso, el mismo medicamento cuesta $150–$230. Todo lo que necesita saber.',
  },
  'save-money-medical-care-nuevo-progreso': {
    title: 'Ahorre Dinero en Cuidado Médico en Nuevo Progreso — Guía Completa 2026',
    excerpt: 'Los estadounidenses ahorran 80–500% en cuidado médico en Nuevo Progreso. Vea comparaciones de precios reales.',
  },
  'how-much-does-a-dental-crown-cost-in-nuevo-progreso': {
    title: '¿Cuánto Cuesta una Corona Dental en Nuevo Progreso México?',
    excerpt: 'Descubra el costo real de coronas dentales en Nuevo Progreso y cuánto puede ahorrar comparado con precios en EE.UU.',
  },
  'dental-implants-progreso-mexico-cost': {
    title: 'Implantes Dentales en Progreso México — Guía de Costos',
    excerpt: 'Desglose completo de los costos de implantes dentales en Nuevo Progreso frente a EE.UU., incluyendo arcada completa.',
  },
  'pharmacies-nuevo-progreso': {
    title: 'Farmacias en Nuevo Progreso: Qué Comprar y Cuánto Cuesta',
    excerpt: 'Guía de las farmacias mexicanas en Nuevo Progreso: qué medicamentos son más económicos y qué puede llevar de regreso a EE.UU.',
  },
  'dental-work-nuevo-progreso-mexico-2026-price-guide': {
    title: 'Trabajo Dental en Nuevo Progreso: Guía Completa de Precios 2026',
    excerpt: 'Compare precios dentales de 2026 en Nuevo Progreso frente a EE.UU. Coronas desde $180, implantes desde $650, endodoncias desde $200.',
  },
  'best-dentists-nuevo-progreso-mexico': {
    title: 'Mejores Dentistas en Nuevo Progreso México: Comparados',
    excerpt: 'Guía para elegir dentista en Nuevo Progreso: qué credenciales pedir, qué preguntas hacer y cómo reconocer una clínica seria.',
  },
  'is-it-safe-dentist-mexico-border': {
    title: '¿Es Seguro Ir al Dentista en México? Guía de un Pueblo Fronterizo',
    excerpt: 'Guía de seguridad para el turismo dental en Nuevo Progreso: el cruce, qué esperar de una clínica y qué preguntar antes de empezar.',
  },
  'crossing-border-medical-care-progreso': {
    title: 'Guía Completa para Cruzar la Frontera por Atención Médica en Progreso',
    excerpt: 'Guía paso a paso para cruzar a Nuevo Progreso: qué documentos llevar, cómo funciona la aduana y consejos para que el viaje salga bien.',
  },
  'botox-cosmetic-surgery-nuevo-progreso': {
    title: 'Botox y Cirugía Estética en Nuevo Progreso: Precios y Consejos',
    excerpt: 'Guía de procedimientos estéticos en Nuevo Progreso: bótox, rellenos dérmicos, carillas y otros tratamientos, con precios publicados.',
  },
  'parking-and-walking-across-the-progreso-bridge': {
    title: 'Estacionamiento en Progreso y Cruce a Pie: Lo Que Realmente Cuesta',
    excerpt: 'Dónde dejar el carro en Progreso, Texas, cuánto cobra el puente en cada dirección, y por qué tantos sitios publican el horario equivocado. Traiga monedas de veinticinco centavos.',
  },
  'what-you-can-bring-back-from-nuevo-progreso': {
    title: 'Qué Puede Traer Legalmente de Nuevo Progreso',
    excerpt: 'La exención de $800, la regla de los 90 días para medicamentos, qué se debe declarar y qué se decomisa. Las cifras reales de CBP y la FDA, con sus fuentes.',
  },
  'first-time-in-nuevo-progreso-checklist': {
    title: 'Primera Vez en Nuevo Progreso: La Lista Antes de Cruzar',
    excerpt: 'Qué llevar, qué dejar arreglado, y las preguntas que vale la pena hacerle a una clínica antes de que empiece cualquier trabajo.',
  },
  'progreso-border-wait-times-when-to-cross': {
    title: 'Tiempos de Espera en el Puente de Progreso: Cuándo Cruzar',
    excerpt: 'La espera que importa es la de regreso. De dónde sale la cifra en vivo de CBP, qué le dice y qué no, y por qué “el promedio” no sirve de nada.',
  },
};

// ⛔ timeZone UTC. An ISO date is parsed as UTC midnight, so formatting it in
// a timezone west of UTC renders the previous day -- every date on this page
// would be one day early for every reader in the Rio Grande Valley.
const esDate = (iso: string) =>
  // ⛔ 'es', not 'es-MX'. test/bilingual.mjs bans es-MX across the Spanish tree
  // because this audience is Spanish-speaking in the Rio Grande Valley, not in
  // Mexico -- and the guard caught this line the day it was written. The neutral
  // tag renders the same date ("7 sept 2026" vs "7 sep 2026").
  new Date(iso).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

// "8 min read" -> "8 min". reading-time emits English; the number is the useful part.
const esReadTime = (t: string) => t.replace(/s*reads*$/i, '').trim();

export default async function EsBlogPage() {
  const posts = await getAllPosts();

  // Every post appears. Spanish copy where we have written it, the English
  // title where we have not -- never a gap in the list.
  const BLOG_POSTS_ES = posts.map((p) => {
    const es = ES_COPY[p.slug];
    return {
      slug: p.slug,
      title: es?.title ?? p.title,
      excerpt: es?.excerpt ?? p.excerpt,
      date: esDate(p.date),
      readTime: esReadTime(p.readingTime),
      tags: p.tags,
      image: p.coverImage,
    };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-brand-blue text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            Blog de ClearCross
          </h1>
          <p className="text-lg text-blue-100">
            Consejos, guías y análisis para ayudarle a tomar decisiones informadas sobre su cuidado médico.
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS_ES.map((post) => (
            <Link
              key={post.slug}
              href={`/es/blog/${post.slug}`}
              className="group flex flex-col bg-white border border-neutral-200 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Post Image */}
              {post.image && (
                <div className="relative w-full h-44 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 bg-brand-green/10 text-brand-green text-xs font-semibold rounded-full"
                    >
                      {CATEGORY_LABELS_ES[tag] || tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-4">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue group-hover:text-brand-navy transition-colors">
                  Leer artículo →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
