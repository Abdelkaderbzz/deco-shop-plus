'use client'

import { CategoryPhotos } from '@/components/category-photos'
import { ProductCard } from '@/components/product-card'
import { Reveal } from '@/components/reveal'
import { useRouteTransition } from '@/lib/use-route-transition'
import type { StoreCategory } from '@/lib/store-categories'
import { catalogHref } from '@/lib/catalog-href'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: number
  name: string
  brand: string
  price: string
  compareAtPrice?: string | null
  imageUrl: string | null
  category: string
  inStock: boolean
  promoEnabled?: boolean | null
  promoLabel?: string | null
  promoBgColor?: string | null
  promoTextColor?: string | null
  sizes?: string | null
}

export function ProductsClient({
  products,
  total,
  page,
  totalPages,
  search: initialSearch,
  category,
  storeCategories,
}: {
  products: Product[]
  total: number
  page: number
  totalPages: number
  search: string
  category: string
  storeCategories: StoreCategory[]
}) {
  const { isPending, push } = useRouteTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [category, page])

  const allCategories = useMemo(
    () => [
      { value: 'all', label: 'Tous' },
      ...storeCategories.map((item) => ({
        value: item.slug,
        label: item.name,
      })),
    ],
    [storeCategories],
  )

  function submitSearch() {
    push(catalogHref({ search, category, page: 1 }))
  }

  return (
    <>
      <CategoryPhotos category={category} categories={storeCategories} />

      <Reveal className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="relative w-full lg:w-72 lg:shrink-0">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                submitSearch()
              }
            }}
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-4 text-sm font-light text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
          />
        </div>

        <div className="flex w-full flex-1 flex-wrap gap-2">
          {allCategories.map((cat) => {
            const href = catalogHref({ search: initialSearch, category: cat.value, page: 1 })
            const active = category === cat.value
            return (
              <Link
                key={cat.value}
                href={href}
                prefetch
                className={`rounded-full border px-3 py-2 text-center text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>
      </Reveal>

      <div className="relative min-h-[30vh]">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              Chargement...
            </div>
          </div>
        )}

        {total === 0 ? (
          category !== 'all' && storeCategories.some((item) => item.slug === category) ? (
            <p className="py-8 text-center text-sm font-light tracking-widest text-muted-foreground">
              Produits bientot disponibles dans cette categorie
            </p>
          ) : (
            <div className="py-24 text-center">
              <p className="text-sm font-light tracking-widest text-muted-foreground">AUCUN PRODUIT TROUVE</p>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categories={storeCategories.map((item) => ({ slug: item.slug, name: item.name }))}
                  priority={index < 4}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-sm font-light text-muted-foreground">
                  Page {page} / {totalPages} · {total} produit{total > 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={catalogHref({ search: initialSearch, category, page: page - 1 })}
                      prefetch
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      Precedent
                    </Link>
                  ) : (
                    <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground opacity-40">
                      Precedent
                    </span>
                  )}
                  {page < totalPages ? (
                    <Link
                      href={catalogHref({ search: initialSearch, category, page: page + 1 })}
                      prefetch
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Suivant
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground opacity-40">
                      Suivant
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
