import { Search, BarChart3, ShieldCheck } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Pick a Procedure',
    description: 'Browse categories and find the treatment you need. See every provider\'s price instantly.',
    icon: <Search size={40} />,
  },
  {
    number: 2,
    title: 'Compare Prices',
    description: 'View real prices from real clinics side by side. No hidden fees, no surprises.',
    icon: <BarChart3 size={40} />,
  },
  {
    number: 3,
    title: 'Get a Locked Quote',
    description: 'Upload a photo, receive a firm written quote. Price is guaranteed — it cannot change.',
    icon: <ShieldCheck size={40} />,
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How ClearCross Works
          </h2>
          <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
            Simple, transparent, and straightforward. Get the care you need at the price you want.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-8 sm:gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center">
                {/* Connecting Line (Desktop Only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-green transform translate-y-full translate-x-1/2" />
                )}

                {/* Step Card */}
                <div className="relative z-10 flex flex-col items-center text-center w-full">
                  {/* Number Badge */}
                  <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center mb-6 shadow-lg">
                    <span className="font-display font-bold text-2xl">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="text-brand-green mb-6">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-gray-900 mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-gray-600 text-sm sm:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
