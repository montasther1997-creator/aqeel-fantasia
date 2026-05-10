import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { fmtNumber } from '@/lib/utils';

const STAGES = ['placed', 'tailored', 'collected', 'transit', 'outDelivery', 'delivered'] as const;

const stageIdxFor = (status: string): number => {
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

  const stageIdx = stageIdxFor(order.status);
  let shipAddr: any = {};
  try { shipAddr = JSON.parse(order.shipAddress || '{}'); } catch {}

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-4xl">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3 num" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{order.number}</div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('headline')}</h1>
          <p className="text-fg-secondary text-base md:text-lg mt-3">
            {t('subEta')} · <span className="num">{new Date(Date.now() + 4 * 86400000).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' })}</span>
          </p>
          <p className="text-xs text-fg-tertiary mt-1">{t('placed')} <span className="num">{new Date(order.createdAt).toLocaleString(isAr ? 'ar-IQ' : 'en-US')}</span></p>
        </header>

        {/* Timeline */}
        <section className={`py-10 md:py-12 border-y border-border ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-8" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('timelineTitle')}
          </div>
          <div className="relative max-w-2xl">
            <div className={`absolute top-3 bottom-3 ${isAr ? 'right-3' : 'left-3'} w-px bg-border`} />
            <div className="space-y-8">
              {STAGES.map((s, i) => {
                const isCurrent = i === stageIdx;
                const isDone = i < stageIdx;
                return (
                  <div key={s} className={`relative ${isAr ? 'pr-10' : 'pl-10'}`}>
                    <span className={`absolute top-1.5 ${isAr ? 'right-0' : 'left-0'} w-6 h-6 rounded-full border-2 ${isCurrent ? 'border-accent bg-accent' : isDone ? 'border-fg bg-fg' : 'border-border bg-bg'}`} />
                    <div className={`text-base md:text-lg ${isCurrent ? 'text-fg font-medium' : isDone ? 'text-fg' : 'text-fg-tertiary'}`}>
                      {t(`stages.${s}` as any)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Shipping address */}
        <section className={`py-8 border-b border-border grid md:grid-cols-2 gap-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{t('addressLabel')}</div>
            <div className="text-base">{shipAddr.governorate} · {shipAddr.city}</div>
            {shipAddr.area && <div className="text-sm text-fg-tertiary mt-1">{shipAddr.area} {shipAddr.street}</div>}
          </div>
        </section>

        {/* Items */}
        <section className="border-b border-border">
          {order.items.map((it) => (
            <div key={it.id} className="py-5 flex justify-between items-center gap-4 border-b border-border last:border-0">
              <div className="w-16 h-20 bg-bg-elevated shrink-0">{it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}</div>
              <div className="flex-1 min-w-0">
                <div className="serif text-base md:text-lg truncate" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? it.nameAr : it.nameEn}</div>
                <div className="text-xs text-fg-tertiary num">×{it.qty} {it.size && `· ${it.size}`}</div>
              </div>
              <div className="text-base shrink-0"><span className="num">{fmtNumber(it.totalIQD)}</span></div>
            </div>
          ))}
        </section>

        {/* Total */}
        <section className="py-8 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-fg-tertiary">{isAr ? 'المجموع' : 'Subtotal'}</span><span><span className="num">{fmtNumber(order.subtotal)}</span></span></div>
          {order.shipping > 0 && <div className="flex justify-between"><span className="text-fg-tertiary">{isAr ? 'الشحن' : 'Shipping'}</span><span><span className="num">{fmtNumber(order.shipping)}</span></span></div>}
          {order.discount > 0 && <div className="flex justify-between text-accent"><span>{isAr ? 'خصم' : 'Discount'}</span><span>-<span className="num">{fmtNumber(order.discount)}</span></span></div>}
          <div className="border-t border-border pt-4 flex justify-between serif text-2xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
            <span><span className="num">{fmtNumber(order.total)}</span> <span className="text-sm text-fg-tertiary">{order.currency === 'IQD' ? (isAr ? 'د.ع' : 'IQD') : '$'}</span></span>
          </div>
        </section>

        <section className="pt-6 text-center">
          <a href="https://instagram.com/shopfantasia1" className="text-xs text-fg-tertiary underline underline-offset-4 hover:text-accent">{t('contactConcierge')}</a>
        </section>
      </div>
    </div>
  );
}
