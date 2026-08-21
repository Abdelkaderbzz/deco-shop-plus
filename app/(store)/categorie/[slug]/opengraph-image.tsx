import { ImageResponse } from 'next/og'
import { getCategories } from '@/app/actions/categories'
import { OgShareCard } from '@/lib/og-share'
import { ogRemoteImage } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { getMergedCategoryBySlug } from '@/lib/store-categories'

export const alt = `${SITE.name} — catégories déco`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 120

export default async function CategoryOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const categories = await getCategories()
  const category = getMergedCategoryBySlug(slug, categories)

  return new ImageResponse(
    (
      <OgShareCard
        eyebrow={SITE.neighborhood}
        title={category?.name || SITE.name}
        footer={category?.tagline || `${SITE.city}, Tunisie`}
        imageSrc={ogRemoteImage(category?.image)}
      />
    ),
    { ...size },
  )
}
