'use client'

import { Logo } from '@/components/logo'
import type { HeroImageSlot } from '@/lib/hero-images'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useRef, type PointerEvent } from 'react'

const TITLE = 'Water of Gold'

const TILES = [
  { aspect: 'aspect-3/4', delay: 'hero-delay-3' },
  { aspect: 'aspect-square', delay: 'hero-delay-4' },
  { aspect: 'aspect-square', delay: 'hero-delay-5' },
  { aspect: 'aspect-3/4', delay: 'hero-delay-6' },
] as const

function HeroTitle() {
  return (
    <h1 className="hero-title mt-3 font-serif text-4xl font-normal tracking-[0.08em] text-foreground md:text-5xl lg:text-[3.25rem]">
      {TITLE.split('').map((char, index) => (
        <span key={`${char}-${index}`} className="hero-char-mask">
          <span
            className="hero-char"
            style={{ animationDelay: `${0.26 + index * 0.032}s` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </h1>
  )
}

function HeroTile({
  image,
  aspect,
  delay,
  priority,
  ken,
}: {
  image: HeroImageSlot
  aspect: string
  delay: string
  priority?: boolean
  ken: 'slow' | 'slower'
}) {
  return (
    <figure className={`hero-shot ${delay} relative overflow-hidden ${aspect}`}>
      <div className="hero-tile absolute inset-0">
        <Image
          src={image.imageUrl}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 45vw, 280px"
          className={`hero-ken hero-ken-${ken} object-cover`}
        />
      </div>
    </figure>
  )
}

export function HeroSection({ images }: { images: HeroImageSlot[] }) {
  const [topLeft, topRight, bottomLeft, bottomRight] = images
  const frameRef = useRef<HTMLDivElement>(null)

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const el = frameRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--hx', `${x * 14}px`)
    el.style.setProperty('--hy', `${y * 10}px`)
    el.style.setProperty('--hr', `${x * 1.2}deg`)
  }, [])

  const onPointerLeave = useCallback(() => {
    const el = frameRef.current
    if (!el) return
    el.style.setProperty('--hx', '0px')
    el.style.setProperty('--hy', '0px')
    el.style.setProperty('--hr', '0deg')
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-glow absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="hero-glow hero-glow-late absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:py-14 lg:gap-16">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="hero-logo">
            <Logo size="sm" className="md:h-11 md:w-11" priority />
          </div>

          <p className="hero-eyebrow mt-5 text-[10px] font-light tracking-[0.45em] text-primary">
            MAISON DE PARFUM · SOUSSE
          </p>

          <HeroTitle />

          <div className="hero-rule mt-5 h-px w-16 bg-primary/70 md:w-20" />

          <p className="hero-copy mt-5 max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
            Fragrances inspirees des grandes maisons, de longue tenue, pour femmes et hommes.
          </p>

          <div className="hero-cta mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:justify-start">
            <Link
              href="/products"
              className="rounded-full bg-primary px-7 py-2.5 text-[10px] font-light tracking-[0.32em] text-primary-foreground transition-transform duration-500 hover:scale-[1.03] hover:bg-primary/90"
            >
              DECOUVRIR
            </Link>
            <Link
              href="/products?category=femme"
              className="text-[10px] font-light tracking-[0.32em] text-muted-foreground transition-colors hover:text-primary"
            >
              FEMME
            </Link>
            <span className="text-primary/40" aria-hidden>
              ·
            </span>
            <Link
              href="/products?category=homme"
              className="text-[10px] font-light tracking-[0.32em] text-muted-foreground transition-colors hover:text-primary"
            >
              HOMME
            </Link>
          </div>
        </div>

        <div
          ref={frameRef}
          className="hero-frame relative px-2 py-2 md:px-3 md:py-3"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <span className="hero-corner hero-corner-tl" aria-hidden />
          <span className="hero-corner hero-corner-tr" aria-hidden />
          <span className="hero-corner hero-corner-bl" aria-hidden />
          <span className="hero-corner hero-corner-br" aria-hidden />

          <div className="hero-collage grid grid-cols-2 gap-2.5 md:gap-3">
            <div className="space-y-2.5 md:space-y-3">
              <HeroTile image={topLeft} aspect={TILES[0].aspect} delay={TILES[0].delay} priority ken="slow" />
              <HeroTile image={bottomLeft} aspect={TILES[2].aspect} delay={TILES[2].delay} ken="slower" />
            </div>
            <div className="space-y-2.5 pt-7 md:space-y-3 md:pt-10">
              <HeroTile image={topRight} aspect={TILES[1].aspect} delay={TILES[1].delay} priority ken="slower" />
              <HeroTile image={bottomRight} aspect={TILES[3].aspect} delay={TILES[3].delay} ken="slow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
