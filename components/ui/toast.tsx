'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';

type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string };
let externalAdd: ((t: Omit<Toast, 'id'>) => void) | null = null;

export function toast(type: Toast['type'], message: string) {
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] space-y-2 pointer-events-none" dir="ltr">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`pointer-events-auto glass-strong px-5 py-3 flex items-center gap-3 min-w-[280px] ${
              t.type === 'success' ? 'border-l-2 border-l-electric' :
              t.type === 'error' ? 'border-l-2 border-l-blood' : 'border-l-2 border-l-chrome'
            }`}
          >
            {t.type === 'success' ? <Check className="w-4 h-4 text-electric" /> :
             t.type === 'error' ? <X className="w-4 h-4 text-blood" /> :
             <AlertCircle className="w-4 h-4 text-chrome" />}
            <span className="text-sm text-frost">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
