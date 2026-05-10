'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;
    setHidden(false);
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t?.closest('a, button, input, textarea, select, [data-cursor="hover"]');
      setHovering(!!interactive);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, [x, y]);

  if (hidden) return null;
  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
        style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          animate={{ scale: hovering ? 2.4 : 1, opacity: hovering ? 0.5 : 1 }}
          transition={{ duration: 0.25 }}
          className="w-3 h-3 rounded-full bg-frost"
        />
      </motion.div>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99]"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          animate={{ scale: hovering ? 1.8 : 1 }}
          transition={{ duration: 0.4 }}
          className="w-10 h-10 rounded-full border border-frost/30"
        />
      </motion.div>
    </>
  );
}
