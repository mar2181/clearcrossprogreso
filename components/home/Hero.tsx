'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* ========== MOBILE HERO (matches reference template) ========== */}
      <div className="md:hidden bg-brand-navy min-h-screen flex flex-col">
        {/* Hero Image — ~45% of viewport, rounded, with small gaps */}
        <div className="px-3 pt-3">
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '45vh' }}>
            <Image
              src="/images/general/main-avenue-dental.jpg"
              alt="Nuevo Progreso main avenue — dental clinics and pharmacies"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Subtle bottom gradient for smooth transition */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-navy/60 to-transparent" />
          </div>
        </div>

        {/* Info Card */}
        <div className="px-5 pt-6 pb-28 flex-1 flex flex-col">
          {/* Logo + Business Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/clearcross-logo.png"
              alt="ClearCross Progreso logo"
              width={56}
              height={56}
              priority
              className="h-14 w-auto drop-shadow-lg"
            />
            <h1 className="font-display text-3xl font-bold text-white leading-tight">
              ClearCross<br />Progreso
            </h1>
          </div>

          {/* Tagline — accent color like reference */}
          <p className="font-display text-lg font-semibold text-amber mt-1.5">
            Know the Price Before You Cross
          </p>

          {/* Description */}
          <p className="text-blue-100/80 text-sm leading-relaxed mt-3 max-w-xs">
            Compare prices for dental work, prescriptions, spa treatments and more in Nuevo Progreso, Mexico. Get firm quotes before you leave the US.
          </p>

          {/* CTA Buttons — outlined style like reference */}
          <div className="flex gap-3 mt-6">
            <Link
              href="/dentists"
              className="flex-1 text-center px-5 py-3 rounded-full border-2 border-amber text-amber font-semibold text-sm hover:bg-amber hover:text-brand-navy transition-colors"
            >
              Browse Services
            </Link>
            <Link
              href="/quote"
              className="flex-1 text-center px-5 py-3 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP HERO (original fullscreen style) ========== */}
      <div className="hidden md:flex relative w-full min-h-screen flex-col items-center justify-center">
        {/* Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy/70 via-brand-navy/50 to-brand-navy/80" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            Know the price before you cross.
          </h1>
          <p className="font-display text-xl sm:text-2xl text-blue-100 mb-6">
            Conoce el precio antes de cruzar.
          </p>
          <p className="font-sans text-base sm:text-lg text-blue-50 max-w-2xl mx-auto mb-12">
            Compare prices for dental work, prescriptions, spa treatments and more in Nuevo Progreso, Mexico. Get firm quotes before you leave the US.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a procedure or provider..."
                  className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-brand-blue text-white hover:bg-brand-navy transition-colors flex items-center gap-2"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dentists"
              className="px-8 py-3 bg-brand-blue text-white font-sans font-semibold rounded-lg hover:bg-brand-navy transition-colors shadow-lg"
            >
              Find a Dentist
            </Link>
            <Link
              href="/quote"
              className="px-8 py-3 bg-brand-green text-white font-sans font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Compare Prices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
