'use client'

import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { useCart } from '@/components/cart-context'
import { PHONE_HREF } from '@/lib/social-links'
import { SITE } from '@/lib/site'
import { catalogHref } from '@/lib/catalog-href'
import type { StoreCategory } from '@/lib/store-categories'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar({ storeCategories }: { storeCategories: StoreCategory[] }) {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/products', label: 'Boutique' },
    ...storeCategories.map((category) => ({
      href: catalogHref({ category: category.slug }),
      label: category.name,
    })),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="hidden border-b border-border/60 bg-primary text-primary-foreground sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-2 py-1.5 text-[11px] tracking-[0.14em] sm:px-3">
          <p>
            {SITE.neighborhood}, {SITE.city}
          </p>
          <a href={PHONE_HREF} className="transition-opacity hover:opacity-80">
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-2.5 sm:px-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${SITE.name} — Accueil`}>
          <Logo size="sm" priority />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="#boutique"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Adresse
          </a>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link
            href="/checkout"
            aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier'}
            className="relative flex min-h-11 min-w-11 items-center justify-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="sr-only">Panier</span>
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? 'translate-y-2.5 rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? '-translate-y-2.5 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-card px-2 py-6 sm:px-3 lg:hidden">
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#boutique"
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-muted-foreground hover:text-primary"
            >
              Adresse
            </a>
            <a href={PHONE_HREF} className="text-base font-medium text-primary">
              {SITE.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
