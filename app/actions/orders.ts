'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orderItems, orders, products } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getDeliveryFee } from './settings'

async function getAdminId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export type CartItem = {
  productId: number
  productName: string
  productBrand: string
  size: string
  quantity: number
  price: number
}

export async function createOrder(data: {
  customerName: string
  customerPhone: string
  customerAddress?: string
  orderType: 'delivery' | 'boutique'
  notes?: string
  items: CartItem[]
}) {
  const deliveryFeeValue = data.orderType === 'delivery' ? await getDeliveryFee() : 0
  const subtotal = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalAmount = subtotal + deliveryFeeValue

  const [order] = await db
    .insert(orders)
    .values({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      orderType: data.orderType,
      totalAmount: totalAmount.toFixed(3),
      deliveryFee: deliveryFeeValue.toFixed(3),
      notes: data.notes,
    })
    .returning()

  await db.insert(orderItems).values(
    data.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      productBrand: item.productBrand,
      size: item.size,
      quantity: item.quantity,
      price: item.price.toFixed(3),
    })),
  )

  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  return order.id
}

export async function getAllOrders() {
  await getAdminId()
  return db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function getOrderWithItems(id: number) {
  await getAdminId()
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
  return { ...order, items }
}

export async function updateOrderStatus(id: number, status: string) {
  await getAdminId()
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id))
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
}

export async function updateOrder(
  id: number,
  data: {
    customerName?: string
    customerPhone?: string
    customerAddress?: string
    orderType?: 'delivery' | 'boutique'
    status?: string
    notes?: string
  },
) {
  await getAdminId()

  const [existing] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!existing) throw new Error('Order not found')

  const orderType = (data.orderType ?? existing.orderType) as 'delivery' | 'boutique'
  const deliveryFeeValue =
    orderType === 'delivery'
      ? existing.orderType === 'delivery' && parseFloat(existing.deliveryFee) > 0
        ? parseFloat(existing.deliveryFee)
        : await getDeliveryFee()
      : 0

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
  const subtotal = items.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0)
  const totalAmount = subtotal + deliveryFeeValue

  await db
    .update(orders)
    .set({
      ...data,
      deliveryFee: deliveryFeeValue.toFixed(3),
      totalAmount: totalAmount.toFixed(3),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))

  revalidatePath('/admin')
  revalidatePath('/admin/orders')
}

export async function deleteOrder(id: number) {
  await getAdminId()
  await db.delete(orders).where(eq(orders.id, id))
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
}

export async function getDashboardStats() {
  await getAdminId()

  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
    })
    .from(orders)

  const [productStats] = await db
    .select({
      totalProducts: sql<number>`count(*)::int`,
      inStock: sql<number>`count(*) filter (where ${products.inStock} = true)::int`,
    })
    .from(products)

  const deliveryFee = await getDeliveryFee()

  return {
    totalOrders: orderStats?.totalOrders ?? 0,
    pendingOrders: orderStats?.pendingOrders ?? 0,
    revenue: parseFloat(orderStats?.revenue ?? '0'),
    totalProducts: productStats?.totalProducts ?? 0,
    inStockProducts: productStats?.inStock ?? 0,
    deliveryFee,
  }
}
