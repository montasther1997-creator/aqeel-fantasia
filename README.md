# AQEEL FANTASIA

> **شركة عقيل فنتازيا للألبسة الرجالية**
> A cinematic dark-luxury digital experience for an Iraqi men's fashion house.

[![Live](https://img.shields.io/badge/live-aqeel--fantasia--45cl.vercel.app-C9A66B?style=flat-square)](https://aqeel-fantasia-45cl.vercel.app)
[![Stack](https://img.shields.io/badge/stack-Next.js%2014%20·%20Prisma%20·%20Postgres-0A0A0A?style=flat-square)]()
[![i18n](https://img.shields.io/badge/i18n-AR%20·%20EN-F4F4F6?style=flat-square)]()

---

## 🌑 The Brand

**Founder**: Aqeel Fantasia
**Branches**: 🏛️ Babylon (Street 40) · 🏛️ Baghdad (Al-Qadisiya District)
**Instagram**: [@shopfantasia1](https://instagram.com/shopfantasia1)

A men's fashion house where authenticity meets modern elegance. Premium craftsmanship, refined details, and a contemporary Arab spirit.

---

## ✨ What's inside

| Pillar | Detail |
|---|---|
| 🎬 Cinematic storefront | Editorial typography (Fraunces serif × Inter sans × Amiri/IBM Plex for Arabic), gold accents, Framer Motion page transitions, hover reveals |
| 🛍️ Full e-commerce | Catalog, variants, cart, checkout (COD), discount codes, shipping zones, wishlist |
| 🌐 Bilingual | Arabic (RTL, default) + English (LTR), with formal Fusha terminology, ~400 admin translation keys |
| 💰 Dual currency | IQD (default) ↔ USD with live switcher |
| 🎛️ Editorial admin | 24 sections — full CRUD, magazine-style design system (gold-ruled stat cards, em-dash section heads, accent-hover tables) |
| 🏅 Loyalty system | Cult tiers with `pointsThreshold` + `multiplier` + perks (free shipping / early access / % discount / custom). Auto-award + auto-tier-up inside the order transaction. Customer-facing tier card with progress bar. |
| 👥 Customer accounts | Phone-based auth (email optional), addresses, order history, wishlist, atelier book (measurements + style preferences) |
| 🛡️ Security-hardened | Server-authoritative pricing, role-gated admin actions, upload whitelist, mandatory `JWT_SECRET`, middleware admin guard, account lockout, production CSP without `unsafe-eval` |
| 🌫️ Ambient overlay | Always-on silk waves + gold motes + scissor sweep rendered above content via `mix-blend-mode: screen`, reactive to scroll velocity |
| 🎵 Subtle sound design | Web Audio synthesized cues (`playWood/playFabric/playDing/playBell/playSwoosh` triggered inline) |

---

## 🌐 Live

- 🇸🇦 Arabic: <https://aqeel-fantasia-45cl.vercel.app/ar>
- 🇬🇧 English: <https://aqeel-fantasia-45cl.vercel.app/en>
- 🎛️ Admin: <https://aqeel-fantasia-45cl.vercel.app/ar/admin/login>

---

## 🛠️ Tech stack

```
Next.js 14 (App Router) · TypeScript · Tailwind 3
Prisma 5 (multi-schema) · PostgreSQL on Supabase
Bcrypt + JWT (jose) cookies · next-intl (AR/EN)
Framer Motion · Recharts · Zustand · Web Audio API
Vercel (production) · GitHub (CI auto-deploy)
```

---

## 🚀 Local development

### Prerequisites
- Node.js 20+
- A PostgreSQL database (or use the production Supabase pooler)

### Setup

```bash
git clone https://github.com/montasther1997-creator/aqeel-fantasia.git
cd aqeel-fantasia
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://...:5432/postgres"
JWT_SECRET="<random 32+ char string>"
ADMIN_EMAIL="admin@aqeelfantasia.com"
ADMIN_PASSWORD="Fantasia@2026"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Generate Prisma client and run dev server:

```bash
npx prisma generate
npm run dev
```

Open http://localhost:3000 — auto-redirects to `/ar`.

---

## 🔑 Default admin

| Field | Value |
|-------|-------|
| URL | `/ar/admin/login` |
| Email | `admin@aqeelfantasia.com` |
| Password | `Fantasia@2026` |

> **Change these in production.** Update via the dashboard or directly in DB.

---

## 📁 Project structure

```
app/
  [locale]/
    (site)/           Public storefront — Gate, Identity, Archive, Drops, Cult, Signal, Cart, Checkout, Account
    admin/            Full dashboard — Products, Orders, Customers, Content, Media, Settings, …
  api/
    account/          Customer endpoints (auth, addresses, wishlist)
    admin/            Admin CRUD (server-side authorization required)
    orders, search, shipping, newsletter (/signal alias), discount, health
components/
  site/               Storefront UI (Hero, Marquee, ProductCard, …)
  admin/              Admin shell + per-section managers
  3d/                 Three.js hero scene
  ui/                 Logo, Price, Toast, CurrencySwitch
lib/
  auth.ts             JWT + bcrypt for both admin and customer cookies
  db.ts               Prisma singleton
  cart-store.ts       Persisted Zustand cart
  sound.ts            Web Audio synthesizer
  admin-guard.ts, utils.ts, constants.ts
prisma/schema.prisma  Postgres + multi-schema (`fantasia`)
messages/{ar,en}.json All UI strings (formal Arabic / English)
i18n/                 next-intl routing
```

---

## 🔐 Security highlights

- **Server-authoritative pricing**: orders re-fetch product prices from DB; client-supplied prices are ignored
- **Discount validation**: re-validated server-side, with usage counter
- **Address ownership**: PATCH whitelists allowed fields (no `customerId` reassignment possible)
- **Admin role gating**: only `superadmin` can manage other admins
- **Upload validation**: MIME + extension whitelist, 25 MB for images / 50 MB for videos / 10 file caps
- **JWT secret**: throws on startup if missing in production
- **Cookies**: httpOnly, SameSite=lax, secure in production
- **Search input**: capped at 100 chars to prevent unbounded LIKE scans

---

## 🌍 Internationalization

Two locales, full RTL/LTR support:

- `/ar` — Arabic (default), formal Fusha terminology, RTL layout
- `/en` — English, LTR

Edit translations:
- UI strings → `messages/ar.json` and `messages/en.json`
- Site content (hero copy, identity quote, etc.) → Admin → Content
- Add a new locale: extend `i18n/routing.ts` and create `messages/<code>.json`

---

## 🛒 Cart & checkout flow

1. Customer adds variant to cart (Zustand persisted)
2. Cart calculates subtotal locally; server recalculates on submission
3. Discount code → POST `/api/discount` with subtotal → server validates
4. Checkout form auto-detects shipping cost via POST `/api/shipping` based on governorate
5. Submit → POST `/api/orders` → server re-fetches all prices & re-validates discount/shipping → creates order
6. Customer redirected to `/checkout/success`

---

## 🎛️ Admin sections

| Section | Capability |
|---------|-----------|
| Dashboard | Today's snapshot vs yesterday, quick actions, KPI cards with 30-day trend %, alerts panel (pending / low stock / bespoke / subscribers), activity feed, top governorates, 30-day charts, recent orders, low-stock list |
| Reports | Date-range filter, CSV export, best sellers, top customers, orders by status, 4 KPIs (range / 7d / 30d / all time) |
| Products | CRUD with image upload + URL, variants, pricing, SEO, image-uploader component |
| Categories / Collections / Discounts / Notes / Archive | Inline CRUD (editorial card layout, labeled placeholders) |
| Orders | Status + payment + tracking (localized Arabic enums), status filter chips |
| Customers | VIP tier, block/unblock, notes, manual tier change with history |
| Cult Tiers | Card-per-tier editor: points threshold, multiplier, perks (free shipping, early access, % discount, custom perks). Members list with points |
| Newsletter | Subscribers with active toggle, CSV export |
| Site Content | Friendly group labels (الأرشيف، النادي، الواجهة…) over raw keys |
| Media Library | Upload + URL clipboard, image/video gallery |
| Appearance | Sectioned editor: Visual Identity (logo/favicon/hero video with Upload\|URL tabs) + Tagline + Colors (color picker + overlay slider) |
| Shipping | Card-per-zone with labeled fields, store-wide free-threshold + COD-fee settings |
| Payments | Per-method enable/disable (COD / Card / Bank / ZainCash) — persisted to Settings |
| Admins | Add/remove admin users (superadmin only) |
| Activity Log | Filterable audit trail with pagination |
| Languages | Set default, enable/disable AR/EN |
| Settings | Smart tabs: About / Branches (multi) / Social / Shipping / Loyalty / Advanced (raw key/value editor) |

---

## 🚢 Deployment

The site is on Vercel. Pushes to `main` auto-deploy.

Required Vercel environment variables:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

For database setup, the Supabase project uses schema `fantasia`. Apply migrations via:
1. Generate SQL: `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script`
2. Run against Supabase Postgres

---

## 📝 Scripts

```bash
npm run dev          # Local dev server (port 3000)
npm run build        # Production build
npm run start        # Run built app
npm run lint         # ESLint
npm run db:push      # Sync Prisma schema → DB
npm run db:studio    # Open Prisma Studio GUI
```

---

## 📖 For Claude Code

See [CLAUDE.md](./CLAUDE.md) for project context, conventions, and "do not break" rules.

---

## 📄 License

Proprietary — © 2026 شركة عقيل فنتازيا. All rights reserved.

---

<sub>Built with care in Iraq · Crafted for the world.</sub>
