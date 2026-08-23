'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

import { lineStockUnits } from '@/lib/product-bundles'

export type CartItem = {
  productId: number
  productName: string
  productBrand: string
  size: string
  color?: string
  bundle?: string
  bundleUnits?: number
  quantity: number
  price: number
  imageUrl?: string
  stock?: number
}

type LineId = Pick<CartItem, 'productId' | 'size' | 'color' | 'bundle'>

function sameLine(a: LineId, b: LineId) {
  return (
    a.productId === b.productId &&
    a.size === b.size &&
    (a.color || '') === (b.color || '') &&
    (a.bundle || '') === (b.bundle || '')
  )
}

function quantityForProduct(items: CartItem[], productId: number, except?: LineId) {
  return items.reduce((sum, line) => {
    if (line.productId !== productId) return sum
    if (except && sameLine(line, except)) return sum
    return sum + lineStockUnits(line.quantity, line.bundleUnits)
  }, 0)
}

export function cartLineKey(item: LineId) {
  return `${item.productId}::${item.size}::${item.color || ''}::${item.bundle || ''}`
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (item: LineId) => void
  updateQuantity: (item: LineId, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const maxStock = item.stock ?? 99
      const already = quantityForProduct(prev, item.productId)
      const room = Math.max(0, maxStock - already)
      const unitsPerPack = Math.max(1, item.bundleUnits || 1)
      if (room < unitsPerPack) return prev

      const quantity = Math.min(item.quantity, Math.floor(room / unitsPerPack))
      const existing = prev.find((line) => sameLine(line, item))
      if (existing) {
        return prev.map((line) =>
          sameLine(line, item)
            ? { ...line, quantity: line.quantity + quantity, stock: item.stock ?? line.stock }
            : line,
        )
      }
      return [...prev, { ...item, color: item.color || '', bundle: item.bundle || '', quantity }]
    })
  }, [])

  const removeItem = useCallback((item: LineId) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, item)))
  }, [])

  const updateQuantity = useCallback(
    (item: LineId, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((line) => !sameLine(line, item)))
        return
      }

      setItems((prev) =>
        prev.map((line) => {
          if (!sameLine(line, item)) return line
          const maxStock = line.stock ?? 99
          const others = quantityForProduct(prev, line.productId, line)
          const unitsPerPack = Math.max(1, line.bundleUnits || 1)
          const maxPacks = Math.max(1, Math.floor((maxStock - others) / unitsPerPack))
          const capped = Math.min(quantity, maxPacks)
          return { ...line, quantity: capped }
        }),
      )
    },
    [],
  )

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const count = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
