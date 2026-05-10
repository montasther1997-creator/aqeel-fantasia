'use client';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Price } from '@/components/ui/price';
import { ArrowUpRight } from 'lucide-react';

export function ProductCard({ p, index = 0 }: { p: any; index?: number }) {
  const locale = useLocale() as 'ar' | 'en';
  const t = useTranslations('drops');
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 8) * 0.05 }}
      className="group"
    >
      <Link href={`/drops/${p.slug}` as any} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-bg-secondary luxury-card">
          <img
            src={p.images[0]?.url}
            alt={locale === 'ar' ? p.nameAr : p.nameEn}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-75"
          />
          {p.images[1] && (
            <img src={p.images[1].url} alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110" />
          )}

          <span className="absolute top-3 left-3 rtl:right-3 rtl:left-auto text-[9px] font-mono text-frost/40 tracking-cinematic z-10">
            {p.sku || '—'}
          </span>

          <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto flex flex-col gap-1 z-10">
            {p.isNew && <span className="bg-frost text-bg-primary text-[9px] tracking-cinematic px-2 py-0.5">{t('newDrop')}</span>}
            {p.isLimited && <span className="bg-blood text-frost text-[9px] tracking-cinematic px-2 py-0.5">{t('limited')}</span>}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="glass p-3 flex items-center justify-between">
              <span className="text-[10px] tracking-cinematic text-frost">VIEW DETAILS</span>
              <ArrowUpRight className="w-4 h-4 text-frost" />
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-electric to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm tracking-cinematic uppercase truncate group-hover:text-electric transition-colors">
              {locale === 'ar' ? p.nameAr : p.nameEn}
            </h3>
            <p className="text-xs text-muted truncate mt-1">{locale === 'ar' ? p.taglineAr : p.taglineEn}</p>
          </div>
          <Price iqd={p.priceIQD} usd={p.priceUSD} compareIQD={p.compareIQD} compareUSD={p.compareUSD} className="text-sm shrink-0 font-display tracking-cinematic" />
        </div>
      </Link>
    </motion.div>
  );
}
