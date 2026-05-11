import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ALLOWED = ['recipient', 'phone', 'country', 'governorate', 'city', 'area', 'street', 'details', 'isDefault'] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => ({}));

  const a = await prisma.address.findUnique({ where: { id } });
  if (!a || a.customerId !== c.id) return NextResponse.json({ ok: false }, { status: 403 });

  const data: Record<string, any> = {};
  for (const k of ALLOWED) if (k in b) data[k] = b[k];

  // Length caps
  for (const k of ['recipient', 'phone', 'country', 'governorate', 'city', 'area', 'street', 'details']) {
    if (typeof data[k] === 'string') data[k] = data[k].slice(0, 500);
  }
  if ('isDefault' in data) data.isDefault = !!data.isDefault;

  // Atomic isDefault flip
  await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { customerId: c.id, NOT: { id } }, data: { isDefault: false } });
    }
    await tx.address.update({ where: { id }, data });
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const a = await prisma.address.findUnique({ where: { id } });
  if (!a || a.customerId !== c.id) return NextResponse.json({ ok: false }, { status: 403 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
