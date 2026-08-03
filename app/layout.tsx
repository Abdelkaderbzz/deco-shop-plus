import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { ToastProvider } from '@/components/toast-provider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parfumerie Janna | Beaute feminine',
  description:
    'Boutique feminine en Tunisie. Parfums, maquillage, sacs et soins selectionnes avec amour pour sublimer votre elegance.',
  keywords: [
    'beaute',
    'parfum',
    'maquillage',
    'sacs',
    'soins',
    'Tunisie',
    'Parfumerie Janna',
    'femme',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fef8f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`bg-background ${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
