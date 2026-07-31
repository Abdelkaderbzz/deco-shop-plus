'use client'

import { CategoryPhotos } from '@/components/category-photos'
import { ProductCard } from '@/components/product-card'
import type { StoreCategory } from '@/lib/store-categories'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: number
  name: string
  brand: string
  price: string
  imageUrl: string | null
  category: string
  inStock: boolean
}

export function ProductsClient({
  products,
  storeCategories,
}: {
  products: Product[]
  storeCategories: StoreCategory[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? 'all'
  const urlSearch = searchParams.get('search') ?? ''
  const [search, setSearch] = useState(urlSearch)

  useEffect(() => {
    setSearch(urlSearch)
  }, [urlSearch])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [category])

  const allCategories = useMemo(
    () => [
      { value: 'all', label: 'TOUS' },
      ...storeCategories.map((category) => ({
        value: category.slug,
        label: category.name.toUpperCase(),
      })),
    ],
    [storeCategories],
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      if (category !== 'all' && product.category !== category) return false
      if (!query) return true
      return (
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
      )
    })
  }, [products, category, search])

  function syncUrl(newSearch: string, newCategory: string) {
    const params = new URLSearchParams()
    if (newSearch.trim()) params.set('search', newSearch.trim())
    if (newCategory !== 'all') params.set('category', newCategory)

    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname
    router.push(url)
  }

  function selectCategory(value: string) {
    if (value === category) return
    syncUrl(search, value)
  }

  return (
    <>
      <CategoryPhotos category={category} categories={storeCategories} />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
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
                syncUrl(search, category)
              }
            }}
            className="w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-4 text-sm font-light text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="flex w-full flex-1 flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => selectCategory(cat.value)}
              className={`rounded-full border px-3 py-2 text-center text-[10px] font-light tracking-[0.2em] transition-colors ${
                category === cat.value
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[30vh]">
        {filteredProducts.length === 0 ? (
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={storeCategories.map((item) => ({ slug: item.slug, name: item.name }))}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
