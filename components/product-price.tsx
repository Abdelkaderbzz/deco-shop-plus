import {
  formatPriceTnd,
  getDiscountPercent,
  parsePrice,
} from '@/lib/product-price'
import { cn } from '@/lib/utils'

type ProductPriceProps = {
  price: string
  compareAtPrice?: string | null
  size?: 'xs' | 'sm' | 'lg'
  className?: string
  accentColor?: string | null
}

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'sm',
  className,
  accentColor,
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
            : size === 'xs'
              ? 'text-xs font-medium tabular-nums text-foreground'
              : 'text-sm font-light text-foreground',
          className,
        )}
      >
        {formatPriceTnd(current)}{' '}
        <span
          className={cn(
            'text-muted-foreground',
            size === 'lg' ? 'text-sm font-normal' : size === 'xs' ? 'text-[9px]' : 'text-[10px]',
          )}
        >
          TND
        </span>
      </p>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2.5 gap-y-1', className)}>
      <p
        className={cn(
          'tabular-nums text-primary/55 line-through decoration-from-font',
          size === 'lg' ? 'text-base font-light' : size === 'xs' ? 'text-[10px] font-light' : 'text-xs font-light',
        )}
      >
        {formatPriceTnd(compareAt)}
      </p>
      <p
        className={cn(
          'font-semibold tabular-nums',
          size === 'lg' ? 'text-3xl' : size === 'xs' ? 'text-sm' : 'text-lg',
        )}
        style={accentColor ? { color: accentColor } : undefined}
      >
        <span className={accentColor ? undefined : 'text-foreground'}>
          {formatPriceTnd(current)}
        </span>
      </p>
      <span
        className={cn(
          'font-medium tracking-wide text-primary',
          size === 'lg' ? 'text-sm' : size === 'xs' ? 'text-[10px]' : 'text-[11px]',
        )}
      >
        -{percent}%
      </span>
    </div>
  )
}
