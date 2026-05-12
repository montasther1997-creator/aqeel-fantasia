# CLAUDE.md — AQEEL FANTASIA · Atelier Digital

> **Read first.** Project context for Claude/AI sessions.
> The codebase is a **Next.js 14 (App Router)** luxury menswear storefront + admin CMS, redesigned in May 2026 as an editorial mobile-app/desktop adaptive experience.

---

## 1. What this is

**شركة عقيل فنتازيا للألبسة الرجالية** — a luxury men's atelier with two physical branches (Babylon — Street 40, Baghdad — Al-Qadisiya District) and Instagram @shopfantasia1.

The digital atelier ships with:
- **10 customer screens** mirroring a mobile app, but rendered as a full responsive site (mobile = app-like, desktop = full-width editorial)
- **20+ admin sections** for the brand owner to run the store unaided
- **7 signature features**: Cinematic Entry, Sound of Cloth, Atelier Notes, Editorial Mix Grid, Personal Stylist, Made for One, Atelier Address Book

---

## 2. Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | TailwindCSS 3 + custom design tokens (Fraunces + Inter + Amiri + IBM Plex Sans Arabic) |
| Database | PostgreSQL on Supabase (`fantasia` schema) |
| ORM | Prisma 5 with `multiSchema` preview |
| Auth | Bcrypt + JWT (jose) in httpOnly SameSite=lax cookies — separate cookies for `fantasia_admin` and `fantasia_customer` |
| Validation | Zod (`lib/validators.ts`) |
| State | Zustand (cart, persisted) |
| Animation | Framer Motion (page transitions, intro, hover reveals) |
| 3D | None currently (removed during redesign) |
| Sound | Web Audio API synthesized (no mp3 files) |
| Charts | Recharts (admin) |
| Storage | Supabase Storage bucket `fantasia-media` (signed URLs) |
| Rate limiting | In-memory (`lib/ratelimit.ts`) — swap with Upstash for multi-region |
| Hosting | Vercel (iad1) — auto-deploy from `main` |

---

## 3. Actual routes (verified)

### Customer pages — `app/[locale]/(site)/`
| Route | Purpose |
|-------|---------|
| `/` | Welcome — cinematic ceremonial entry |
| `/auth` | Login + Signup (phone-based, email optional) |
| `/home` | Home — hero, Personal Stylist, Curated, Atelier Notes, Lookbook, Bespoke CTA |
| `/collections` | Collections — Editorial Mix Grid (Vogue layout) |
| `/product/[slug]` | Product detail — 2-col layout, linked note, made-for-one badge |
| `/bag` | Shopping bag with sticky summary |
| `/checkout` | Checkout — server-validated, transactional |
| `/checkout/success` | Order confirmation |
| `/search` | Live search |
| `/saved` | Wishlist |
| `/profile` | Account hub |
| `/profile/orders` | Order list |
| `/profile/orders/[id]` | Order tracking with timeline |
| `/profile/addresses` | Address book |
| `/profile/bespoke` | My bespoke inquiries |
| `/profile/atelier-book` | Measurements + style preferences |
| `/profile/loyalty` | Cult tier overview + tier history |
| `/bespoke` | Bespoke inquiry form (writes to DB) |
| `/made-for-me` | Pieces reserved for this customer |
| `/settings` | Language/mode/currency/notifications |

### Admin pages — `app/[locale]/admin/`
| Group | Sections |
|-------|----------|
| Overview | Dashboard, Reports |
| Catalog | Products, Categories, Collections |
| Sales | Orders, Customers, Discounts |
| Community | Cult Tiers, Bespoke Requests, **Made for One**, **Atelier Notes**, Newsletter |
| Content | Site Content, Archive, Media Library, Appearance, Slides (hero), New Arrivals (featured) |
| Store | Shipping, Payments |
| System | Admins, Activity Log, Languages, Settings |

---

## 4. Database (schema `fantasia` in Supabase)

