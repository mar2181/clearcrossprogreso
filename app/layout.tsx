import type { Metadata } from 'next'
import './globals.css'
import { I18nBody } from '@/components/layout/I18nBody'

export const metadata: Metadata = {
  title: 'Best Dentists & Medical Services in Nuevo Progreso Mexico | ClearCross',
  description:
    'Find and compare prices for dentists, pharmacies, spas, and medical services in Nuevo Progreso, Mexico. Know the price before you cross.',
  applicationName: 'ClearCross Progreso',
  metadataBase: new URL('https://clearcrossprogreso.com'),
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
        <I18nBody>
          {children}
        </I18nBody>
      </body>
    </html>
  )
}
