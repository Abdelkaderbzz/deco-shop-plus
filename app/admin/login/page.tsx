import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminLoginForm } from './admin-login-form'

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/admin/')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 font-sans">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/524882961_17994883307831957_4888978496307767385_n-TtsjvPe8IlxmIpNnpU0tEgXgfwr2N4.jpg"
            alt="Jannah Parfume"
            className="mx-auto mb-4 h-14 w-14 rounded-full object-cover ring-2 ring-amber-200"
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Administration</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Connexion</h1>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
