'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';

const QUOTE_AR = 'الأناقة قوة، والتفاصيل اختيار.';
const QUOTE_EN = 'Elegance is power. Detail is a choice.';
const BRAND_TOP = 'AQEEL';
const BRAND_BOT = 'FANTASIA';

export function AtelierEntry() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState(0); // 0=letters, 1=line+quote, 2=fading out
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const quote = isAr ? QUOTE_AR : QUOTE_EN;
  const words = quote.split(' ');

  useEffect(() => {
    // No skip on refresh — always shows per user spec
    const t1 = setTimeout(() => setPhase(1), 2800);
    const t2 = setTimeout(() => setPhase(2), 6200);
    const t3 = setTimeout(() => setShow(false), 7200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const skip = () => { setPhase(2); setTimeout(() => setShow(false), 600); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[300] bg-onyx flex items-center justify-center overflow-hidden"
          style={{ pointerEvents: phase === 2 ? 'none' : 'auto' }}
        >
          {/* Subtle background paper texture */}
          <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }} />

          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.8) 100%)' }} />

          <div className="relative z-10 text-center px-6 max-w-3xl">
            {/* Brand top: AQEEL */}
            <div className="overflow-hidden mb-2">
              <motion.div className="serif text-pearl tracking-[0.18em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl flex justify-center" style={{ fontWeight: 300 }}>
                {BRAND_TOP.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Gold line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 1.2, delay: 1.6, ease: [0.65, 0, 0.35, 1] }}
              className="h-px w-full mx-auto my-6 origin-center"
              style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A961 50%, transparent 100%)' }}
            />

            {/* Brand bottom: FANTASIA */}
            <div className="overflow-hidden">
              <motion.div className="serif text-pearl tracking-[0.18em] text-4xl sm:text-6xl md:text-7xl lg:text-8xl flex justify-center" style={{ fontWeight: 400 }}>
                {BRAND_BOT.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '110%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 1.0 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                    style={{ color: i === 3 ? '#C9A961' : undefined, fontStyle: i === 3 ? 'italic' : 'normal' }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Quote — appears in phase 1 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 10 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="serif italic text-bone text-base md:text-xl lg:text-2xl mt-12 font-light leading-relaxed"
              style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.08 }}
                  className="inline-block mr-2 rtl:ml-2 rtl:mr-0"
                >
                  {w}
                </motion.span>
              ))}
            </motion.p>

            {/* Atelier signature */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 0.6 : 0 }}
              transition={{ duration: 1, delay: 1.8 }}
              className="mt-10 text-[10px] tracking-[0.4em] text-pearl/40 font-mono"
            >
              ATELIER DIGITAL · MMXXVI
            </motion.div>
          </div>

          {/* Skip button */}
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
