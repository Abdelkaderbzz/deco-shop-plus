'use client'

import type { SiteBannerFormValues } from '@/lib/validations'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const VARIANTS = {
  offer: {
    label: 'OFFRE',
    barCls: 'bg-primary text-primary-foreground',
    labelCls: 'bg-primary-foreground/15 text-primary-foreground',
    linkCls: 'border-primary-foreground/40 hover:bg-primary-foreground/10',
  },
  discount: {
    label: 'PROMO',
    barCls:
      'bg-linear-to-r from-[#b8912f] via-[#e0c078] to-[#b8912f] text-primary-foreground',
    labelCls: 'bg-primary-foreground/15 text-primary-foreground',
    linkCls: 'border-primary-foreground/40 hover:bg-primary-foreground/10',
  },
  news: {
    label: 'NOUVEAUTE',
    barCls: 'border-b border-border bg-secondary text-foreground',
    labelCls: 'bg-primary/20 text-primary',
    linkCls: 'border-primary/50 text-primary hover:bg-primary/10',
  },
} as const

/** Dismissal is keyed by content, so editing the message brings the banner back
 *  for visitors who had already closed the previous one. */
function storageKey(message: string) {
  let hash = 0
  for (let index = 0; index < message.length; index += 1) {
    hash = (hash * 31 + message.charCodeAt(index)) | 0
  }
  return `wog-banner-dismissed-${hash}`
}

export function SiteBanner({ banner }: { banner: SiteBannerFormValues }) {
  const [dismissed, setDismissed] = useState(false)
  const variant = VARIANTS[banner.bannerVariant] ?? VARIANTS.offer
  const key = storageKey(banner.bannerMessage)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(key) === '1') setDismissed(true)
    } catch {
      // Private mode or blocked storage — keep the banner visible.
    }
  }, [key])

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(key, '1')
    } catch {
      // Nothing to persist; hiding for this page view is enough.
    }
  }

  if (dismissed) return null

  const hasLink = banner.bannerLinkHref !== ''
  const linkLabel = banner.bannerLinkLabel || 'DECOUVRIR'
  const isExternal = /^https?:\/\//.test(banner.bannerLinkHref)

  return (
    <div className={variant.barCls} role="region" aria-label="Annonce boutique">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span
          className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium tracking-[0.2em] sm:inline-block ${variant.labelCls}`}
        >
          {variant.label}
        </span>

        <p className="min-w-0 flex-1 truncate text-center text-[11px] font-light tracking-wider sm:text-xs">
          {banner.bannerMessage}
        </p>

        {hasLink &&
          (isExternal ? (
            <a
              href={banner.bannerLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden shrink-0 rounded-full border px-3 py-1 text-[10px] font-light tracking-[0.15em] transition-colors sm:inline-block ${variant.linkCls}`}
            >
              {linkLabel.toUpperCase()}
            </a>
          ) : (
            <Link
              href={banner.bannerLinkHref}
              className={`hidden shrink-0 rounded-full border px-3 py-1 text-[10px] font-light tracking-[0.15em] transition-colors sm:inline-block ${variant.linkCls}`}
            >
              {linkLabel.toUpperCase()}
            </Link>
          ))}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer l'annonce"
          className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
