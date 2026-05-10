import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const c = await getCustomer(); if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  if (b.isDefault) await prisma.address.updateMany({ where: { customerId: c.id }, data: { isDefault: false } });
  await prisma.address.create({
    data: {
      customerId: c.id,
      recipient: b.recipient || '', phone: b.phone || '',
      country: b.country || 'Iraq',
      governorate: b.governorate || '', city: b.city || '',
      area: b.area || null, street: b.street || null, details: b.details || null,
      isDefault: !!b.isDefault,
    },
  });
  return NextResponse.json({ ok: true });
}
