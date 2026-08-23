import { ImageResponse } from 'next/og'
import { getPublishedProductByParam } from '@/app/actions/products'
import { OgShareCard } from '@/lib/og-share'
import { formatPriceTnd, parsePrice } from '@/lib/product-price'
import { ogRemoteImage } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const alt = `${SITE.name} — ${SITE.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 120

export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getPublishedProductByParam(id)
  const price = product ? parsePrice(product.price) : null

  return new ImageResponse(
    (
      <OgShareCard
        eyebrow={product?.brand || SITE.neighborhood}
        title={product?.name || SITE.name}
        footer={
          product && price != null
            ? `${formatPriceTnd(price)} TND · ${SITE.city}`
            : `${SITE.city}, Tunisie`
        }
        imageSrc={ogRemoteImage(product?.imageUrl)}
      />
    ),
    { ...size },
  )
}
