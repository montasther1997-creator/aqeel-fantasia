'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ProductCard } from './product-card';

export function FeaturedDrops({ products }: { products: any[] }) {
  const t = useTranslations('drops');

  return (
    <section className="relative container-x py-32">
      <div className="absolute -top-20 right-0 rtl:left-0 rtl:right-auto editorial-num pointer-events-none select-none">
        DROP_01
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-end justify-between mb-16 relative z-10"
      >
        <div>
          <p className="text-xs tracking-cinematic text-electric mb-3 font-mono">— FEATURED · DROP_01</p>
          <h2 className="h-display text-5xl sm:text-7xl text-frost">{t('title')}</h2>
        </div>
        <Link href={'/drops' as any} className="hidden sm:flex items-center gap-2 text-xs tracking-cinematic uppercase text-muted hover:text-frost border-b border-line pb-1 group">
          {t('viewAll')}
          <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.slice(0, 8).map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>
    </section>
  );
}
