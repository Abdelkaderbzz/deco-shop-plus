'use client'

import { Logo } from '@/components/logo'
import { useCart } from '@/components/cart-context'
import { INSTAGRAM_URL } from '@/components/instagram-embed'
import { TIKTOK_URL } from '@/lib/social-links'
import type { StoreCategory } from '@/lib/store-categories'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar({ storeCategories }: { storeCategories: StoreCategory[] }) {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/products', label: 'BOUTIQUE' },
    ...storeCategories.map((category) => ({
      href: `/products?category=${category.slug}`,
      label: category.name.toUpperCase(),
    })),
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-3" aria-label="Parfumerie Janna — Accueil">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
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
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-light tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
          >
            TIKTOK
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/checkout"
            aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier'}
            className="relative flex min-h-11 min-w-11 items-center justify-center gap-2 text-sm font-light tracking-widest text-foreground transition-colors hover:text-primary"
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
            {navLinks.map((link) => (
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
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light tracking-widest text-muted-foreground hover:text-primary"
            >
              TIKTOK
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
