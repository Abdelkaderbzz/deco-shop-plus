// Run with: node scripts/migrate.mjs
import { Pool } from 'pg'
import { databaseHost, resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = resolveDatabaseUrl()
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set.')
  process.exit(1)
}

console.log(
  `Migrating DATABASE_URL (${databaseHost(DATABASE_URL)})`,
)

const pool = new Pool({ connectionString: DATABASE_URL })

const statements = [
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "image" text,
    "role" text NOT NULL DEFAULT 'user',
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY,
    "expiresAt" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    "scope" text,
    "password" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "categories" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "settings" (
    "id" integer PRIMARY KEY DEFAULT 1,
    "deliveryFee" numeric(10, 3) NOT NULL DEFAULT '7.000',
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "products" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "brand" text NOT NULL,
    "description" text,
    "price" numeric(10, 3) NOT NULL,
    "compareAtPrice" numeric(10, 3),
    "category" text NOT NULL DEFAULT 'unisex',
    "imageUrl" text,
    "images" text NOT NULL DEFAULT '[]',
    "sizes" text NOT NULL DEFAULT '[]',
    "stock" integer NOT NULL DEFAULT 0,
    "inStock" boolean NOT NULL DEFAULT true,
    "featured" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "orders" (
    "id" serial PRIMARY KEY,
    "customerName" text NOT NULL,
    "customerPhone" text NOT NULL,
    "customerAddress" text,
    "orderType" text NOT NULL DEFAULT 'delivery',
    "status" text NOT NULL DEFAULT 'pending',
    "totalAmount" numeric(10, 3) NOT NULL,
    "deliveryFee" numeric(10, 3) NOT NULL DEFAULT '7.000',
    "notes" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "order_items" (
    "id" serial PRIMARY KEY,
    "orderId" integer NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "productId" integer NOT NULL,
    "productName" text NOT NULL,
    "productBrand" text NOT NULL,
    "size" text NOT NULL,
    "quantity" integer NOT NULL DEFAULT 1,
    "price" numeric(10, 3) NOT NULL
  )`,
  `INSERT INTO "settings" ("id", "deliveryFee") VALUES (1, '7.000')
   ON CONFLICT ("id") DO NOTHING`,
  `INSERT INTO "categories" ("name", "slug") VALUES
    ('Coussins', 'coussins'),
    ('Rangement', 'rangement')
   ON CONFLICT ("slug") DO NOTHING`,
  `DELETE FROM "categories" WHERE "slug" IN ('parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous', 'femme', 'homme', 'textiles', 'accessoires')`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "images" text NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "bannerUrl" text`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "published" boolean NOT NULL DEFAULT true`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "compareAtPrice" numeric(10, 3)`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "relatedProductIds" text NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerGovernorate" text`,
  `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pickupBoutiqueId" integer`,
  `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pickupBoutiqueName" text`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "bannerEnabled" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "bannerMessage" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "bannerVariant" text NOT NULL DEFAULT 'offer'`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "bannerLinkLabel" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "bannerLinkHref" text NOT NULL DEFAULT ''`,
  `CREATE TABLE IF NOT EXISTS "banners" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL DEFAULT '',
    "message" text NOT NULL,
    "variant" text NOT NULL DEFAULT 'offer',
    "backgroundColor" text NOT NULL DEFAULT '#0f5c64',
    "textColor" text NOT NULL DEFAULT '#f7fbfa',
    "fontSize" integer NOT NULL DEFAULT 13,
    "linkLabel" text NOT NULL DEFAULT '',
    "linkHref" text NOT NULL DEFAULT '',
    "dismissible" boolean NOT NULL DEFAULT true,
    "active" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "banners_single_active_idx" ON "banners" ("active") WHERE "active"`,
  // Carry the previous single-banner settings row into the new table, once.
  `INSERT INTO "banners" ("name", "message", "variant", "linkLabel", "linkHref", "active")
   SELECT 'Banniere importee', "bannerMessage", "bannerVariant", "bannerLinkLabel", "bannerLinkHref", "bannerEnabled"
   FROM "settings"
   WHERE "id" = 1
     AND "bannerMessage" != ''
     AND NOT EXISTS (SELECT 1 FROM "banners")`,
  `CREATE TABLE IF NOT EXISTS "boutiques" (
    "id" serial PRIMARY KEY,
    "slug" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "city" text NOT NULL,
    "region" text NOT NULL DEFAULT '',
    "description" text NOT NULL DEFAULT '',
    "imageUrl" text,
    "imageAlt" text NOT NULL DEFAULT '',
    "address" text,
    "phone" text,
    "rating" numeric(2, 1),
    "reviewCount" integer,
    "ratingSource" text NOT NULL DEFAULT 'Google Maps',
    "directionsUrl" text NOT NULL DEFAULT '',
    "pickupEnabled" boolean NOT NULL DEFAULT true,
    "published" boolean NOT NULL DEFAULT true,
    "sortOrder" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `INSERT INTO "boutiques"
    ("slug", "name", "city", "region", "description", "imageUrl", "imageAlt", "address", "phone", "rating", "reviewCount", "ratingSource", "directionsUrl", "sortOrder")
   VALUES
    ('cite-el-waha-bizerte', 'Deco Shop Plus', 'Bizerte', 'Cite El Waha',
     'Notre boutique a Cite El Waha, Bizerte. Coussins et galettes de chaise pour la maison.',
     '/assets/chair-pad-lifestyle.webp', 'Salon et coussins Deco Shop Plus a Bizerte',
     'Cite El Waha, Bizerte, Tunisie', '56 405 932', 4.9, NULL, 'Google Maps',
     'https://www.google.com/maps/dir/?api=1&destination=Cite+El+Waha%2C+Bizerte%2C+Tunisie', 0)
   ON CONFLICT ("slug") DO UPDATE SET
     "name" = EXCLUDED."name",
     "city" = EXCLUDED."city",
     "region" = EXCLUDED."region",
     "description" = EXCLUDED."description",
     "imageUrl" = EXCLUDED."imageUrl",
     "imageAlt" = EXCLUDED."imageAlt",
     "address" = EXCLUDED."address",
     "phone" = EXCLUDED."phone",
     "directionsUrl" = EXCLUDED."directionsUrl",
     "published" = true,
     "pickupEnabled" = true,
     "updatedAt" = now()`,
  `UPDATE "boutiques"
   SET "published" = false, "pickupEnabled" = false, "updatedAt" = now()
   WHERE "slug" IN ('sahloul-sousse', 'moknine-monastir')`,
  `UPDATE "products"
   SET "images" = json_build_array("imageUrl")::text
   WHERE "imageUrl" IS NOT NULL
     AND "imageUrl" != ''
     AND ("images" IS NULL OR "images" = '[]')`,
  `CREATE TABLE IF NOT EXISTS "carousel_videos" (
    "id" serial PRIMARY KEY,
    "url" text NOT NULL UNIQUE,
    "sortOrder" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `INSERT INTO "carousel_videos" ("url", "sortOrder") VALUES
    ('https://www.instagram.com/reel/DZ3XNGpsShF/', 0),
    ('https://www.instagram.com/reel/DYdIM1eMPri/', 1),
    ('https://www.instagram.com/reel/DaTQO_4RzjP/', 2),
    ('https://www.instagram.com/reel/DZvMI4OsOJd/', 3)
   ON CONFLICT ("url") DO NOTHING`,
  `CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("createdAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status")`,
  `CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("orderId")`,
  `CREATE TABLE IF NOT EXISTS "hero_images" (
    "slot" integer PRIMARY KEY,
    "imageUrl" text NOT NULL,
    "alt" text NOT NULL DEFAULT '',
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `INSERT INTO "hero_images" ("slot", "imageUrl", "alt") VALUES
    (0, '/assets/chair-pad-lifestyle.webp', 'Galette de chaise Deco Shop Plus'),
    (1, '/assets/reading-pillow-colors.webp', 'Coussin de lecture Deco Shop Plus'),
    (2, '/assets/sofa-cushion-colors.webp', 'Coussin de canape Deco Shop Plus'),
    (3, '/assets/chair-pad-stack.webp', 'Galettes de chaise Deco Shop Plus')
   ON CONFLICT ("slot") DO UPDATE SET
     "imageUrl" = EXCLUDED."imageUrl",
     "alt" = EXCLUDED."alt",
     "updatedAt" = now()`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" text NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "bundles" text NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "promoEnabled" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "promoLabel" text NOT NULL DEFAULT 'Promotion'`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "promoBgColor" text NOT NULL DEFAULT '#e85d04'`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "promoTextColor" text NOT NULL DEFAULT '#ffffff'`,
  `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "color" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "bundle" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "bundleUnits" integer NOT NULL DEFAULT 1`,
  `CREATE TABLE IF NOT EXISTS "hero_slides" (
    "id" serial PRIMARY KEY,
    "imageUrl" text NOT NULL,
    "alt" text NOT NULL DEFAULT '',
    "eyebrow" text NOT NULL DEFAULT '',
    "title" text NOT NULL DEFAULT '',
    "subtitle" text NOT NULL DEFAULT '',
    "ctaLabel" text NOT NULL DEFAULT '',
    "ctaTarget" text NOT NULL DEFAULT 'products',
    "ctaHref" text NOT NULL DEFAULT '',
    "published" boolean NOT NULL DEFAULT true,
    "sortOrder" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `INSERT INTO "hero_slides"
    ("imageUrl", "alt", "eyebrow", "title", "subtitle", "ctaLabel", "ctaTarget", "ctaHref", "published", "sortOrder")
   SELECT v."imageUrl", v."alt", v."eyebrow", v."title", v."subtitle", v."ctaLabel", v."ctaTarget", v."ctaHref", v."published", v."sortOrder"
   FROM (VALUES
     ('/assets/campaign-atelier.webp', 'Atelier Deco Shop Plus a Cite El Waha, Bizerte', 'Cité El Waha · Bizerte', 'Un atelier. Des coussins.', 'Nous concevons et cousons nos pièces à Bizerte, avec des matières choisies et du temps.', 'Entrer dans la boutique', 'products', '', true, 0),
     ('/assets/campaign-matiere.webp', 'Velours et tissus Deco Shop Plus', 'Matières', 'Le velours, le confort, la couleur', 'Des tissus denses, des finitions soignées — pour le salon comme pour le lit.', 'Voir les coussins', 'custom', '/categorie/coussins', true, 1),
     ('/assets/campaign-couleurs.webp', 'Couleurs de l atelier Deco Shop Plus', 'L offre de l atelier', 'Quatre galettes, une table', 'Un pack pour habiller la salle à manger, aux couleurs que vous choisissez.', 'Voir l offre', 'custom', '/products/25', true, 2),
     ('/assets/campaign-maison.webp', 'Maison et lecture, univers Deco Shop Plus', 'Maison', 'S installer. Lire. Rester.', 'Des pièces pensées pour le quotidien, cousues ici, livrées partout en Tunisie.', 'Les nouveautés', 'nouveautes', '', true, 3)
   ) AS v("imageUrl", "alt", "eyebrow", "title", "subtitle", "ctaLabel", "ctaTarget", "ctaHref", "published", "sortOrder")
   WHERE NOT EXISTS (SELECT 1 FROM "hero_slides")`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" text`,
  `UPDATE "products" SET "stock" = 10 WHERE "inStock" = true AND "stock" = 0`,
  `UPDATE "products" SET "inStock" = ("stock" > 0)`,
  `CREATE INDEX IF NOT EXISTS products_published_created_idx ON products (published, "createdAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS products_published_category_idx ON products (published, category)`,
  `CREATE INDEX IF NOT EXISTS products_published_featured_idx ON products (published, featured) WHERE published = true AND featured = true`,
  `CREATE INDEX IF NOT EXISTS products_published_promo_idx ON products (published, "promoEnabled") WHERE published = true AND "promoEnabled" = true`,
  `CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON "order_items" ("productId")`,
  `CREATE INDEX IF NOT EXISTS banners_active_idx ON banners (active) WHERE active = true`,
  `CREATE INDEX IF NOT EXISTS hero_slides_published_sort_idx ON hero_slides (published, "sortOrder")`,
]

function slugify(value) {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
  return slug
}

async function backfillProductSlugs() {
  const { rows } = await pool.query('SELECT id, name, slug FROM products ORDER BY id')
  const used = new Set(rows.map((row) => row.slug).filter(Boolean))
  for (const row of rows) {
    if (row.slug) continue
    const base = slugify(row.name) || `produit-${row.id}`
    let slug = base
    let n = 2
    while (used.has(slug)) {
      slug = `${base}-${n}`
      n += 1
    }
    used.add(slug)
    await pool.query('UPDATE products SET slug = $1 WHERE id = $2', [slug, row.id])
  }
  await pool.query('UPDATE products SET slug = concat(\'produit-\', id) WHERE slug IS NULL OR slug = \'\'')
  await pool.query('ALTER TABLE products ALTER COLUMN slug SET NOT NULL')
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS products_slug_uidx ON products (slug)')
}

try {
  for (const sql of statements) {
    await pool.query(sql)
  }
  await backfillProductSlugs()
  console.log('✓ Migration complete')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await pool.end()
}
