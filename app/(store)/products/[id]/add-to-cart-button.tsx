'use client'

import { useCart } from '@/components/cart-context'
import { ProductPrice } from '@/components/product-price'
import type { ProductColor } from '@/lib/product-colors'
import { formatPriceTnd, parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, priceForSize, type ProductSize } from '@/lib/product-sizes'
import { stockLabel } from '@/lib/product-stock'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Product = {
  id: number
  name: string
  brand: string
  price: string
  compareAtPrice?: string | null
  imageUrl: string | null
}

export function AddToCartButton({
  product,
  sizes,
  colors,
  stock,
  accentColor,
}: {
  product: Product
  sizes: ProductSize[]
  colors: ProductColor[]
  stock: number
  accentColor?: string | null
}) {
  const { addItem, items } = useCart()
  const router = useRouter()
  const fallbackPrice = parsePrice(product.price) ?? 0
  const sizeOptions = sizes.length > 0 ? sizes : [{ name: 'Unique', price: fallbackPrice }]
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.name ?? '')
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '')
  const [added, setAdded] = useState(false)

  const selectedPrice = priceForSize(sizeOptions, selectedSize, fallbackPrice)
  const showSizePrices = hasVariableSizePrices(sizeOptions)
  const inCart = items
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)
  const remaining = Math.max(0, stock - inCart)
  const canAdd = Boolean(selectedSize) && (colors.length === 0 || Boolean(selectedColor)) && remaining > 0

  function handleAdd() {
    if (!canAdd) return
    addItem({
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      price: selectedPrice,
      imageUrl: product.imageUrl ?? undefined,
      stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <ProductPrice
        price={selectedPrice.toFixed(3)}
        compareAtPrice={product.compareAtPrice}
        size="lg"
        accentColor={accentColor}
      />

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Couleur
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const selected = selectedColor === color.name
              return (
                <button
                  key={`${color.name}-${color.hex}`}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-light transition-all ${
                    selected
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  <span
                    className="size-4 rounded-full border border-black/10"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  {color.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Taille / format</p>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size.name}
                type="button"
                onClick={() => setSelectedSize(size.name)}
                className={`rounded-full border px-4 py-2 text-sm font-light transition-all ${
                  selectedSize === size.name
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {size.name}
                {showSizePrices ? (
                  <span className={`ml-1.5 text-[11px] ${selectedSize === size.name ? 'opacity-80' : ''}`}>
                    {formatPriceTnd(size.price)} TND
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1 rounded-full border border-primary bg-primary/5 py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
        >
          {added ? 'AJOUTE !' : remaining <= 0 ? 'PLUS DE STOCK' : 'AJOUTER AU PANIER'}
        </button>
        <button
          type="button"
          onClick={() => {
            handleAdd()
            if (remaining > 0) router.push('/checkout')
          }}
          disabled={!canAdd}
          className="rounded-full border border-foreground bg-foreground px-6 py-3 text-xs font-light tracking-[0.3em] text-background transition-all hover:border-primary hover:bg-primary disabled:opacity-40"
        >
          COMMANDER
        </button>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{stockLabel(remaining)}</p>
    </div>
  )
}
