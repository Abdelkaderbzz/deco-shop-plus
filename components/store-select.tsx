import { cn } from '@/lib/utils'

type StoreSelectProps = {
  value?: string
  defaultValue?: string
  name?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  options: { value: string; label: string }[]
  placeholder?: string
  hasError?: boolean
  disabled?: boolean
  id?: string
}

export function StoreSelect({
  value,
  defaultValue,
  name,
  onChange,
  onBlur,
  options,
  placeholder = 'Selectionner...',
  hasError = false,
  disabled = false,
  id,
}: StoreSelectProps) {
  const controlled = value !== undefined
  return (
    <select
      id={id}
      name={name}
      {...(controlled ? { value } : { defaultValue: defaultValue ?? '' })}
      disabled={disabled}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      className={cn(
        'w-full rounded-xl border-2 bg-card px-4 py-3 text-base outline-none focus:ring-2',
        hasError
          ? 'border-destructive text-foreground focus:border-destructive focus:ring-destructive/20'
          : 'border-border text-foreground focus:border-primary focus:ring-primary/20',
        controlled && !value && 'text-muted-foreground',
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
