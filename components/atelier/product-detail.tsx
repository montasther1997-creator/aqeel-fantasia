'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Editorial } from '@/components/atelier/editorial';
import { Icon } from '@/components/atelier/icons';
import { useCart } from '@/lib/cart-store';
import { fmtNumber } from '@/lib/utils';
import { ProductCard } from './product-card';

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
    <div className="pt-20 md:pt-24 pb-20">
      <div className="container-x">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left column: gallery */}
          <div>
            <div className="aspect-[3/4] bg-bg-elevated overflow-hidden">
              <Editorial variant="v2" ratio="auto" src={images[imgIdx]?.url} alt={name} className="w-full h-full" />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {images.map((im: any, i: number) => (
                  <button key={im.id} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden border ${i === imgIdx ? 'border-accent' : 'border-border'}`}>
                    <img src={im.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right column: info (sticky on desktop) */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className={isAr ? 'text-right' : 'text-left'}>
              <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {meta}
              </div>
              <h1 className="serif text-3xl md:text-5xl font-light leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.01em' }}>
                {name}
              </h1>
              <div className="mt-4 text-xl md:text-2xl font-light">
                <span className="num">{fmtNumber(product.priceIQD)}</span> <span className="text-fg-tertiary text-sm ml-2">{isAr ? 'د.ع' : 'IQD'}</span>
              </div>

              {desc && (
                <section className={`mt-10 py-8 border-y border-border`}>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                    {t('stylistEye')}
                  </div>
                  <p className="serif text-base md:text-lg leading-relaxed font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : { fontStyle: 'italic' }}>
                    {desc}
                  </p>
                </section>
              )}

              {sizes.length > 0 && (
                <section className="mt-8">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-4" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                    {t('size')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button key={String(s)} onClick={() => setSize(String(s))}
                        className={`min-w-[3.5rem] h-12 px-4 border text-sm num transition-colors ${size === s ? 'border-fg bg-fg text-bg' : 'border-border text-fg hover:border-fg'}`}>
                        {String(s)}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <div className="mt-10 space-y-3">
                <button onClick={() => onAdd(false)} className={`btn btn-secondary w-full ${!size && sizes.length ? 'opacity-50' : ''}`} disabled={!size && sizes.length > 0}>
                  {added ? <><Icon name="check" size={14} /> {t('added')}</> : t('add')}
                </button>
                <button onClick={() => onAdd(true)} className="btn btn-champagne w-full">
                  {t('reserve')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-32">
            <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-6" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('related')}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {related.map((r) => <ProductCard key={r.id} p={r} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
