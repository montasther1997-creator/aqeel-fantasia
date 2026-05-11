import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CustomerPatchSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = CustomerPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  await prisma.customer.update({ where: { id }, data: parsed.data });
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
