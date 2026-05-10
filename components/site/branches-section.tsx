'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { MapPin, Instagram } from 'lucide-react';

export function BranchesSection() {
  const locale = useLocale() as 'ar' | 'en';
  const branches = [
    {
      number: '01',
      titleAr: 'الفرع الأول', titleEn: 'BRANCH 01',
      cityAr: 'بابل', cityEn: 'BABYLON',
      addressAr: 'شارع 40', addressEn: 'Street 40',
    },
    {
      number: '02',
      titleAr: 'الفرع الثاني', titleEn: 'BRANCH 02',
      cityAr: 'بغداد', cityEn: 'BAGHDAD',
      addressAr: 'حي القادسية', addressEn: 'Al-Qadisiya District',
    },
  ];

  return (
    <section className="container-x py-32 relative">
      <div className="absolute -top-10 left-0 right-0 editorial-num text-center pointer-events-none select-none">
        BRANCHES
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 relative z-10"
      >
        <p className="text-xs tracking-cinematic text-electric mb-3 font-mono">— PHYSICAL PRESENCE</p>
        <h2 className="h-display text-5xl sm:text-7xl text-frost">
          {locale === 'ar' ? 'الفروع' : 'OUR BRANCHES'}
        </h2>
        <p className="mt-4 text-muted text-sm tracking-cinematic">
          {locale === 'ar' ? 'تجربة فاخرة بانتظارك' : 'A premium experience awaits'}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {branches.map((b, i) => (
          <motion.div
            key={b.number}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            className="luxury-card p-10 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto editorial-num text-frost/[0.03] leading-none pointer-events-none">
              {b.number}
            </div>
            <div className="relative z-10">
              <p className="text-[10px] tracking-cinematic text-electric font-mono mb-3">— {b.number}</p>
              <h3 className="h-display text-3xl sm:text-4xl mb-2">
                {locale === 'ar' ? b.titleAr : b.titleEn}
              </h3>
              <h4 className="h-display text-5xl sm:text-6xl text-gradient-chrome mb-6">
                {locale === 'ar' ? b.cityAr : b.cityEn}
              </h4>
              <div className="flex items-center gap-2 text-muted">
                <MapPin className="w-4 h-4" />
                <span className="text-sm tracking-cinematic">
                  {locale === 'ar' ? b.addressAr : b.addressEn}
                </span>
              </div>
              <div className="mt-6 h-px bg-gradient-to-r from-electric/40 via-transparent to-transparent" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-center"
      >
        <a
          href="https://instagram.com/shopfantasia1"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex"
        >
          <Instagram className="w-4 h-4" />
          @shopfantasia1
        </a>
      </motion.div>
    </section>
  );
}
