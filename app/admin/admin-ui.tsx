import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* Shared admin design tokens — high contrast, readable sans-serif */
export const adminInputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
export const adminLabelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600'
export const adminFieldErrorCls = 'mt-1 text-xs font-medium text-red-600'

export function AdminFieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className={adminFieldErrorCls}>{message}</p>
}

export function adminInputWithError(hasError: boolean) {
  return hasError
    ? `${adminInputCls} border-red-400 focus:border-red-500 focus:ring-red-500/20`
    : adminInputCls
}
export const adminTableHeadCls =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'
export const adminTableCellCls = 'px-4 py-3 text-sm text-slate-800'
export const adminTableMutedCls = 'px-4 py-3 text-sm text-slate-500'

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function AdminStatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'warning' | 'success' | 'accent' | 'info' | 'danger'
}) {
  const toneClasses = {
    default: 'text-slate-900',
    warning: 'text-amber-700',
    success: 'text-emerald-700',
    accent: 'text-amber-800',
    info: 'text-blue-700',
    danger: 'text-red-600',
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className={`text-3xl font-bold ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

export function AdminCard({
  title,
  children,
  action,
}: {
  title?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export function AdminModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AdminButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
}) {
  const variants = {
    primary: 'bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60',
    outline: 'border border-amber-700 text-amber-800 hover:bg-amber-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-red-600 hover:bg-red-50',
  }

  return (
    <button
      className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminBadge({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const tones = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function AdminQuickLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-md"
    >
      <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-800">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Link>
  )
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  )
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left">{children}</table>
    </div>
  )
}

export function AdminIconButton({
  label,
  variant = 'ghost',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  variant?: 'ghost' | 'danger' | 'accent'
}) {
  const variants = {
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    accent: 'text-amber-700 hover:bg-amber-50 hover:text-amber-900',
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminIconLink({
  href,
  label,
  variant = 'ghost',
  className,
  children,
  external = false,
}: {
  href: string
  label: string
  variant?: 'ghost' | 'danger' | 'accent'
  className?: string
  children: ReactNode
  external?: boolean
}) {
  const variants = {
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
    accent: 'text-amber-700 hover:bg-amber-50 hover:text-amber-900',
  }

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      title={label}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors',
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function AdminCellEllipsis({
  text,
  maxWidthClass = 'max-w-[180px]',
}: {
  text: string | null | undefined
  maxWidthClass?: string
}) {
  if (!text) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <span className={cn('block truncate', maxWidthClass)} title={text}>
      {text}
    </span>
  )
}
