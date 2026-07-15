'use client'

import { useCart } from '@/components/cart-context'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/524882961_17994883307831957_4888978496307767385_n-TtsjvPe8IlxmIpNnpU0tEgXgfwr2N4.jpg"
            alt="Jannah Parfume Logo"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-serif text-xl font-light tracking-widest text-foreground">
            JANNAH PARFUME
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/products"
            className="text-sm font-light tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            PARFUMS
          </Link>
          <a
            href="https://www.instagram.com/jannahparfume/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-light tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            INSTAGRAM
          </a>
        </nav>

        {/* Cart & mobile menu */}
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

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? 'translate-y-2.5 rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-foreground transition-all ${menuOpen ? '-translate-y-2.5 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-6">
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-light tracking-widest text-muted-foreground hover:text-primary"
            >
              PARFUMS
            </Link>
            <a
              href="https://www.instagram.com/jannahparfume/"
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
