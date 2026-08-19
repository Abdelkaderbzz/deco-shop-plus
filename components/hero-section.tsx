'use client'

import { resolveHeroCtaHref, type HeroSlide } from '@/lib/hero-slides'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

function scrollToTarget(href: string) {
  if (!href.startsWith('#')) return false
  const el = document.querySelector(href)
  if (!el) return false
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}

export function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = slides.length
  const current = slides[index] ?? slides[0]

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return
      setIndex((next + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (paused || total <= 1) return
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, total])

  if (!current) return null

  const href = resolveHeroCtaHref(current)

  return (
    <section
      className="bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-3 md:py-5">
        <div className="relative min-h-[56vh] overflow-hidden rounded-2xl border border-border/60 bg-foreground md:min-h-[64vh]">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slideIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.alt || slide.title}
              fill
              priority={slideIndex === 0}
              fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
              sizes="(max-width: 1024px) 100vw, 80rem"
              className="hero-ken hero-ken-slow object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" />
          </div>
        ))}

        <div className="relative z-10 mx-auto flex min-h-[56vh] max-w-7xl flex-col justify-end px-4 py-10 md:min-h-[64vh] md:justify-center md:px-6 md:py-14">
          <div key={current.id} className="max-w-xl text-white">
            {current.eyebrow ? (
              <p className="hero-eyebrow text-[11px] font-medium uppercase tracking-[0.28em] text-white/80">
                {current.eyebrow}
              </p>
            ) : null}
            <h1 className="hero-title mt-3 font-serif text-3xl font-medium tracking-tight md:text-5xl lg:text-[3.25rem]">
              {current.title}
            </h1>
            {current.subtitle ? (
              <p className="hero-copy mt-3 max-w-md text-sm font-normal leading-relaxed text-white/80 md:text-base">
                {current.subtitle}
              </p>
            ) : null}
            {current.ctaLabel ? (
              <div className="hero-cta mt-5">
                <Link
                  href={href}
                  onClick={(event) => {
                    if (scrollToTarget(href)) event.preventDefault()
                  }}
                  className="hero-cta-pulse inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-foreground shadow-lg shadow-black/20"
                >
                  {current.ctaLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {total > 1 && (
          <>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(slideIndex)}
                  className={`h-2 rounded-full transition-all ${
                    slideIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Aller au slide ${slideIndex + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm md:flex"
              aria-label="Slide precedent"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm md:flex"
              aria-label="Slide suivant"
            >
              ›
            </button>
          </>
        )}
        </div>
      </div>
    </section>
  )
}
