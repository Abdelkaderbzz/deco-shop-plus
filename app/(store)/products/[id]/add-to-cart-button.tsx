'use client'

import { useCart } from '@/components/cart-context'
import type { ProductColor } from '@/lib/product-colors'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Product = {
  id: number
  name: string
  brand: string
  price: string
  imageUrl: string | null
}

export function AddToCartButton({
  product,
  sizes,
  colors,
}: {
  product: Product
  sizes: string[]
  colors: ProductColor[]
}) {
  const { addItem } = useCart()
  const router = useRouter()
  const sizeOptions = sizes.length > 0 ? sizes : ['Unique']
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '')
  const [added, setAdded] = useState(false)

  const canAdd = Boolean(selectedSize) && (colors.length === 0 || Boolean(selectedColor))

  function handleAdd() {
    if (!canAdd) return
    addItem({
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl ?? undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
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
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-4 py-2 text-sm font-light transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {size}
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
          {added ? 'AJOUTE !' : 'AJOUTER AU PANIER'}
        </button>
        <button
          type="button"
          onClick={() => {
            handleAdd()
            router.push('/checkout')
          }}
          disabled={!canAdd}
          className="rounded-full border border-foreground bg-foreground px-6 py-3 text-xs font-light tracking-[0.3em] text-background transition-all hover:border-primary hover:bg-primary disabled:opacity-40"
        >
          COMMANDER
        </button>
      </div>
    </div>
  )
}
