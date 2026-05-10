# AQEEL FANTASIA — Digital Universe

A cinematic dark-luxury streetwear ecommerce experience. Bilingual (AR/EN), full admin dashboard, phone-based customer accounts, IQD/USD currencies.

## Stack
- Next.js 14 (App Router) · TypeScript · TailwindCSS
- Prisma + SQLite · NextAuth-style cookie auth (jose + bcrypt)
- next-intl (AR/EN with RTL) · Framer Motion · Recharts
- Zustand (cart) · Howler (sound)

## Quick start

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open `http://localhost:3000` (auto-redirects to `/ar`).

## Login

**Admin** → `/ar/admin/login`
- Email: `admin@aqeelfantasia.com`
- Password: `Fantasia@2026`

**Customer** → `/ar/account/login` (register first; phone-based)

## Routes

### Public Site
- `/` THE GATE (hero)
- `/identity` THE IDENTITY
- `/archive` THE ARCHIVE
- `/drops` THE DROPS (store)
- `/drops/[slug]` product detail
- `/cart` `/checkout` `/checkout/success`
- `/cult` THE CULT (membership)
- `/signal` THE SIGNAL (newsletter)
- `/account` `/account/login` `/account/register` `/account/orders`

### Admin Dashboard (`/[locale]/admin/...`)
- `/` overview · stats · charts
- `/products` CRUD with images & variants
- `/categories` `/collections` (drops)
- `/orders` `/orders/[id]` status, payment, tracking
- `/customers` `/customers/[id]` VIP tier, blocking, notes
- `/cult` tiers + members
- `/content` site content keys (bilingual)
- `/archive` archive items
- `/settings` key/value settings
- `/discounts` codes
- `/newsletter` `/shipping` `/payments`
- `/users` admin team
- `/activity` audit log
- `/appearance` `/languages` `/media`

## Customizing
- Brand video → `/public/videos/hero.mp4`
- Ambient sound → `/public/sounds/ambient.mp3`
- Translations → `/messages/{ar,en}.json`
- Theme tokens → `tailwind.config.ts`

## Notes
- Prices stored as IQD (int) and USD (float) per product. Customer can switch via top-bar.
- Customer accounts use **phone** as primary identifier; email is optional.
- COD is the default payment method. Stripe/ZainCash slots are scaffolded.
- Image uploads currently use external URLs — drag-in upload to `/public/uploads` is the next step.

EOF
