export function catalogHref({
  category = 'all',
  search = '',
  page = 1,
}: {
  category?: string
  search?: string
  page?: number
} = {}) {
  const query = new URLSearchParams()
  const trimmedSearch = search.trim()
  if (trimmedSearch) query.set('search', trimmedSearch)
  if (page > 1) query.set('page', String(page))

  let path = '/products'
  if (category && category !== 'all') {
    if (trimmedSearch) {
      query.set('category', category)
    } else {
      path = `/categorie/${category}`
    }
  }

  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}

export function productHref(id: number | string) {
  return `/products/${id}`
}
