import { readableForeground } from '@/lib/contrast'
import { cn } from '@/lib/utils'
import {
  DEFAULT_PROMO_BG,
  DEFAULT_PROMO_LABEL,
  DEFAULT_PROMO_TEXT,
  isPromoActive,
} from '@/lib/product-colors'

type PromoBadgeProps = {
  product: {
    promoEnabled?: boolean | null
    promoLabel?: string | null
    promoBgColor?: string | null
    promoTextColor?: string | null
  }
  className?: string
}

export function PromoBadge({ product, className }: PromoBadgeProps) {
  if (!isPromoActive(product)) return null

  const backgroundColor = product.promoBgColor?.trim() || DEFAULT_PROMO_BG
  const color = readableForeground(backgroundColor, product.promoTextColor?.trim() || DEFAULT_PROMO_TEXT)

  return (
    <span
      className={cn(
        'absolute top-3 left-3 z-10 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm',
        className,
      )}
      style={{ backgroundColor, color }}
    >
      {product.promoLabel?.trim() || DEFAULT_PROMO_LABEL}
    </span>
  )
}
