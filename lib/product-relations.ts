export const MAX_RELATED_PRODUCTS = 8

/** How many cards the storefront shows, curated first then same-category fill. */
export const RELATED_PRODUCTS_SHOWN = 4

export function parseRelatedProductIds(product: {
  relatedProductIds?: string | null
}): number[] {
  if (!product.relatedProductIds) return []

  try {
    const parsed = JSON.parse(product.relatedProductIds)
    if (!Array.isArray(parsed)) return []
    const ids = parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
    return [...new Set(ids)].slice(0, MAX_RELATED_PRODUCTS)
  } catch {
    return []
  }
}

export function serializeRelatedProductIds(ids: number[]): string {
  const clean = ids.filter((id) => Number.isInteger(id) && id > 0)
  return JSON.stringify([...new Set(clean)].slice(0, MAX_RELATED_PRODUCTS))
}
