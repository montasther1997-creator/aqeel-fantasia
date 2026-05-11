import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 100);
  if (!q) return NextResponse.json({ ok: true, products: [] });
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameAr: { contains: q } },
        { taglineEn: { contains: q, mode: 'insensitive' } },
        { taglineAr: { contains: q } },
        { sku: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: { images: { take: 1 } },
    take: 20,
  });
  return NextResponse.json({ ok: true, products });
}
