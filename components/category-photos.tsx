import Image from 'next/image'
import Link from 'next/link'
import { catalogHref } from '@/lib/catalog-href'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoryPhotos({
  category,
  categories,
}: {
  category: string
  categories: StoreCategory[]
}) {
  if (category === 'all') {
    return (
      <div className="mb-10">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-foreground">Boutique</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Coussins et rangement
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, index) => (
            <Link
              key={cat.slug}
              href={catalogHref({ category: cat.slug })}
              prefetch={false}
              className="overflow-hidden rounded-[1.5rem] border border-border/60"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    priority={index < 2}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="bg-card py-2.5 text-center text-xs font-medium text-muted-foreground">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const storeCategory = categories.find((item) => item.slug === category)
  if (!storeCategory) return null

  return (
    <div className="mb-10 overflow-hidden rounded-[1.75rem] border border-border/60 bg-card">
      <div className="relative aspect-[21/9] overflow-hidden bg-secondary md:aspect-[3/1]">
        {storeCategory.image ? (
          <Image
            src={storeCategory.image}
            alt={storeCategory.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <p className="text-[11px] font-medium tracking-wide text-white">{storeCategory.tagline}</p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-white md:text-4xl">
            {storeCategory.name}
          </h1>
        </div>
      </div>
    </div>
  )
}
