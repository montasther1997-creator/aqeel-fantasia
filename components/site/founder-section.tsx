'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

export function FounderSection() {
  const locale = useLocale() as 'ar' | 'en';
  return (
    <section className="container-x py-32 relative overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="lg:col-span-5 relative"
        >
          <div className="aspect-[3/4] luxury-card overflow-hidden relative group">
            <img
              src="/founder.jpg"
              alt="Aqeel Fantasia"
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.src = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 rtl:right-6 rtl:left-auto">
              <p className="text-[10px] tracking-cinematic text-electric font-mono">— FOUNDER</p>
              <p className="font-display tracking-cinematic text-2xl mt-1 text-frost">
                {locale === 'ar' ? 'عقيل' : 'AQEEL'}
              </p>
            </div>
            <div className="absolute top-6 right-6 rtl:left-6 rtl:right-auto">
              <span className="stamp">EST. 2026</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15 }}
          className="lg:col-span-7"
        >
          <p className="text-[10px] tracking-cinematic text-electric font-mono mb-4">— THE VISIONARY</p>
          <h2 className="h-display text-5xl sm:text-7xl mb-2">
            {locale === 'ar' ? 'عقيل فنتازيا' : 'AQEEL FANTASIA'}
          </h2>
          <h3 className="h-display text-2xl sm:text-3xl text-gradient-chrome mb-8">
            {locale === 'ar' ? 'المؤسس · المصمم · الرؤية' : 'FOUNDER · DESIGNER · VISION'}
          </h3>
          <div className="space-y-5 text-base lg:text-lg leading-relaxed text-frost/85">
            <p>
              {locale === 'ar'
                ? 'منذ التأسيس، عقيل فنتازيا تصنع الأناقة العصرية للرجل الذي يفهم أن التفاصيل لا تترك للصدفة.'
                : 'Since our founding, AQEEL FANTASIA crafts contemporary elegance for the man who understands details are never left to chance.'}
            </p>
            <p className="text-muted">
              {locale === 'ar'
                ? 'كل قطعة هي حوار بين الأصالة العربية والتصميم العصري — صناعة فاخرة، أقمشة مختارة، وروح لا تساوم.'
                : 'Every piece is a dialogue between Arab heritage and modern design — premium craftsmanship, curated fabrics, and an uncompromising spirit.'}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-line">
            {[
              [locale === 'ar' ? 'فروع' : 'BRANCHES', '02'],
              [locale === 'ar' ? 'سنوات' : 'YEARS', '+'],
              [locale === 'ar' ? 'متابع' : 'FOLLOWERS', '10K+'],
            ].map(([label, num]) => (
              <div key={String(label)}>
                <p className="font-mono text-electric text-xs">{num}</p>
                <p className="font-display tracking-cinematic text-xs mt-1 text-muted">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
