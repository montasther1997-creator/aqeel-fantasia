'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Price } from '@/components/ui/price';
import { useCart } from '@/lib/cart-store';
import { useRouter } from '@/i18n/routing';
import { ProductCard } from './product-card';
import { ShoppingBag, Check } from 'lucide-react';
import { WishlistButton } from './wishlist-button';

export function ProductDetail({ product, related }: { product: any; related: any[] }) {
  const locale = useLocale() as 'ar' | 'en';
  const t = useTranslations('drops');
  const tc = useTranslations('cart');
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [size, setSize] = useState<string>('');
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const variants = product.variants || [];
  const sizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)));
  const images = product.images || [];

  const onAdd = (buyNow = false) => {
    if (sizes.length && !size) return;
    const variant = variants.find((v: any) => v.size === size);
    add({
      productId: product.id,
      variantId: variant?.id,
      slug: product.slug,
      nameAr: product.nameAr, nameEn: product.nameEn,
      image: images[0]?.url,
      size: variant?.size,
      qty: 1,
      priceIQD: variant?.priceIQD || product.priceIQD,
      priceUSD: variant?.priceUSD || product.priceUSD,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    if (buyNow) router.push('/cart' as any);
  };

  return (
    <div className="pt-24">
      <div className="container-x py-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* gallery */}
        <div className="space-y-4">
          <motion.div
            key={imgIdx}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="aspect-[3/4] bg-bg-secondary overflow-hidden"
          >
            <img src={images[imgIdx]?.url} alt="" className="w-full h-full object-cover" />
          </motion.div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img: any, i: number) => (
              <button key={img.id} onClick={() => setImgIdx(i)}
                className={`aspect-square overflow-hidden border ${i === imgIdx ? 'border-frost' : 'border-line'}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs tracking-cinematic text-muted">
            {product.collection ? (locale === 'ar' ? product.collection.nameAr : product.collection.nameEn) : 'AQEEL FANTASIA'}
          </p>
          <h1 className="h-display text-4xl sm:text-5xl mt-3">{locale === 'ar' ? product.nameAr : product.nameEn}</h1>
          <p className="text-muted mt-3">{locale === 'ar' ? product.taglineAr : product.taglineEn}</p>

          <div className="mt-6">
            <Price iqd={product.priceIQD} usd={product.priceUSD} compareIQD={product.compareIQD} compareUSD={product.compareUSD} className="text-2xl font-display tracking-cinematic" />
          </div>

          {sizes.length > 0 && (
            <div className="mt-8">
              <p className="label">{t('size')}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button key={String(s)} onClick={() => setSize(String(s))}
                    className={`min-w-[3rem] h-10 px-3 border text-sm tracking-cinematic ${size === s ? 'border-frost bg-frost text-bg-primary' : 'border-line text-frost hover:border-frost'}`}>
                    {String(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={() => onAdd(false)} className="btn-ghost flex-1">
              {added ? <><Check className="w-4 h-4" /> ✓</> : <><ShoppingBag className="w-4 h-4" /> {t('addToCart')}</>}
            </button>
            <button onClick={() => onAdd(true)} className="btn-primary flex-1">{t('buyNow')}</button>
            <WishlistButton productId={product.id} />
          </div>

          <div className="mt-12 space-y-6 text-sm leading-relaxed">
            <div>
              <p className="label">{t('description')}</p>
              <p className="text-frost/80">{locale === 'ar' ? product.descAr : product.descEn}</p>
            </div>
            <div>
              <p className="label">{t('details')}</p>
              <ul className="text-muted space-y-1">
                <li>SKU: {product.sku}</li>
                <li>{t('shipping')}: 1-5 {locale === 'ar' ? 'أيام' : 'days'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="container-x py-20 border-t border-line mt-20">
          <h3 className="h-display text-2xl mb-8">{locale === 'ar' ? 'مزيد' : 'MORE'}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
