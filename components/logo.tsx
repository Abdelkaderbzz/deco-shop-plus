import Image from 'next/image'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
}

const sizes = {
  sm: { className: 'h-12 w-12', px: 48 },
  md: { className: 'h-16 w-16', px: 64 },
  lg: { className: 'h-28 w-28', px: 144 },
  xl: { className: 'h-36 w-36', px: 192 },
}

export function Logo({ size = 'md', className = '', priority = false }: LogoProps) {
  const config = sizes[size]

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-card ring-1 ring-border shadow-sm ${config.className} ${className}`}
    >
      <Image
        src="/logo.webp"
        alt="Parfumerie Janna"
        width={config.px}
        height={config.px}
        sizes={`${config.px}px`}
        priority={priority}
        className="h-full w-full scale-[1.15] object-cover"
      />
    </div>
  )
}
