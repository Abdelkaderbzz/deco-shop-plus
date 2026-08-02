export type OrderStatusTone = 'warning' | 'info' | 'violet' | 'success' | 'danger' | 'default'

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', tone: 'warning' as const },
  { value: 'confirmed', label: 'Confirme', tone: 'info' as const },
  { value: 'shipped', label: 'Expedie', tone: 'violet' as const },
  { value: 'delivered', label: 'Livre', tone: 'success' as const },
  { value: 'cancelled', label: 'Annule', tone: 'danger' as const },
]

export function orderStatusMeta(status: string) {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === status) ?? {
      value: status,
      label: status.toUpperCase(),
      tone: 'default' as const,
    }
  )
}

/** Colored trigger styles for status selects in the admin table / forms. */
export const ORDER_STATUS_SELECT_CLS: Record<OrderStatusTone, string> = {
  warning:
    '!border-amber-300 !bg-amber-50 !text-amber-800 font-semibold focus:!border-amber-500 focus:!ring-amber-500/20',
  info: '!border-blue-300 !bg-blue-50 !text-blue-800 font-semibold focus:!border-blue-500 focus:!ring-blue-500/20',
  violet:
    '!border-violet-300 !bg-violet-50 !text-violet-800 font-semibold focus:!border-violet-500 focus:!ring-violet-500/20',
  success:
    '!border-emerald-300 !bg-emerald-50 !text-emerald-800 font-semibold focus:!border-emerald-500 focus:!ring-emerald-500/20',
  danger:
    '!border-red-300 !bg-red-50 !text-red-700 font-semibold focus:!border-red-500 focus:!ring-red-500/20',
  default: '!border-slate-300 !bg-slate-50 !text-slate-700 font-semibold',
}
