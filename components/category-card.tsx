import Image from 'next/image'
import Link from 'next/link'
import { catalogHref } from '@/lib/catalog-href'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoryCard({ category }: { category: StoreCategory }) {
  return (
    <Link
      href={catalogHref({ category: category.slug })}
      className="relative block overflow-hidden rounded-2xl border border-border/80 bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 40vw, 200px"
            quality={70}
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
          <p className="line-clamp-2 text-[10px] font-medium tracking-wide text-white/90">
            {category.tagline}
          </p>
          <h3 className="mt-0.5 font-serif text-base font-medium tracking-tight text-white sm:text-lg">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
