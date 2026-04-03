'use client';

import { Star, Quote, MapPin } from 'lucide-react';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { useI18n } from '@/lib/i18n';

interface Testimonial {
  name: string;
  location: string;
  procedure: string;
  savings: string;
  rating: number;
  text: string;
  initial: string;
  color: string;
}

export default function Testimonials() {
  const { dict } = useI18n();
  const d = dict.testimonials;

  const testimonials: Testimonial[] = [
    {
      name: d.t1Name,
      location: d.t1Location,
      procedure: d.t1Procedure,
      savings: d.t1Savings,
      rating: 5,
      text: d.t1Text,
      initial: d.t1Name.charAt(0),
      color: 'bg-brand-blue',
    },
    {
      name: d.t2Name,
      location: d.t2Location,
      procedure: d.t2Procedure,
      savings: d.t2Savings,
      rating: 5,
      text: d.t2Text,
      initial: d.t2Name.charAt(0),
      color: 'bg-brand-green',
    },
    {
      name: d.t3Name,
      location: d.t3Location,
      procedure: d.t3Procedure,
      savings: d.t3Savings,
      rating: 5,
      text: d.t3Text,
      initial: d.t3Name.charAt(0),
      color: 'bg-amber',
    },
    {
      name: d.t4Name,
      location: d.t4Location,
      procedure: d.t4Procedure,
      savings: d.t4Savings,
      rating: 5,
      text: d.t4Text,
      initial: d.t4Name.charAt(0),
      color: 'bg-brand-navy',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <AnimateIn>
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-green mb-2">
              {d.sectionLabel}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-4">
              {d.headline}
            </h2>
            <p className="font-sans text-neutral-mid text-lg max-w-2xl mx-auto">
              {d.subtitle}
            </p>
          </div>
        </AnimateIn>

        {/* Testimonial cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.1}>
          {testimonials.map((t, idx) => (
            <StaggerItem key={idx}>
            <div
              key={idx}
              className="relative bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-neutral-200/60 hover:shadow-md transition-shadow duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-neutral-100" />

              {/* Header: Avatar + Info */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full ${t.color} text-white flex items-center justify-center font-display font-bold text-lg flex-shrink-0`}>
                  {t.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-neutral-dark text-base">
                    {t.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-mid">
                    <MapPin className="w-3 h-3" />
                    {t.location}
                  </div>
                </div>
                {/* Savings badge */}
                <span className="inline-flex items-center px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-bold rounded-full flex-shrink-0">
                  {t.savings}
                </span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < t.rating
                        ? 'fill-amber text-amber'
                        : 'text-neutral-200 fill-neutral-200'
                    }
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-neutral-mid leading-relaxed mb-4 relative z-10">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Procedure tag */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">
                  {d.procedure}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-full">
                  {t.procedure}
                </span>
              </div>
            </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Disclaimer */}
        <p className="text-center text-xs text-neutral-400 mt-8 max-w-2xl mx-auto">
          {d.disclaimer}
        </p>
      </div>
    </section>
  );
}
