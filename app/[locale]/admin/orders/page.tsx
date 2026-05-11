import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function OrdersAdmin({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.orders');
  const ts = await getTranslations('admin.orderActions.statusOpts');
  const orders = await prisma.order.findMany({
    where: sp.status ? { status: sp.status } : {},
    include: { items: true, customer: true },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('count', { count: orders.length })}</h1>
      <div className="flex gap-2 flex-wrap mb-6">
        <Link href={`/${locale}/admin/orders`} className={`text-xs tracking-cinematic uppercase px-3 py-1 border ${!sp.status ? 'border-frost text-frost' : 'border-line text-muted'}`}>{t('filterAll')}</Link>
        {statuses.map((s) => (
          <Link key={s} href={`/${locale}/admin/orders?status=${s}`} className={`text-xs tracking-cinematic uppercase px-3 py-1 border ${sp.status === s ? 'border-frost text-frost' : 'border-line text-muted'}`}>{ts(s)}</Link>
        ))}
      </div>
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-xs tracking-cinematic text-muted">
            <tr>
              <th className="p-3 text-left">{t('th.order')}</th>
              <th className="p-3 text-left">{t('th.customer')}</th>
              <th className="p-3 text-left">{t('th.items')}</th>
              <th className="p-3 text-left">{t('th.total')}</th>
              <th className="p-3 text-left">{t('th.status')}</th>
              <th className="p-3 text-left">{t('th.date')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line/40 hover:bg-white/5">
                <td className="p-3 font-mono text-xs">{o.number}</td>
                <td className="p-3">{o.customer?.name || o.guestName} <span className="text-xs text-muted block">{o.customer?.phone || o.guestPhone}</span></td>
                <td className="p-3">{o.items.length}</td>
                <td className="p-3">{o.currency} {o.total.toLocaleString()}</td>
                <td className="p-3"><span className="text-[10px] tracking-cinematic uppercase text-electric">{ts(o.status as any)}</span></td>
                <td className="p-3 text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-3"><Link href={`/${locale}/admin/orders/${o.id}`} className="text-electric text-xs">{t('view')} →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
