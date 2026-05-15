import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

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
  alternates: {
    canonical: 'https://clearcrossprogreso.com/es/blog',
    languages: {
      'en-US': 'https://clearcrossprogreso.com/blog',
      'es-MX': 'https://clearcrossprogreso.com/es/blog',
    },
  },
};

const CATEGORY_LABELS_ES: Record<string, string> = {
  dental: 'Dental',
  pharmacy: 'Farmacia',
  cosmetic: 'Estética',
  guides: 'Guías',
  costs: 'Costos',
};

const BLOG_POSTS_ES = [
  {
    slug: 'buying-ozempic-nuevo-progreso-mexico',
    title: 'Comprando Ozempic en Nuevo Progreso: Guía de Precios 2026',
    excerpt: 'El Ozempic cuesta $900–$1,400/mes en EE.UU. En Nuevo Progreso, el mismo medicamento cuesta $150–$230. Todo lo que necesita saber.',
    date: 'Mar 31, 2026',
    readTime: '8 min',
    tags: ['farmacia', 'costos'],
    image: '/images/blog/ozempic-hero.jpg',
  },
  {
    slug: 'save-money-medical-care-nuevo-progreso',
    title: 'Ahorre Dinero en Cuidado Médico en Nuevo Progreso — Guía Completa 2026',
    excerpt: 'Los estadounidenses ahorran 80–500% en cuidado médico en Nuevo Progreso. Vea comparaciones de precios reales.',
    date: 'Mar 31, 2026',
    readTime: '10 min',
    tags: ['costos', 'guías'],
    image: '/images/blog/medical-cost-savings-hero.jpg',
  },
  {
    slug: 'how-much-does-a-dental-crown-cost-in-nuevo-progreso',
    title: '¿Cuánto Cuesta una Corona Dental en Nuevo Progreso México?',
    excerpt: 'Descubra el costo real de coronas dentales en Nuevo Progreso y cuánto puede ahorrar comparado con precios en EE.UU.',
    date: 'Ene 14, 2025',
    readTime: '5 min',
    tags: ['dental', 'costos'],
    image: '/images/blog/dental-crown-cost.jpg',
  },
  {
    slug: 'dental-implants-progreso-mexico-cost',
    title: 'Implantes Dentales en Progreso México — Guía de Costos',
    excerpt: 'Implantes dentales desde $790 en Nuevo Progreso vs $3,500+ en EE.UU. Compare precios de 15+ dentistas verificados.',
    date: 'Mar 2026',
    readTime: '7 min',
    tags: ['dental', 'costos'],
    image: '/images/blog/dental-crown-cost.jpg',
  },
  {
    slug: 'pharmacies-nuevo-progreso',
    title: 'Farmacias en Nuevo Progreso — Guía de Precios y Medicamentos',
    excerpt: 'Guía completa de farmacias en Nuevo Progreso. Precios de Ozempic, insulina, antibióticos y más.',
    date: 'Mar 2026',
    readTime: '6 min',
    tags: ['farmacia', 'guías'],
    image: '/images/blog/ozempic-hero.jpg',
  },
];

export default async function EsBlogPage() {

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
