'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

function isStorefront(pathname: string) {
  return !pathname.startsWith('/admin')
}

/** Keeps the 80% storefront scale in sync on client navigations. */
export function StorefrontScale() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const root = document.documentElement
    const on = isStorefront(pathname)
    if (root.classList.contains('storefront') === on) return
    root.classList.toggle('storefront', on)
  }, [pathname])

  return null
}
