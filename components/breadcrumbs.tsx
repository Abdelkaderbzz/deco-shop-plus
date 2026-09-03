'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/provider'

export type BreadcrumbItem = {
  name: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { dict } = useI18n()
  return (
    <nav
      aria-label={dict.nav.breadcrumb}
      className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground"
    >
      {items.map((item, index) => (
        <span key={`${item.name}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-primary">
              {item.name}
            </Link>
          ) : (
            <span className="text-foreground">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
