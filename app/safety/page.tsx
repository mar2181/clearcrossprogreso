'use client';

import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Car,
  CreditCard,
  FileCheck,
  Stethoscope,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SafetyPage() {
  const { dict } = useI18n();
  const d = dict.safety;

  const safetyTips = [
    {
      icon: FileCheck,
      title: d.tip1Title,
      description: d.tip1Desc,
      color: 'brand-blue',
    },
    {
      icon: CreditCard,
      title: d.tip2Title,
      description: d.tip2Desc,
      color: 'brand-green',
    },
    {
      icon: Stethoscope,
      title: d.tip3Title,
      description: d.tip3Desc,
      color: 'brand-navy',
    },
    {
      icon: Phone,
      title: d.tip4Title,
      description: d.tip4Desc,
      color: 'amber',
    },
    {
      icon: Car,
      title: d.tip5Title,
      description: d.tip5Desc,
      color: 'brand-blue',
    },
    {
      icon: Clock,
      title: d.tip6Title,
      description: d.tip6Desc,
      color: 'brand-green',
    },
  ];

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            {d.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {d.subtitle}
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white py-10 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-brand-blue">1000s</p>
            <p className="text-sm text-neutral-mid mt-1">{d.quickStats1Label}</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brand-green">60+</p>
            <p className="text-sm text-neutral-mid mt-1">{d.quickStats2Label}</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brand-navy">$100s-$1000s</p>
            <p className="text-sm text-neutral-mid mt-1">{d.quickStats3Label}</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-amber">4.5+</p>
            <p className="text-sm text-neutral-mid mt-1">{d.quickStats4Label}</p>
          </div>
        </div>
      </section>

      {/* Safety Tips Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark text-center mb-12">
            {d.safetyTipsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-${tip.color}/10 flex items-center justify-center mb-4`}>
                  <tip.icon className={`w-6 h-6 text-${tip.color}`} />
                </div>
                <h3 className="font-display font-bold text-neutral-dark text-lg mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-neutral-mid leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Do's and Don'ts */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark text-center mb-12">
            {d.dosAndDontsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Do's */}
            <div className="bg-brand-green/5 rounded-xl p-6 border border-brand-green/20">
              <h3 className="font-display font-bold text-brand-green text-xl mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                {d.doLabel}
              </h3>
              <ul className="space-y-3">
                {d.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-neutral-dark">
                    <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="font-display font-bold text-red-600 text-xl mb-5 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                {d.dontLabel}
              </h3>
              <ul className="space-y-3">
                {d.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-neutral-dark">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Getting There */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark text-center mb-12">
            {d.gettingThereTitle}
          </h2>
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-neutral-200">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-dark mb-1">{d.driveTitle}</h3>
                  <p className="text-sm text-neutral-mid">
                    {d.driveDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-dark mb-1">{d.walkTitle}</h3>
                  <p className="text-sm text-neutral-mid">
                    {d.walkDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-dark mb-1">{d.bridgeTitle}</h3>
                  <p className="text-sm text-neutral-mid">
                    {d.bridgeDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-blue to-brand-navy text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Heart className="w-10 h-10 mx-auto mb-4 text-white/80" />
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
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              {d.searchProcedures}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
