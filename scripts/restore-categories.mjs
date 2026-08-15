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
  { name: 'Femme', slug: 'femme' },
  { name: 'Homme', slug: 'homme' },
]

const REMOVE_SLUGS = ['parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous']

const PRODUCT_CATEGORY_MAP = [
  ['Yara', 'Lattafa', 'femme'],
  ['Bright Orchard', 'MATCH', 'femme'],
  ['Miss Gris Intense', 'ASSAF', 'femme'],
  ['Musk Collection', 'Ibraheem Al Qurashi', 'femme'],
  ['Vanilla Candy Rock Sugar | 42', 'Kayali', 'femme'],
  ['Musk Pomegranate', 'IBRAQ', 'femme'],
  ['Eclaire', 'Lattafa', 'femme'],
  ['Coffret Yara', 'Lattafa', 'femme'],
]

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

  for (const [name, brand, category] of PRODUCT_CATEGORY_MAP) {
    const result = await pool.query(
      `UPDATE "products" SET "category" = $1, "updatedAt" = now()
       WHERE "name" = $2 AND "brand" = $3`,
      [category, name, brand],
    )
    if (result.rowCount > 0) {
      console.log(`✓ Restored "${name}" → ${category}`)
    }
  }

  const fallback = await pool.query(
    `UPDATE "products" SET "category" = 'femme', "updatedAt" = now()
     WHERE "category" IN ('parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous')`,
  )
  if (fallback.rowCount > 0) {
    console.log(`✓ Fallback: ${fallback.rowCount} remaining product(s) set to femme`)
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
