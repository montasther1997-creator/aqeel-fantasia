import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { OrderActions } from '@/components/admin/order-actions';
import { getTranslations } from 'next-intl/server';

export default async function OrderDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.orderDetail');
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true, address: true },
  });
  if (!order) notFound();
  const ship = order.shipAddress ? JSON.parse(order.shipAddress) : null;

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow', { number: order.number })}</p>
      <h1 className="h-display text-3xl mt-2 mb-6">{order.currency} {order.total.toLocaleString()}</h1>

      <OrderActions id={order.id} status={order.status} paymentStatus={order.paymentStatus} trackingCode={order.trackingCode || ''} />

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— {t('sections.items')}</h3>
          <div className="divide-y divide-line">
            {order.items.map((it) => (
              <div key={it.id} className="py-3 flex gap-3 items-center">
                <div className="w-12 h-16 bg-bg-secondary shrink-0">{it.image && <img src={it.image} className="w-full h-full object-cover" />}</div>
                <div className="flex-1">
                  <p className="text-sm">{it.nameEn}</p>
                  <p className="text-xs text-muted">x{it.qty} · {it.size || '—'}</p>
                </div>
                <p className="text-sm">{order.currency} {(order.currency === 'IQD' ? it.totalIQD : it.totalUSD).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass p-6">
            <h3 className="text-xs tracking-cinematic text-muted mb-3">— {t('sections.customer')}</h3>
            <p className="text-sm">{order.customer?.name || order.guestName}</p>
            <p className="text-xs text-muted">{order.customer?.phone || order.guestPhone}</p>
            {(order.customer?.email || order.guestEmail) && <p className="text-xs text-muted">{order.customer?.email || order.guestEmail}</p>}
          </div>
          {ship && (
            <div className="glass p-6">
              <h3 className="text-xs tracking-cinematic text-muted mb-3">— {t('sections.shipping')}</h3>
              <div className="text-sm space-y-1 text-frost/80">
                <p>{ship.country}, {ship.governorate}</p>
                <p>{ship.city} {ship.area}</p>
                {ship.street && <p>{ship.street}</p>}
                {ship.details && <p className="text-muted text-xs">{ship.details}</p>}
              </div>
            </div>
          )}
          <div className="glass p-6">
            <h3 className="text-xs tracking-cinematic text-muted mb-3">— {t('sections.totals')}</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted">{t('labels.subtotal')}</span><span>{order.currency} {order.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted">{t('labels.shipping')}</span><span>{order.shipping}</span></div>
              <div className="flex justify-between"><span className="text-muted">{t('labels.discount')}</span><span>{order.discount}</span></div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-line"><span>{t('labels.total')}</span><span>{order.currency} {order.total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
