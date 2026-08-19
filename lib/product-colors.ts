export const MAX_PRODUCT_COLORS = 12

export const DEFAULT_PROMO_LABEL = 'Promotion'
export const DEFAULT_PROMO_BG = '#e85d04'
export const DEFAULT_PROMO_TEXT = '#ffffff'

export type ProductColor = {
  name: string
  hex: string
}

const HEX = /^#[0-9a-fA-F]{6}$/

export function normalizeHexColor(value: string, fallback = '#6b7280'): string {
  const hex = value.trim()
  return HEX.test(hex) ? hex.toLowerCase() : fallback
}

export function parseProductColors(
  product: { colors?: string | null } | string | null | undefined,
): ProductColor[] {
  const raw = typeof product === 'string' || product == null ? product : product.colors
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const colors: ProductColor[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const name = String((item as { name?: unknown }).name ?? '').trim()
      const hex = normalizeHexColor(String((item as { hex?: unknown }).hex ?? ''))
      if (!name) continue
      colors.push({ name, hex })
      if (colors.length >= MAX_PRODUCT_COLORS) break
    }
    return colors
  } catch {
    return []
  }
}

export function serializeProductColors(colors: ProductColor[]): string {
  const clean = colors
    .map((color) => ({
      name: color.name.trim(),
      hex: normalizeHexColor(color.hex),
    }))
    .filter((color) => color.name.length > 0)
    .slice(0, MAX_PRODUCT_COLORS)

  return JSON.stringify(clean)
}

export function isPromoActive(product: {
  promoEnabled?: boolean | null
}): boolean {
  return Boolean(product.promoEnabled)
}
