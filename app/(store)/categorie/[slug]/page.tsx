import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories } from '@/app/actions/categories'
import { catalogHref } from '@/lib/catalog-href'
import { getStorefrontI18n } from '@/lib/i18n/get-locale'
import { categoryCopy } from '@/lib/i18n/categories'
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
  const [{ dict }, categories] = await Promise.all([getStorefrontI18n(), getCategories()])
  const category = getMergedCategoryBySlug(slug, categories)
  if (!category) return { title: dict.catalog.categoryMissing, robots: { index: false, follow: true } }

  const copy = categoryCopy(dict, slug)
  const name = copy?.name ?? category.name
  const tagline = copy?.tagline ?? category.tagline

  const trimmedSearch = search?.trim() ?? ''
  const pageNum = normalizePage(page)
  const canonical = catalogHref({
    category: slug,
    search: trimmedSearch,
    page: trimmedSearch ? pageNum : 1,
  })

  if (trimmedSearch) {
    return {
      title: dict.catalog.inCategory(trimmedSearch, name),
      description: dict.catalog.searchDescription(trimmedSearch, SITE.name, dict.site.city),
      alternates: pageAlternates(canonical),
      robots: { index: false, follow: true },
    }
  }

  const title = dict.catalog.categoryTitle(name, dict.site.city)
  const description = dict.catalog.categoryDescription(
    name,
    dict.site.fabric,
    SITE.name,
    dict.site.neighborhood,
    dict.site.city,
    tagline,
  )

  return {
    title,
    description,
    keywords: [
      name,
      SITE.name,
      dict.site.city,
      dict.site.neighborhood,
      tagline,
      dict.site.fabric,
      ...dict.site.keywords,
    ],
    alternates: pageAlternates(canonical),
    robots: pageNum > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${name} | ${SITE.name}`,
      description,
      url: canonical,
      images: category.image ? [{ url: category.image, alt: name }] : undefined,
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
