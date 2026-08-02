'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

/** Tracks pending `router.push` / `router.replace` for pagination & filter UX. */
export function useRouteTransition() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function push(href: string) {
    startTransition(() => {
      router.push(href)
    })
  }

  function replace(href: string) {
    startTransition(() => {
      router.replace(href)
    })
  }

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return { isPending, push, replace, refresh, router, startTransition }
}