Core tables: `AdminUser`, `ActivityLog`, `Customer` (with measurements: height/weight/chest/waist/inseam/preferredSize/colors/styles/fabrics), `Address`, `Category`, `Collection`, `Product`, `ProductImage`, `ProductVariant`, `WishlistItem`, `Order`, `OrderItem`, `CultTier`, `CultMember`, `BespokeRequest`, `AtelierNote`, `MadeForOne`, `SiteContent`, `MediaAsset`, `ArchiveItem`, `NewsletterSub`, `Discount`, `ShippingZone`, `Setting`.

**Indexes** (added in performance migration): `Order(customerId, createdAt)`, `Order(status)`, `Order(paymentStatus)`, `Product(active, featured, order)`, `WishlistItem(customerId)`, `ActivityLog(adminId, createdAt)`, etc. — see `prisma/schema.prisma`.

Pricing: dual-currency `priceIQD: Int` + `priceUSD: Float`. Numbers are **always Latin** in UI (use `.num` class).

---

## 5. CRITICAL conventions — do NOT break

### 5.1 Server-authoritative everything in checkout
`app/api/orders/route.ts` runs in a **single `prisma.$transaction`**:
- Stock decremented atomically (`updateMany` with `stock: { gte: qty }`, fails if 0 rows)
- Discount usedCount incremented atomically (`updateMany` with `OR: [{ maxUses: null }, { usedCount: { lt } }]`)
- All prices re-fetched from DB; client prices ignored
- Customer `totalSpent` updated in same tx

**Never** trust client prices or discount values. Never increment counters outside transactions.

### 5.2 Admin role hierarchy
- `apiRequireAdmin()` in `lib/admin-guard.ts` — pass role names: `apiRequireAdmin(['admin', 'superadmin'])`
- Mutations on Settings, Customers, Admin Users require explicit role gate
- Default routes accept any authenticated admin

### 5.3 Input validation
- Zod schemas in `lib/validators.ts`
- Every POST/PATCH on critical routes uses `safeParse` → return `zodError(parsed)` on failure
- Don't add a route without validation

### 5.4 Rate limiting
- `lib/ratelimit.ts` — in-memory, keyed by IP + identifier (email/phone)
- Applied: orders, login (admin + customer), register, bespoke
- 10/min per IP for orders; 5-10/min for login attempts

### 5.5 File uploads
- **Supabase Storage** (`lib/storage.ts`) — bucket `fantasia-media`
- `app/api/admin/upload/route.ts` validates MIME + extension whitelist, 25 MB max, 10 files max
- No local filesystem (Vercel ephemeral)

### 5.6 Customer auth = phone-based
- Phone is the unique identifier (not email)
- Email is **optional** — only set if user provides
- Cookie: `fantasia_customer`

### 5.7 RTL / bilingual
- `/ar` is the default locale; `dir="rtl"` on `<html>`
- Components use `rtl:` Tailwind variants
- **Numbers always Latin** — wrap numeric output in `<span className="num">` for direction isolation
- Admin shell auto-flips: sidebar moves to right in Arabic, active border switches `border-r-2` ↔ `border-l-2`

### 5.8 Multi-schema Prisma
- `DATABASE_URL` MUST NOT contain `?schema=fantasia`
- Schema is declared in datasource block as `schemas = ["fantasia"]`
- Each model has `@@schema("fantasia")`

### 5.9 Supabase pooler hostname
Use `aws-1-ap-southeast-2.pooler.supabase.com` (NOT `aws-0-`).
- Port 6543 → transaction pooler (require `pgbouncer=true`)
- Port 5432 → direct/session (used by Prisma migrations)

### 5.9.0 Order/payment status vocabulary
`Order.status` and `Order.paymentStatus` are free-string columns (not Prisma enums) — keep the vocabulary stable:
- **status**: `pending` → `confirmed` → `processing` → `shipped` → `delivered` → `cancelled` (terminal)
- **paymentStatus**: `unpaid` | `paid` | `refunded` | `failed`

Both are localized in `messages/{ar,en}.json` under `admin.orderActions.statusOpts`. Adding a new value requires translation keys in both locales.

