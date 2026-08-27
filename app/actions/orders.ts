'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { orderItems, orders, products } from '@/lib/db/schema'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getDeliveryFee } from './settings'
import { sendMetaPurchaseEvent, type MetaAttribution } from '@/lib/meta-capi'
import {
  ADMIN_PAGE_SIZE,
  buildPaginatedResult,
  normalizePage,
  normalizePageSize,
  paginationOffset,
  type PaginatedResult,
} from '@/lib/pagination'
import {
  abandonedCheckoutSchema,
  type AbandonedCheckoutValues,
} from '@/lib/validations'

export type OrderActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

export type OrderWithItems = NonNullable<Awaited<ReturnType<typeof getOrderWithItemsData>>>

function mapOrderError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    if (error.message === 'Order not found') return 'Commande introuvable.'
    return error.message
  }
  return fallback
}

async function revalidateOrderPaths() {
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath('/admin/products')
}

function revalidateStockPaths(productIds: number[]) {
  revalidateTag('products', 'max')
  revalidatePath('/products')
  revalidatePath('/')
  for (const id of productIds) {
    revalidateTag(`product-${id}`, 'max')
    revalidatePath(`/products/${id}`)
  }
}

function aggregateItemQuantities(items: { productId: number; quantity: number; bundleUnits?: number }[]) {
  const quantities = new Map<number, number>()
  for (const item of items) {
    if (!item.productId || item.quantity <= 0) continue
    const units = item.quantity * Math.max(1, item.bundleUnits || 1)
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + units)
  }
  return quantities
}

function orderConsumesStock(status?: string | null) {
  return status !== 'cancelled' && status !== 'abandoned'
}

async function decrementStock(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  quantities: Map<number, number>,
) {
  for (const [productId, quantity] of quantities) {
    const [updated] = await tx
      .update(products)
      .set({
        stock: sql`${products.stock} - ${quantity}`,
        inStock: sql`(${products.stock} - ${quantity}) > 0`,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), sql`${products.stock} >= ${quantity}`))
      .returning({ id: products.id, name: products.name })

    if (!updated) {
      throw new Error('Stock insuffisant pour un des produits.')
    }
  }
}

