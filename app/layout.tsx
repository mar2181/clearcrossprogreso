import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

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
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  )
}
