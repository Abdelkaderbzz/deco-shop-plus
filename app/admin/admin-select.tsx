'use client'

import { Select } from '@base-ui/react/select'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { adminInputCls } from './admin-ui'

export type AdminSelectOption = { value: string; label: string }

type AdminSelectProps = {
  value: string
  onValueChange: (value: string) => void
  items: AdminSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function AdminSelect({
  value,
  onValueChange,
  items,
  placeholder = 'Selectionner...',
  disabled,
  className,
  error,
}: AdminSelectProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue)
      }}
      items={items}
      disabled={disabled}
    >
      <Select.Trigger
        className={cn(
          adminInputCls,
          'flex cursor-pointer items-center justify-between gap-2 py-2 text-left',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="size-4 shrink-0 text-slate-400" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} className="z-[60] outline-none">
          <Select.Popup className="max-h-60 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
            <Select.List className="overflow-y-auto p-1">
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  className="grid cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-800 outline-none select-none data-highlighted:bg-amber-50 data-highlighted:text-amber-900"
                >
                  <Select.ItemIndicator className="col-start-1 text-amber-700">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                  <Select.ItemText className="col-start-2">{item.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
