import Link from 'next/link'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary bg-primary/10">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-light tracking-[0.4em] text-primary">MERCI</p>
        <h1 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">COMMANDE CONFIRMEE</h1>
        {orderId && (
          <p className="mt-3 text-sm font-light text-muted-foreground">
            Commande #{orderId}
          </p>
        )}
        <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
          Nous vous contacterons bientot pour confirmer les details de votre commande.
        </p>
      </div>
      <Link
        href="/products"
        className="rounded-full border border-border px-8 py-3 text-xs font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        CONTINUER LES ACHATS
      </Link>
    </div>
  )
}
