import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { fmtNumber } from '@/lib/utils';

const STAGES = ['placed', 'tailored', 'collected', 'transit', 'outDelivery', 'delivered'] as const;

const stageIndexForStatus = (status: string): number => {
  switch (status) {
    case 'pending': return 0;
    case 'paid':
    case 'processing': return 1;
    case 'shipped': return 3;
    case 'delivered': return 5;
    default: return 0;
  }
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const t = await getTranslations('order');
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.customerId !== me!.id) notFound();

  const stageIdx = stageIndexForStatus(order.status);
  let shipAddr: any = {};
  try { shipAddr = JSON.parse(order.shipAddress || '{}'); } catch {}

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" />

        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow num">{order.number}</div>
          <h1 className="serif text-4xl font-light mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('headline')}</h1>
          <p className="text-fg-secondary text-sm mt-2">
            {t('subEta')} · <span className="num">{new Date(Date.now() + 4 * 86400000).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' })}</span>
          </p>
          <p className="text-xs text-fg-tertiary mt-1">{t('placed')} <span className="num">{new Date(order.createdAt).toLocaleString(isAr ? 'ar-IQ' : 'en-US')}</span></p>
        </header>

        {/* Timeline */}
        <section className={`px-6 py-8 border-y border-border ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow mb-6">{t('timelineTitle')}</div>
          <div className="relative">
            <div className={`absolute top-2 bottom-2 ${isAr ? 'right-2' : 'left-2'} w-px bg-border`} />
            <div className="space-y-6">
              {STAGES.map((s, i) => {
                const isCurrent = i === stageIdx;
                const isDone = i < stageIdx;
                return (
                  <div key={s} className={`relative ${isAr ? 'pr-8' : 'pl-8'}`}>
                    <span className={`absolute top-1 ${isAr ? 'right-0' : 'left-0'} w-4 h-4 rounded-full border-2 ${isCurrent ? 'border-accent bg-accent' : isDone ? 'border-fg bg-fg' : 'border-border bg-bg'}`} />
                    <div className={`text-sm ${isCurrent ? 'text-fg font-medium' : isDone ? 'text-fg' : 'text-fg-tertiary'}`}>
                      {t(`stages.${s}` as any)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className={`px-6 py-6 border-b border-border ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow mb-2">{t('addressLabel')}</div>
          <div className="text-sm">{shipAddr.governorate} · {shipAddr.city}</div>
          {shipAddr.area && <div className="text-xs text-fg-tertiary mt-1">{shipAddr.area} {shipAddr.street}</div>}
        </section>

        {/* Items */}
        <section className="border-b border-border">
          {order.items.map((it) => (
            <div key={it.id} className="px-6 py-4 flex justify-between items-center gap-3 border-b border-border last:border-0">
              <div className="w-12 h-16 bg-bg-elevated shrink-0">{it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate serif" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? it.nameAr : it.nameEn}</div>
                <div className="text-xs text-fg-tertiary num">x{it.qty} {it.size && `· ${it.size}`}</div>
              </div>
              <div className="text-sm shrink-0"><span className="num">{fmtNumber(it.totalIQD)}</span></div>
            </div>
          ))}
        </section>

        {/* Total */}
        <section className="px-6 py-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-fg-tertiary">{isAr ? 'المجموع' : 'Subtotal'}</span><span><span className="num">{fmtNumber(order.subtotal)}</span></span></div>
          {order.shipping > 0 && <div className="flex justify-between"><span className="text-fg-tertiary">{isAr ? 'الشحن' : 'Shipping'}</span><span><span className="num">{fmtNumber(order.shipping)}</span></span></div>}
          {order.discount > 0 && <div className="flex justify-between text-accent"><span>{isAr ? 'خصم' : 'Discount'}</span><span>-<span className="num">{fmtNumber(order.discount)}</span></span></div>}
          <div className="border-t border-border pt-3 flex justify-between serif text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
            <span><span className="num">{fmtNumber(order.total)}</span> {order.currency === 'IQD' ? (isAr ? 'د.ع' : 'IQD') : '$'}</span>
          </div>
        </section>

        <section className="px-6 pb-12 pt-4 text-center">
          <a href="https://instagram.com/shopfantasia1" className="text-xs text-fg-tertiary underline underline-offset-4">{t('contactConcierge')}</a>
        </section>
      </div>
    </div>
  );
}
