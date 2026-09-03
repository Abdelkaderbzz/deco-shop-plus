'use client'

import { catalogHref } from '@/lib/catalog-href'
import { useI18n } from '@/lib/i18n/provider'
import type { StoreCategory } from '@/lib/store-categories'
import Link from 'next/link'

export function CatalogToolbar({
  search,
  category,
  storeCategories,
}: {
  search: string
  category: string
  storeCategories: StoreCategory[]
}) {
  const { dict } = useI18n()
  const action = category === 'all' ? '/products' : catalogHref({ category })
  const chips = [
    { value: 'all', label: dict.categories.all },
    ...storeCategories.map((item) => ({ value: item.slug, label: item.name })),
  ]

  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <form action={action} method="get" className="relative w-full lg:w-72 lg:shrink-0">
        <svg
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder={dict.catalog.search}
          className="w-full rounded-xl border border-border bg-input py-2.5 ps-9 pe-4 text-sm font-light text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
      </form>

      <div className="flex w-full flex-1 flex-wrap gap-2">
        {chips.map((chip) => {
          const href = catalogHref({ search, category: chip.value, page: 1 })
          const active = category === chip.value
          return (
            <Link
              key={chip.value}
              href={href}
              prefetch={false}
              className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-center text-xs font-medium ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {chip.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
