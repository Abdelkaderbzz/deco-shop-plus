'use client'

import {
  updateOrderStatus,
  getOrderWithItems,
  updateOrder,
  deleteOrder,
} from '@/app/actions/orders'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { GOVERNORATE_SELECT_OPTIONS, getGovernorateLabel } from '@/lib/tunisia-governorates'
import { orderEditSchema, type OrderEditFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
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
  adminInputWithError,
  adminLabelCls,
  adminTableCellCls,
  adminTableHeadCls,
  adminTableMutedCls,
} from '../admin-ui'
import { AdminSelect } from '../admin-select'

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

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map((s) => ({
  value: s.value,
  label: s.label,
}))

function statusMeta(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status) ?? {
    value: status,
    label: status.toUpperCase(),
    tone: 'default' as const,
  }
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Awaited<ReturnType<typeof getOrderWithItems>> | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState('all')
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

  const filtered =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter)

  async function openOrder(id: number) {
    try {
      const order = await getOrderWithItems(id)
      setSelectedOrder(order)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Impossible de charger la commande.'))
    }
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
      try {
        await updateOrderStatus(id, status)
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
        if (selectedOrder?.id === id) setSelectedOrder((prev) => (prev ? { ...prev, status } : prev))
        toast.success('Statut de la commande mis a jour.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de mettre a jour le statut.'))
      }
    })
  }

  function onEditSubmit(values: OrderEditFormValues) {
    if (!editingOrder) return

    startTransition(async () => {
      try {
        await updateOrder(editingOrder.id, {
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerGovernorate: values.customerGovernorate || undefined,
          customerAddress: values.customerAddress || undefined,
          orderType: values.orderType,
          status: values.status,
          notes: values.notes || undefined,
        })

        const refreshed = await getOrderWithItems(editingOrder.id)
        if (refreshed) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === editingOrder.id
                ? {
                    id: refreshed.id,
                    customerName: refreshed.customerName,
                    customerPhone: refreshed.customerPhone,
                    customerGovernorate: refreshed.customerGovernorate,
                    customerAddress: refreshed.customerAddress,
                    orderType: refreshed.orderType,
                    status: refreshed.status,
                    totalAmount: refreshed.totalAmount,
                    deliveryFee: refreshed.deliveryFee,
                    notes: refreshed.notes,
                    createdAt: refreshed.createdAt,
                  }
                : o,
            ),
          )
          if (selectedOrder?.id === editingOrder.id) setSelectedOrder(refreshed)
        }

        setEditingOrder(null)
        toast.success('Commande modifiee avec succes.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de modifier la commande.'))
      }
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
      try {
        await deleteOrder(id)
        setOrders((prev) => prev.filter((o) => o.id !== id))
        if (selectedOrder?.id === id) setSelectedOrder(null)
        if (editingOrder?.id === id) setEditingOrder(null)
        toast.success('Commande supprimee.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de supprimer la commande.'))
      }
    })
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_OPTIONS.slice(0, 4).map((status) => {
          const count = orders.filter((o) => o.status === status.value).length
          return (
            <button key={status.value} onClick={() => setFilter(status.value)} className="text-left">
              <AdminStatCard label={status.label} value={count} tone={status.tone} />
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
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

      {filtered.length === 0 ? (
        <AdminEmptyState message="Aucune commande pour ce filtre." />
      ) : (
        <AdminTable>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['#', 'Client', 'Tel', 'Gouvernorat', 'Adresse', 'Type', 'Total', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} className={adminTableHeadCls}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-slate-50">
                    <td className={`${adminTableMutedCls} font-mono`}>#{o.id}</td>
                    <td className={`${adminTableCellCls} font-medium`}>{o.customerName}</td>
                    <td className={adminTableMutedCls}>{o.customerPhone}</td>
                    <td className={adminTableCellCls}>
                      <AdminCellEllipsis
                        text={
                          o.orderType === 'delivery'
                            ? getGovernorateLabel(o.customerGovernorate)
                            : '—'
                        }
                        maxWidthClass="max-w-[140px]"
                      />
                    </td>
                    <td className={`${adminTableCellCls} max-w-[200px]`}>
                      <AdminCellEllipsis
                        text={o.orderType === 'delivery' ? o.customerAddress : 'Retrait boutique'}
                        maxWidthClass="max-w-[200px]"
                      />
                    </td>
                    <td className={adminTableCellCls}>
                      <AdminBadge>
                        {o.orderType === 'delivery' ? 'Livraison' : 'Boutique'}
                      </AdminBadge>
                    </td>
                    <td className={`${adminTableCellCls} font-semibold`}>
                      {parseFloat(o.totalAmount).toFixed(3)} TND
                    </td>
                    <td className={`${adminTableCellCls} min-w-[160px]`}>
                      <AdminSelect
                        value={o.status}
                        onValueChange={(status) => handleStatusChange(o.id, status)}
                        items={STATUS_SELECT_OPTIONS}
                        disabled={isPending}
                        className="!py-1.5 text-sm"
                      />
                    </td>
                    <td className={adminTableMutedCls}>
                      {new Date(o.createdAt).toLocaleDateString('fr-TN')}
                    </td>
                    <td className={adminTableCellCls}>
                      <div className="flex items-center gap-1">
                        <AdminIconButton label="Voir les details" onClick={() => openOrder(o.id)}>
                          <Eye className="size-4" />
                        </AdminIconButton>
                        <AdminIconButton label="Modifier la commande" onClick={() => openEdit(o)}>
                          <Pencil className="size-4" />
                        </AdminIconButton>
                        <AdminIconButton
                          label="Supprimer la commande"
                          variant="danger"
                          onClick={() => handleDelete(o.id)}
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
        <AdminModal title={`Modifier commande #${editingOrder.id}`} onClose={() => setEditingOrder(null)}>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>NOM CLIENT *</label>
              <input className={adminInputWithError(!!errors.customerName)} {...register('customerName')} />
              <AdminFieldError message={errors.customerName?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>TELEPHONE *</label>
              <input className={adminInputWithError(!!errors.customerPhone)} {...register('customerPhone')} />
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
