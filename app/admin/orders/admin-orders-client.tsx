'use client'

import {
  updateOrderStatus,
  getOrderWithItems,
  updateOrder,
  deleteOrder,
  type OrderWithItems,
} from '@/app/actions/orders'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { formatDateFr } from '@/lib/locale'
import { GOVERNORATE_SELECT_OPTIONS, getGovernorateLabel } from '@/lib/tunisia-governorates'
import { orderEditSchema, type OrderEditFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouteTransition } from '@/lib/use-route-transition'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  AdminBadge,
  AdminButton,
  AdminCellEllipsis,
  AdminEmptyState,
  AdminFieldError,
  AdminIconButton,
  AdminModal,
  AdminSpinner,
  AdminStatCard,
  AdminTable,
  adminInputCls,
  adminInputWithError,
  adminLabelCls,
  adminTableCellCls,
  adminTableHeadCls,
  adminTableMutedCls,
} from '../admin-ui'
import { AdminSelect } from '../admin-select'
import { ADMIN_PAGE_SIZE, AdminPagination } from '../admin-pagination'
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_SELECT_CLS,
  orderStatusMeta,
} from '../order-status'
import {
  AdminOrderCreateModal,
  type CreateOrderProduct,
} from './admin-order-create-modal'
import {
  AdminOrderItemsEditor,
  cartItemsFromLines,
  type OrderLineDraft,
} from './admin-order-items-editor'
import { lineStockUnits } from '@/lib/product-bundles'

type Order = {
  id: number
  customerName: string
  customerPhone: string
  customerGovernorate: string | null
  customerAddress: string | null
  orderType: string
  pickupBoutiqueId: number | null
  pickupBoutiqueName: string | null
  status: string
  totalAmount: string
  deliveryFee: string
  notes: string | null
  createdAt: Date
}

const STATUS_OPTIONS = ORDER_STATUS_OPTIONS

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((status) => ({
  value: status.value,
  label: status.label,
}))

