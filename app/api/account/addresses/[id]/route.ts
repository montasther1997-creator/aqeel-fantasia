import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCustomer(); if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params; const b = await req.json();
  const a = await prisma.address.findUnique({ where: { id } });
  if (!a || a.customerId !== c.id) return NextResponse.json({ ok: false }, { status: 403 });
  if (b.isDefault) await prisma.address.updateMany({ where: { customerId: c.id }, data: { isDefault: false } });
  await prisma.address.update({ where: { id }, data: b });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCustomer(); if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const a = await prisma.address.findUnique({ where: { id } });
  if (!a || a.customerId !== c.id) return NextResponse.json({ ok: false }, { status: 403 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
