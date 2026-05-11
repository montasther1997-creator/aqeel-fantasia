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

/** Helper to convert Zod errors to a flat shape */
export function zodError(result: z.SafeParseError<any>) {
  const issues = result.error.issues.map((i) => ({ path: i.path.join('.'), msg: i.message }));
  return { ok: false, error: 'invalid-input', issues };
}
