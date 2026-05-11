import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function OrdersAdmin({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.orders');
  const ts = await getTranslations('admin.orderActions.statusOpts');
  const isAr = locale === 'ar';
  const orders = await prisma.order.findMany({
    where: sp.status ? { status: sp.status } : {},
    include: { items: true, customer: true },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
        </div>
        <p className="ed-caption text-muted num hidden md:block">{orders.length} {t('th.order').toLowerCase()}</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/${locale}/admin/orders`}
          className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase border transition-colors ${!sp.status ? 'border-accent text-accent' : 'border-line text-muted hover:text-frost'}`}
          style={isAr ? { letterSpacing: 0, textTransform: 'none', fontSize: 12 } : {}}
        >
          {t('filterAll')}
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/${locale}/admin/orders?status=${s}`}
            className={`px-4 py-2 text-[10px] tracking-[0.25em] uppercase border transition-colors ${sp.status === s ? 'border-accent text-accent' : 'border-line text-muted hover:text-frost'}`}
            style={isAr ? { letterSpacing: 0, textTransform: 'none', fontSize: 12 } : {}}
          >
            {ts(s as any)}
          </Link>
        ))}
      </div>

      <div className="ed-card overflow-x-auto p-0">
        <table className="ed-table">
          <thead>
            <tr>
              <th>{t('th.order')}</th>
              <th>{t('th.customer')}</th>
              <th>{t('th.items')}</th>
              <th>{t('th.total')}</th>
              <th>{t('th.status')}</th>
              <th>{t('th.date')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <p className="ed-caption text-muted text-center py-8">{t('empty')}</p>
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="font-mono text-xs text-frost num-col">{o.number}</td>
                <td>
                  <div>{o.customer?.name || o.guestName}</div>
                  <div className="muted num-col">{o.customer?.phone || o.guestPhone}</div>
                </td>
                <td className="num-col">{o.items.length}</td>
                <td className="num-col">
                  <span className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    {o.total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted ms-1">{o.currency}</span>
                </td>
                <td>
                  <span className="ed-pill accent">{ts(o.status as any)}</span>
                </td>
                <td className="muted num-col">{new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}</td>
                <td>
                  <Link
                    href={`/${locale}/admin/orders/${o.id}`}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    {t('view')}
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
