# jannah-parfume

Boutique de parfums en Tunisie — Next.js storefront and admin dashboard.

## Stack

- Next.js 16 (App Router)
- PostgreSQL (Neon) + Drizzle ORM
- Better Auth (admin)
- Cloudinary (product images)
- Vercel (hosting)

## Getting Started

```bash
pnpm install
cp env.example .env
# Fill BETTER_AUTH_SECRET, Cloudinary keys
vercel link
vercel integration add neon --name jannah-parfume-db --plan free_v3 -e development -e preview -e production
node --env-file=.env.local scripts/migrate.mjs
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin

```bash
node scripts/create-admin.mjs
```

Then sign in at `/admin/login`.
