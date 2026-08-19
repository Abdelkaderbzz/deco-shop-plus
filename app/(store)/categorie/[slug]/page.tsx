import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/app/actions/categories'
import { catalogHref } from '@/lib/catalog-href'
import { SITE } from '@/lib/site'
import { getMergedCategoryBySlug, STORE_CATEGORIES } from '@/lib/store-categories'
import { normalizePage } from '@/lib/pagination'
import { CatalogPage } from '../../products/catalog-page'

export const revalidate = 120
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = new Set(STORE_CATEGORIES.map((category) => category.slug))
  try {
    const dbCategories = await getCategories()
    for (const category of dbCategories) slugs.add(category.slug)
  } catch {
    // Build can still prerender default categories if the database is unreachable.
  }
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { search, page } = await searchParams
  const categories = await getCategories()
  const category = getMergedCategoryBySlug(slug, categories)
  if (!category) return { title: 'Catégorie' }

  const trimmedSearch = search?.trim() ?? ''
  const pageNum = normalizePage(page)
  const canonical = catalogHref({ category: slug, search: trimmedSearch, page: pageNum })

  if (trimmedSearch) {
    return {
      title: `« ${trimmedSearch} » dans ${category.name}`,
      description: `Recherche ${category.name.toLowerCase()} chez ${SITE.name} à ${SITE.city}.`,
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  const title = `${category.name} à ${SITE.city}`
  const description = `${category.name} chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}. ${category.tagline}. Retrait en boutique et livraison en Tunisie.`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} | ${SITE.name}`,
      description,
      url: canonical,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const categories = await getCategories()
  const category = getMergedCategoryBySlug(slug, categories)
  if (!category) notFound()

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <CatalogPage
        category={slug}
        search={query.search?.trim() ?? ''}
        page={normalizePage(query.page)}
      />
    </div>
  )
}
