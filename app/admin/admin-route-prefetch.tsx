'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ADMIN_ROUTES = [
  '/admin/products',
  '/admin/orders',
  '/admin/categories',
  '/admin/boutiques',
  '/admin/hero',
  '/admin/banner',
  '/admin/settings',
]

export function AdminRoutePrefetch() {
  const router = useRouter()

  useEffect(() => {
    function prefetchRoutes() {
      for (const href of ADMIN_ROUTES) {
        router.prefetch(href)
      }
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetchRoutes)
      return () => window.cancelIdleCallback(id)
    }

    const timeoutId = setTimeout(prefetchRoutes, 300)
    return () => clearTimeout(timeoutId)
  }, [router])

  return null
}
