'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, User } from 'lucide-react'
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
      { label: 'Vets', href: '/vets' }
    ]
  }
]

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Mobile Header — minimal like the reference (dark, just logo + hamburger icon for aesthetics) */}
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
          {/* Decorative hamburger — actual nav is in MobileBottomNav */}
          <div className="p-2 text-white/70">
            <Menu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/images/clearcross-logo.png"
                alt="ClearCross Progreso"
                width={56}
                height={56}
                priority
                className="h-12 w-auto drop-shadow-md"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
                  {link.submenu ? (
                    <>
                      <button
                        className="text-neutral-dark font-medium text-sm hover:text-brand-blue transition-colors flex items-center gap-1"
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
                      >
                        {link.label}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                        {link.submenu.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light hover:text-brand-blue transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-neutral-dark font-medium text-sm hover:text-brand-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Link
                href="/quote"
                className="btn-primary px-6 py-2 text-sm font-medium"
              >
                Get a Quote
              </Link>
              <div className="relative group">
                <button
                  className="p-2 text-neutral-dark hover:text-brand-blue transition-colors"
                  aria-label="User menu"
                >
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light hover:text-brand-blue transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light hover:text-brand-blue transition-colors"
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
