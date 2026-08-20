import Image from 'next/image'
import Link from 'next/link'
import { EpuiseBadge } from '@/components/epuise-badge'
import { ProductPrice } from '@/components/product-price'
import { PromoBadge } from '@/components/promo-badge'
import { isPromoActive } from '@/lib/product-colors'
import { parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, parseProductSizes } from '@/lib/product-sizes'
import { getCategoryLabel } from '@/lib/store-categories'

type Product = {
  id: number
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.15" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
    </svg>
  )
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
      <div className="transition-opacity duration-200 group-hover/card:opacity-0">
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
                <span className="bg-card/90 px-2.5 py-1 text-[10px] font-medium tracking-wide text-primary backdrop-blur-sm">
                  {categoryLabel}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      <span
        className={`absolute z-20 flex items-center overflow-hidden rounded-full bg-black text-white opacity-0 shadow-sm transition-[width,opacity] duration-300 ease-out group-hover/card:opacity-100 ${
          compact
            ? 'top-2 right-2 h-8 w-8 hover:w-[9.75rem]'
            : 'top-3 right-3 h-9 w-9 hover:w-40'
        }`}
      >
        <span className={`flex shrink-0 items-center justify-center ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}>
          <EyeIcon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
        </span>
        <span className="whitespace-nowrap pr-3.5 text-xs font-semibold">Aperçu rapide</span>
      </span>
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
        href={`/products/${product.id}`}
        prefetch={false}
        className="group/card block w-[11.5rem] shrink-0 sm:w-[13.5rem]"
      >
        <div className="overflow-hidden rounded-md border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10">
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={`${product.brand} ${product.name}`}
                fill
                sizes="(max-width: 640px) 184px, 216px"
                className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
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
    <Link href={`/products/${product.id}`} className="group/card block">
      <div className="relative overflow-hidden rounded-md border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={`${product.brand} ${product.name}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
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
