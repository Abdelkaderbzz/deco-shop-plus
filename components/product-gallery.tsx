'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

const AUTOPLAY_MS = 3500

export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[]
  alt: string
  badge?: ReactNode
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const lastManualAt = useRef(0)
  const total = images.length
  const canAutoplay = total > 1

  const goTo = useCallback((index: number) => {
    lastManualAt.current = Date.now()
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!canAutoplay) return

    const tick = () => {
      if (document.hidden) return
      if (Date.now() - lastManualAt.current < AUTOPLAY_MS) return
      setActiveIndex((prev) => (prev + 1) % total)
    }

    const timer = window.setInterval(tick, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [canAutoplay, total])

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center border border-border bg-secondary">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border">
          <path d="M12 2C8 2 5 5.5 5 9c0 5 7 13 7 13s7-8 7-13c0-3.5-3-7-7-7z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square overflow-hidden border border-border bg-secondary"
        aria-roledescription="carousel"
        aria-label={alt}
        data-gallery-index={activeIndex}
      >
        {images.map((url, index) => {
          const isActive = index === activeIndex
          return (
            <div
              key={`${url}-${index}`}
              className={`absolute inset-0 ${isActive ? 'z-1' : 'pointer-events-none z-0'} ${
                reduceMotion
                  ? isActive
                    ? 'opacity-100'
                    : 'opacity-0'
                  : `transition-opacity duration-700 ease-out ${isActive ? 'opacity-100' : 'opacity-0'}`
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={url}
                alt={isActive ? alt : ''}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )
        })}
        {badge}
      </div>

      {canAutoplay && (
        <div className="grid grid-cols-5 gap-2" role="tablist" aria-label={alt}>
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onPointerDown={(event) => {
                if (event.button !== 0) return
                goTo(index)
              }}
              className={`relative aspect-square overflow-hidden border ${
                index === activeIndex ? 'border-primary' : 'border-border hover:border-primary/40'
              }`}
            >
              <Image
                src={url}
                alt={`${alt} ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
