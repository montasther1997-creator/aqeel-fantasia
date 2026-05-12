import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { FeatureProductSchema, zodError } from '@/lib/validators';
import { revalidateForEntity } from '@/lib/revalidate';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = FeatureProductSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const { productId, order } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return NextResponse.json({ ok: false, error: 'product-not-found' }, { status: 404 });
  await prisma.featuredProduct.upsert({
    where: { productId },
    create: { productId, order: order ?? 0 },
    update: { order: order ?? 0 },
  });
  revalidateForEntity('new-arrival');
  return NextResponse.json({ ok: true });
}
