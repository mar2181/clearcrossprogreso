import type { Metadata } from 'next'
import './globals.css'
import { I18nBody } from '@/components/layout/I18nBody'
import SiteConcierge from '@/components/SiteConcierge'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'Best Dentists & Medical Services in Nuevo Progreso Mexico | ClearCross',
  description:
    'Find and compare prices for dentists, pharmacies, spas, and medical services in Nuevo Progreso, Mexico. Know the price before you cross.',
  applicationName: 'ClearCross Progreso',
  metadataBase: new URL('https://clearcrossprogreso.com'),
  // ⛔ './' resolves against metadataBase + the CURRENT pathname, so each route
  // canonicalises to itself. A bare '/' here would point every page on the site at
  // the homepage — far worse than having no canonical at all. Verified per-route
  // after building; do not change this without re-checking two different pages.
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clearcrossprogreso.com',
    siteName: 'ClearCross Progreso',
    title: 'Best Dentists & Medical Services in Nuevo Progreso Mexico | ClearCross',
    description:
      'Find and compare prices for dentists, pharmacies, spas, and medical services in Nuevo Progreso, Mexico. Know the price before you cross.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ClearCross Progreso'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Dentists & Medical Services in Nuevo Progreso Mexico | ClearCross',
    description:
      'Find and compare prices for dentists, pharmacies, spas, and medical services in Nuevo Progreso, Mexico. Know the price before you cross.',
    images: ['/og-image.jpg']
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  // Search Console ownership. Gated on the env var so the tag only appears once
  // there is a real token to put in it.
  // ⛔ This CANNOT be done headlessly: the google-search-console-pp-cli OAuth
  // token holds only the `webmasters` scopes, NOT `siteverification`, so nothing
  // here can mint or submit a verification token. The value comes from the GSC UI.
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <I18nBody>{children}</I18nBody>
        {/* Dr. Leo. Renders nothing until provisioned, and injects the two
            platform tags only after the page has settled. */}
        <SiteConcierge />
        {/* Measurement. Vercel Analytics and Speed Insights need no key and no
            env var — they are wired to this project by the platform, so they
            start reporting on the first deploy. GA4 stays inert until
            NEXT_PUBLIC_GA_ID exists. */}
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
