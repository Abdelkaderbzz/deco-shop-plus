import { readableForeground } from '@/lib/contrast'
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
  from?: boolean
}

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'sm',
  className,
  accentColor,
  from = false,
}: ProductPriceProps) {
  const current = parsePrice(price) ?? 0
  const percent = getDiscountPercent(price, compareAtPrice)
  const compareAt = parsePrice(compareAtPrice)

  const fromLabel = from ? (
    <span
      className={cn(
        'mr-1 font-medium text-muted-foreground',
        size === 'lg' ? 'text-sm' : size === 'xs' ? 'text-[10px]' : 'text-xs',
      )}
    >
      À partir de
    </span>
  ) : null

  if (percent == null || compareAt == null) {
    return (
      <p
        className={cn(
          'tabular-nums text-foreground',
          size === 'lg'
            ? 'text-2xl font-semibold tracking-normal'
            : size === 'xs'
              ? 'text-sm font-semibold'
              : 'text-base font-semibold',
          className,
        )}
      >
        {fromLabel}
        {formatPriceTnd(current)}{' '}
        <span
          className={cn(
            'font-medium text-muted-foreground',
            size === 'lg' ? 'text-sm' : size === 'xs' ? 'text-[10px]' : 'text-xs',
          )}
        >
          TND
        </span>
      </p>
    )
  }

  const tndCls = cn(
    'font-medium text-muted-foreground',
    size === 'lg' ? 'text-sm' : size === 'xs' ? 'text-[10px]' : 'text-xs',
  )
  const badgeBg = accentColor?.trim() || ''
  const badgeColor = badgeBg ? readableForeground(badgeBg) : undefined

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <p
        className={cn(
          'font-semibold tabular-nums text-foreground',
          size === 'lg' ? 'text-3xl' : size === 'xs' ? 'text-sm' : 'text-lg',
        )}
      >
        {fromLabel}
        {formatPriceTnd(current)} <span className={tndCls}>TND</span>
      </p>
      <p
        className={cn(
          'font-normal tabular-nums text-muted-foreground line-through decoration-1',
          size === 'lg' ? 'text-base' : size === 'xs' ? 'text-xs' : 'text-sm',
        )}
      >
        {formatPriceTnd(compareAt)} <span className={tndCls}>TND</span>
      </p>
      <span
        className={cn(
          'rounded-md px-1.5 py-0.5 font-semibold tracking-wide',
          badgeBg ? undefined : 'bg-muted text-foreground',
          size === 'lg' ? 'text-sm' : size === 'xs' ? 'text-[10px]' : 'text-[11px]',
        )}
        style={badgeBg ? { backgroundColor: badgeBg, color: badgeColor } : undefined}
      >
        -{percent}%
      </span>
    </div>
  )
}