function buildOrdersUrl(search: string, status: string, page: number) {
  const params = new URLSearchParams()
  if (search.trim()) params.set('search', search.trim())
  if (status !== 'all') params.set('status', status)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/admin/orders?${query}` : '/admin/orders'
}

function adjustStatusCounts(
  counts: Record<string, number>,
  fromStatus: string | undefined,
  toStatus: string,
) {
  if (!fromStatus || fromStatus === toStatus) return counts
  return {
    ...counts,
    [fromStatus]: Math.max(0, (counts[fromStatus] ?? 0) - 1),
    [toStatus]: (counts[toStatus] ?? 0) + 1,
  }
}

export function AdminOrdersClient({
  orders: initialOrders,
  total,
  page,
  search: initialSearch,
  status: initialStatus,
  statusCounts: initialStatusCounts,
  products,
  deliveryFee,
}: {
  orders: Order[]
  total: number
  page: number
  search: string
  status: string
  statusCounts: Record<string, number>
  products: CreateOrderProduct[]
  deliveryFee: number
}) {
  const { isPending: isNavigating, push, refresh } = useRouteTransition()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [orders, setOrders] = useState(initialOrders)
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null)
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null)
  const [editLines, setEditLines] = useState<OrderLineDraft[]>([])
  const [creating, setCreating] = useState(false)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSearchInput(initialSearch)
    setOrders(initialOrders)
    setStatusCounts(initialStatusCounts)
  }, [initialOrders, initialSearch, initialStatusCounts])

  function navigate(nextSearch: string, nextStatus: string, nextPage: number) {
    push(buildOrdersUrl(nextSearch, nextStatus, nextPage))
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<OrderEditFormValues>({
    resolver: zodResolver(orderEditSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      status: 'pending',
      notes: '',
      items: [],
    },
  })

  const reservedStock = useMemo(() => {
    const reserved: Record<number, number> = {}
    if (!editingOrder || editingOrder.status === 'cancelled' || editingOrder.status === 'abandoned') {
      return reserved
    }
    for (const item of editingOrder.items) {
      reserved[item.productId] =
        (reserved[item.productId] ?? 0) + lineStockUnits(item.quantity, item.bundleUnits)
    }
    return reserved
  }, [editingOrder])

  function syncEditLines(nextLines: OrderLineDraft[]) {
    setEditLines(nextLines)
    setValue('items', cartItemsFromLines(nextLines), { shouldValidate: true })
  }

  async function openOrder(id: number) {
    setLoadingOrderId(id)
    startTransition(async () => {
      try {
        const result = await getOrderWithItems(id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        setSelectedOrder(result.data)
      } finally {
        setLoadingOrderId(null)
      }
    })
  }

  function openEdit(order: Order) {
    startTransition(async () => {
      const result = await getOrderWithItems(order.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      const nextLines: OrderLineDraft[] = result.data.items.map((item) => ({
        key: `item-${item.id}`,
        productId: item.productId,
        productName: item.productName,
        productBrand: item.productBrand,
        size: item.size,
        color: item.color,
        bundle: item.bundle,
        bundleUnits: item.bundleUnits,
        quantity: item.quantity,
        price: parseFloat(item.price),
      }))

      setEditingOrder(result.data)
      setEditLines(nextLines)
      reset({
        customerName: result.data.customerName,
        customerPhone: result.data.customerPhone,
        customerGovernorate: result.data.customerGovernorate ?? '',
        customerAddress: result.data.customerAddress ?? '',
        status: result.data.status,
        notes: result.data.notes ?? '',
        items: cartItemsFromLines(nextLines),
      })
    })
  }

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => {
      const previousStatus = orders.find((order) => order.id === id)?.status
      setOrders((current) =>
        current.map((order) => (order.id === id ? { ...order, status } : order)),
      )
      setStatusCounts((current) => adjustStatusCounts(current, previousStatus, status))

      const result = await updateOrderStatus(id, status)
      if (!result.success) {
        if (previousStatus) {
          setOrders((current) =>
            current.map((order) => (order.id === id ? { ...order, status: previousStatus } : order)),
          )
          setStatusCounts((current) => adjustStatusCounts(current, status, previousStatus))
        }
        toast.error(result.error)
        return
      }

      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : prev))
      }
      toast.success('Statut de la commande mis a jour.')
    })
  }

  function onEditSubmit(values: OrderEditFormValues) {
    if (!editingOrder) return

    startTransition(async () => {
      const previousStatus = editingOrder.status
      const result = await updateOrder(editingOrder.id, {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerGovernorate: values.customerGovernorate || undefined,
        customerAddress: values.customerAddress || undefined,
        status: values.status,
        notes: values.notes || undefined,
        items: values.items,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      const refreshed = result.data
      setOrders((current) =>
        current.map((order) =>
          order.id === editingOrder.id
            ? {
                ...order,
                customerName: refreshed.customerName,
                customerPhone: refreshed.customerPhone,
                customerGovernorate: refreshed.customerGovernorate,
                customerAddress: refreshed.customerAddress,
                orderType: refreshed.orderType,
                pickupBoutiqueId: refreshed.pickupBoutiqueId,
                pickupBoutiqueName: refreshed.pickupBoutiqueName,
                status: refreshed.status,
                totalAmount: refreshed.totalAmount,
                notes: refreshed.notes,
              }
            : order,
        ),
      )
      setStatusCounts((current) => adjustStatusCounts(current, previousStatus, refreshed.status))

      if (selectedOrder?.id === editingOrder.id) {
        setSelectedOrder(refreshed)
      }

      setEditingOrder(null)
      toast.success('Commande modifiee avec succes.')
    })
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Supprimer cette commande ?',
      description: 'Cette action est irreversible.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
    })
    if (!ok) return

    startTransition(async () => {
      const result = await deleteOrder(id)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (selectedOrder?.id === id) setSelectedOrder(null)
      if (editingOrder?.id === id) setEditingOrder(null)
      toast.success('Commande supprimee.')
      refresh()
    })
  }

  const emptyMessage =
    searchInput.trim().length > 0
      ? 'Aucune commande ne correspond a votre recherche.'
      : initialStatus === 'all'
        ? 'Aucune commande pour le moment.'
        : 'Aucune commande pour ce filtre.'

  const isBusy = isPending || isNavigating

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_OPTIONS.map((status) => {
          const count = statusCounts[status.value] ?? 0
          return (
            <button
              key={status.value}
              type="button"
              onClick={() => navigate(searchInput, status.value, 1)}
              disabled={isNavigating}
              className="text-left disabled:opacity-60"
            >
              <AdminStatCard label={status.label} value={count} tone={status.tone} />
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <AdminButton
            onClick={() => setCreating(true)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Nouvelle commande
          </AdminButton>
          <AdminButton
            variant={initialStatus === 'all' ? 'primary' : 'outline'}
            onClick={() => navigate(searchInput, 'all', 1)}
            disabled={isNavigating}
          >
            Toutes
          </AdminButton>
          {STATUS_OPTIONS.map((status) => (
            <AdminButton
              key={status.value}
              variant={initialStatus === status.value ? 'primary' : 'outline'}
              onClick={() => navigate(searchInput, status.value, 1)}
              disabled={isNavigating}
            >
              {status.label}
            </AdminButton>
          ))}
        </div>

        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              navigate(searchInput, initialStatus, 1)
            }
          }}
          placeholder="Rechercher par #, client, tel, adresse..."
          className={`${adminInputCls} lg:max-w-sm`}
          disabled={isNavigating}
        />
      </div>

      {total === 0 ? (
        <AdminEmptyState message={emptyMessage} />
      ) : (
        <AdminTable
          className="table-fixed min-w-[980px]"
          loading={isNavigating}
          loadingLabel="Chargement des commandes..."
        >
          <thead className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-50">
            <tr>
              <th className={`${adminTableHeadCls} w-[72px]`}>#</th>
              <th className={`${adminTableHeadCls} w-[140px]`}>Client</th>
              <th className={`${adminTableHeadCls} w-[128px]`}>Tel</th>
              <th className={`${adminTableHeadCls} w-[150px]`}>Gouvernorat</th>
              <th className={`${adminTableHeadCls} w-[220px]`}>Adresse</th>
              <th className={`${adminTableHeadCls} w-[108px]`}>Type</th>
              <th className={`${adminTableHeadCls} w-[112px] text-right`}>Total</th>
              <th className={`${adminTableHeadCls} w-[156px]`}>Statut</th>
              <th className={`${adminTableHeadCls} w-[104px]`}>Date</th>
              <th className={`${adminTableHeadCls} w-[116px] text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-slate-50/80">
                <td className={`${adminTableMutedCls} font-mono text-xs`}>#{order.id}</td>
                <td className={`${adminTableCellCls} font-medium`}>
                  <AdminCellEllipsis text={order.customerName} maxWidthClass="max-w-[140px]" />
                </td>
                <td className={`${adminTableMutedCls} whitespace-nowrap font-mono text-xs`} dir="ltr">
                  <a
                    href={`tel:${order.customerPhone.replace(/\s+/g, '')}`}
                    className="text-teal-800 hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </td>
                <td className={adminTableCellCls}>
                  <AdminCellEllipsis
                    text={
                      order.orderType === 'delivery'
                        ? getGovernorateLabel(order.customerGovernorate)
                        : '—'
                    }
                    maxWidthClass="max-w-[150px]"
                  />
                </td>
                <td className={adminTableCellCls}>
                  <AdminCellEllipsis
                    text={
                      order.orderType === 'delivery'
                        ? order.customerAddress
                        : order.pickupBoutiqueName
                          ? `Retrait — ${order.pickupBoutiqueName}`
                          : 'Retrait boutique'
                    }
                    maxWidthClass="max-w-[220px]"
                  />
                </td>
                <td className={adminTableCellCls}>
                  <AdminBadge tone={order.orderType === 'delivery' ? 'info' : 'warning'}>
                    {order.orderType === 'delivery' ? 'Livraison' : 'Boutique'}
                  </AdminBadge>
                </td>
                <td className={`${adminTableCellCls} text-right font-semibold tabular-nums whitespace-nowrap`}>
                  {parseFloat(order.totalAmount).toFixed(3)} TND
                </td>
                <td className={`${adminTableCellCls} min-w-0`}>
                  <AdminSelect
                    value={order.status}
                    onValueChange={(status) => handleStatusChange(order.id, status)}
                    items={STATUS_SELECT_OPTIONS}
                    disabled={isBusy}
                    className={`!py-1.5 text-sm ${ORDER_STATUS_SELECT_CLS[orderStatusMeta(order.status).tone]}`}
                  />
                </td>
                <td className={`${adminTableMutedCls} whitespace-nowrap text-xs`}>
                  {formatDateFr(order.createdAt)}
                </td>
                <td className={adminTableCellCls}>
                  <div className="flex items-center justify-center gap-0.5">
                    <AdminIconButton
                      label="Voir les details"
                      onClick={() => openOrder(order.id)}
                      disabled={isBusy}
                    >
                      <Eye className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Modifier la commande"
                      onClick={() => openEdit(order)}
                      disabled={isBusy}
                    >
                      <Pencil className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Supprimer la commande"
                      variant="danger"
                      onClick={() => handleDelete(order.id)}
                      disabled={isBusy}
                    >
                      <Trash2 className="size-4" />
                    </AdminIconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {total > 0 && (
        <AdminPagination
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
          totalItems={total}
          loading={isNavigating}
          onPageChange={(nextPage) => navigate(searchInput, initialStatus, nextPage)}
        />
      )}

      {creating && (
        <AdminOrderCreateModal
          products={products}
          deliveryFee={deliveryFee}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            refresh()
          }}
        />
      )}

      {loadingOrderId !== null && !selectedOrder && (
        <AdminModal title="Chargement..." onClose={() => setLoadingOrderId(null)}>
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-600">
            <AdminSpinner />
            Chargement de la commande...
          </div>
        </AdminModal>
      )}

      {selectedOrder && (
        <AdminModal title={`Commande #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div className="space-y-4 text-sm">
            {selectedOrder.status === 'abandoned' && (
              <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-orange-900">
                <p className="text-xs font-semibold uppercase tracking-wide">Commande abandonnee</p>
                <p className="mt-1">
                  Ce client a commence une commande sans la confirmer. Appelez-le pour conclure la vente.
                </p>
                <a
                  href={`tel:${selectedOrder.customerPhone.replace(/\s+/g, '')}`}
                  className="mt-2 inline-flex font-semibold text-orange-800 underline"
                >
                  Appeler {selectedOrder.customerPhone}
                </a>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Client', value: selectedOrder.customerName },
                { label: 'Telephone', value: selectedOrder.customerPhone },
                {
                  label: 'Type',
                  value: selectedOrder.orderType === 'delivery' ? 'Livraison' : 'Retrait boutique',
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 font-medium text-slate-900">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</p>
                <div className="mt-1">
                  <AdminBadge tone={orderStatusMeta(selectedOrder.status).tone}>
                    {orderStatusMeta(selectedOrder.status).label}
                  </AdminBadge>
                </div>
              </div>
            </div>

            {selectedOrder.customerGovernorate && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gouvernorat</p>
                <p className="mt-1 text-slate-800">
                  {getGovernorateLabel(selectedOrder.customerGovernorate)}
                </p>
              </div>
            )}
            {selectedOrder.customerAddress && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adresse</p>
                <p className="mt-1 text-slate-800">{selectedOrder.customerAddress}</p>
              </div>
            )}
            {selectedOrder.orderType === 'boutique' && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Boutique de retrait
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedOrder.pickupBoutiqueName ?? 'Non precisee'}
                </p>
              </div>
            )}
            {selectedOrder.notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                <p className="mt-1 text-slate-800">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Articles</p>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="mb-2 flex justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      {item.productBrand} · {item.size}
                      {item.color ? ` · ${item.color}` : ''}
                      {item.bundle ? ` · ${item.bundle}` : ''} · x{item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {(parseFloat(item.price) * item.quantity).toFixed(3)} TND
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-slate-500">
                <span>Livraison</span>
                <span>
                  {parseFloat(selectedOrder.deliveryFee) === 0
                    ? 'Gratuit'
                    : `${parseFloat(selectedOrder.deliveryFee).toFixed(3)} TND`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {parseFloat(selectedOrder.totalAmount).toFixed(3)} TND
                </span>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {editingOrder && (
        <AdminModal
          title={`Modifier commande #${editingOrder.id}`}
          onClose={() => !isPending && setEditingOrder(null)}
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>NOM CLIENT *</label>
              <input
                className={adminInputWithError(!!errors.customerName)}
                disabled={isPending}
                {...register('customerName')}
              />
              <AdminFieldError message={errors.customerName?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>TELEPHONE *</label>
              <input
                className={adminInputWithError(!!errors.customerPhone)}
                disabled={isPending}
                {...register('customerPhone')}
              />
              <AdminFieldError message={errors.customerPhone?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>GOUVERNORAT *</label>
              <Controller
                control={control}
                name="customerGovernorate"
                render={({ field }) => (
                  <AdminSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    items={GOVERNORATE_SELECT_OPTIONS}
                    error={!!errors.customerGovernorate}
                    disabled={isPending}
                  />
                )}
              />
              <AdminFieldError message={errors.customerGovernorate?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>ADRESSE</label>
              <textarea
                rows={3}
                className={`${adminInputWithError(!!errors.customerAddress)} resize-none`}
                disabled={isPending}
                {...register('customerAddress')}
              />
              <AdminFieldError message={errors.customerAddress?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>STATUT</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <AdminSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    items={STATUS_SELECT_OPTIONS}
                    error={!!errors.status}
                    disabled={isPending}
                    className={ORDER_STATUS_SELECT_CLS[orderStatusMeta(field.value).tone]}
                  />
                )}
              />
              <AdminFieldError message={errors.status?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>NOTES</label>
              <textarea
                rows={2}
                className={`${adminInputWithError(!!errors.notes)} resize-none`}
                disabled={isPending}
                {...register('notes')}
              />
              <AdminFieldError message={errors.notes?.message} />
            </div>

            <AdminOrderItemsEditor
              products={products}
              deliveryFee={
                parseFloat(editingOrder.deliveryFee) > 0
                  ? parseFloat(editingOrder.deliveryFee)
                  : deliveryFee
              }
              lines={editLines}
              onChange={syncEditLines}
              reservedStock={reservedStock}
              disabled={isPending}
              error={errors.items?.message}
            />

            <AdminButton type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
