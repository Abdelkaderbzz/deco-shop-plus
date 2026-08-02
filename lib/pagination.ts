export const ADMIN_PAGE_SIZE = 10
export const STORE_PAGE_SIZE = 12

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function normalizePage(value: unknown, fallback = 1) {
  const page = Number(value)
  if (!Number.isFinite(page) || page < 1) return fallback
  return Math.floor(page)
}

export function normalizePageSize(value: unknown, fallback: number, max = 50) {
  const size = Number(value)
  if (!Number.isFinite(size) || size < 1) return fallback
  return Math.min(Math.floor(size), max)
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return {
    items,
    total,
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
  }
}

export function paginationOffset(page: number, pageSize: number) {
  return (page - 1) * pageSize
}
