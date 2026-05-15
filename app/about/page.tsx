'use client';

import Link from 'next/link';
import { ArrowRight, Users, Eye, Shield, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function AboutPage() {
  const { dict } = useI18n();
  const { about: d } = dict;

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            {d.title}
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            {d.subtitle}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto prose prose-lg text-neutral-mid">
          <p className="text-lg leading-relaxed">
            {d.intro1}
          </p>
          <p className="text-lg leading-relaxed">
            {d.intro2}
          </p>
          <p className="text-lg leading-relaxed font-semibold text-neutral-dark">
            {d.intro3}
          </p>
        </div>
      </section>

      {/* Mission + What We Do */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-brand-blue" />
            </div>
            <h2 className="font-display text-2xl font-bold text-neutral-dark mb-4">{d.missionTitle}</h2>
            <p className="text-neutral-mid leading-relaxed mb-4">
              {d.mission1}
            </p>
            <p className="text-neutral-mid leading-relaxed">
              {d.mission2}
            </p>
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-brand-green" />
            </div>
            <h2 className="font-display text-2xl font-bold text-neutral-dark mb-4">{d.whatWeDoTitle}</h2>
            <p className="text-neutral-mid leading-relaxed mb-4">
              {d.whatWeDo1}
            </p>
            <ul className="space-y-2 text-neutral-mid">
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                {d.do1}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                {d.do2}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                {d.do3}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                {d.do4}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Nuevo Progreso */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-dark mb-6">{d.whyProgresoTitle}</h2>
          <p className="text-neutral-mid text-lg leading-relaxed mb-4">
            {d.whyProgreso1}
          </p>
          <p className="text-neutral-mid text-lg leading-relaxed">
            {d.whyProgreso2}
          </p>
        </div>
      </section>

      {/* How We Think About Trust */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber" />
            </div>
            <h2 className="font-display text-2xl font-bold text-neutral-dark">{d.trustTitle}</h2>
          </div>
          <p className="text-neutral-mid leading-relaxed mb-4">
            {d.trust1}
          </p>
          <p className="text-neutral-mid leading-relaxed mb-4">
            {d.trust2}
          </p>
          <p className="text-neutral-mid leading-relaxed font-medium text-neutral-dark">
            {d.trust3}
          </p>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-brand-navy" />
            </div>
            <h2 className="font-display text-2xl font-bold text-neutral-dark">{d.whoWeServeTitle}</h2>
          </div>
          <ul className="space-y-3 text-neutral-mid text-lg">
            <li>{d.who1}</li>
            <li>{d.who2}</li>
            <li>{d.who3}</li>
            <li>{d.who4}</li>
            <li>{d.who5}</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-blue to-brand-navy text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">
            {d.ctaTitle}
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            {d.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dentists"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-brand-blue font-semibold rounded-lg hover:bg-neutral-light transition-colors shadow-lg"
            >
              {d.browseProviders}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              {d.getQuote}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
