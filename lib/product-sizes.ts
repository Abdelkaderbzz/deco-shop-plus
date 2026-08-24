import { parsePrice } from '@/lib/product-price'

export const MAX_PRODUCT_SIZES = 12

export type ProductSize = {
  name: string
  price: number
}

export type ProductSizeInput = {
  name: string
  price: string
}

function readPrice(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : parsePrice(String(value ?? ''))
  if (parsed == null || parsed <= 0) return fallback
  return parsed
}

export function parseProductSizes(
  raw: string | null | undefined,
  fallbackPrice = 0,
): ProductSize[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const sizes: ProductSize[] = []
    const seen = new Set<string>()

    for (const item of parsed) {
      if (typeof item === 'string') {
        const name = item.trim()
        if (!name || seen.has(name.toLowerCase())) continue
        seen.add(name.toLowerCase())
        sizes.push({ name, price: fallbackPrice })
      } else if (item && typeof item === 'object') {
        const name = String((item as { name?: unknown }).name ?? '').trim()
        if (!name || seen.has(name.toLowerCase())) continue
        seen.add(name.toLowerCase())
        sizes.push({
          name,
          price: readPrice((item as { price?: unknown }).price, fallbackPrice),
        })
      }
      if (sizes.length >= MAX_PRODUCT_SIZES) break
    }

    return sizes
  } catch {
    return []
  }
}

export function serializeProductSizes(sizes: ProductSizeInput[] | ProductSize[]): string {
  const clean: ProductSize[] = []
  const seen = new Set<string>()

  for (const size of sizes) {
    const name = size.name.trim()
    if (!name || seen.has(name.toLowerCase())) continue
    const price = readPrice(size.price, 0)
    if (price <= 0) continue
    seen.add(name.toLowerCase())
    clean.push({ name, price })
    if (clean.length >= MAX_PRODUCT_SIZES) break
  }

  return JSON.stringify(clean)
}

export function sizeNames(sizes: ProductSize[]): string[] {
  return sizes.map((size) => size.name)
}

export function priceForSize(sizes: ProductSize[], sizeName: string, fallback: number): number {
  const match = sizes.find((size) => size.name === sizeName)
  return match?.price && match.price > 0 ? match.price : fallback
}

export function lowestSizePrice(sizes: ProductSize[], fallback: number): number {
  const prices = sizes.map((size) => size.price).filter((price) => price > 0)
  if (prices.length === 0) return fallback
  return Math.min(...prices)
}

/** Single size that already encodes a measure, e.g. 40 × 40 cm or 70x40x18. */
export function uniqueDimensionLabel(sizes: ProductSize[]): string | null {
  if (sizes.length !== 1) return null
  const name = sizes[0]?.name.trim() ?? ''
  if (!/\d+\s*[×x*]\s*\d+/.test(name)) return null
  return name
}

export function hasVariableSizePrices(sizes: ProductSize[]): boolean {
  if (sizes.length < 2) return false
  const first = sizes[0]?.price
  return sizes.some((size) => size.price !== first)
}

export function sizesToFormValues(
  raw: string | null | undefined,
  fallbackPrice = 0,
): ProductSizeInput[] {
  return parseProductSizes(raw, fallbackPrice).map((size) => ({
    name: size.name,
    price: String(size.price),
  }))
}
