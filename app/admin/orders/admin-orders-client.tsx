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
import { GOVERNORATE_SELECT_OPTIONS, getGovernorateLabel } from '@/lib/tunisia-governorates'
import { orderEditSchema, type OrderEditFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
import { ADMIN_PAGE_SIZE, AdminPagination, paginateItems } from '../admin-pagination'

type Order = {
  id: number
  customerName: string
  customerPhone: string
  customerGovernorate: string | null
  customerAddress: string | null
  orderType: string
  status: string
  totalAmount: string
  deliveryFee: string
  notes: string | null
  createdAt: Date
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', tone: 'warning' as const },
  { value: 'confirmed', label: 'Confirme', tone: 'info' as const },
  { value: 'shipped', label: 'Expedie', tone: 'default' as const },
  { value: 'delivered', label: 'Livre', tone: 'success' as const },
  { value: 'cancelled', label: 'Annule', tone: 'danger' as const },
]

const ORDER_TYPE_OPTIONS = [
  { value: 'delivery', label: 'Livraison' },
  { value: 'boutique', label: 'Retrait boutique' },
]

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((status) => ({
  value: status.value,
  label: status.label,
}))

function statusMeta(status: string) {
  return STATUS_OPTIONS.find((option) => option.value === status) ?? {
    value: status,
    label: status.toUpperCase(),
    tone: 'default' as const,
  }
}

function matchesSearch(order: Order, query: string) {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return true

  const normalized = trimmed.replace(/^#/, '')
  const governorate = order.customerGovernorate
    ? (getGovernorateLabel(order.customerGovernorate) ?? '').toLowerCase()
    : ''

  return (
    order.id.toString().includes(normalized) ||
    order.customerName.toLowerCase().includes(trimmed) ||
    order.customerPhone.toLowerCase().includes(trimmed) ||
    (order.customerAddress ?? '').toLowerCase().includes(trimmed) ||
    governorate.includes(trimmed) ||
    (order.notes ?? '').toLowerCase().includes(trimmed)
  )
}

function toListOrder(order: OrderWithItems): Order {
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerGovernorate: order.customerGovernorate,
    customerAddress: order.customerAddress,
    orderType: order.orderType,
    status: order.status,
    totalAmount: order.totalAmount,
    deliveryFee: order.deliveryFee,
    notes: order.notes,
    createdAt: order.createdAt,
  }
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<OrderEditFormValues>({
    resolver: zodResolver(orderEditSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      orderType: 'delivery',
      status: 'pending',
      notes: '',
    },
  })

  const orderType = watch('orderType')

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const matchesStatus = filter === 'all' || order.status === filter
        return matchesStatus && matchesSearch(order, search)
      }),
    [orders, filter, search],
  )

  const paginated = paginateItems(filtered, page, ADMIN_PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [filter, search])

  async function openOrder(id: number) {
    startTransition(async () => {
      const result = await getOrderWithItems(id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSelectedOrder(result.data)
    })
  }

  function openEdit(order: Order) {
    setEditingOrder(order)
    reset({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerGovernorate: order.customerGovernorate ?? '',
      customerAddress: order.customerAddress ?? '',
      orderType: order.orderType as 'delivery' | 'boutique',
      status: order.status,
      notes: order.notes ?? '',
    })
  }

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => {
      const result = await updateOrderStatus(id, status)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : prev))
      }
      toast.success('Statut de la commande mis a jour.')
      router.refresh()
    })
  }

  function onEditSubmit(values: OrderEditFormValues) {
    if (!editingOrder) return

    startTransition(async () => {
      const result = await updateOrder(editingOrder.id, {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerGovernorate: values.customerGovernorate || undefined,
        customerAddress: values.customerAddress || undefined,
        orderType: values.orderType,
        status: values.status,
        notes: values.notes || undefined,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      const refreshed = result.data
      setOrders((prev) =>
        prev.map((order) => (order.id === editingOrder.id ? toListOrder(refreshed) : order)),
      )
      if (selectedOrder?.id === editingOrder.id) {
        setSelectedOrder(refreshed)
      }

      setEditingOrder(null)
      toast.success('Commande modifiee avec succes.')
      router.refresh()
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

      setOrders((prev) => prev.filter((order) => order.id !== id))
      if (selectedOrder?.id === id) setSelectedOrder(null)
      if (editingOrder?.id === id) setEditingOrder(null)
      toast.success('Commande supprimee.')
      router.refresh()
    })
  }

  const emptyMessage =
    search.trim().length > 0
      ? 'Aucune commande ne correspond a votre recherche.'
      : filter === 'all'
        ? 'Aucune commande pour le moment.'
        : 'Aucune commande pour ce filtre.'

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_OPTIONS.slice(0, 4).map((status) => {
          const count = orders.filter((order) => order.status === status.value).length
          return (
            <button key={status.value} onClick={() => setFilter(status.value)} className="text-left">
              <AdminStatCard label={status.label} value={count} tone={status.tone} />
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <AdminButton variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
            Toutes
          </AdminButton>
          {STATUS_OPTIONS.map((status) => (
            <AdminButton
              key={status.value}
              variant={filter === status.value ? 'primary' : 'outline'}
              onClick={() => setFilter(status.value)}
            >
              {status.label}
            </AdminButton>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher par #, client, tel, adresse..."
          className={`${adminInputCls} lg:max-w-sm`}
        />
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState message={emptyMessage} />
      ) : (
        <AdminTable>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['#', 'Client', 'Tel', 'Gouvernorat', 'Adresse', 'Type', 'Total', 'Statut', 'Date', 'Actions'].map(
                (heading) => (
                  <th key={heading} className={adminTableHeadCls}>
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-slate-50">
                <td className={`${adminTableMutedCls} font-mono`}>#{order.id}</td>
                <td className={`${adminTableCellCls} font-medium`}>{order.customerName}</td>
                <td className={adminTableMutedCls}>{order.customerPhone}</td>
                <td className={adminTableCellCls}>
                  <AdminCellEllipsis
                    text={
                      order.orderType === 'delivery'
                        ? getGovernorateLabel(order.customerGovernorate)
                        : '—'
                    }
                    maxWidthClass="max-w-[140px]"
                  />
                </td>
                <td className={`${adminTableCellCls} max-w-[200px]`}>
                  <AdminCellEllipsis
                    text={order.orderType === 'delivery' ? order.customerAddress : 'Retrait boutique'}
                    maxWidthClass="max-w-[200px]"
                  />
                </td>
                <td className={adminTableCellCls}>
                  <AdminBadge>{order.orderType === 'delivery' ? 'Livraison' : 'Boutique'}</AdminBadge>
                </td>
                <td className={`${adminTableCellCls} font-semibold`}>
                  {parseFloat(order.totalAmount).toFixed(3)} TND
                </td>
                <td className={`${adminTableCellCls} min-w-[160px]`}>
                  <AdminSelect
                    value={order.status}
                    onValueChange={(status) => handleStatusChange(order.id, status)}
                    items={STATUS_SELECT_OPTIONS}
                    disabled={isPending}
                    className="!py-1.5 text-sm"
                  />
                </td>
                <td className={adminTableMutedCls}>
                  {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                </td>
                <td className={adminTableCellCls}>
                  <div className="flex items-center gap-1">
                    <AdminIconButton
                      label="Voir les details"
                      onClick={() => openOrder(order.id)}
                      disabled={isPending}
                    >
                      <Eye className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Modifier la commande"
                      onClick={() => openEdit(order)}
                      disabled={isPending}
                    >
                      <Pencil className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Supprimer la commande"
                      variant="danger"
                      onClick={() => handleDelete(order.id)}
                      disabled={isPending}
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

      <AdminPagination
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        totalItems={filtered.length}
        onPageChange={setPage}
      />

      {selectedOrder && (
        <AdminModal title={`Commande #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div className="space-y-4 text-sm">
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
                  <AdminBadge tone={statusMeta(selectedOrder.status).tone}>
                    {statusMeta(selectedOrder.status).label}
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
                      {item.productBrand} · {item.size} · x{item.quantity}
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
              <label className={adminLabelCls}>TYPE</label>
              <Controller
                control={control}
                name="orderType"
                render={({ field }) => (
                  <AdminSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    items={ORDER_TYPE_OPTIONS}
                    error={!!errors.orderType}
                    disabled={isPending}
                  />
                )}
              />
              <AdminFieldError message={errors.orderType?.message} />
            </div>
            {orderType === 'delivery' && (
              <>
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
              </>
            )}
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

            <AdminButton type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
