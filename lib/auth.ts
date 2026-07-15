import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const localDevUrl = 'http://localhost:3000'

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

const deploymentUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined

const runtimeUrl = process.env.V0_RUNTIME_URL ?? localDevUrl

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.NODE_ENV === 'development' ? localDevUrl : undefined) ??
  productionUrl ??
  deploymentUrl ??
  runtimeUrl

const trustedOrigins = [
  ...new Set(
    [runtimeUrl, productionUrl, deploymentUrl, process.env.BETTER_AUTH_URL, localDevUrl, 'http://127.0.0.1:3000'].filter(
      Boolean,
    ),
  ),
] as string[]

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.NODE_ENV === 'development' &&
    baseURL.startsWith('https://') && {
      advanced: {
        defaultCookieAttributes: {
          sameSite: 'none',
          secure: true,
        },
      },
    }),
})
