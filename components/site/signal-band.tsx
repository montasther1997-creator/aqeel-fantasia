'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Radio } from 'lucide-react';

export function SignalBand() {
  const t = useTranslations('signal');
  const [val, setVal] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val) return;
    setLoading(true);
    try {
      await fetch('/api/signal', { method: 'POST', body: JSON.stringify({ contact: val }) });
      setDone(true);
    } finally { setLoading(false); }
  };

  return (
    <section className="container-x py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-strong p-10 lg:p-20 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-electric to-transparent animate-pulse" />
        <div className="flex items-center gap-2 text-electric text-xs tracking-cinematic mb-6">
          <Radio className="w-3 h-3 animate-pulse" /> {t('subtitle')}
        </div>
        <h2 className="h-display text-4xl sm:text-6xl mb-8">{t('title')}</h2>
        {!done ? (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              required value={val} onChange={(e) => setVal(e.target.value)}
              className="input flex-1 font-mono" placeholder={t('placeholder')}
            />
            <button disabled={loading} className="btn-primary">
              {loading ? '...' : t('subscribe')}
            </button>
          </form>
        ) : (
          <p className="text-electric font-mono">[ {t('thanks')} ]</p>
        )}
      </motion.div>
    </section>
  );
}
