'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { asc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

async function getAdminId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const getCategoriesCached = unstable_cache(
  async () => db.select().from(categories).orderBy(asc(categories.name)),
  ['all-categories'],
  { revalidate: 300, tags: ['categories'] },
)

export async function getCategories() {
  return getCategoriesCached()
}

export async function addCategory(data: { name: string; slug?: string }) {
  await getAdminId()
  const slug = data.slug?.trim() || slugify(data.name)
  if (!slug) throw new Error('Invalid category name')

  await db.insert(categories).values({ name: data.name.trim(), slug })
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidateTag('categories', 'max')
  revalidateTag('products', 'max')
}

export async function updateCategory(
  id: number,
  data: { name?: string; slug?: string },
) {
  await getAdminId()

  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
  if (!existing) throw new Error('Category not found')

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (data.name) updateData.name = data.name.trim()
  if (data.slug) updateData.slug = data.slug.trim()

  const [updated] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning()

  if (updated && updated.slug !== existing.slug) {
    await db
      .update(products)
      .set({ category: updated.slug, updatedAt: new Date() })
      .where(eq(products.category, existing.slug))
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidateTag('categories', 'max')
  revalidateTag('products', 'max')
}

export async function deleteCategory(id: number) {
  await getAdminId()
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
  if (!category) throw new Error('Category not found')

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.category, category.slug))

  if (count > 0) {
    throw new Error(`Cette categorie est utilisee par ${count} produit(s).`)
  }

  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidateTag('categories', 'max')
  revalidateTag('products', 'max')
}
