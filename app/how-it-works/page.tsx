import { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'How It Works - ClearCross Progreso',
  description:
    'Learn how ClearCross helps you compare medical prices, get firm quotes, and book appointments in Nuevo Progreso, Mexico.',
};

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search & Compare',
    description:
      'Browse dentists, pharmacies, spas, and more in Nuevo Progreso. Every provider shows transparent, verified prices so you can compare instantly.',
    details: [
      'Search by procedure (dental crown, Ozempic, massage, etc.)',
      'Filter by category, rating, price range, or experience',
      'See real prices — not estimates or "starting from" ranges',
    ],
    color: 'brand-blue',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Compare Prices Side by Side',
    description:
      'View pricing from multiple providers at once. ClearCross shows you the full picture — same procedure, different clinics, all verified.',
    details: [
      'Every listed price is verified by our team',
      'See provider ratings, reviews, and years of experience',
      'Featured providers are highlighted for quality and transparency',
    ],
    color: 'brand-green',
  },
  {
    number: '03',
    icon: MessageSquareText,
    title: 'Request a Firm Quote',
    description:
      'Found a provider you like? Request a personalized quote directly through ClearCross. Describe your needs and get a firm price before you visit.',
    details: [
      'Fill out a simple form with your treatment needs',
      'Attach photos (X-rays, prescriptions, etc.) if helpful',
      'Receive a detailed quote — no surprises when you arrive',
    ],
    color: 'brand-navy',
  },
  {
    number: '04',
    icon: CalendarCheck,
    title: 'Visit with Confidence',
    description:
      'Walk across the bridge knowing exactly what you will pay. Your provider is expecting you, the price is locked in, and your care is in good hands.',
    details: [
      'Show up with your quote — the price is guaranteed',
      'All providers are verified for credentials and quality',
      'Leave a review to help the next visitor',
    ],
    color: 'amber',
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: 'Save 55–99%',
    description: 'Same quality care at a fraction of US prices. Dental crowns, medications, spa treatments — all dramatically less.',
  },
  {
    icon: Shield,
    title: 'Verified Providers',
    description: 'Every provider on ClearCross is verified for credentials, clinic quality, and pricing transparency.',
  },
  {
    icon: Star,
    title: 'Real Reviews',
    description: 'Read honest reviews from real patients who have visited these providers. No fake reviews, no paid placements.',
  },
  {
    icon: Clock,
    title: 'Quick & Easy',
    description: 'Nuevo Progreso is a 5-minute walk from the US border. Most procedures are done in a single visit.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-blue via-brand-navy to-brand-blue text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            How ClearCross Works
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Four simple steps to save on healthcare in Nuevo Progreso. No guesswork, no hidden fees, no surprises.
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
            Why Choose ClearCross?
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
            Start Comparing Prices Now
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Join thousands of Americans who save on healthcare every month in Nuevo Progreso.
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
              href="/safety"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              <Shield className="w-4 h-4" />
              Read Safety Guide
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
