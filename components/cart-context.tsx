'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type CartItem = {
  productId: number
  productName: string
  productBrand: string
  size: string
  color?: string
  quantity: number
  price: number
  imageUrl?: string
}

function sameLine(a: Pick<CartItem, 'productId' | 'size' | 'color'>, b: Pick<CartItem, 'productId' | 'size' | 'color'>) {
  return a.productId === b.productId && a.size === b.size && (a.color || '') === (b.color || '')
}

export function cartLineKey(item: Pick<CartItem, 'productId' | 'size' | 'color'>) {
  return `${item.productId}::${item.size}::${item.color || ''}`
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (item: Pick<CartItem, 'productId' | 'size' | 'color'>) => void
  updateQuantity: (item: Pick<CartItem, 'productId' | 'size' | 'color'>, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((line) => sameLine(line, item))
      if (existing) {
        return prev.map((line) =>
          sameLine(line, item) ? { ...line, quantity: line.quantity + item.quantity } : line,
        )
      }
      return [...prev, { ...item, color: item.color || '' }]
    })
  }, [])

  const removeItem = useCallback((item: Pick<CartItem, 'productId' | 'size' | 'color'>) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, item)))
  }, [])

  const updateQuantity = useCallback(
    (item: Pick<CartItem, 'productId' | 'size' | 'color'>, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((line) => !sameLine(line, item)))
      } else {
        setItems((prev) =>
          prev.map((line) => (sameLine(line, item) ? { ...line, quantity } : line)),
        )
      }
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
