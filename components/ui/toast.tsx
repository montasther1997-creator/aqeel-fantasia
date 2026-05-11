'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: string; type: ToastType; message: string };
let externalAdd: ((t: Omit<Toast, 'id'>) => void) | null = null;

export function toast(type: ToastType, message: string) {
  externalAdd?.({ type, message });
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    externalAdd = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((s) => [...s, { ...t, id }]);
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3500);
    };
    return () => { externalAdd = null; };
  }, []);

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] space-y-2 pointer-events-none flex flex-col items-center" dir="ltr">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto bg-bg-elevated/95 backdrop-blur-xl border px-5 py-3.5 flex items-center gap-3 min-w-[280px] max-w-md shadow-2xl ${
              t.type === 'success'
                ? 'border-accent'
                : t.type === 'error'
                ? 'border-burgundy'
                : 'border-border'
            }`}
            style={{
              borderLeftWidth: '3px',
              borderRightWidth: '0',
            }}
          >
            <span className={`text-lg ${
              t.type === 'success' ? 'text-accent' :
              t.type === 'error' ? 'text-burgundy' : 'text-fg-secondary'
            }`}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ⓘ'}
            </span>
            <span className="text-sm text-fg font-light">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
