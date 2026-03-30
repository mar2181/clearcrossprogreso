import { Building2, CheckCircle, ShieldCheck, Globe } from 'lucide-react';

interface TrustSignal {
  icon: React.ReactNode;
  label: string;
  description: string;
}

const trustSignals: TrustSignal[] = [
  {
    icon: <Building2 size={28} />,
    label: '100+ Providers',
    description: 'Verified & active',
  },
  {
    icon: <CheckCircle size={28} />,
    label: 'Verified Reviews',
    description: 'Real patient feedback',
  },
  {
    icon: <ShieldCheck size={28} />,
    label: 'Price Guaranteed',
    description: 'Cannot change',
  },
  {
    icon: <Globe size={28} />,
    label: 'Safe to Cross',
    description: 'Trusted & secure',
  },
];

export default function TrustBar() {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {trustSignals.map((signal, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 sm:p-6"
            >
              {/* Icon */}
              <div className={`mb-4 ${index === 2 ? 'text-brand-green' : 'text-brand-blue'}`}>
                {signal.icon}
              </div>

              {/* Label */}
              <p className="font-sans font-bold text-gray-900 mb-1 text-sm sm:text-base">
                {signal.label}
              </p>

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-gray-600">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
