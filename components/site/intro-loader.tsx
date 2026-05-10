'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntroLoader() {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = sessionStorage.getItem('fantasia-intro');
    if (seen) { setShow(false); return; }
    let n = 0;
    const i = setInterval(() => {
      n += Math.floor(Math.random() * 12) + 3;
      if (n >= 100) { n = 100; clearInterval(i); setTimeout(() => { setShow(false); sessionStorage.setItem('fantasia-intro', '1'); }, 600); }
      setCount(n);
    }, 90);
    return () => clearInterval(i);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: [0.85, 0, 0.15, 1] }}
          className="fixed inset-0 z-[200] bg-bg-primary grain"
        >
          <div className="absolute inset-0 bg-cinematic" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
              <p className="text-[10px] tracking-wider2 text-electric font-mono mb-4">[ ENTERING THE WORLD ]</p>
              <h1 className="font-display tracking-cinematic text-7xl sm:text-9xl text-frost text-balance">
                AQEEL
              </h1>
              <h1 className="font-display tracking-cinematic text-7xl sm:text-9xl text-gradient-chrome -mt-4">
                FANTASIA
              </h1>
            </motion.div>
            <div className="absolute bottom-10 inset-x-0 px-10 flex items-end justify-between text-xs font-mono text-muted">
              <span>{String(count).padStart(3, '0')}%</span>
              <div className="flex-1 mx-6 h-px bg-line relative overflow-hidden">
                <motion.div className="absolute inset-y-0 left-0 bg-frost" style={{ width: `${count}%` }} />
              </div>
              <span className="text-electric">FANTASIA_OS</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
