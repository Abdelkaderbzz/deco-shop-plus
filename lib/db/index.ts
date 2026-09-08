import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool, type PoolClient } from 'pg'
import { resolveDatabaseUrl } from './connection-string'
import * as schema from './schema'

const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool }

function isRetryableConnectError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return /timeout|terminat|ECONNRESET|ECONNREFUSED|EPIPE|ENOTFOUND|temporarily/i.test(
    message,
  )
}

function createPool() {
  const pool = new Pool({
    connectionString: resolveDatabaseUrl(),
    max: process.env.VERCEL ? 5 : 10,
    idleTimeoutMillis: 30_000,
    // Neon scale-to-zero cold starts often exceed 5s, and the first request
    // opens several clients at once.
    connectionTimeoutMillis: 30_000,
    keepAlive: true,
    allowExitOnIdle: true,
  })

  pool.on('error', (err) => {
    console.error('[db] pool client error:', err.message)
  })

  const connect = pool.connect.bind(pool) as {
    (): Promise<PoolClient>
    (
      callback: (
        err: Error | undefined,
        client: PoolClient | undefined,
        done: (release?: unknown) => void,
      ) => void,
    ): void
  }

  pool.connect = ((cb?: Parameters<typeof connect>[0]) => {
    if (cb) return connect(cb)

    const attempt = async (n: number): Promise<PoolClient> => {
      try {
        return await connect()
      } catch (err) {
        if (n >= 3 || !isRetryableConnectError(err)) throw err
        await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** (n - 1)))
        return attempt(n + 1)
      }
    }

    return attempt(1)
  }) as Pool['connect']

  return pool
}

export const pool = globalForDb.pgPool ?? createPool()
if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool
}

export const db = drizzle(pool, { schema })
