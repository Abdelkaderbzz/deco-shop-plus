'use client'

import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/get-error-message'
import { loginSchema, type LoginFormValues } from '@/lib/validations'
import { useToast } from '@/components/toast-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AdminFieldError, adminInputCls, adminInputWithError, adminLabelCls } from '../admin-ui'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function AdminLoginForm() {
  const router = useRouter()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await authClient.signIn.email(values)
      if (result.error) {
        toast.error('Email ou mot de passe incorrect.')
        return
      }
      toast.success('Connexion reussie.')
      router.push('/admin')
      router.refresh()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Impossible de se connecter. Reessayez.'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      autoComplete="on"
      method="post"
      action="/admin/login"
      name="admin-login"
    >
      <div>
        <label htmlFor="admin-email" className={adminLabelCls}>
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username email"
          className={adminInputWithError(!!errors.email)}
          {...register('email')}
        />
        <AdminFieldError message={errors.email?.message} />
      </div>
      <div>
        <label htmlFor="admin-password" className={adminLabelCls}>
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`${adminInputWithError(!!errors.password)} pr-11`}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        <AdminFieldError message={errors.password?.message} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-amber-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-800 disabled:opacity-60"
      >
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
