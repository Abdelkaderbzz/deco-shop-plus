'use client'

import Link from 'next/link'

type Product = {
  id: number
  name: string
  brand: string
  price: string
  imageUrl: string | null
  category: string
  inStock: boolean
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} prefetch={false} className="group block">
      <div className="relative overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.brand} ${product.name}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-border">
                <path d="M12 2C8 2 5 5.5 5 9c0 5 7 13 7 13s7-8 7-13c0-3.5-3-7-7-7z" />
              </svg>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <span className="text-xs font-light tracking-widest text-muted-foreground">RUPTURE</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="bg-background/80 px-2 py-1 text-[10px] font-light tracking-widest text-muted-foreground">
              {product.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] font-light tracking-widest text-primary">{product.brand.toUpperCase()}</p>
          <h3 className="mt-1 font-serif text-base font-light tracking-wide text-foreground leading-tight">{product.name}</h3>
          <p className="mt-3 text-sm font-light text-foreground">
            {parseFloat(product.price).toFixed(3)}{' '}
            <span className="text-[10px] text-muted-foreground">TND</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
