'use client'

import { resolveHeroCtaHref, type HeroSlide } from '@/lib/hero-slides'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

const AUTOPLAY_MS = 6500

function scrollToTarget(href: string) {
  if (!href.startsWith('#')) return false
  const el = document.querySelector(href)
  if (!el) return false
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}

export function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)
  const [loadNearby, setLoadNearby] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const total = slides.length
  const current = slides[index] ?? slides[0]

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return
      setIndex((currentIndex) => {
        const target = (next + total) % total
        if (target === currentIndex) return currentIndex
        const forward = target === (currentIndex + 1) % total
        const backward = target === (currentIndex - 1 + total) % total
        setDirection(backward && !forward ? -1 : 1)
        return target
      })
    },
    [total],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: number | undefined
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => setLoadNearby(true))
    } else {
      timeoutId = window.setTimeout(() => setLoadNearby(true), 400)
    }
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (paused || reduceMotion || total <= 1) return
    const timer = window.setInterval(() => {
      setDirection(1)
      setIndex((prev) => (prev + 1) % total)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, reduceMotion, total, index])

  if (!current) return null

  const href = resolveHeroCtaHref(current)

  return (
    <section
      className="bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-3 md:py-5">
        <div className="relative aspect-[1920/825] w-full overflow-hidden rounded-2xl border border-border/60 bg-[#eef5f4]">
          {slides.map((slide, slideIndex) => {
            const isActive = slideIndex === index
            const isNearby =
              isActive ||
              slideIndex === (index + 1) % total ||
              slideIndex === (index - 1 + total) % total
            if (!isActive && (!loadNearby || !isNearby)) return null

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 ${
                  isActive ? 'z-[1]' : 'pointer-events-none z-0'
                } ${
                  reduceMotion
                    ? isActive
                      ? 'opacity-100'
                      : 'opacity-0'
                    : `transition-opacity duration-700 ease-out ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.alt || slide.title}
                  fill
                  priority={slideIndex === 0}
                  fetchPriority={slideIndex === 0 ? 'high' : 'low'}
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 1280px"
                  className="object-contain object-center"
                />
              </div>
            )
          })}

          {current.ctaLabel ? (
            <div
              className="absolute inset-x-0 bottom-14 z-10 flex justify-center px-4 md:bottom-16"
              key={current.id}
              style={
                reduceMotion
                  ? undefined
                  : {
                      animation: 'hero-copy-in 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
                      ['--hero-dx' as string]: direction > 0 ? '28px' : '-28px',
                    }
              }
            >
              <Link
                href={href}
                onClick={(event) => {
                  if (scrollToTarget(href)) event.preventDefault()
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-foreground shadow-lg shadow-black/25"
              >
                {current.ctaLabel}
              </Link>
            </div>
          ) : null}

          <h1 className="sr-only">{current.title}</h1>

          {total > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5">
                {slides.map((slide, slideIndex) => {
                  const active = slideIndex === index
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goTo(slideIndex)}
                      className="flex h-11 w-11 items-center justify-center"
                      aria-label={`Aller au slide ${slideIndex + 1}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      <span
                        className={`relative overflow-hidden rounded-full ${
                          active ? 'h-2 w-8 bg-white/35' : 'h-2 w-2 bg-white/80'
                        }`}
                      >
                        {active && !reduceMotion ? (
                          <span
                            key={`${index}-${paused}`}
                            className="hero-dot-progress absolute inset-y-0 left-0 rounded-full bg-white"
                            data-paused={paused ? '' : undefined}
                          />
                        ) : active ? (
                          <span className="absolute inset-0 rounded-full bg-white" />
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="absolute bottom-4 left-3 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/35 text-lg text-white backdrop-blur-sm md:flex"
                aria-label="Slide precedent"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="absolute bottom-4 right-3 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/35 text-lg text-white backdrop-blur-sm md:flex"
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
