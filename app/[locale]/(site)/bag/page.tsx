'use client';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { Editorial } from '@/components/atelier/editorial';
import { Icon } from '@/components/atelier/icons';
import { fmtNumber } from '@/lib/utils';

export default function BagPage() {
  const t = useTranslations('bag');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subIQD = items.reduce((n, x) => n + x.priceIQD * x.qty, 0);

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" />

        {items.length === 0 ? (
          <div className={`px-8 pt-24 text-center`}>
            <div className="t-eyebrow mb-4">{t('eyebrow')}</div>
            <h1 className="serif text-4xl font-light mb-4" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('emptyTitle')}</h1>
            <p className="text-fg-secondary serif italic font-light mb-10" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('emptySub')}</p>
            <Link href={'/collections' as any} className="btn btn-secondary inline-flex">
              {t('emptyCta')}
            </Link>
          </div>
        ) : (
          <>
            <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="t-eyebrow">{t('eyebrow')}</div>
              <h1 className="serif text-4xl font-light mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('title')}</h1>
            </header>

            <div className="space-y-px bg-border">
              {items.map((it, i) => (
                <div key={i} className="bg-bg p-6 flex gap-4">
                  <div className="w-20 h-24 shrink-0 bg-bg-elevated overflow-hidden">
                    {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="serif text-base" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? it.nameAr : it.nameEn}</div>
                    {it.size && <div className="text-xs text-fg-tertiary mt-1 num">{t('qty')}: {it.size}</div>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={() => setQty(it.productId, it.qty - 1, it.variantId)} className="w-8 h-8 grid place-items-center"><Icon name="minus" size={14} /></button>
                        <span className="w-8 text-center text-sm num">{it.qty}</span>
                        <button onClick={() => setQty(it.productId, it.qty + 1, it.variantId)} className="w-8 h-8 grid place-items-center"><Icon name="plus" size={14} /></button>
                      </div>
                      <div className="text-sm font-light">
                        <span className="num">{fmtNumber(it.priceIQD * it.qty)}</span> {isAr ? 'د.ع' : 'IQD'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => remove(it.productId, it.variantId)} className="text-fg-tertiary self-start"><Icon name="close" size={16} /></button>
                </div>
              ))}
            </div>

            <section className="px-6 pt-8 pb-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-fg-tertiary">{t('subtotal')}</span><span><span className="num">{fmtNumber(subIQD)}</span> {isAr ? 'د.ع' : 'IQD'}</span></div>
              <div className="flex justify-between"><span className="text-fg-tertiary">{t('shipping')}</span><span className="text-fg-secondary">{t('shippingValue')}</span></div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between serif text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                <span>{t('total')}</span>
                <span><span className="num">{fmtNumber(subIQD)}</span> {isAr ? 'د.ع' : 'IQD'}</span>
              </div>
              <p className="text-[11px] text-fg-tertiary pt-2">{t('note')}</p>
            </section>

            <div className="px-6 pb-10 space-y-3">
              <button onClick={() => router.push('/checkout' as any)} className="btn btn-champagne w-full">
                {t('checkout')}
              </button>
              <button className="btn btn-ghost w-full text-fg-secondary text-xs">
                {t('concierge')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