### 5.9.1 Pooler connection_limit=1 — sequential queries on dashboards
The pooler is set to `connection_limit=1`. Large `Promise.all` of >5 prisma queries in a single page handler exceeds the 10s pool timeout and produces server-side exceptions. **Run dashboard queries sequentially** (`await prisma.x(); await prisma.y();`) — the wall time is the same and there is no queue contention. See `app/[locale]/admin/page.tsx` for the pattern.

### 5.10 Product mutations
- **Never** `deleteMany` variants on PATCH — they're FK'd by `OrderItem` (`onDelete: Restrict`)
- Use the diff pattern in `app/api/admin/products/[id]/route.ts`: keep variants that have orders, soft-zero their stock, delete only the orphans
- Same for product DELETE: soft-delete (set `active=false`) if there are referencing orders

---

## 6. Signature features (where they live)

| Feature | UI | Backend |
|---------|-----|---------|
| Atelier Entry (intro) | `components/atelier/atelier-entry.tsx` | — |
| Sound of Cloth | `lib/sound.ts` + `components/atelier/sound-toggle.tsx` (sounds called inline by components) | — |
| Atelier Notes | `components/atelier/notes-section.tsx` + `app/[locale]/admin/notes/` | `AtelierNote` table; API: `/api/admin/notes` |
| Editorial Mix Grid | `components/atelier/editorial-grid.tsx` | — |
| Personal Stylist | `components/atelier/stylist-section.tsx` | `lib/stylist.ts` — heuristic ranking on history + wishlist + categories + price band |
| Made for One | `app/[locale]/(site)/made-for-me/` + admin page | `MadeForOne` table; API: `/api/admin/made-for-one` |
| Atelier Address Book | `app/[locale]/(site)/profile/atelier-book/` | Extended `Customer` table fields; API: `/api/account/preferences` |
| Loyalty / Cult Tiers | `components/atelier/loyalty-card.tsx` (customer) + `components/admin/cult-manager.tsx` (admin) + `components/admin/tier-changer.tsx` (manual override) | `lib/loyalty.ts` (compute + awardPointsForOrder + manualSetTier), extended `CultTier` model, new `TierHistory` model; APIs: `GET /api/account/loyalty`, `POST /api/admin/customers/[id]/tier`. Points auto-awarded inside the order transaction. Earning rate configurable via Setting keys `loyalty.iqdPerPoint` and `loyalty.pointsPerUSD`. |
| Smart Settings | `components/admin/smart-settings.tsx` | Tabs: About / Branches / Social / Shipping / Loyalty / Advanced (raw key/value editor). All writes go to the existing `Setting` table via `/api/admin/settings`. |
| Editorial admin design | `app/globals.css` `.ed-*` classes | `.ed-eye .ed-title .ed-display .ed-caption .ed-stat .ed-section-head .ed-table .ed-pill .ed-card .ed-rule` — magazine-inspired admin design used across every admin page. |
| Media Input | `components/admin/media-input.tsx` | Tabs `Upload | URL`. Upload posts to `/api/admin/upload`; videos up to 50 MB, images 25 MB. |

---

## 7. Deployment

| Resource | Where |
|----------|-------|
| Live URL | https://aqeel-fantasia-45cl.vercel.app |
| GitHub | https://github.com/montasther1997-creator/aqeel-fantasia |
| Vercel project | `aqeel-fantasia-45cl` (team AL3KED) |
| Supabase project | `iixuvhjhhtfsioqhmqkx` (ap-southeast-2) |
| Schema | `fantasia` |
| Storage bucket | `fantasia-media` (public) |

### Required environment variables
- `DATABASE_URL` — pooler 6543 with `pgbouncer=true&connection_limit=1`
- `DIRECT_URL` — direct port 5432 (for migrations)
- `JWT_SECRET` — random 32+ chars (auth throws if missing in production)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — seeded admin
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL` — `https://iixuvhjhhtfsioqhmqkx.supabase.co`
- `SUPABASE_SERVICE_KEY` — service_role JWT (for storage uploads)

`.env` is gitignored.

---

## 8. Auth model

