'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { getPrimaryImage, serializeProductImages } from '@/lib/product-images'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'

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

function revalidateProductPage(id: number) {
  revalidatePath(`/products/${id}`)
}

export async function getAdminProducts() {
  await getAdminId()
  return db.select().from(products).orderBy(desc(products.createdAt))
}

export async function getProducts(search?: string, category?: string) {
  let query = db.select().from(products).$dynamic()
  const conditions = [eq(products.published, true)]

  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.brand, `%${search}%`),
      )!,
    )
  }
  if (category && category !== 'all') {
    conditions.push(eq(products.category, category))
  }

  return query.where(and(...conditions)).orderBy(desc(products.createdAt))
}

export async function getFeaturedProducts() {
  return db
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.published, true)))
    .limit(6)
}

export async function getProductById(id: number) {
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.published, true)))
    .limit(1)
  return result[0] ?? null
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
  revalidatePath('/')
  revalidateProductCaches(id)
  revalidateProductPage(id)
}

export async function deleteProduct(id: number) {
  await getAdminId()
  await db.delete(products).where(eq(products.id, id))
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  revalidateProductCaches(id)
  revalidateProductPage(id)
}
