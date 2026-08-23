import Image from 'next/image'
import Link from 'next/link'
import { catalogHref } from '@/lib/catalog-href'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoryCard({ category }: { category: StoreCategory }) {
  return (
    <Link
      href={catalogHref({ category: category.slug })}
      className="relative block overflow-hidden rounded-[1.75rem] border border-border/80 bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            quality={70}
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-left">
          <p className="text-[11px] font-medium tracking-wide text-white">
            {category.tagline}
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium tracking-tight text-white">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
