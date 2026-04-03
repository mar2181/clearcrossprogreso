'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { I18nProvider, Locale } from '@/lib/i18n';
import { getLocaleFromPath } from '@/lib/i18n/get-locale';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export function I18nBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale: Locale = getLocaleFromPath(pathname);

  return (
    <I18nProvider locale={locale}>
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </I18nProvider>
  );
}
