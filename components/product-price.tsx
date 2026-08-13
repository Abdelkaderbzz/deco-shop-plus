import {
  formatPriceTnd,
  getDiscountPercent,
  parsePrice,
} from '@/lib/product-price'
import { cn } from '@/lib/utils'

type ProductPriceProps = {
  price: string
  compareAtPrice?: string | null
  size?: 'sm' | 'lg'
  className?: string
}

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'sm',
  className,
}: ProductPriceProps) {
  const current = parsePrice(price) ?? 0
  const percent = getDiscountPercent(price, compareAtPrice)
  const compareAt = parsePrice(compareAtPrice)

  if (percent == null || compareAt == null) {
    return (
      <p
        className={cn(
          size === 'lg'
            ? 'text-2xl font-medium tabular-nums tracking-normal text-foreground'
            : 'text-sm font-light text-foreground',
          className,
        )}
      >
        {formatPriceTnd(current)}{' '}
        <span
          className={cn(
            'text-muted-foreground',
            size === 'lg' ? 'text-sm font-normal' : 'text-[10px]',
          )}
        >
          TND
        </span>
      </p>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <p
        className={cn(
          'tabular-nums text-foreground',
          size === 'lg' ? 'text-2xl font-medium' : 'text-sm font-medium',
        )}
      >
        {formatPriceTnd(current)}{' '}
        <span
          className={cn(
            'text-muted-foreground',
            size === 'lg' ? 'text-sm font-normal' : 'text-[10px] font-light',
          )}
        >
          TND
        </span>
      </p>
      <p
        className={cn(
          'tabular-nums text-muted-foreground line-through decoration-from-font',
          size === 'lg' ? 'text-base font-light' : 'text-xs font-light',
        )}
      >
        {formatPriceTnd(compareAt)} TND
      </p>
      <span
        className={cn(
          'font-medium tracking-wide text-primary',
          size === 'lg' ? 'text-sm' : 'text-[11px]',
        )}
      >
        -{percent}%
      </span>
    </div>
  )
}
