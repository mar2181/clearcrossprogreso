'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { I18nProvider, Locale } from '@/lib/i18n';
import { getLocaleFromPath } from '@/lib/i18n/get-locale';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import FlashNotificationBanner from '@/components/layout/FlashNotificationBanner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export function I18nBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale: Locale = getLocaleFromPath(pathname);

  // The <html> element lives in the server root layout and can't react to the
  // route — keep its lang attribute in sync with the active locale here.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nProvider locale={locale}>
      <Navbar />
      <FlashNotificationBanner />
      <main className="flex-1 w-full">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
    </I18nProvider>
  );
}
