'use client';

import { Star, Quote, MapPin } from 'lucide-react';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';

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

const testimonials: Testimonial[] = [
  {
    name: 'Robert M.',
    location: 'San Antonio, TX',
    procedure: 'Dental Implant',
    savings: 'Saved $3,200',
    rating: 5,
    text: 'I was quoted $5,500 for an implant in San Antonio. Found a verified dentist on ClearCross for $1,050. Same quality materials, the dentist had 20+ years of experience, and the price was locked in before I crossed. Incredible.',
    initial: 'R',
    color: 'bg-brand-blue',
  },
  {
    name: 'Linda & Dave K.',
    location: 'McAllen, TX',
    procedure: 'Prescriptions',
    savings: 'Saving $400/month',
    rating: 5,
    text: 'We drive down once a month for our medications. Ozempic, blood pressure meds, and insulin — all a fraction of what we pay in the US. ClearCross made it easy to compare pharmacy prices before we went.',
    initial: 'L',
    color: 'bg-brand-green',
  },
  {
    name: 'Maria G.',
    location: 'Houston, TX',
    procedure: 'Full Dental Restoration',
    savings: 'Saved $12,000+',
    rating: 5,
    text: 'I needed crowns on 8 teeth. US quotes ranged from $16,000-$20,000. Through ClearCross I found a dentist with 29 years experience who did everything for $5,800. I was terrified at first but the experience was completely professional.',
    initial: 'M',
    color: 'bg-amber',
  },
  {
    name: 'James T.',
    location: 'Corpus Christi, TX',
    procedure: 'Dental Cleaning + Crown',
    savings: 'Saved $1,800',
    rating: 5,
    text: 'First time crossing for dental work. The safety guide on ClearCross answered all my questions. Parked in Progreso, walked across, and was in the chair within 15 minutes. Already have my next appointment scheduled.',
    initial: 'J',
    color: 'bg-brand-navy',
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <AnimateIn>
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-green mb-2">
              Real Stories, Real Savings
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-4">
              What Our Users Say
            </h2>
            <p className="font-sans text-neutral-mid text-lg max-w-2xl mx-auto">
              Thousands of Americans trust ClearCross to find affordable, quality healthcare in Nuevo Progreso.
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
                  Procedure:
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-full">
                  {t.procedure}
                </span>
              </div>
            </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
