import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'

interface FooterLink {
  label: string
  href: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const footerSections: FooterSection[] = [
  {
    title: 'Categories',
    links: [
      { label: 'Dentists', href: '/dentists' },
      { label: 'Pharmacies', href: '/pharmacies' },
      { label: 'Spas', href: '/spas' },
      { label: 'Optometrists', href: '/optometrists' },
      { label: 'Cosmetic Surgery', href: '/cosmetic-surgery' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Safety Guide', href: '/safety' },
      { label: 'About Us', href: '/about' },
      { label: 'List Your Business', href: '/quote' }
    ]
  }
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-navy text-neutral-light">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo & Tagline */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-start">
              <Image
                src="/images/clearcross-logo.png"
                alt="ClearCross Progreso"
                width={80}
                height={80}
                className="h-16 w-auto drop-shadow-lg"
              />
            </Link>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-light font-medium">Know the price before you cross.</p>
              <p className="text-neutral-light/80 text-xs">Conozca el precio antes de cruzar.</p>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-4">
              {footerSections[0].title}
            </h3>
            <ul className="space-y-3">
              {footerSections[0].links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-light hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-4">
              {footerSections[1].title}
            </h3>
            <ul className="space-y-3">
              {footerSections[1].links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-light hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-4">Contact</h3>
            <div className="space-y-4">
              <a
                href="mailto:info@clearcrossprogreso.com"
                className="flex items-center gap-2 text-neutral-light hover:text-white transition-colors text-sm group"
              >
                <Mail className="w-4 h-4 group-hover:text-white transition-colors" />
                info@clearcrossprogreso.com
              </a>
              <div>
                <Link
                  href="/quote"
                  className="text-neutral-light hover:text-white transition-colors text-sm font-medium"
                >
                  For Providers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-neutral-light/80 text-xs sm:text-sm">
              &copy; {currentYear} ClearCross Progreso. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-neutral-light/80 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-neutral-light/80 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
