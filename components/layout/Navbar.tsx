'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, ChevronDown, User, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavDropdownItem {
  label: string
  href: string
}

interface NavLink {
  label: string
  href: string
  submenu?: NavDropdownItem[]
}

const navLinks: NavLink[] = [
  { label: 'Dentists', href: '/dentists' },
  { label: 'Pharmacies', href: '/pharmacies' },
  { label: 'Spas', href: '/spas' },
  {
    label: 'More',
    href: '#',
    submenu: [
      { label: 'Doctors', href: '/doctors' },
      { label: 'Optometrists', href: '/optometrists' },
      { label: 'Cosmetic Surgery', href: '/cosmetic-surgery' },
      { label: 'Liquor', href: '/liquor' },
      { label: 'Vets', href: '/vets' },
    ],
  },
]

function NavbarSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Close on Escape
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
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
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
        <span className="hidden lg:inline">Search...</span>
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
          placeholder="Search procedures, providers..."
          className="w-48 lg:w-64 px-3 py-2 text-sm text-neutral-dark placeholder-neutral-400 focus:outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={() => { setOpen(false); setQuery('') }}
          className="p-2 text-neutral-400 hover:text-neutral-dark transition-colors"
          aria-label="Close search"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-navy border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/clearcross-logo.png"
              alt="ClearCross Progreso"
              width={48}
              height={48}
              priority
              className="h-10 w-auto drop-shadow-lg"
            />
          </Link>
          <div className="p-2 text-white/70">
            <Menu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-neutral-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Brand */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
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
                            href={item.href}
                            className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-brand-blue/5 hover:text-brand-blue transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-neutral-dark font-medium text-sm hover:text-brand-blue transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-blue hover:after:w-full after:transition-all after:duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Search + CTA + User */}
            <div className="flex items-center gap-3">
              <NavbarSearch />

              <Link
                href="/quote"
                className="btn-primary px-5 py-2 text-sm"
              >
                Get a Quote
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
                    href="/login"
                    className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-brand-blue/5 hover:text-brand-blue transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2.5 text-sm text-neutral-dark hover:bg-brand-blue/5 hover:text-brand-blue transition-colors"
                  >
                    Register
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
