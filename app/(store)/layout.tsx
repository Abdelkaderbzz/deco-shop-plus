import { CartProvider } from '@/components/cart-context'
import { Navbar } from '@/components/navbar'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="min-h-screen pt-[73px]">{children}</main>
      <footer className="border-t border-[#2a2a2a] bg-[#0f0f0f] py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/524882961_17994883307831957_4888978496307767385_n-TtsjvPe8IlxmIpNnpU0tEgXgfwr2N4.jpg"
            alt="Jannah Parfume"
            className="mx-auto mb-4 h-12 w-12 rounded-full object-cover"
          />
          <p className="text-xs font-light tracking-widest text-[#8a8a8a]">
            JANNAH PARFUME &mdash; TUNISIE
          </p>
          <a
            href="https://www.instagram.com/jannahparfume/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-light tracking-widest text-[#c9a96e] hover:underline"
          >
            @jannahparfume
          </a>
          <p className="mt-4 text-[11px] text-[#2a2a2a]">
            &copy; {new Date().getFullYear()} Jannah Parfume. Tous droits reserves.
          </p>
        </div>
      </footer>
    </CartProvider>
  )
}
