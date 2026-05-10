'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { Editorial } from '@/components/atelier/editorial';
import { Icon } from '@/components/atelier/icons';
import { useCart } from '@/lib/cart-store';
import { fmtNumber } from '@/lib/utils';

export function ProductDetail({ product, related }: { product: any; related: any[] }) {
  const t = useTranslations('product');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string>('');
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const sizes = Array.from(new Set((product.variants || []).map((v: any) => v.size).filter(Boolean)));
  const images = product.images || [];
  const name = isAr ? product.nameAr : product.nameEn;
  const meta = isAr ? product.taglineAr : product.taglineEn;
  const desc = isAr ? product.descAr : product.descEn;

  const onAdd = (buyNow = false) => {
    if (sizes.length && !size) return;
    const variant = (product.variants || []).find((v: any) => v.size === size);
    add({
      productId: product.id, variantId: variant?.id,
      slug: product.slug, nameAr: product.nameAr, nameEn: product.nameEn,
      image: images[0]?.url,
      size: variant?.size, qty: 1,
      priceIQD: variant?.priceIQD || product.priceIQD,
      priceUSD: variant?.priceUSD || product.priceUSD,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    if (buyNow) router.push('/bag' as any);
  };

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" />

        {/* Hero image */}
        <div className="relative">
          <Editorial variant="v2" ratio="4/5" src={images[imgIdx]?.url} alt={name} />
        </div>

        {/* Thumbs */}
        {images.length > 1 && (
          <div className="px-6 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {images.map((im: any, i: number) => (
              <button key={im.id} onClick={() => setImgIdx(i)} className={`shrink-0 w-14 h-18 overflow-hidden border ${i === imgIdx ? 'border-accent' : 'border-border'}`}>
                <img src={im.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Title block */}
        <div className={`px-6 pt-8 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow">{meta}</div>
          <h1 className="serif text-3xl font-normal mt-2" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.01em' }}>{name}</h1>
          <div className="mt-3 font-light text-fg-secondary">
            <span className="num">{fmtNumber(product.priceIQD)}</span> {isAr ? 'د.ع' : 'IQD'}
          </div>
        </div>

        {/* Stylist note */}
        {desc && (
          <section className={`mx-6 my-8 py-6 border-y border-border ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="t-eyebrow mb-3">{t('stylistEye')}</div>
            <p className="serif text-base leading-relaxed font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : { fontStyle: 'italic' }}>
              {desc}
            </p>
          </section>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <section className={`px-6 mb-6 ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="t-eyebrow mb-4">{t('size')}</div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button key={String(s)} onClick={() => setSize(String(s))}
                  className={`min-w-[3rem] h-12 px-4 border text-sm num ${size === s ? 'border-fg bg-fg text-bg' : 'border-border text-fg hover:border-fg'}`}>
                  {String(s)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* CTAs */}
        <section className="px-6 pb-8 space-y-3">
          <button onClick={() => onAdd(false)} className={`btn btn-secondary w-full ${!size && sizes.length ? 'opacity-50' : ''}`} disabled={!size && sizes.length > 0}>
            {added ? <><Icon name="check" size={14} /> {t('added')}</> : t('add')}
          </button>
          <button onClick={() => onAdd(true)} className="btn btn-champagne w-full">
            {t('reserve')}
          </button>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="px-6 pt-6 pb-12">
            <div className="t-eyebrow mb-5">{t('related')}</div>
            <div className="grid grid-cols-2 gap-3">
              {related.slice(0, 2).map((r) => (
                <a key={r.id} href={`/${locale}/product/${r.slug}`} className="pcard block">
                  <div className="img-wrap"><Editorial variant="v4" ratio="4/5" src={r.images[0]?.url} alt={isAr ? r.nameAr : r.nameEn} /></div>
                  <div className="name">{isAr ? r.nameAr : r.nameEn}</div>
                  <div className="meta">{isAr ? r.taglineAr : r.taglineEn}</div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
