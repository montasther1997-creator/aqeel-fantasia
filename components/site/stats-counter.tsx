'use client';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 2.4, ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export function StatsCounter() {
  const locale = useLocale() as 'ar' | 'en';
  const stats = [
    { num: 10, suffix: 'K+', label: locale === 'ar' ? 'متابع' : 'FOLLOWERS' },
    { num: 25, suffix: '+', label: locale === 'ar' ? 'قطعة' : 'PIECES' },
    { num: 18, suffix: '', label: locale === 'ar' ? 'محافظة' : 'GOVERNORATES' },
    { num: 4, suffix: '', label: locale === 'ar' ? 'طبقات الطائفة' : 'CULT TIERS' },
  ];
  return (
    <section className="container-x py-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-bg-primary p-8 lg:p-12 group hover:bg-bg-secondary transition-colors"
          >
            <p className="font-display tracking-cinematic text-6xl lg:text-7xl text-gradient-chrome">
              <Counter to={s.num} suffix={s.suffix} />
            </p>
            <p className="text-[10px] tracking-cinematic text-muted mt-3 group-hover:text-electric transition-colors">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
