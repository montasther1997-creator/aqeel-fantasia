import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
const STOCK_RESTORING = new Set(['cancelled', 'refunded']);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const b = await req.json().catch(() => ({}));

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

  // Detect status transition that should restore stock
  let restoreStock = false;
  if (data.status && STOCK_RESTORING.has(data.status)) {
    const existing = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (existing && !STOCK_RESTORING.has(existing.status)) restoreStock = true;
  }

  await prisma.$transaction(async (tx) => {
    if (restoreStock) {
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const it of items) {
        if (it.variantId) {
          await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } }).catch(() => {});
        } else {
          await tx.product.updateMany({ where: { id: it.productId, trackStock: true }, data: { stock: { increment: it.qty } } });
        }
      }
    }
    await tx.order.update({ where: { id }, data });
  });

  await prisma.activityLog.create({
    data: { adminId: admin.id, action: 'update', entity: 'order', entityId: id, details: `${data.status || data.paymentStatus || ''}${restoreStock ? ' [stock-restored]' : ''}` },
  });
  return NextResponse.json({ ok: true, stockRestored: restoreStock });
}
