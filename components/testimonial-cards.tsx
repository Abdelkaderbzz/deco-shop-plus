import type { TestimonialComment } from '@/lib/testimonials'

const AVATAR_GRADIENTS = {
  facebook: 'from-[#1877F2] to-[#0d65d9]',
  instagram: 'from-pink-500 via-purple-500 to-orange-400',
  whatsapp: 'from-emerald-500 to-teal-600',
} as const

const CARD_SHELL =
  'flex min-h-full flex-1 flex-col overflow-hidden rounded-xl text-left shadow-[0_8px_24px_-16px_rgba(15,23,42,0.45)]'
const CARD_PAD = 'px-4 py-3'

function Avatar({ item }: { item: TestimonialComment }) {
  const badge = (
    <div
      className={`flex size-full items-center justify-center rounded-full bg-linear-to-br ${AVATAR_GRADIENTS[item.source]} text-[10px] font-semibold text-white`}
    >
      {item.avatar}
    </div>
  )

  if (item.source === 'facebook' && item.avatarColor) {
    return (
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: item.avatarColor }}
      >
        {item.avatar}
      </div>
    )
  }

  if (!item.storyRing) {
    return <div className="size-8 shrink-0 self-start">{badge}</div>
  }

  return (
    <div className="size-9 shrink-0 self-start rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
      <div className="size-full overflow-hidden rounded-full bg-[#121212] p-0.5">{badge}</div>
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

function FacebookGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.2 20v-7.1h2.4l.36-2.78H13.2V8.34c0-.8.22-1.35 1.38-1.35H16V4.5c-.24-.03-1.06-.1-2.01-.1-1.99 0-3.35 1.21-3.35 3.44v1.92H8.4v2.78h2.24V20h2.56z"
      />
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
    <article className={`${CARD_SHELL} ${CARD_PAD} bg-[#121212]`}>
      <div className="mb-2 flex items-center gap-1.5 text-[9px] tracking-wider text-white/40">
        <InstagramGlyph />
        INSTAGRAM
      </div>
      <div className="flex gap-2.5">
        <Avatar item={item} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-white">
            <span className="font-semibold">{item.username}</span>{' '}
            <span className="font-normal text-white/90">{item.message}</span>
          </p>
          <p className="mt-1.5 text-[10px] text-white/40">{item.time}</p>
        </div>
      </div>
    </article>
  )
}

export function WhatsAppCommentCard({ item }: { item: TestimonialComment }) {
  return (
    <article className={`${CARD_SHELL} bg-[#0b141a]`}>
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#1f2c34] px-4 py-3">
        <Avatar item={item} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">{item.username}</p>
          <p className="text-[9px] text-emerald-400">en ligne</p>
        </div>
      </div>
      <div
        className="flex flex-1 items-center px-4 py-3"
        style={{ backgroundImage: CHAT_WALLPAPER }}
      >
        <div className="max-w-[92%] rounded-lg rounded-tl-none bg-[#005c4b] px-2.5 py-1.5">
          <p className="text-[12.5px] leading-relaxed text-[#e9edef]">{item.message}</p>
          <div className="mt-0.5 flex items-center justify-end gap-1">
            <span className="text-[9px] text-white/50">{item.time}</span>
            <ReadReceipt />
          </div>
        </div>
      </div>
    </article>
  )
}

export function FacebookCommentCard({ item }: { item: TestimonialComment }) {
  return (
    <article className={`${CARD_SHELL} ${CARD_PAD} bg-white`}>
      <div className="flex items-start gap-2.5">
        <Avatar item={item} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#050505]">{item.username}</p>
          <p className="text-[11px] text-[#65676b]">{item.time}</p>
        </div>
        <FacebookGlyph />
      </div>
      <p className="mt-2 text-[12.5px] leading-snug text-[#050505]">{item.message}</p>
      <p className="mt-auto pt-2 text-[11px] font-medium text-[#65676b]">J&apos;aime · Répondre</p>
    </article>
  )
}
