'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Building2, TrendingDown, Star } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: <Users className="w-5 h-5" />,
    value: '10,000',
    numericValue: 10000,
    suffix: '+',
    label: 'Americans served',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    value: '60',
    numericValue: 60,
    suffix: '+',
    label: 'Verified providers',
  },
  {
    icon: <TrendingDown className="w-5 h-5" />,
    value: '55-99',
    numericValue: 70,
    suffix: '%',
    label: 'Average savings vs US',
  },
  {
    icon: <Star className="w-5 h-5" />,
    value: '4.5',
    numericValue: 4.5,
    suffix: '+',
    label: 'Avg provider rating',
  },
];

function AnimatedNumber({ value, suffix }: { value: string; suffix: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;

          // Handle special cases like "40-70" or "4.5"
          if (value.includes('-')) {
            // Range: just set it directly with a slight delay
            setTimeout(() => setDisplay(value), 300);
            return;
          }

          const target = parseFloat(value.replace(/,/g, ''));
          const isDecimal = value.includes('.');
          const duration = 1200;
          const steps = 40;
          const stepDuration = duration / steps;

          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            if (isDecimal) {
              setDisplay(current.toFixed(1));
            } else if (target >= 1000) {
              setDisplay(Math.round(current).toLocaleString());
            } else {
              setDisplay(Math.round(current).toString());
            }

            if (step >= steps) {
              clearInterval(timer);
              setDisplay(value);
            }
          }, stepDuration);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="font-display text-3xl sm:text-4xl font-bold text-white">
      {display}<span className="text-amber">{suffix}</span>
    </div>
  );
}

export default function SocialProofBar() {
  return (
    <section className="w-full bg-brand-navy py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-8 sm:gap-6 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-amber">
                {stat.icon}
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="text-blue-200/70 text-sm mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
