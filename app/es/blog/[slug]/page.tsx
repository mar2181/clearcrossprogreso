import { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import BlogContent from '@/components/blog/BlogContent';
import Link from 'next/link';
import { Globe } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

// Spanish blog slugs map to English slugs for now
const SPANISH_BLOG_SLUGS = [
  'buying-ozempic-nuevo-progreso-mexico',
  'is-it-safe-dentist-mexico-border',
  'pharmacies-nuevo-progreso',
  'best-dentists-nuevo-progreso-mexico',
  'botox-cosmetic-surgery-nuevo-progreso',
  'how-much-does-a-dental-crown-cost-in-nuevo-progreso',
  'dental-implants-progreso-mexico-cost',
  'crossing-border-medical-care-progreso',
  'dental-work-nuevo-progreso-mexico-2026-price-guide',
  'save-money-medical-care-nuevo-progreso',
];

export async function generateStaticParams() {
  return SPANISH_BLOG_SLUGS.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Use English post for metadata fallback
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Artículo No Encontrado | ClearCross' };
  }

  // Spanish titles for known articles
  const spanishTitles: Record<string, string> = {
    'buying-ozempic-nuevo-progreso-mexico': 'Comprando Ozempic en Nuevo Progreso — Guía de Precios 2026',
    'is-it-safe-dentist-mexico-border': '¿Es Seguro Ir al Dentista en México? Guía de Seguridad',
    'pharmacies-nuevo-progreso': 'Farmacias en Nuevo Progreso — Guía de Precios y Medicamentos',
    'best-dentists-nuevo-progreso-mexico': 'Mejores Dentistas en Nuevo Progreso México 2026',
    'botox-cosmetic-surgery-nuevo-progreso': 'Botox y Cirugía Estética en Nuevo Progreso — Precios',
    'how-much-does-a-dental-crown-cost-in-nuevo-progreso': '¿Cuánto Cuesta una Corona Dental en Nuevo Progreso?',
    'dental-implants-progreso-mexico-cost': 'Implantes Dentales en Progreso México — Guía de Costos',
    'crossing-border-medical-care-progreso': 'Cruzando la Frontera para Cuidado Médico en Progreso',
    'dental-work-nuevo-progreso-mexico-2026-price-guide': 'Trabajo Dental en Nuevo Progreso — Guía de Precios 2026',
    'save-money-medical-care-nuevo-progreso': 'Ahorre Dinero en Cuidado Médico en Nuevo Progreso',
  };

  const spanishTitle = spanishTitles[slug] || post.title;
  const spanishDescription = post.excerpt; // Would need Spanish translation

  return {
    title: `${spanishTitle} | ClearCross Progreso`,
    description: spanishDescription,
    openGraph: {
      title: spanishTitle,
      description: spanishDescription,
      url: `https://clearcrossprogreso.com/es/blog/${slug}`,
      type: 'article',
      locale: 'es_MX',
      publishedTime: post.date,
    },
    alternates: {
      canonical: `https://clearcrossprogreso.com/es/blog/${slug}`,
      languages: {
        'en-US': `https://clearcrossprogreso.com/blog/${slug}`,
        'es-MX': `https://clearcrossprogreso.com/es/blog/${slug}`,
      },
    },
  };
}

export default async function EsBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Artículo No Encontrado
          </h1>
          <Link href="/es/blog" className="text-brand-blue font-semibold hover:text-brand-navy">
            Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  const posts = await getAllPosts();
  const relatedPosts = posts
    .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Este artículo está disponible en inglés
              </p>
              <p className="text-xs text-amber-700 mb-2">
                El contenido de este artículo está en inglés. Vea la versión original para más detalles.
              </p>
              <Link
                href={`/blog/${slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy underline"
              >
                Leer en inglés →
              </Link>
            </div>
          </div>
        </div>

        {/* Blog content (English content) */}
        <BlogContent post={post} relatedPosts={relatedPosts} />
      </div>
    </div>
  );
}
