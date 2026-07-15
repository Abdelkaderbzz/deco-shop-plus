import { cn } from '@/lib/utils'

type StoreSelectProps = {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  hasError?: boolean
  disabled?: boolean
  id?: string
}

export function StoreSelect({
  value,
  onChange,
  options,
  placeholder = 'Selectionner...',
  hasError = false,
  disabled = false,
  id,
}: StoreSelectProps) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full rounded-xl border bg-input px-3 py-2.5 text-sm font-light text-foreground outline-none transition-colors focus:ring-2',
        hasError
          ? 'border-destructive focus:border-destructive'
          : 'border-border focus:border-primary/50 focus:ring-primary/10',
        !value && 'text-muted-foreground',
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
