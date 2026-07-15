'use client'

import { ProductCard } from '@/components/product-card'
import { usePathname } from 'next/navigation'
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

type Category = {
  slug: string
  name: string
}

function readFiltersFromUrl() {
  if (typeof window === 'undefined') {
    return { search: '', category: 'all' }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? 'all',
  }
}

export function ProductsClient({
  products,
  initialSearch,
  initialCategory,
  categories,
}: {
  products: Product[]
  initialSearch: string
  initialCategory: string
  categories: Category[]
}) {
  const pathname = usePathname()
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)

  useEffect(() => {
    function syncFromUrl() {
      const next = readFiltersFromUrl()
      setSearch(next.search)
      setCategory(next.category)
    }

    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const allCategories = useMemo(
    () => [
      { value: 'all', label: 'TOUS' },
      ...categories.map((c) => ({
        value: c.slug,
        label: c.name.toUpperCase(),
      })),
    ],
    [categories],
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
    window.history.replaceState(window.history.state, '', url)
  }

  function selectCategory(value: string) {
    if (value === category) return
    setCategory(value)
    syncUrl(search, value)
  }

  return (
    <>
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
            placeholder="Rechercher un parfum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                syncUrl(search, category)
              }
            }}
            className="w-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm font-light text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />
        </div>

        <div className="grid w-full flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-xl">
          {allCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => selectCategory(cat.value)}
              className={`border px-3 py-2 text-center text-[10px] font-light tracking-[0.2em] transition-colors ${
                category === cat.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[50vh]">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm font-light tracking-widest text-[#8a8a8a]">AUCUN PARFUM TROUVE</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