**Admin** (`lib/auth.ts`)
- Cookie: `fantasia_admin` (httpOnly, sameSite=lax, secure in prod, 30-day max-age)
- Roles: `admin` | `superadmin` | `editor` — only `superadmin` can manage other admins, mutate customers, hit settings
- Pages: `requireAdmin(locale)` from `lib/admin-guard.ts`
- API routes: `apiRequireAdmin([roles])` from same file

**Customer** (`lib/auth.ts`)
- Cookie: `fantasia_customer`
- Login: phone + password (email optional at registration)
- Scope: enforced by `customerId` ownership checks per route

---

## 9. Arabic terminology (formal Fusha)

The brand demands formal global Arabic. Avoid colloquialisms.

| ❌ Avoid | ✅ Use |
|---------|--------|
| القطرات | **المجموعات** |
| البوابة | **الواجهة** |
| الإشارة | **النشرة** |
| الطائفة | **النادي / النادي الحصري** |
| الزبائن | **العملاء** |
| ادخل | **اكتشف / استكشف** |
| مفصّل | **التفصيل (bespoke)** |

---

## 10. Known gaps (intentional, do not "fix" without asking)

- **No CSRF tokens** beyond SameSite=lax — acceptable for current threat model
- **No payment gateway** — only COD; Stripe/ZainCash placeholders only
- **No SMS for password reset** — manual via concierge
- **No real-time** — orders/admin updates require refresh
- **In-memory rate limit** — works per-lambda only; swap with Upstash Redis for production-grade
- **No tests** — manual QA only
- **Cult membership flow** is auto-promotion only (customer ranked into tiers based on points; manual promote/demote is in admin). No public "subscribe" flow.

---

## 11. When making changes

1. **DB schema** → edit `prisma/schema.prisma`, generate SQL via `npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script`, apply via Supabase MCP `apply_migration`, then `npx prisma generate`.
2. **New customer page** → drop under `app/[locale]/(site)/...` → inherits DesktopNav + BottomNav + atelier shell automatically. Add `export const revalidate = 60` if cacheable.
3. **New admin section** → page under `app/[locale]/admin/[section]/page.tsx`, then add to `NAV` array in `components/admin/shell.tsx` with translated labels in `messages/{ar,en}.json` → `admin.nav.*`.
4. **API route** → always Zod-validate, always rate-limit if public, always check auth/role for admin/customer routes.
5. **Translations** → `messages/{ar,en}.json`. Formal Arabic (section 9).
6. **Currency** → never display raw integers; use `<Price>` from `components/ui/price.tsx`.
7. **Sound** → call `playWood/playFabric/playDing/playBell` directly from event handlers (NOT global listeners — performance).

---

## 12. How to run locally

```bash
npm install
# Set DATABASE_URL, DIRECT_URL, JWT_SECRET, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_URL in .env
npx prisma generate
npm run dev
```

Default admin: `admin@aqeelfantasia.com` / `Fantasia@2026` (change in production).

---

## 13. Recent major work (May 2026)

