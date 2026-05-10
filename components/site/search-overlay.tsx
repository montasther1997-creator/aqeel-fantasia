'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const locale = useLocale() as 'ar' | 'en';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!q || q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d.products || []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-muted hover:text-frost"><Search className="w-4 h-4" /></button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-bg-primary/95 backdrop-blur-2xl"
            onClick={() => setOpen(false)}
          >
            <div className="container-x pt-24" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <Search className="w-5 h-5 text-muted" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={locale === 'ar' ? 'ابحث في القطرات...' : 'Search drops...'}
                  className="bg-transparent flex-1 text-2xl outline-none font-display tracking-cinematic"
                />
                <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
                {results.map((p) => (
                  <Link key={p.id} href={`/drops/${p.slug}` as any} onClick={() => setOpen(false)} className="group">
                    <div className="aspect-[3/4] bg-bg-secondary overflow-hidden">
                      {p.images[0] && <img src={p.images[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                    </div>
                    <h3 className="mt-2 text-sm tracking-cinematic uppercase">{locale === 'ar' ? p.nameAr : p.nameEn}</h3>
                    <p className="text-xs text-muted">{p.priceIQD.toLocaleString()} IQD</p>
                  </Link>
                ))}
                {q.length >= 2 && results.length === 0 && <p className="text-muted col-span-4 text-center py-10">Nothing found.</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
