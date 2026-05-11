import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const b = await req.json();
  const data: any = {};
  if ('status' in b) {
    if (!ORDER_STATUSES.includes(b.status)) return NextResponse.json({ ok: false, error: 'invalid-status' }, { status: 400 });
    data.status = b.status;
  }
  if ('paymentStatus' in b) {
    if (!PAYMENT_STATUSES.includes(b.paymentStatus)) return NextResponse.json({ ok: false, error: 'invalid-payment-status' }, { status: 400 });
    data.paymentStatus = b.paymentStatus;
  }
  if ('trackingCode' in b) data.trackingCode = b.trackingCode ? String(b.trackingCode).slice(0, 200) : null;
  await prisma.order.update({ where: { id }, data });
  await prisma.activityLog.create({ data: { adminId: admin.id, action: 'update', entity: 'order', entityId: id, details: data.status || data.paymentStatus } });
  return NextResponse.json({ ok: true });
}
