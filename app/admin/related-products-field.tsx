'use client'

import { MAX_RELATED_PRODUCTS } from '@/lib/product-relations'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminFieldError, adminInputCls, adminLabelCls } from './admin-ui'

export type ProductOption = {
  id: number
  name: string
  brand: string
  category: string
  published: boolean
}

export function RelatedProductsField({
  value,
  onChange,
  options,
  excludeId,
  error,
}: {
  value: number[]
  onChange: (ids: number[]) => void
  options: ProductOption[]
  excludeId?: number
  error?: string
}) {
  const [query, setQuery] = useState('')

  const selectable = useMemo(
    () => options.filter((option) => option.id !== excludeId),
    [options, excludeId],
  )

  const byId = useMemo(
    () => new Map(selectable.map((option) => [option.id, option])),
    [selectable],
  )

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return selectable
    return selectable.filter((option) =>
      `${option.brand} ${option.name}`.toLowerCase().includes(needle),
    )
  }, [selectable, query])

  const atLimit = value.length >= MAX_RELATED_PRODUCTS

  function toggle(id: number) {
    if (value.includes(id)) {
      onChange(value.filter((selected) => selected !== id))
      return
    }
    if (atLimit) return
    onChange([...value, id])
  }

  return (
    <div>
      <label className={adminLabelCls}>
        PRODUITS ASSOCIES ({value.length}/{MAX_RELATED_PRODUCTS})
      </label>

      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((id) => {
            const option = byId.get(id)
            return (
              <li
                key={id}
                className="flex items-center gap-1.5 rounded-full bg-amber-100 py-1 pl-3 pr-1.5 text-xs font-medium text-amber-900"
              >
                {option ? `${option.brand} — ${option.name}` : `Produit #${id}`}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label="Retirer ce produit"
                  className="rounded-full p-0.5 transition-colors hover:bg-amber-200"
                >
                  <X className="size-3" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un produit a associer..."
        className={adminInputCls}
      />

      <div className="mt-2 max-h-44 overflow-y-auto rounded-md border border-slate-200">
        {results.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">Aucun produit trouve.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {results.map((option) => {
              const checked = value.includes(option.id)
              return (
                <li key={option.id}>
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      checked ? 'bg-amber-50' : 'hover:bg-slate-50'
                    } ${!checked && atLimit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      className="accent-amber-700"
                      checked={checked}
                      disabled={!checked && atLimit}
                      onChange={() => toggle(option.id)}
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-800">
                      <span className="font-medium">{option.brand}</span> — {option.name}
                    </span>
                    {!option.published && (
                      <span className="shrink-0 text-xs text-slate-400">masque</span>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AdminFieldError message={error} />
      <p className="mt-1.5 text-xs text-slate-500">
        Affiches sous la fiche produit. Si vous n en choisissez aucun, la boutique propose
        automatiquement d autres articles de la meme categorie.
      </p>
    </div>
  )
}
