'use client';
import { useLocale } from 'next-intl';
import { ProductCard } from './product-card';

export function StylistSection({ products, customerName }: { products: any[]; customerName?: string }) {
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  if (!products.length) return null;

  return (
    <section className="container-x py-20 md:py-32 border-y border-border">
      <div className={`flex items-end justify-between mb-12 md:mb-16 ${isAr ? '' : ''}`}>
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? '✦ مختار لك' : '✦ SELECTED FOR YOU'}
          </div>
          <h2 className="serif text-3xl md:text-5xl lg:text-6xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {customerName ? (isAr ? `قطعٌ تليق بك، ${customerName}` : `Pieces for you, ${customerName}`) : (isAr ? 'قطعٌ تليق بك' : 'Pieces for you')}
          </h2>
          <p className="serif italic text-fg-secondary text-base md:text-lg mt-3 font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
            {isAr ? 'استناداً إلى تفضيلاتك وما يلائم ذوقك.' : 'Based on your preferences and what flatters your taste.'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
