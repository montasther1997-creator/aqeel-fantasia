import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { formatIQD, formatUSD } from '@/lib/utils';

export default async function OrdersPage() {
  const c = await getCustomer();
  if (!c) redirect({ href: '/account/login', locale: 'ar' });
  const locale = (await getLocale()) as 'ar' | 'en';
  const orders = await prisma.order.findMany({
    where: { customerId: c!.id }, include: { items: true }, orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pt-32 pb-20 container-x">
      <h1 className="h-display text-5xl mb-10">ORDERS</h1>
      {orders.length === 0 ? <p className="text-muted">—</p> : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="glass p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm">{o.number}</p>
                  <p className="text-xs text-muted mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className="text-xs tracking-cinematic uppercase text-electric">{o.status}</span>
                <span className="text-sm">{o.currency === 'IQD' ? formatIQD(o.total, locale) : formatUSD(o.total, locale)}</span>
              </div>
              <div className="mt-4 text-xs text-muted">{o.items.length} items</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
