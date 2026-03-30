'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Services', href: '/#categories', icon: LayoutGrid },
  { label: 'Contact', href: '/quote', icon: Phone },
];

const menuLinks = [
  { label: 'Dentists', href: '/dentists' },
  { label: 'Pharmacies', href: '/pharmacies' },
  { label: 'Spas', href: '/spas' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Optometrists', href: '/optometrists' },
  { label: 'Cosmetic Surgery', href: '/cosmetic-surgery' },
  { label: 'Liquor', href: '/liquor' },
  { label: 'Vets', href: '/vets' },
  { label: 'Blog', href: '/blog' },
  { label: 'Get a Quote', href: '/quote' },
  { label: 'Login', href: '/login' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Fullscreen menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-brand-navy/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-5 right-5 p-2 text-white"
            aria-label="Close menu"
          >
            <X className="w-7 h-7" />
          </button>
          <nav className="flex flex-col items-center gap-5">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-white text-xl font-display font-semibold hover:text-brand-blue-light transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Bottom floating bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[80]">
        <div className="bg-brand-navy/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
                  isActive
                    ? 'text-amber bg-white/10'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Menu button */}
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
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>
    </>
  );
}
