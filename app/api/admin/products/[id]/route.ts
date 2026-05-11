import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ProductSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  try {
    const parsed = ProductSchema.partial().safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
    const b = parsed.data as any;

    // 1) Diff variants: only delete those NOT in incoming list and NOT referenced by any OrderItem
    const incomingVariants: any[] = Array.isArray(b.variants) ? b.variants : [];
    const incomingVariantIds = new Set(incomingVariants.map((v) => v.id).filter(Boolean));
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true, _count: { select: { orderItems: true } } },
    });

    const variantsToDelete = existingVariants.filter((v) => !incomingVariantIds.has(v.id) && v._count.orderItems === 0).map((v) => v.id);
    const variantsToOrphan = existingVariants.filter((v) => !incomingVariantIds.has(v.id) && v._count.orderItems > 0);

    // 2) Apply all changes (images rebuild + variant diff + product update) in ONE transaction
    await prisma.$transaction(async (tx) => {
      // Rebuild images
      await tx.productImage.deleteMany({ where: { productId: id } });

      // Delete unused variants
      if (variantsToDelete.length) {
        await tx.productVariant.deleteMany({ where: { id: { in: variantsToDelete } } });
      }
      // Set orphan variants stock=0 to hide from selection (keeping FK integrity)
      for (const v of variantsToOrphan) {
        await tx.productVariant.update({ where: { id: v.id }, data: { stock: 0 } });
      }
      // Update or create
      for (const v of incomingVariants) {
        if (v.id && existingVariants.find((e) => e.id === v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { size: v.size || null, color: v.color || null, stock: v.stock || 0, priceIQD: v.priceIQD || null, priceUSD: v.priceUSD || null },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, size: v.size || null, color: v.color || null, stock: v.stock || 0 },
          });
        }
      }

      // Update product + recreate images
      await tx.product.update({
        where: { id },
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
          images: { create: (b.images || []).map((img: any, i: number) => ({ url: img.url, alt: img.alt, order: i })) },
        },
      });
    });

    await prisma.activityLog.create({ data: { adminId: admin.id, action: 'update', entity: 'product', entityId: id } });
    return NextResponse.json({ ok: true, orphaned: variantsToOrphan.length });
  } catch (e: any) {
    console.error('product PATCH:', e.message);
    return NextResponse.json({ ok: false, error: 'update-failed' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  // Soft-delete if there are orders referencing this product
  const count = await prisma.orderItem.count({ where: { productId: id } });
  if (count > 0) {
    await prisma.product.update({ where: { id }, data: { active: false, featured: false } });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  await prisma.activityLog.create({ data: { adminId: admin.id, action: count > 0 ? 'soft-delete' : 'delete', entity: 'product', entityId: id } });
  return NextResponse.json({ ok: true, archived: count > 0 });
}
