'use client'

import {
  bundleSavings,
  formatBundleSavings,
  type ProductBundle,
} from '@/lib/product-bundles'
import { formatPriceTnd, getDiscountPercent } from '@/lib/product-price'

export function ProductBundleOptions({
  bundles,
  selectedName,
  onSelect,
  remainingUnits,
}: {
  bundles: ProductBundle[]
  selectedName: string
  onSelect: (name: string) => void
  remainingUnits: number
}) {
  if (bundles.length === 0) return null

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Choisissez votre pack
      </legend>
      <div className="flex flex-col gap-2.5">
        {bundles.map((bundle) => {
          const selected = selectedName === bundle.name
          const savings = bundleSavings(bundle)
          const percent = getDiscountPercent(bundle.price, bundle.compareAtPrice)
          const disabled = remainingUnits < bundle.units
          return (
            <label
              key={bundle.name}
              className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3.5 transition-all ${
                bundle.popular ? 'pt-8' : ''
              } ${
                disabled
                  ? 'cursor-not-allowed border-border/70 bg-muted/40 opacity-55'
                  : selected
                    ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <input
                type="radio"
                name="product-bundle"
                className="sr-only"
                checked={selected}
                disabled={disabled}
                onChange={() => onSelect(bundle.name)}
              />
              {bundle.popular ? (
                <span className="absolute inset-x-0 top-0 rounded-t-[14px] bg-red-600 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white">
                  Le plus populaire
                </span>
              ) : null}
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                  selected ? 'border-primary' : 'border-muted-foreground/35'
                }`}
                aria-hidden
              >
                {selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{bundle.name}</span>
                  {savings > 0 ? (
                    <span className="rounded-md bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Economisez {formatBundleSavings(savings)}dt
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {bundle.units} piece{bundle.units > 1 ? 's' : ''}
                  {disabled ? ' · stock insuffisant' : ''}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-base font-semibold tabular-nums text-foreground">
                  {formatPriceTnd(bundle.price)}
                </span>
                {bundle.compareAtPrice != null ? (
                  <span className="flex items-center justify-end gap-1.5">
                    <span className="text-xs tabular-nums text-muted-foreground line-through">
                      {formatPriceTnd(bundle.compareAtPrice)}
                    </span>
                    {percent != null ? (
                      <span className="rounded bg-red-600/10 px-1 py-px text-[10px] font-semibold text-red-700">
                        -{percent}%
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
