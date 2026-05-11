import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ArrowUpRight } from 'lucide-react';
import { DashboardCharts } from '@/components/admin/dashboard-charts';
import { getTranslations } from 'next-intl/server';

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin');
  const ts = await getTranslations('admin.orderActions.statusOpts');
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
    { label: t('labels.revenue'), value: `$${(revenueAgg._sum.total || 0).toLocaleString()}`, href: `/${locale}/admin/reports` },
    { label: t('labels.orders'), value: String(ordersCount), href: `/${locale}/admin/orders` },
    { label: t('labels.customers'), value: String(customersCount), href: `/${locale}/admin/customers` },
    { label: t('labels.products'), value: String(productsCount), href: `/${locale}/admin/products` },
  ];

  const today = new Date().toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('groups.overview')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('nav.dashboard')}</h1>
        </div>
        <p className="ed-caption text-xs text-muted hidden md:block num">{today}</p>
      </header>

      {/* Stat Cards — Editorial */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="ed-stat group">
            <span className="label">{s.label}</span>
            <span className="value num">{s.value}</span>
            <div className="trend">
              <span>{t('labels.viewDetails')}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </div>
          </Link>
        ))}
      </section>

      {/* Charts */}
      <section>
        <div className="ed-section-head">
          <span className="em-dash" />
          <span className="title">{t('labels.trends')}</span>
        </div>
        <DashboardCharts data={chart} ordersLabel={t('labels.ordersChart')} revenueLabel={t('labels.revenueChart')} />
      </section>

      {/* Recent Orders + Low Stock */}
      <section className="grid lg:grid-cols-2 gap-px bg-line">
        <div className="bg-bg-elevated p-8">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title">{t('labels.recentOrders')}</span>
            <span className="count num">{recentOrders.length}</span>
          </div>
          {recentOrders.length === 0 ? (
            <p className="ed-caption text-muted py-6">{t('labels.noOrders')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/${locale}/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 py-4 -mx-3 px-3 hover:bg-bg/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-frost">{o.number}</p>
                      <p className="text-[11px] text-muted mt-1.5 num">
                        {new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')} · {o.items.length} {t('labels.items')}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="num text-frost serif text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                        {o.total.toLocaleString()} <span className="text-[10px] text-muted">{o.currency}</span>
                      </p>
                      <span className="ed-pill accent mt-1.5 inline-block">{ts(o.status as any)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-bg-elevated p-8">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title">{t('labels.lowStock')}</span>
            <span className="count num">{lowStock.length}</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="ed-caption text-muted py-6">{t('labels.allGood')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/${locale}/admin/products/${p.id}`}
                    className="flex items-center justify-between gap-4 py-4 -mx-3 px-3 hover:bg-bg/40 transition-colors"
                  >
                    <span className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                      {isAr ? p.nameAr : p.nameEn}
                    </span>
                    <span className="ed-pill danger num">{p.stock} {t('labels.left')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