async function incrementStock(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  quantities: Map<number, number>,
) {
  for (const [productId, quantity] of quantities) {
    await tx
      .update(products)
      .set({
        stock: sql`${products.stock} + ${quantity}`,
        inStock: true,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
  }
}

export type CartItem = {
  productId: number
  productName: string
  productBrand: string
  size: string
  color: string
  bundle?: string
  bundleUnits?: number
  quantity: number
  price: number
}

type CreateOrderInput = {
  customerName: string
  customerPhone: string
  customerGovernorate?: string
  customerAddress?: string
  status?: string
  notes?: string
  checkoutDraftId?: string
  items: CartItem[]
}

function mapOrderItems(orderId: number, items: CartItem[]) {
  return items.map((item) => ({
    orderId,
    productId: item.productId,
    productName: item.productName,
    productBrand: item.productBrand,
    size: item.size?.trim() || '—',
    color: item.color?.trim() || '',
    bundle: item.bundle?.trim() || '',
    bundleUnits: Math.max(1, item.bundleUnits || 1),
    quantity: item.quantity,
    price: item.price.toFixed(3),
  }))
}

async function insertOrderWithItems(data: CreateOrderInput) {
  if (!data.items.length && data.status !== 'abandoned') {
    throw new Error('Ajoutez au moins un article.')
  }

  const deliveryFeeValue = data.status === 'abandoned' && data.items.length === 0
    ? 0
    : await getDeliveryFee()
  const subtotal = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const appliesDelivery = data.items.length > 0
  const totalAmount = subtotal + (appliesDelivery ? deliveryFeeValue : 0)
  const status = data.status || 'pending'
  const stockQuantities = aggregateItemQuantities(data.items)
  const draftId = data.checkoutDraftId?.trim() || null

  const order = await db.transaction(async (tx) => {
    let existing: typeof orders.$inferSelect | undefined
    if (draftId) {
      const [row] = await tx
        .select()
        .from(orders)
        .where(eq(orders.checkoutDraftId, draftId))
        .limit(1)
      existing = row
    }

    if (existing && existing.status !== 'abandoned') {
      return existing
    }

    if (existing && existing.status === 'abandoned' && status !== 'abandoned') {
      if (orderConsumesStock(status)) {
        await decrementStock(tx, stockQuantities)
      }

      await tx.delete(orderItems).where(eq(orderItems.orderId, existing.id))

      const [updated] = await tx
        .update(orders)
        .set({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerGovernorate: data.customerGovernorate || null,
          customerAddress: data.customerAddress || null,
          orderType: 'delivery',
          pickupBoutiqueId: null,
          pickupBoutiqueName: null,
          status,
          totalAmount: totalAmount.toFixed(3),
          deliveryFee: (appliesDelivery ? deliveryFeeValue : 0).toFixed(3),
          notes: data.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, existing.id))
        .returning()

      if (data.items.length) {
        await tx.insert(orderItems).values(mapOrderItems(updated.id, data.items))
      }

      return updated
    }

    if (existing && status === 'abandoned') {
      await tx.delete(orderItems).where(eq(orderItems.orderId, existing.id))

      const [updated] = await tx
        .update(orders)
        .set({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerGovernorate: data.customerGovernorate || null,
          customerAddress: data.customerAddress || null,
          totalAmount: totalAmount.toFixed(3),
          deliveryFee: (appliesDelivery ? deliveryFeeValue : 0).toFixed(3),
          notes: data.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, existing.id))
        .returning()

      if (data.items.length) {
        await tx.insert(orderItems).values(mapOrderItems(updated.id, data.items))
      }

      return updated
    }

    if (orderConsumesStock(status)) {
      await decrementStock(tx, stockQuantities)
    }

    const [created] = await tx
      .insert(orders)
      .values({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerGovernorate: data.customerGovernorate || null,
        customerAddress: data.customerAddress || null,
        orderType: 'delivery',
        pickupBoutiqueId: null,
        pickupBoutiqueName: null,
        status,
        totalAmount: totalAmount.toFixed(3),
        deliveryFee: (appliesDelivery ? deliveryFeeValue : 0).toFixed(3),
        notes: data.notes || null,
        checkoutDraftId: draftId,
      })
      .returning()

    if (data.items.length) {
      await tx.insert(orderItems).values(mapOrderItems(created.id, data.items))
    }

    return created
  })

  await revalidateOrderPaths()
  if (orderConsumesStock(order.status)) {
    revalidateStockPaths([...stockQuantities.keys()])
  }
  return order
}

function toCartItems(items: AbandonedCheckoutValues['items']): CartItem[] {
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productBrand: item.productBrand,
    size: item.size || '—',
    color: item.color || '',
    bundle: item.bundle || '',
    bundleUnits: item.bundleUnits || 1,
    quantity: item.quantity,
    price: item.price,
  }))
}

/** Public — save a lead when the customer fills name + phone then leaves. */
export async function saveAbandonedCheckout(input: unknown) {
  const parsed = abandonedCheckoutSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const }
  }

  const data = parsed.data
  await insertOrderWithItems({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerGovernorate: data.customerGovernorate || undefined,
    customerAddress: data.customerAddress || undefined,
    notes: data.notes || undefined,
    checkoutDraftId: data.draftId,
    status: 'abandoned',
    items: toCartItems(data.items),
  })

  return { success: true as const }
}

/** Public store checkout — no auth. */
export async function createOrder(
  data: Omit<CreateOrderInput, 'status'> & {
    checkoutDraftId?: string
    meta?: MetaAttribution
  },
) {
  const order = await insertOrderWithItems({ ...data, status: 'pending' })

  if (data.items.length > 0 && order.status === 'pending') {
    void sendMetaPurchaseEvent({
      orderId: order.id,
      value: Number.parseFloat(order.totalAmount),
      items: data.items.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
      customerPhone: data.customerPhone,
      meta: data.meta,
    })
  }

  return order.id
}

/** Admin-created order. */
export async function adminCreateOrder(
  data: CreateOrderInput,
): Promise<OrderActionResult<{ id: number }>> {
  try {
    await requireAdminId()
    const order = await insertOrderWithItems(data)
    return { success: true, data: { id: order.id } }
  } catch (error) {
    return {
      success: false,
      error: mapOrderError(error, 'Impossible de creer la commande.'),
    }
  }
}

export async function getAllOrders() {
  const result = await getOrdersPaginated({ page: 1, pageSize: 500 })
  return result.items
}

function buildOrderSearchCondition(search: string) {
  const trimmed = search.trim()
  if (!trimmed) return undefined

  const term = `%${trimmed}%`
  const idTerm = `%${trimmed.replace(/^#/, '')}%`

  return or(
    ilike(orders.customerName, term),
    ilike(orders.customerPhone, term),
    ilike(orders.customerAddress, term),
    ilike(orders.notes, term),
    sql`cast(${orders.id} as text) like ${idTerm}`,
  )
}

