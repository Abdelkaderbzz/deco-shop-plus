import { ImageResponse } from 'next/og'
import { OgShareCard } from '@/lib/og-share'
import { SITE } from '@/lib/site'

export const alt = `${SITE.name} — ${SITE.tagline} a ${SITE.city}`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgShareCard
        eyebrow={SITE.neighborhood}
        title={SITE.name}
        footer={`Coussins · ${SITE.city}`}
      />
    ),
    { ...size },
  )
}
