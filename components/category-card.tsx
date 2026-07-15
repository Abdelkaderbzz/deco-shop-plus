import Link from 'next/link'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoryCard({ category }: { category: StoreCategory }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-left">
          <p className="text-[10px] font-light tracking-[0.35em] text-primary-foreground/80">
            {category.tagline.toUpperCase()}
          </p>
          <h3 className="mt-1 font-serif text-2xl font-light tracking-wide text-primary-foreground">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
