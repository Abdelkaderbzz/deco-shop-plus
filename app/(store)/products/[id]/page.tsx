import type { Metadata } from 'next'
import { getPublishedProductByParam, getPublishedProductsForSitemap, getRelatedProducts } from '@/app/actions/products'
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
import { parseProductBundles } from '@/lib/product-bundles'
import { parseProductImages } from '@/lib/product-images'
import { hasVariableSizePrices, lowestSizePrice, parseProductSizes, uniqueDimensionLabel } from '@/lib/product-sizes'
import { parsePrice } from '@/lib/product-price'
import { breadcrumbJsonLd, pageAlternates, productJsonLd, productMetaDescription } from '@/lib/seo'
import { getStorefrontI18n } from '@/lib/i18n/get-locale'
import { localizeCategories, localizeCategoryLabel } from '@/lib/i18n/categories'
import { localizeProduct } from '@/lib/i18n/products'
import { SITE } from '@/lib/site'
import { isNumericProductParam } from '@/lib/slug'
import { getCategoryLabel } from '@/lib/store-categories'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { MetaPixelViewContent } from '@/components/meta-pixel-view-content'
import { AddToCartButton } from './add-to-cart-button'
import { notFound, permanentRedirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const products = await getPublishedProductsForSitemap()
    return products
      .map((product) => product.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ id: slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  await connection()
  const { id } = await params
  const [{ dict, locale }, productRow, categories] = await Promise.all([
    getStorefrontI18n(),
    getPublishedProductByParam(id),
    getCategories(),
  ])
  if (!productRow) {
    return { title: dict.product.notFound, robots: { index: false, follow: true } }
  }

  if (productRow.slug && isNumericProductParam(id)) {
    permanentRedirect(productHref(productRow))
  }

  const product = localizeProduct(productRow, locale)
  const categoryLabel = localizeCategoryLabel(
    product.category,
    getCategoryLabel(product.category, categories),
    dict,
  )
  const description = productMetaDescription(product, locale)
  const url = productHref(product)
  const gallery = parseProductImages(product)
  const images =
    gallery.length > 0
      ? gallery.map((imageUrl) => ({
          url: imageUrl,
          alt: `${product.brand} ${product.name}`,
        }))
      : undefined

  return {
    title: dict.product.title(product.name, dict.site.city),
    description,
    keywords: [
      product.name,
      product.brand,
      categoryLabel,
      dict.site.fabric,
      SITE.city,
      dict.site.neighborhood,
      ...dict.site.keywords,
    ],
    alternates: pageAlternates(url),
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
      images: gallery.length > 0 ? gallery : undefined,
    },
    other: {
      'product:price:amount': product.price,
      'product:price:currency': 'TND',
      'product:availability': product.inStock ? 'in stock' : 'out of stock',
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params
  const [{ dict, locale }, productRow, categories] = await Promise.all([
    getStorefrontI18n(),
    getPublishedProductByParam(id),
    getCategories(),
  ])
  if (!productRow) notFound()
  if (productRow.slug && isNumericProductParam(id)) {
    permanentRedirect(productHref(productRow))
  }

  const product = localizeProduct(productRow, locale)

  const categoryLabel = localizeCategoryLabel(
    product.category,
    getCategoryLabel(product.category, categories),
    dict,
  )

  const sizes = parseProductSizes(product.sizes, Number.parseFloat(product.price) || 0)
  const dimension = uniqueDimensionLabel(sizes)
  const colors = parseProductColors(product)
  const bundles = parseProductBundles(product)
  const images = parseProductImages(product)
  const promo = isPromoActive(product)
  const categoryPath = `/categorie/${product.category}`
  const basePrice = parsePrice(product.price) ?? 0
  const viewContentPrice = lowestSizePrice(sizes, basePrice) || basePrice

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <MetaPixelViewContent
        productId={product.id}
        productName={product.name}
        price={viewContentPrice}
      />
      <JsonLd data={productJsonLd(product, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: '/' },
          { name: dict.nav.shop, path: '/products' },
          { name: categoryLabel, path: categoryPath },
          { name: product.name, path: productHref(product) },
        ])}
      />
      <Reveal className="mb-8">
        <Breadcrumbs
          items={[
            { name: dict.nav.home, href: '/' },
            { name: dict.nav.shop, href: '/products' },
            { name: categoryLabel, href: categoryPath },
            { name: product.name },
          ]}
        />
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
                {dict.product.outOfStock}
              </div>
            </>
          ) : (
            <AddToCartButton
              product={product}
              sizes={sizes}
              colors={colors}
              bundles={bundles}
              stock={product.stock ?? 0}
              accentColor={promo ? product.promoBgColor : null}
            />
          )}

          {product.description && (
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">{dict.product.fabric}</dt>
            <dd className="font-medium text-foreground">{dict.site.fabric}</dd>
            {dimension ? (
              <>
                <dt className="text-muted-foreground">{dict.product.dimensions}</dt>
                <dd className="font-medium text-foreground">{dimension}</dd>
              </>
            ) : null}
          </dl>

          <ProductTrustBox className="mt-1" />
        </Reveal>
      </div>

      <Suspense fallback={null}>
        <RelatedProducts productId={product.id} categories={categories} />
      </Suspense>
    </div>
  )
}

async function RelatedProducts({
  productId,
  categories,
}: {
  productId: number
  categories: { slug: string; name: string }[]
}) {
  const [{ dict }, relatedProducts] = await Promise.all([
    getStorefrontI18n(),
    getRelatedProducts(productId),
  ])
  if (relatedProducts.length === 0) return null
  const labels = localizeCategories(
    categories.map((c) => ({ slug: c.slug, name: c.name, tagline: c.name, image: '' })),
    dict,
  )

  return (
    <section className="mt-10 border-t border-border pt-6">
      <Reveal className="mb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-primary">{dict.product.relatedEyebrow}</p>
        <h2 className="mt-1 text-lg font-medium tracking-tight text-foreground">
          {dict.product.relatedTitle}
        </h2>
      </Reveal>
      <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 sm:-mx-3 sm:px-3 [scrollbar-width:thin]">
        {relatedProducts.map((related) => (
          <ProductCard key={related.id} product={related} categories={labels} variant="list" />
        ))}
      </div>
    </section>
  )
}
