import Image from 'next/image'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const sizes = {
  sm: { className: 'h-12 w-12', px: 96 },
  md: { className: 'h-20 w-20', px: 160 },
  lg: { className: 'h-36 w-36', px: 288 },
  xl: { className: 'h-44 w-44', px: 352 },
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
