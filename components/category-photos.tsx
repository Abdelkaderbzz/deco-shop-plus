import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/reveal'
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
        <Reveal className="mb-8 text-center">
          <p className="text-[10px] font-light tracking-[0.4em] text-primary">NOTRE BOUTIQUE</p>
          <h1 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">Boutique</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
            Parfums femme et homme, de longue tenue
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, index) => (
            <Reveal key={cat.slug} variant="zoom" delay={index * 70}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
              >
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="bg-card py-2.5 text-center text-[10px] font-light tracking-[0.2em] text-muted-foreground group-hover:text-primary">
                  {cat.name.toUpperCase()}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    )
  }

  const storeCategory = categories.find((item) => item.slug === category)
  if (!storeCategory) return null

  return (
    <Reveal className="mb-10" variant="fade">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
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
    </Reveal>
  )
}
