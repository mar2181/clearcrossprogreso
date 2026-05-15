'use client';

import Link from 'next/link';
import {
  FileCheck,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface TrustSignal {
  icon: React.ReactNode;
  label: string;
  description: string;
  detail: string;
  link: string;
  color: string;
  bgColor: string;
}

export default function TrustBar() {
  const { dict } = useI18n();
  const d = dict.trustBar;

  const trustSignals: TrustSignal[] = [
    {
      icon: <FileCheck className="w-7 h-7" />,
      label: d.writtenQuotesTitle,
      description: d.writtenQuotesDesc,
      detail: d.writtenQuotesDetail,
      link: '/how-it-works',
      color: 'text-brand-blue',
      bgColor: 'bg-brand-blue/10',
    },
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      label: d.credentialsTitle,
      description: d.credentialsDesc,
      detail: d.credentialsDetail,
      link: '/safety',
      color: 'text-brand-green',
      bgColor: 'bg-brand-green/10',
    },
    {
      icon: <Star className="w-7 h-7" />,
      label: d.reviewsTitle,
      description: d.reviewsDesc,
      detail: d.reviewsDetail,
      link: '/how-it-works',
      color: 'text-amber',
      bgColor: 'bg-amber/10',
    },
    {
      icon: <Clock className="w-7 h-7" />,
      label: d.quotesTitle,
      description: d.quotesDesc,
      detail: d.quotesDetail,
      link: '/quote',
      color: 'text-brand-navy',
      bgColor: 'bg-brand-navy/10',
    },
  ];

  return (
    <section className="w-full py-14 sm:py-18 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-blue mb-2">
            {d.sectionLabel}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark">
            {d.headline}
          </h2>
        </div>

        {/* Trust cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustSignals.map((signal, index) => (
            <Link
              key={index}
              href={signal.link}
              className="group relative bg-neutral-light rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-neutral-200/60"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${signal.bgColor} flex items-center justify-center mb-4 ${signal.color} group-hover:scale-110 transition-transform duration-300`}>
                {signal.icon}
              </div>

              {/* Label */}
              <h3 className="font-display font-bold text-neutral-dark text-base mb-1">
                {signal.label}
              </h3>

              {/* Short description */}
              <p className="font-sans text-sm font-medium text-neutral-mid mb-3">
                {signal.description}
              </p>

              {/* Detail text */}
              <p className="text-xs text-neutral-mid/70 leading-relaxed mb-4">
                {signal.detail}
              </p>

              {/* Learn more link */}
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${signal.color} group-hover:gap-2 transition-all`}>
                {d.learnMore}
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
