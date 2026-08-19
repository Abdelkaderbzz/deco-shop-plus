// Run with: node scripts/create-admin.mjs
import { Pool } from 'pg'
import crypto from 'crypto'
import { promisify } from 'util'
import { databaseHost, resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = resolveDatabaseUrl()
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set. Set it in .env or pass it in the environment.')
  process.exit(1)
}

console.log(
  `Creating admin on DATABASE_URL (${databaseHost(DATABASE_URL)})`,
)

const scrypt = promisify(crypto.scrypt)

const pool = new Pool({ connectionString: DATABASE_URL })

// Better Auth uses scrypt with N=16384, r=16, p=1 — same format: salt:hash (hex)
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  })
  return `${salt}:${derivedKey.toString('hex')}`
}

const email = 'admin@decoshopplus.tn'
const password = 'DecoShop2026!'
const name = 'Admin'
const previousEmails = ['admin@waterofcold.tn']

try {
  const existing = await pool.query(
    'SELECT id FROM "user" WHERE email = ANY($1::text[]) LIMIT 1',
    [[email, ...previousEmails]],
  )
  if (existing.rows.length > 0) {
    const userId = existing.rows[0].id
    const hashedPassword = await hashPassword(password)
    const now = new Date()
    await pool.query(
      `UPDATE "user" SET email = $1, name = $2, "updatedAt" = $3 WHERE id = $4`,
      [email, name, now, userId],
    )
    await pool.query(
      `UPDATE "account" SET password = $1, "updatedAt" = $2
       WHERE "userId" = $3 AND "providerId" = 'credential'`,
      [hashedPassword, now, userId],
    )
    console.log('✓ Admin credentials updated!')
    console.log('  Email:    ', email)
    console.log('  Password: ', password)
    console.log('  Login at: /admin/login')
    await pool.end()
    process.exit(0)
  }

  const userId = crypto.randomUUID()
  const accountId = crypto.randomUUID()
  const hashedPassword = await hashPassword(password)
  const now = new Date()

  await pool.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, name, email, true, 'admin', now, now]
  )

  await pool.query(
    `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [accountId, userId, 'credential', userId, hashedPassword, now, now]
  )

  console.log('✓ Admin account created!')
  console.log('  Email:    ', email)
  console.log('  Password: ', password)
  console.log('  Login at: /admin/login')
} catch (err) {
  console.error('Error:', err.message)
} finally {
  await pool.end()
}
