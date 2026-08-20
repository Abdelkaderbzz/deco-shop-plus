export const MAX_PRODUCT_STOCK = 9999

export function parseStock(value: string | number | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? '').trim(), 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.min(MAX_PRODUCT_STOCK, Math.floor(parsed))
}

export function isInStock(stock: number) {
  return stock > 0
}

export function stockLabel(stock: number) {
  if (stock <= 0) return 'Épuisé'
  if (stock === 1) return 'Dernière pièce'
  return `${stock} en stock`
}
