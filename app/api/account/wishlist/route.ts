import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const c = await getCustomer(); if (!c) return NextResponse.json({ ok: false, items: [] }, { status: 401 });
  const items = await prisma.wishlistItem.findMany({ where: { customerId: c.id }, include: { product: { include: { images: { take: 1 } } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const c = await getCustomer(); if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { productId } = await req.json();
  await prisma.wishlistItem.upsert({
    where: { customerId_productId: { customerId: c.id, productId } },
    create: { customerId: c.id, productId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const c = await getCustomer(); if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { productId } = await req.json();
  await prisma.wishlistItem.deleteMany({ where: { customerId: c.id, productId } });
  return NextResponse.json({ ok: true });
}
