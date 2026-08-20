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
  stock?: number
}

function sameLine(a: Pick<CartItem, 'productId' | 'size' | 'color'>, b: Pick<CartItem, 'productId' | 'size' | 'color'>) {
  return a.productId === b.productId && a.size === b.size && (a.color || '') === (b.color || '')
}

function quantityForProduct(items: CartItem[], productId: number, except?: Pick<CartItem, 'productId' | 'size' | 'color'>) {
  return items.reduce((sum, line) => {
    if (line.productId !== productId) return sum
    if (except && sameLine(line, except)) return sum
    return sum + line.quantity
  }, 0)
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
      const maxStock = item.stock ?? 99
      const already = quantityForProduct(prev, item.productId)
      const room = Math.max(0, maxStock - already)
      if (room <= 0) return prev

      const quantity = Math.min(item.quantity, room)
      const existing = prev.find((line) => sameLine(line, item))
      if (existing) {
        return prev.map((line) =>
          sameLine(line, item)
            ? { ...line, quantity: line.quantity + quantity, stock: item.stock ?? line.stock }
            : line,
        )
      }
      return [...prev, { ...item, color: item.color || '', quantity }]
    })
  }, [])

  const removeItem = useCallback((item: Pick<CartItem, 'productId' | 'size' | 'color'>) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, item)))
  }, [])

  const updateQuantity = useCallback(
    (item: Pick<CartItem, 'productId' | 'size' | 'color'>, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((line) => !sameLine(line, item)))
        return
      }

      setItems((prev) =>
        prev.map((line) => {
          if (!sameLine(line, item)) return line
          const maxStock = line.stock ?? 99
          const others = quantityForProduct(prev, line.productId, line)
          const capped = Math.min(quantity, Math.max(1, maxStock - others))
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
