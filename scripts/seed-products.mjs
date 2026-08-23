// Run with: node scripts/seed-products.mjs
// Upserts the Deco Shop Plus home catalog and wires relatedProductIds.
// --force also removes leftover non-catalog products (except open-order SKUs).
import { Pool } from 'pg'
import { databaseHost, resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = resolveDatabaseUrl()
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set in .env')
  process.exit(1)
}

console.log(
  `Seeding DATABASE_URL (${databaseHost(DATABASE_URL)})`,
)

const pool = new Pool({ connectionString: DATABASE_URL })

const CATEGORIES = [
  { name: 'Coussins', slug: 'coussins' },
  { name: 'Accessoires', slug: 'accessoires' },
  { name: 'Rangement', slug: 'rangement' },
]

const OLD_CATEGORY_SLUGS = ['femme', 'homme', 'parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous', 'textiles']

const IMG = {
  hc01: '/assets/hc01.webp',
  hc01Size: '/assets/hc01-size.webp',
  sr01: '/assets/sr01.webp',
  sr01Angle: '/assets/sr01-angle.webp',
  sr01Filled: '/assets/sr01-filled.webp',
  sr01Pack: '/assets/sr01-pack.webp',
  sr01Handle: '/assets/sr01-handle.webp',
  chairPad: '/assets/chair-pad-stack.webp',
  chairPadFloor: '/assets/chair-pad-floor.webp',
  chairPadLifestyle: '/assets/chair-pad-lifestyle.webp',
  chairPadRed: '/assets/chair-pad-red.webp',
  chairPadRound: '/assets/chair-pad-round.webp',
  chairPadBackrest: '/assets/chair-pad-backrest.webp',
  chairPadPack4: '/assets/chair-pad-pack-4.webp',
  chairPadPack4Colors: '/assets/chair-pad-pack-4-colors.webp',
}

/** @typedef {{
 *   key: string
 *   name: string
 *   brand: string
 *   description: string
 *   price: string
 *   compareAtPrice?: string | null
 *   category: 'coussins' | 'accessoires' | 'rangement'
 *   image: string
 *   images?: string[]
 *   sizes: string[]
 *   colors?: { name: string, hex: string }[]
 *   promoEnabled?: boolean
 *   promoLabel?: string
 *   promoBgColor?: string
 *   promoTextColor?: string
 *   aliases?: string[]
 *   featured: boolean
 *   related: string[]
 * }} SeedProduct
 */

