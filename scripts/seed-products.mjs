// Run with: node scripts/seed-products.mjs
import { Pool } from 'pg'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set in .env')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

const PRODUCTS = [
  {
    name: 'Yara',
    brand: 'Lattafa',
    description: 'Eau de parfum feminin aux notes douces et gourmandes. Flacon rose elegants, ideal pour le quotidien.',
    price: '79.000',
    category: 'parfums',
    image: '/showcase/perfume-4.png',
    sizes: ['100ml'],
    featured: true,
  },
  {
    name: 'Bright Orchard',
    brand: 'MATCH',
    description: 'Eau de parfum frais et fruité. Collection MATCH, design minimaliste et moderne.',
    price: '49.000',
    category: 'parfums',
    image: '/showcase/perfume-3.png',
    sizes: ['50ml'],
    featured: true,
  },
  {
    name: 'Miss Gris Intense',
    brand: 'ASSAF',
    description: 'Parfum feminin intense de la Lady Collection. Sillage elegant et feminin.',
    price: '115.000',
    category: 'parfums',
    image: '/showcase/perfume-6.png',
    sizes: ['100ml'],
    featured: true,
  },
  {
    name: 'Musk Collection',
    brand: 'Ibraheem Al Qurashi',
    description: 'Collection de muscs arabes aux fragrances sucrées, fruitées et poudrées.',
    price: '62.000',
    category: 'parfums',
    image: '/showcase/perfume-7.png',
    sizes: ['50ml', '100ml'],
    featured: false,
  },
  {
    name: 'Vanilla Candy Rock Sugar | 42',
    brand: 'Kayali',
    description: 'Eau de parfum gourmande aux notes de vanille, bonbon et sucre cristallise.',
    price: '289.000',
    category: 'parfums',
    image: '/hero/perfume-2.png',
    sizes: ['100ml'],
    featured: true,
  },
  {
    name: 'Musk Pomegranate',
    brand: 'IBRAQ',
    description: 'Musc fruité a la grenade. Parfum oriental feminin, longue tenue.',
    price: '38.000',
    category: 'parfums',
    image: '/hero/perfume-1.png',
    sizes: ['50ml'],
    featured: false,
  },
  {
    name: 'Eclaire',
    brand: 'Lattafa',
    description: 'Parfum feminin lumineux aux accents gourmands. Flacon beige avec details dores.',
    price: '84.000',
    category: 'parfums',
    image: '/showcase/soins-2.png',
    sizes: ['100ml'],
    featured: false,
  },
  {
    name: 'Couture Mini Clutch',
    brand: 'Yves Saint Laurent',
    description: 'Palette ombres a paupieres 4 teintes. Finition cuir matelasse et logo YSL dore.',
    price: '195.000',
    category: 'maquillage',
    image: '/showcase/perfume-5.png',
    sizes: ['4 x 5g'],
    featured: true,
  },
  {
    name: 'Peptide Lip Tint Set',
    brand: 'rhode',
    description: 'Coffret de 4 baumes a levres teintes aux peptides. Finition glossy et hydratante.',
    price: '98.000',
    category: 'maquillage',
    image: '/showcase/perfume-8.png',
    sizes: ['4 x 10ml'],
    featured: false,
  },
  {
    name: 'Rouge Dior Mini Lipstick Set',
    brand: 'Dior',
    description: 'Coffret de 4 mini rouges a levres dans un ecrin rouge et or edition limitee.',
    price: '169.000',
    category: 'maquillage',
    image: '/hero/makeup-1.png',
    sizes: ['4 x 1.5g'],
    featured: true,
  },
  {
    name: '3D Hydra Lipgloss N°26',
    brand: 'KIKO Milano',
    description: 'Gloss hydratant effet 3D, fini brillant rose paillete.',
    price: '34.000',
    category: 'maquillage',
    image: '/hero/makeup-2.png',
    sizes: ['6.5ml'],
    featured: false,
  },
  {
    name: 'Rosy Glow Blush',
    brand: 'Dior',
    description: 'Blush poudre effet bonne mine naturel. Teinte rose lumineuse.',
    price: '145.000',
    category: 'maquillage',
    image: '/categories/maquillage.png',
    sizes: ['7g'],
    featured: false,
  },
  {
    name: 'Madagascar Centella Set',
    brand: 'SKIN1004',
    description: 'Routine soin visage: toner, ampoule probio-cica et creme contour des yeux au centella.',
    price: '108.000',
    category: 'soins',
    image: '/showcase/makeup-3.png',
    sizes: ['Set 3 produits'],
    featured: true,
  },
  {
    name: 'Charming Coffret Soins',
    brand: 'Enchanteur',
    description: 'Coffret corps complet: talc, savon, gel douche, lotion, deodorant et creme.',
    price: '46.000',
    category: 'soins',
    image: '/showcase/soins-3.png',
    sizes: ['Coffret 6 pieces'],
    featured: false,
  },
  {
    name: 'Bare Vanilla Set',
    brand: 'Victoria\'s Secret',
    description: 'Set parfume corps Bare Vanilla. Notes vanille douce et coco.',
    price: '89.000',
    category: 'soins',
    image: '/categories/soins.png',
    sizes: ['Set 3 produits'],
    featured: false,
  },
  {
    name: 'Lady Dior Crocodile',
    brand: 'Dior',
    description: 'Sac a main structure en cuir effet crocodile noir. Charms DIOR et finitions argent.',
    price: '849.000',
    category: 'sacs',
    image: '/hero/bag-1.png',
    sizes: ['Medium'],
    featured: true,
  },
  {
    name: 'Sac Cannage',
    brand: 'Dior',
    description: 'Sac iconique au motif cannage. Accessoire luxe pour toutes les occasions.',
    price: '720.000',
    category: 'sacs',
    image: '/categories/sacs.png',
    sizes: ['Medium'],
    featured: false,
  },
  {
    name: 'Coffret Yara',
    brand: 'Lattafa',
    description: 'Coffret cadeau Lattafa Yara. Parfum feminin ideal pour offrir.',
    price: '92.000',
    category: 'parfums',
    image: '/categories/parfums.png',
    sizes: ['100ml'],
    featured: false,
  },
]

async function seed() {
  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM products')
  if (existing.rows[0].count > 0) {
    console.log(`Database already has ${existing.rows[0].count} product(s).`)
    console.log('Run with --force to replace them.')
    if (!process.argv.includes('--force')) {
      await pool.end()
      process.exit(0)
    }
    await pool.query('DELETE FROM order_items')
    await pool.query('DELETE FROM products')
    console.log('Cleared existing products.')
  }

  for (const product of PRODUCTS) {
    const images = JSON.stringify([product.image])
    await pool.query(
      `INSERT INTO products (
        name, brand, description, price, category,
        "imageUrl", images, sizes, "inStock", featured,
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, NOW(), NOW())`,
      [
        product.name,
        product.brand,
        product.description,
        product.price,
        product.category,
        product.image,
        images,
        JSON.stringify(product.sizes),
        product.featured,
      ],
    )
  }

  console.log(`✓ Seeded ${PRODUCTS.length} products`)
  const byCategory = await pool.query(
    `SELECT category, COUNT(*)::int AS count FROM products GROUP BY category ORDER BY category`,
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
