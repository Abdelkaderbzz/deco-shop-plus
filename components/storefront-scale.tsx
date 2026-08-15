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
    document.documentElement.classList.toggle('storefront', isStorefront(pathname))
  }, [pathname])

  return null
}
