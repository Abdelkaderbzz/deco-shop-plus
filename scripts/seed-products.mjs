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
  { name: 'Literie', slug: 'textiles' },
]

const OLD_CATEGORY_SLUGS = ['femme', 'homme', 'parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous']

const IMG = {
  velvet: '/assets/img_9760.webp',
  linen: '/assets/67e89a53-a200-4f18-aad9-de742de334ba.webp',
  embroidered: '/assets/d236b9ee-ec87-4aaf-a0d1-8cb2c99327a9.webp',
  set: '/assets/img_9758.webp',
  vase: '/assets/image00001-2-1537x2048.jpeg.webp',
  mirror: '/assets/image00002-5.jpeg.webp',
  tray: '/assets/photo-output-1-2.jpeg.webp',
  lantern: '/assets/img_9756-1.webp',
  drawer: '/assets/img_2899-1536x2048.jpeg.webp',
  cover: '/assets/img_2900-1536x2048.jpeg.webp',
  box: '/assets/photo-output-12-1538x2048.jpeg.webp',
  basket: '/assets/photo-output-11.jpeg.webp',
  plaid: '/assets/IMG_4758-1536x2048.jpeg.webp',
  coverlet: '/assets/img_9767.webp',
  tablecloth: '/assets/img_9768.webp',
  curtain: '/assets/photo-output-4-1.jpeg.webp',
  hc01: '/assets/hc01.webp',
  hc01Size: '/assets/hc01-size.webp',
  hv01: '/assets/hv01.webp',
  hv01Front: '/assets/hv01-front.webp',
  hv01Size: '/assets/hv01-size.webp',
  sr01: '/assets/sr01.webp',
  sr01Angle: '/assets/sr01-angle.webp',
  sr01Filled: '/assets/sr01-filled.webp',
  sr01Pack: '/assets/sr01-pack.webp',
  sr01Handle: '/assets/sr01-handle.webp',
  rt03: '/assets/rt03.webp',
  rt03Window: '/assets/rt03-window.webp',
  rt03Zip: '/assets/rt03-zip.webp',
  chairPad: '/assets/chair-pad-stack.webp',
  chairPadFloor: '/assets/chair-pad-floor.webp',
  chairPadLifestyle: '/assets/chair-pad-lifestyle.webp',
  chairPadRed: '/assets/chair-pad-red.webp',
  chairPadRound: '/assets/chair-pad-round.webp',
  matelas: '/assets/protege-matelas-5.webp',
  matelas3: '/assets/protege-matelas-3.webp',
  matelas4: '/assets/protege-matelas-4.webp',
  matelas6: '/assets/protege-matelas-6.webp',
  matelas7: '/assets/protege-matelas-7.webp',
}

