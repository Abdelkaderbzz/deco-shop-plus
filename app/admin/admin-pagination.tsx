'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminButton } from './admin-ui'

export const ADMIN_PAGE_SIZE = 10

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function AdminPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  if (totalItems <= pageSize) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        {totalItems === 0 ? 'Aucun resultat' : `${totalItems} resultat${totalItems > 1 ? 's' : ''}`}
      </p>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {start}-{end} sur {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Page precedente"
          className="!px-2.5"
        >
          <ChevronLeft className="size-4" />
        </AdminButton>
        <span className="min-w-[7rem] text-center text-sm text-slate-600">
          Page {page} / {totalPages}
        </span>
        <AdminButton
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Page suivante"
          className="!px-2.5"
        >
          <ChevronRight className="size-4" />
        </AdminButton>
      </div>
    </div>
  )
}
