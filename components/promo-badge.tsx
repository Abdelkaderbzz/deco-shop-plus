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

  return (
    <span
      className={cn(
        'absolute top-3 left-3 z-10 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm',
        className,
      )}
      style={{
        backgroundColor: product.promoBgColor?.trim() || DEFAULT_PROMO_BG,
        color: product.promoTextColor?.trim() || DEFAULT_PROMO_TEXT,
      }}
    >
      {product.promoLabel?.trim() || DEFAULT_PROMO_LABEL}
    </span>
  )
}
