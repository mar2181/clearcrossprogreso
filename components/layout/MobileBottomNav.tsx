'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Phone, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import SearchBar from '@/components/search/SearchBar';
import { useI18n } from '@/lib/i18n';
import { localizedPath, stripLocale } from '@/lib/i18n/get-locale';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { dict, locale } = useI18n();
  const d = dict.nav;
  const cleanPath = stripLocale(pathname);
  const otherLocale = locale === 'en' ? 'es' : 'en';
  const togglePath = localizedPath(cleanPath, otherLocale);

  const navItems = [
    { label: d.home, href: '/', icon: Home },
    { label: d.services, href: '/dentists', icon: LayoutGrid },
    { label: d.contact, href: '/quote', icon: Phone },
  ];

  const menuLinks = [
    { label: d.dentists, href: '/dentists' },
    { label: d.pharmacies, href: '/pharmacies' },
    { label: d.spas, href: '/spas' },
    { label: d.doctors, href: '/doctors' },
    { label: d.optometrists, href: '/optometrists' },
    { label: d.cosmeticSurgery, href: '/cosmetic-surgery' },
    { label: d.blog, href: '/blog' },
    { label: d.getQuote, href: '/quote' },
    { label: d.login, href: '/login' },
  ];

  return (
    <>
      {/* Fullscreen menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-brand-navy/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-5 right-5 p-2 text-white"
            aria-label={dict.common.close}
          >
            <X className="w-7 h-7" />
          </button>
          <nav className="flex flex-col items-center gap-5">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={localizedPath(link.href, locale)}
                onClick={() => setMenuOpen(false)}
                className="text-white text-xl font-display font-semibold hover:text-brand-blue-light transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Language toggle in mobile menu */}
            <Link
              href={togglePath}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-white/70 text-lg font-display font-semibold hover:text-white transition-colors mt-4 pt-4 border-t border-white/10"
            >
              <Globe className="w-5 h-5" />
              {d.languageToggle}
            </Link>
          </nav>
        </div>
      )}

      {/* Search bar + Bottom floating bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[80] flex flex-col gap-2">
        <SearchBar
          variant="mobile"
          placeholder={d.searchPlaceholder}
        />

        <div className="bg-brand-navy/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? cleanPath === '/'
                : cleanPath.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={localizedPath(item.href, locale)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
                  isActive
                    ? 'text-amber bg-white/10'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
              menuOpen
                ? 'text-amber bg-white/10'
                : 'text-white/70 hover:text-white'
            )}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[11px] font-medium">{d.menu}</span>
          </button>
        </div>
      </div>
    </>
  );
}
