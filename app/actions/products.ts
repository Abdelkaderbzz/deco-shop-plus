'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { getPrimaryImage, serializeProductImages } from '@/lib/product-images'
import { desc, eq, ilike, or } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

async function getAdminId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

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

const getAllProductsCached = unstable_cache(
  async () => db.select().from(products).orderBy(desc(products.createdAt)),
  ['all-products'],
  { revalidate: 60, tags: ['products'] },
)

const getFeaturedProductsCached = unstable_cache(
  async () => db.select().from(products).where(eq(products.featured, true)).limit(6),
  ['featured-products'],
  { revalidate: 60, tags: ['products'] },
)

export async function getProducts(search?: string, category?: string) {
  if (!search && (!category || category === 'all')) {
    return getAllProductsCached()
  }

  let query = db.select().from(products).$dynamic()

  const conditions = []
  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.brand, `%${search}%`),
      )
    )
  }
  if (category && category !== 'all') {
    conditions.push(eq(products.category, category))
  }

  if (conditions.length > 0) {
    const { and } = await import('drizzle-orm')
    query = query.where(and(...conditions))
  }

  return query.orderBy(desc(products.createdAt))
}

export async function getFeaturedProducts() {
  return getFeaturedProductsCached()
}

export async function getProductById(id: number) {
  return unstable_cache(
    async () => {
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1)
      return result[0] ?? null
    },
    ['product-by-id', String(id)],
    { revalidate: 60, tags: ['products', `product-${id}`] },
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
}) {
  await getAdminId()
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
  })
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/products')
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
  }
) {
  await getAdminId()
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
  revalidateProductCaches(id)
}

export async function deleteProduct(id: number) {
  await getAdminId()
  await db.delete(products).where(eq(products.id, id))
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidateProductCaches(id)
}
