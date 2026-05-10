'use client';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export function CultTeaser({ tiers }: { tiers: any[] }) {
  const t = useTranslations('cult');
  const locale = useLocale() as 'ar' | 'en';
  return (
    <section className="container-x py-32">
      <div className="grid lg:grid-cols-12 gap-10">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8 }} className="lg:col-span-5">
          <p className="text-xs tracking-cinematic text-muted mb-3">— MEMBERSHIP</p>
          <h2 className="h-display text-5xl sm:text-7xl">{t('title')}</h2>
          <p className="mt-8 text-muted text-lg leading-relaxed">{t('subtitle')}</p>
          <Link href={'/cult' as any} className="btn-primary mt-10">{t('join')} →</Link>
        </motion.div>
        <div className="lg:col-span-7 grid grid-cols-2 gap-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass p-6 hover:border-frost/30 transition-all group"
            >
              <div className="w-3 h-3 rounded-full mb-4" style={{ background: tier.color, boxShadow: `0 0 20px ${tier.color}` }} />
              <h3 className="font-display text-2xl tracking-cinematic">
                {locale === 'ar' ? tier.nameAr : tier.nameEn}
              </h3>
              <p className="text-xs text-muted mt-2">{locale === 'ar' ? tier.descAr : tier.descEn}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
