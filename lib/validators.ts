import { z } from 'zod';

/** Customer registration */
export const RegisterSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(6).max(50),
  password: z.string().min(6).max(200),
  email: z.string().email().max(200).optional().or(z.literal('')),
});

/** Customer login */
export const LoginSchema = z.object({
  phone: z.string().trim().min(6).max(50),
  password: z.string().min(1).max(200),
});

/** Admin login */
export const AdminLoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

/** Bespoke request */
export const BespokeSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(6).max(50),
  email: z.string().email().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  occasion: z.string().trim().min(1).max(500),
  preferredDate: z.string().max(100).optional().or(z.literal('')),
  fitPreference: z.string().max(500).optional().or(z.literal('')),
  fabricPreference: z.string().max(500).optional().or(z.literal('')),
  budget: z.string().max(100).optional().or(z.literal('')),
  contactMethod: z.enum(['whatsapp', 'phone', 'instagram']).default('whatsapp'),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

/** Order item from client */
export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional().nullable(),
  qty: z.number().int().min(1).max(50),
  // prices ignored server-side; we re-fetch
  priceIQD: z.number().optional(),
  priceUSD: z.number().optional(),
});

/** Order creation */
export const OrderSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(6).max(50),
  email: z.string().email().max(200).optional().or(z.literal('')),
  country: z.string().max(100).optional(),
  governorate: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  area: z.string().max(100).optional().or(z.literal('')),
  street: z.string().max(200).optional().or(z.literal('')),
  details: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  currency: z.enum(['IQD', 'USD']).default('IQD'),
  items: z.array(OrderItemSchema).min(1).max(100),
  discount: z.object({ code: z.string().max(50) }).optional().nullable(),
});

/** Address */
export const AddressSchema = z.object({
  recipient: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(6).max(50),
  country: z.string().max(100).default('Iraq'),
  governorate: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  area: z.string().max(100).optional().or(z.literal('')),
  street: z.string().max(200).optional().or(z.literal('')),
  details: z.string().max(500).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

/** Product create/update (admin) */
export const ProductSchema = z.object({
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/i, 'slug-must-be-kebab'),
  sku: z.string().max(100).optional().or(z.literal('')),
  nameAr: z.string().trim().min(1).max(300),
  nameEn: z.string().trim().min(1).max(300),
  taglineAr: z.string().max(500).optional().or(z.literal('')),
  taglineEn: z.string().max(500).optional().or(z.literal('')),
  descAr: z.string().max(5000).optional().or(z.literal('')),
  descEn: z.string().max(5000).optional().or(z.literal('')),
  priceIQD: z.number().int().min(0).max(1_000_000_000),
  priceUSD: z.number().min(0).max(1_000_000),
  compareIQD: z.number().int().min(0).optional().nullable(),
  compareUSD: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).max(100_000).optional(),
  categoryId: z.string().max(50).optional().or(z.literal('')).nullable(),
  collectionId: z.string().max(50).optional().or(z.literal('')).nullable(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isLimited: z.boolean().optional(),
  images: z.array(z.object({ id: z.string().optional(), url: z.string().url().max(1000), alt: z.string().max(200).optional().nullable() })).max(20).optional(),
  variants: z.array(z.object({ id: z.string().optional(), size: z.string().max(50).optional().nullable(), color: z.string().max(50).optional().nullable(), stock: z.number().int().min(0).max(10000).optional(), priceIQD: z.number().int().min(0).optional().nullable(), priceUSD: z.number().min(0).optional().nullable() })).max(50).optional(),
});

/** Public endpoints */
export const SignalSchema = z.object({
  contact: z.string().trim().min(3).max(200),
  type: z.enum(['phone', 'email']).optional(),
});
export const DiscountApplySchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.number().nonnegative().max(1_000_000_000),
});
export const WishlistSchema = z.object({
  productId: z.string().trim().min(1).max(50),
});
export const PreferencesSchema = z.object({
  height: z.coerce.number().int().min(50).max(300).optional().nullable(),
  weight: z.coerce.number().int().min(20).max(300).optional().nullable(),
  shoulderWidth: z.coerce.number().int().min(20).max(100).optional().nullable(),
  chestSize: z.coerce.number().int().min(40).max(200).optional().nullable(),
  waistSize: z.coerce.number().int().min(40).max(200).optional().nullable(),
  inseam: z.coerce.number().int().min(40).max(150).optional().nullable(),
  preferredSize: z.string().max(20).optional().nullable(),
  preferredColors: z.string().max(500).optional().nullable(),
  preferredStyles: z.string().max(500).optional().nullable(),
  preferredFabrics: z.string().max(500).optional().nullable(),
});