/** @type {SeedProduct[]} */
const PRODUCTS = [
  {
    key: 'chairPad',
    name: 'Galette de chaise capitonnée',
    brand: 'Deco Shop Plus',
    description:
      'Galette de chaise capitonnée avec attaches aux coins pour la fixer au dossier. Tissu mat, confortable pour cuisine, salle a manger ou bureau. Disponible en carre ou rond, dans une large gamme de couleurs.',
    price: '9.500',
    category: 'coussins',
    image: IMG.chairPad,
    images: [IMG.chairPad, IMG.chairPadFloor, IMG.chairPadLifestyle, IMG.chairPadRed, IMG.chairPadRound],
    sizes: ['Carré', 'Rond'],
    colors: [
      { name: 'Rouge', hex: '#c81e1e' },
      { name: 'Jaune', hex: '#eab308' },
      { name: 'Orange', hex: '#ea580c' },
      { name: 'Rose', hex: '#db2777' },
      { name: 'Violet', hex: '#7c3aed' },
      { name: 'Bleu', hex: '#2563eb' },
      { name: 'Marine', hex: '#1e3a5f' },
      { name: 'Vert', hex: '#65a30d' },
      { name: 'Marron', hex: '#7c4a2a' },
      { name: 'Gris', hex: '#9ca3af' },
      { name: 'Beige', hex: '#d6cbb8' },
      { name: 'Noir', hex: '#1f2937' },
    ],
    featured: true,
    related: ['chairPadBackrest', 'chairPadPack4', 'hc01', 'sr01'],
  },
  {
    key: 'chairPadBackrest',
    name: 'Galette de chaise capitonnée dossier et assise',
    brand: 'Deco Shop Plus',
    description:
      'Galette de chaise capitonnée en deux parties : dossier et assise, reliees par un pli pour habiller toute la chaise. Tissu mat, boutons capitonnes, attaches aux coins pour la fixer au dossier et a l assise, et anse de transport en haut. Confortable pour cuisine, salle a manger ou bureau. Disponible dans une large gamme de couleurs.',
    price: '18.000',
    category: 'coussins',
    image: IMG.chairPadBackrest,
    images: [IMG.chairPadBackrest],
    sizes: ['Unique'],
    colors: [
      { name: 'Marine', hex: '#1e3a5f' },
      { name: 'Rouge', hex: '#c81e1e' },
      { name: 'Jaune', hex: '#eab308' },
      { name: 'Orange', hex: '#ea580c' },
      { name: 'Rose', hex: '#db2777' },
      { name: 'Violet', hex: '#7c3aed' },
      { name: 'Bleu', hex: '#2563eb' },
      { name: 'Vert', hex: '#65a30d' },
      { name: 'Marron', hex: '#7c4a2a' },
      { name: 'Gris', hex: '#9ca3af' },
      { name: 'Beige', hex: '#d6cbb8' },
      { name: 'Noir', hex: '#1f2937' },
    ],
    featured: true,
    related: ['chairPad', 'chairPadPack4', 'hc01', 'sr01'],
  },
  {
    key: 'hc01',
    name: 'Pack de 3 Housses à Chaussures Imperméables HC01',
    aliases: [
      'Housse à Chaussures Imperméable HC01',
      'Housse a Chaussures Impermeable HC01',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Pack de 3 housses impermeables et anti-poussiere pour ranger et proteger vos chaussures. Cordon de serrage et fenetre transparente pour voir le contenu. Ideales au quotidien et en deplacement. Dimensions: 28 x 38 cm.',
    price: '26.000',
    compareAtPrice: '30.000',
    category: 'rangement',
    image: IMG.hc01,
    images: [IMG.hc01, IMG.hc01Size],
    sizes: ['Unique'],
    colors: [
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Noir', hex: '#1f2937' },
    ],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['sr01', 'chairPad', 'chairPadBackrest', 'chairPadPack4'],
  },
  {
    key: 'sr01',
    name: 'Sac de Rangement SR01 - Vêtements',
    brand: 'Deco Shop Plus',
    description:
      'Sac de rangement en toile impermeable pour vetements et linge. Grande capacite 50 x 35 x 30 cm, fenetre transparente a l avant et poignees renforcees. Se plie facilement une fois vide.',
    price: '33.000',
    compareAtPrice: '45.000',
    category: 'rangement',
    image: IMG.sr01,
    images: [IMG.sr01, IMG.sr01Angle, IMG.sr01Filled, IMG.sr01Pack, IMG.sr01Handle],
    sizes: ['Unique'],
    colors: [{ name: 'Gris', hex: '#4b5563' }],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['hc01', 'chairPad', 'chairPadBackrest', 'chairPadPack4'],
  },
  {
    key: 'chairPadPack4',
    name: 'Pack de 4 galettes de chaise rondes capitonnées',
    brand: 'Deco Shop Plus',
    description:
      'Pack de 4 galettes de chaise rondes capitonnées, avec attaches pour les fixer au dossier. Tissu doux, confortable pour cuisine ou salle a manger. Choisissez vos 4 couleurs parmi la gamme. Livraison partout en Tunisie.',
    price: '25.000',
    category: 'coussins',
    image: IMG.chairPadPack4,
    images: [IMG.chairPadPack4, IMG.chairPadPack4Colors],
    sizes: ['Rond'],
    colors: [
      { name: 'Rouge', hex: '#c81e1e' },
      { name: 'Jaune', hex: '#eab308' },
      { name: 'Orange', hex: '#ea580c' },
      { name: 'Rose', hex: '#db2777' },
      { name: 'Violet', hex: '#7c3aed' },
      { name: 'Bleu', hex: '#2563eb' },
      { name: 'Marine', hex: '#1e3a5f' },
      { name: 'Vert', hex: '#65a30d' },
      { name: 'Marron', hex: '#7c4a2a' },
      { name: 'Gris', hex: '#9ca3af' },
      { name: 'Beige', hex: '#d6cbb8' },
      { name: 'Noir', hex: '#1f2937' },
    ],
    promoEnabled: true,
    promoLabel: 'Pack de 4',
    featured: true,
    related: ['chairPad', 'chairPadBackrest', 'hc01'],
  },
]

async function ensureCategories() {
  for (const category of CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (name, slug, "createdAt", "updatedAt")
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()`,
      [category.name, category.slug],
    )
  }
}

async function ensureBoutique() {
  await pool.query(
    `INSERT INTO boutiques
      (slug, name, city, region, description, "imageUrl", "imageAlt", address, phone,
       rating, "reviewCount", "ratingSource", "directionsUrl", "pickupEnabled", published, "sortOrder",
       "createdAt", "updatedAt")
     VALUES
      ('cite-el-waha-bizerte', 'Deco Shop Plus', 'Bizerte', 'Cite El Waha',
       'Notre boutique a Cite El Waha, Bizerte. Coussins, accessoires et rangement de vetements pour la maison.',
       '/assets/chair-pad-lifestyle.webp', 'Salon et coussins Deco Shop Plus a Bizerte',
       'Cite El Waha, Bizerte, Tunisie', '56 405 932', 4.9, NULL, 'Google Maps',
       'https://www.google.com/maps/dir/?api=1&destination=Cite+El+Waha%2C+Bizerte%2C+Tunisie',
       true, true, 0, NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       city = EXCLUDED.city,
       region = EXCLUDED.region,
       description = EXCLUDED.description,
       "imageUrl" = EXCLUDED."imageUrl",
       "imageAlt" = EXCLUDED."imageAlt",
       address = EXCLUDED.address,
       phone = EXCLUDED.phone,
       "directionsUrl" = EXCLUDED."directionsUrl",
       "pickupEnabled" = true,
       published = true,
       "updatedAt" = NOW()`,
  )
  await pool.query(
    `UPDATE boutiques
     SET published = false, "pickupEnabled" = false, "updatedAt" = NOW()
     WHERE slug IN ('sahloul-sousse', 'moknine-monastir')`,
  )
}

async function ensureHero() {
  const slots = [
    [0, '/assets/chair-pad-lifestyle.webp', 'Galette de chaise Deco Shop Plus'],
    [1, '/assets/sr01-angle.webp', 'Sac de rangement SR01'],
    [2, '/assets/hc01.webp', 'Housses a chaussures impermeables HC01'],
    [3, '/assets/chair-pad-stack.webp', 'Galettes de chaise Deco Shop Plus'],
  ]
  for (const [slot, imageUrl, alt] of slots) {
    await pool.query(
      `INSERT INTO hero_images (slot, "imageUrl", alt, "updatedAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (slot) DO UPDATE SET
         "imageUrl" = EXCLUDED."imageUrl",
         alt = EXCLUDED.alt,
         "updatedAt" = NOW()`,
      [slot, imageUrl, alt],
    )
  }
}

async function ensureHeroSlides() {
  const existing = await pool.query(`SELECT count(*)::int AS count FROM hero_slides`)
  if (existing.rows[0]?.count > 0) return

  const slides = [
    [
      '/assets/banner1.webp',
      'Optimisez votre espace — rangement Deco Shop Plus',
      'Offre du moment',
      'Promotions maison',
      'Housses, coussins et rangement a prix reduit, livrés partout en Tunisie.',
      'Voir les promotions',
      'promotions',
      0,
    ],
    [
      '/assets/banner2.webp',
      'Sac de voyage Zip&GO Deco Shop Plus',
      'Cite El Waha · Bizerte',
      'Derniers articles',
      'Les nouvelles pieces deco viennent d arriver en boutique.',
      'Voir les nouveautes',
      'nouveautes',
      1,
    ],
  ]

  for (const [imageUrl, alt, eyebrow, title, subtitle, ctaLabel, ctaTarget, sortOrder] of slides) {
    await pool.query(
      `INSERT INTO hero_slides
        ("imageUrl", alt, eyebrow, title, subtitle, "ctaLabel", "ctaTarget", "ctaHref", published, "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, '', true, $8, NOW(), NOW())`,
      [imageUrl, alt, eyebrow, title, subtitle, ctaLabel, ctaTarget, sortOrder],
    )
  }
}

async function upsertProduct(product) {
  const imageList = product.images?.length ? product.images : [product.image]
  const images = JSON.stringify(imageList)
  const sizes = JSON.stringify(product.sizes)
  const colors = JSON.stringify(product.colors ?? [])
  const names = [product.name, ...(product.aliases || [])]
  const existing = await pool.query(
    `SELECT id FROM products WHERE brand = $1 AND name = ANY($2::text[]) LIMIT 1`,
    [product.brand, names],
  )

  const promoEnabled = Boolean(product.promoEnabled)
  const promoLabel = product.promoLabel || 'Promotion'
  const promoBgColor = product.promoBgColor || '#e85d04'
  const promoTextColor = product.promoTextColor || '#ffffff'

  if (existing.rows[0]) {
    const id = existing.rows[0].id
    await pool.query(
      `UPDATE products SET
        name = $1,
        description = $2,
        price = $3,
        "compareAtPrice" = $4,
        category = $5,
        "imageUrl" = $6,
        images = $7,
        sizes = $8,
        colors = $9,
        "inStock" = true,
        stock = 10,
        featured = $10,
        published = true,
        "promoEnabled" = $11,
        "promoLabel" = $12,
        "promoBgColor" = $13,
        "promoTextColor" = $14,
        "updatedAt" = NOW()
       WHERE id = $15`,
      [
        product.name,
        product.description,
        product.price,
        product.compareAtPrice ?? null,
        product.category,
        product.image,
        images,
        sizes,
        colors,
        product.featured,
        promoEnabled,
        promoLabel,
        promoBgColor,
        promoTextColor,
        id,
      ],
    )
    return id
  }

  const inserted = await pool.query(
    `INSERT INTO products (
      name, brand, description, price, "compareAtPrice", category,
      "imageUrl", images, sizes, colors, "relatedProductIds", "inStock", stock, featured, published,
      "promoEnabled", "promoLabel", "promoBgColor", "promoTextColor",
      "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '[]', true, 10, $11, true, $12, $13, $14, $15, NOW(), NOW())
    RETURNING id`,
    [
      product.name,
      product.brand,
      product.description,
      product.price,
      product.compareAtPrice ?? null,
      product.category,
      product.image,
      images,
      sizes,
      colors,
      product.featured,
      promoEnabled,
      promoLabel,
      promoBgColor,
      promoTextColor,
    ],
  )
  return inserted.rows[0].id
}

async function seed() {
  await ensureCategories()
  await ensureBoutique()
  await ensureHero()
  await ensureHeroSlides()

  const idsByKey = new Map()
  for (const product of PRODUCTS) {
    const id = await upsertProduct(product)
    idsByKey.set(product.key, id)
  }

  for (const product of PRODUCTS) {
    const id = idsByKey.get(product.key)
    const relatedIds = product.related
      .map((key) => idsByKey.get(key))
      .filter((relatedId) => Number.isInteger(relatedId) && relatedId !== id)
    await pool.query(
      `UPDATE products SET "relatedProductIds" = $1, "updatedAt" = NOW() WHERE id = $2`,
      [JSON.stringify(relatedIds), id],
    )
  }

  const catalogIds = [...idsByKey.values()]
  const leftover = await pool.query(
    `SELECT id, name, brand FROM products WHERE NOT (id = ANY($1::int[]))`,
    [catalogIds],
  )
  if (leftover.rows.length > 0) {
    const leftoverIds = leftover.rows.map((row) => row.id)
    const inOrders = await pool.query(
      `SELECT DISTINCT "productId" FROM order_items WHERE "productId" = ANY($1::int[])`,
      [leftoverIds],
    )
    const locked = new Set(inOrders.rows.map((row) => row.productId))
    const removable = leftoverIds.filter((id) => !locked.has(id))
    if (process.argv.includes('--force') && removable.length > 0) {
      await pool.query(`DELETE FROM products WHERE id = ANY($1::int[])`, [removable])
      console.log(`Removed ${removable.length} leftover product(s) not in the catalog.`)
    } else if (removable.length > 0) {
      await pool.query(
        `UPDATE products SET published = false, featured = false, "updatedAt" = NOW()
         WHERE id = ANY($1::int[])`,
        [removable],
      )
      console.log(`Unpublished ${removable.length} leftover product(s). Use --force to delete.`)
    }
    for (const row of leftover.rows.filter((item) => locked.has(item.id))) {
      await pool.query(
        `UPDATE products SET published = false, featured = false, "updatedAt" = NOW() WHERE id = $1`,
        [row.id],
      )
      console.log(`Kept unpublished "${row.name}" (${row.brand}) — referenced by an order.`)
    }
  }

  const removedCats = await pool.query(
    `DELETE FROM categories WHERE slug = ANY($1::text[]) RETURNING slug`,
    [OLD_CATEGORY_SLUGS],
  )
  if (removedCats.rowCount > 0) {
    console.log(`Removed old categories: ${removedCats.rows.map((row) => row.slug).join(', ')}`)
  }

  console.log(`Seeded ${PRODUCTS.length} home products with related items.`)
  const byCategory = await pool.query(
    `SELECT category, COUNT(*)::int AS count FROM products WHERE published = true GROUP BY category ORDER BY category`,
  )
  for (const row of byCategory.rows) {
    console.log(`  - ${row.category}: ${row.count}`)
  }
}

try {
  await seed()
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exit(1)
} finally {
  await pool.end()
}
