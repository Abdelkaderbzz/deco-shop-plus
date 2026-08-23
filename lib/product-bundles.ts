import { parsePrice } from '@/lib/product-price'

export const MAX_PRODUCT_BUNDLES = 6

export type ProductBundle = {
  name: string
  units: number
  price: number
  compareAtPrice: number | null
  popular: boolean
}

export type ProductBundleInput = {
  name: string
  units: string
  price: string
  compareAtPrice: string
  popular: boolean
}

function readPositivePrice(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : parsePrice(String(value ?? ''))
  if (parsed == null || parsed <= 0) return null
  return parsed
}

function readUnits(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isInteger(parsed) || parsed < 1) return 0
  return Math.min(99, parsed)
}

export function bundleSavings(bundle: Pick<ProductBundle, 'price' | 'compareAtPrice'>): number {
  if (bundle.compareAtPrice == null || bundle.compareAtPrice <= bundle.price) return 0
  return bundle.compareAtPrice - bundle.price
}

export function formatBundleSavings(amount: number): string {
  if (amount <= 0) return '0'
  const rounded = Math.round(amount * 1000) / 1000
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

export function parseProductBundles(
  product: { bundles?: string | null } | string | null | undefined,
): ProductBundle[] {
  const raw = typeof product === 'string' || product == null ? product : product.bundles
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const bundles: ProductBundle[] = []
    const seen = new Set<string>()
    let hasPopular = false

    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const name = String((item as { name?: unknown }).name ?? '').trim()
      const units = readUnits((item as { units?: unknown }).units)
      const price = readPositivePrice((item as { price?: unknown }).price)
      if (!name || units < 1 || price == null) continue
      if (seen.has(name.toLowerCase())) continue
      seen.add(name.toLowerCase())

      const compareAt = readPositivePrice((item as { compareAtPrice?: unknown }).compareAtPrice)
      const popular = Boolean((item as { popular?: unknown }).popular) && !hasPopular
      if (popular) hasPopular = true

      bundles.push({
        name,
        units,
        price,
        compareAtPrice: compareAt != null && compareAt > price ? compareAt : null,
        popular,
      })
      if (bundles.length >= MAX_PRODUCT_BUNDLES) break
    }

    return bundles
  } catch {
    return []
  }
}

export function serializeProductBundles(
  bundles: ProductBundleInput[] | ProductBundle[],
): string {
  const clean: ProductBundle[] = []
  const seen = new Set<string>()
  let hasPopular = false

  for (const bundle of bundles) {
    const name = bundle.name.trim()
    const units = readUnits(bundle.units)
    const price = readPositivePrice(bundle.price)
    if (!name || units < 1 || price == null) continue
    if (seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())

    const compareAt = readPositivePrice(bundle.compareAtPrice)
    const popular = Boolean(bundle.popular) && !hasPopular
    if (popular) hasPopular = true

    clean.push({
      name,
      units,
      price,
      compareAtPrice: compareAt != null && compareAt > price ? compareAt : null,
      popular,
    })
    if (clean.length >= MAX_PRODUCT_BUNDLES) break
  }

  return JSON.stringify(clean)
}

export function bundlesToFormValues(
  raw: string | null | undefined,
): ProductBundleInput[] {
  return parseProductBundles(raw).map((bundle) => ({
    name: bundle.name,
    units: String(bundle.units),
    price: String(bundle.price),
    compareAtPrice: bundle.compareAtPrice != null ? String(bundle.compareAtPrice) : '',
    popular: bundle.popular,
  }))
}

export function lineStockUnits(quantity: number, bundleUnits?: number | null) {
  return Math.max(0, quantity) * Math.max(1, bundleUnits || 1)
}
