'use server'

import { DEFAULT_DELIVERY_FEE } from '@/lib/delivery'
import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getDeliveryFee() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return parseFloat(row?.deliveryFee ?? DEFAULT_DELIVERY_FEE)
}

export async function getSettings() {
  await requireAdminId()
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return {
    deliveryFee: row?.deliveryFee ?? DEFAULT_DELIVERY_FEE,
    updatedAt: row?.updatedAt ?? new Date(),
  }
}

export async function updateDeliveryFee(deliveryFee: string) {
  await requireAdminId()
  const fee = parseFloat(deliveryFee)
  if (Number.isNaN(fee) || fee < 0) throw new Error('Tarif de livraison invalide')

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
