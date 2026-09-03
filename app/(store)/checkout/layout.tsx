import type { Metadata } from 'next'
import { getStorefrontI18n } from '@/lib/i18n/get-locale'

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getStorefrontI18n()
  return {
    title: dict.checkout.title,
    robots: { index: false, follow: false },
  }
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
