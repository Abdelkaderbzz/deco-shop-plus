type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-28 w-28',
  xl: 'h-36 w-36',
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-card ring-1 ring-border shadow-sm ${sizes[size]} ${className}`}
    >
      <img
        src="/logo.png"
        alt="Parfumerie Janna"
        className="h-full w-full scale-[1.15] object-cover"
      />
    </div>
  )
}
