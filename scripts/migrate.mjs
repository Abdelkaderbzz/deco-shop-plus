// Run with: node --env-file=.env.local scripts/migrate.mjs
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set.')
  process.exit(1)
}

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
    "category" text NOT NULL DEFAULT 'unisex',
    "imageUrl" text,
    "images" text NOT NULL DEFAULT '[]',
    "sizes" text NOT NULL DEFAULT '[]',
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
    ('Homme', 'homme'),
    ('Femme', 'femme'),
    ('Unisex', 'unisex'),
    ('Parfums', 'parfums'),
    ('Maquillage', 'maquillage'),
    ('Sacs', 'sacs'),
    ('Soins', 'soins')
   ON CONFLICT ("slug") DO NOTHING`,
  `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "images" text NOT NULL DEFAULT '[]'`,
  `UPDATE "products"
   SET "images" = json_build_array("imageUrl")::text
   WHERE "imageUrl" IS NOT NULL
     AND "imageUrl" != ''
     AND ("images" IS NULL OR "images" = '[]')`,
]

try {
  for (const sql of statements) {
    await pool.query(sql)
  }
  console.log('✓ Migration complete')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await pool.end()
}