/** Admin: catalog + content */
export const CategorySchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/i),
  nameAr: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(200),
  descAr: z.string().max(2000).optional().nullable(),
  descEn: z.string().max(2000).optional().nullable(),
  image: z.string().url().max(1000).optional().nullable(),
  active: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(10000).optional(),
});
export const CollectionSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/i),
  nameAr: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(200),
  descAr: z.string().max(2000).optional().nullable(),
  descEn: z.string().max(2000).optional().nullable(),
  image: z.string().url().max(1000).optional().nullable(),
  banner: z.string().url().max(1000).optional().nullable(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(10000).optional(),
});
export const ContentSchema = z.object({
  key: z.string().trim().min(1).max(100),
  valueAr: z.string().max(20000),
  valueEn: z.string().max(20000),
  type: z.string().max(50).optional(),
  group: z.string().max(50).optional().nullable(),
});
export const ArchiveSchema = z.object({
  titleAr: z.string().trim().min(1).max(300),
  titleEn: z.string().trim().min(1).max(300),
  descAr: z.string().max(2000).optional().nullable(),
  descEn: z.string().max(2000).optional().nullable(),
  type: z.enum(['reel', 'edit', 'campaign', 'photo']),
  cover: z.string().url().max(1000),
  media: z.string().url().max(1000).optional().nullable(),
  active: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(10000).optional(),
});
export const CultTierSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/i),
  nameAr: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(200),
  descAr: z.string().max(2000).optional().nullable(),
  descEn: z.string().max(2000).optional().nullable(),
  priceIQD: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  priceUSD: z.coerce.number().min(0).max(1_000_000).optional(),
  pointsThreshold: z.coerce.number().int().min(0).max(10_000_000).optional(),
  multiplier: z.coerce.number().min(0).max(100).optional(),
  freeShipping: z.boolean().optional(),
  discountPct: z.coerce.number().int().min(0).max(100).optional(),
  earlyAccess: z.boolean().optional(),
  perks: z.string().max(10000).optional(),
  color: z.string().max(50).optional().nullable(),
  order: z.coerce.number().int().min(0).max(10000).optional(),
  active: z.boolean().optional(),
});

export const ManualTierSchema = z.object({
  tierId: z.string().nullable(),
  reason: z.string().max(500).optional(),
});
export const NoteSchema = z.object({
  number: z.coerce.number().int().min(1).max(99999),
  textAr: z.string().trim().min(1).max(2000),
  textEn: z.string().trim().min(1).max(2000),
  signature: z.string().max(50).optional().nullable(),
  noteDate: z.string().or(z.date()).optional().nullable(),
  productId: z.string().max(50).optional().nullable(),
  image: z.string().url().max(1000).optional().nullable(),
  active: z.boolean().optional(),
});
export const ShippingZoneSchema = z.object({
  nameAr: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(200),
  governorates: z.string().max(5000),
  priceIQD: z.coerce.number().int().min(0).max(1_000_000_000),
  priceUSD: z.coerce.number().min(0).max(1_000_000),
  etaDays: z.string().max(50).optional().nullable(),
  active: z.boolean().optional(),
});
export const DiscountAdminSchema = z.object({
  code: z.string().trim().min(1).max(50),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(0).max(1_000_000_000),
  minSubtotal: z.coerce.number().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().min(0).optional().nullable(),
  startsAt: z.string().or(z.date()).optional().nullable(),
  endsAt: z.string().or(z.date()).optional().nullable(),
  active: z.boolean().optional(),
});
export const MadeForOneSchema = z.object({
  productId: z.string().trim().min(1).max(50),
  customerId: z.string().max(50).optional().nullable(),
  edition: z.string().max(100).optional().nullable(),
  personalNote: z.string().max(2000).optional().nullable(),
  status: z.enum(['available', 'reserved', 'claimed']).optional(),
});
export const AdminUserSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(200),
  role: z.enum(['admin', 'superadmin', 'editor']).optional(),
});

/** Helper to convert Zod errors to a flat shape */
export function zodError(result: z.SafeParseError<any>) {
  const issues = result.error.issues.map((i) => ({ path: i.path.join('.'), msg: i.message }));
  return { ok: false, error: 'invalid-input', issues };
}
