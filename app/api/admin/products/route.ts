import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ProductSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const b = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        slug: b.slug,
        sku: b.sku || null,
        nameAr: b.nameAr,
        nameEn: b.nameEn,
        taglineAr: b.taglineAr || null,
        taglineEn: b.taglineEn || null,
        descAr: b.descAr || null,
        descEn: b.descEn || null,
        priceIQD: b.priceIQD,
        priceUSD: b.priceUSD,
        compareIQD: b.compareIQD || null,
        compareUSD: b.compareUSD || null,
        stock: b.stock || 0,
        categoryId: b.categoryId || null,
        collectionId: b.collectionId || null,
        active: !!b.active,
        featured: !!b.featured,
        isNew: !!b.isNew,
        isLimited: !!b.isLimited,
        images: { create: (b.images || []).map((img: any, i: number) => ({ url: img.url, alt: img.alt || null, order: i })) },
        variants: { create: (b.variants || []).map((v: any) => ({ size: v.size || null, color: v.color || null, stock: v.stock || 0 })) },
      },
    });
    await prisma.activityLog.create({ data: { adminId: admin.id, action: 'create', entity: 'product', entityId: product.id, details: product.nameEn } });
    return NextResponse.json({ ok: true, id: product.id });
  } catch (e: any) {
    // Prisma unique constraint
    if (e?.code === 'P2002') {
      const target = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : 'field';
      return NextResponse.json({ ok: false, error: `duplicate:${target}` }, { status: 409 });
    }
    console.error('product create:', e?.message);
    return NextResponse.json({ ok: false, error: 'create-failed' }, { status: 400 });
  }
}
