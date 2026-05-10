'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowDown, ArrowRight, Star, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('@/components/3d/hero-scene').then((m) => m.HeroScene), { ssr: false });

export function GateHero() {
  const t = useTranslations('gate');
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 280]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const blurValue = useTransform(scrollY, [0, 600], [0, 8]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);
  const [videoOk, setVideoOk] = useState(false);

  const word1 = t('title').split(' ');
  const word2 = t('title2').split(' ');

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-[3]">
        <div className="light-streak top-[20%] w-[40%]" style={{ animationDelay: '0s' }} />
        <div className="light-streak top-[55%] w-[30%]" style={{ animationDelay: '2s' }} />
        <div className="light-streak top-[80%] w-[50%]" style={{ animationDelay: '4s' }} />
      </div>

      <motion.div style={{ y, scale, filter }} className="absolute inset-0">
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
                backgroundImage: "url('https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=2400&q=80')",
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(0.5) contrast(1.2) brightness(0.45)',
              }}
            />
            <div
              className="absolute inset-0 mix-blend-overlay opacity-60"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=2400&q=80')",
                backgroundSize: 'cover', backgroundPosition: 'center',
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/30 via-transparent to-bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.6) 80%)' }} />

        <div className="absolute inset-0 opacity-60 mix-blend-screen pointer-events-none">
          <HeroScene />
        </div>

        <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.25), transparent 70%)' }} />
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 -right-1/4 w-[60%] h-[60%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.25), transparent 70%)' }} />
      </motion.div>

      <div className="absolute top-20 inset-x-0 z-10 px-6 lg:px-12 flex items-center justify-between text-[10px] tracking-cinematic font-mono text-muted">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-electric rounded-full animate-pulse" />
          [ LIVE · 2026 ]
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          BAGHDAD · 33.3°N 44.4°E
        </motion.div>
      </div>

      <motion.div style={{ opacity }} className="relative z-10 h-full container-x flex flex-col justify-end pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-8 text-xs tracking-cinematic text-muted">
            <Star className="w-3 h-3 text-electric" fill="currentColor" />
            <span className="w-12 h-px bg-gradient-to-r from-electric to-transparent" />
            <span className="text-electric">{t('kicker')}</span>
          </div>

          <h1 className="h-display text-[14vw] sm:text-[10vw] lg:text-[9vw] text-balance">
            <span className="block overflow-hidden">
              {word1.map((w, i) => (
                <motion.span key={i}
                  initial={{ y: '110%' }} animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block text-frost mr-[0.3em]"
                >{w}</motion.span>
              ))}
            </span>
            <span className="block overflow-hidden">
              {word2.map((w, i) => (
                <motion.span key={i}
                  initial={{ y: '110%' }} animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block text-gradient-chrome mr-[0.3em]"
                >{w}</motion.span>
              ))}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}
            className="mt-12 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Link href={'/drops' as any} className="btn-primary group">
                <Zap className="w-4 h-4" />
                {t('enter')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link href={'/identity' as any} className="text-xs tracking-cinematic uppercase text-muted hover:text-frost border-b border-line pb-1">
                The Identity →
              </Link>
            </div>
            <div className="flex items-center gap-3 text-xs tracking-cinematic text-muted">
              <ArrowDown className="w-3 h-3 animate-bounce" />
              <span className="font-mono">{t('scroll')}</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="absolute bottom-6 inset-x-0 z-10 px-6 lg:px-12 flex items-center justify-between text-[10px] font-mono text-muted/60">
        <span>EST. 2026 / IRAQ</span>
        <span className="hidden sm:inline">FRAGMENT_001 · DARK CINEMATIC LUXURY</span>
        <span>©</span>
      </motion.div>
    </section>
  );
}
