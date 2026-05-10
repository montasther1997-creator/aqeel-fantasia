import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  await prisma.shippingZone.create({ data: { nameEn: b.nameEn, nameAr: b.nameAr || b.nameEn, governorates: b.governorates || '[]', priceIQD: +b.priceIQD, priceUSD: +b.priceUSD, etaDays: b.etaDays || null } });
  return NextResponse.json({ ok: true });
}
