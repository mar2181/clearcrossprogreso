'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserRound,
  DollarSign,
  Camera,
  Zap,
  FileText,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalLocale, setPortalLocale } from '@/lib/i18n/usePortalLocale';
import { dictFor } from '@/lib/i18n/dict';

// The one place every provider-facing page links back to. Before this
// existed, 5 of the 6 pages under /provider had no way back except the
// browser's own Back button — an untrained provider who lands on
// /provider/prices from an email link had no path to /provider/photos at
// all short of guessing the URL.
//
// Icons are decided here, once; labels come from the dictionary so this one
// component drives both languages instead of forking into a second subnav.
const TABS = [
  { href: '/provider', key: 'navDashboard', icon: LayoutDashboard },
  { href: '/provider/profile', key: 'navProfile', icon: UserRound },
  { href: '/provider/prices', key: 'navPrices', icon: DollarSign },
  { href: '/provider/photos', key: 'navPhotos', icon: Camera },
  { href: '/provider/flash-discount', key: 'navFlashDiscount', icon: Zap },
  { href: '/provider/quotes', key: 'navQuotes', icon: FileText },
] as const;

export default function ProviderSubnav() {
  const pathname = usePathname();
  const locale = usePortalLocale();
  const t = dictFor(locale).provider;

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist">
          {TABS.map(({ href, key, icon: Icon }) => {
            // '/provider' itself must not stay highlighted while on
            // '/provider/prices' etc. — exact match for the dashboard root,
            // prefix match for every other tab.
            const isActive =
              href === '/provider' ? pathname === '/provider' : pathname?.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-brand-blue text-brand-blue'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {t[key]}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setPortalLocale(locale === 'es' ? 'en' : 'es')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-500 hover:text-brand-blue whitespace-nowrap flex-shrink-0"
        >
          <Languages className="w-4 h-4" />
          {t.langSwitchTo}
        </button>
      </div>
    </nav>
  );
}
