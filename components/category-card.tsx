import Image from 'next/image'
import Link from 'next/link'
import { catalogHref } from '@/lib/catalog-href'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoryCard({ category }: { category: StoreCategory }) {
  return (
    <Link
      href={catalogHref({ category: category.slug })}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-border/80 bg-card transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-left">
          <p className="text-[11px] font-medium tracking-wide text-primary-foreground/80">
            {category.tagline}
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium tracking-tight text-primary-foreground">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
