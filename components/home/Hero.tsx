'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/search/SearchBar';
import { useI18n } from '@/lib/i18n';

const searchSuggestions = [
  'dental implant',
  'Ozempic',
  'teeth whitening',
  'deep tissue massage',
  'dental crown',
  'Viagra',
  'root canal',
  'Botox',
  'eye exam',
  'dental cleaning',
];

export default function Hero() {
  const { dict } = useI18n();
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % searchSuggestions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const pills = [
    dict.hero.pillSavings,
    dict.hero.pillLocked,
    dict.hero.pillProviders,
    dict.hero.pillWalk,
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* ========== MOBILE HERO ========== */}
      <div className="md:hidden bg-brand-navy min-h-screen flex flex-col">
        {/* Hero Image */}
        <div className="px-3 pt-3">
          <motion.div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ height: '45vh' }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/hero-bg.jpg"
              alt="Nuevo Progreso main street at golden hour — clinics, pharmacies, and storefronts"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-navy/60 to-transparent" />
          </motion.div>
        </div>

        {/* Info Card */}
        <div className="px-5 pt-6 pb-28 flex-1 flex flex-col">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
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
          </motion.div>

          <motion.p
            className="font-display text-lg font-semibold text-amber mt-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {dict.hero.tagline}
          </motion.p>

          <motion.p
            className="text-blue-100/80 text-sm leading-relaxed mt-3 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {dict.hero.subtitle}
          </motion.p>

          <motion.div
            className="mt-5 relative z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <SearchBar variant="compact" placeholder={dict.hero.trySearching + ' "dental implant"'} />
          </motion.div>

          <motion.div
            className="flex gap-3 mt-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              href="/dentists"
              className="flex-1 text-center px-5 py-3 rounded-full border-2 border-amber text-amber font-semibold text-sm hover:bg-amber hover:text-brand-navy transition-all duration-300 hover:shadow-lg hover:shadow-amber/20"
            >
              {dict.hero.browseServices}
            </Link>
            <Link
              href="/quote"
              className="flex-1 text-center px-5 py-3 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300"
            >
              {dict.hero.getQuote}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ========== DESKTOP HERO ========== */}
      <div className="hidden md:flex relative w-full min-h-[92vh] flex-col items-center justify-center">
        {/* Background with slow zoom animation — minimal overlay to show the image */}
        <motion.div
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Lighter overlay — lets the image show through more */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/25 to-brand-navy/70 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <motion.h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-5 tracking-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {dict.hero.taglineDesktop}
          </motion.h1>

          <motion.p
            className="font-sans text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-3 drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {dict.hero.subtitleDesktop}
          </motion.p>

          {/* Value prop pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {pills.map((pill) => (
              <span
                key={pill}
                className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20"
              >
                {pill}
              </span>
            ))}
          </motion.div>

          {/* Rotating search suggestion */}
          <motion.div
            className="mb-6 text-sm text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <span>{dict.hero.trySearching} </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentSuggestion}
                className="text-amber font-medium"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                &ldquo;{searchSuggestions[currentSuggestion]}&rdquo;
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mb-8 relative z-20 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SearchBar variant="hero" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              href="/dentists"
              className="px-10 py-3.5 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-navy hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg text-base"
            >
              {dict.hero.browseServices}
            </Link>
            <Link
              href="/quote"
              className="px-10 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-base"
            >
              {dict.hero.getFreeQuote}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-white/30"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
