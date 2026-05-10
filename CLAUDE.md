# CLAUDE.md — AQEEL FANTASIA

> Context file for Claude Code when working on this repository.
> Read this first before making changes.

---

## Project at a glance

**AQEEL FANTASIA** is a luxury Iraqi men's fashion house's flagship digital experience.
Brand owner: **Aqeel Fantasia** · Two physical branches (Babylon, Baghdad) · IG @shopfantasia1.

The codebase is a full Next.js 14 application that doubles as:
1. A cinematic, editorial storefront (bilingual AR/EN, RTL/LTR aware)
2. A complete admin/CMS dashboard for the brand owner to run the store end-to-end

The design language is **dark, gold-accented, editorial couture** — think Maison-style typography (Playfair Display) with strong RTL support and luxe gold (#C9A66B).

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | TailwindCSS 3 + custom design tokens |
| Database | PostgreSQL on Supabase (`fantasia` schema) |
| ORM | Prisma 5 with `multiSchema` preview feature |
| Auth | Bcrypt + JWT (jose) in httpOnly SameSite=lax cookies — separate cookies for admin vs customer |
| i18n | `next-intl` (AR default, EN, full RTL) |
| State | Zustand for cart (persisted), React state elsewhere |
| Animation | Framer Motion (page transitions, reveals) + CSS animations |
| 3D | `@react-three/fiber` (light hero scene) |
| Sound | Web Audio API (synthesized hover + ambient drones) |
| Charts | Recharts (admin dashboard) |
| Deployment | **Vercel** (production) — serverless functions in iad1 |

---

## Repo structure (key paths)

```
app/
├── [locale]/                    # AR/EN locale segment
│   ├── (site)/                  # public storefront (route group)
│   │   ├── page.tsx             # GATE (homepage)
│   │   ├── identity/, archive/, drops/, drops/[slug]/
│   │   ├── cart/, checkout/, checkout/success/
│   │   ├── cult/, signal/
│   │   └── account/             # customer area (login, register, orders, addresses, wishlist)
│   ├── admin/                   # admin dashboard (~20 sections)
│   └── layout.tsx               # html lang/dir, fonts
├── api/
│   ├── account/                 # customer endpoints (auth, addresses, wishlist)
│   ├── admin/                   # admin CRUD endpoints (products, categories, orders, customers, …)
│   ├── orders/route.ts          # checkout (security-critical: server-authoritative pricing)
│   ├── search, shipping, signal, discount, health
└── globals.css                  # design tokens + utility classes
components/
├── site/                        # storefront components
├── admin/                       # admin shell + per-section managers
├── 3d/                          # Three.js hero scene
└── ui/                          # generic: Logo, Price, Toast, CurrencySwitch
lib/
├── auth.ts                      # JWT + bcrypt for both admin and customer
├── db.ts                        # Prisma singleton
├── cart-store.ts                # Zustand (persisted)
├── sound.ts                     # Web Audio synthesizer
├── utils.ts, constants.ts
├── admin-guard.ts               # requireAdmin() helper
prisma/
├── schema.prisma                # Postgres + multi-schema (`fantasia`)
└── seed.ts                      # legacy SQLite seed (not used in prod)
messages/
├── ar.json                      # all UI strings (formal Arabic)
└── en.json
i18n/                            # next-intl routing config
```

---

## Database schema (`fantasia` schema in Supabase)

All tables live in a separate schema `fantasia` to coexist with another app on the same project. Tables: `AdminUser`, `ActivityLog`, `Customer`, `Address`, `Category`, `Collection`, `Product`, `ProductImage`, `ProductVariant`, `WishlistItem`, `Order`, `OrderItem`, `CultTier`, `CultMember`, `SiteContent`, `MediaAsset`, `ArchiveItem`, `NewsletterSub`, `Discount`, `ShippingZone`, `Setting`.

Pricing is dual-currency: every product has both `priceIQD` (Int) and `priceUSD` (Float).

---

## Critical conventions

### 1. Server-authoritative pricing (security)
`app/api/orders/route.ts` **must** re-fetch product prices from Prisma and recompute totals server-side. Never trust client-supplied `priceIQD` / `priceUSD` / `discount.discount` values. This is the #1 rule — past attacks would allow $0.01 orders.

### 2. Admin role hierarchy
Routes that mutate other admin users (`POST/DELETE /api/admin/users/...`) require `admin.role === 'superadmin'`. Other admin routes accept any authenticated admin.

### 3. File uploads
`app/api/admin/upload/route.ts` validates: MIME whitelist, extension whitelist, 25 MB max per file, 10 files max per request. Don't loosen these.

### 4. Address mutations
`app/api/account/addresses/[id]/route.ts` uses an explicit `ALLOWED` field whitelist. Never spread `req.body` directly into Prisma update — `customerId` is writable.

### 5. JWT secret
`lib/auth.ts` throws on startup if `JWT_SECRET` is missing in production. Always set it.

### 6. RTL handling
- The site (`/ar`) renders the entire UI right-to-left — components use `rtl:` Tailwind variants.
- The admin shell auto-flips: sidebar moves to the right side in Arabic, left in English. Active border uses `border-r-2` vs `border-l-2` based on locale.
- Body has `dir={locale === 'ar' ? 'rtl' : 'ltr'}` set in `app/[locale]/layout.tsx`.

### 7. Multi-schema Prisma
DATABASE_URL must NOT contain `?schema=fantasia` — Prisma 5 with `multiSchema` preview reads schemas from the datasource block (`schemas = ["fantasia"]`), not the URL. URL stays vanilla.

### 8. Supabase pooler hostname
Use `aws-1-ap-southeast-2.pooler.supabase.com` (NOT `aws-0-`). Port 6543 is transaction pooler (require `pgbouncer=true`), port 5432 is direct.

### 9. Server-side data fetching
Pages in `app/[locale]/(site)/...` are mostly RSC. Use `prisma` directly in `page.tsx` server components. Add `export const revalidate = 60` for ISR where appropriate.

### 10. Image handling
Local uploads → `/public/uploads/*` (writable in dev only; Vercel serverless filesystem is ephemeral so prefer external URLs in production via the admin's URL-paste field). External: Unsplash and similar are allowed in `next.config.mjs` `remotePatterns`.

---

## Deployment & infrastructure

| Resource | Where |
|----------|-------|
| Live URL | https://aqeel-fantasia-45cl.vercel.app |
| GitHub repo | https://github.com/montasther1997-creator/aqeel-fantasia |
| Vercel project | `aqeel-fantasia-45cl` (team `AL3KED's projects`) |
| Supabase project | `iixuvhjhhtfsioqhmqkx` (region ap-southeast-2 — Sydney) |
| DB schema | `fantasia` |
| Auto-deploy | Every push to `main` → Vercel build & deploy |

Environment variables (set in Vercel dashboard, encrypted):
- `DATABASE_URL` — pooler (port 6543) with `pgbouncer=true&connection_limit=1`
- `DIRECT_URL` — direct port 5432 (used by Prisma migrations)
- `JWT_SECRET` — random 32+ char string
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — seeded admin
- `NEXT_PUBLIC_SITE_URL`

Do **not** commit `.env`. It is gitignored. Local dev uses `.env` for the same vars.

---

## Auth model

Two parallel systems:

**Admin** (`lib/auth.ts`)
- Cookie: `fantasia_admin` (httpOnly, sameSite=lax, secure in prod, 30 day max-age)
- Login: email + password against `AdminUser` table
- Role: `admin` | `superadmin` | `editor` (only `superadmin` can manage other admins)
- Protected pages: use `requireAdmin(locale)` from `lib/admin-guard.ts`

**Customer** (`lib/auth.ts`)
- Cookie: `fantasia_customer`
- Login: **phone + password** (email is optional, only collected if provided at registration)
- No role hierarchy. Customer scope is enforced by `customerId` ownership checks.

---

## When making changes

1. **Schema changes** → update `prisma/schema.prisma`, run `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script` to get SQL, apply via the Supabase MCP `apply_migration` tool, then `npx prisma generate`.
2. **New page** → if `app/[locale]/(site)/...`, it inherits the site nav/footer + page transition automatically. Add `export const revalidate = 60` for static-with-revalidation.
3. **New admin section** → add a route under `app/[locale]/admin/[section]/page.tsx`, then add an entry to the `NAV` array in `components/admin/shell.tsx` with translated labels in `messages/{ar,en}.json` under `admin.nav.*`.
4. **Translations** → ALL user-facing strings go through `messages/{ar,en}.json` (`useTranslations` hook). Use **formal Arabic (Fusha)** — see "Arabic terminology" section below.
5. **Currency** → never display raw integers. Use the `<Price>` component from `components/ui/price.tsx`.
6. **Don't change pooler hostname** without verifying via Supabase Management API (`config/database/pooler` endpoint).

---

## Arabic terminology (formal/Fusha)

The brand demands formal, global Arabic. Avoid colloquialisms.

| ❌ Avoid | ✅ Use |
|---------|--------|
| القطرات | **المجموعات** (collections) |
| البوابة | **الواجهة** (front / entrance) |
| الإشارة | **النشرة** (newsletter) |
| الطائفة | **النادي / النادي الحصري** (the club) |
| ادخل | **اكتشف / استكشف** (discover) |
| الزبائن | **العملاء** (customers) |

---

## Known gaps (intentional, do not "fix" without asking)

- **No rate limiting** on public APIs. Acceptable for MVP, would add in production hardening pass.
- **No CSRF tokens** beyond SameSite=lax cookies. Logout endpoints are POST-only and protected by SameSite.
- **No real payment gateway** — only COD (Cash on Delivery). Stripe/ZainCash slots exist in the UI as placeholders.
- **Vercel ephemeral filesystem** for uploads — local upload to `/public/uploads` won't persist across deployments. The admin UI also accepts URL-paste for stable image hosting.
- **No SMS for password reset** — customers contact admin manually.
- **Cult membership** is read-only (tier definitions exist but the public can't subscribe through the site yet).

---

## How to run locally

```bash
npm install
# Set DATABASE_URL, DIRECT_URL, JWT_SECRET in .env
npx prisma generate
npm run dev
```

Default admin: `admin@aqeelfantasia.com` / `Fantasia@2026` (change in production!).

---

## Last major changes (2026-05)

- Editorial redesign with Playfair Display + Cormorant Garamond + gold (#C9A66B) accent
- Page transitions (Framer Motion AnimatePresence)
- Product card: hover-reveal name with elegant gold underline
- Formal Arabic terminology pass (entire UI + DB content)
- Security audit fixes: 3 critical (server-side pricing, server-side discount, address mass-assignment), 3 high (admin role check, upload validation, JWT secret enforcement), 3 medium (search length cap, etc.)
- Founder section + Branches section (Babylon, Baghdad)
- Languages page made interactive (set default, toggle active)
