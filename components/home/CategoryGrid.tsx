import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  providers: number;
}

const categories: Category[] = [
  {
    id: 'dentists',
    name: 'Dental Work',
    slug: 'dentists',
    image: '/images/categories/dental.jpg',
    providers: 18,
  },
  {
    id: 'pharmacies',
    name: 'Pharmacies',
    slug: 'pharmacies',
    image: '/images/categories/pharmacies.jpg',
    providers: 10,
  },
  {
    id: 'spas',
    name: 'Spa & Wellness',
    slug: 'spas',
    image: '/images/categories/spa.jpg',
    providers: 8,
  },
  {
    id: 'doctors',
    name: 'Doctors',
    slug: 'doctors',
    image: '/images/providers/doctor-consultation-room.jpg',
    providers: 10,
  },
  {
    id: 'optometrists',
    name: 'Eye Care',
    slug: 'optometrists',
    image: '/images/categories/eye-care.jpg',
    providers: 8,
  },
  {
    id: 'cosmetic-surgery',
    name: 'Cosmetic Surgery',
    slug: 'cosmetic-surgery',
    image: '/images/categories/cosmetic-surgery.jpg',
    providers: 9,
  },
  {
    id: 'liquor',
    name: 'Liquor & Spirits',
    slug: 'liquor',
    image: '/images/categories/wellness.jpg',
    providers: 0,
  },
  {
    id: 'vets',
    name: 'Veterinary',
    slug: 'vets',
    image: '/images/categories/veterinary.jpg',
    providers: 0,
  },
];

export default function CategoryGrid() {
  return (
    <section id="categories" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What are you looking for?
          </h2>
          <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
            Browse our extensive network of verified providers across multiple categories.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/${category.slug}`}>
              <div className="group h-full bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                {/* Category Image */}
                <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Text Content */}
                <div className="p-4 text-center">
                  <h3 className="font-sans font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                    {category.name}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-gray-500">
                    {category.providers > 0
                      ? `${category.providers} providers`
                      : 'Coming soon'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
