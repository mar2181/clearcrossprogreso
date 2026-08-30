'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Building2, TrendingDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
}

function AnimatedNumber({ value, suffix }: { value: string; suffix: string }) {
  // Seeded with the REAL value, not '0'.
  //
  // This used to start at '0' and only reach the true number after hydration
  // and an IntersectionObserver fire -- so the server-rendered HTML read
  // "0 Providers listed", and that is what a crawler and a no-JS visitor got.
  // Harmless while the numbers were invented; not harmless now that they are
  // the only substantiated figures on the page. The count-up is decoration and
  // now runs strictly as an enhancement, from 0, after mount.
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          // Wind back to zero only at the moment the animation starts. Doing it
          // on mount would leave the bar reading 0 for anyone who never scrolls
          // to it -- the same defect as seeding '0', one step later.
          setDisplay('0');

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

/**
 * Every number in this bar is counted from the database at request time.
 *
 * It used to carry two literals: "10,000+ Americans served" and "4.5 Avg
 * provider rating", animating up on a site that has served nobody and holds
 * zero rows in clearcross_reviews. Both are gone. What is left is what a
 * visitor could go and count for themselves.
 *
 * The markup figure is the one stat not counted from our own tables -- it comes
 * from the cited US benchmark table in lib/us-benchmarks.ts, and its label says
 * so rather than implying we measured it.
 */
export interface SocialProofBarProps {
  /** Providers currently visible on the site. */
  providerCount: number;
  /** Individual published prices behind those providers. */
  priceCount: number;
}

export default function SocialProofBar({ providerCount, priceCount }: SocialProofBarProps) {
  const { dict } = useI18n();

  const stats: StatItem[] = [
    {
      icon: <Building2 className="w-5 h-5" />,
      value: String(providerCount),
      numericValue: providerCount,
      suffix: '',
      label: dict.socialProof.verifiedProviders,
    },
    {
      icon: <Users className="w-5 h-5" />,
      value: priceCount.toLocaleString('en-US'),
      numericValue: priceCount,
      suffix: '',
      label: dict.socialProof.pricesPublished,
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      value: '400–2,400',
      numericValue: 1400,
      suffix: '%',
      label: dict.socialProof.avgSavings,
    },
  ];

  return (
    <section className="w-full bg-brand-navy py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 text-amber">
                {stat.icon}
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="text-blue-200 text-sm mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
