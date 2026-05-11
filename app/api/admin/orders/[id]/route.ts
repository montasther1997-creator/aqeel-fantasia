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

  // Stock restore: read previous status INSIDE the transaction and gate the
  // update with `updateMany({ where: { status: NOT_RESTORING_STATES } })` so
  // two concurrent PATCH requests can't both increment stock for the same
  // order (race condition).
  const restoringTo = data.status && STOCK_RESTORING.has(data.status);

  let restored = false;
  await prisma.$transaction(async (tx) => {
    if (restoringTo) {
      // Atomic guard: only proceed if order is NOT already in a restoring state.
      const claim = await tx.order.updateMany({
        where: { id, status: { notIn: Array.from(STOCK_RESTORING) } },
        data: { status: data.status },
      });
      if (claim.count > 0) {
        restored = true;
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const it of items) {
          if (it.variantId) {
            await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } }).catch(() => {});
          } else {
            await tx.product.updateMany({ where: { id: it.productId, trackStock: true }, data: { stock: { increment: it.qty } } });
          }
        }
        // status already applied via updateMany above; remove from `data`
        delete data.status;
      }
    }
    if (Object.keys(data).length > 0) {
      await tx.order.update({ where: { id }, data });
    }
    await tx.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'update',
        entity: 'order',
        entityId: id,
        details: `${data.status || (restored ? `restored-to-${b.status}` : '') || data.paymentStatus || ''}`,
      },
    });
  });

  return NextResponse.json({ ok: true, stockRestored: restored });
}
