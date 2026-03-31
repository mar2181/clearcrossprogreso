import Link from 'next/link';
import {
  FileCheck,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface TrustSignal {
  icon: React.ReactNode;
  label: string;
  description: string;
  detail: string;
  link: string;
  color: string;
  bgColor: string;
}

const trustSignals: TrustSignal[] = [
  {
    icon: <FileCheck className="w-7 h-7" />,
    label: 'Written Price Quotes',
    description: 'No surprise fees — ever',
    detail: 'Every quote is itemized and locked in before your visit. The price you see is the price you pay.',
    link: '/how-it-works',
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/10',
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    label: 'Credentials Verified',
    description: 'By our team, on-site',
    detail: 'We verify every provider\'s professional license (Cedula Profesional), clinic conditions, and sterilization protocols.',
    link: '/safety',
    color: 'text-brand-green',
    bgColor: 'bg-brand-green/10',
  },
  {
    icon: <Star className="w-7 h-7" />,
    label: 'Real Patient Reviews',
    description: 'From verified visitors',
    detail: 'Every review comes from a real patient who received care. No fake reviews, no paid placements.',
    link: '/how-it-works',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
  },
  {
    icon: <Clock className="w-7 h-7" />,
    label: 'Quotes in Hours',
    description: 'Average response: <2hrs',
    detail: 'Request a quote and most providers respond the same day. No waiting days or weeks for answers.',
    link: '/quote',
    color: 'text-brand-navy',
    bgColor: 'bg-brand-navy/10',
  },
];

export default function TrustBar() {
  return (
    <section className="w-full py-14 sm:py-18 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-100">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-blue mb-2">
            Why Patients Trust Us
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark">
            Your Protection, Built In
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
                Learn more
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
