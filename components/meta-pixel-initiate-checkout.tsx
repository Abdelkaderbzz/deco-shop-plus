'use client'

import type { CartItem } from '@/components/cart-context'
import { trackInitiateCheckout } from '@/lib/meta-pixel'
import { useEffect, useRef } from 'react'

export function MetaPixelInitiateCheckout({
  items,
  value,
  ready = true,
}: {
  items: CartItem[]
  value: number
  ready?: boolean
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!ready || tracked.current || items.length === 0 || value <= 0) return
    tracked.current = true
    trackInitiateCheckout(
      items.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
      value,
    )
  }, [items, value, ready])

  return null
}
