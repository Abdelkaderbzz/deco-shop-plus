import type { Metadata } from 'next'
import { getProductById, getPublishedProductsForSitemap, getRelatedProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { JsonLd } from '@/components/json-ld'
import { ProductCard } from '@/components/product-card'
import { ProductGallery } from '@/components/product-gallery'
import { ProductPrice } from '@/components/product-price'
import { PromoBadge } from '@/components/promo-badge'
import { EpuiseBadge } from '@/components/epuise-badge'
import { ProductTrustBox } from '@/components/product-trust-box'
import { Reveal } from '@/components/reveal'
import { productHref } from '@/lib/catalog-href'
import { parseProductColors, isPromoActive } from '@/lib/product-colors'
import { parseProductImages } from '@/lib/product-images'
import { hasVariableSizePrices, parseProductSizes } from '@/lib/product-sizes'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { getCategoryLabel } from '@/lib/store-categories'
import { AddToCartButton } from './add-to-cart-button'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 120
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const products = await getPublishedProductsForSitemap()
    return products.map((product) => ({ id: String(product.id) }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(Number(id))
  if (!product) {
    return { title: 'Produit introuvable', robots: { index: false, follow: true } }
  }

  const description =
    product.description?.trim() ||
    `${product.name} chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}. ${SITE.tagline}.`
  const url = productHref(product.id)
  const images = product.imageUrl
    ? [{ url: product.imageUrl, alt: `${product.brand} ${product.name}` }]
    : undefined

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: `${product.name} | ${SITE.name}`,
      description,
      url,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories, relatedProducts] = await Promise.all([
    getProductById(Number(id)),
    getCategories(),
    getRelatedProducts(Number(id)),
  ])
  if (!product) notFound()

  const categoryLabel = getCategoryLabel(product.category, categories)

  const sizes = parseProductSizes(product.sizes, Number.parseFloat(product.price) || 0)
  const colors = parseProductColors(product)
  const images = parseProductImages(product)
  const promo = isPromoActive(product)
  const categoryPath = `/categorie/${product.category}`

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Boutique', path: '/products' },
          { name: categoryLabel, path: categoryPath },
          { name: product.name, path: productHref(product.id) },
        ])}
      />
      <Reveal className="mb-8">
        <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">Boutique</Link>
          <span>/</span>
          <Link href={categoryPath} className="hover:text-primary transition-colors">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </Reveal>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <Reveal variant="left">
          <ProductGallery
            images={images}
            alt={`${product.brand} ${product.name}`}
            badge={
              !product.inStock ? <EpuiseBadge /> : <PromoBadge product={product} />
            }
          />
        </Reveal>

        <Reveal variant="right" className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {product.brand}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground leading-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {categoryLabel}
            </p>
          </div>

          <div className="h-px w-16 bg-primary/30" />

          {product.description && (
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {!product.inStock ? (
            <>
              <ProductPrice
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
                accentColor={promo ? product.promoBgColor : null}
                from={hasVariableSizePrices(sizes)}
              />
              <div className="rounded-full bg-black px-4 py-3 text-center text-sm font-semibold tracking-wide text-white">
                Épuisé
              </div>
            </>
          ) : (
            <AddToCartButton
              product={product}
              sizes={sizes}
              colors={colors}
              stock={product.stock ?? 0}
              accentColor={promo ? product.promoBgColor : null}
            />
          )}

          <ProductTrustBox className="mt-1" />
        </Reveal>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-10 border-t border-border pt-6">
          <Reveal className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-primary">Selection</p>
            <h2 className="mt-1 text-lg font-medium tracking-tight text-foreground">
              Vous aimerez aussi
            </h2>
          </Reveal>
          <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 sm:-mx-3 sm:px-3 [scrollbar-width:thin]">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} categories={categories} variant="list" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