export async function getOrdersPaginated(options: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
} = {}): Promise<PaginatedResult<typeof orders.$inferSelect>> {
  await requireAdminId()

  const page = normalizePage(options.page)
  const pageSize = normalizePageSize(options.pageSize, ADMIN_PAGE_SIZE)
  const offset = paginationOffset(page, pageSize)
  const conditions = []

  const status = options.status?.trim()
  if (status && status !== 'all') {
    conditions.push(eq(orders.status, status))
  }

  const searchCondition = buildOrderSearchCondition(options.search ?? '')
  if (searchCondition) {
    conditions.push(searchCondition)
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [countRow, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(whereClause)
      .then((rows) => rows[0]),
    db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset),
  ])

  return buildPaginatedResult(items, countRow?.count ?? 0, page, pageSize)
}

export async function getOrderStatusCounts() {
  await requireAdminId()

  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .groupBy(orders.status)

  const counts: Record<string, number> = {
    pending: 0,
    abandoned: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }

  for (const row of rows) {
    counts[row.status] = row.count
  }

  return counts
}

export async function getRecentOrders(limit = 5) {
  await requireAdminId()
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit)
}

async function getOrderWithItemsData(id: number) {
  const [[order], items] = await Promise.all([
    db.select().from(orders).where(eq(orders.id, id)).limit(1),
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
  ])
  if (!order) return null
  return { ...order, items }
}

export async function getOrderWithItems(id: number): Promise<OrderActionResult<OrderWithItems>> {
  try {
    await requireAdminId()
    const order = await getOrderWithItemsData(id)
    if (!order) {
      return { success: false, error: 'Commande introuvable.' }
    }
    return { success: true, data: order }
  } catch (error) {
    return {
      success: false,
      error: mapOrderError(error, 'Impossible de charger la commande.'),
    }
  }
}

export async function updateOrderStatus(id: number, status: string): Promise<OrderActionResult> {
  try {
    await requireAdminId()

    const result = await db.transaction(async (tx) => {
      const [[existing], items] = await Promise.all([
        tx.select().from(orders).where(eq(orders.id, id)).limit(1),
        tx.select().from(orderItems).where(eq(orderItems.orderId, id)),
      ])

      if (!existing) {
        throw new Error('Order not found')
      }

      const quantities = aggregateItemQuantities(items)
      const wasConsuming = orderConsumesStock(existing.status)
      const willConsume = orderConsumesStock(status)

      if (wasConsuming && !willConsume) {
        await incrementStock(tx, quantities)
      } else if (!wasConsuming && willConsume) {
        await decrementStock(tx, quantities)
      }

      const [updated] = await tx
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning({ id: orders.id })

      return { updated, productIds: [...quantities.keys()] }
    })

    if (!result.updated) {
      return { success: false, error: 'Commande introuvable.' }
    }

    await revalidateOrderPaths()
    revalidateStockPaths(result.productIds)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: mapOrderError(error, 'Impossible de mettre a jour le statut.'),
    }
  }
}

function orderItemValues(orderId: number, items: CartItem[]) {
  return items.map((item) => ({
    orderId,
    productId: item.productId,
    productName: item.productName,
    productBrand: item.productBrand,
    size: item.size,
    color: item.color?.trim() || '',
    bundle: item.bundle?.trim() || '',
    bundleUnits: Math.max(1, item.bundleUnits || 1),
    quantity: item.quantity,
    price: item.price.toFixed(3),
  }))
}

