import { getProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { STORE_CATEGORIES } from '@/lib/store-categories'
import { ProductsClient } from './products-client'

export const revalidate = 60

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const category = params.category ?? 'all'

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  const mergedCategories = [
    ...STORE_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name })),
    ...categories.filter((c) => !STORE_CATEGORIES.some((s) => s.slug === c.slug)),
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ProductsClient
        products={products}
        initialSearch={search}
        initialCategory={category}
        categories={mergedCategories}
      />
    </div>
  )
}