- **Atelier Digital redesign**: 10 mobile-app-mirroring screens with adaptive desktop (full-bleed, multi-col, Editorial Mix on collections)
- **Brand identity**: Fraunces serif + Inter sans + Amiri/IBM Plex for Arabic; Onyx/Pearl/Champagne palette
- **Cinematic Entry, Sound of Cloth, Atelier Notes (CMS), Editorial Mix, Personal Stylist (heuristic), Made for One (admin-assigned), Atelier Address Book (measurements + style profile)** — all live
- **Architecture audit fixes**: atomic order transactions, role-gated admin mutations, Zod validation, in-memory rate limiting, Supabase Storage uploads, performance indexes (15+), variant-safe product PATCH, missing profile pages
- **Full Arabic admin** (May 2026): `admin` namespace in `messages/{ar,en}.json` with ~400 keys covering every page, manager component, table header, button, placeholder, status, and confirm dialog. Formal Fusha throughout. Order/payment status enums also localized via `admin.orderActions.statusOpts`.
- **Loyalty / Cult Tiers system**: `CultTier` extended with `pointsThreshold`, `multiplier`, `freeShipping`, `discountPct`, `earlyAccess`. New `TierHistory` audit table. Points auto-awarded inside `/api/orders` transaction; auto-tier-up when points cross threshold. Manual override in admin via `POST /api/admin/customers/[id]/tier`. Customer-facing `LoyaltyCard` in `/profile` with progress bar to next tier.
- **Smart Settings page**: tabbed UI (About / Branches / Social / Shipping / Loyalty / Advanced raw editor) — friendly named fields backed by the existing `Setting` table.
- **Editorial admin design**: `.ed-*` CSS layer in `globals.css` (eyebrows, gold-ruled stat cards, em-dash section heads, refined tables with accent hover, `.ed-pill` status badges). Dashboard adds 6 features: today's snapshot, quick actions, KPI trend %, alerts panel, activity feed, top-governorates bar chart.
- **Shipping settings**: redesigned `shipping-manager.tsx` to card-per-zone with labeled fields. Added store-wide `shipping.freeThresholdIQD` and `shipping.codFeeIQD` settings.
- **Appearance redesign**: split into Visual / Tagline / Colors sections with `MediaInput` (Upload | URL tabs) + 50 MB video upload limit.
- **Dark/Light mode fix**: `PhoneShell` no longer hardcodes `data-mode="dark"`; reads from `localStorage` and mirrors `<html>` via MutationObserver so the settings toggle works.
- **Checkout validation**: custom red-mark validation with centered toast; name/phone/governorate/city/street required; email optional.
- **Comprehensive audit pass (May 2026 — commit `6246b0e`, 42 fixes across 62 files):**
  - **Ambient overlay** moved above content with `z-[60]` + `mix-blend-mode: screen` so silk waves stay visible above section backgrounds; styles extracted to `globals.css` `.ambient-overlay` / `.silk-root` / `.scroll-trail` keyframes.
  - **`/profile/loyalty` page** (was 404 from `LoyaltyCard`). Shows tier, points, progress, all tiers, tier history.
  - **Loyalty perks now enforced in checkout** (`app/api/orders/route.ts`): the customer's current tier is resolved before the transaction; `freeShipping` zeroes `ship`, `discountPct` stacks on the subtotal before the promo code. `discount` column stores the combined total.
  - **Sequential prisma queries** on 9 admin pages (`Promise.all` removed) to honor `connection_limit=1`.
  - **`lib/revalidate.ts`** + `revalidateForEntity(...)` called from products/categories/collections/notes/slides/new-arrivals/content/settings admin routes so admin mutations bust the public-route cache instead of waiting 60s.
  - **Security hardening**: CSP drops `'unsafe-eval'` in production; `JWT_SECRET` now required in every env (≥16 chars, no dev fallback); admin middleware redirect for unauthenticated `/admin/*`; admin login adds 1-hour lockout after 10 fails (`checkLockout`/`recordFailure` in `lib/ratelimit.ts`); register endpoint returns generic error to block enumeration; `/api/discount` tighter rate-limit + per-code throttle; `/api/admin/upload` IP rate-limited; CSV export capped at 366 days; `deleteFromStorage` rejects `..` and wrong bucket; address PATCH validated by `AddressSchema.partial()`; production `images.remotePatterns` restricted to Supabase + Unsplash only.
  - **Status vocabulary** centralised in `lib/status.ts` (`normalizeOrderStatus` / `normalizePaymentStatus`) — unknown values fall back to `pending` / `unpaid` instead of leaking key strings. Vocabulary documented in §5.9.0.
  - **`<Price>` component wired** into `ProductCard` so the IQD/USD currency toggle actually affects displayed prices.
  - **Forbidden Arabic terms purged** from `messages/ar.json` per §9 (`مفصّل`→`التفصيل`, `ادخل`→`اكتشف`/`سجّل`).
  - **`/api/newsletter`** is the canonical endpoint; `/api/signal` re-exports it for back-compat.
  - **Production console.* stripped** via Next compiler (`removeConsole: { exclude: ['error', 'warn'] }`).
  - Bag list keys use `productId+variantId`. Intro `setTimeout` cleaned on unmount. Slug generation uses random suffix instead of bare `Date.now()`. Image alts localized.
