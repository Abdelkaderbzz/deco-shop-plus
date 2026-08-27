/** Shared Meta Pixel event payloads (browser + Conversions API). */

export const META_CURRENCY = 'TND'

export type MetaLineItem = {
  productId: number
  productName?: string
  price: number
  quantity: number
}

export function metaPurchaseEventId(orderId: number) {
  return `purchase-${orderId}`
}

export function buildMetaContents(items: MetaLineItem[]) {
  return items.map((item) => ({
    id: String(item.productId),
    quantity: item.quantity,
    item_price: item.price,
  }))
}

export function buildMetaCustomData(items: MetaLineItem[], value: number) {
  return {
    value,
    currency: META_CURRENCY,
    content_ids: items.map((item) => String(item.productId)),
    contents: buildMetaContents(items),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

export function buildMetaEventParams(
  items: MetaLineItem[],
  value: number,
  name?: string,
) {
  const params: Record<string, unknown> = buildMetaCustomData(items, value)
  if (name) params.content_name = name
  return params
}
