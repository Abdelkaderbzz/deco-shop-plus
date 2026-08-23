export const MAX_PRODUCT_COLORS = 12

export const DEFAULT_PROMO_LABEL = 'Promotion'
export const DEFAULT_PROMO_BG = '#c2410c'
export const DEFAULT_PROMO_TEXT = '#ffffff'

export type ProductColor = {
  name: string
  hex: string
}

/** Standard atelier swatches shown on current catalog products. */
export const CATALOG_PRODUCT_COLORS: ProductColor[] = [
  { name: 'Rouge', hex: '#c81e1e' },
  { name: 'Jaune', hex: '#eab308' },
  { name: 'Vert', hex: '#166534' },
  { name: 'Gris', hex: '#9ca3af' },
  { name: 'Beige', hex: '#d6cbb8' },
  { name: 'Marine', hex: '#1e3a5f' },
  { name: 'Marron', hex: '#7c2d12' },
  { name: 'Bordeaux', hex: '#7f1d1d' },
  { name: 'Vert pistache', hex: '#93c572' },
]

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
