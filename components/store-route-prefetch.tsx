'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function StoreRoutePrefetch({ hrefs }: { hrefs: string[] }) {
  const router = useRouter()

  useEffect(() => {
    if (hrefs.length === 0) return

    let done = false
    let idleId: number | undefined
    let timeoutId: number | undefined

    function prefetchRoutes() {
      if (done) return
      done = true
      for (const href of hrefs) {
        router.prefetch(href)
      }
    }

    function schedule() {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 8000 })
      } else {
        timeoutId = window.setTimeout(prefetchRoutes, 4000)
      }
    }

    if (document.readyState === 'complete') {
      schedule()
    } else {
      window.addEventListener('load', schedule, { once: true })
    }

    return () => {
      window.removeEventListener('load', schedule)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [hrefs, router])

  return null
}
