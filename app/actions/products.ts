'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { orderItems, products } from '@/lib/db/schema'
import {
  ADMIN_PAGE_SIZE,
  buildPaginatedResult,
  normalizePage,
  normalizePageSize,
  paginationOffset,
  type PaginatedResult,
} from '@/lib/pagination'
import {
  DEFAULT_PROMO_BG,
  DEFAULT_PROMO_LABEL,
  DEFAULT_PROMO_TEXT,
  serializeProductColors,
  type ProductColor,
} from '@/lib/product-colors'
import { getPrimaryImage, serializeProductImages } from '@/lib/product-images'
import {
  RELATED_PRODUCTS_SHOWN,
  parseRelatedProductIds,
  serializeRelatedProductIds,
} from '@/lib/product-relations'
import { and, asc, desc, eq, ilike, inArray, ne, notInArray, or, sql } from 'drizzle-orm'
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

const getPromoProductsCached = unstable_cache(
  async () =>
    db
      .select()
      .from(products)
      .where(and(eq(products.promoEnabled, true), eq(products.published, true)))
      .orderBy(desc(products.updatedAt))
      .limit(8),
  ['promo-products'],
  { revalidate: 120, tags: ['products'] },
)

export async function getPromoProducts() {
  return getPromoProductsCached()
}

const getLatestProductsCached = unstable_cache(
  async () =>
    db
      .select()
      .from(products)
      .where(eq(products.published, true))
      .orderBy(desc(products.createdAt))
      .limit(8),
  ['latest-products'],
  { revalidate: 120, tags: ['products'] },
)

export async function getLatestProducts() {
  return getLatestProductsCached()
}

const getBestSellerProductsCached = unstable_cache(
  async () => {
    const ranked = await db
      .select({
        id: products.id,
        sold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      })
      .from(products)
      .leftJoin(orderItems, eq(orderItems.productId, products.id))
      .where(eq(products.published, true))
      .groupBy(products.id)
      .orderBy(desc(sql`coalesce(sum(${orderItems.quantity}), 0)`), desc(products.createdAt))
      .limit(8)

    if (ranked.length === 0) return []

    const ids = ranked.map((row) => row.id)
    const rows = await db.select().from(products).where(inArray(products.id, ids))
    const byId = new Map(rows.map((row) => [row.id, row]))
    return ids.map((id) => byId.get(id)).filter((row): row is typeof products.$inferSelect => Boolean(row))
  },
  ['best-seller-products'],
  { revalidate: 120, tags: ['products'] },
)

export async function getBestSellerProducts() {
  return getBestSellerProductsCached()
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

/** Lightweight catalogue used by the related-products picker in the admin. */
export async function getProductOptions() {
  await requireAdminId()
  return db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      category: products.category,
      published: products.published,
    })
    .from(products)
    .orderBy(asc(products.brand), asc(products.name))
}

/** Admin picks come first, in the order they were chosen; anything missing is
 *  filled with other products from the same category. */
export async function getRelatedProducts(productId: number) {
  return unstable_cache(
    async () => {
      const [product] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.published, true)))
        .limit(1)
      if (!product) return []

      const curatedIds = parseRelatedProductIds(product).filter((id) => id !== productId)

      const curatedRows = curatedIds.length
        ? await db
            .select()
            .from(products)
            .where(and(inArray(products.id, curatedIds), eq(products.published, true)))
        : []

      const curated = curatedIds
        .map((id) => curatedRows.find((row) => row.id === id))
        .filter((row): row is typeof products.$inferSelect => Boolean(row))
        .slice(0, RELATED_PRODUCTS_SHOWN)

      const missing = RELATED_PRODUCTS_SHOWN - curated.length
      if (missing <= 0) return curated

      const excluded = [productId, ...curated.map((row) => row.id)]
      const fallback = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.published, true),
            eq(products.category, product.category),
            excluded.length > 1 ? notInArray(products.id, excluded) : ne(products.id, productId),
          ),
        )
        .orderBy(desc(products.featured), desc(products.createdAt))
        .limit(missing)

      return [...curated, ...fallback]
    },
    ['related-products', String(productId)],
    { revalidate: 120, tags: ['products', `product-${productId}`] },
  )()
}

export async function addProduct(data: {
  name: string
  brand: string
  description: string
  price: string
  compareAtPrice?: string | null
  category: string
  images: string[]
  sizes: string[]
  colors?: ProductColor[]
  relatedProductIds?: number[]
  inStock: boolean
  featured: boolean
  published: boolean
  promoEnabled?: boolean
  promoLabel?: string
  promoBgColor?: string
  promoTextColor?: string
}) {
  await requireAdminId()
  const imageData = normalizeProductImages(data.images)
  const compareAtPrice = data.compareAtPrice?.trim() || null

  await db.insert(products).values({
    name: data.name,
    brand: data.brand,
    description: data.description,
    price: data.price,
    compareAtPrice,
    category: data.category,
    imageUrl: imageData.imageUrl,
    images: imageData.images,
    sizes: JSON.stringify(data.sizes),
    colors: serializeProductColors(data.colors ?? []),
    relatedProductIds: serializeRelatedProductIds(data.relatedProductIds ?? []),
    inStock: data.inStock,
    featured: data.featured,
    published: data.published,
    promoEnabled: data.promoEnabled ?? false,
    promoLabel: data.promoLabel?.trim() || DEFAULT_PROMO_LABEL,
    promoBgColor: data.promoBgColor?.trim() || DEFAULT_PROMO_BG,
    promoTextColor: data.promoTextColor?.trim() || DEFAULT_PROMO_TEXT,
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
    compareAtPrice?: string | null
    category?: string
    images?: string[]
    sizes?: string[]
    colors?: ProductColor[]
    relatedProductIds?: number[]
    inStock?: boolean
    featured?: boolean
    published?: boolean
    promoEnabled?: boolean
    promoLabel?: string
    promoBgColor?: string
    promoTextColor?: string
  },
) {
  await requireAdminId()
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }

  if (data.sizes) updateData.sizes = JSON.stringify(data.sizes)
  if (Array.isArray(data.colors)) updateData.colors = serializeProductColors(data.colors)
  if (data.relatedProductIds) {
    updateData.relatedProductIds = serializeRelatedProductIds(data.relatedProductIds)
  }
  if (data.images) {
    const imageData = normalizeProductImages(data.images)
    updateData.images = imageData.images
    updateData.imageUrl = imageData.imageUrl
  }
  if ('compareAtPrice' in data) {
    updateData.compareAtPrice = data.compareAtPrice?.trim() || null
  }
  if ('promoLabel' in data) {
    updateData.promoLabel = data.promoLabel?.trim() || DEFAULT_PROMO_LABEL
  }
  if ('promoBgColor' in data) {
    updateData.promoBgColor = data.promoBgColor?.trim() || DEFAULT_PROMO_BG
  }
  if ('promoTextColor' in data) {
    updateData.promoTextColor = data.promoTextColor?.trim() || DEFAULT_PROMO_TEXT
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
