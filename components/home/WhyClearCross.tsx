'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, DollarSign, FileText, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const advantages = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Save 40–70% on Every Visit',
    description:
      'The same dental implant that costs $3,000–$5,000 in the US is $800–$1,500 in Nuevo Progreso — same materials, same quality, a fraction of the price.',
    color: 'text-brand-green',
    bg: 'bg-brand-green/10',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'You Get the Price Upfront',
    description:
      'No insurance games. No surprise bills weeks later. Every provider gives you a written, itemized quote before you commit — and that price is locked in.',
    color: 'text-brand-blue',
    bg: 'bg-brand-blue/10',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Verified, Licensed Providers',
    description:
      'Every provider on ClearCross is verified with a valid Cedula Profesional (Mexico\'s medical license). We check credentials, clinic conditions, and sterilization protocols.',
    color: 'text-amber',
    bg: 'bg-amber/10',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: '5 Minutes From the US Border',
    description:
      'Nuevo Progreso is a walkable border town in Tamaulipas, Mexico — just across the bridge from Progreso, TX. Park your car on the US side and walk across.',
    color: 'text-brand-navy',
    bg: 'bg-brand-navy/10',
  },
];

export default function WhyClearCross() {
  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Two-column layout: story on left, advantages on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: The Story */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-blue mb-3">
              Why ClearCross Exists
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-neutral-dark leading-tight mb-6">
              Americans are paying too much for healthcare.{' '}
              <span className="text-brand-blue">There&apos;s a better option 5 minutes south.</span>
            </h2>

            <div className="space-y-4 text-neutral-mid leading-relaxed">
              <p>
                Every year, thousands of Americans from Texas and across the US walk
                across the international bridge to Nuevo Progreso, Mexico — a safe,
                walkable border town where dental work, prescriptions, eye care, and
                spa treatments cost a fraction of US prices.
              </p>
              <p>
                The problem? Until now, there was no way to compare prices or verify
                providers before you crossed. You had to walk door-to-door, haggle,
                and hope for the best.
              </p>
              <p className="font-semibold text-neutral-dark">
                ClearCross changes that. We give you verified prices, real reviews,
                and written quotes — before you leave your house.
              </p>
            </div>

            {/* Image accent */}
            <div className="mt-8 relative rounded-2xl overflow-hidden aspect-[16/9]">
              <Image
                src="/images/general/main-avenue-dental.jpg"
                alt="Main avenue in Nuevo Progreso — dental clinics, pharmacies, and shops"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium drop-shadow-lg">
                  Main avenue in Nuevo Progreso — walkable, safe, and lined with clinics
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Advantage Cards */}
          <div className="space-y-5">
            <motion.p
              className="text-xs font-bold tracking-[0.2em] uppercase text-brand-green mb-2 lg:mt-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Your Advantages
            </motion.p>

            {advantages.map((adv, i) => (
              <motion.div
                key={i}
                className="group bg-neutral-50 border border-neutral-200/60 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${adv.bg} flex items-center justify-center flex-shrink-0 ${adv.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    {adv.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-dark text-lg mb-1">
                      {adv.title}
                    </h3>
                    <p className="text-sm text-neutral-mid leading-relaxed">
                      {adv.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:gap-3 transition-all duration-200"
              >
                See how it works
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
