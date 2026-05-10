import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { Link } from '@/i18n/routing';
import { fmtNumber } from '@/lib/utils';
import { Icon } from '@/components/atelier/icons';

export default async function MyOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('order');
  const isAr = locale === 'ar';

  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });
  const orders = await prisma.order.findMany({
    where: { customerId: me!.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" />

        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow">{isAr ? 'الطلبات' : 'ORDERS'}</div>
          <h1 className="serif text-4xl font-light mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? 'طلباتي' : 'My orders'}</h1>
        </header>

        {orders.length === 0 ? (
          <p className="px-6 text-fg-secondary serif italic font-light">{isAr ? 'لا توجد طلبات بعد.' : 'No orders yet.'}</p>
        ) : (
          <div className="border-y border-border">
            {orders.map((o) => (
              <Link key={o.id} href={`/profile/orders/${o.id}` as any} className="flex items-center justify-between px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors">
                <div>
                  <div className="font-mono text-xs text-fg-tertiary">{o.number}</div>
                  <div className="text-sm mt-1">{new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}</div>
                  <div className="text-[10px] tracking-[0.2em] text-accent uppercase mt-1" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{o.status}</div>
                </div>
                <div className="text-right rtl:text-left">
                  <div className="text-sm"><span className="num">{fmtNumber(o.total)}</span> {o.currency === 'IQD' ? (isAr ? 'د.ع' : 'IQD') : '$'}</div>
                  <Icon name={isAr ? 'chevronL' : 'chevronR'} size={14} className="inline-block mt-1 text-fg-tertiary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
