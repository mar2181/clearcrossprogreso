import type { Metadata } from 'next'
import './globals.css'
import { I18nBody } from '@/components/layout/I18nBody'
import SiteConcierge from '@/components/SiteConcierge'

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
  }
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
      </body>
    </html>
  )
}