/** @typedef {{
 *   key: string
 *   name: string
 *   brand: string
 *   description: string
 *   price: string
 *   compareAtPrice?: string | null
 *   category: 'coussins' | 'accessoires' | 'rangement' | 'textiles'
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
    key: 'velvet',
    name: 'Coussin velours sage',
    brand: 'Deco Shop Plus',
    description:
      'Coussin velours doux, ideal pour le canape. Housse amovible, disponible en plusieurs formats.',
    price: '29.000',
    compareAtPrice: '36.000',
    category: 'coussins',
    image: IMG.velvet,
    sizes: ['40x40', '45x45', '50x50'],
    colors: [
      { name: 'Sage', hex: '#7d8b74' },
      { name: 'Ivoire', hex: '#f3efe6' },
      { name: 'Terracotta', hex: '#c26a4a' },
    ],
    promoEnabled: true,
    featured: true,
    related: ['chairPad', 'linen', 'embroidered', 'set'],
  },
  {
    key: 'linen',
    name: 'Coussin lin naturel',
    brand: 'Deco Shop Plus',
    description:
      'Coussin en lin naturel, texture mate et legerement froissee. Parfait pour un salon lumineux.',
    price: '32.000',
    category: 'coussins',
    image: IMG.linen,
    sizes: ['45x45', '50x50'],
    colors: [
      { name: 'Naturel', hex: '#d6cbb8' },
      { name: 'Blanc', hex: '#f7f4ee' },
    ],
    featured: true,
    related: ['velvet', 'chairPad', 'set', 'coverlet'],
  },
  {
    key: 'embroidered',
    name: 'Coussin brode oasis',
    brand: 'Deco Shop Plus',
    description:
      'Coussin brode, motif doux inspire de Cite El Waha. Piece decorative pour le lit ou le canape.',
    price: '39.000',
    category: 'coussins',
    image: IMG.embroidered,
    sizes: ['45x45'],
    featured: true,
    related: ['velvet', 'linen', 'chairPad', 'set'],
  },
  {
    key: 'set',
    name: 'Lot de 2 coussins salon',
    brand: 'Deco Shop Plus',
    description:
      'Duo de coussins coordonnes pour habiller le canape en une seule commande.',
    price: '54.000',
    compareAtPrice: '64.000',
    category: 'coussins',
    image: IMG.set,
    sizes: ['45x45'],
    colors: [
      { name: 'Sage', hex: '#7d8b74' },
      { name: 'Lin', hex: '#d6cbb8' },
    ],
    promoEnabled: true,
    featured: false,
    related: ['chairPad', 'velvet', 'linen', 'embroidered'],
  },
  {
    key: 'chairPad',
    name: 'Galette de chaise capitonnée',
    brand: 'Deco Shop Plus',
    description:
      'Galette de chaise capitonnée avec attaches aux coins pour la fixer au dossier. Tissu mat, confortable pour cuisine, salle a manger ou bureau. Disponible en carre ou rond, dans une large gamme de couleurs.',
    price: '19.900',
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
    related: ['velvet', 'linen', 'set', 'embroidered'],
  },
  {
    key: 'vase',
    name: 'Vase ceramique lagune',
    brand: 'Deco Shop Plus',
    description:
      'Vase ceramique pour fleurs sechees ou fraiches. Objet deco pour table, buffet ou entree.',
    price: '42.000',
    category: 'accessoires',
    image: IMG.vase,
    sizes: ['Unique'],
    featured: true,
    related: ['mirror', 'tray', 'lantern', 'tablecloth'],
  },
  {
    key: 'mirror',
    name: 'Miroir mural ovale',
    brand: 'Deco Shop Plus',
    description:
      'Miroir mural pour agrandir la piece. A suspendre dans l entree, la chambre ou le salon.',
    price: '79.000',
    category: 'accessoires',
    image: IMG.mirror,
    sizes: ['Unique'],
    featured: true,
    related: ['vase', 'lantern', 'tray', 'curtain'],
  },
  {
    key: 'tray',
    name: 'Plateau bois olive',
    brand: 'Deco Shop Plus',
    description:
      'Plateau en bois pour servir ou exposer bougies, vases et petits objets deco.',
    price: '35.000',
    category: 'accessoires',
    image: IMG.tray,
    sizes: ['Unique'],
    featured: false,
    related: ['vase', 'lantern', 'mirror', 'tablecloth'],
  },
  {
    key: 'lantern',
    name: 'Photophore artisan',
    brand: 'Deco Shop Plus',
    description:
      'Photophore pour une lumiere douce le soir. Accessoire deco pour salon et terrasse.',
    price: '27.000',
    category: 'accessoires',
    image: IMG.lantern,
    sizes: ['Unique'],
    featured: false,
    related: ['vase', 'tray', 'mirror', 'embroidered'],
  },
  {
    key: 'drawer',
    name: 'Organiseur de tiroirs',
    brand: 'Deco Shop Plus',
    description:
      'Organiseur pour plier et ranger sous-vetements, chaussettes et petits accessoires.',
    price: '24.000',
    category: 'rangement',
    image: IMG.drawer,
    sizes: ['Unique'],
    featured: true,
    related: ['cover', 'box', 'basket', 'hv01'],
  },
  {
    key: 'cover',
    name: 'Housse de vetements',
    brand: 'Deco Shop Plus',
    description:
      'Housse pour proteger costumes, robes et manteaux dans le dressing. Anti-poussiere.',
    price: '19.000',
    category: 'rangement',
    image: IMG.cover,
    sizes: ['Court', 'Long'],
    featured: false,
    related: ['hv01', 'sr01', 'hc01', 'drawer'],
  },
  {
    key: 'box',
    name: 'Boite rangement tissu',
    brand: 'Deco Shop Plus',
    description:
      'Boite en tissu pour etageres et placards. Range plaids, linge ou vetements plies.',
    price: '22.000',
    category: 'rangement',
    image: IMG.box,
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Beige', hex: '#e8dcc8' },
      { name: 'Gris', hex: '#6b7280' },
    ],
    featured: true,
    related: ['sr01', 'hv01', 'drawer', 'hc01'],
  },
  {
    key: 'basket',
    name: 'Panier linge osier',
    brand: 'Deco Shop Plus',
    description:
      'Panier pour le linge ou le rangement du salon. Tressage leger, anse pratique.',
    price: '45.000',
    category: 'rangement',
    image: IMG.basket,
    sizes: ['Unique'],
    featured: false,
    related: ['sr01', 'box', 'hv01', 'hc01'],
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
    related: ['hv01', 'sr01', 'rt03', 'cover'],
  },
  {
    key: 'hv01',
    name: 'Housse de Vêtements Imperméable HV01 - Taille M',
    brand: 'Deco Shop Plus',
    description:
      'Housse impermeable pour proteger costumes, manteaux et robes dans le dressing. Moitie tissu gris, moitie fenetre transparente, fermeture zippee. Taille M : 60 x 100 cm.',
    price: '29.900',
    category: 'rangement',
    image: IMG.hv01,
    images: [IMG.hv01, IMG.hv01Front, IMG.hv01Size],
    sizes: ['M'],
    colors: [{ name: 'Gris', hex: '#4b5563' }],
    featured: true,
    related: ['hc01', 'sr01', 'cover', 'rt03'],
  },
  {
    key: 'rt03',
    name: 'Housse de rangement pour tapis RT03 - Zip&Go',
    brand: 'Deco Shop Plus',
    description:
      'Housse cylindrique pour ranger un tapis enroule a l abri de la poussiere et de l humidite. Toile impermeable, couvercle zippé et fenetre transparente. Longueur 2 m, diametre 30 cm.',
    price: '52.000',
    category: 'rangement',
    image: IMG.rt03,
    images: [IMG.rt03, IMG.rt03Window, IMG.rt03Zip],
    sizes: ['Unique'],
    colors: [{ name: 'Gris', hex: '#4b5563' }],
    featured: true,
    related: ['sr01', 'hv01', 'plaid', 'coverlet'],
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
    related: ['hv01', 'rt03', 'hc01', 'box'],
  },
  {
    key: 'plaid',
    name: 'Plaid tricot doux',
    brand: 'Deco Shop Plus',
    description:
      'Plaid a jeter sur le canape ou le lit. Maille douce pour les soirees a la maison.',
    price: '49.000',
    compareAtPrice: '59.000',
    category: 'textiles',
    image: IMG.plaid,
    sizes: ['130x170'],
    colors: [
      { name: 'Marine', hex: '#1e3a4c' },
      { name: 'Creme', hex: '#efe6d6' },
    ],
    promoEnabled: true,
    featured: true,
    related: ['coverlet', 'matelas', 'velvet', 'box'],
  },
  {
    key: 'coverlet',
    name: 'Couvre-lit coton',
    brand: 'Deco Shop Plus',
    description:
      'Couvre-lit leger pour habiller le lit. Coton facile a entretenir, tombé net.',
    price: '89.000',
    category: 'textiles',
    image: IMG.coverlet,
    sizes: ['160x200', '180x200', '200x220'],
    featured: true,
    related: ['matelas', 'curtain', 'tablecloth', 'linen'],
  },
  {
    key: 'matelas',
    name: 'Protège-matelas Imperméable Respirant Silencieux et Confortable',
    brand: 'Deco Shop Plus',
    description:
      'Offrez a votre matelas une protection superieure avec notre protege-matelas impermeable, concu pour un confort optimal tout en preservant la durabilite de votre literie. 100% impermeable, respirant (circulation de l air), anti-bacterien et anti-acariens, resistant a l eau et aux liquides. Toutes les dimensions sont disponibles.',
    price: '45.000',
    category: 'textiles',
    image: IMG.matelas,
    images: [IMG.matelas, IMG.matelas3, IMG.matelas4, IMG.matelas6, IMG.matelas7],
    sizes: ['90x190', '120x190', '140x190', '160x200', '180x200', '200x200'],
    colors: [{ name: 'Blanc', hex: '#f7f7f5' }],
    featured: true,
    related: ['coverlet', 'plaid', 'chairPad', 'curtain'],
  },
  {
    key: 'tablecloth',
    name: 'Nappe lin maison',
    brand: 'Deco Shop Plus',
    description:
      'Nappe en lin pour la table du quotidien ou des invites. Chute naturelle, lavage simple.',
    price: '38.000',
    category: 'textiles',
    image: IMG.tablecloth,
    sizes: ['140x180', '140x220'],
    featured: false,
    related: ['curtain', 'coverlet', 'tray', 'plaid'],
  },
  {
    key: 'curtain',
    name: 'Rideau voile lumiere',
    brand: 'Deco Shop Plus',
    description:
      'Rideau voile pour filtrer la lumiere sans assombrir. Ideal salon et chambre.',
    price: '52.000',
    category: 'textiles',
    image: IMG.curtain,
    sizes: ['140x260', '140x280'],
    colors: [
      { name: 'Blanc', hex: '#f5f5f4' },
      { name: 'Beige', hex: '#e8dcc8' },
    ],
    featured: false,
    related: ['coverlet', 'tablecloth', 'plaid', 'mirror'],
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
       'Notre boutique a Cite El Waha, Bizerte. Coussins, accessoires, rangement de vetements et literie pour la maison.',
       '/assets/img_9756-1.webp', 'Salon et coussins Deco Shop Plus a Bizerte',
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
    [0, '/assets/img_9756-1.webp', 'Coussins brodes sur banquette Deco Shop Plus'],
    [1, '/assets/photo-output-1-2.jpeg.webp', 'Coussins noirs sur canape'],
    [2, '/assets/img_9760.webp', 'Coussin brode floral'],
    [3, '/assets/IMG_4758-1536x2048.jpeg.webp', 'Plaid marine et deco maison'],
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
