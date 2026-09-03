'use client'

import { useI18n } from '@/lib/i18n/provider'

export function ProductTrustBox({ className }: { className?: string }) {
  const { dict } = useI18n()
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-card text-sm text-foreground ${className ?? ''}`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          aria-hidden
        >
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h4l3 3v2h-7" />
          <circle cx="7" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="8.5" r="3.2" />
          <path d="M17.5 7.2v1.5l1.1.7" />
        </svg>
        <p>{dict.trust.delivery}</p>
      </div>
      <div className="mx-4 h-px bg-border" />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          aria-hidden
        >
          <polygon points="12 3 14.9 9 21.5 9.8 16.6 14.3 18 21 12 17.6 6 21 7.4 14.3 2.5 9.8 9.1 9" />
        </svg>
        <p>
          {dict.trust.quality} <span className="font-semibold">{dict.trust.premium}</span>
        </p>
      </div>
    </div>
  )
}
