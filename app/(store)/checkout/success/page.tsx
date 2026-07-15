import Link from 'next/link'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a96e]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-light tracking-[0.4em] text-[#c9a96e]">MERCI</p>
        <h1 className="mt-2 text-3xl font-light tracking-widest text-[#f5f0e8]">COMMANDE CONFIRMEE</h1>
        {orderId && (
          <p className="mt-3 text-sm font-light text-[#8a8a8a]">
            Commande #{orderId}
          </p>
        )}
        <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-[#8a8a8a]">
          Nous vous contacterons bientot pour confirmer les details de votre commande.
        </p>
      </div>
      <Link
        href="/products"
        className="border border-[#2a2a2a] px-8 py-3 text-xs font-light tracking-[0.3em] text-[#8a8a8a] transition-all hover:border-[#c9a96e] hover:text-[#c9a96e]"
      >
        CONTINUER LES ACHATS
      </Link>
    </div>
  )
}
