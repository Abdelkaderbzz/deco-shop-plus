'use client'

import { useCallback, useRef, useState } from 'react'

const INSTAGRAM_URL = 'https://www.instagram.com/parfumerie_jannah_/'

function extractReelId(url: string) {
  const match = url.match(/reel\/([^/?]+)/)
  return match?.[1] ?? ''
}

function circularDiff(index: number, active: number, total: number) {
  let diff = index - active
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

function ReelFrame({ reelId, interactive, isCenter }: { reelId: string; interactive: boolean; isCenter: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-black transition-all duration-500 ${
        isCenter ? 'border-primary/25' : 'border-border/40'
      }`}
      style={{
        width: 290,
        height: 450,
        boxShadow: isCenter
          ? '0 12px 36px -10px rgba(196, 137, 122, 0.22), 0 4px 14px -4px rgba(248, 232, 236, 0.9)'
          : 'none',
      }}
    >
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
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black/70 to-transparent" />
      {!interactive && <div className="absolute inset-0 bg-background/10" aria-hidden />}
    </div>
  )
}

export function InstagramCarousel({ reels }: { reels: string[] }) {
  const [index, setIndex] = useState(0)
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

            return (
              <button
                key={url}
                type="button"
                onClick={() => !isCenter && goTo(i)}
                aria-label={isCenter ? 'Reel actif' : `Voir le reel ${i + 1}`}
                className="absolute left-1/2 top-1/2 will-change-transform"
                style={{
                  transform: `translate(-50%, -50%) translateX(${diff * 72}%) scale(${isCenter ? 1.12 : 0.72})`,
                  opacity: isCenter ? 1 : 0.42,
                  zIndex: isCenter ? 30 : 20 - Math.abs(diff),
                  filter: isCenter ? 'none' : 'blur(0.3px)',
                  transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, filter 0.55s ease',
                  cursor: isCenter ? 'default' : 'pointer',
                }}
              >
                <ReelFrame reelId={reelId} interactive={isCenter} isCenter={isCenter} />
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
              className="absolute left-0 top-1/2 z-40 -translate-y-1/2 rounded-full border border-border bg-card/90 p-3 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Reel suivant"
              className="absolute right-0 top-1/2 z-40 -translate-y-1/2 rounded-full border border-border bg-card/90 p-3 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {reels.length > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {reels.map((reel, i) => (
              <button
                key={reel}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller au reel ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? 'h-2 w-7 bg-primary' : 'h-2 w-2 bg-border hover:bg-primary/50'
                }`}
              />
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function InstagramSectionHeader() {
  return (
    <div className="mb-12 text-center">
      <p className="text-[10px] font-light tracking-[0.4em] text-primary">INSTAGRAM</p>
      <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">
        @parfumerie_jannah_
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
        Coulisses, nouveautes et inspirations parfumees au quotidien.
      </p>
    </div>
  )
}

export function InstagramFollowButton() {
  return (
    <div className="mt-10 text-center">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 rounded-full border border-border px-8 py-3 text-xs font-light tracking-[0.25em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <InstagramIcon />
        SUIVRE @parfumerie_jannah_
      </a>
    </div>
  )
}

export function InstagramEmbed({ permalink }: { permalink: string }) {
  return <InstagramCarousel reels={[permalink]} />
}

export { INSTAGRAM_URL }
