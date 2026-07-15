'use client'

import { Logo } from '@/components/logo'
import { useCart } from '@/components/cart-context'
import { INSTAGRAM_URL } from '@/components/instagram-embed'
import { STORE_CATEGORIES } from '@/lib/store-categories'
import Link from 'next/link'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/products', label: 'BOUTIQUE' },
  ...STORE_CATEGORIES.map((c) => ({
    href: `/products?category=${c.slug}`,
    label: c.name.toUpperCase(),
  })),
]

export function Navbar() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-light tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-light tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
          >
            INSTAGRAM
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/checkout"
            className="relative flex items-center gap-2 text-sm font-light tracking-widest text-foreground transition-colors hover:text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          <button
            className="flex flex-col gap-1.5 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? 'translate-y-2.5 rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? '-translate-y-2.5 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-6 lg:hidden">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-light tracking-widest text-muted-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light tracking-widest text-muted-foreground hover:text-primary"
            >
              INSTAGRAM
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
