import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { fmtNumber } from '@/lib/utils';
import { Icon } from '@/components/atelier/icons';

export default async function MyOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await getTranslations('order');
  const ts = await getTranslations('admin.orderActions.statusOpts');
  const isAr = locale === 'ar';

  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });
  const orders = await prisma.order.findMany({
    where: { customerId: me!.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-4xl">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'الطلبات' : 'ORDERS'}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? 'طلباتي' : 'My orders'}</h1>
        </header>

        {orders.length === 0 ? (
          <p className="text-fg-secondary serif italic font-light text-lg">{isAr ? 'لا توجد طلبات بعد.' : 'No orders yet.'}</p>
        ) : (
          <div className="border-y border-border">
            {orders.map((o) => (
              <Link key={o.id} href={`/profile/orders/${o.id}` as any} className="flex items-center justify-between px-2 md:px-6 py-6 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors">
                <div>
                  <div className="font-mono text-xs text-fg-tertiary num">{o.number}</div>
                  <div className="text-sm md:text-base mt-1 num">{new Date(o.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}</div>
                  <div className="text-[10px] tracking-[0.3em] text-accent uppercase mt-1" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{ts(o.status as any)}</div>
                </div>
                <div className={isAr ? 'text-left' : 'text-right'}>
                  <div className="text-base md:text-lg"><span className="num">{fmtNumber(o.total)}</span> <span className="text-xs text-fg-tertiary">{o.currency === 'IQD' ? (isAr ? 'د.ع' : 'IQD') : '$'}</span></div>
                  <Icon name={isAr ? 'chevronL' : 'chevronR'} size={14} className="inline-block mt-2 text-fg-tertiary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
