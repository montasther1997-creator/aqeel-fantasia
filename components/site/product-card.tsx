'use client';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Price } from '@/components/ui/price';
import { useState } from 'react';

export function ProductCard({ p, index = 0 }: { p: any; index?: number }) {
  const locale = useLocale() as 'ar' | 'en';
  const t = useTranslations('drops');
  const [hovered, setHovered] = useState(false);
  const name = locale === 'ar' ? p.nameAr : p.nameEn;
  const tagline = locale === 'ar' ? p.taglineAr : p.taglineEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: (index % 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/drops/${p.slug}` as any} className="block">
        {/* Image frame */}
        <div className="relative aspect-[3/4] overflow-hidden bg-bg-secondary">
          {/* Inner border that animates */}
          <div className="absolute inset-3 z-20 pointer-events-none border border-frost/0 group-hover:border-frost/20 transition-all duration-700" />

          <motion.img
            src={p.images[0]?.url}
            alt={name}
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {p.images[1] && (
            <motion.img
              src={p.images[1].url}
              alt=""
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700" />

          {/* SKU watermark */}
          <span className="absolute top-4 left-4 rtl:right-4 rtl:left-auto text-[9px] font-mono tracking-[0.3em] text-frost/40 z-10">
            {p.sku || '—'}
          </span>

          {/* Badges */}
          <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex flex-col gap-1.5 z-10">
            {p.isNew && (
              <span className="bg-frost text-bg-primary text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
                {t('newDrop')}
              </span>
            )}
            {p.isLimited && (
              <span className="border border-frost/40 text-frost text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 backdrop-blur-sm">
                {t('limited')}
              </span>
            )}
          </div>

          {/* Elegant name reveal at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-6 z-10 overflow-hidden">
            <motion.div
              animate={{ y: hovered ? 0 : 24, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[9px] tracking-[0.3em] uppercase text-electric mb-1">— {p.sku}</p>
              <h3 className="font-display text-2xl tracking-cinematic uppercase text-frost leading-tight">
                {name}
              </h3>
              <div className="mt-2 h-px bg-gradient-to-r from-frost/60 via-frost/20 to-transparent w-1/2" />
            </motion.div>
          </div>
        </div>

        {/* Below image: typographic block */}
        <div className="mt-5 flex items-baseline justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm tracking-[0.18em] uppercase text-frost truncate group-hover:text-frost/90 transition-colors">
              {name}
            </h3>
            <p className="text-[11px] text-muted truncate mt-1.5 font-light italic tracking-wide">
              {tagline}
            </p>
          </div>
          <div className="shrink-0 text-right rtl:text-left">
            <Price
              iqd={p.priceIQD}
              usd={p.priceUSD}
              compareIQD={p.compareIQD}
              compareUSD={p.compareUSD}
              className="font-display text-sm tracking-[0.15em]"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
