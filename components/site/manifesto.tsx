'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Manifesto() {
  const t = useTranslations('identity');
  return (
    <section className="relative py-40 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-electric blur-[200px] rounded-full" />
      </div>
      <div className="container-x relative">
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-xs tracking-cinematic text-muted mb-8"
        >— {t('title')}</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-display text-5xl sm:text-7xl lg:text-8xl text-balance max-w-5xl text-gradient-chrome"
        >
          {t('quote')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-10 text-lg text-muted max-w-2xl leading-relaxed"
        >
          {t('philosophy')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12"
        >
          <Link href={'/identity' as any} className="btn-ghost">
            {t('title')} →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
