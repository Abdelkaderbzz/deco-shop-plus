import Image from 'next/image'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const sizes = {
  sm: { className: 'h-9 w-9', px: 72 },
  md: { className: 'h-16 w-16', px: 128 },
  lg: { className: 'h-28 w-28', px: 224 },
  xl: { className: 'h-36 w-36', px: 288 },
}

export function Logo({ size = 'md', className = '', priority = false }: LogoProps) {
  const config = sizes[size]

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-md bg-black ${config.className} ${className}`}>
      <Image
        src="/logo.webp"
        alt="Water of Gold"
        width={config.px}
        height={config.px}
        sizes={`${config.px}px`}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="h-full w-full object-contain"
      />
    </div>
  )
}
