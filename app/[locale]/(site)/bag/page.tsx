'use client';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
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

  if (items.length === 0) {
    return (
      <div className="pt-20 md:pt-32 pb-32">
        <div className="container-x text-center max-w-md mx-auto py-20">
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-4" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif text-5xl md:text-6xl font-light mb-4" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('emptyTitle')}</h1>
          <p className="text-fg-secondary serif italic font-light mb-10 text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('emptySub')}</p>
          <Link href={'/collections' as any} className="btn btn-secondary inline-flex">{t('emptyCta')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x">
        <header className={`mb-12 md:mb-16 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Items column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-px bg-border">
            {items.map((it, i) => (
              <div key={i} className="bg-bg p-6 md:p-8 flex gap-4 md:gap-6">
                <div className="w-24 h-32 md:w-32 md:h-40 shrink-0 bg-bg-elevated overflow-hidden">
                  {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="serif text-base md:text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? it.nameAr : it.nameEn}</div>
                  {it.size && <div className="text-xs text-fg-tertiary mt-1 num">{t('qty')}: {it.size}</div>}
                  <div className="mt-4 md:mt-6 flex items-center justify-between flex-wrap gap-3">
                    <div className="inline-flex items-center border border-border">
                      <button onClick={() => setQty(it.productId, it.qty - 1, it.variantId)} className="w-9 h-9 grid place-items-center hover:bg-bg-elevated"><Icon name="minus" size={14} /></button>
                      <span className="w-9 text-center text-sm num">{it.qty}</span>
                      <button onClick={() => setQty(it.productId, it.qty + 1, it.variantId)} className="w-9 h-9 grid place-items-center hover:bg-bg-elevated"><Icon name="plus" size={14} /></button>
                    </div>
                    <div className="text-base md:text-lg font-light">
                      <span className="num">{fmtNumber(it.priceIQD * it.qty)}</span> <span className="text-fg-tertiary text-xs ml-1">{isAr ? 'د.ع' : 'IQD'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => remove(it.productId, it.variantId)} className="text-fg-tertiary hover:text-fg self-start"><Icon name="close" size={18} /></button>
              </div>
            ))}
          </div>

          {/* Summary column — sticky */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28 p-6 md:p-8 border border-border bg-bg-elevated/40">
              <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-6" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {isAr ? 'ملخص الطلب' : 'ORDER SUMMARY'}
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-fg-secondary">{t('subtotal')}</span>
                  <span><span className="num">{fmtNumber(subIQD)}</span> {isAr ? 'د.ع' : 'IQD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-secondary">{t('shipping')}</span>
                  <span className="text-fg-secondary text-xs italic">{t('shippingValue')}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between items-baseline">
                  <span className="serif text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('total')}</span>
                  <span className="serif text-2xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    <span className="num">{fmtNumber(subIQD)}</span> <span className="text-sm text-fg-tertiary">{isAr ? 'د.ع' : 'IQD'}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-fg-tertiary mt-6">{t('note')}</p>
              <button onClick={() => router.push('/checkout' as any)} className="btn btn-champagne w-full mt-6">
                {t('checkout')}
              </button>
              <button className="btn btn-ghost w-full mt-3 text-fg-secondary text-xs">
                {t('concierge')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
