'use client';

import Link from 'next/link';
import {
  Search,
  BarChart3,
  MessageSquareText,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Shield,
  DollarSign,
  Star,
  Clock,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function HowItWorksPage() {
  const { dict } = useI18n();
  const d = dict.howItWorksPage;

  const steps = [
    {
      number: '01',
      icon: Search,
      title: d.step1Title,
      description: d.step1Desc,
      details: [d.step1Detail1, d.step1Detail2, d.step1Detail3],
      color: 'brand-blue',
    },
    {
      number: '02',
      icon: BarChart3,
      title: d.step2Title,
      description: d.step2Desc,
      details: [d.step2Detail1, d.step2Detail2, d.step2Detail3],
      color: 'brand-green',
    },
    {
      number: '03',
      icon: MessageSquareText,
      title: d.step3Title,
      description: d.step3Desc,
      details: [d.step3Detail1, d.step3Detail2, d.step3Detail3],
      color: 'brand-navy',
    },
    {
      number: '04',
      icon: CalendarCheck,
      title: d.step4Title,
      description: d.step4Desc,
      details: [d.step4Detail1, d.step4Detail2, d.step4Detail3],
      color: 'amber',
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: d.benefit1Title,
      description: d.benefit1Desc,
    },
    {
      icon: Shield,
      title: d.benefit2Title,
      description: d.benefit2Desc,
    },
    {
      icon: Star,
      title: d.benefit3Title,
      description: d.benefit3Desc,
    },
    {
      icon: Clock,
      title: d.benefit4Title,
      description: d.benefit4Desc,
    },
  ];

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-blue via-brand-navy to-brand-blue text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            {d.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {d.subtitle}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-6 top-20 bottom-0 w-px bg-neutral-200 -mb-16" />
                )}

                <div className="flex items-start gap-6">
                  {/* Step number circle */}
                  <div className={`w-12 h-12 rounded-full bg-${step.color}/10 border-2 border-${step.color}/30 flex items-center justify-center flex-shrink-0`}>
                    <span className={`font-display font-bold text-sm text-${step.color}`}>
                      {step.number}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <step.icon className={`w-6 h-6 text-${step.color}`} />
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-dark">
                        {step.title}
                      </h2>
                    </div>

                    <p className="text-neutral-mid text-lg mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    <ul className="space-y-2">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2.5 text-sm text-neutral-mid">
                          <CheckCircle2 className={`w-4 h-4 text-${step.color} flex-shrink-0 mt-0.5`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark text-center mb-12">
            {d.whyChoose}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="font-display font-bold text-neutral-dark text-lg mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-neutral-mid leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-green to-brand-blue text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">
            {d.ctaTitle}
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            {d.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#categories"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-brand-blue font-semibold rounded-lg hover:bg-neutral-light transition-colors shadow-lg"
            >
              {d.browseProviders}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/safety"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              <Shield className="w-4 h-4" />
              {d.readSafetyGuide}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
