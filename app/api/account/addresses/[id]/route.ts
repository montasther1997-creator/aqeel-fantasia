import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AddressSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const parsed = AddressSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });

  const a = await prisma.address.findUnique({ where: { id } });
  if (!a || a.customerId !== c.id) return NextResponse.json({ ok: false }, { status: 403 });

  const data = parsed.data as Record<string, any>;

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
