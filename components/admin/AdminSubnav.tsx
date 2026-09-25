'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Camera, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalLocale, setPortalLocale } from '@/lib/i18n/usePortalLocale';
import { dictFor } from '@/lib/i18n/dict';

const TABS = [
  { href: '/admin/quotes', key: 'navQuotes', icon: FileText },
  { href: '/admin/photos', key: 'navPhotos', icon: Camera },
] as const;

export default function AdminSubnav() {
  const pathname = usePathname();
  const locale = usePortalLocale();
  const t = dictFor(locale).admin;

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex gap-1" role="tablist">
          {TABS.map(({ href, key, icon: Icon }) => {
            const isActive = pathname?.startsWith(href);

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
