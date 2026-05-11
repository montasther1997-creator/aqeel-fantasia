import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  if (!b.productId) return NextResponse.json({ ok: false, error: 'missing-product' }, { status: 400 });
  try {
    await prisma.madeForOne.create({
      data: {
        productId: b.productId,
        customerId: b.customerId || null,
        edition: b.edition || null,
        personalNote: b.personalNote || null,
        status: b.customerId ? 'reserved' : 'available',
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'product-already-reserved' }, { status: 400 });
  }
}
