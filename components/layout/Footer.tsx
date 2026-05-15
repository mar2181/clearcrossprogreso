'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { localizedPath } from '@/lib/i18n/get-locale'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { dict, locale } = useI18n()
  const d = dict.footer

  const footerSections = [
    {
      title: d.categories,
      links: [
        { label: d.dentists, href: '/dentists' },
        { label: d.pharmacies, href: '/pharmacies' },
        { label: d.spas, href: '/spas' },
        { label: d.optometrists, href: '/optometrists' },
        { label: d.cosmeticSurgery, href: '/cosmetic-surgery' },
      ],
    },
    {
      title: d.resources,
      links: [
        { label: d.blog, href: '/blog' },
        { label: d.howItWorks, href: '/how-it-works' },
        { label: d.safetyGuide, href: '/safety' },
        { label: d.aboutUs, href: '/about' },
        { label: d.listBusiness, href: '/quote' },
      ],
    },
  ]

  return (
    <footer className="bg-brand-navy text-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo & Tagline */}
          <div className="flex flex-col space-y-4">
            <Link href={localizedPath('/', locale)} className="flex items-start">
              <Image
                src="/images/clearcross-logo.png"
                alt="ClearCross Progreso"
                width={80}
                height={80}
                className="h-16 w-auto drop-shadow-lg"
              />
            </Link>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-light font-medium">{d.tagline}</p>
              <p className="text-neutral-light/80 text-xs">{d.taglineEs}</p>
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
                    href={localizedPath(link.href, locale)}
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
                    href={localizedPath(link.href, locale)}
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
            <h3 className="text-white font-display font-bold text-lg mb-4">{d.contact}</h3>
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
                  href={localizedPath('/quote', locale)}
                  className="text-neutral-light hover:text-white transition-colors text-sm font-medium"
                >
                  {d.listBusiness}
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
              &copy; {currentYear} {d.copyright}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href={localizedPath('/privacy', locale)}
                className="text-neutral-light/80 hover:text-white transition-colors text-xs sm:text-sm"
              >
                {d.privacyPolicy}
              </Link>
              <Link
                href={localizedPath('/terms', locale)}
                className="text-neutral-light/80 hover:text-white transition-colors text-xs sm:text-sm"
              >
                {d.termsOfService}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
