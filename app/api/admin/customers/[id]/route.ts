import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const VIP_TIERS = ['none', 'bronze', 'silver', 'gold', 'black'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const b = await req.json();
  const data: any = {};
  if ('vipTier' in b && VIP_TIERS.includes(b.vipTier)) data.vipTier = b.vipTier;
  if ('blocked' in b) data.blocked = !!b.blocked;
  if ('notes' in b) data.notes = b.notes ? String(b.notes).slice(0, 2000) : null;
  await prisma.customer.update({ where: { id }, data });
  await prisma.activityLog.create({ data: { adminId: admin.id, action: 'update', entity: 'customer', entityId: id } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  // Soft-handle FK to orders: anonymize instead of hard delete
  const customer = await prisma.customer.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
  if (!customer) return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 });
  if (customer._count.orders > 0) {
    // Anonymize to preserve order history
    await prisma.customer.update({
      where: { id },
      data: { name: 'Deleted Customer', phone: `deleted-${Date.now()}`, email: null, blocked: true, password: 'deleted', notes: null },
    });
  } else {
    await prisma.customer.delete({ where: { id } });
  }
  await prisma.activityLog.create({ data: { adminId: admin.id, action: 'delete', entity: 'customer', entityId: id } });
  return NextResponse.json({ ok: true });
}
