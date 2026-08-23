import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/app/actions/categories'
import { catalogHref } from '@/lib/catalog-href'
import { SITE } from '@/lib/site'
import { pageAlternates } from '@/lib/seo'
import { getMergedCategoryBySlug, mergeStoreCategories, STORE_CATEGORIES } from '@/lib/store-categories'
import { normalizePage } from '@/lib/pagination'
import { CatalogSkeleton } from '@/components/store-skeletons'
import { CatalogPage } from '../../products/catalog-page'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const dbCategories = await getCategories()
    return mergeStoreCategories(dbCategories).map((category) => ({ slug: category.slug }))
  } catch {
    return STORE_CATEGORIES.map((category) => ({ slug: category.slug }))
  }
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
  if (!category) return { title: 'Catégorie', robots: { index: false, follow: true } }

  const trimmedSearch = search?.trim() ?? ''
  const pageNum = normalizePage(page)
  const canonical = catalogHref({
    category: slug,
    search: trimmedSearch,
    page: trimmedSearch ? pageNum : 1,
  })

  if (trimmedSearch) {
    return {
      title: `« ${trimmedSearch} » dans ${category.name}`,
      description: `Recherche ${category.name.toLowerCase()} chez ${SITE.name} à ${SITE.city}.`,
      alternates: pageAlternates(canonical),
      robots: { index: false, follow: true },
    }
  }

  const title = `${category.name} à ${SITE.city}`
  const description = `${category.name} chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}. ${category.tagline}. Livraison partout en Tunisie.`

  return {
    title,
    description,
    keywords: [category.name, SITE.name, SITE.city, SITE.neighborhood, category.tagline, 'décoration Tunisie'],
    alternates: pageAlternates(canonical),
    robots: pageNum > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${category.name} | ${SITE.name}`,
      description,
      url: canonical,
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
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
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogPage
          category={slug}
          search={query.search?.trim() ?? ''}
          page={normalizePage(query.page)}
        />
      </Suspense>
    </div>
  )
}
