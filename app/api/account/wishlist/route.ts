import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { WishlistSchema, zodError } from '@/lib/validators';

export async function GET() {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false, items: [] }, { status: 401 });
  const items = await prisma.wishlistItem.findMany({
    where: { customerId: c.id },
    include: { product: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = WishlistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const { productId } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return NextResponse.json({ ok: false, error: 'product-not-found' }, { status: 404 });
  await prisma.wishlistItem.upsert({
    where: { customerId_productId: { customerId: c.id, productId } },
    create: { customerId: c.id, productId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = WishlistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { customerId: c.id, productId: parsed.data.productId } });
  return NextResponse.json({ ok: true });
}
