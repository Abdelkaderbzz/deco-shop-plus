// Run with: node scripts/restore-categories.mjs
import { Pool } from 'pg'
import { resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = resolveDatabaseUrl()
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set.')
  process.exit(1)
}

const RESTORE_CATEGORIES = [
  { name: 'Coussins', slug: 'coussins' },
  { name: 'Accessoires', slug: 'accessoires' },
  { name: 'Rangement', slug: 'rangement' },
  { name: 'Literie', slug: 'textiles' },
]

const REMOVE_SLUGS = ['parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous', 'femme', 'homme']

const pool = new Pool({ connectionString: DATABASE_URL })

try {
  for (const category of RESTORE_CATEGORIES) {
    await pool.query(
      `INSERT INTO "categories" ("name", "slug") VALUES ($1, $2)
       ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = now()`,
      [category.name, category.slug],
    )
    console.log(`✓ Ensured category "${category.name}" (${category.slug})`)
  }

  const fallback = await pool.query(
    `UPDATE "products" SET "category" = 'coussins', "updatedAt" = now()
     WHERE "category" = ANY($1::text[])`,
    [REMOVE_SLUGS],
  )
  if (fallback.rowCount > 0) {
    console.log(`✓ Fallback: ${fallback.rowCount} remaining product(s) set to coussins`)
  }

  const removed = await pool.query(
    `DELETE FROM "categories" WHERE "slug" = ANY($1::text[]) RETURNING "slug"`,
    [REMOVE_SLUGS],
  )
  if (removed.rowCount > 0) {
    console.log(`✓ Removed categories: ${removed.rows.map((r) => r.slug).join(', ')}`)
  }

  const categories = await pool.query(`SELECT "name", "slug" FROM "categories" ORDER BY "slug"`)
  const products = await pool.query(
    `SELECT "category", COUNT(*)::int AS count FROM "products" GROUP BY "category" ORDER BY "category"`,
  )
  console.log('Current categories:', categories.rows)
  console.log('Products by category:', products.rows)
} catch (err) {
  console.error('Restore failed:', err.message)
  process.exit(1)
} finally {
  await pool.end()
}
