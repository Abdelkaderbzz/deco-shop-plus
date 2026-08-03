'use client'

import { extractInstagramReelId } from '@/lib/carousel-videos'
import { useCallback, useRef, useState } from 'react'

function extractReelId(url: string) {
  return extractInstagramReelId(url)
}

function circularDiff(index: number, active: number, total: number) {
  let diff = index - active
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

function ReelFrame({
  reelId,
  interactive,
  isCenter,
  active,
  onActivate,
}: {
  reelId: string
  interactive: boolean
  isCenter: boolean
  active: boolean
  onActivate: () => void
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-black transition-all duration-500 ${
        isCenter ? 'border-primary/25' : 'border-border/40'
      }`}
      style={{
        width: 290,
        height: 450,
        boxShadow: isCenter
          ? '0 12px 36px -10px rgba(154, 95, 82, 0.22), 0 4px 14px -4px rgba(248, 232, 236, 0.9)'
          : 'none',
      }}
    >
      {active ? (
        <iframe
          src={`https://www.instagram.com/reel/${reelId}/embed`}
          title={`Instagram reel ${reelId}`}
          className="absolute left-1/2 top-0 -translate-x-1/2 border-0"
          style={{
            width: 360,
            height: 700,
            marginTop: -72,
            pointerEvents: interactive ? 'auto' : 'none',
          }}
          scrolling="no"
          allow="autoplay; encrypted-media; clipboard-write"
          loading="lazy"
        />
      ) : isCenter ? (
        <button
          type="button"
          onClick={onActivate}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#3d2830] to-[#1a1216] px-6 text-center"
          aria-label="VOIR LE REEL"
        >
          <span className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-[11px] font-light tracking-[0.25em] text-white/90">VOIR LE REEL</span>
        </button>
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#3d2830] to-[#1a1216] px-6 text-center"
          aria-hidden
        >
          <span className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black/70 to-transparent" />
      {!interactive && active && <div className="absolute inset-0 bg-background/10" aria-hidden />}
    </div>
  )
}

export function InstagramCarousel({ reels }: { reels: string[] }) {
  const [index, setIndex] = useState(0)
  const [activated, setActivated] = useState<Record<string, boolean>>({})
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + reels.length) % reels.length)
    },
    [reels.length],
  )

  const goPrev = () => goTo(index - 1)
  const goNext = () => goTo(index + 1)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) {
      if (delta < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  if (reels.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-5xl select-none">
      <div
        className="relative px-12 sm:px-16"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative mx-auto flex h-[490px] items-center justify-center overflow-hidden">
          {reels.map((url, i) => {
            const diff = circularDiff(i, index, reels.length)
            if (Math.abs(diff) > 1) return null

            const reelId = extractReelId(url)
            const isCenter = diff === 0
            const isActive = Boolean(activated[url])
            const frameStyle = {
              transform: `translate(-50%, -50%) translateX(${diff * 72}%) scale(${isCenter ? 1.12 : 0.72})`,
              opacity: isCenter ? 1 : 0.42,
              zIndex: isCenter ? 30 : 20 - Math.abs(diff),
              filter: isCenter ? 'none' : 'blur(0.3px)',
              transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, filter 0.55s ease',
            } as const

            const frame = (
              <ReelFrame
                reelId={reelId}
                interactive={isCenter}
                isCenter={isCenter}
                active={isActive}
                onActivate={() => setActivated((prev) => ({ ...prev, [url]: true }))}
              />
            )

            if (isCenter) {
              return (
                <div key={url} className="absolute left-1/2 top-1/2 will-change-transform" style={frameStyle}>
                  {frame}
                </div>
              )
            }

            return (
              <button
                key={url}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Voir le reel ${i + 1}`}
                className="absolute left-1/2 top-1/2 cursor-pointer will-change-transform"
                style={frameStyle}
              >
                {frame}
              </button>
            )
          })}
        </div>

        {reels.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Reel precedent"
              className="absolute left-0 top-1/2 z-40 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Reel suivant"
              className="absolute right-0 top-1/2 z-40 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {reels.length > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1" role="group" aria-label="Reels Instagram">
            {reels.map((reel, i) => (
              <button
                key={reel}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller au reel ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`rounded-full transition-all duration-300 ${
                    i === index ? 'h-2.5 w-7 bg-primary' : 'h-2.5 w-2.5 bg-border hover:bg-primary/50'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-[11px] font-light tracking-widest text-muted-foreground">
            {index + 1} / {reels.length}
          </p>
        </div>
      )}
    </div>
  )
}
