import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { formatIQD, formatUSD } from '@/lib/utils';

export default async function AccountPage() {
  const c = await getCustomer();
  if (!c) redirect({ href: '/account/login', locale: 'ar' });
  const t = await getTranslations('account');
  const locale = (await getLocale()) as 'ar' | 'en';
  const customer = await prisma.customer.findUnique({
    where: { id: c!.id },
    include: { addresses: true, orders: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });
  if (!customer) redirect({ href: '/account/login', locale: 'ar' });

  return (
    <div className="pt-32 pb-20 container-x">
      <p className="text-xs tracking-cinematic text-muted">— MEMBER</p>
      <h1 className="h-display text-5xl sm:text-7xl">{customer!.name}</h1>
      <p className="text-muted mt-2 font-mono text-sm">{customer!.phone}</p>

      <div className="mt-12 grid lg:grid-cols-4 gap-6">
        <Link href={'/account/orders' as any} className="glass p-6 hover:border-frost/30">
          <p className="text-xs tracking-cinematic text-muted">{t('orders')}</p>
          <p className="h-display text-4xl mt-2">{customer!.orders.length}</p>
        </Link>
        <Link href={'/account/addresses' as any} className="glass p-6 hover:border-frost/30">
          <p className="text-xs tracking-cinematic text-muted">{t('addresses')}</p>
          <p className="h-display text-4xl mt-2">{customer!.addresses.length}</p>
        </Link>
        <Link href={'/account/wishlist' as any} className="glass p-6 hover:border-frost/30">
          <p className="text-xs tracking-cinematic text-muted">{t('wishlist')}</p>
          <p className="h-display text-4xl mt-2">♡</p>
        </Link>
        <div className="glass p-6">
          <p className="text-xs tracking-cinematic text-muted">VIP TIER</p>
          <p className="h-display text-4xl mt-2 uppercase">{customer!.vipTier}</p>
        </div>
      </div>

      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="h-display text-3xl">{t('orders')}</h2>
          <Link href={'/account/orders' as any} className="text-xs tracking-cinematic text-muted hover:text-frost">→</Link>
        </div>
        {customer!.orders.length === 0 ? (
          <p className="text-muted text-sm">—</p>
        ) : (
          <div className="space-y-2">
            {customer!.orders.map((o) => (
              <div key={o.id} className="glass p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs">{o.number}</p>
                  <p className="text-xs text-muted mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="text-sm">{o.currency === 'IQD' ? formatIQD(o.total, locale) : formatUSD(o.total, locale)}</p>
                  <p className="text-xs uppercase tracking-cinematic text-electric mt-1">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <form action="/api/account/logout" method="post" className="mt-16">
        <button className="btn-ghost">LOGOUT</button>
      </form>
    </div>
  );
}
