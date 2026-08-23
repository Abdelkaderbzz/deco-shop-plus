import type { MetadataRoute } from 'next'
import { getCategories } from '@/app/actions/categories'
import { getPublishedProductsForSitemap } from '@/app/actions/products'
import { catalogHref, productHref } from '@/lib/catalog-href'
import { STORE_CATEGORIES } from '@/lib/store-categories'
import { absoluteImageUrl } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallbackDate = new Date()
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: fallbackDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/products'),
      lastModified: fallbackDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  try {
    const [dbCategories, products] = await Promise.all([
      getCategories(),
      getPublishedProductsForSitemap(),
    ])
    const newest = products[0]?.updatedAt ?? fallbackDate
    entries[0].lastModified = newest
    entries[1].lastModified = newest

    const categorySlugs = new Set([
      ...STORE_CATEGORIES.map((category) => category.slug),
      ...dbCategories.map((category) => category.slug),
    ])

    for (const slug of categorySlugs) {
      const categoryProducts = products.filter((product) => product.category === slug)
      entries.push({
        url: absoluteUrl(catalogHref({ category: slug })),
        lastModified: categoryProducts[0]?.updatedAt ?? newest,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    for (const product of products) {
      entries.push({
        url: absoluteUrl(productHref(product)),
        lastModified: product.updatedAt ?? newest,
        changeFrequency: 'weekly',
        priority: 0.7,
        images: product.imageUrl ? [absoluteImageUrl(product.imageUrl)] : undefined,
      })
    }
  } catch {
    for (const category of STORE_CATEGORIES) {
      entries.push({
        url: absoluteUrl(catalogHref({ category: category.slug })),
        lastModified: fallbackDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  return entries
}
