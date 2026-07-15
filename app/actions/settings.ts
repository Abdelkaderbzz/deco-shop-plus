'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const DEFAULT_DELIVERY_FEE = '7.000'

async function getAdminId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDeliveryFee() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return parseFloat(row?.deliveryFee ?? DEFAULT_DELIVERY_FEE)
}

export async function getSettings() {
  await getAdminId()
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return {
    deliveryFee: row?.deliveryFee ?? DEFAULT_DELIVERY_FEE,
    updatedAt: row?.updatedAt ?? new Date(),
  }
}

export async function updateDeliveryFee(deliveryFee: string) {
  await getAdminId()
  const fee = parseFloat(deliveryFee)
  if (Number.isNaN(fee) || fee < 0) throw new Error('Invalid delivery fee')

  await db
    .insert(settings)
    .values({ id: 1, deliveryFee: fee.toFixed(3), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.id,
      set: { deliveryFee: fee.toFixed(3), updatedAt: new Date() },
    })

  revalidatePath('/admin/settings')
  revalidatePath('/checkout')
  revalidatePath('/products')
}
