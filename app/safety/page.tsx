import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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

export const metadata: Metadata = {
  title: 'Safety Guide - ClearCross Progreso',
  description:
    'Everything you need to know about safely visiting Nuevo Progreso, Mexico for medical care, dental work, pharmacy visits, and spa treatments.',
};

const safetyTips = [
  {
    icon: FileCheck,
    title: 'Verify Your Provider',
    description:
      'Use ClearCross to check that your provider is verified. We confirm credentials, clinic conditions, and pricing transparency before listing any provider.',
    color: 'brand-blue',
  },
  {
    icon: CreditCard,
    title: 'Know the Price Before You Go',
    description:
      'Always request a firm quote before your appointment. ClearCross shows transparent pricing so you know exactly what to expect — no hidden fees.',
    color: 'brand-green',
  },
  {
    icon: Stethoscope,
    title: 'Ask About Credentials',
    description:
      'Mexican dentists and doctors must hold a valid Cedula Profesional (professional license). Ask to see it displayed in the office, and check years of experience on ClearCross.',
    color: 'brand-navy',
  },
  {
    icon: Phone,
    title: 'Share Your Plans',
    description:
      'Tell a friend or family member where you are going, the name of the clinic, and your expected return time. Keep your phone charged.',
    color: 'amber',
  },
  {
    icon: Car,
    title: 'Park on the US Side',
    description:
      'Most visitors park in Progreso, TX and walk across the International Bridge. Parking lots on the US side are safe and well-monitored. The walk into town is short.',
    color: 'brand-blue',
  },
  {
    icon: Clock,
    title: 'Plan Your Timing',
    description:
      'Visit during business hours (9 AM - 5 PM). The town is busiest and safest during the day, especially on weekdays. Bridge wait times are usually short.',
    color: 'brand-green',
  },
];

const dosAndDonts = {
  dos: [
    'Carry a valid passport or passport card',
    'Bring cash (USD is widely accepted) and a backup card',
    'Get a detailed receipt for all services and purchases',
    'Take before/after photos of dental or cosmetic work',
    'Request a written treatment plan with itemized pricing',
    'Check the ClearCross reviews for your provider',
    'Ask your US doctor/dentist to send records if needed',
    'Drink bottled water at all times',
  ],
  donts: [
    'Don\'t carry large amounts of cash unnecessarily',
    'Don\'t agree to procedures without a written quote',
    'Don\'t skip asking about sterilization and safety protocols',
    'Don\'t walk far from the main tourist streets at night',
    'Don\'t buy prescription medication without checking the expiration date',
    'Don\'t feel pressured — you can always walk away and compare',
    'Don\'t forget to declare purchases over $800 at customs',
  ],
};

export default function SafetyPage() {
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
            Safety Guide
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Nuevo Progreso is a popular border town for Americans seeking affordable healthcare. Here is everything you need to know for a safe, smooth visit.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white py-10 px-4 sm:px-6 lg:px-8 border-b border-neutral-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-brand-blue">1000s</p>
            <p className="text-sm text-neutral-mid mt-1">Americans visit each year</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brand-green">60+</p>
            <p className="text-sm text-neutral-mid mt-1">Providers listed</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-brand-navy">40-70%</p>
            <p className="text-sm text-neutral-mid mt-1">Average savings</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-amber">4.5+</p>
            <p className="text-sm text-neutral-mid mt-1">Avg provider rating</p>
          </div>
        </div>
      </section>

      {/* Safety Tips Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark text-center mb-12">
            Essential Safety Tips
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
            Do&apos;s and Don&apos;ts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Do's */}
            <div className="bg-brand-green/5 rounded-xl p-6 border border-brand-green/20">
              <h3 className="font-display font-bold text-brand-green text-xl mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Do
              </h3>
              <ul className="space-y-3">
                {dosAndDonts.dos.map((item, idx) => (
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
                Don&apos;t
              </h3>
              <ul className="space-y-3">
                {dosAndDonts.donts.map((item, idx) => (
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
            Getting to Nuevo Progreso
          </h2>
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-neutral-200">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-dark mb-1">Drive & Park</h3>
                  <p className="text-sm text-neutral-mid">
                    Drive to Progreso, TX (just north of the border). Multiple safe, monitored parking lots are available for $3-5/day. Most are walking distance to the International Bridge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-dark mb-1">Walk Across</h3>
                  <p className="text-sm text-neutral-mid">
                    The Progreso International Bridge is a short walk. Bring your passport or passport card. Bridge toll is $0.50. Most clinics and pharmacies are within 2-3 blocks of the bridge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-neutral-dark mb-1">Bridge Hours</h3>
                  <p className="text-sm text-neutral-mid">
                    The bridge is open daily from 6:00 AM to midnight. Wait times to return to the US are typically 5-15 minutes on weekdays, slightly longer on weekends and holidays.
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
            Ready to Save on Healthcare?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Browse verified providers with transparent pricing. Know the price before you cross.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#categories"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-brand-blue font-semibold rounded-lg hover:bg-neutral-light transition-colors shadow-lg"
            >
              Browse Providers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Search Procedures
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
