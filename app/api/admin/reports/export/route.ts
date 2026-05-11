import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;

  const url = new URL(req.url);
  const fromStr = url.searchParams.get('from');
  const toStr = url.searchParams.get('to');
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 86400000);
  const toBase = toStr ? new Date(toStr) : new Date();
  const to = new Date(toBase.getFullYear(), toBase.getMonth(), toBase.getDate(), 23, 59, 59);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: 'desc' },
    include: { items: true, customer: true },
  });

  const header = ['number', 'createdAt', 'status', 'paymentStatus', 'currency', 'subtotal', 'shipping', 'discount', 'total', 'items', 'customer', 'phone'];
  const rows = orders.map((o) => [
    o.number,
    o.createdAt.toISOString(),
    o.status,
    o.paymentStatus,
    o.currency,
    o.subtotal,
    o.shipping,
    o.discount,
    o.total,
    o.items.reduce((n, x) => n + x.qty, 0),
    o.customer?.name || '',
    o.customer?.phone || '',
  ].map(csvEscape).join(','));

  const csv = [header.join(','), ...rows].join('\n');
  const slug = `${from.toISOString().slice(0, 10)}_${toBase.toISOString().slice(0, 10)}`;
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${slug}.csv"`,
    },
  });
}
