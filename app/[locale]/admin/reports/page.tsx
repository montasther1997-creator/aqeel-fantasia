import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { Download } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

function parseDate(s: string | undefined, fallback: Date): Date {
  if (!s) return fallback;
  const d = new Date(s);
  return isNaN(d.getTime()) ? fallback : d;
}

export default async function ReportsAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.reports');
  const ts = await getTranslations('admin.orderActions.statusOpts');
  const isAr = locale === 'ar';

  const today = new Date();
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const from = parseDate(sp.from, monthAgo);
  const toRaw = parseDate(sp.to, today);
  const to = new Date(toRaw.getFullYear(), toRaw.getMonth(), toRaw.getDate(), 23, 59, 59);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = toRaw.toISOString().slice(0, 10);

  const rangeWhere = { createdAt: { gte: from, lte: to } };

  const bestSellersAgg = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { qty: true, totalIQD: true, totalUSD: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: 10,
    where: { order: rangeWhere },
  });
  const productIds = bestSellersAgg.map((x) => x.productId);
  const productMap = new Map((await prisma.product.findMany({ where: { id: { in: productIds } } })).map((p) => [p.id, p]));
  const bestSellers = bestSellersAgg.map((x) => ({ ...x, product: productMap.get(x.productId) }));

  const topCustomers = await prisma.customer.findMany({
    orderBy: { totalSpent: 'desc' }, take: 10, include: { _count: { select: { orders: true } } },
  });

  const byStatus = await prisma.order.groupBy({ by: ['status'], _count: true, _sum: { total: true }, where: rangeWhere });

  const since7 = new Date(Date.now() - 7 * 86400000);
  const since30 = new Date(Date.now() - 30 * 86400000);
  const [r7, r30, all, range] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { createdAt: { gte: since7 } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { createdAt: { gte: since30 } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: rangeWhere }),
  ]);

  const csvQuery = `?from=${fromStr}&to=${toStr}`;

  const buckets: { label: string; data: any }[] = [
    { label: `${t('range')} (${fromStr} → ${toStr})`, data: range },
    { label: t('last7d'), data: r7 },
    { label: t('last30d'), data: r30 },
    { label: t('allTime'), data: all },
  ];

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
        </div>
      </header>

      <form className="ed-card flex flex-wrap items-end gap-4">
        <div>
          <label className="ed-eye block mb-2">{t('from')}</label>
          <input type="date" name="from" defaultValue={fromStr} className="input num" />
        </div>
        <div>
          <label className="ed-eye block mb-2">{t('to')}</label>
          <input type="date" name="to" defaultValue={toStr} className="input num" />
        </div>
        <button className="btn-primary">{t('apply')}</button>
        <a href={`/api/admin/reports/export${csvQuery}`} className="btn-ghost inline-flex items-center gap-2 ms-auto">
          <Download className="w-4 h-4" /> {t('exportCsv')}
        </a>
      </form>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
        {buckets.map((b, i) => (
          <div key={i} className="ed-stat">
            <span className="label">{b.label}</span>
            <span className="value num">{(b.data._sum.total || 0).toLocaleString()}</span>
            <div className="trend">
              <span className="num">{b.data._count} {t('orders')}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-px bg-line">
        <div className="bg-bg-elevated p-8">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title">{t('bestSellers')}</span>
          </div>
          {bestSellers.length === 0 ? (
            <p className="ed-caption text-muted py-6">{t('noBestSellers')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {bestSellers.map((b) => (
                <li key={b.productId} className="py-4 flex justify-between items-baseline gap-4">
                  <span className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    {(isAr ? b.product?.nameAr : b.product?.nameEn) || b.productId}
                  </span>
                  <span className="text-xs text-muted whitespace-nowrap">
                    <span className="num">{b._sum.qty}</span> {t('sold')} · <span className="num">{b._sum.totalIQD?.toLocaleString()}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-bg-elevated p-8">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title">{t('topCustomers')}</span>
          </div>
          {topCustomers.length === 0 ? (
            <p className="ed-caption text-muted py-6">{t('noTopCustomers')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {topCustomers.map((c) => (
                <li key={c.id} className="py-4 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{c.name}</p>
                    <p className="text-xs text-muted font-mono num">{c.phone}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="serif text-base text-frost num" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                      ${c.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted num">{c._count.orders} {t('orders')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-bg-elevated p-8 lg:col-span-2">
          <div className="ed-section-head">
            <span className="em-dash" />
            <span className="title">{t('ordersByStatus')}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {byStatus.map((s) => (
              <div key={s.status} className="bg-bg-elevated p-5">
                <p className="ed-pill accent">{ts(s.status as any)}</p>
                <p className="serif font-light text-3xl mt-3 num" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                  {s._count}
                </p>
                <p className="text-xs text-muted mt-1 num">{(s._sum.total || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
