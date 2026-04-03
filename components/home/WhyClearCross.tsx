'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, DollarSign, FileText, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function WhyClearCross() {
  const { dict } = useI18n();
  const d = dict.whyClearCross;

  const advantages = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: d.adv1Title,
      description: d.adv1Desc,
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: d.adv2Title,
      description: d.adv2Desc,
      color: 'text-brand-blue',
      bg: 'bg-brand-blue/10',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: d.adv3Title,
      description: d.adv3Desc,
      color: 'text-amber',
      bg: 'bg-amber/10',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: d.adv4Title,
      description: d.adv4Desc,
      color: 'text-brand-navy',
      bg: 'bg-brand-navy/10',
    },
  ];

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
              {d.sectionLabel}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-neutral-dark leading-tight mb-6">
              {d.headline}{' '}
              <span className="text-brand-blue">{d.headlineAccent}</span>
            </h2>

            <div className="space-y-4 text-neutral-mid leading-relaxed">
              <p>{d.paragraph1}</p>
              <p>{d.paragraph2}</p>
              <p className="font-semibold text-neutral-dark">{d.paragraph3}</p>
            </div>

            {/* Image accent */}
            <div className="mt-8 relative rounded-2xl overflow-hidden aspect-[16/9]">
              <Image
                src="/images/general/main-avenue-dental.jpg"
                alt={d.imageCaption}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium drop-shadow-lg">
                  {d.imageCaption}
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
              {d.yourAdvantages}
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
                {d.seeHowItWorks}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
