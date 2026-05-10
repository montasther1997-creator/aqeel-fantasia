import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ShoppingBag, Users, Package, DollarSign, TrendingUp, Crown } from 'lucide-react';
import { DashboardCharts } from '@/components/admin/dashboard-charts';

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);

  const [productsCount, ordersCount, customersCount, revenueAgg, recentOrders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { items: true } }),
    prisma.product.findMany({ where: { stock: { lt: 5 } }, take: 5, orderBy: { stock: 'asc' } }),
  ]);

  const ordersByDay = await prisma.order.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true, total: true },
  });
  const days: Record<string, { count: number; total: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days[d] = { count: 0, total: 0 };
  }
  ordersByDay.forEach((o) => {
    const d = o.createdAt.toISOString().slice(0, 10);
    if (days[d]) { days[d].count++; days[d].total += o.total; }
  });
  const chart = Object.entries(days).map(([d, v]) => ({ day: d.slice(5), orders: v.count, revenue: v.total }));

  const stats = [
    { label: 'Revenue', value: `$${(revenueAgg._sum.total || 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Orders', value: ordersCount, icon: ShoppingBag },
    { label: 'Customers', value: customersCount, icon: Users },
    { label: 'Products', value: productsCount, icon: Package },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-cinematic text-muted">— OVERVIEW</p>
          <h1 className="h-display text-4xl mt-2">Dashboard</h1>
        </div>
        <p className="text-xs text-muted">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass p-6">
              <div className="flex items-center justify-between mb-3"><span className="text-xs text-muted tracking-cinematic uppercase">{s.label}</span><Icon className="w-4 h-4 text-electric" /></div>
              <p className="text-3xl font-display">{s.value}</p>
            </div>
          );
        })}
      </div>

      <DashboardCharts data={chart} />

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        <div className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— RECENT ORDERS</h3>
          {recentOrders.length === 0 ? <p className="text-muted text-sm">No orders yet.</p> :
            <div className="divide-y divide-line">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-mono text-xs">{o.number}</p>
                    <p className="text-xs text-muted mt-1">{new Date(o.createdAt).toLocaleString()} · {o.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p>{o.currency} {o.total.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-cinematic text-electric">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
        <div className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— LOW STOCK</h3>
          {lowStock.length === 0 ? <p className="text-muted text-sm">All good.</p> :
            <div className="divide-y divide-line">
              {lowStock.map((p) => (
                <div key={p.id} className="py-3 flex justify-between text-sm">
                  <span>{p.nameEn}</span>
                  <span className="text-blood">{p.stock} left</span>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
