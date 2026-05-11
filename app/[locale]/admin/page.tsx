import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import {
  ArrowUpRight, Plus, Search, Tag, ShoppingBag,
  AlertTriangle, Package, Mail, Crown, Activity, MapPin,
} from 'lucide-react';
import { DashboardCharts } from '@/components/admin/dashboard-charts';
import { getTranslations } from 'next-intl/server';

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin');
  const ts = await getTranslations('admin.orderActions.statusOpts');
  const isAr = locale === 'ar';

  // Date helpers
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1);
  const since30 = new Date(now.getTime() - 30 * 86400000);
  const since60 = new Date(now.getTime() - 60 * 86400000);

  // Sequential queries — pooler is connection_limit=1
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  const customersCount = await prisma.customer.count();
  const revenueAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } });
  const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { items: true } });
  const lowStock = await prisma.product.findMany({ where: { stock: { lt: 5 } }, take: 5, orderBy: { stock: 'asc' } });
  const ordersByDay = await prisma.order.findMany({
    where: { createdAt: { gte: since30 } },
    select: { createdAt: true, total: true },
  });

  // Today vs Yesterday snapshot
  const todayOrders = await prisma.order.aggregate({
    _count: true, _sum: { total: true },
    where: { createdAt: { gte: startToday } },
  });
  const yesterdayOrders = await prisma.order.aggregate({
    _count: true, _sum: { total: true },
    where: { createdAt: { gte: startYesterday, lt: startToday } },
  });
  const todayNewCustomers = await prisma.customer.count({ where: { createdAt: { gte: startToday } } });
  const yesterdayNewCustomers = await prisma.customer.count({
    where: { createdAt: { gte: startYesterday, lt: startToday } },
  });

  // Trend % — current 30d vs previous 30d (60d ago → 30d ago)
  const current30 = await prisma.order.aggregate({
    _count: true, _sum: { total: true },
    where: { createdAt: { gte: since30 } },
  });
  const previous30 = await prisma.order.aggregate({
    _count: true, _sum: { total: true },
    where: { createdAt: { gte: since60, lt: since30 } },
  });
  const customersCurrent30 = await prisma.customer.count({ where: { createdAt: { gte: since30 } } });
  const customersPrevious30 = await prisma.customer.count({
    where: { createdAt: { gte: since60, lt: since30 } },
  });

  // Alerts
  const pendingOrdersCount = await prisma.order.count({ where: { status: 'pending' } });
  const lowStockCount = await prisma.product.count({ where: { stock: { lt: 5 }, active: true } });
  const newBespokeCount = await prisma.bespokeRequest.count({ where: { status: 'new' } });
  const newsletterCount = await prisma.newsletterSub.count({ where: { active: true } });

  // Activity log (last 5)
  const recentActivity = await prisma.activityLog.findMany({
    take: 5, orderBy: { createdAt: 'desc' }, include: { admin: { select: { name: true } } },
  });

  // Orders by governorate (top 5)
  const allOrdersWithShip = await prisma.order.findMany({
    select: { shipAddress: true, total: true, currency: true },
  });
  const govMap: Record<string, { count: number; total: number }> = {};
  for (const o of allOrdersWithShip) {
    if (!o.shipAddress) continue;
    try {
      const ship = JSON.parse(o.shipAddress);
      const gov = ship?.governorate;
      if (!gov) continue;
      if (!govMap[gov]) govMap[gov] = { count: 0, total: 0 };
      govMap[gov].count += 1;
      govMap[gov].total += o.total;
    } catch {}
  }
  const topGovernorates = Object.entries(govMap)
    .map(([gov, v]) => ({ gov, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxGovCount = topGovernorates[0]?.count || 1;

  // 30-day chart data
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

  // Helper to compute % delta
  const pct = (current: number, previous: number): { value: number; up: boolean | null } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, up: current > 0 ? true : null };
    const v = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(v)), up: v >= 0 };
  };

  const ordersTrend = pct(current30._count, previous30._count);
  const revenueTrend = pct(current30._sum.total || 0, previous30._sum.total || 0);
  const customersTrend = pct(customersCurrent30, customersPrevious30);
  const productsTrend = { value: 0, up: null as boolean | null };

  const stats = [
    { label: t('labels.revenue'), value: `$${(revenueAgg._sum.total || 0).toLocaleString()}`, caption: t('labels.revenueCaption'), href: `/${locale}/admin/reports`, trend: revenueTrend },
    { label: t('labels.orders'), value: String(ordersCount), caption: t('labels.ordersCaption'), href: `/${locale}/admin/orders`, trend: ordersTrend },
    { label: t('labels.customers'), value: String(customersCount), caption: t('labels.customersCaption'), href: `/${locale}/admin/customers`, trend: customersTrend },
    { label: t('labels.products'), value: String(productsCount), caption: t('labels.productsCaption'), href: `/${locale}/admin/products`, trend: productsTrend },
  ];

  const today = new Date().toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Alerts list (only show those with count > 0)
  const alerts = [
    { count: pendingOrdersCount, label: t('alerts.pendingOrders'), href: `/${locale}/admin/orders?status=pending`, icon: ShoppingBag, color: 'accent' },
    { count: lowStockCount, label: t('alerts.lowStock'), href: `/${locale}/admin/products`, icon: Package, color: 'danger' },
    { count: newBespokeCount, label: t('alerts.newBespoke'), href: `/${locale}/admin/bespoke`, icon: Crown, color: 'accent' },
    { count: newsletterCount, label: t('alerts.subscribers'), href: `/${locale}/admin/newsletter`, icon: Mail, color: 'muted' },
  ];

  const quickActions = [
    { label: t('quick.newProduct'), href: `/${locale}/admin/products/new`, icon: Plus },
    { label: t('quick.searchCustomer'), href: `/${locale}/admin/customers`, icon: Search },
    { label: t('quick.todaysOrders'), href: `/${locale}/admin/orders?status=pending`, icon: ShoppingBag },
    { label: t('quick.addDiscount'), href: `/${locale}/admin/discounts`, icon: Tag },
  ];

  // Snapshot deltas
  const ordersDelta = pct(todayOrders._count, yesterdayOrders._count);
  const revenueDelta = pct(todayOrders._sum.total || 0, yesterdayOrders._sum.total || 0);
  const customersDelta = pct(todayNewCustomers, yesterdayNewCustomers);

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

      {/* Today's Snapshot */}
      <section className="ed-card p-6 md:p-7">
        <p className="ed-eye mb-4">— {t('snapshot.today')}</p>
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <SnapshotItem
            label={t('snapshot.ordersToday')}
            value={String(todayOrders._count)}
            delta={ordersDelta}
            yesterdayLabel={t('snapshot.yesterday')}
          />
          <SnapshotItem
            label={t('snapshot.revenueToday')}
            value={(todayOrders._sum.total || 0).toLocaleString()}
            delta={revenueDelta}
            yesterdayLabel={t('snapshot.yesterday')}
          />
          <SnapshotItem
            label={t('snapshot.newCustomersToday')}
            value={String(todayNewCustomers)}
            delta={customersDelta}
            yesterdayLabel={t('snapshot.yesterday')}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="ed-section-head">
          <span className="em-dash" />
          <span className="title">{t('quick.heading')}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="bg-bg-elevated hover:bg-accent/10 transition-colors p-6 flex items-center gap-4 group border border-transparent hover:border-accent"
              >
                <span className="w-10 h-10 border border-line group-hover:border-accent flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-fg-secondary group-hover:text-accent transition-colors" />
                </span>
                <span className="text-sm text-frost">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stat Cards with Trend % */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="ed-stat group">
            <span className="label">{s.label}</span>
            <span className="value num">{s.value}</span>
            <div className="trend">
              {s.trend.up !== null ? (
                <span className={`num ${s.trend.up ? 'text-success-soft' : 'text-burgundy'}`}>
                  {s.trend.up ? '↑' : '↓'} {s.trend.value}%
                </span>
              ) : (
                <span className="truncate">{s.caption}</span>
              )}
              <ArrowUpRight className="w-3.5 h-3.5 trend-arrow shrink-0 text-fg-tertiary" />
            </div>
          </Link>
        ))}
      </section>

      {/* Alerts Panel */}
      {alerts.some((a) => a.count > 0) && (
        <section>
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title inline-flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('alerts.heading')}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {alerts.map((a) => {
              if (a.count === 0) return null;
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`bg-bg-elevated hover:bg-accent/10 transition-colors p-5 flex items-start gap-3 group ${a.color === 'danger' ? 'border-l-2 border-burgundy' : a.color === 'accent' ? 'border-l-2 border-accent' : 'border-l-2 border-line'}`}
                >
                  <Icon className={`w-4 h-4 mt-1 shrink-0 ${a.color === 'danger' ? 'text-burgundy' : a.color === 'accent' ? 'text-accent' : 'text-muted'}`} />
                  <div className="min-w-0">
                    <p className="serif font-light text-3xl num text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{a.count}</p>
                    <p className="text-xs text-muted mt-1">{a.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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

      {/* Activity Log + Governorates */}
      <section className="grid lg:grid-cols-2 gap-px bg-line">
        <div className="bg-bg-elevated p-8">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title inline-flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              {t('activityFeed.heading')}
            </span>
          </div>
          {recentActivity.length === 0 ? (
            <p className="ed-caption text-muted py-6">{t('activityFeed.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((l) => (
                <li key={l.id} className="flex items-start gap-3 text-sm">
                  <span className="w-1 h-1 mt-2.5 bg-accent rounded-full shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-frost">
                      <span className="font-medium">{l.admin?.name || '—'}</span>
                      <span className="text-muted mx-1">·</span>
                      <span className="text-accent text-xs uppercase tracking-wider">{l.action}</span>
                      {l.entity && <>
                        <span className="text-muted mx-1">·</span>
                        <span className="text-muted text-xs">{l.entity}</span>
                      </>}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5 num">
                      {new Date(l.createdAt).toLocaleString(isAr ? 'ar-IQ' : 'en-US')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/${locale}/admin/activity`} className="inline-flex items-center gap-1 mt-5 text-xs text-accent hover:underline">
            {t('activityFeed.viewAll')} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-bg-elevated p-8">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {t('governorates.heading')}
            </span>
          </div>
          {topGovernorates.length === 0 ? (
            <p className="ed-caption text-muted py-6">{t('governorates.empty')}</p>
          ) : (
            <ul className="space-y-4">
              {topGovernorates.map((g) => (
                <li key={g.gov}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm text-frost">{g.gov}</span>
                    <span className="text-xs text-muted num">
                      <span className="num">{g.count}</span> {t('governorates.orders')} · <span className="num">{g.total.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-1 bg-line relative overflow-hidden">
                    <div className="absolute inset-y-0 start-0 bg-accent" style={{ width: `${(g.count / maxGovCount) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function SnapshotItem({
  label,
  value,
  delta,
  yesterdayLabel,
}: {
  label: string;
  value: string;
  delta: { value: number; up: boolean | null };
  yesterdayLabel: string;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.25em] text-muted uppercase mb-2" style={{ letterSpacing: '0' }}>
        {label}
      </p>
      <p className="serif font-light text-3xl md:text-4xl num text-frost">{value}</p>
      <p className="text-xs mt-2 num">
        {delta.up === null ? (
          <span className="text-muted">—</span>
        ) : (
          <span className={delta.up ? 'text-success-soft' : 'text-burgundy'}>
            {delta.up ? '↑' : '↓'} {delta.value}%
          </span>
        )}
        <span className="text-muted ms-2">{yesterdayLabel}</span>
      </p>
    </div>
  );
}
