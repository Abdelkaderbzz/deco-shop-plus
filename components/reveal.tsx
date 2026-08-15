'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export type RevealVariant = 'up' | 'fade' | 'zoom' | 'left' | 'right'

export function Reveal({
  children,
  className,
  variant = 'up',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  variant?: RevealVariant
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true)
      return
    }

    const fallback = window.setTimeout(() => setInView(true), 2000)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        window.clearTimeout(fallback)
        observer.disconnect()
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => {
      window.clearTimeout(fallback)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn('reveal', className)}
      data-reveal={variant}
      data-inview={inView ? 'true' : undefined}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
