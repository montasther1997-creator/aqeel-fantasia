'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';

const QUOTE_AR = 'الأناقة قوة، والتفاصيل اختيار.';
const QUOTE_EN = 'Elegance is power. Detail is a choice.';
const BRAND_TOP = 'AQEEL';
const BRAND_BOT = 'FANTASIA';

/**
 * Intro overlay. Total duration is admin-configurable (default 4 seconds).
 * Internal animation timings are scaled proportionally to the requested duration
 * (baseline = 4s). Pass `enabled={false}` to skip rendering entirely.
 */
export function AtelierEntry({
  enabled = true,
  durationSeconds = 4,
}: {
  enabled?: boolean;
  durationSeconds?: number;
}) {
  const [show, setShow] = useState(enabled);
  const [phase, setPhase] = useState(0); // 0=letters, 1=line+quote, 2=fading out
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const quote = isAr ? QUOTE_AR : QUOTE_EN;
  const words = quote.split(' ');

  // Scale all timings to fit `durationSeconds` (baseline 4 seconds).
  const dur = Math.max(2, Math.min(10, durationSeconds));
  const scale = dur / 4;
  const ms = (n: number) => Math.round(n * scale);

  useEffect(() => {
    if (!enabled) return;
    const t1 = setTimeout(() => setPhase(1), ms(1600));
    const t2 = setTimeout(() => setPhase(2), ms(3400));
    const t3 = setTimeout(() => setShow(false), ms(4000));
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const skip = () => { setPhase(2); setTimeout(() => setShow(false), 400); };

  if (!enabled) return null;

  // Per-letter stagger durations also scale
  const letterDuration = 0.6 * scale;
  const letterDelayBase = 0.12 * scale;
  const lineDelay = 0.9 * scale;
  const lineDuration = 0.8 * scale;
  const quoteDuration = 0.7 * scale;
  const quoteWordDelay = 0.06 * scale;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[300] bg-onyx flex items-center justify-center overflow-hidden"
          style={{ pointerEvents: phase === 2 ? 'none' : 'auto' }}
        >
          {/* Subtle background paper texture */}
          <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }} />

          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.8) 100%)' }} />

          <div className="relative z-10 text-center px-6 max-w-3xl" dir="ltr">
            <div className="overflow-hidden mb-2">
              <motion.div dir="ltr" className="serif text-pearl tracking-[0.18em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl flex justify-center" style={{ fontWeight: 300, direction: 'ltr' }}>
                {BRAND_TOP.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: letterDuration, delay: 0.1 * scale + i * letterDelayBase * 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase >= 1 ? 1 : 0 }}
              transition={{ duration: lineDuration, delay: lineDelay, ease: [0.65, 0, 0.35, 1] }}
              className="h-px w-full mx-auto my-6 origin-center"
              style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A961 50%, transparent 100%)' }}
            />

            <div className="overflow-hidden">
              <motion.div dir="ltr" className="serif text-pearl tracking-[0.18em] text-4xl sm:text-6xl md:text-7xl lg:text-8xl flex justify-center" style={{ fontWeight: 400, direction: 'ltr' }}>
                {BRAND_BOT.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: letterDuration * 1.1, delay: 0.6 * scale + i * letterDelayBase * 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                    style={{ color: i === 3 ? '#C9A961' : undefined, fontStyle: i === 3 ? 'italic' : 'normal' }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 10 }}
              transition={{ duration: quoteDuration, delay: 0.25 * scale, ease: [0.16, 1, 0.3, 1] }}
              className="serif italic text-bone text-base md:text-xl lg:text-2xl mt-12 font-light leading-relaxed"
              style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}
                  transition={{ duration: quoteDuration * 0.7, delay: 0.4 * scale + i * quoteWordDelay }}
                  className="inline-block mr-2 rtl:ml-2 rtl:mr-0"
                >
                  {w}
                </motion.span>
              ))}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 0.6 : 0 }}
              transition={{ duration: 0.7 * scale, delay: 1.2 * scale }}
              className="mt-10 text-[10px] tracking-[0.4em] text-pearl/40 font-mono"
            >
              ATELIER DIGITAL · MMXXVI
            </motion.div>
          </div>

          <button
            onClick={skip}
            className="absolute bottom-6 right-6 rtl:left-6 rtl:right-auto text-[10px] tracking-[0.3em] text-pearl/40 hover:text-pearl/80 transition-colors px-3 py-2 z-20"
            style={isAr ? { letterSpacing: 0 } : {}}
          >
            {isAr ? 'تخطّي ✕' : 'SKIP ✕'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
