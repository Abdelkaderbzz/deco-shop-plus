import { getProductById, getRelatedProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { getDeliveryFee } from '@/app/actions/settings'
import { ProductCard } from '@/components/product-card'
import { ProductGallery } from '@/components/product-gallery'
import { ProductPrice } from '@/components/product-price'
import { parseProductImages } from '@/lib/product-images'
import { formatPriceTnd } from '@/lib/product-price'
import { getCategoryLabel } from '@/lib/store-categories'
import { AddToCartButton } from './add-to-cart-button'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 120

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, deliveryFee, categories, relatedProducts] = await Promise.all([
    getProductById(Number(id)),
    getDeliveryFee(),
    getCategories(),
    getRelatedProducts(Number(id)),
  ])
  if (!product) notFound()

  const categoryLabel = getCategoryLabel(product.category, categories)

  const sizes: string[] = JSON.parse(product.sizes || '[]')
  const images = parseProductImages(product)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-light tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">ACCUEIL</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">BOUTIQUE</Link>
        <span>/</span>
        <span className="text-foreground">{product.name.toUpperCase()}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Image */}
        <ProductGallery
          images={images}
          alt={`${product.brand} ${product.name}`}
        />

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">
              {product.brand.toUpperCase()}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-light tracking-wide text-foreground leading-tight">
              {product.name}
            </h1>
            <p className="mt-1 text-[10px] font-light tracking-widest text-muted-foreground">
              {categoryLabel.toUpperCase()}
            </p>
          </div>

          <div className="h-px w-16 bg-primary/30" />

          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
          />

          {product.description && (
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {!product.inStock ? (
            <div className="border border-border px-4 py-3 text-center text-xs font-light tracking-widest text-muted-foreground">
              RUPTURE DE STOCK
            </div>
          ) : (
            <AddToCartButton product={product} sizes={sizes} />
          )}

          <div className="border-t border-border pt-4 text-[11px] font-light tracking-wider text-muted-foreground">
            <p>Livraison disponible en Tunisie, {formatPriceTnd(deliveryFee)} TND</p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">SELECTION</p>
            <h2 className="mt-2 font-serif text-2xl font-light tracking-widest text-foreground">
              VOUS AIMEREZ AUSSI
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} categories={categories} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
