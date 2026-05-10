import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  await prisma.customer.update({ where: { id }, data: { vipTier: b.vipTier, blocked: b.blocked, notes: b.notes || null } });
  await prisma.activityLog.create({ data: { adminId: admin.id, action: 'update', entity: 'customer', entityId: id } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  await prisma.activityLog.create({ data: { adminId: admin.id, action: 'delete', entity: 'customer', entityId: id } });
  return NextResponse.json({ ok: true });
}
