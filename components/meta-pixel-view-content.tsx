'use client'

import { trackViewContent } from '@/lib/meta-pixel'
import { useEffect, useRef } from 'react'

export function MetaPixelViewContent({
  productId,
  productName,
  price,
}: {
  productId: number
  productName: string
  price: number
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current || price <= 0) return
    tracked.current = true
    trackViewContent({
      productId,
      productName,
      price,
      quantity: 1,
    })
  }, [productId, productName, price])

  return null
}
