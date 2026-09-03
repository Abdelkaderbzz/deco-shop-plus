import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { getStorefrontI18n } from '@/lib/i18n/get-locale'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams
  const { dict } = await getStorefrontI18n()

  return (
    <Reveal className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center" variant="zoom">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary bg-primary/10">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">{dict.success.thanks}</p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">{dict.success.title}</h1>
        {orderId && (
          <p className="mt-3 text-sm font-light text-muted-foreground">
            {dict.success.order(orderId)}
          </p>
        )}
        <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
          {dict.success.body}
        </p>
      </div>
      <Link
        href="/products"
        className="rounded-full border border-border px-8 py-3 text-xs font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        {dict.success.continue}
      </Link>
    </Reveal>
  )
}
