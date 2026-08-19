import Image from 'next/image'
import { SITE } from '@/lib/site'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  withWordmark?: boolean
  priority?: boolean
}

const sizes = {
  sm: { className: 'h-11 w-11', px: 88 },
  md: { className: 'h-16 w-16', px: 128 },
  lg: { className: 'h-28 w-28', px: 224 },
  xl: { className: 'h-36 w-36', px: 288 },
}

export function Logo({
  size = 'md',
  className = '',
  withWordmark = false,
  priority = false,
}: LogoProps) {
  const config = sizes[size]

  return (
    <span className={`inline-flex items-center gap-2.5 text-foreground ${className}`}>
      <span className={`relative shrink-0 overflow-hidden rounded-xl ${config.className}`}>
        <Image
          src="/assets/deco-shop-logo.webp"
          alt={SITE.name}
          width={config.px}
          height={config.px}
          sizes={`${config.px}px`}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </span>
      {withWordmark ? (
        <span className="flex flex-col items-start">
          <span className="font-serif text-lg leading-none tracking-tight">Deco Shop</span>
          <span className="mt-0.5 text-[0.65em] font-medium uppercase tracking-[0.28em] text-primary">
            Plus
          </span>
        </span>
      ) : (
        <span className="sr-only">{SITE.name}</span>
      )}
    </span>
  )
}
