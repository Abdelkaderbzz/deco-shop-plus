import type { TestimonialComment } from '@/lib/testimonials'

const AVATAR_GRADIENTS = {
  instagram: 'from-pink-500 via-purple-500 to-orange-400',
  whatsapp: 'from-emerald-500 to-teal-600',
  google: 'from-[#4285f4] to-[#34a853]',
} as const

function Avatar({ item }: { item: TestimonialComment }) {
  const badge = (
    <div
      className={`flex size-full items-center justify-center rounded-full bg-linear-to-br ${AVATAR_GRADIENTS[item.source]} text-[10px] font-semibold text-white`}
    >
      {item.avatar}
    </div>
  )

  if (!item.storyRing) {
    return <div className="size-8 shrink-0 self-start">{badge}</div>
  }

  return (
    <div className="size-9 shrink-0 self-start rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
      <div className="size-full overflow-hidden rounded-full bg-[#121212] p-[2px]">{badge}</div>
    </div>
  )
}

function InstagramGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
    </svg>
  )
}

function ReadReceipt() {
  return (
    <svg width="13" height="9" viewBox="0 0 16 11" fill="#53bdeb" aria-hidden>
      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146.445.445 0 0 0-.14.334.43.43 0 0 0 .146.331l2.932 2.77a.463.463 0 0 0 .326.127.48.48 0 0 0 .313-.114l6.566-8.099a.43.43 0 0 0 .096-.323.444.444 0 0 0-.172-.3z" />
      <path d="M15.266.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-8.79 10.86-1.09-1.03a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146.445.445 0 0 0-.14.334.43.43 0 0 0 .146.331l1.617 1.53a.463.463 0 0 0 .326.127.48.48 0 0 0 .313-.114l9.166-11.32a.43.43 0 0 0 .096-.323.444.444 0 0 0-.172-.3z" />
    </svg>
  )
}

/** WhatsApp's tiled chat wallpaper, inlined so it costs no extra request. */
const CHAT_WALLPAPER = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

export function InstagramCommentCard({ item }: { item: TestimonialComment }) {
  return (
    <div className="flex h-full flex-col justify-center bg-[#121212] px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-[9px] tracking-wider text-white/40">
        <InstagramGlyph />
        INSTAGRAM
      </div>
      <div className="flex gap-2.5">
        <Avatar item={item} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-[13px] leading-snug text-white">
            <span className="font-semibold">{item.username}</span>{' '}
            <span className="font-normal text-white/90">{item.message}</span>
          </p>
          <p className="mt-1.5 text-[10px] text-white/40">{item.time}</p>
        </div>
      </div>
    </div>
  )
}

export function WhatsAppCommentCard({ item }: { item: TestimonialComment }) {
  return (
    <div className="flex h-full flex-col bg-[#0b141a]">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#1f2c34] px-3 py-2">
        <Avatar item={item} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">{item.username}</p>
          <p className="text-[9px] text-emerald-400">en ligne</p>
        </div>
      </div>
      <div
        className="flex flex-1 items-center px-3 py-3"
        style={{ backgroundImage: CHAT_WALLPAPER }}
      >
        <div className="max-w-[92%] rounded-lg rounded-tl-none bg-[#005c4b] px-2.5 py-1.5">
          <p className="line-clamp-3 text-[12.5px] leading-relaxed text-[#e9edef]">{item.message}</p>
          <div className="mt-0.5 flex items-center justify-end gap-1">
            <span className="text-[9px] text-white/50">{item.time}</span>
            <ReadReceipt />
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.2l.1.1 6.3 5.3C36.1 41.3 44 36 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  )
}

function GoogleStars({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} etoiles`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={index < rating ? '#fb8c00' : '#e0e0e0'}
          aria-hidden
        >
          <path d="M12 2.5l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.8l-5.9 3.2 1.2-6.7L2.5 9.6l6.6-.9L12 2.5z" />
        </svg>
      ))}
    </div>
  )
}

export function GoogleReviewCard({ item }: { item: TestimonialComment }) {
  return (
    <article className="flex h-full flex-col rounded-xl bg-white px-4 py-3 text-left shadow-[0_8px_24px_-16px_rgba(15,23,42,0.45)]">
      <div className="flex items-start gap-2.5">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: item.avatarColor ?? '#7e57c2' }}
        >
          {item.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#1a73e8]">{item.username}</p>
          <p className="text-[11px] text-[#9aa0a6]">{item.time}</p>
        </div>
        <GoogleGlyph />
      </div>
      <div className="mt-2">
        <GoogleStars rating={item.rating ?? 5} />
      </div>
      <p className="mt-2 line-clamp-3 text-[12.5px] leading-snug text-[#3c4043]">{item.message}</p>
    </article>
  )
}
