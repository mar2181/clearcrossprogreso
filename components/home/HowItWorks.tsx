'use client';

import { Search, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { useI18n } from '@/lib/i18n';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}

export default function HowItWorks() {
  const { dict } = useI18n();
  const d = dict.howItWorks;

  const steps: Step[] = [
    {
      number: 1,
      title: d.step1Title,
      description: d.step1Desc,
      detail: d.step1Detail,
      icon: <Search className="w-8 h-8" />,
    },
    {
      number: 2,
      title: d.step2Title,
      description: d.step2Desc,
      detail: d.step2Detail,
      icon: <BarChart3 className="w-8 h-8" />,
    },
    {
      number: 3,
      title: d.step3Title,
      description: d.step3Desc,
      detail: d.step3Detail,
      icon: <ShieldCheck className="w-8 h-8" />,
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <AnimateIn>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-blue mb-2">
              {d.sectionLabel}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {d.headline}
            </h2>
            <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
              {d.subtitle}
            </p>
          </div>
        </AnimateIn>

        {/* Steps */}
        <StaggerContainer className="relative" stagger={0.15}>
          <div className="grid grid-cols-1 gap-8 sm:gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <StaggerItem key={step.number}>
                <div className="relative flex flex-col items-center group">
                  {/* Connecting Line (Desktop Only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-blue/30 to-brand-green/30" />
                  )}

                  {/* Step Card */}
                  <div className="relative z-10 flex flex-col items-center text-center w-full p-6 bg-white rounded-xl border border-neutral-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    {/* Number + Icon */}
                    <div className="relative mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                        {step.icon}
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center font-display font-bold text-xs shadow-md">
                        {step.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-gray-600 text-sm leading-relaxed mb-1">
                      {step.description}
                    </p>
                    <p className="font-sans text-gray-400 text-xs leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* CTA */}
        <AnimateIn delay={0.4}>
          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm text-brand-blue font-semibold hover:text-brand-navy hover:gap-3 transition-all"
            >
              {d.learnMore}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
