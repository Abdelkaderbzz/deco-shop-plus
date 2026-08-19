import type { MetadataRoute } from 'next'
import { getCategories } from '@/app/actions/categories'
import { getPublishedProductsForSitemap } from '@/app/actions/products'
import { catalogHref, productHref } from '@/lib/catalog-href'
import { STORE_CATEGORIES } from '@/lib/store-categories'
import { absoluteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/products'),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  try {
    const [dbCategories, products] = await Promise.all([
      getCategories(),
      getPublishedProductsForSitemap(),
    ])
    const categorySlugs = new Set([
      ...STORE_CATEGORIES.map((category) => category.slug),
      ...dbCategories.map((category) => category.slug),
    ])

    for (const slug of categorySlugs) {
      entries.push({
        url: absoluteUrl(catalogHref({ category: slug })),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    for (const product of products) {
      entries.push({
        url: absoluteUrl(productHref(product.id)),
        lastModified: product.updatedAt ?? lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    for (const category of STORE_CATEGORIES) {
      entries.push({
        url: absoluteUrl(catalogHref({ category: category.slug })),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  return entries
}
