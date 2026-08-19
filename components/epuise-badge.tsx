import { cn } from '@/lib/utils'

export function EpuiseBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute top-3 left-3 z-20 rounded-full bg-black px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm',
        className,
      )}
    >
      Épuisé
    </span>
  )
}
