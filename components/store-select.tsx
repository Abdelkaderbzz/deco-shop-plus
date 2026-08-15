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
        'w-full rounded-xl border-2 bg-card px-4 py-3 text-base outline-none transition-colors focus:ring-2',
        hasError
          ? 'border-destructive text-foreground focus:border-destructive focus:ring-destructive/20'
          : 'border-border text-foreground focus:border-primary focus:ring-primary/20',
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
