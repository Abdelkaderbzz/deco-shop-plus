// Temporary check: node scripts/inspect-new-tables.mjs
import { Pool } from 'pg'
import { resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()
const pool = new Pool({ connectionString: resolveDatabaseUrl() })

const boutiques = await pool.query(
  'select id, slug, name, city, region, "pickupEnabled", published, "sortOrder" from boutiques order by "sortOrder"',
)
console.log('BOUTIQUES:', JSON.stringify(boutiques.rows, null, 1))

const banners = await pool.query(
  'select id, name, message, variant, "backgroundColor", "textColor", "fontSize", active from banners',
)
console.log('BANNERS:', JSON.stringify(banners.rows, null, 1))

await pool.end()
