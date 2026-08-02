'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import {
  ADMIN_PAGE_SIZE,
  buildPaginatedResult,
  normalizePage,
  normalizePageSize,
  paginationOffset,
  type PaginatedResult,
} from '@/lib/pagination'
import { getPrimaryImage, serializeProductImages } from '@/lib/product-images'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

function normalizeProductImages(images: string[]) {
  const serialized = serializeProductImages(images)
  const primary = getPrimaryImage({ images: serialized })
  return {
    images: serialized,
    imageUrl: primary,
  }
}

function revalidateProductCaches(id?: number) {
  revalidateTag('products', 'max')
  if (id) revalidateTag(`product-${id}`, 'max')
}

function revalidateProductPage(id: number) {
  revalidatePath(`/products/${id}`)
}

type ProductListOptions = {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  publishedOnly?: boolean
}

function buildProductConditions(options: ProductListOptions) {
  const conditions = []

  if (options.publishedOnly !== false) {
    conditions.push(eq(products.published, true))
  }

  const search = options.search?.trim()
  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.brand, `%${search}%`),
        ilike(products.category, `%${search}%`),
      )!,
    )
  }

  const category = options.category?.trim()
  if (category && category !== 'all') {
    conditions.push(eq(products.category, category))
  }

  return conditions
}

async function queryProductsPaginated(options: ProductListOptions): Promise<PaginatedResult<typeof products.$inferSelect>> {
  const page = normalizePage(options.page)
  const pageSize = normalizePageSize(options.pageSize, ADMIN_PAGE_SIZE)
  const offset = paginationOffset(page, pageSize)
  const conditions = buildProductConditions(options)
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [countRow, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause)
      .then((rows) => rows[0]),
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(pageSize)
      .offset(offset),
  ])

  return buildPaginatedResult(items, countRow?.count ?? 0, page, pageSize)
}

export async function getAdminProductsPaginated(options: {
  page?: number
  pageSize?: number
  search?: string
} = {}) {
  await requireAdminId()
  return queryProductsPaginated({ ...options, publishedOnly: false })
}

export async function getStoreProductsPaginated(options: {
  page?: number
  pageSize?: number
  search?: string
  category?: string
} = {}) {
  return queryProductsPaginated({ ...options, publishedOnly: true })
}

/** @deprecated Use getStoreProductsPaginated for paginated reads. */
export async function getProducts(search?: string, category?: string) {
  const result = await getStoreProductsPaginated({
    search,
    category,
    page: 1,
    pageSize: 500,
  })
  return result.items
}

/** @deprecated Use getAdminProductsPaginated for paginated reads. */
export async function getAdminProducts() {
  const result = await getAdminProductsPaginated({ page: 1, pageSize: 500 })
  return result.items
}

const getFeaturedProductsCached = unstable_cache(
  async () =>
    db
      .select()
      .from(products)
      .where(and(eq(products.featured, true), eq(products.published, true)))
      .orderBy(desc(products.createdAt))
      .limit(6),
  ['featured-products'],
  { revalidate: 120, tags: ['products'] },
)

export async function getFeaturedProducts() {
  return getFeaturedProductsCached()
}

export async function getProductById(id: number) {
  return unstable_cache(
    async () => {
      const result = await db
        .select()
        .from(products)
        .where(and(eq(products.id, id), eq(products.published, true)))
        .limit(1)
      return result[0] ?? null
    },
    ['product-by-id', String(id)],
    { revalidate: 120, tags: ['products', `product-${id}`] },
  )()
}

export async function addProduct(data: {
  name: string
  brand: string
  description: string
  price: string
  category: string
  images: string[]
  sizes: string[]
  inStock: boolean
  featured: boolean
  published: boolean
}) {
  await requireAdminId()
  const imageData = normalizeProductImages(data.images)

  await db.insert(products).values({
    name: data.name,
    brand: data.brand,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: imageData.imageUrl,
    images: imageData.images,
    sizes: JSON.stringify(data.sizes),
    inStock: data.inStock,
    featured: data.featured,
    published: data.published,
  })
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  revalidateProductCaches()
}

export async function updateProduct(
  id: number,
  data: {
    name?: string
    brand?: string
    description?: string
    price?: string
    category?: string
    images?: string[]
    sizes?: string[]
    inStock?: boolean
    featured?: boolean
    published?: boolean
  },
) {
  await requireAdminId()
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }

  if (data.sizes) updateData.sizes = JSON.stringify(data.sizes)
  if (data.images) {
    const imageData = normalizeProductImages(data.images)
    updateData.images = imageData.images
    updateData.imageUrl = imageData.imageUrl
  }

  await db.update(products).set(updateData).where(eq(products.id, id))
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  revalidateProductCaches(id)
  revalidateProductPage(id)
}

export async function deleteProduct(id: number) {
  await requireAdminId()
  await db.delete(products).where(eq(products.id, id))
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  revalidateProductCaches(id)
  revalidateProductPage(id)
}
