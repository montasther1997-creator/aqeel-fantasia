import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  await prisma.cultTier.create({ data: { slug: b.slug, nameEn: b.nameEn, nameAr: b.nameAr, priceIQD: +b.priceIQD, priceUSD: +b.priceUSD, color: b.color || null, perks: b.perks || '[]' } });
  return NextResponse.json({ ok: true });
}
