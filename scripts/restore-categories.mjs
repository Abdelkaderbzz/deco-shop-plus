// Run with: node scripts/restore-categories.mjs
import { Pool } from 'pg'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set.')
  process.exit(1)
}

const RESTORE_CATEGORIES = [
  { name: 'Parfums', slug: 'parfums' },
  { name: 'Maquillage', slug: 'maquillage' },
  { name: 'Sacs', slug: 'sacs' },
  { name: 'Soins', slug: 'soins' },
]

const REMOVE_SLUGS = ['homme', 'femme', 'unisex', 'tous']

// Original categories from seed-products.mjs (name + brand -> category)
const PRODUCT_CATEGORY_MAP = [
  ['Yara', 'Lattafa', 'parfums'],
  ['Bright Orchard', 'MATCH', 'parfums'],
  ['Miss Gris Intense', 'ASSAF', 'parfums'],
  ['Musk Collection', 'Ibraheem Al Qurashi', 'parfums'],
  ['Vanilla Candy Rock Sugar | 42', 'Kayali', 'parfums'],
  ['Musk Pomegranate', 'IBRAQ', 'parfums'],
  ['Eclaire', 'Lattafa', 'parfums'],
  ['Couture Mini Clutch', 'Yves Saint Laurent', 'maquillage'],
  ['Peptide Lip Tint Set', 'rhode', 'maquillage'],
  ['Rouge Dior Mini Lipstick Set', 'Dior', 'maquillage'],
  ['3D Hydra Lipgloss N°26', 'KIKO Milano', 'maquillage'],
  ['Rosy Glow Blush', 'Dior', 'maquillage'],
  ['Madagascar Centella Set', 'SKIN1004', 'soins'],
  ['Charming Coffret Soins', 'Enchanteur', 'soins'],
  ['Bare Vanilla Set', "Victoria's Secret", 'soins'],
  ['Lady Dior Crocodile', 'Dior', 'sacs'],
  ['Sac Cannage', 'Dior', 'sacs'],
  ['Coffret Yara', 'Lattafa', 'parfums'],
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
    `UPDATE "products" SET "category" = 'parfums', "updatedAt" = now()
     WHERE "category" IN ('homme', 'femme', 'unisex')`,
  )
  if (fallback.rowCount > 0) {
    console.log(`✓ Fallback: ${fallback.rowCount} remaining product(s) set to parfums`)
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
