import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export default async function ReportsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);

  // Best sellers (by qty over all time)
  const bestSellersAgg = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { qty: true, totalIQD: true, totalUSD: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: 10,
  });
  const productIds = bestSellersAgg.map((x) => x.productId);
  const productMap = new Map((await prisma.product.findMany({ where: { id: { in: productIds } } })).map((p) => [p.id, p]));
  const bestSellers = bestSellersAgg.map((x) => ({ ...x, product: productMap.get(x.productId) }));

  // Top customers
  const topCustomers = await prisma.customer.findMany({
    orderBy: { totalSpent: 'desc' }, take: 10, include: { _count: { select: { orders: true } } },
  });

  // Revenue by status
  const byStatus = await prisma.order.groupBy({ by: ['status'], _count: true, _sum: { total: true } });

  // Last 7d / 30d
  const since7 = new Date(Date.now() - 7 * 86400000);
  const since30 = new Date(Date.now() - 30 * 86400000);
  const [r7, r30, all] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { createdAt: { gte: since7 } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { createdAt: { gte: since30 } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true }),
  ]);

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— OVERVIEW</p>
      <h1 className="h-display text-4xl mt-2 mb-8">Reports</h1>

      <div className="grid lg:grid-cols-3 gap-4 mb-10">
        {[['LAST 7D', r7], ['LAST 30D', r30], ['ALL TIME', all]].map(([label, data]: any) => (
          <div key={label} className="glass p-6">
            <p className="text-xs tracking-cinematic text-muted mb-2">{label}</p>
            <p className="font-display text-3xl">{(data._sum.total || 0).toLocaleString()}</p>
            <p className="text-xs text-muted mt-1">{data._count} orders</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— BEST SELLERS</h3>
          {bestSellers.length === 0 ? <p className="text-muted text-sm">No sales yet.</p> :
            <div className="divide-y divide-line">
              {bestSellers.map((b) => (
                <div key={b.productId} className="py-3 flex justify-between items-center">
                  <span className="text-sm">{b.product?.nameEn || b.productId}</span>
                  <span className="text-xs text-muted">{b._sum.qty} sold · {b._sum.totalIQD?.toLocaleString()} IQD</span>
                </div>
              ))}
            </div>
          }
        </div>
        <div className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— TOP CUSTOMERS</h3>
          {topCustomers.length === 0 ? <p className="text-muted text-sm">No customers yet.</p> :
            <div className="divide-y divide-line">
              {topCustomers.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm">{c.name}</span>
                    <span className="text-xs text-muted block">{c.phone}</span>
                  </div>
                  <span className="text-xs text-muted">{c._count.orders} orders · ${c.totalSpent.toLocaleString()}</span>
                </div>
              ))}
            </div>
          }
        </div>
        <div className="glass p-6 lg:col-span-2">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— ORDERS BY STATUS</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {byStatus.map((s) => (
              <div key={s.status} className="border border-line p-4">
                <p className="text-[10px] tracking-cinematic uppercase text-electric">{s.status}</p>
                <p className="font-display text-2xl mt-1">{s._count}</p>
                <p className="text-xs text-muted">{(s._sum.total || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
