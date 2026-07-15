import { getProductById } from '@/app/actions/products'
import { getDeliveryFee } from '@/app/actions/settings'
import { ProductGallery } from '@/components/product-gallery'
import { parseProductImages } from '@/lib/product-images'
import { AddToCartButton } from './add-to-cart-button'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, deliveryFee] = await Promise.all([
    getProductById(Number(id)),
    getDeliveryFee(),
  ])
  if (!product) notFound()

  const sizes: string[] = JSON.parse(product.sizes || '[]')
  const images = parseProductImages(product)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] font-light tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">ACCUEIL</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">PARFUMS</Link>
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
              {product.category.toUpperCase()}
            </p>
          </div>

          <div className="h-px w-16 bg-primary/30" />

          <p className="font-serif text-2xl font-light text-foreground">
            {parseFloat(product.price).toFixed(3)}{' '}
            <span className="text-sm text-muted-foreground">TND</span>
          </p>

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

          <div className="border-t border-border pt-4 text-[11px] font-light tracking-wider text-muted-foreground space-y-2">
            <p>Livraison disponible en Tunisie &mdash; {deliveryFee.toFixed(3)} TND</p>
            <p>Retrait en boutique gratuit</p>
          </div>
        </div>
      </div>
    </div>
  )
}
