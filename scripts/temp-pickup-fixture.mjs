// Temporary fixture for verifying the pickup checkout flow.
// Usage: node scripts/temp-pickup-fixture.mjs add | remove
import { Pool } from 'pg'
import { resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()
const pool = new Pool({ connectionString: resolveDatabaseUrl() })
const mode = process.argv[2] ?? 'add'
const NAME = 'TEST RETRAIT — Coussin'

if (mode === 'add') {
  const { rows } = await pool.query(
    `INSERT INTO "products"
       ("name", "brand", "description", "price", "category", "imageUrl", "images", "sizes",
        "inStock", "featured", "published")
     VALUES ($1, 'Deco Shop Plus', 'Produit temporaire de test.', '29.000', 'coussins',
             '/assets/chair-pad-stack.webp', '["/assets/chair-pad-stack.webp"]', '["Carré"]',
             true, true, true)
     RETURNING id`,
    [NAME],
  )
  console.log('inserted product id', rows[0].id)
} else {
  const { rowCount } = await pool.query(`DELETE FROM "products" WHERE "name" = $1`, [NAME])
  console.log('deleted products:', rowCount)
}

await pool.end()
