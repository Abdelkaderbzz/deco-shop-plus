'use client'

import { useCart } from '@/components/cart-context'
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
}: {
  product: Product
  sizes: string[]
}) {
  const { addItem } = useCart()
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '')
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!selectedSize) return
    addItem({
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      size: selectedSize,
      quantity: 1,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl ?? undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-light tracking-[0.3em] text-muted-foreground">TAILLE / ML</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border px-4 py-2 text-sm font-light transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
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
          onClick={handleAdd}
          disabled={!selectedSize}
          className="flex-1 border border-primary py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
        >
          {added ? 'AJOUTE !' : 'AJOUTER AU PANIER'}
        </button>
        <button
          onClick={() => {
            handleAdd()
            router.push('/checkout')
          }}
          disabled={!selectedSize}
          className="border border-foreground bg-foreground px-6 py-3 text-xs font-light tracking-[0.3em] text-background transition-all hover:bg-primary hover:border-primary disabled:opacity-40"
        >
          COMMANDER
        </button>
      </div>
    </div>
  )
}
