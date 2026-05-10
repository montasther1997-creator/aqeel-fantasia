'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

export function EditorialBand() {
  const locale = useLocale() as 'ar' | 'en';
  return (
    <section className="relative py-32 overflow-hidden border-y border-line">
      <div className="editorial-num absolute -top-10 left-0 right-0 text-center">
        2026
      </div>
      <div className="container-x relative z-10 grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5"
        >
          <p className="text-[10px] tracking-cinematic text-electric font-mono mb-4">— FRAGMENT 002</p>
          <h2 className="h-display text-5xl lg:text-7xl text-frost">
            {locale === 'ar' ? (
              <>منسوج <span className="text-gradient-chrome">في الظل</span></>
            ) : (
              <>WOVEN <span className="text-gradient-chrome">IN SHADOW</span></>
            )}
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="lg:col-span-6 lg:col-start-7"
        >
          <p className="text-lg lg:text-xl leading-relaxed text-frost/80">
            {locale === 'ar'
              ? 'كل قطعة تحمل بصمة الليالي التي صنعتها. خياطة دقيقة، أقمشة مختارة، تفاصيل لا تراها العين العادية. هذا ليس قماشاً — هذه شخصية.'
              : "Every piece carries the imprint of the nights that made it. Precise stitching, chosen fabrics, details unseen by the ordinary eye. This isn't fabric — this is identity."}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-line">
            {[
              [locale === 'ar' ? 'صناعة' : 'CRAFT', '01.'],
              [locale === 'ar' ? 'هوية' : 'IDENTITY', '02.'],
              [locale === 'ar' ? 'سلطة' : 'POWER', '03.'],
            ].map(([label, num]) => (
              <div key={num as string}>
                <p className="font-mono text-electric text-xs">{num}</p>
                <p className="font-display tracking-cinematic text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
