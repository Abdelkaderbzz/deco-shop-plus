import { getProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-light tracking-[0.4em] text-[#c9a96e]">NOTRE COLLECTION</p>
        <h1 className="mt-2 text-4xl font-light tracking-widest text-[#f5f0e8]">PARFUMS</h1>
      </div>

      <ProductsClient
        products={products}
        initialSearch={search}
        initialCategory={category}
        categories={categories}
      />
    </div>
  )
}
