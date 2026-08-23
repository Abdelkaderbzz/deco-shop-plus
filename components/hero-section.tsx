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
        <div className="relative min-h-[56vh] overflow-hidden rounded-2xl border border-border/60 bg-[#0a3d42] md:min-h-[64vh]">
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
                  quality={70}
                  sizes="(max-width: 768px) 100vw, 1280px"
                  className={`object-cover object-[72%_center] ${
                    reduceMotion
                      ? ''
                      : `transition-transform duration-[6500ms] ease-out ${
                          isActive ? 'scale-105' : 'scale-100'
                        }`
                  }`}
                />
                <div className="absolute inset-0 bg-linear-to-r from-[#0a3d42]/78 via-[#0a3d42]/38 to-transparent" />
              </div>
            )
          })}

          <div className="relative z-10 mx-auto flex min-h-[56vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-10 md:min-h-[64vh] md:justify-center md:px-10 md:pb-20 md:pt-14">
            <div
              key={current.id}
              className="max-w-xl text-white"
              style={
                reduceMotion
                  ? undefined
                  : {
                      animation: 'hero-copy-in 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
                      ['--hero-dx' as string]: direction > 0 ? '28px' : '-28px',
                    }
              }
            >
              {current.eyebrow ? (
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/85">
                  {current.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
                {current.title}
              </h1>
              {current.subtitle ? (
                <p className="mt-3 max-w-md text-sm font-normal leading-relaxed text-white/90 md:text-base">
                  {current.subtitle}
                </p>
              ) : null}
              {current.ctaLabel ? (
                <div className="mt-5">
                  <Link
                    href={href}
                    onClick={(event) => {
                      if (scrollToTarget(href)) event.preventDefault()
                    }}
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-foreground shadow-lg shadow-black/20"
                  >
                    {current.ctaLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

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
