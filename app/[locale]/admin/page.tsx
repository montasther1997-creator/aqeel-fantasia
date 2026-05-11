import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ShoppingBag, Users, Package, DollarSign } from 'lucide-react';
import { DashboardCharts } from '@/components/admin/dashboard-charts';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin');
  const isAr = locale === 'ar';

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
    { label: t('labels.revenue'), value: `$${(revenueAgg._sum.total || 0).toLocaleString()}`, icon: DollarSign, href: `/${locale}/admin/reports` },
    { label: t('labels.orders'), value: ordersCount, icon: ShoppingBag, href: `/${locale}/admin/orders` },
    { label: t('labels.customers'), value: customersCount, icon: Users, href: `/${locale}/admin/customers` },
    { label: t('labels.products'), value: productsCount, icon: Package, href: `/${locale}/admin/products` },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-cinematic text-muted">— {t('groups.overview').toUpperCase()}</p>
          <h1 className="h-display text-4xl mt-2">{t('nav.dashboard')}</h1>
        </div>
        <p className="text-xs text-muted">{new Date().toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="glass p-6 hover:bg-white/5 transition-colors block">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted tracking-cinematic uppercase">{s.label}</span>
                <Icon className="w-4 h-4 text-electric" />
              </div>
              <p className="text-3xl font-display">{s.value}</p>
            </Link>
          );
        })}
      </div>

      <DashboardCharts data={chart} ordersLabel={t('labels.ordersChart')} revenueLabel={t('labels.revenueChart')} />

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        <div className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— {t('labels.recentOrders')}</h3>
          {recentOrders.length === 0 ? <p className="text-muted text-sm">{t('labels.noOrders')}</p> :
            <div className="divide-y divide-line">
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/${locale}/admin/orders/${o.id}`} className="py-3 flex justify-between items-center text-sm gap-3 hover:bg-white/5 -mx-2 px-2 transition-colors">
                  <div className="min-w-0">
                    <p className="font-mono text-xs">{o.number}</p>
                    <p className="text-xs text-muted mt-1">{new Date(o.createdAt).toLocaleString(isAr ? 'ar-IQ' : 'en-US')} · {o.items.length} {t('labels.items')}</p>
                  </div>
                  <div className={isAr ? 'text-left' : 'text-right'}>
                    <p>{o.currency} {o.total.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-cinematic text-electric">{o.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          }
        </div>
        <div className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— {t('labels.lowStock')}</h3>
          {lowStock.length === 0 ? <p className="text-muted text-sm">{t('labels.allGood')}</p> :
            <div className="divide-y divide-line">
              {lowStock.map((p) => (
                <Link key={p.id} href={`/${locale}/admin/products/${p.id}`} className="py-3 flex justify-between text-sm hover:bg-white/5 -mx-2 px-2 transition-colors">
                  <span>{isAr ? p.nameAr : p.nameEn}</span>
                  <span className="text-blood">{p.stock} {t('labels.left')}</span>
                </Link>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