export async function updateOrder(
  id: number,
  data: {
    customerName?: string
    customerPhone?: string
    customerGovernorate?: string
    customerAddress?: string
    status?: string
    notes?: string
    items?: CartItem[]
  },
): Promise<OrderActionResult<OrderWithItems>> {
  try {
    await requireAdminId()

    const [[existing], currentItems] = await Promise.all([
      db.select().from(orders).where(eq(orders.id, id)).limit(1),
      db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    ])

    if (!existing) {
      return { success: false, error: 'Commande introuvable.' }
    }

    if (data.items && data.items.length === 0) {
      return { success: false, error: 'Ajoutez au moins un article.' }
    }

    const deliveryFeeValue =
      existing.orderType === 'delivery' && parseFloat(existing.deliveryFee) > 0
        ? parseFloat(existing.deliveryFee)
        : await getDeliveryFee()

    const nextItems = data.items
    const pricedItems = nextItems ?? currentItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      bundleUnits: item.bundleUnits,
      price: parseFloat(item.price),
    }))
    const subtotal = pricedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalAmount = subtotal + deliveryFeeValue
    const previousQuantities = aggregateItemQuantities(currentItems)
    const nextQuantities = aggregateItemQuantities(
      nextItems ?? currentItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        bundleUnits: item.bundleUnits,
      })),
    )
    const nextStatus = data.status ?? existing.status

    const updated = await db.transaction(async (tx) => {
      const wasConsuming = orderConsumesStock(existing.status)
      const willConsume = orderConsumesStock(nextStatus)

      if (wasConsuming) {
        await incrementStock(tx, previousQuantities)
      }
      if (willConsume) {
        await decrementStock(tx, nextQuantities)
      }

      const [row] = await tx
        .update(orders)
        .set({
          customerName: data.customerName ?? existing.customerName,
          customerPhone: data.customerPhone ?? existing.customerPhone,
          customerGovernorate: data.customerGovernorate ?? existing.customerGovernorate,
          customerAddress: data.customerAddress ?? existing.customerAddress,
          status: nextStatus,
          notes: data.notes === undefined ? existing.notes : data.notes,
          orderType: 'delivery',
          pickupBoutiqueId: null,
          pickupBoutiqueName: null,
          deliveryFee: deliveryFeeValue.toFixed(3),
          totalAmount: totalAmount.toFixed(3),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id))
        .returning()

      let items = currentItems
      if (nextItems) {
        await tx.delete(orderItems).where(eq(orderItems.orderId, id))
        items = await tx.insert(orderItems).values(orderItemValues(id, nextItems)).returning()
      }

      return { row, items }
    })

    if (!updated.row) {
      return { success: false, error: 'Commande introuvable.' }
    }

    const stockProductIds = new Set([...previousQuantities.keys(), ...nextQuantities.keys()])
    await revalidateOrderPaths()
    revalidateStockPaths([...stockProductIds])

    return { success: true, data: { ...updated.row, items: updated.items } }
  } catch (error) {
    return {
      success: false,
      error: mapOrderError(error, 'Impossible de modifier la commande.'),
    }
  }
}

export async function deleteOrder(id: number): Promise<OrderActionResult> {
  try {
    await requireAdminId()

    const productIds = await db.transaction(async (tx) => {
      const [[existing], items] = await Promise.all([
        tx.select().from(orders).where(eq(orders.id, id)).limit(1),
        tx.select().from(orderItems).where(eq(orderItems.orderId, id)),
      ])

      if (!existing) {
        throw new Error('Order not found')
      }

      const quantities = aggregateItemQuantities(items)
      if (orderConsumesStock(existing.status)) {
        await incrementStock(tx, quantities)
      }

      const [deleted] = await tx.delete(orders).where(eq(orders.id, id)).returning({ id: orders.id })
      if (!deleted) {
        throw new Error('Order not found')
      }

      return [...quantities.keys()]
    })

    await revalidateOrderPaths()
    revalidateStockPaths(productIds)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: mapOrderError(error, 'Impossible de supprimer la commande.'),
    }
  }
}

export async function getDashboardStats() {
  await requireAdminId()

  const [[orderStats], [productStats], deliveryFee] = await Promise.all([
    db
      .select({
        totalOrders: sql<number>`count(*) filter (where ${orders.status} != 'abandoned')::int`,
        pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
        abandonedOrders: sql<number>`count(*) filter (where ${orders.status} = 'abandoned')::int`,
        revenue: sql<string>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.status} not in ('abandoned', 'cancelled')), 0)`,
      })
      .from(orders),
    db
      .select({
        totalProducts: sql<number>`count(*)::int`,
        inStock: sql<number>`count(*) filter (where ${products.inStock} = true)::int`,
      })
      .from(products),
    getDeliveryFee(),
  ])

  return {
    totalOrders: orderStats?.totalOrders ?? 0,
    pendingOrders: orderStats?.pendingOrders ?? 0,
    abandonedOrders: orderStats?.abandonedOrders ?? 0,
    revenue: parseFloat(orderStats?.revenue ?? '0'),
    totalProducts: productStats?.totalProducts ?? 0,
    inStockProducts: productStats?.inStock ?? 0,
    deliveryFee,
  }
}
