'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowDown, ArrowRight } from 'lucide-react';

export function GateHero() {
  const t = useTranslations('gate');
  const locale = useLocale() as 'ar' | 'en';
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 280]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const [videoOk, setVideoOk] = useState(false);

  const word1 = t('title').split(' ');
  const word2 = t('title2').split(' ');

  return (
    <section ref={ref} className="relative h-screen min-h-[760px] overflow-hidden">
      {/* Background */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <video
          className="w-full h-full object-cover opacity-50"
          autoPlay muted loop playsInline
          onCanPlay={() => setVideoOk(true)}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {!videoOk && (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=2400&q=85')",
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(0.4) contrast(1.15) brightness(0.4)',
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-transparent to-bg-primary" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.7) 80%)' }} />

        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,166,107,0.18), transparent 70%)' }} />
      </motion.div>

      {/* Top corner ornaments */}
      <div className="absolute top-20 inset-x-0 z-10 px-6 lg:px-16 flex items-center justify-between text-[10px] tracking-[0.3em] font-mono text-muted">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, delay: 1 }}>
          MAISON · EST. 2026
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, delay: 1.2 }} className="hidden md:block">
          BABYLON × BAGHDAD
        </motion.div>
      </div>

      {/* Center stage content */}
      <motion.div style={{ opacity }} className="relative z-10 h-full container-x flex flex-col items-center justify-center text-center">
        {/* Ornament line */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.5 }}
          className="ornament mb-10"
        >
          <span>{t('kicker')}</span>
        </motion.div>

        {/* Editorial typography */}
        <h1 className="text-balance">
          <span className="block overflow-hidden mb-2">
            {word1.map((w, i) => (
              <motion.span key={i}
                initial={{ y: '110%' }} animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block font-display text-[10vw] sm:text-[8vw] lg:text-[7vw] tracking-[0.02em] text-frost mr-[0.25em] italic"
                style={{ fontWeight: 400 }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {word2.map((w, i) => (
              <motion.span key={i}
                initial={{ y: '110%' }} animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 1.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block font-display text-[12vw] sm:text-[9vw] lg:text-[8vw] tracking-[0.05em] text-gradient-gold mr-[0.25em] uppercase"
                style={{ fontWeight: 600 }}
              >
                {w}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Fine description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-12 max-w-md text-base lg:text-lg text-frost/70 font-light leading-relaxed"
        >
          {locale === 'ar'
            ? 'دار أزياء فاخرة للرجل. حرفية معاصرة، وروح شرقية لا تساوم.'
            : 'A luxury house for the modern man. Contemporary craftsmanship, an uncompromising spirit.'}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-12 flex flex-col sm:flex-row gap-5 items-center"
        >
          <Link href={'/drops' as any} className="btn-gold group">
            {t('enter')}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
          <Link href={'/identity' as any} className="text-[11px] tracking-[0.3em] uppercase text-frost/60 hover:text-frost transition-colors border-b border-frost/20 pb-1">
            {locale === 'ar' ? 'العلامة' : 'THE MAISON'} →
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom: scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] font-mono text-frost/40"
      >
        <span>{t('scroll').toUpperCase()}</span>
        <ArrowDown className="w-3 h-3 animate-bounce" />
      </motion.div>

      {/* Side ornaments */}
      <div className="absolute top-1/2 -translate-y-1/2 left-6 lg:left-12 z-10 hidden md:block">
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 80 }} transition={{ duration: 1.5, delay: 1.5 }}
          className="w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent"
        />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-6 lg:right-12 z-10 hidden md:block">
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 80 }} transition={{ duration: 1.5, delay: 1.5 }}
          className="w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent"
        />
      </div>
    </section>
  );
}
