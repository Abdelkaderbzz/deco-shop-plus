'use client'

import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/provider'

export function EpuiseBadge({ className }: { className?: string }) {
  const { dict } = useI18n()
  return (
    <span
      className={cn(
        'absolute top-3 start-3 z-20 rounded-full bg-black px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm',
        className,
      )}
    >
      {dict.product.outOfStock}
    </span>
  )
}
