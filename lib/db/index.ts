import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { resolveDatabaseUrl } from './connection-string'
import * as schema from './schema'

export const pool = new Pool({
  connectionString: resolveDatabaseUrl(),
  max: process.env.VERCEL ? 5 : 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  allowExitOnIdle: true,
})

export const db = drizzle(pool, { schema })
