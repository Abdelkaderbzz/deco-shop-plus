import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { cache } from 'react'

/** Dedupes session lookup within a single RSC/request (layout + page + actions). */
export const getAdminSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireAdminId() {
  const session = await getAdminSession()
  if (!session?.user) {
    throw new Error('Session expiree. Reconnectez-vous.')
  }
  return session.user.id
}
