'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function StoreRoutePrefetch({ hrefs }: { hrefs: string[] }) {
  const router = useRouter()

  useEffect(() => {
    if (hrefs.length === 0) return

    let done = false

    function prefetchRoutes() {
      if (done) return
      done = true
      for (const href of hrefs) {
        router.prefetch(href)
      }
    }

    const onInteract = () => prefetchRoutes()
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true })
    window.addEventListener('keydown', onInteract, { once: true })
    const timeoutId = window.setTimeout(prefetchRoutes, 5000)

    return () => {
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
      window.clearTimeout(timeoutId)
    }
  }, [hrefs, router])

  return null
}
