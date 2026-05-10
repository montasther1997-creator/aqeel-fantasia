import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const b = await req.json();
    const product = await prisma.product.create({
      data: {
        slug: b.slug, sku: b.sku || null,
        nameAr: b.nameAr, nameEn: b.nameEn,
        taglineAr: b.taglineAr || null, taglineEn: b.taglineEn || null,
        descAr: b.descAr || null, descEn: b.descEn || null,
        priceIQD: b.priceIQD, priceUSD: b.priceUSD,
        compareIQD: b.compareIQD || null, compareUSD: b.compareUSD || null,
        stock: b.stock || 0,
        categoryId: b.categoryId || null, collectionId: b.collectionId || null,
        active: !!b.active, featured: !!b.featured, isNew: !!b.isNew, isLimited: !!b.isLimited,
        images: { create: (b.images || []).map((img: any, i: number) => ({ url: img.url, alt: img.alt, order: i })) },
        variants: { create: (b.variants || []).map((v: any) => ({ size: v.size || null, color: v.color || null, stock: v.stock || 0 })) },
      },
    });
    await prisma.activityLog.create({ data: { adminId: admin.id, action: 'create', entity: 'product', entityId: product.id, details: product.nameEn } });
    return NextResponse.json({ ok: true, id: product.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
