import Image from 'next/image'
import Link from 'next/link'
import { EpuiseBadge } from '@/components/epuise-badge'
import { ProductPrice } from '@/components/product-price'
import { PromoBadge } from '@/components/promo-badge'
import { isPromoActive } from '@/lib/product-colors'
import { parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, parseProductSizes } from '@/lib/product-sizes'
import { productHref } from '@/lib/catalog-href'
import { getCategoryLabel } from '@/lib/store-categories'

type Product = {
  id: number
  slug?: string | null
  name: string
  brand: string
  price: string
  compareAtPrice?: string | null
  imageUrl: string | null
  category: string
  inStock: boolean
  promoEnabled?: boolean | null
  promoLabel?: string | null
  promoBgColor?: string | null
  promoTextColor?: string | null
  sizes?: string | null
}

function ProductHoverOverlays({
  product,
  promo,
  categoryLabel,
  compact = false,
}: {
  product: Product
  promo: boolean
  categoryLabel: string
  compact?: boolean
}) {
  return (
    <>
      {!product.inStock ? (
        <EpuiseBadge className={compact ? 'top-2 left-2 px-2.5 py-0.5 text-[10px]' : undefined} />
      ) : (
        <>
          <PromoBadge
            product={product}
            className={compact ? 'top-2 left-2 px-2 py-0.5 text-[10px]' : undefined}
          />
          {!promo && !compact && (
            <div className="absolute top-3 left-3">
              <span className="bg-card/90 px-2.5 py-1 text-[10px] font-medium tracking-wide text-primary">
                {categoryLabel}
              </span>
            </div>
          )}
        </>
      )}
    </>
  )
}

export function ProductCard({
  product,
  categories,
  variant = 'grid',
  priority = false,
}: {
  product: Product
  categories?: { slug: string; name: string }[]
  variant?: 'grid' | 'list'
  priority?: boolean
}) {
  const categoryLabel = getCategoryLabel(product.category, categories)
  const promo = isPromoActive(product)
  const from = hasVariableSizePrices(
    parseProductSizes(product.sizes, parsePrice(product.price) ?? 0),
  )

  if (variant === 'list') {
    return (
      <Link
        href={productHref(product)}
        prefetch={false}
        className="block w-56 shrink-0 sm:w-66"
      >
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={`${product.brand} ${product.name}`}
                fill
                sizes="(max-width: 640px) 224px, 264px"
                quality={70}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-border">
                  <rect x="3" y="6" width="18" height="12" rx="3" />
                </svg>
              </div>
            )}
            <ProductHoverOverlays product={product} promo={promo} categoryLabel={categoryLabel} compact />
          </div>
          <div className="p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary">{product.brand}</p>
            <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-tight text-foreground">{product.name}</h3>
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="xs"
              accentColor={promo ? product.promoBgColor : null}
              className="mt-1.5"
              from={from}
            />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={productHref(product)} prefetch={false} className="block">
      <div className="relative overflow-hidden rounded-md border border-border bg-card">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={`${product.brand} ${product.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              quality={70}
              priority={priority}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-border">
                <rect x="3" y="6" width="18" height="12" rx="3" />
              </svg>
            </div>
          )}
          <ProductHoverOverlays product={product} promo={promo} categoryLabel={categoryLabel} />
        </div>

        <div className="p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">{product.brand}</p>
          <h3 className="mt-1 font-serif text-base font-medium leading-tight tracking-tight text-foreground">{product.name}</h3>
          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            accentColor={promo ? product.promoBgColor : null}
            className="mt-3"
            from={from}
          />
        </div>
      </div>
    </Link>
  )
}
