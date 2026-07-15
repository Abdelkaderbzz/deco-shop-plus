'use client'

import Link from 'next/link'
import { getCategoryBySlug, STORE_CATEGORIES } from '@/lib/store-categories'

export function CategoryPhotos({ category }: { category: string }) {
  if (category === 'all') {
    return (
      <div className="mb-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-light tracking-[0.4em] text-primary">NOTRE BOUTIQUE</p>
          <h1 className="mt-2 font-serif text-4xl font-light tracking-widest text-foreground">Boutique</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
            Parfums, maquillage, sacs et soins
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STORE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group overflow-hidden rounded-2xl border border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="bg-card py-2.5 text-center text-[10px] font-light tracking-[0.2em] text-muted-foreground group-hover:text-primary">
                {cat.name.toUpperCase()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const storeCategory = getCategoryBySlug(category)
  if (!storeCategory) return null

  return (
    <div className="mb-10">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="relative aspect-[21/9] overflow-hidden md:aspect-[3/1]">
          <img src={storeCategory.image} alt={storeCategory.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary-foreground/80">
              {storeCategory.tagline.toUpperCase()}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-light tracking-wide text-primary-foreground md:text-4xl">
              {storeCategory.name}
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}
