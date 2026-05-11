import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AddressSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const b = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (b.isDefault) {
      await tx.address.updateMany({ where: { customerId: c.id }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        customerId: c.id,
        recipient: b.recipient,
        phone: b.phone,
        country: b.country || 'Iraq',
        governorate: b.governorate,
        city: b.city,
        area: b.area || null,
        street: b.street || null,
        details: b.details || null,
        isDefault: !!b.isDefault,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
