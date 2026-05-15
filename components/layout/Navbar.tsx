'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, ChevronDown, User, Search, X, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { localizedPath, stripLocale } from '@/lib/i18n/get-locale'

function NavbarSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { dict, locale } = useI18n()

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      router.push(localizedPath(`/search?q=${encodeURIComponent(query.trim())}`, locale))
      setOpen(false)
      setQuery('')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 bg-neutral-light rounded-lg text-sm text-neutral-mid hover:bg-neutral-200/60 transition-colors border border-neutral-200/60"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">{dict.nav.searchPlaceholder}</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <div className="flex items-center bg-white border border-brand-blue/30 rounded-lg shadow-md overflow-hidden">
        <Search className="w-4 h-4 text-brand-blue ml-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.nav.searchPlaceholder}
          className="w-48 lg:w-64 px-3 py-2 text-sm text-neutral-dark placeholder-neutral-400 focus:outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={() => { setOpen(false); setQuery('') }}
          className="p-2 text-neutral-400 hover:text-neutral-dark transition-colors"
          aria-label={dict.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { dict, locale } = useI18n()
  const pathname = usePathname()
  const cleanPath = stripLocale(pathname)
  const otherLocale = locale === 'en' ? 'es' : 'en'
  const togglePath = localizedPath(cleanPath, otherLocale)

  const navLinks = [
    { label: dict.nav.dentists, href: '/dentists' },
    { label: dict.nav.pharmacies, href: '/pharmacies' },
    { label: dict.nav.spas, href: '/spas' },
    {
      label: dict.nav.more,
      href: '#',
      submenu: [
        { label: dict.nav.doctors, href: '/doctors' },
        { label: dict.nav.optometrists, href: '/optometrists' },
        { label: dict.nav.cosmeticSurgery, href: '/cosmetic-surgery' },
      ],
    },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-navy border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href={localizedPath('/', locale)} className="flex items-center">
            <Image
              src="/images/clearcross-logo.png"
              alt="ClearCross Progreso"
              width={48}
              height={48}
              priority
              className="h-10 w-auto drop-shadow-lg"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={togglePath}
              className="flex items-center gap-1 px-2.5 py-1.5 text-white/80 hover:text-white text-xs font-medium border border-white/20 rounded-lg transition-colors"
              title={locale === 'en' ? 'Ver en Español' : 'View in English'}
            >
              <Globe className="w-4 h-4" />
              <span>{dict.nav.languageToggle}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-neutral-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Brand */}
            <Link href={localizedPath('/', locale)} className="flex items-center gap-2.5 flex-shrink-0">
              <Image
                src="/images/clearcross-logo.png"
                alt="ClearCross Progreso"
                width={56}
                height={56}
                priority
                className="h-11 w-auto drop-shadow-md"
              />
              <span className="font-display font-bold text-neutral-dark text-lg hidden xl:inline">
                ClearCross
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
                  {link.submenu ? (
                    <>
                      <button
                        className="text-neutral-dark font-medium text-sm hover:text-brand-blue transition-colors flex items-center gap-1 py-1"
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
                      >
                        {link.label}
                        <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                      <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-neutral-200/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 -translate-y-1 group-hover:translate-y-0">
                        {link.submenu.map((item) => (
                          <Link
                            key={item.href}
                            href={localizedPath(item.href, locale)}
                            className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-brand-blue/5 hover:text-brand-blue transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={localizedPath(link.href, locale)}
                      className="text-neutral-dark font-medium text-sm hover:text-brand-blue transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-blue hover:after:w-full after:transition-all after:duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Search + Language Toggle + CTA + User */}
            <div className="flex items-center gap-3">
              <NavbarSearch />

              {/* Language Toggle */}
              <Link
                href={togglePath}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-mid hover:text-brand-blue transition-colors rounded-lg hover:bg-neutral-light border border-neutral-200/60"
                title={locale === 'en' ? 'Ver en Español' : 'View in English'}
              >
                <Globe className="w-4 h-4" />
                <span>{dict.nav.languageToggle}</span>
              </Link>

              <Link
                href={localizedPath('/quote', locale)}
                className="btn-primary px-5 py-2 text-sm"
              >
                {dict.nav.getQuote}
              </Link>

              <div className="relative group">
                <button
                  className="p-2 text-neutral-mid hover:text-brand-blue transition-colors rounded-lg hover:bg-neutral-light"
                  aria-label="User menu"
                >
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-neutral-200/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 -translate-y-1 group-hover:translate-y-0">
                  <Link
                    href={localizedPath('/login', locale)}
                    className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-brand-blue/5 hover:text-brand-blue transition-colors"
                  >
                    {dict.nav.login}
                  </Link>
                  <Link
                    href={localizedPath('/register', locale)}
                    className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-brand-blue/5 hover:text-brand-blue transition-colors"
                  >
                    {dict.nav.register}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
