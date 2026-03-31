import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users, Eye, Shield, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ClearCross Progreso - Affordable Cross-Border Healthcare',
  description:
    'ClearCross helps Americans compare affordable healthcare in Nuevo Progreso, Mexico. Transparent pricing, verified providers, and written quotes before you cross.',
};

export default function AboutPage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            About ClearCross
          </h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Helping Americans compare affordable healthcare across the border — before they leave home.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto prose prose-lg text-neutral-mid">
          <p className="text-lg leading-relaxed">
            At ClearCross, we believe people should know the price of care before they commit to it. Too many Americans delay dental work, prescriptions, vision care, and other essential services because the cost at home feels impossible.
          </p>
          <p className="text-lg leading-relaxed">
            Just across the border in Nuevo Progreso, Mexico, many of those same services are available at a fraction of the price. But until now, finding reliable information has been difficult. Patients had to walk clinic to clinic, ask around, compare prices in person, and hope they were making a good decision.
          </p>
          <p className="text-lg leading-relaxed font-semibold text-neutral-dark">
            ClearCross exists to make that process simple, transparent, and safer.
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
            <h2 className="font-display text-2xl font-bold text-neutral-dark mb-4">Our Mission</h2>
            <p className="text-neutral-mid leading-relaxed mb-4">
              Our mission is to connect Americans with trusted, affordable healthcare and wellness services in Nuevo Progreso by making prices, providers, and practical information easier to access.
            </p>
            <p className="text-neutral-mid leading-relaxed">
              We want to reduce the guesswork. That means helping users compare real prices, understand what services are offered, review provider information, request quotes before crossing, and feel more confident about the trip.
            </p>
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-brand-green" />
            </div>
            <h2 className="font-display text-2xl font-bold text-neutral-dark mb-4">What We Do</h2>
            <p className="text-neutral-mid leading-relaxed mb-4">
              ClearCross is a comparison and discovery platform for cross-border healthcare services. We organize provider information into one place so users can browse by category, compare options, and make more informed decisions before they travel.
            </p>
            <ul className="space-y-2 text-neutral-mid">
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                Browse and compare pricing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                Review provider details and credentials
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                Request written quotes before you visit
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green mt-1">&#10003;</span>
                Read real patient experiences
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Nuevo Progreso */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-dark mb-6">Why Nuevo Progreso?</h2>
          <p className="text-neutral-mid text-lg leading-relaxed mb-4">
            Nuevo Progreso is one of the most accessible border towns for Americans seeking more affordable care. It is walkable, close to Texas, and well known for dental clinics, pharmacies, and other patient-focused services.
          </p>
          <p className="text-neutral-mid text-lg leading-relaxed">
            For many visitors, the opportunity is straightforward: better price visibility, shorter decision time, and access to services they may otherwise postpone due to cost.
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
            <h2 className="font-display text-2xl font-bold text-neutral-dark">How We Think About Trust</h2>
          </div>
          <p className="text-neutral-mid leading-relaxed mb-4">
            Trust matters more than traffic. That is why ClearCross is being built around transparency, not hype.
          </p>
          <p className="text-neutral-mid leading-relaxed mb-4">
            Our goal is to make the experience clearer by helping users understand who the provider is, what the service costs, what to expect before the visit, and how to prepare for the crossing.
          </p>
          <p className="text-neutral-mid leading-relaxed font-medium text-neutral-dark">
            We are building ClearCross to be useful first, sleek second, and scalable third.
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
            <h2 className="font-display text-2xl font-bold text-neutral-dark">Who We Serve</h2>
          </div>
          <ul className="space-y-3 text-neutral-mid text-lg">
            <li>Uninsured and underinsured Americans</li>
            <li>Retirees looking for better value</li>
            <li>Families managing recurring medication costs</li>
            <li>Patients comparing dental and vision work</li>
            <li>Anyone who wants more control over healthcare spending</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-blue to-brand-navy text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Explore Providers?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Browse categories, compare prices, and request a quote before you go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dentists"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-brand-blue font-semibold rounded-lg hover:bg-neutral-light transition-colors shadow-lg"
            >
              Browse Providers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
