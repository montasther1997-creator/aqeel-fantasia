import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params; const b = await req.json();
  await prisma.shippingZone.update({ where: { id }, data: { nameEn: b.nameEn, nameAr: b.nameAr, governorates: b.governorates, priceIQD: +b.priceIQD, priceUSD: +b.priceUSD, etaDays: b.etaDays || null, active: b.active } });
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  await prisma.shippingZone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
