'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function StoreRoutePrefetch({ hrefs }: { hrefs: string[] }) {
  const router = useRouter()

  useEffect(() => {
    function prefetchRoutes() {
      for (const href of hrefs) {
        router.prefetch(href)
      }
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetchRoutes)
      return () => window.cancelIdleCallback(id)
    }

    const timeoutId = window.setTimeout(prefetchRoutes, 200)
    return () => window.clearTimeout(timeoutId)
  }, [hrefs, router])

  return null
}
