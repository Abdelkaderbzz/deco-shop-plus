// Run with: node scripts/verify-published.mjs
import { Pool } from 'pg'
import { resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()

const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:3000'
const pool = new Pool({ connectionString: resolveDatabaseUrl() })

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  return { status: res.status, text: await res.text() }
}

async function main() {
  const { rows } = await pool.query(
    'SELECT id, name, slug, published, featured FROM products ORDER BY id LIMIT 5',
  )
  if (rows.length === 0) {
    console.error('No products in database.')
    process.exit(1)
  }

  const target = rows[0]
  console.log('Products sample:', rows.map((r) => ({ id: r.id, name: r.name, published: r.published })))
  console.log(`\nTesting with product #${target.id} "${target.name}"`)

  const originalPublished = target.published

  async function assertStoreVisibility(shouldBeVisible) {
    const list = await fetchText('/products')
    const onList = list.text.includes(`/products/${target.slug || target.id}`) || list.text.includes(`/products/${target.id}`)
    const detail = await fetchText(`/products/${target.slug || target.id}`)
    const detailOk = detail.status === 200
    const detailHidden = detail.status === 404

    if (shouldBeVisible) {
      if (!onList) throw new Error(`Expected product link on /products list`)
      if (!detailOk) throw new Error(`Expected product detail 200, got ${detail.status}`)
      console.log('  OK visible: listed on /products and detail page loads')
    } else {
      if (onList) throw new Error(`Hidden product still linked on /products list`)
      if (!detailHidden) throw new Error(`Expected 404 on detail, got ${detail.status}`)
      console.log('  OK hidden: not on /products and detail returns 404')
    }
  }

  console.log('\n1. Visible state')
  await pool.query('UPDATE products SET published = true WHERE id = $1', [target.id])
  await assertStoreVisibility(true)

  console.log('\n2. Hidden state')
  await pool.query('UPDATE products SET published = false WHERE id = $1', [target.id])
  // Bypass Next cache by hitting with cache-bust query (force-dynamic pages still use unstable_cache)
  await fetch(`${BASE}/products?verify=${Date.now()}`, { cache: 'no-store' })
  await assertStoreVisibility(false)

  console.log('\n3. Restore original published state')
  await pool.query('UPDATE products SET published = $1 WHERE id = $2', [originalPublished, target.id])

  console.log('\nAll checks passed.')
  await pool.end()
}

main().catch(async (err) => {
  console.error('FAILED:', err.message)
  await pool.end()
  process.exit(1)
})
