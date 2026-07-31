import { getProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { mergeStoreCategories } from '@/lib/store-categories'
import { Suspense } from 'react'
import { ProductsClient } from './products-client'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const storeCategories = mergeStoreCategories(categories)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <ProductsClient products={products} storeCategories={storeCategories} />
      </Suspense>
    </div>
  )
}
